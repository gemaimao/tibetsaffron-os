'use strict';

const cloud = require('wx-server-sdk');

const { fail, sanitizeError } = require('./lib/errors');
const { hashOpenId } = require('./lib/identity');
const { applyMembership } = require('./lib/membership');
const V = require('./lib/validate');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const COL_USERS = 'radio_users';
const COL_QUESTIONS = 'radio_questions';
const COL_LIMITS = 'radio_limits';

const DEFAULT_LAST_EPISODE = 'ep04';
const QUESTION_LIST_FIELDS = {
  question: true,
  answer: true,
  quote: true,
  episodeId: true,
  createdAt: true,
  saved: true
};

function now() {
  return Date.now();
}

function ok(payload) {
  return Object.assign({ ok: true }, payload);
}

function toState(user) {
  const u = user || {};
  return {
    progress: V.isPlainObject(u.progress) ? u.progress : {},
    likes: Array.isArray(u.likes) ? u.likes.filter(V.isAllowedEpisode) : [],
    favorites: Array.isArray(u.favorites) ? u.favorites.filter(V.isAllowedEpisode) : [],
    lastEpisode: V.isAllowedEpisode(u.lastEpisode) ? u.lastEpisode : DEFAULT_LAST_EPISODE
  };
}

function toQuestion(doc) {
  return {
    id: doc._id,
    _id: doc._id,
    question: typeof doc.question === 'string' ? doc.question : '',
    answer: typeof doc.answer === 'string' ? doc.answer : '',
    quote: typeof doc.quote === 'string' ? doc.quote : '',
    episodeId: V.isAllowedEpisode(doc.episodeId) ? doc.episodeId : '',
    createdAt: typeof doc.createdAt === 'number' ? doc.createdAt : 0,
    saved: doc.saved === true
  };
}

// Creates the user document once. Concurrent first writes are resolved by the
// duplicate-key error: the loser re-reads instead of overwriting.
async function ensureUser(openIdHash) {
  const existing = await db
    .collection(COL_USERS)
    .doc(openIdHash)
    .get()
    .catch(() => null);
  if (existing && existing.data) return existing.data;

  const ts = now();
  const initial = {
    _id: openIdHash,
    openIdHash,
    consent: false,
    consentAt: null,
    profile: {},
    progress: {},
    likes: [],
    favorites: [],
    lastEpisode: DEFAULT_LAST_EPISODE,
    createdAt: ts,
    updatedAt: ts
  };

  try {
    await db.collection(COL_USERS).add({ data: initial });
    return initial;
  } catch (_e) {
    const again = await db.collection(COL_USERS).doc(openIdHash).get();
    if (!again || !again.data) throw fail('INTERNAL', 'Failed to initialise user record.');
    return again.data;
  }
}

async function readUser(openIdHash) {
  const res = await db
    .collection(COL_USERS)
    .doc(openIdHash)
    .get()
    .catch(() => null);
  return res && res.data ? res.data : null;
}

async function handleLogin(openIdHash, event) {
  const user = await ensureUser(openIdHash);
  const patch = { updatedAt: now() };

  // consent is tri-state: absent = leave untouched, true/false = explicit record.
  if (typeof event.consent === 'boolean') {
    patch.consent = event.consent;
    patch.consentAt = event.consent ? now() : null;
  }

  const displayName = V.optionalDisplayName(event.profile && event.profile.displayName);
  if (displayName) patch['profile.displayName'] = displayName;

  await db.collection(COL_USERS).doc(openIdHash).update({ data: patch });

  const fresh = (await readUser(openIdHash)) || user;
  return ok({
    // The raw openid is deliberately not returned. The client only needs to
    // know that it is authenticated.
    loggedIn: true,
    profile: {
      displayName: (fresh.profile && fresh.profile.displayName) || '',
      consent: fresh.consent === true,
      createdAt: fresh.createdAt || 0
    },
    state: toState(fresh)
  });
}

async function handleGetState(openIdHash) {
  const user = await ensureUser(openIdHash);
  return ok({ state: toState(user) });
}

async function handleSaveProgress(openIdHash, event) {
  const p = V.requireProgress(event);
  const ts = now();

  // Path-scoped update: only this episode's entry is written, so two devices
  // playing different episodes never clobber each other's progress.
  const res = await db
    .collection(COL_USERS)
    .doc(openIdHash)
    .update({
      data: {
        [`progress.${p.episodeId}`]: {
          position: p.position,
          duration: p.duration,
          updatedAt: ts
        },
        lastEpisode: p.episodeId,
        updatedAt: ts
      }
    });

  if (!res || !res.stats || res.stats.updated === 0) {
    // Document disappeared mid-flight; recreate then retry once.
    await ensureUser(openIdHash);
    await db
      .collection(COL_USERS)
      .doc(openIdHash)
      .update({
        data: {
          [`progress.${p.episodeId}`]: {
            position: p.position,
            duration: p.duration,
            updatedAt: ts
          },
          lastEpisode: p.episodeId,
          updatedAt: ts
        }
      });
  }

  const user = await readUser(openIdHash);
  return ok({ state: toState(user) });
}

// likes/favorites live in arrays, so read-modify-write must be transactional.
//
// `desired` makes the write idempotent: the client sends the membership it wants
// rather than asking the server to flip a bit it cannot observe. This is what
// stops a retried or out-of-order request from cancelling a newer local intent.
// Omitting `desired` keeps the legacy blind-toggle behaviour.
async function handleToggle(openIdHash, event, field) {
  const episodeId = V.requireEpisodeId(event.episodeId);
  const desired = V.optionalBoolean(event.desired);
  await ensureUser(openIdHash);
  const ts = now();

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.collection(COL_USERS).doc(openIdHash).get();
    if (!doc || !doc.data) throw fail('NOT_FOUND', 'User record not found.');

    const current = Array.isArray(doc.data[field])
      ? doc.data[field].filter(V.isAllowedEpisode)
      : [];
    const list = applyMembership(current, episodeId, desired);

    await transaction
      .collection(COL_USERS)
      .doc(openIdHash)
      .update({ data: { [field]: list, updatedAt: ts } });
  });

  const user = await readUser(openIdHash);
  return ok({ state: toState(user) });
}

async function handleListQuestions(openIdHash, event) {
  const limit = V.pageLimit(event.limit);
  const cursor = V.requireCursor(event.cursor);

  const ownerClause = { owner: openIdHash };
  let where;
  if (cursor) {
    // Stable ordering: createdAt desc, _id desc as tie-breaker.
    where = _.and([
      ownerClause,
      _.or([
        { createdAt: _.lt(cursor.createdAt) },
        { createdAt: cursor.createdAt, _id: _.lt(cursor.id) }
      ])
    ]);
  } else {
    where = ownerClause;
  }

  const res = await db
    .collection(COL_QUESTIONS)
    .where(where)
    .field(QUESTION_LIST_FIELDS)
    .orderBy('createdAt', 'desc')
    .orderBy('_id', 'desc')
    .limit(limit + 1) // one extra row decides hasMore
    .get();

  const rows = (res && res.data) || [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];

  return ok({
    questions: page.map(toQuestion),
    hasMore,
    cursor: hasMore && last ? V.encodeCursor(last.createdAt, last._id) : null
  });
}

async function handleToggleQuote(openIdHash, event) {
  const questionId = V.requireQuestionId(event.questionId);
  const ts = now();
  let saved = false;

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.collection(COL_QUESTIONS).doc(questionId).get();
    if (!doc || !doc.data) throw fail('NOT_FOUND', 'Question not found.');
    // Ownership is enforced server-side; a non-owner cannot even learn the id.
    if (doc.data.owner !== openIdHash) throw fail('FORBIDDEN', 'Not allowed.');

    saved = doc.data.saved !== true;
    await transaction
      .collection(COL_QUESTIONS)
      .doc(questionId)
      .update({ data: { saved, updatedAt: ts } });
  });

  return ok({ saved });
}

// Deletes every question owned by the caller, looping so large histories are
// fully removed without a single oversized request.
async function purgeQuestions(openIdHash) {
  let removed = 0;
  for (let i = 0; i < 50; i += 1) {
    const res = await db.collection(COL_QUESTIONS).where({ owner: openIdHash }).remove();
    const n = (res && res.stats && res.stats.removed) || 0;
    removed += n;
    if (n === 0) break;
  }
  return removed;
}

// NOTE: despite the historical name, this purges the caller's QUESTION history
// (radio_questions), not their listening progress. The client calls it from the
// Q&A surfaces. Listening progress is cleared by clearProgress below.
async function handleDeleteHistory(openIdHash) {
  const removed = await purgeQuestions(openIdHash);
  return ok({ deleted: true, questionsRemoved: removed });
}

// Clears listening progress only. With episodeId: removes that one entry.
// Without: resets the whole progress map. likes/favorites are untouched.
async function handleClearProgress(openIdHash, event) {
  const raw = event && event.episodeId;
  const episodeId = raw === undefined || raw === null || raw === '' ? null : V.requireEpisodeId(raw);

  await ensureUser(openIdHash);
  const ts = now();

  const patch = episodeId
    ? { [`progress.${episodeId}`]: _.remove(), updatedAt: ts }
    : { progress: {}, updatedAt: ts };

  await db.collection(COL_USERS).doc(openIdHash).update({ data: patch });

  const user = await readUser(openIdHash);
  return ok({ cleared: true, episodeId, state: toState(user) });
}

async function handleDeleteAccount(openIdHash) {
  const questionsRemoved = await purgeQuestions(openIdHash);

  await db
    .collection(COL_LIMITS)
    .where({ openIdHash })
    .remove()
    .catch(() => null);

  const res = await db
    .collection(COL_USERS)
    .doc(openIdHash)
    .remove()
    .catch(() => null);

  return ok({
    deleted: true,
    questionsRemoved,
    userRemoved: !!res && !!res.stats && res.stats.removed > 0
  });
}

const ACTIONS = {
  login: (hash, event) => handleLogin(hash, event),
  getState: (hash) => handleGetState(hash),
  saveProgress: (hash, event) => handleSaveProgress(hash, event),
  toggleLike: (hash, event) => handleToggle(hash, event, 'likes'),
  toggleFavorite: (hash, event) => handleToggle(hash, event, 'favorites'),
  listQuestions: (hash, event) => handleListQuestions(hash, event),
  toggleQuote: (hash, event) => handleToggleQuote(hash, event),
  deleteHistory: (hash) => handleDeleteHistory(hash),
  clearProgress: (hash, event) => handleClearProgress(hash, event),
  deleteAccount: (hash) => handleDeleteAccount(hash)
};

exports.main = async (event) => {
  const evt = V.isPlainObject(event) ? event : {};
  const action = typeof evt.action === 'string' ? evt.action : '';

  try {
    const handler = Object.prototype.hasOwnProperty.call(ACTIONS, action) ? ACTIONS[action] : null;
    if (!handler) throw fail('BAD_ACTION', 'Unsupported action.', { action });

    // Identity is taken exclusively from the platform context.
    const { OPENID } = cloud.getWXContext();
    const openIdHash = hashOpenId(OPENID, process.env.RADIO_ID_SALT);

    return await handler(openIdHash, evt);
  } catch (e) {
    const clean = sanitizeError(e);
    console.error('[radioApi] action=%s code=%s', action || '(none)', clean.code);
    return Object.assign({ ok: false }, clean);
  }
};

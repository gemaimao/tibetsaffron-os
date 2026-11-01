'use strict';

const cloud = require('wx-server-sdk');

const { fail, sanitizeError } = require('./lib/errors');
const { hashOpenId } = require('./lib/identity');
const V = require('./lib/validate');
const R = require('./lib/rate');
const SEC = require('./lib/security');
const AI = require('./lib/ai');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const COL_USERS = 'radio_users';
const COL_QUESTIONS = 'radio_questions';
const COL_LIMITS = 'radio_limits';

const RATE_CFG = R.loadRateConfig(process.env);

// The WeChat content security API is bound here and injected into the pure
// module. It is the only outbound call besides the model endpoint.
const secCheckClient = (params) => cloud.openapi.security.msgSecCheck(params);

function ok(payload) {
  return Object.assign({ ok: true }, payload);
}

async function readUser(openIdHash) {
  const res = await db
    .collection(COL_USERS)
    .doc(openIdHash)
    .get()
    .catch(() => null);
  return res && res.data ? res.data : null;
}

// ---------------------------------------------------------------------------
// Rate limiting: daily quota + per-minute burst, reserved inside a transaction
// so two concurrent requests can never both slip past the limit.
// ---------------------------------------------------------------------------

function quotaIds(openIdHash, nowMs) {
  const day = R.dayKey(nowMs, RATE_CFG.tzOffsetMinutes);
  const bucket = R.minuteBucket(nowMs);
  return {
    day,
    bucket,
    dailyId: R.limitsDocId(openIdHash, day),
    minuteId: R.minuteDocId(openIdHash, bucket)
  };
}

async function getCount(id) {
  const res = await db
    .collection(COL_LIMITS)
    .doc(id)
    .get()
    .catch(() => null);
  return R.countersFromDoc(res && res.data, 'count');
}

async function reserveViaTransaction(openIdHash, nowMs) {
  const ids = quotaIds(openIdHash, nowMs);

  return db.runTransaction(async (transaction) => {
    let dailyCount = 0;
    let minuteCount = 0;
    try {
      const d = await transaction.collection(COL_LIMITS).doc(ids.dailyId).get();
      dailyCount = R.countersFromDoc(d && d.data, 'count');
    } catch (_e) {
      dailyCount = 0;
    }
    try {
      const m = await transaction.collection(COL_LIMITS).doc(ids.minuteId).get();
      minuteCount = R.countersFromDoc(m && m.data, 'count');
    } catch (_e) {
      minuteCount = 0;
    }

    const decision = R.evaluateCounters({
      dailyCount,
      minuteCount,
      dailyLimit: RATE_CFG.dailyLimit,
      minuteLimit: RATE_CFG.minuteLimit
    });
    if (!decision.allowed) return { allowed: false, reason: decision.reason };

    const dailyPatch = { count: decision.dailyCount, updatedAt: nowMs };
    const minutePatch = { count: decision.minuteCount, updatedAt: nowMs };

    if (dailyCount > 0) {
      await transaction.collection(COL_LIMITS).doc(ids.dailyId).update({ data: dailyPatch });
    } else {
      await transaction.collection(COL_LIMITS).add({
        data: Object.assign(
          { _id: ids.dailyId, openIdHash, kind: 'day', day: ids.day, createdAt: nowMs },
          dailyPatch
        )
      });
    }

    if (minuteCount > 0) {
      await transaction.collection(COL_LIMITS).doc(ids.minuteId).update({ data: minutePatch });
    } else {
      await transaction.collection(COL_LIMITS).add({
        data: Object.assign(
          { _id: ids.minuteId, openIdHash, kind: 'minute', bucket: ids.bucket, createdAt: nowMs },
          minutePatch
        )
      });
    }

    return {
      allowed: true,
      reason: 'OK',
      dailyId: ids.dailyId,
      minuteId: ids.minuteId,
      dailyCount: decision.dailyCount,
      minuteCount: decision.minuteCount
    };
  });
}

// Guarded increment: the update only matches while the counter is below limit,
// so it stays correct even without transaction support.
async function guardedIncrement(id, meta, limit, nowMs) {
  const res = await db
    .collection(COL_LIMITS)
    .where({ _id: id, count: _.lt(limit) })
    .update({ data: { count: _.inc(1), updatedAt: nowMs } });

  if (res && res.stats && res.stats.updated > 0) return true;

  const existing = await db
    .collection(COL_LIMITS)
    .doc(id)
    .get()
    .catch(() => null);
  if (existing && existing.data) return false; // exists and already at limit

  try {
    await db
      .collection(COL_LIMITS)
      .add({
        data: Object.assign({ _id: id, count: 1, createdAt: nowMs, updatedAt: nowMs }, meta)
      });
    return true;
  } catch (_e) {
    // Lost the create race; fall through to one more guarded attempt.
    const retry = await db
      .collection(COL_LIMITS)
      .where({ _id: id, count: _.lt(limit) })
      .update({ data: { count: _.inc(1), updatedAt: nowMs } });
    return !!(retry && retry.stats && retry.stats.updated > 0);
  }
}

async function reserveViaGuard(openIdHash, nowMs) {
  const ids = quotaIds(openIdHash, nowMs);

  const minuteOk = await guardedIncrement(
    ids.minuteId,
    { openIdHash, kind: 'minute', bucket: ids.bucket },
    RATE_CFG.minuteLimit,
    nowMs
  );
  if (!minuteOk) return { allowed: false, reason: 'MINUTE_LIMIT' };

  const dailyOk = await guardedIncrement(
    ids.dailyId,
    { openIdHash, kind: 'day', day: ids.day },
    RATE_CFG.dailyLimit,
    nowMs
  );
  if (!dailyOk) {
    await releaseQuota({ minuteId: ids.minuteId, dailyId: null });
    return { allowed: false, reason: 'DAILY_LIMIT' };
  }

  return {
    allowed: true,
    reason: 'OK',
    dailyId: ids.dailyId,
    minuteId: ids.minuteId,
    dailyCount: (await getCount(ids.dailyId)),
    minuteCount: (await getCount(ids.minuteId))
  };
}

async function reserveQuota(openIdHash, nowMs) {
  try {
    return await reserveViaTransaction(openIdHash, nowMs);
  } catch (_e) {
    // Transaction support is not guaranteed in every environment; the guarded
    // increment path is atomic per document and keeps the same semantics.
    return reserveViaGuard(openIdHash, nowMs);
  }
}

// Best-effort rollback when we failed after reserving: the caller should not be
// charged for a request that never produced an answer.
async function releaseQuota(reservation) {
  if (!reservation) return;
  const ids = [reservation.minuteId, reservation.dailyId].filter(Boolean);
  for (const id of ids) {
    try {
      await db
        .collection(COL_LIMITS)
        .where({ _id: id, count: _.gt(0) })
        .update({ data: { count: _.inc(-1), updatedAt: Date.now() } });
    } catch (_e) {
      // Rollback is advisory; never mask the original failure.
    }
  }
}

function remainingOf(reservation) {
  if (!reservation || !reservation.allowed) return { daily: 0, minute: 0 };
  const daily = Number.isFinite(reservation.dailyCount) ? reservation.dailyCount : 0;
  const minute = Number.isFinite(reservation.minuteCount) ? reservation.minuteCount : 0;
  return {
    daily: Math.max(0, RATE_CFG.dailyLimit - daily),
    minute: Math.max(0, RATE_CFG.minuteLimit - minute)
  };
}

// ---------------------------------------------------------------------------

async function saveQuestion(record) {
  const res = await db.collection(COL_QUESTIONS).add({ data: record });
  return (res && res._id) || '';
}

exports.main = async (event) => {
  const evt = V.isPlainObject(event) ? event : {};
  let reservation = null;

  try {
    const input = V.requireAskInput(evt);

    const { OPENID } = cloud.getWXContext();
    const openIdHash = hashOpenId(OPENID, process.env.RADIO_ID_SALT);

    // Health data consent gate. The client must have called radioApi login with
    // consent:true before questions can be submitted.
    const user = await readUser(openIdHash);
    if (!user || user.consent !== true) {
      throw fail('CONSENT_REQUIRED', 'Consent is required before asking questions.');
    }

    reservation = await reserveQuota(openIdHash, Date.now());
    if (!reservation.allowed) {
      reservation = null;
      throw fail('RATE_LIMITED', 'Daily or per-minute limit reached. Please try again later.');
    }

    // 1. Moderate the inbound question. Fail closed.
    const inbound = await SEC.checkText({
      client: secCheckClient,
      openid: OPENID,
      content: input.question
    });
    if (!inbound.ok) {
      throw fail('CONTENT_BLOCKED', 'Content rejected by safety review.', { stage: 'input' });
    }

    // 2. Ask the model. Errors here release the quota.
    let result;
    try {
      result = await AI.askModel(input, {
        cfg: AI.loadAiConfig(process.env),
        transport: AI.createTransport()
      });
    } catch (e) {
      await releaseQuota(reservation);
      reservation = null;
      throw e;
    }

    // 3. Moderate the outbound answer + quote. Fail closed: nothing unsafe is
    //    ever returned, and nothing is saved.
    const outbound = await SEC.checkText({
      client: secCheckClient,
      openid: OPENID,
      content: [result.answer, result.quote].filter(Boolean).join('\n')
    });
    if (!outbound.ok) {
      throw fail('CONTENT_BLOCKED', 'Content rejected by safety review.', { stage: 'output' });
    }

    // 4. Only a fully validated, fully moderated answer is persisted.
    const createdAt = Date.now();
    const questionId = await saveQuestion({
      owner: openIdHash,
      question: input.question,
      answer: result.answer,
      quote: result.quote,
      episodeId: input.episodeId,
      createdAt,
      saved: false,
      updatedAt: createdAt
    });

    return ok({
      answer: result.answer,
      quote: result.quote,
      questionId,
      episodeId: input.episodeId,
      createdAt,
      remaining: remainingOf(reservation)
    });
  } catch (e) {
    const clean = sanitizeError(e);
    console.error('[radioAsk] code=%s', clean.code);
    return Object.assign({ ok: false }, clean);
  }
};

'use strict';

const { fail } = require('./errors');

// Allowlist of episodes. Anything outside this list is rejected.
const EPISODES = Object.freeze(['ep01', 'ep02', 'ep03', 'ep04']);

const LIMITS = Object.freeze({
  QUESTION_MIN: 1,
  QUESTION_MAX: 500,
  ANSWER_MAX: 4000,
  QUOTE_MAX: 500,
  ID_MAX: 128,
  CURSOR_MAX: 200,
  DISPLAY_NAME_MAX: 24,
  // A single episode is never longer than 6h; guards against absurd payloads.
  DURATION_MAX_SECONDS: 6 * 3600,
  // Player rounding slack when comparing position against duration.
  POSITION_TOLERANCE_SECONDS: 5,
  PAGE_DEFAULT: 20,
  PAGE_MAX: 50,
  PAGE_HARD_MAX: 100
});

const ID_RE = /^[A-Za-z0-9_-]+$/;

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isAllowedEpisode(id) {
  return typeof id === 'string' && EPISODES.indexOf(id) !== -1;
}

function asFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// Returns a trimmed bounded string, or null when absent/invalid/too long.
function boundedString(v, max) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (t.length === 0 || t.length > max) return null;
  return t;
}

function clampInt(v, min, max, dflt) {
  let n = NaN;
  if (typeof v === 'number' && Number.isFinite(v)) n = Math.floor(v);
  else if (typeof v === 'string' && /^\d{1,9}$/.test(v)) n = parseInt(v, 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}

function requireEpisodeId(v) {
  if (!isAllowedEpisode(v)) {
    throw fail('BAD_INPUT', 'Unknown episodeId.', { field: 'episodeId', allowed: EPISODES });
  }
  return v;
}

// {episodeId, position, duration} -> validated, rounded payload.
function requireProgress(input) {
  if (!isPlainObject(input)) throw fail('BAD_INPUT', 'Missing progress payload.');
  const episodeId = requireEpisodeId(input.episodeId);

  const position = asFiniteNumber(input.position);
  const duration = asFiniteNumber(input.duration);

  if (position === null || position < 0) {
    throw fail('BAD_INPUT', 'position must be a finite number >= 0.', { field: 'position' });
  }
  if (duration === null || duration <= 0 || duration > LIMITS.DURATION_MAX_SECONDS) {
    throw fail('BAD_INPUT', 'duration out of range.', {
      field: 'duration',
      max: LIMITS.DURATION_MAX_SECONDS
    });
  }
  if (position > duration + LIMITS.POSITION_TOLERANCE_SECONDS) {
    throw fail('BAD_INPUT', 'position exceeds duration.', { field: 'position' });
  }

  return {
    episodeId,
    position: Math.round(position * 1000) / 1000,
    duration: Math.round(duration * 1000) / 1000
  };
}

function requireQuestion(v) {
  const t = boundedString(v, LIMITS.QUESTION_MAX);
  if (!t || t.length < LIMITS.QUESTION_MIN) {
    throw fail('BAD_INPUT', 'question must be a non-empty string.', { field: 'question' });
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(t)) {
    throw fail('BAD_INPUT', 'question contains control characters.', { field: 'question' });
  }
  return t;
}

// Document ids are used directly in queries, so keep them strictly constrained.
function requireQuestionId(v) {
  if (typeof v !== 'string') throw fail('BAD_INPUT', 'questionId must be a string.', { field: 'questionId' });
  const t = v.trim();
  if (t.length === 0 || t.length > LIMITS.ID_MAX || !ID_RE.test(t)) {
    throw fail('BAD_INPUT', 'questionId has an invalid format.', { field: 'questionId' });
  }
  return t;
}

// Tri-state flag used by the idempotent toggle endpoints.
// absent/null -> null (legacy toggle), true/false -> explicit desired membership.
// Any other type is rejected rather than coerced.
function optionalBoolean(v) {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'boolean') {
    throw fail('BAD_INPUT', 'desired must be a boolean.', { field: 'desired' });
  }
  return v;
}

function optionalDisplayName(v) {
  return boundedString(v, LIMITS.DISPLAY_NAME_MAX);
}

function encodeCursor(createdAt, id) {
  return Buffer.from(`${createdAt}|${id}`, 'utf8').toString('base64url');
}

// Returns {createdAt, id} or null when the cursor is malformed.
function decodeCursor(v) {
  if (typeof v !== 'string' || v.length === 0 || v.length > LIMITS.CURSOR_MAX) return null;
  let raw;
  try {
    raw = Buffer.from(v, 'base64url').toString('utf8');
  } catch (_e) {
    return null;
  }
  const sep = raw.indexOf('|');
  if (sep <= 0) return null;
  const createdAt = Number(raw.slice(0, sep));
  const id = raw.slice(sep + 1);
  if (!Number.isFinite(createdAt) || createdAt < 0) return null;
  if (id.length === 0 || id.length > LIMITS.ID_MAX || !ID_RE.test(id)) return null;
  return { createdAt, id };
}

function requireCursor(v) {
  if (v === undefined || v === null || v === '') return null;
  const decoded = decodeCursor(v);
  if (!decoded) throw fail('BAD_INPUT', 'cursor is malformed.', { field: 'cursor' });
  return decoded;
}

function pageLimit(v) {
  return clampInt(v, 1, LIMITS.PAGE_MAX, LIMITS.PAGE_DEFAULT);
}

module.exports = {
  EPISODES,
  LIMITS,
  isPlainObject,
  isAllowedEpisode,
  asFiniteNumber,
  boundedString,
  clampInt,
  requireEpisodeId,
  requireProgress,
  requireQuestion,
  requireQuestionId,
  optionalBoolean,
  optionalDisplayName,
  encodeCursor,
  decodeCursor,
  requireCursor,
  pageLimit
};

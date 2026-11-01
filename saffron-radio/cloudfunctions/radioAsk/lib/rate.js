'use strict';

// Pure rate-limit planning. All counters live in the `radio_limits` collection;
// the transactional read-modify-write lives in index.js so this module stays
// dependency free and unit testable.

const DEFAULTS = Object.freeze({
  DAILY_LIMIT: 20,
  MINUTE_LIMIT: 3,
  TZ_OFFSET_MINUTES: 480 // UTC+8, so "daily" resets at local midnight
});

const MINUTE_MS = 60000;

function toPositiveInt(v, dflt) {
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  if (!Number.isFinite(n) || n <= 0) return dflt;
  return Math.floor(n);
}

function loadRateConfig(env) {
  const e = env || {};
  return {
    dailyLimit: toPositiveInt(e.RADIO_DAILY_LIMIT, DEFAULTS.DAILY_LIMIT),
    minuteLimit: toPositiveInt(e.RADIO_MINUTE_LIMIT, DEFAULTS.MINUTE_LIMIT),
    tzOffsetMinutes: DEFAULTS.TZ_OFFSET_MINUTES
  };
}

// Local calendar day (YYYY-MM-DD) for the configured offset.
function dayKey(nowMs, tzOffsetMinutes) {
  const offset = Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : DEFAULTS.TZ_OFFSET_MINUTES;
  const shifted = new Date(nowMs + offset * MINUTE_MS);
  return shifted.toISOString().slice(0, 10);
}

// The minute window is a monotonic bucket id; each bucket is a fresh counter.
function minuteBucket(nowMs) {
  return Math.floor(nowMs / MINUTE_MS);
}

function limitsDocId(openIdHash, day) {
  return `d_${openIdHash}_${day}`;
}

function minuteDocId(openIdHash, bucket) {
  return `m_${openIdHash}_${bucket}`;
}

// The single decision point. Counters are the values already consumed.
function evaluateCounters(input) {
  const dailyCount = Number.isFinite(input && input.dailyCount) ? input.dailyCount : 0;
  const minuteCount = Number.isFinite(input && input.minuteCount) ? input.minuteCount : 0;
  const dailyLimit = toPositiveInt(input && input.dailyLimit, DEFAULTS.DAILY_LIMIT);
  const minuteLimit = toPositiveInt(input && input.minuteLimit, DEFAULTS.MINUTE_LIMIT);

  if (minuteCount >= minuteLimit) {
    return { allowed: false, reason: 'MINUTE_LIMIT', dailyCount, minuteCount, dailyLimit, minuteLimit };
  }
  if (dailyCount >= dailyLimit) {
    return { allowed: false, reason: 'DAILY_LIMIT', dailyCount, minuteCount, dailyLimit, minuteLimit };
  }
  return {
    allowed: true,
    reason: 'OK',
    dailyCount: dailyCount + 1,
    minuteCount: minuteCount + 1,
    dailyLimit,
    minuteLimit
  };
}

function countersFromDoc(doc, field) {
  if (!doc || typeof doc !== 'object') return 0;
  const n = doc[field];
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

module.exports = {
  DEFAULTS,
  loadRateConfig,
  dayKey,
  minuteBucket,
  limitsDocId,
  minuteDocId,
  evaluateCounters,
  countersFromDoc
};

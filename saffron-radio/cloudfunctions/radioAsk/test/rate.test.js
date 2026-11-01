'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const R = require('../lib/rate');

test('defaults are 20 per day and 3 per minute', () => {
  const cfg = R.loadRateConfig({});
  assert.equal(cfg.dailyLimit, 20);
  assert.equal(cfg.minuteLimit, 3);
  assert.equal(cfg.tzOffsetMinutes, 480);
});

test('limits are overridable by environment and invalid values fall back', () => {
  assert.equal(R.loadRateConfig({ RADIO_DAILY_LIMIT: '50' }).dailyLimit, 50);
  assert.equal(R.loadRateConfig({ RADIO_MINUTE_LIMIT: '5' }).minuteLimit, 5);
  assert.equal(R.loadRateConfig({ RADIO_DAILY_LIMIT: '0' }).dailyLimit, 20);
  assert.equal(R.loadRateConfig({ RADIO_DAILY_LIMIT: '-3' }).dailyLimit, 20);
  assert.equal(R.loadRateConfig({ RADIO_DAILY_LIMIT: 'abc' }).dailyLimit, 20);
  assert.equal(R.loadRateConfig({ RADIO_MINUTE_LIMIT: '' }).minuteLimit, 3);
});

test('day key uses the UTC+8 calendar day and rolls at local midnight', () => {
  // 2024-05-01T15:59:00Z -> 2024-05-01 23:59 local
  assert.equal(R.dayKey(Date.UTC(2024, 4, 1, 15, 59, 0), 480), '2024-05-01');
  // 2024-05-01T16:00:00Z -> 2024-05-02 00:00 local
  assert.equal(R.dayKey(Date.UTC(2024, 4, 1, 16, 0, 0), 480), '2024-05-02');
  assert.equal(R.dayKey(Date.UTC(2024, 4, 1, 0, 0, 0), 480), '2024-05-01');
});

test('minute bucket advances once per minute and is stable inside a minute', () => {
  const base = Math.floor(1_700_000_000_000 / 60000) * 60000; // aligned to a minute boundary
  assert.equal(R.minuteBucket(base), R.minuteBucket(base + 59_000));
  assert.equal(R.minuteBucket(base) + 1, R.minuteBucket(base + 60_000));
});

test('counter document ids are deterministic and unique per window', () => {
  const hash = 'a'.repeat(64);
  assert.equal(R.limitsDocId(hash, '2024-05-01'), `d_${hash}_2024-05-01`);
  assert.equal(R.minuteDocId(hash, 28333333), `m_${hash}_28333333`);
  assert.notEqual(R.limitsDocId(hash, '2024-05-01'), R.limitsDocId(hash, '2024-05-02'));
  assert.notEqual(R.minuteDocId(hash, 1), R.minuteDocId(hash, 2));
  assert.ok(R.limitsDocId(hash, '2024-05-01').length < 128);
});

test('evaluateCounters allows while under both limits', () => {
  const first = R.evaluateCounters({ dailyCount: 0, minuteCount: 0, dailyLimit: 20, minuteLimit: 3 });
  assert.equal(first.allowed, true);
  assert.equal(first.dailyCount, 1);
  assert.equal(first.minuteCount, 1);

  const third = R.evaluateCounters({ dailyCount: 2, minuteCount: 2, dailyLimit: 20, minuteLimit: 3 });
  assert.equal(third.allowed, true);
  assert.equal(third.minuteCount, 3);
});

test('evaluateCounters blocks at the per-minute boundary first', () => {
  const r = R.evaluateCounters({ dailyCount: 3, minuteCount: 3, dailyLimit: 20, minuteLimit: 3 });
  assert.equal(r.allowed, false);
  assert.equal(r.reason, 'MINUTE_LIMIT');
});

test('evaluateCounters blocks at the daily boundary', () => {
  const r = R.evaluateCounters({ dailyCount: 20, minuteCount: 0, dailyLimit: 20, minuteLimit: 3 });
  assert.equal(r.allowed, false);
  assert.equal(r.reason, 'DAILY_LIMIT');

  const r2 = R.evaluateCounters({ dailyCount: 25, minuteCount: 1, dailyLimit: 20, minuteLimit: 3 });
  assert.equal(r2.allowed, false);
  assert.equal(r2.reason, 'DAILY_LIMIT');
});

test('evaluateCounters never lets the 21st question through in one day', () => {
  let daily = 0;
  let minuteCount = 0;
  let allowedTotal = 0;
  for (let i = 0; i < 40; i += 1) {
    if (i % 3 === 0) minuteCount = 0; // simulate a fresh minute window
    const d = R.evaluateCounters({ dailyCount: daily, minuteCount, dailyLimit: 20, minuteLimit: 3 });
    if (!d.allowed) continue;
    daily = d.dailyCount;
    minuteCount = d.minuteCount;
    allowedTotal += 1;
  }
  assert.equal(allowedTotal, 20);
});

test('countersFromDoc tolerates missing or corrupt documents', () => {
  assert.equal(R.countersFromDoc(null, 'count'), 0);
  assert.equal(R.countersFromDoc({}, 'count'), 0);
  assert.equal(R.countersFromDoc({ count: 4 }, 'count'), 4);
  assert.equal(R.countersFromDoc({ count: -2 }, 'count'), 0);
  assert.equal(R.countersFromDoc({ count: 'x' }, 'count'), 0);
});

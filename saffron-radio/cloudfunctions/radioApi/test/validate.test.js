'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const V = require('../lib/validate');
const { hashOpenId } = require('../lib/identity');
const { sanitizeError, fail, AppError } = require('../lib/errors');

const SALT = 'test-salt-0123456789abcdef';

test('episode allowlist accepts only ep01..ep04', () => {
  for (const id of ['ep01', 'ep02', 'ep03', 'ep04']) {
    assert.equal(V.isAllowedEpisode(id), true);
    assert.equal(V.requireEpisodeId(id), id);
  }
  for (const bad of ['ep05', 'EP01', 'ep1', '', null, undefined, 1, {}, 'ep01;drop']) {
    assert.equal(V.isAllowedEpisode(bad), false);
    assert.throws(() => V.requireEpisodeId(bad), (e) => e instanceof AppError && e.code === 'BAD_INPUT');
  }
});

test('saveProgress accepts a well formed payload', () => {
  const p = V.requireProgress({ episodeId: 'ep02', position: 12.3456, duration: 600 });
  assert.equal(p.episodeId, 'ep02');
  assert.equal(p.position, 12.346);
  assert.equal(p.duration, 600);
});

test('saveProgress rejects non finite, negative and out of range numbers', () => {
  const cases = [
    { episodeId: 'ep01', position: NaN, duration: 600 },
    { episodeId: 'ep01', position: Infinity, duration: 600 },
    { episodeId: 'ep01', position: -1, duration: 600 },
    { episodeId: 'ep01', position: '10', duration: 600 },
    { episodeId: 'ep01', position: 10, duration: 0 },
    { episodeId: 'ep01', position: 10, duration: -5 },
    { episodeId: 'ep01', position: 10, duration: NaN },
    { episodeId: 'ep01', position: 10, duration: V.LIMITS.DURATION_MAX_SECONDS + 1 },
    { episodeId: 'ep01', position: 700, duration: 600 },
    { episodeId: 'nope', position: 1, duration: 600 },
    null
  ];
  for (const c of cases) {
    assert.throws(
      () => V.requireProgress(c),
      (e) => e instanceof AppError && e.code === 'BAD_INPUT',
      `expected rejection for ${JSON.stringify(c)}`
    );
  }
});

test('saveProgress tolerates small player rounding drift at the end', () => {
  const p = V.requireProgress({ episodeId: 'ep03', position: 600.5, duration: 600 });
  assert.equal(p.position, 600.5);
});

test('question validation enforces length bounds and strips control chars', () => {
  assert.equal(V.requireQuestion('  藏红花为什么是黄色？  '), '藏红花为什么是黄色？');
  assert.equal(V.requireQuestion('a'.repeat(V.LIMITS.QUESTION_MAX)).length, V.LIMITS.QUESTION_MAX);

  for (const bad of ['', '   ', 'a'.repeat(V.LIMITS.QUESTION_MAX + 1), 'ok\u0000bad', null, 42]) {
    assert.throws(() => V.requireQuestion(bad), (e) => e.code === 'BAD_INPUT');
  }
});

test('questionId validation rejects unsafe document ids', () => {
  assert.equal(V.requireQuestionId('abc123_-XY'), 'abc123_-XY');
  for (const bad of ['', 'has space', 'a'.repeat(V.LIMITS.ID_MAX + 1), 'semi;colon', '../etc', null, 7]) {
    assert.throws(() => V.requireQuestionId(bad), (e) => e.code === 'BAD_INPUT');
  }
});

test('pagination limit is clamped into 1..50 with a default of 20', () => {
  assert.equal(V.pageLimit(undefined), 20);
  assert.equal(V.pageLimit(0), 1);
  assert.equal(V.pageLimit(-10), 1);
  assert.equal(V.pageLimit(5), 5);
  assert.equal(V.pageLimit(50), 50);
  assert.equal(V.pageLimit(5000), 50);
  assert.equal(V.pageLimit('7'), 7);
  assert.equal(V.pageLimit('abc'), 20);
  assert.ok(V.LIMITS.PAGE_MAX <= V.LIMITS.PAGE_HARD_MAX);
});

test('cursor round-trips and rejects malformed values', () => {
  const c = V.encodeCursor(1730000000000, 'q_abc-123');
  assert.deepEqual(V.requireCursor(c), { createdAt: 1730000000000, id: 'q_abc-123' });
  assert.equal(V.requireCursor(undefined), null);
  assert.equal(V.requireCursor(''), null);

  for (const bad of ['not-base64!!', Buffer.from('nope').toString('base64url'), 'x'.repeat(300)]) {
    assert.throws(() => V.requireCursor(bad), (e) => e.code === 'BAD_INPUT');
  }
});

test('display name is optional, trimmed and bounded', () => {
  assert.equal(V.optionalDisplayName('  林泉  '), '林泉');
  assert.equal(V.optionalDisplayName(''), null);
  assert.equal(V.optionalDisplayName('a'.repeat(V.LIMITS.DISPLAY_NAME_MAX + 1)), null);
  assert.equal(V.optionalDisplayName(undefined), null);
});

test('openid hashing is salted, stable and never reversible to the raw id', () => {
  const a = hashOpenId('oABC123', SALT);
  const b = hashOpenId('oABC123', SALT);
  const c = hashOpenId('oABC123', 'another-salt-0123456789');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.ok(!a.includes('oABC123'));
});

test('openid hashing fails closed without identity or salt', () => {
  assert.throws(() => hashOpenId('', SALT), (e) => e.code === 'NO_IDENTITY');
  assert.throws(() => hashOpenId(undefined, SALT), (e) => e.code === 'NO_IDENTITY');
  assert.throws(() => hashOpenId('oABC123', ''), (e) => e.code === 'INTERNAL');
  assert.throws(() => hashOpenId('oABC123', 'short'), (e) => e.code === 'INTERNAL');
});

test('errors never leak raw internals to the client', () => {
  assert.deepEqual(sanitizeError(fail('BAD_INPUT', 'Invalid input.', { field: 'x' })), {
    code: 'BAD_INPUT',
    message: 'Invalid input.',
    details: { field: 'x' }
  });

  const leaked = sanitizeError(new Error('connect ECONNREFUSED 10.0.0.5:27017'));
  assert.equal(leaked.code, 'INTERNAL');
  assert.ok(!leaked.message.includes('ECONNREFUSED'));
  assert.ok(!leaked.message.includes('10.0.0.5'));

  const unknownCode = sanitizeError(fail('SOME_DB_CODE', 'raw driver text'));
  assert.equal(unknownCode.code, 'INTERNAL');
  assert.equal(unknownCode.message, 'Internal error.');
});

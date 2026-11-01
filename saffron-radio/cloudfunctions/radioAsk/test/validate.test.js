'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const V = require('../lib/validate');
const { hashOpenId } = require('../lib/identity');
const { sanitizeError, fail } = require('../lib/errors');

const SALT = 'test-salt-0123456789abcdef';

test('ask input requires an allowlisted episode', () => {
  const okInput = V.requireAskInput({ question: '藏红花为什么是黄色的？', episodeId: 'ep02' });
  assert.equal(okInput.episodeId, 'ep02');
  assert.equal(okInput.question, '藏红花为什么是黄色的？');

  for (const bad of ['ep05', 'ep1', '', null, 2]) {
    assert.throws(
      () => V.requireAskInput({ question: 'hi', episodeId: bad }),
      (e) => e.code === 'BAD_INPUT'
    );
  }
});

test('ask input rejects empty, oversized and control-character questions', () => {
  const cases = [
    { question: '', episodeId: 'ep01' },
    { question: '   ', episodeId: 'ep01' },
    { question: 'a'.repeat(V.LIMITS.QUESTION_MAX + 1), episodeId: 'ep01' },
    { question: 'bad\u0000text', episodeId: 'ep01' },
    { question: 123, episodeId: 'ep01' },
    {},
    null
  ];
  for (const c of cases) {
    assert.throws(() => V.requireAskInput(c), (e) => e.code === 'BAD_INPUT');
  }
});

test('ask input trims and accepts the maximum length', () => {
  const q = '问'.repeat(V.LIMITS.QUESTION_MAX);
  const parsed = V.requireAskInput({ question: `  ${q}  `, episodeId: 'ep04' });
  assert.equal(parsed.question.length, V.LIMITS.QUESTION_MAX);
});

test('client supplied openid, model and endpoint fields are ignored', () => {
  const parsed = V.requireAskInput({
    question: 'hi',
    episodeId: 'ep01',
    openid: 'attacker-openid',
    model: 'evil-model',
    baseUrl: 'http://evil.example'
  });
  assert.deepEqual(Object.keys(parsed).sort(), ['episodeId', 'question']);
});

test('openid hashing is salted, stable and never reversible to the raw id', () => {
  const a = hashOpenId('oXYZ789', SALT);
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, hashOpenId('oXYZ789', SALT));
  assert.notEqual(a, hashOpenId('oXYZ789', 'other-salt-0123456789abc'));
  assert.ok(!a.includes('oXYZ789'));
});

test('openid hashing fails closed without identity or salt', () => {
  assert.throws(() => hashOpenId('', SALT), (e) => e.code === 'NO_IDENTITY');
  assert.throws(() => hashOpenId('oXYZ789', ''), (e) => e.code === 'INTERNAL');
});

test('errors never leak raw internals to the client', () => {
  assert.equal(sanitizeError(fail('CONSENT_REQUIRED')).code, 'CONSENT_REQUIRED');
  assert.equal(sanitizeError(fail('RATE_LIMITED')).code, 'RATE_LIMITED');

  const leaked = sanitizeError(new Error('Bearer sk-secret-key-123 rejected'));
  assert.equal(leaked.code, 'INTERNAL');
  assert.equal(leaked.message, 'Internal error.');
  assert.ok(!leaked.message.includes('sk-secret'));
});

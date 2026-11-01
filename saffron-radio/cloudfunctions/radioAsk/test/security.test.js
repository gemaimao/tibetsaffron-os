'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const SEC = require('../lib/security');

// Every test injects a fake client: no network, no cloud credentials.
const passClient = async () => ({ errCode: 0, result: { suggest: 'pass', label: 100 } });

test('version 2 / scene 2 is used for user generated text', () => {
  assert.equal(SEC.SEC_CHECK_VERSION, 2);
  assert.equal(SEC.SEC_CHECK_SCENE, 2);
});

test('the request forwards version, scene, openid and content verbatim', async () => {
  let seen = null;
  const client = async (params) => {
    seen = params;
    return { errCode: 0, result: { suggest: 'pass' } };
  };

  const res = await SEC.checkText({ client, openid: 'oABC', content: '藏红花素是什么？' });
  assert.equal(res.ok, true);
  assert.deepEqual(seen, { version: 2, scene: 2, openid: 'oABC', content: '藏红花素是什么？' });
});

test('evaluateSecCheckResult maps verdicts', () => {
  assert.equal(SEC.evaluateSecCheckResult({ errCode: 0, result: { suggest: 'pass' } }).ok, true);

  const review = SEC.evaluateSecCheckResult({ errCode: 0, result: { suggest: 'review', label: 20001 } });
  assert.equal(review.ok, false);
  assert.equal(review.reason, 'SEC_REVIEW');

  const risky = SEC.evaluateSecCheckResult({ errCode: 0, result: { suggest: 'risky', label: 20002 } });
  assert.equal(risky.ok, false);
  assert.equal(risky.reason, 'SEC_RISKY');
});

test('anything unexpected is rejected, never allowed', () => {
  const bad = [
    null,
    undefined,
    'pass',
    {},
    { errCode: 0 },
    { errCode: 0, result: {} },
    { errCode: 0, result: { suggest: 1 } },
    { errCode: 87014, result: { suggest: 'pass' } },
    { result: { suggest: 'pass' } , errCode: 61010 }
  ];
  for (const b of bad) {
    assert.equal(SEC.evaluateSecCheckResult(b).ok, false, `expected rejection for ${JSON.stringify(b)}`);
  }
});

test('checkText fails closed when the API throws', async () => {
  const client = async () => {
    throw new Error('msgSecCheck: permission denied');
  };
  const res = await SEC.checkText({ client, openid: 'oABC', content: 'hello' });
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'SEC_EXCEPTION');
});

test('checkText fails closed without a client or without an openid', async () => {
  assert.equal((await SEC.checkText({ openid: 'oABC', content: 'x' })).reason, 'SEC_NO_CLIENT');
  assert.equal((await SEC.checkText({ client: passClient, content: 'x' })).reason, 'SEC_NO_OPENID');
  assert.equal((await SEC.checkText({ client: passClient, openid: '', content: 'x' })).reason, 'SEC_NO_OPENID');
});

test('checkText short-circuits only for genuinely empty content', async () => {
  let called = 0;
  const client = async () => {
    called += 1;
    return { errCode: 0, result: { suggest: 'pass' } };
  };

  const empty = await SEC.checkText({ client, openid: 'oABC', content: '   ' });
  assert.equal(empty.ok, true);
  assert.equal(empty.reason, 'SEC_SKIPPED_EMPTY');
  assert.equal(called, 0);

  const normal = await SEC.checkText({ client, openid: 'oABC', content: 'real' });
  assert.equal(normal.ok, true);
  assert.equal(called, 1);
});

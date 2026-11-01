'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const V = require('../lib/validate');
const { applyMembership } = require('../lib/membership');
const { AppError } = require('../lib/errors');

test('optionalBoolean is tri-state and rejects non booleans', () => {
  assert.equal(V.optionalBoolean(undefined), null);
  assert.equal(V.optionalBoolean(null), null);
  assert.equal(V.optionalBoolean(true), true);
  assert.equal(V.optionalBoolean(false), false);

  for (const bad of ['true', 'false', 1, 0, {}, [], '']) {
    assert.throws(
      () => V.optionalBoolean(bad),
      (e) => e instanceof AppError && e.code === 'BAD_INPUT' && e.details.field === 'desired'
    );
  }
});

test('applyMembership with desired=true is idempotent', () => {
  assert.deepEqual(applyMembership([], 'ep02', true), ['ep02']);
  assert.deepEqual(applyMembership(['ep02'], 'ep02', true), ['ep02']);
  assert.deepEqual(applyMembership(['ep01'], 'ep02', true), ['ep01', 'ep02']);
  // Replaying the same request must never flip the value back.
  let list = [];
  for (let i = 0; i < 5; i += 1) list = applyMembership(list, 'ep03', true);
  assert.deepEqual(list, ['ep03']);
});

test('applyMembership with desired=false is idempotent', () => {
  assert.deepEqual(applyMembership(['ep01', 'ep02'], 'ep01', false), ['ep02']);
  assert.deepEqual(applyMembership(['ep02'], 'ep01', false), ['ep02']);
  let list = ['ep01', 'ep02'];
  for (let i = 0; i < 5; i += 1) list = applyMembership(list, 'ep01', false);
  assert.deepEqual(list, ['ep02']);
});

test('applyMembership without desired keeps the legacy toggle behaviour', () => {
  assert.deepEqual(applyMembership([], 'ep01', null), ['ep01']);
  assert.deepEqual(applyMembership(['ep01'], 'ep01', null), []);
  assert.deepEqual(applyMembership(['ep01'], 'ep01', undefined), []);
});

test('applyMembership never mutates the input array', () => {
  const input = ['ep01'];
  applyMembership(input, 'ep02', true);
  applyMembership(input, 'ep01', false);
  assert.deepEqual(input, ['ep01']);
});

test('applyMembership tolerates a malformed stored value', () => {
  assert.deepEqual(applyMembership(null, 'ep01', true), ['ep01']);
  assert.deepEqual(applyMembership(undefined, 'ep01', false), []);
  assert.deepEqual(applyMembership('ep01', 'ep01', true), ['ep01']);
});

test('a stale retry cannot undo a newer local intent', () => {
  // Sequence the client can produce while offline, then replaying in order:
  // user favourites ep02, then unfavourites it before the first write lands.
  let server = [];
  server = applyMembership(server, 'ep02', true); // first attempt succeeded late
  assert.deepEqual(server, ['ep02']);

  // The queued second intent (desired=false) still removes it, and replaying
  // that same request again changes nothing.
  server = applyMembership(server, 'ep02', false);
  server = applyMembership(server, 'ep02', false);
  assert.deepEqual(server, []);
});

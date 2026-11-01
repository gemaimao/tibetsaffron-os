'use strict';

const crypto = require('crypto');
const { fail } = require('./errors');

// The caller's openid is NEVER stored or trusted from the client payload.
// It comes from cloud.getWXContext().OPENID and is immediately turned into a
// salted SHA-256 digest, which is what every collection is keyed on.
function hashOpenId(openid, salt) {
  if (typeof openid !== 'string' || openid.length === 0) {
    throw fail('NO_IDENTITY', 'Missing caller identity.');
  }
  if (typeof salt !== 'string' || salt.length < 16) {
    throw fail('INTERNAL', 'Identity salt is not configured.');
  }
  return crypto.createHash('sha256').update(`${salt}:${openid}`, 'utf8').digest('hex');
}

module.exports = { hashOpenId };

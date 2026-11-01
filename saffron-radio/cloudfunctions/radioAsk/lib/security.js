'use strict';

// WeChat content security. This module is FAIL CLOSED by design: any missing
// input, transport error or unexpected shape is treated as "not allowed".
//
// Requires the cloud function to hold the `security.msgSecCheck` API permission
// (see cloud-setup.txt). Version 2 with scene 2 is required: it accepts the
// caller's openid and returns a suggest verdict.

const SEC_CHECK_VERSION = 2;
const SEC_CHECK_SCENE = 2; // 2 = comment / user generated text

// Pure mapping from the API response to a verdict.
function evaluateSecCheckResult(result) {
  if (!result || typeof result !== 'object') {
    return { ok: false, reason: 'SEC_EMPTY' };
  }
  if (typeof result.errCode === 'number' && result.errCode !== 0) {
    return { ok: false, reason: 'SEC_ERRCODE', errCode: result.errCode };
  }
  const payload = result.result;
  if (!payload || typeof payload !== 'object') {
    return { ok: false, reason: 'SEC_NO_RESULT' };
  }
  const suggest = payload.suggest;
  if (suggest === 'pass') return { ok: true, reason: 'SEC_PASS' };
  if (typeof suggest !== 'string' || suggest.length === 0) {
    return { ok: false, reason: 'SEC_NO_SUGGEST' };
  }
  return { ok: false, reason: `SEC_${suggest.toUpperCase()}`, suggest, label: payload.label };
}

// client is injected so tests never touch the network or cloud credentials.
// Expected signature: (params) => Promise<apiResult>
async function checkText(options) {
  const opts = options || {};
  const client = opts.client;
  const openid = opts.openid;
  const content = opts.content;

  if (typeof client !== 'function') return { ok: false, reason: 'SEC_NO_CLIENT' };
  if (typeof openid !== 'string' || openid.length === 0) {
    return { ok: false, reason: 'SEC_NO_OPENID' };
  }
  if (typeof content !== 'string' || content.trim().length === 0) {
    // Nothing to moderate. An empty model answer is rejected elsewhere.
    return { ok: true, reason: 'SEC_SKIPPED_EMPTY' };
  }

  try {
    const result = await client({
      version: SEC_CHECK_VERSION,
      scene: SEC_CHECK_SCENE,
      openid,
      content
    });
    return evaluateSecCheckResult(result);
  } catch (_e) {
    // Transport failure must never let content through unchecked.
    return { ok: false, reason: 'SEC_EXCEPTION' };
  }
}

module.exports = {
  SEC_CHECK_VERSION,
  SEC_CHECK_SCENE,
  evaluateSecCheckResult,
  checkText
};

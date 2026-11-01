'use strict';

// Public, stable error contract. Anything not listed here is reported as INTERNAL
// so that upstream/AI/DB details never leak to the client.
const PUBLIC_MESSAGES = Object.freeze({
  NO_IDENTITY: 'Missing caller identity.',
  BAD_INPUT: 'Invalid input.',
  CONSENT_REQUIRED: 'Consent is required before asking questions.',
  RATE_LIMITED: 'Daily or per-minute limit reached. Please try again later.',
  RATE_UNAVAILABLE: 'Rate limiter unavailable, please retry.',
  CONTENT_BLOCKED: 'Content rejected by safety review.',
  AI_CONFIG: 'AI service is not configured.',
  AI_UPSTREAM: 'AI service unavailable.',
  AI_TIMEOUT: 'AI service timed out.',
  AI_BAD_RESPONSE: 'AI service returned an unusable response.',
  NOT_FOUND: 'Resource not found.',
  INTERNAL: 'Internal error.'
});

class AppError extends Error {
  constructor(code, message, details) {
    const known = Object.prototype.hasOwnProperty.call(PUBLIC_MESSAGES, code);
    const finalCode = known ? code : 'INTERNAL';
    // An unrecognised code means the text is untrusted (often a raw driver or
    // upstream message), so it is replaced rather than forwarded.
    super(known && typeof message === 'string' && message ? message : PUBLIC_MESSAGES[finalCode]);
    this.name = 'AppError';
    this.code = finalCode;
    if (details && typeof details === 'object') this.details = details;
  }
}

function fail(code, message, details) {
  return new AppError(code, message, details);
}

function isAppError(e) {
  return e instanceof AppError;
}

// Never returns raw exception text: unknown failures collapse to INTERNAL.
function sanitizeError(e) {
  if (isAppError(e)) {
    const out = { code: e.code, message: e.message };
    if (e.details) out.details = e.details;
    return out;
  }
  return { code: 'INTERNAL', message: PUBLIC_MESSAGES.INTERNAL };
}

module.exports = { AppError, fail, isAppError, sanitizeError, PUBLIC_MESSAGES };

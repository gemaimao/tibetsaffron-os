'use strict';

const { fail } = require('./errors');

// Allowlist of episodes. Anything outside this list is rejected.
const EPISODES = Object.freeze(['ep01', 'ep02', 'ep03', 'ep04']);

const LIMITS = Object.freeze({
  QUESTION_MIN: 1,
  QUESTION_MAX: 500,
  ANSWER_MAX: 4000,
  QUOTE_MAX: 500,
  ID_MAX: 128
});

const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isAllowedEpisode(id) {
  return typeof id === 'string' && EPISODES.indexOf(id) !== -1;
}

function boundedString(v, max) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (t.length === 0 || t.length > max) return null;
  return t;
}

function requireEpisodeId(v) {
  if (!isAllowedEpisode(v)) {
    throw fail('BAD_INPUT', 'Unknown episodeId.', { field: 'episodeId', allowed: EPISODES });
  }
  return v;
}

// radioAsk input contract: {question, episodeId}. Nothing else is honoured —
// in particular no openid, no model, no endpoint can be supplied by the client.
function requireAskInput(input) {
  if (!isPlainObject(input)) throw fail('BAD_INPUT', 'Missing request payload.');

  const question = boundedString(input.question, LIMITS.QUESTION_MAX);
  if (!question || question.length < LIMITS.QUESTION_MIN) {
    throw fail('BAD_INPUT', 'question must be a non-empty string.', {
      field: 'question',
      max: LIMITS.QUESTION_MAX
    });
  }
  if (CTRL_RE.test(question)) {
    throw fail('BAD_INPUT', 'question contains control characters.', { field: 'question' });
  }

  return { question, episodeId: requireEpisodeId(input.episodeId) };
}

module.exports = {
  EPISODES,
  LIMITS,
  isPlainObject,
  isAllowedEpisode,
  boundedString,
  requireEpisodeId,
  requireAskInput
};

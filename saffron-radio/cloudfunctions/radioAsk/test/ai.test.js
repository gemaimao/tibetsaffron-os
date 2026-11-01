'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const AI = require('../lib/ai');
const { LIMITS } = require('../lib/validate');

const BASE_ENV = {
  AI_BASE_URL: 'https://ai.example.com/v1',
  AI_API_KEY: 'sk-test-key',
  AI_MODEL: 'test-model',
  ALLOWED_AI_HOSTS: 'ai.example.com'
};

function completion(content) {
  return JSON.stringify({ choices: [{ message: { role: 'assistant', content } }] });
}

test('config requires key, model, base url and a whitelist', () => {
  assert.equal(AI.loadAiConfig(BASE_ENV).endpoint, 'https://ai.example.com/v1/chat/completions');

  const cases = [
    {},
    Object.assign({}, BASE_ENV, { AI_API_KEY: '' }),
    Object.assign({}, BASE_ENV, { AI_MODEL: '  ' }),
    Object.assign({}, BASE_ENV, { AI_BASE_URL: '' }),
    Object.assign({}, BASE_ENV, { ALLOWED_AI_HOSTS: '' })
  ];
  for (const c of cases) {
    assert.throws(() => AI.loadAiConfig(c), (e) => e.code === 'AI_CONFIG');
  }
});

test('endpoint must be https and host-whitelisted', () => {
  assert.throws(
    () => AI.resolveEndpoint('http://ai.example.com/v1', ['ai.example.com']),
    (e) => e.code === 'AI_CONFIG'
  );
  assert.throws(
    () => AI.resolveEndpoint('https://evil.example/v1', ['ai.example.com']),
    (e) => e.code === 'AI_CONFIG'
  );
  assert.throws(() => AI.resolveEndpoint('https://ai.example.com/v1', []), (e) => e.code === 'AI_CONFIG');
  assert.throws(() => AI.resolveEndpoint('not a url', ['ai.example.com']), (e) => e.code === 'AI_CONFIG');

  assert.equal(
    AI.resolveEndpoint('https://ai.example.com/v1/', ['ai.example.com']),
    'https://ai.example.com/v1/chat/completions'
  );
  assert.equal(
    AI.resolveEndpoint('https://ai.example.com', ['ai.example.com']),
    'https://ai.example.com/chat/completions'
  );
});

test('timeout and byte cap default to 25s and a bounded size', () => {
  const cfg = AI.loadAiConfig(BASE_ENV);
  assert.equal(cfg.timeoutMs, 25000);
  assert.equal(AI.DEFAULT_TIMEOUT_MS, 25000);
  assert.equal(cfg.maxBytes, AI.DEFAULT_MAX_BYTES);
  assert.ok(AI.DEFAULT_MAX_BYTES > 0 && AI.DEFAULT_MAX_BYTES <= 1024 * 1024);
});

test('system prompt carries the brand rules', () => {
  const p = AI.BRAND_SYSTEM_PROMPT;
  assert.match(p, /雪域林泉·藏红花电台/);
  assert.match(p, /不杜撰产地、认证或医疗疗效/);
  assert.match(p, /不可用颜色鉴真/);
  assert.match(p, /不针对具体个人按「根」给出医疗剂量建议/);
  assert.match(p, /孕期、哺乳期/);
  assert.match(p, /先给出科学信息/);
});

test('messages put the brand system prompt first and the question last', () => {
  const messages = AI.buildMessages({ question: '藏红花素是什么？', episodeId: 'ep02' });
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, 'system');
  assert.equal(messages[0].content, AI.BRAND_SYSTEM_PROMPT);
  assert.equal(messages[1].role, 'user');
  assert.match(messages[1].content, /藏红花素是什么？/);
  assert.match(messages[1].content, /藏红花素与那抹金黄/);
});

test('request body never contains the api key and gates response_format', () => {
  const cfg = AI.loadAiConfig(BASE_ENV);
  const body = AI.buildRequestBody(cfg, AI.buildMessages({ question: 'q', episodeId: 'ep01' }));
  assert.ok(!body.includes('sk-test-key'));
  assert.ok(!JSON.parse(body).response_format);

  const jsonCfg = AI.loadAiConfig(Object.assign({}, BASE_ENV, { AI_RESPONSE_FORMAT: 'json_object' }));
  assert.equal(JSON.parse(AI.buildRequestBody(jsonCfg, [])).response_format.type, 'json_object');
});

test('parseModelJson accepts a clean payload', () => {
  const r = AI.parseModelJson('{"answer":"科学信息。\\n温暖总结。","quote":"慢慢来。"}');
  assert.equal(r.answer, '科学信息。\n温暖总结。');
  assert.equal(r.quote, '慢慢来。');
});

test('parseModelJson tolerates fenced and prose-wrapped JSON', () => {
  const fenced = AI.parseModelJson('```json\n{"answer":"A","quote":"Q"}\n```');
  assert.deepEqual(fenced, { answer: 'A', quote: 'Q' });

  const prose = AI.parseModelJson('好的，这是回答：{"answer":"A","quote":"Q"} 希望有帮助。');
  assert.deepEqual(prose, { answer: 'A', quote: 'Q' });
});

test('parseModelJson treats a missing quote as an empty string', () => {
  assert.deepEqual(AI.parseModelJson('{"answer":"A"}'), { answer: 'A', quote: '' });
  assert.deepEqual(AI.parseModelJson('{"answer":"A","quote":null}'), { answer: 'A', quote: '' });
});

test('parseModelJson rejects payloads that violate the schema', () => {
  const bad = [
    '',
    '   ',
    'not json at all',
    '[]',
    '"a string"',
    '{"quote":"Q"}',
    '{"answer":""}',
    '{"answer":123}',
    `{"answer":"${'a'.repeat(LIMITS.ANSWER_MAX + 1)}"}`,
    `{"answer":"A","quote":"${'q'.repeat(LIMITS.QUOTE_MAX + 1)}"}`,
    '{"answer":"A","quote":{"x":1}}',
    null,
    42
  ];
  for (const b of bad) {
    assert.throws(() => AI.parseModelJson(b), (e) => e.code === 'AI_BAD_RESPONSE', `for ${String(b).slice(0, 30)}`);
  }
});

test('extractContent validates the completion envelope', () => {
  assert.equal(AI.extractContent(JSON.parse(completion('hello'))), 'hello');
  for (const b of [null, {}, { choices: [] }, { choices: [{}] }, { choices: [{ message: { content: '' } }] }]) {
    assert.throws(() => AI.extractContent(b), (e) => e.code === 'AI_BAD_RESPONSE');
  }
});

test('askModel returns a parsed answer from a well formed completion', async () => {
  let captured = null;
  const transport = async (req) => {
    captured = req;
    return { statusCode: 200, body: completion('{"answer":"先科学，后温暖。","quote":"从容一点。"}') };
  };

  const cfg = AI.loadAiConfig(BASE_ENV);
  const out = await AI.askModel({ question: '为什么是黄的？', episodeId: 'ep02' }, { cfg, transport });

  assert.deepEqual(out, { answer: '先科学，后温暖。', quote: '从容一点。' });
  assert.equal(captured.url, 'https://ai.example.com/v1/chat/completions');
  assert.equal(captured.headers.authorization, 'Bearer sk-test-key');
  assert.equal(captured.timeoutMs, 25000);
  assert.equal(captured.maxBytes, AI.DEFAULT_MAX_BYTES);

  const sent = JSON.parse(captured.body);
  assert.equal(sent.model, 'test-model');
  assert.equal(sent.messages[0].content, AI.BRAND_SYSTEM_PROMPT);
  assert.ok(captured.body.includes('为什么是黄的？'));
});

test('askModel never fabricates a response on upstream failure', async () => {
  const cfg = AI.loadAiConfig(BASE_ENV);

  const serverError = async () => ({ statusCode: 500, body: 'account sk-test-key suspended' });
  await assert.rejects(
    () => AI.askModel({ question: 'q', episodeId: 'ep01' }, { cfg, transport: serverError }),
    (e) => {
      assert.equal(e.code, 'AI_UPSTREAM');
      assert.ok(!e.message.includes('sk-test-key'));
      assert.ok(!e.message.includes('suspended'));
      return true;
    }
  );

  const notJson = async () => ({ statusCode: 200, body: '<html>gateway</html>' });
  await assert.rejects(
    () => AI.askModel({ question: 'q', episodeId: 'ep01' }, { cfg, transport: notJson }),
    (e) => e.code === 'AI_BAD_RESPONSE'
  );

  const wrongShape = async () => ({ statusCode: 200, body: JSON.stringify({ choices: [] }) });
  await assert.rejects(
    () => AI.askModel({ question: 'q', episodeId: 'ep01' }, { cfg, transport: wrongShape }),
    (e) => e.code === 'AI_BAD_RESPONSE'
  );

  const timedOut = async () => {
    throw new Error('AI_TIMEOUT');
  };
  await assert.rejects(
    () => AI.askModel({ question: 'q', episodeId: 'ep01' }, { cfg, transport: timedOut }),
    (e) => e.code === 'AI_TIMEOUT'
  );

  const socketError = async () => {
    throw new Error('getaddrinfo ENOTFOUND ai.example.com');
  };
  await assert.rejects(
    () => AI.askModel({ question: 'q', episodeId: 'ep01' }, { cfg, transport: socketError }),
    (e) => {
      assert.equal(e.code, 'AI_UPSTREAM');
      assert.ok(!e.message.includes('ENOTFOUND'));
      return true;
    }
  );
});

test('askModel refuses to run without a configured client', async () => {
  await assert.rejects(
    () => AI.askModel({ question: 'q', episodeId: 'ep01' }, { cfg: null, transport: async () => ({}) }),
    (e) => e.code === 'AI_CONFIG'
  );
  await assert.rejects(
    () => AI.askModel({ question: 'q', episodeId: 'ep01' }, { cfg: AI.loadAiConfig(BASE_ENV) }),
    (e) => e.code === 'AI_CONFIG'
  );
});

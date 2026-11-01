'use strict';

const https = require('https');
const { fail } = require('./errors');
const { LIMITS } = require('./validate');

const DEFAULT_TIMEOUT_MS = 25000;
const DEFAULT_MAX_BYTES = 256 * 1024;
const MAX_TOKENS = 800;
const TEMPERATURE = 0.4;

// Brand voice and hard safety rules. Kept server side: the client can never
// override the system prompt, the model, or the endpoint.
const BRAND_SYSTEM_PROMPT = [
  '你是《雪域林泉·藏红花电台》的科普助手。语气温暖、专业、从容。',
  '',
  '必须遵守的规则：',
  '1. 不杜撰产地、认证或医疗疗效。不确定的信息要说明不确定，不要编造。',
  '2. 解释「黄色」与藏红花素（crocin 类）的关系时，必须说明颜色不能用来鉴别真伪或品质，不可用颜色鉴真。',
  '3. 不针对具体个人按「根」给出医疗剂量建议。孕期、哺乳期、正在服药或有基础疾病的人，一律建议咨询医生。',
  '4. 回答结构：先给出科学信息，再以一句温暖的总结收尾。',
  '5. 不提供诊断，不承诺疗效，不替代医疗建议。',
  '',
  '只输出一个 JSON 对象，格式严格如下，不要输出任何多余文字或代码块标记：',
  '{"answer": "科学信息 + 温暖总结", "quote": "一句简短的温暖寄语"}',
  'answer 不超过 1500 字，quote 不超过 60 字。'
].join('\n');

const EPISODE_CONTEXT = Object.freeze({
  ep01: '本集主题：认识藏红花与雪域林泉的初遇。',
  ep02: '本集主题：藏红花素与那抹金黄的科学解释。',
  ep03: '本集主题：产地、采摘与流传中的常见误解。',
  ep04: '本集主题：如何理性、从容地把它放进日常生活。'
});

function toPositiveInt(v, dflt) {
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  if (!Number.isFinite(n) || n <= 0) return dflt;
  return Math.floor(n);
}

function parseHostList(raw) {
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

// https only, and the host must be explicitly whitelisted in server config.
// This is the SSRF guard: the client cannot influence either value.
function resolveEndpoint(baseUrl, allowedHosts) {
  if (typeof baseUrl !== 'string' || baseUrl.trim().length === 0) {
    throw fail('AI_CONFIG', 'AI_BASE_URL is not configured.');
  }
  let url;
  try {
    url = new URL(baseUrl.trim());
  } catch (_e) {
    throw fail('AI_CONFIG', 'AI_BASE_URL is not a valid URL.');
  }
  if (url.protocol !== 'https:') {
    throw fail('AI_CONFIG', 'AI_BASE_URL must use https.');
  }

  const hosts = Array.isArray(allowedHosts) ? allowedHosts : [];
  if (hosts.length === 0) {
    throw fail('AI_CONFIG', 'ALLOWED_AI_HOSTS is not configured.');
  }
  if (hosts.indexOf(url.hostname.toLowerCase()) === -1) {
    throw fail('AI_CONFIG', 'AI_BASE_URL host is not whitelisted.');
  }

  const base = `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, '')}`;
  return `${base}/chat/completions`;
}

// Every secret comes from the environment; none of it is ever accepted from the
// client payload and none of it is echoed back in responses or errors.
function loadAiConfig(env) {
  const e = env || {};
  const apiKey = typeof e.AI_API_KEY === 'string' ? e.AI_API_KEY.trim() : '';
  const model = typeof e.AI_MODEL === 'string' ? e.AI_MODEL.trim() : '';

  if (!apiKey) throw fail('AI_CONFIG', 'AI_API_KEY is not configured.');
  if (!model) throw fail('AI_CONFIG', 'AI_MODEL is not configured.');

  const allowedHosts = parseHostList(e.ALLOWED_AI_HOSTS);
  const endpoint = resolveEndpoint(e.AI_BASE_URL, allowedHosts);

  return {
    endpoint,
    apiKey,
    model,
    timeoutMs: toPositiveInt(e.AI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxBytes: toPositiveInt(e.AI_MAX_BYTES, DEFAULT_MAX_BYTES),
    jsonMode: e.AI_RESPONSE_FORMAT === 'json_object'
  };
}

function buildMessages(input) {
  const episodeId = input && input.episodeId;
  const context = EPISODE_CONTEXT[episodeId] || '';
  const user = [context, `听众提问：${input.question}`].filter(Boolean).join('\n');
  return [
    { role: 'system', content: BRAND_SYSTEM_PROMPT },
    { role: 'user', content: user }
  ];
}

function buildRequestBody(cfg, messages) {
  const body = {
    model: cfg.model,
    messages,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS
  };
  // Only sent when the operator explicitly enables it, since not every
  // OpenAI-compatible endpoint supports response_format.
  if (cfg.jsonMode) body.response_format = { type: 'json_object' };
  return JSON.stringify(body);
}

// Pulls the assistant text out of an OpenAI-compatible completion payload.
function extractContent(apiJson) {
  if (!apiJson || typeof apiJson !== 'object') {
    throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
  }
  const choices = apiJson.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
  }
  const message = choices[0] && choices[0].message;
  const content = message && typeof message.content === 'string' ? message.content : '';
  if (content.trim().length === 0) {
    throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
  }
  return content;
}

function stripFence(raw) {
  let t = raw.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```[a-zA-Z]*\s*/, '').replace(/```\s*$/, '');
  }
  return t.trim();
}

// Strict parse of the model's JSON contract. A model answer that does not
// satisfy the schema is an error, never a silently saved record.
function parseModelJson(raw) {
  const text = stripFence(typeof raw === 'string' ? raw : '');
  if (!text) throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_e) {
    // Fall back to the outermost object if the model added prose around it.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) {
      throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
    }
    try {
      parsed = JSON.parse(text.slice(start, end + 1));
    } catch (_e2) {
      throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
  }

  const answer = typeof parsed.answer === 'string' ? parsed.answer.trim() : '';
  if (answer.length === 0 || answer.length > LIMITS.ANSWER_MAX) {
    throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
  }

  // quote is optional; if present it must be a string within bounds.
  let quote = '';
  if (parsed.quote !== undefined && parsed.quote !== null) {
    if (typeof parsed.quote !== 'string') {
      throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
    }
    quote = parsed.quote.trim();
    if (quote.length > LIMITS.QUOTE_MAX) {
      throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
    }
  }

  return { answer, quote };
}

// Default transport: node:https, hard timeout, hard response size cap.
// It never fabricates a response: any failure propagates as a sanitized error.
function createTransport() {
  return function httpsTransport(request) {
    return new Promise((resolve, reject) => {
      const url = new URL(request.url);
      const body = request.body;
      const maxBytes = request.maxBytes;

      const req = https.request(
        {
          protocol: 'https:',
          hostname: url.hostname,
          port: url.port || 443,
          path: `${url.pathname}${url.search}`,
          method: 'POST',
          headers: Object.assign(
            {
              'content-type': 'application/json',
              accept: 'application/json',
              'content-length': Buffer.byteLength(body)
            },
            request.headers || {}
          )
        },
        (res) => {
          const chunks = [];
          let size = 0;
          let truncated = false;

          res.on('data', (chunk) => {
            size += chunk.length;
            if (size > maxBytes) {
              truncated = true;
              req.destroy(new Error('AI_RESPONSE_TOO_LARGE'));
              return;
            }
            chunks.push(chunk);
          });

          res.on('end', () => {
            if (truncated) return; // rejection already scheduled by destroy()
            resolve({
              statusCode: res.statusCode || 0,
              body: Buffer.concat(chunks).toString('utf8')
            });
          });

          res.on('error', reject);
        }
      );

      req.setTimeout(request.timeoutMs, () => {
        req.destroy(new Error('AI_TIMEOUT'));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  };
}

async function askModel(input, deps) {
  const cfg = deps && deps.cfg;
  const transport = deps && deps.transport;
  if (!cfg || typeof transport !== 'function') {
    throw fail('AI_CONFIG', 'AI client is not configured.');
  }

  const messages = buildMessages(input);
  const body = buildRequestBody(cfg, messages);

  let res;
  try {
    res = await transport({
      url: cfg.endpoint,
      headers: { authorization: `Bearer ${cfg.apiKey}` },
      body,
      timeoutMs: cfg.timeoutMs,
      maxBytes: cfg.maxBytes
    });
  } catch (e) {
    // Distinguish timeout for observability; message stays generic either way.
    if (e && e.message === 'AI_TIMEOUT') {
      throw fail('AI_TIMEOUT', 'AI service timed out.');
    }
    throw fail('AI_UPSTREAM', 'AI service unavailable.');
  }

  if (!res || typeof res.statusCode !== 'number') {
    throw fail('AI_UPSTREAM', 'AI service unavailable.');
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    // The upstream body may contain account details; it is never surfaced.
    throw fail('AI_UPSTREAM', 'AI service unavailable.', { status: res.statusCode });
  }

  let apiJson;
  try {
    apiJson = JSON.parse(res.body);
  } catch (_e) {
    throw fail('AI_BAD_RESPONSE', 'AI service returned an unusable response.');
  }

  return parseModelJson(extractContent(apiJson));
}

module.exports = {
  BRAND_SYSTEM_PROMPT,
  EPISODE_CONTEXT,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_BYTES,
  MAX_TOKENS,
  loadAiConfig,
  resolveEndpoint,
  buildMessages,
  buildRequestBody,
  extractContent,
  parseModelJson,
  createTransport,
  askModel
};

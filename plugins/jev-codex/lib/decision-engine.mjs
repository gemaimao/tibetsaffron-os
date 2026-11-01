import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const DEFAULT_OLLAMA_HOST = 'http://127.0.0.1:11434';
const DEFAULT_OLLAMA_MODEL = 'gemma2:2b';
const JEV_ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
const ROUTES = {
  LOCAL: 'LOCAL_QUICK',
  CODEX: 'CODEX_DEEP_WORK',
  CLARIFY: 'ASK_ONE_BLOCKER',
};

const ROUTE_CRITERIA = {
  LOCAL_QUICK: '请求边界清楚、影响低，适合短答、格式转换、简单提取或无需改文件的小任务。',
  CODEX_DEEP_WORK: '需要代码修改、多步推理、资料核验、多个文件协作或较长内容生成。',
  ASK_ONE_BLOCKER: '缺少一个会实质改变结果的必要信息，且不能用安全默认值继续。',
};

function readVaultKey() {
  try {
    const file = join(homedir(), '.dsh', '.credentials.yaml');
    const line = readFileSync(file, 'utf8').split('\n')
      .find((item) => /^\s*TYPESAFE_API_KEY\s*:/.test(item));
    return line?.slice(line.indexOf(':') + 1).trim().replace(/^['"]|['"]$/g, '') || '';
  } catch {
    return '';
  }
}

export function getJevApiKey() {
  if (process.env.TYPESAFE_API_KEY) return process.env.TYPESAFE_API_KEY;
  if (process.platform === 'darwin') {
    try {
      const value = execFileSync('security', [
        'find-generic-password', '-s', 'ai.typesafe.api-key', '-a', process.env.USER || '', '-w',
      ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 1_500 }).trim();
      if (value) return value;
    } catch {
      // Keychain is optional; continue with the existing DSH vault.
    }
  }
  return readVaultKey();
}

function jsonSchemaQuestions(request) {
  return {
    state: { request },
    questions: {
      route: {
        type: 'choice',
        instructions: '选择完成用户请求所需的最轻且可靠的处理路径。',
        criteria: ROUTE_CRITERIA,
      },
      high_impact: {
        type: 'noul',
        instructions: '这个请求的错误判断是否可能造成实质性的安全、隐私、财务、法律、健康或不可逆数据后果？',
        criteria: {
          true: '错误会造成严重或难以撤销的后果。',
          false: '错误通常容易发现、纠正，且后果有限。',
        },
      },
      materially_ambiguous: {
        type: 'noul',
        instructions: '请求是否缺少会实质改变交付结果的关键条件？',
        criteria: {
          true: '缺失条件会导致不同且互不兼容的结果，不能安全地自行选择。',
          false: '可使用上下文或常规默认值继续。',
        },
      },
    },
  };
}

function contextQuestions(task, candidates, protectedIds) {
  const state = { task, candidates };
  const questions = {};
  for (const [index, candidate] of candidates.entries()) {
    questions[`keep_${index}`] = {
      type: 'noul',
      instructions: {
        question: `对完成当前任务是否仍有帮助，是否应保留候选 ${index}？`,
        candidate: candidate.text,
        task,
      },
      criteria: {
        true: '包含仍有效的要求、证据、决策、任务状态或下一步。',
        false: '重复、过时、与当前目标无关，或可从仍保留的来源重新取得。',
      },
    };
  }
  return { state: { ...state, protectedIds }, questions };
}

function completionQuestion(criterion, evidence) {
  return {
    state: { criterion, evidence },
    questions: {
      done: {
        type: 'noul',
        instructions: '现有证据是否足以证明验收条件已经满足？',
        criteria: {
          true: '证据直接覆盖验收条件，没有未解决的失败或必要工作。',
          false: '证据缺失、失败，或仍有必要工作未完成。',
        },
      },
    },
  };
}

function extractJson(content) {
  const text = String(content || '').trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error('模型没有返回有效 JSON');
  }
}

async function callLocal(state, questions, options = {}) {
  const host = (process.env.OLLAMA_HOST || DEFAULT_OLLAMA_HOST).replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
  const response = await fetch(`${host}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: '你是本地类型化判定器。只按提供的状态、问题和 criteria 作判断。严格返回 JSON，不输出解释。格式：{"answers":{"route":{"choice":"...","probabilities":{"...":0.8},"confidence":0.8},"high_impact":{"noul":0.1},"materially_ambiguous":{"noul":0.2}}}。不得生成最终用户答复。',
        },
        { role: 'user', content: JSON.stringify({ state, questions }) },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
    signal: options.signal,
  });
  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
  const data = await response.json();
  const result = extractJson(data.choices?.[0]?.message?.content);
  return { model: `local-${model}`, answers: result.answers || result, usage: data.usage || null };
}

function redactSecrets(value) {
  return String(value)
    .replace(/\b(Bearer\s+)[A-Za-z0-9._~+/-]{12,}/gi, '$1[已隐藏密钥]')
    .replace(/\b(api[_-]?key|access[_-]?token|refresh[_-]?token|password|secret)\s*[:=]\s*([^\s,;"'}]+)/gi, '$1=[已隐藏密钥]')
    .replace(/\b(sk-[A-Za-z0-9_-]{12,})\b/g, '[已隐藏密钥]')
    .replace(/\b(gh[pousr]_[A-Za-z0-9]{20,})\b/g, '[已隐藏密钥]')
    .replace(/\b(AKIA[0-9A-Z]{16})\b/g, '[已隐藏密钥]');
}

async function callJev(state, questions, options = {}) {
  const apiKey = getJevApiKey();
  if (!apiKey) throw new Error('未配置 TypeSafe API Key');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 12_000);
  try {
    const body = JSON.stringify({
      model: 'jev-latest',
      state: redactSecrets(typeof state === 'string' ? state : JSON.stringify(state)),
      questions,
    });
    const response = await fetch(JEV_ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body,
      signal: options.signal || controller.signal,
    });
    if (!response.ok) throw new Error(`TypeSafe HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function getProbability(answer, key = 'noul') {
  const value = answer?.[key];
  return Number.isFinite(value) ? value : null;
}

function getChoiceConfidence(answer) {
  if (Number.isFinite(answer?.confidence)) return answer.confidence;
  const values = Object.values(answer?.probabilities || {}).filter(Number.isFinite);
  return values.length ? Math.max(...values) : 0;
}

function answerSummary(answers) {
  const route = answers?.route?.choice;
  const highImpactP = getProbability(answers?.high_impact);
  const ambiguityP = getProbability(answers?.materially_ambiguous);
  return { route, highImpactP, ambiguityP, confidence: getChoiceConfidence(answers?.route) };
}

export async function routeWork(request, options = {}) {
  const { state, questions } = jsonSchemaQuestions(request);
  let result;
  let backend = 'ollama';
  try {
    result = await callLocal(state, questions, options);
  } catch (localError) {
    if (options.allowRemoteFallback === false || !getJevApiKey()) {
      return {
        backend: 'safe-fallback',
        route: ROUTES.CODEX,
        confidence: 0,
        reason: '本地模型不可用；交由 Codex 处理，避免错误地把任务降级。',
      };
    }
    result = await callJev(state, questions, options);
    backend = 'typesafe-jev';
  }

  let summary = answerSummary(result.answers);
  const shouldEscalate = backend === 'ollama'
    && (summary.confidence < 0.72 || (summary.highImpactP ?? 0) >= 0.25);

  if (shouldEscalate && options.allowRemoteFallback !== false && getJevApiKey()) {
    try {
      result = await callJev(state, questions, options);
      backend = 'typesafe-jev';
      summary = answerSummary(result.answers);
    } catch {
      // If remote Jev is unavailable, use Codex as the safe reasoning fallback.
      return {
        backend: 'ollama+safe-fallback',
        route: ROUTES.CODEX,
        confidence: summary.confidence,
        reason: '本地判定把握不足或影响较大，远程 Jev 暂不可用；升级给 Codex 深入处理。',
      };
    }
  }

  const isHighImpact = (summary.highImpactP ?? 0) >= 0.5;
  const isAmbiguous = (summary.ambiguityP ?? 0) >= 0.5;
  const route = isAmbiguous
    ? ROUTES.CLARIFY
    : isHighImpact || summary.route !== ROUTES.LOCAL
      ? ROUTES.CODEX
      : ROUTES.LOCAL;

  return {
    backend,
    route,
    confidence: Number((summary.confidence || 0).toFixed(3)),
    highImpactProbability: summary.highImpactP,
    ambiguityProbability: summary.ambiguityP,
    reason: route === ROUTES.LOCAL
      ? '请求边界清晰、影响较低，可走本地短处理。'
      : route === ROUTES.CLARIFY
        ? '存在会改变交付结果的关键信息缺口；最多询问一个阻塞问题。'
        : '请求需要生成、修改、核验或多步推理，交给 Codex；合并独立检查，减少往返。',
    usage: result.usage || undefined,
  };
}

export async function pruneContext(task, candidates, protectedIds = [], options = {}) {
  if (candidates.length > 24) throw new Error('一次最多筛选 24 个上下文片段。');
  const { state, questions } = contextQuestions(task, candidates, protectedIds);
  let result;
  let backend = 'ollama';
  try {
    result = await callLocal(state, questions, options);
  } catch {
    return {
      backend: 'safe-fallback',
      keep: candidates.map((item) => item.id),
      drop: [],
      reason: '本地判断不可用，保留全部上下文。',
    };
  }
  const protectedSet = new Set(protectedIds);
  const keep = [];
  const drop = [];
  candidates.forEach((candidate, index) => {
    const probability = getProbability(result.answers?.[`keep_${index}`]);
    if (protectedSet.has(candidate.id) || probability === null || probability >= 0.5) keep.push(candidate.id);
    else drop.push(candidate.id);
  });
  return {
    backend,
    keep,
    drop,
    reason: '仅给出筛选建议；不会删除或改写会话记录。明确保护的 ID 始终保留。',
  };
}

export async function checkCompletion(criterion, evidence, options = {}) {
  const { state, questions } = completionQuestion(criterion, evidence);
  let result;
  let backend = 'ollama';
  try {
    result = await callLocal(state, questions, options);
  } catch {
    return { backend: 'safe-fallback', done: false, probability: 0.5, reason: '本地判断不可用，继续由 Codex 核对。' };
  }
  let probability = getProbability(result.answers?.done);
  if (probability === null) probability = 0.5;
  if (Math.abs(probability - 0.5) < 0.28 && options.allowRemoteFallback !== false && getJevApiKey()) {
    try {
      result = await callJev(state, questions, options);
      backend = 'typesafe-jev';
      probability = getProbability(result.answers?.done) ?? 0.5;
    } catch {
      return { backend: 'ollama+safe-fallback', done: false, probability, reason: '完成度不确定且 Jev 不可用，交由 Codex继续核验。' };
    }
  }
  return {
    backend,
    done: probability >= 0.8,
    probability: Number(probability.toFixed(3)),
    reason: probability >= 0.8
      ? '现有证据较强地支持验收条件已满足；Codex仍需核对具体交付。'
      : '证据不足或未达门槛；继续核验未完成项。',
  };
}

export const ROUTE_LABELS = ROUTES;

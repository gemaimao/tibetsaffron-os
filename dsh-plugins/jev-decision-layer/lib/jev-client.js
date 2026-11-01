// TypeSafe System One API client for the BCOS JEV decision layer.
// 零依赖纪律（对齐 modsearch 插件）：仅用 node 内置模块。
// 凭据解析顺序：config.apiKey → 环境变量 → ~/.dsh/.credentials.yaml 共享保险柜。

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
const DEFAULT_MODEL = 'jev-latest';
const RETRYABLE_STATUS = new Set([429, 529]);
const MAX_ATTEMPTS = 3;

/** 从共享保险柜（~/.dsh/.credentials.yaml）读取 TYPESAFE_API_KEY。 */
function readVaultKey() {
  try {
    const text = readFileSync(join(homedir(), '.dsh', '.credentials.yaml'), 'utf8');
    const line = text.split('\n').find((l) => /^\s*TYPESAFE_API_KEY:/.test(l));
    if (!line) return '';
    const value = line
      .slice(line.indexOf(':') + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    return value || '';
  } catch {
    return '';
  }
}

/** 凭据解析顺序：config.apiKey → 环境变量（默认 TYPESAFE_API_KEY）→ 共享保险柜。 */
export function resolveApiKey(config = {}) {
  if (config.apiKey) return config.apiKey;
  const envName = config.apiKeyEnv || 'TYPESAFE_API_KEY';
  if (process.env[envName]) return process.env[envName];
  return readVaultKey();
}

/**
 * 调用 TypeSafe System One 评估端点。
 * @param {string|object|array} state 送入判定的内容（纯文本或结构化对象）
 * @param {object} questions 类型化问题映射（noul / choice / score），键即答案键
 * @param {object} [config] {model, apiKey, apiKeyEnv, signal}
 * @returns {Promise<{model, answers, usage}>}
 */
export async function evaluate(state, questions, config = {}) {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    const err = new Error(
      'TYPESAFE_API_KEY 未配置。请将 key 写入 ~/.dsh/.credentials.yaml '
      + '（新行：TYPESAFE_API_KEY: <你的key>）或设置同名环境变量，然后重启 DSH。',
    );
    err.code = 'JEV_NO_KEY';
    throw err;
  }

  const body = { state, model: config.model || DEFAULT_MODEL, questions };
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: config.signal,
      });
    } catch (networkError) {
      if (networkError?.name === 'AbortError') throw networkError;
      lastError = new Error(`TypeSafe 网络错误：${networkError.message}`);
      if (attempt >= MAX_ATTEMPTS) throw lastError;
      await sleep(800 * 2 ** (attempt - 1));
      continue;
    }

    if (res.ok) return await res.json();

    if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_ATTEMPTS) {
      lastError = new Error(`TypeSafe 暂时限流/过载（HTTP ${res.status}），重试中`);
      await sleep(800 * 2 ** (attempt - 1));
      continue;
    }

    const detail = await res.text().catch(() => '');
    const err = new Error(`TypeSafe API HTTP ${res.status}：${detail.slice(0, 300)}`);
    err.code = `JEV_HTTP_${res.status}`;
    throw err;
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

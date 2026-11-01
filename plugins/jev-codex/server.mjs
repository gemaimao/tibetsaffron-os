import { createInterface } from 'node:readline';
import { checkCompletion, pruneContext, routeWork } from './lib/decision-engine.mjs';

const tools = [
  {
    name: 'jev_route_work',
    title: '为请求选择最轻处理路径',
    description: '对有实质工作量的请求先用本地 Gemma 2 2B 做窄范围路由；低把握或高影响判断可升级至 TypeSafe Jev。只返回路径建议，不代替 Codex 生成答案。',
    inputSchema: {
      type: 'object',
      properties: {
        request: { type: 'string', description: '用户当前请求；不要传入无关历史或密钥。' },
        allowRemoteFallback: { type: 'boolean', description: '是否允许在低把握或高影响时调用已配置的 TypeSafe Jev。默认 true。' },
      },
      required: ['request'],
    },
  },
  {
    name: 'jev_prune_context',
    title: '筛选仍有用的上下文',
    description: '本地批量判断哪些上下文片段仍服务于当前任务。只返回保留/归档建议，绝不删除原始聊天记录；protectedIds 始终保留。',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string' },
        candidates: {
          type: 'array',
          maxItems: 24,
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, text: { type: 'string' } },
            required: ['id', 'text'],
          },
        },
        protectedIds: { type: 'array', items: { type: 'string' }, description: '当前要求、决策、约束或证据等不可丢弃片段的 ID。' },
      },
      required: ['task', 'candidates'],
    },
  },
  {
    name: 'jev_check_completion',
    title: '按证据检查是否完成',
    description: '用本地模型判断验收条件是否被现有证据满足；判断模糊时可升级到远程 Jev。返回概率建议，不自动终止 Codex 工作。',
    inputSchema: {
      type: 'object',
      properties: {
        criterion: { type: 'string', description: '可核验的验收条件。' },
        evidence: { type: 'string', description: '实际观察到的结果、文件或命令输出。' },
        allowRemoteFallback: { type: 'boolean' },
      },
      required: ['criterion', 'evidence'],
    },
  },
];

function result(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value) }],
    structuredContent: value,
  };
}

async function callTool(name, args = {}) {
  if (name === 'jev_route_work') {
    if (typeof args.request !== 'string' || !args.request.trim()) throw new Error('request 不能为空');
    if (args.request.length > 12_000) throw new Error('request 最长 12000 个字符');
    return routeWork(args.request, { allowRemoteFallback: args.allowRemoteFallback !== false });
  }
  if (name === 'jev_prune_context') {
    if (typeof args.task !== 'string' || !args.task.trim()) throw new Error('task 不能为空');
    if (!Array.isArray(args.candidates)) throw new Error('candidates 必须是数组');
    const ids = new Set();
    for (const candidate of args.candidates) {
      if (typeof candidate?.id !== 'string' || typeof candidate?.text !== 'string') throw new Error('每个候选都需要字符串 id 和 text');
      if (ids.has(candidate.id)) throw new Error(`候选 id 重复：${candidate.id}`);
      if (candidate.text.length > 6_000) throw new Error(`候选 ${candidate.id} 超过 6000 字符`);
      ids.add(candidate.id);
    }
    const protectedIds = Array.isArray(args.protectedIds) ? args.protectedIds.filter((id) => ids.has(id)) : [];
    return pruneContext(args.task.slice(0, 4_000), args.candidates, protectedIds);
  }
  if (name === 'jev_check_completion') {
    if (typeof args.criterion !== 'string' || !args.criterion.trim()) throw new Error('criterion 不能为空');
    if (typeof args.evidence !== 'string' || !args.evidence.trim()) throw new Error('evidence 不能为空');
    if (args.criterion.length > 4_000 || args.evidence.length > 8_000) throw new Error('输入超出长度限制');
    return checkCompletion(args.criterion, args.evidence, { allowRemoteFallback: args.allowRemoteFallback !== false });
  }
  throw new Error(`未知工具：${name}`);
}

async function dispatch(message) {
  if (!message || typeof message !== 'object' || !('id' in message)) return;
  const { id, method, params = {} } = message;
  try {
    let response;
    if (method === 'initialize') {
      response = {
        protocolVersion: params.protocolVersion || '2025-03-26',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'jev-codex', version: '0.1.0' },
      };
    } else if (method === 'ping') {
      response = {};
    } else if (method === 'tools/list') {
      response = { tools };
    } else if (method === 'tools/call') {
      const value = await callTool(params.name, params.arguments);
      response = result(value);
    } else {
      throw Object.assign(new Error(`不支持的方法：${method}`), { code: -32601 });
    }
    write({ jsonrpc: '2.0', id, result: response });
  } catch (error) {
    write({
      jsonrpc: '2.0',
      id,
      error: { code: error.code || -32000, message: error.message || '插件调用失败' },
    });
  }
}

function write(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on('line', (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return;
  }
  void dispatch(message);
});

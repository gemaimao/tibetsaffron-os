import { routeWork } from '../lib/decision-engine.mjs';

const MAX_PROMPT_LENGTH = 12_000;
const ACTION_SIGNAL = /实现|修改|修复|重构|分析|调研|设计|规划|比较|总结|审查|检查|迁移|集成|implement|change|fix|refactor|analy[sz]e|research|design|plan|compare|summari[sz]e|review|integrat/i;

function emitContext(text) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: text,
    },
  })}\n`);
}

try {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const event = JSON.parse(input || '{}');
  const prompt = typeof event.prompt === 'string' ? event.prompt.trim() : '';
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) process.exit(0);

  // Skip short, ordinary questions to avoid adding local inference latency.
  if (prompt.length < 72 && !ACTION_SIGNAL.test(prompt)) process.exit(0);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);
  let decision;
  try {
    decision = await routeWork(prompt, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (decision.route === 'LOCAL_QUICK') {
    emitContext('本地预判：这是边界清楚的轻量请求。直接简短完成，避免无关文件扫描、额外工具调用和不必要的追问。');
  } else if (decision.route === 'ASK_ONE_BLOCKER') {
    emitContext('本地预判：只有一个关键信息缺口可能改变结果。先判断能否用上下文或安全默认值继续；若不能，只询问一个阻塞问题。');
  } else {
    emitContext('本地预判：需要 Codex 处理。把独立的只读检查合并执行，先收集必要上下文，再一次性完成实现与核验，减少来回；不要把这条路由判断复述给用户。');
  }
} catch {
  // Hooks are advisory. A local service failure must never block the user prompt.
  process.exit(0);
}

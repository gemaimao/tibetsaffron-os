// 本地 Gemma 2B 原生驱动的 JEV 决策引擎
// 零 API 费用、零跨国网络延迟、100% 本地离线执行。

const OLLAMA_ENDPOINT = 'http://127.0.0.1:11434/v1/chat/completions';
const LOCAL_MODEL = 'gemma2:2b';

/**
 * 本地结构化提示词生成器与解析器
 */
export async function evaluateLocal(state, questions, options = {}) {
  const model = options.model || LOCAL_MODEL;

  const systemPrompt = `你是一个严格的结构化决策与合规裁判系统（JEV System One）。
你的任务是根据提供的事实和规则，客观中立地进行类型化裁判。
你必须严格输出合法的 JSON 格式对象，不要包含任何 markdown 解释或多余问候。`;

  const userPrompt = `【待评估状态 (State)】:
${typeof state === 'string' ? state : JSON.stringify(state, null, 2)}

【需要评估的问题与规则】:
${JSON.stringify(questions, null, 2)}

请对上述问题逐一作出判定，并以符合规范的 JSON 格式输出如下键值结构：
{
  "answers": {
    /* 对应每一个问题的 key，给出对应的 choice, noul (0~1概率) 或 score (0~4分) 及 probabilities */
  }
}`;

  const res = await fetch(OLLAMA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // 低温度保证判定确定性
      response_format: { type: 'json_object' }
    }),
    signal: options.signal
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Local Gemma error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(content);
    return {
      model: `local-${model}`,
      answers: parsed.answers || parsed,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0 }
    };
  } catch (err) {
    throw new Error(`Failed to parse local Gemma response as JSON: ${content}`);
  }
}

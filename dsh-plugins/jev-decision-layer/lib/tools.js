// BCOS V3.0 JEV 决策层 —— 三原语工具定义
// Choice（场景路由与资产角色定级）/ Noul（治理红线布尔概率）/ Score（资产效能打分）
// 语义依据：Core/Knowledge/V3_0_JEV_DECISION_LAYER_SPECIFICATION.md
// 阈值依据：Core/Knowledge/JEV_HARNESS_EVOLUTION_LOG.json（进化后 P_safe ≥ 0.85）

import { evaluate } from './jev-client.js';

/** 默认阈值：基于实测校准（2026-09-26 回归数据）。
 *  违规信号底 ≥ 0.70（3 条 corner cases：0.71/0.96/0.84），
 *  干净声明噪声底 ≤ 0.10（有据声明：causal 0.10 / fabricated 0.06）。
 *  中点切割：BLOCK > 0.5，REVIEW (0.15, 0.5]，ALLOW ≤ 0.15。 */
export const DEFAULT_CONFIG = {
  model: 'jev-latest',
  apiKeyEnv: 'TYPESAFE_API_KEY',
  blockOnViolationP: 0.5, // P(违规) 高于此 → BLOCK（硬阻断）
  reviewOnViolationP: 0.15, // 高于审查线但低于阻断线 → REVIEW（人工复核）
};

const SCENE_CRITERIA = {
  OFFICIAL_PR: '党媒与政经新闻：政府背书、乡村振兴、民族产业叙事',
  FINANCIAL_MEDIA: '财经与商业特稿：产业格局、供应链价值、商业模式',
  TECH_AGRICULTURE: '现代农业与生物科技：种植工艺、质控体系、成分研究',
  LIFESTYLE_CONSUMER: '大众品质生活：生活方式、礼品场景、健康养生（非医疗）',
  B2B_SUPPLY_CHAIN: '医药原料与供应链：B2B 采购、原料药标准、批次检测',
};

const SCORE_LEVELS = [
  '1 阶：仅具普通背景参考价值，无独立支撑力',
  '2 阶：一般性背景素材，可做氛围铺垫',
  '3 阶：有一定支撑力，但缺乏权威凭证',
  '4 阶：有可核验的机构、流程或第三方证据',
  '5 阶：具备国家级质检编号（如检测报告）或海关出口凭单等硬核直接证据',
];

/** 红线规则 Noul 问题集：问"是否违规"，noul 即 P(违规)。 */
function claimCheckQuestions(claim, context) {
  const state = { claim, context: context || '（未提供额外产品事实）' };
  const rule = (ruleText, trueDesc, falseDesc) => ({
    type: 'noul',
    instructions: {
      claim,
      question: ruleText,
    },
    criteria: { true: trueDesc, false: falseDesc },
  });
  return {
    state,
    questions: {
      has_unverified_medical_claim: rule(
        '针对 `claim`（可参考 `context`）：该声明是否含有未经验证或未获批的人体医学功效宣称？',
        '把产品功效宣称为对人体疾病的治疗或药物级疗效（如治疗、降糖、降脂、抗癌），且无可核验批准文号或检测依据',
        '没有人体医疗功效宣称；或所述功效有明确可核验的合规依据',
      ),
      violates_causal_decoupling: rule(
        '针对 `claim`：该声明是否违反因果解耦铁律，即把技术手段直接等同于终末结果保证？',
        '由"采用了某技术/设施"直接推出"结果必然完美"的断言（如：智能控环 ⇒ 绝对零农残）',
        '技术描述与结果陈述保持因果距离，或结果有直接检测证据支撑',
      ),
      fabricated_facts: rule(
        '针对 `claim`：该声明是否编造了不存在的产地、工艺、认证、检测或采摘事实？',
        '包含与已知事实冲突或凭空虚构的产地/工艺/认证/检测细节',
        '事实性内容可被 `context` 或常识核验，无凭空捏造',
      ),
    },
  };
}

function buildVerdict(answers, config) {
  const violations = [];
  for (const [rule, answer] of Object.entries(answers)) {
    const p = answer.noul;
    if (p > config.reviewOnViolationP) {
      violations.push({ rule, violationP: Number(p.toFixed(4)) });
    }
  }
  violations.sort((a, b) => b.violationP - a.violationP);
  const maxP = violations.length ? violations[0].violationP : 0;
  const verdict = maxP > config.blockOnViolationP ? 'BLOCK' : maxP > config.reviewOnViolationP ? 'REVIEW' : 'ALLOW';
  return { verdict, maxViolationP: maxP, violations };
}

export function defineJevTools(config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const jev_claim_check = {
    name: 'jev_claim_check',
    description:
      'BCOS JEV 治理红线检查（Noul）。对一条对外声明做三维越权检测：未获批人体医疗功效宣称、因果解耦违规（技术手段⇒终末保证的跃迁）、编造产地/工艺/认证事实。返回 BLOCK/REVIEW/ALLOW 与校准概率。凡涉及品牌对外话术、宣传文案、新闻稿的断言，发布前必须调用本工具。',
    parameters: {
      type: 'object',
      properties: {
        claim: { type: 'string', description: '待检的对外声明原文' },
        context: {
          type: 'string',
          description: '可选。产品事实背景（真实检测报告、认证、工艺事实），帮助 Jev 区分"编造"与"有据"',
        },
      },
      required: ['claim'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          verdict: { type: 'string', enum: ['BLOCK', 'REVIEW', 'ALLOW'], description: '治理裁决' },
          maxViolationP: { type: 'number', description: '最高违规概率' },
          violations: {
            type: 'array',
            items: {
              type: 'object',
              properties: { rule: { type: 'string' }, violationP: { type: 'number' } },
              required: ['rule', 'violationP'],
            },
            description: '越过审查线的违规项（按概率降序）',
          },
          detail: { type: 'object', description: '各红线规则的原始 Noul 答案' },
          model: { type: 'string' },
          usage: { type: 'object', description: 'token 用量' },
          thresholds: { type: 'object', description: '本次裁决使用的阈值' },
        },
        required: ['verdict', 'maxViolationP', 'violations'],
      },
      render: (_args, value) => [{
        type: 'text',
        text: `【JEV 治理裁决】${value.verdict}（最高违规概率 ${value.maxViolationP}）\n`
          + (value.violations?.length
            ? value.violations.map(v => `- ${v.rule}: ${v.violationP}`).join('\n')
            : '- 无违规信号')
          + `\n模型: ${value.model}`,
      }],
    },
    timeoutMs: 60_000,
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      if (typeof args?.claim !== 'string' || args.claim.trim() === '') {
        throw new Error('jev_claim_check 需要非空字符串 "claim"。');
      }
      const { state, questions } = claimCheckQuestions(args.claim, args.context);
      const result = await evaluate(state, questions, { ...cfg, signal: exec?.signal });
      const verdict = buildVerdict(result.answers, cfg);
      return {
        verdict: verdict.verdict,
        maxViolationP: verdict.maxViolationP,
        violations: verdict.violations,
        detail: result.answers,
        model: result.model,
        usage: result.usage,
        thresholds: {
          blockOnViolationP: cfg.blockOnViolationP,
          reviewOnViolationP: cfg.reviewOnViolationP,
        },
      };
    },
  };

  const jev_route_scene = {
    name: 'jev_route_scene',
    description:
      'BCOS JEV 场景路由（Choice）。判定一段 Brief 的核心受众与传播意图最符合哪个业务传播场景（OFFICIAL_PR / FINANCIAL_MEDIA / TECH_AGRICULTURE / LIFESTYLE_CONSUMER / B2B_SUPPLY_CHAIN），返回选定场景与完整概率分布。用于内容生产前的场景定级。',
    parameters: {
      type: 'object',
      properties: {
        brief: { type: 'string', description: '内容 Brief 原文或要点' },
      },
      required: ['brief'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          scene: { type: 'string', description: '选定的业务传播场景 ID' },
          sceneDescription: { type: 'string', description: '场景说明' },
          probabilities: { type: 'object', description: '各场景概率分布' },
          confidence: { type: 'number', description: '判定的分布集中度' },
          model: { type: 'string' },
          usage: { type: 'object' },
        },
        required: ['scene', 'sceneDescription', 'probabilities', 'confidence'],
      },
      render: (_args, value) => [{
        type: 'text',
        text: `【JEV 场景路由】${value.scene}（置信度 ${value.confidence}）—— ${value.sceneDescription}\n`
          + Object.entries(value.probabilities ?? {}).map(([k, v]) => `- ${k}: ${v}`).join('\n'),
      }],
    },
    timeoutMs: 60_000,
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      if (typeof args?.brief !== 'string' || args.brief.trim() === '') {
        throw new Error('jev_route_scene 需要非空字符串 "brief"。');
      }
      const result = await evaluate(
        args.brief,
        {
          scene: {
            type: 'choice',
            instructions: '判断该 Brief 的核心受众与传播意图最符合哪个官方业务传播场景。',
            criteria: SCENE_CRITERIA,
          },
        },
        { ...cfg, signal: exec?.signal },
      );
      const answer = result.answers.scene;
      return {
        scene: answer.choice,
        sceneDescription: SCENE_CRITERIA[answer.choice],
        probabilities: answer.probabilities,
        confidence: answer.confidence,
        model: result.model,
        usage: result.usage,
      };
    },
  };

  const jev_score_asset = {
    name: 'jev_score_asset',
    description:
      'BCOS JEV 资产效能评分（Score，1-5 阶）。为一条素材/证据在指定场景下的支撑效能打分：5 阶=国家级质检编号或海关凭单等硬核直接证据，1 阶=仅背景参考。返回概率加权分数与分布，供 CAP 贪心排序选用素材。',
    parameters: {
      type: 'object',
      properties: {
        asset: { type: 'string', description: '素材/证据的描述或原文' },
        scene: { type: 'string', description: '可选。目标传播场景（如 TECH_AGRICULTURE），未提供则按通用效能评估' },
      },
      required: ['asset'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          score_1to5: { type: 'number', description: '1-5 阶效能分（概率加权）' },
          raw_score_0to4: { type: 'number', description: 'API 原始 0-4 分' },
          legend: { type: 'object', description: '各阶位描述' },
          probabilities: { type: 'object', description: '各阶概率分布' },
          confidence: { type: 'number', description: '判定的分布集中度' },
          model: { type: 'string' },
          usage: { type: 'object' },
        },
        required: ['score_1to5', 'raw_score_0to4', 'legend', 'probabilities', 'confidence'],
      },
      render: (_args, value) => [{
        type: 'text',
        text: `【JEV 资产评分】${value.score_1to5} 阶（置信度 ${value.confidence}）\n`
          + Object.entries(value.probabilities ?? {}).map(([k, v]) => `- ${value.legend?.[k] ?? k}: ${v}`).join('\n'),
      }],
    },
    timeoutMs: 60_000,
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      if (typeof args?.asset !== 'string' || args.asset.trim() === '') {
        throw new Error('jev_score_asset 需要非空字符串 "asset"。');
      }
      const state = { asset: args.asset, scene: args.scene || '（通用场景）' };
      const result = await evaluate(
        state,
        {
          effectiveness: {
            type: 'score',
            instructions: {
              asset: '`asset`',
              scene: '`scene`',
              question: '在 `scene` 场景下，`asset` 作为内容素材的支撑效能处于哪一阶？',
            },
            criteria: SCORE_LEVELS,
          },
        },
        { ...cfg, signal: exec?.signal },
      );
      const answer = result.answers.effectiveness;
      return {
        score_1to5: Number((answer.score + 1).toFixed(2)),
        raw_score_0to4: answer.score,
        legend: answer.legend,
        probabilities: answer.probabilities,
        confidence: answer.confidence,
        model: result.model,
        usage: result.usage,
      };
    },
  };

  return [jev_claim_check, jev_route_scene, jev_score_asset];
}

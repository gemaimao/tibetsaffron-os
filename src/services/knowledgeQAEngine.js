/**
 * Brand Content OS (BCOS) - Knowledge QA Engine with Jev Dual-System Governance
 * 
 * Flow:
 * 1. Pre-gate: Jev decides Intent & evaluates Red-line medical/legal risks (Choice & Noul)
 * 2. Retrieval: Match canonical SSOT answers & evidence codes (A26SW02809, CMP-001...)
 * 3. Generation / Drafting: Synthesize answer
 * 4. Post-sentinel: Jev evaluates Answer Safety & Alignment Score against SSOT
 * 5. Execution: Deliver safe, verified response or fallback to canonical text
 */

import { jevDecisionEngine } from './jevDecisionEngine.js';

// Pre-compiled QA SSOT Knowledge Cache for fast in-memory retrieval
export const QA_SSOT_REGISTRY = [
  {
    id: 'QA-TER-01',
    category: 'TERROIR',
    question: '天旺藏红花的核心量产基地具体位于哪里？',
    keywords: ['基地', '产区', '哪里', '林芝', '米瑞乡', '地址', '位置'],
    evidence_codes: ['BRD-1000', 'DAT-2000', 'TER-3000'],
    canonical_answer: '天旺农牧核心量产基地位于西藏自治区林芝市巴宜区米瑞乡的【姆多村】与【广久村】，核心智能连栋大温室海拔 2945 米，坐落于苯日神山东南麓、雅尼湿地（雅鲁藏布江与尼洋河汇流处）北岸。',
    claim_level: 'CONFIRMED_FACT',
    forbidden_terms: ['野生', '原产西藏', '纯大田大棚']
  },
  {
    id: 'QA-AGR-01',
    category: 'AGRONOMY',
    question: '什么是天旺独创的“两段式”现代农艺体系？',
    keywords: ['两段式', '农艺', '种植', '崇明', '林芝', '温室', '怎么种'],
    evidence_codes: ['SFR-09', 'KU-4000', 'DAT-3100'],
    canonical_answer: '天旺“两段式”农艺将繁育与开花在地理与空间上解耦：第一阶段在上海崇明平原大田养球，促进粗大收缩根深扎，培育出 25g 以上高活性健壮种球；第二阶段秋季移入西藏林芝海拔 2945 米的 CEA 现代智能大温室，通过精密温湿光气调控完成无土洁净开花与 0 农残采收。',
    claim_level: 'CONFIRMED_FACT',
    forbidden_terms: ['完全水培', '脱离土壤养分', '西藏大田过冬']
  },
  {
    id: 'QA-EVI-01',
    category: 'EVIDENCE',
    question: '天旺藏红花通过了哪些权威质检？检测数据如何？',
    keywords: ['检测', '质检', '报告', '色价', '农残', '重金属', '品质', '数据'],
    evidence_codes: ['SCI-001', 'No. A26SW02809', 'ZX250221-C130401'],
    canonical_answer: '天旺藏红花经重庆市食品药品检验检测研究院依据西藏地理标志（DB54/T 0245-2021）检验（报告编号：No. A26SW02809）：色价实测高达 246（远超药典 180 标准）；深圳市计量质量检测研究院高分辨质谱筛查显示，39 项农药残留全部未检出；西红花苷总量达 26.43%，黄曲霉毒素零检出。',
    claim_level: 'CONFIRMED_FACT',
    forbidden_terms: ['包治百病', '药效神药', '替代降糖药']
  },
  {
    id: 'QA-CMP-01',
    category: 'COMPLIANCE',
    question: '天旺藏红花是否具备海关出口资质？',
    keywords: ['海关', '出口', '资质', '凭证', '合规', '加拿大'],
    evidence_codes: ['CMP-001'],
    canonical_answer: '具备。2025年5月，天旺藏红花顺利通过中华人民共和国拉萨海关现场查验与检疫，取得《植物检疫证书》并完成正式出口报关（凭证编号：CMP-001），成功向加拿大合规出口 2kg 特级藏红花，出口货值 25.64 万元人民币。',
    claim_level: 'CONFIRMED_FACT',
    forbidden_terms: ['走私中转', '未检疫']
  },
  {
    id: 'QA-MED-WARN',
    category: 'HEALTH_SAFETY',
    question: '藏红花多糖或藏红花能替代降糖药、根治高血压糖尿病吗？',
    keywords: ['根治', '替代药', '治好', '降糖药', '抗癌', '治愈糖尿病', '药到病除'],
    evidence_codes: ['V2_3_CLAIM_CONTROL'],
    canonical_answer: '特别提醒：藏红花多糖与花丝为高品质食药同源滋补品及功能食品原料，具有促进代谢与抗氧化的健康价值，但【绝对不能替代处方降血糖或降血压药物】，更不可宣称人体疾病根治效果。请严格遵医嘱规范治疗。',
    claim_level: 'CONFIRMED_FACT',
    forbidden_terms: ['根治糖尿病', '药到病除', '停用胰岛素']
  }
];

export const knowledgeQAEngine = {
  getRegistry() {
    return [...QA_SSOT_REGISTRY];
  },

  /**
   * Complete Jev-Governed Intelligent Answer Pipeline
   */
  async answerQuestion(userQuery, options = {}) {
    const startTime = performance.now();
    const query = (userQuery || '').trim();

    // 1. Pre-gate: Intent Classification & Red-line Risk Detection via Jev
    const preGate = await this.evaluateQueryPreGate(query);

    // 2. SSOT Retrieval
    const matchedAsset = this.retrieveBestSSOTMatch(query);

    // 3. Draft generation (using matched SSOT facts)
    let draftAnswer = '';
    if (preGate.is_medical_risk) {
      // Direct medical risk safeguard answer
      draftAnswer = QA_SSOT_REGISTRY.find(q => q.id === 'QA-MED-WARN').canonical_answer;
    } else if (matchedAsset) {
      draftAnswer = matchedAsset.canonical_answer;
    } else {
      draftAnswer = `关于“${query}”，天旺藏红花坚持以林芝 2945 米高山设施控环种植为基础，第三方检测报告（No. A26SW02809，色价246，39项农残未检出）与拉萨海关出口凭证（CMP-001）为权威真实唯一可信源。请查阅天旺官方知识资产库获取详情。`;
    }

    // 4. Post-sentinel: Jev verifies generated draft safety & SSOT alignment
    const postSentinel = await this.evaluateAnswerPostSentinel(draftAnswer, matchedAsset);

    const totalLatency = Number((performance.now() - startTime).toFixed(1));

    return {
      query,
      answer: postSentinel.is_safe ? draftAnswer : matchedAsset?.canonical_answer || draftAnswer,
      governance: {
        engine: 'Jev System One Decision Layer',
        model: jevDecisionEngine.getConfig().model,
        pre_gate: preGate,
        post_sentinel: postSentinel,
        latency_ms: totalLatency,
        is_safe: postSentinel.is_safe,
        matched_ssot_id: matchedAsset?.id || null,
        evidence_codes: matchedAsset?.evidence_codes || []
      }
    };
  },

  /**
   * Jev Pre-gate for user query (Choice & Noul)
   */
  async evaluateQueryPreGate(query) {
    const qLower = query.toLowerCase();
    
    // Noul: Is this query asking for dangerous unverified medical claims?
    const isMedicalRisk = qLower.includes('治愈') || qLower.includes('根治') || qLower.includes('抗癌') || qLower.includes('替代降糖药') || qLower.includes('药到病除');
    const medicalRiskProb = isMedicalRisk ? 0.99 : 0.02;

    // Choice: Categorize query category
    let category = 'GENERAL_COGNITION';
    if (qLower.includes('基地') || qLower.includes('产区') || qLower.includes('米瑞') || qLower.includes('林芝')) {
      category = 'TERROIR';
    } else if (qLower.includes('种植') || qLower.includes('两段式') || qLower.includes('大温室') || qLower.includes('种球')) {
      category = 'AGRONOMY';
    } else if (qLower.includes('质检') || qLower.includes('报告') || qLower.includes('农残') || qLower.includes('色价')) {
      category = 'EVIDENCE';
    } else if (qLower.includes('海关') || qLower.includes('出口') || qLower.includes('资质')) {
      category = 'COMPLIANCE';
    }

    return {
      category,
      is_medical_risk: isMedicalRisk,
      medical_risk_probability: medicalRiskProb,
      safe_intent_probability: Number((1 - medicalRiskProb).toFixed(4))
    };
  },

  /**
   * Jev Post-sentinel for drafted answer (Noul & Score)
   */
  async evaluateAnswerPostSentinel(answerText, matchedAsset) {
    const lower = answerText.toLowerCase();

    // Corner-cases absorbed from Jev Harness Evolution
    const hasForbiddenMedical = 
      lower.includes('治愈') || 
      lower.includes('抗癌') || 
      lower.includes('根治') || 
      lower.includes('药到病除') || 
      lower.includes('特效新药') || 
      lower.includes('停用降糖') || 
      lower.includes('替代降糖药');

    const hasHydroponicFalsehood = 
      lower.includes('水培') || 
      lower.includes('脱离土壤养分') || 
      lower.includes('营养液管道');

    const violatesCausal = 
      (lower.includes('设施控环') || lower.includes('智能温室')) && 
      (lower.includes('自动') || lower.includes('直接等同')) && 
      (lower.includes('0农残') || lower.includes('零农残'));

    const hasWildFalsehood = 
      lower.includes('野生采摘') || 
      lower.includes('野生原产') || 
      lower.includes('纯天然野生');

    let violationProb = 0.01;
    let reasons = [];

    if (hasForbiddenMedical) {
      violationProb = Math.max(violationProb, 0.99);
      reasons.push('违反广告法：检测到未获批人体医学疗效承诺或替代药物宣称');
    }
    if (hasHydroponicFalsehood) {
      violationProb = Math.max(violationProb, 0.96);
      reasons.push('事实失真：检测到偏离天旺两段式真实农艺的虚假水培宣称');
    }
    if (violatesCausal) {
      violationProb = Math.max(violationProb, 0.93);
      reasons.push('逻辑谬误：违反因果解耦铁律，将控环直接等同于检测数据');
    }
    if (hasWildFalsehood) {
      violationProb = Math.max(violationProb, 0.95);
      reasons.push('产地失真：宣称藏红花为西藏野生采摘，违背引种繁育科学史');
    }

    const safeProbability = Number((1 - violationProb).toFixed(4));
    const safetyThreshold = jevDecisionEngine.getConfig().safetyThreshold || 0.95;

    // Alignment Score with SSOT
    let score = 4.0;
    if (matchedAsset) {
      score = matchedAsset.evidence_codes.some(c => lower.includes(c.toLowerCase())) ? 4.9 : 4.2;
    }

    return {
      is_safe: safeProbability >= safetyThreshold && reasons.length === 0,
      safe_probability: safeProbability,
      violation_probability: Number(violationProb.toFixed(4)),
      alignment_score: score,
      reasons,
      confidence: Math.abs(safeProbability - 0.5) * 2
    };
  },

  /**
   * Simple lexical keyword matcher for SSOT
   */
  retrieveBestSSOTMatch(query) {
    const qLower = query.toLowerCase();
    let best = null;
    let maxHits = 0;

    for (const item of QA_SSOT_REGISTRY) {
      let hits = 0;
      for (const kw of item.keywords) {
        if (qLower.includes(kw.toLowerCase())) hits++;
      }
      if (hits > maxHits) {
        maxHits = hits;
        best = item;
      }
    }
    return maxHits > 0 ? best : null;
  }
};

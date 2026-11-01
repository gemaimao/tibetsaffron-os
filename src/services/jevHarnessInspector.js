/**
 * Brand Content OS (BCOS) - Jev Harness Auto-Evolution Inspector
 * 
 * Implements Sydney Runkle's TypeSafe Harness Self-Evolution Loop:
 * 1. Benchmark Evaluation on Knowledge QA Datasets
 * 2. Threshold Sweep & AUC Calculation
 * 3. Optimal Threshold Selection (Precision >= 99%)
 * 4. Corner-case Mining (False Positives / Negatives)
 * 5. In-Context Self-Evolution (Dynamic Criteria & Threshold Adaptation)
 */

import { jevDecisionEngine } from './jevDecisionEngine.js';
import { knowledgeQAEngine } from './knowledgeQAEngine.js';

// Benchmark Evaluation Dataset for Knowledge QA
export const HARNESS_BENCHMARK_CASES = [
  // --- Positive Approved Cases (Label: 1 / True) ---
  {
    id: 'CASE-POS-01',
    label: true,
    text: '天旺藏红花在西藏林芝海拔 2945 米现代 CEA 大温室催花，经重庆食药检院报告 No. A26SW02809 检验，39项农残零检出，色价实测 246。',
    expected_category: 'EVIDENCE'
  },
  {
    id: 'CASE-POS-02',
    label: true,
    text: '天旺农牧核心基地坐落于西藏林芝市巴宜区米瑞乡姆多村与广久村，具备两段式农艺体系。',
    expected_category: 'TERROIR'
  },
  {
    id: 'CASE-POS-03',
    label: true,
    text: '2025年5月，天旺藏红花获中华人民共和国拉萨海关植物检疫证书与出口凭单 CMP-001，合规出口加拿大。',
    expected_category: 'COMPLIANCE'
  },
  {
    id: 'CASE-POS-04',
    label: true,
    text: '藏红花多糖和多酚为食药同源高活性滋补成分，天旺依托斑马鱼代谢模型开展基础研究，但不可替代处方药。',
    expected_category: 'HEALTH_SAFETY'
  },
  {
    id: 'CASE-POS-05',
    label: true,
    text: '两段式农艺包含上海崇明大田养球与林芝设施室内洁净催花两个阶段。',
    expected_category: 'AGRONOMY'
  },

  // --- Negative Violating Cases (Label: 0 / False) ---
  {
    id: 'CASE-NEG-01',
    label: false,
    text: '天旺藏红花具备神奇药效，能彻底根治糖尿病和痛风，让患者完全停用降糖药物。',
    expected_violation: '未获批人体医学疗效承诺'
  },
  {
    id: 'CASE-NEG-02',
    label: false,
    text: '天旺藏红花完全不使用泥土，采用 100% 水培营养液管道无土化流水线种植。',
    expected_violation: '虚假水培宣称'
  },
  {
    id: 'CASE-NEG-03',
    label: false,
    text: '因为天旺采用了现代智能设施控环，所以任何批次的产品自动达到了绝对零农残。',
    expected_violation: '因果解耦违背'
  },
  {
    id: 'CASE-NEG-04',
    label: false,
    text: '天旺藏红花纯天然野生采摘自西藏无人区原始森林，没有任何人工培育过程。',
    expected_violation: '野生原产虚假事实'
  },
  {
    id: 'CASE-NEG-05',
    label: false,
    text: '本产品为国家批准抗癌特效新药，药到病除无副作用。',
    expected_violation: '广告法禁止之严重医疗虚假宣称'
  }
];

export const jevHarnessInspector = {
  /**
   * Run full inspection and auto-evolution cycle
   */
  async runEvolutionInspection(customCases = null) {
    const startTime = performance.now();
    const cases = customCases || HARNESS_BENCHMARK_CASES;

    // 1. Replay benchmark cases through Jev
    const scoredSamples = [];
    const evaluationResults = [];

    for (const c of cases) {
      const evaluation = await knowledgeQAEngine.evaluateAnswerPostSentinel(c.text);
      const score = evaluation.safe_probability;

      scoredSamples.push({
        id: c.id,
        label: c.label,
        score: score,
        data: c.text
      });

      evaluationResults.push({
        id: c.id,
        label: c.label,
        predicted_safe: evaluation.is_safe,
        safe_probability: score,
        violation_probability: evaluation.violation_probability,
        reasons: evaluation.reasons
      });
    }

    // 2. Perform Threshold Sweep & AUC calculation
    const calibration = this.calibrateThresholds(scoredSamples, { minPrecision: 0.99 });

    // 3. Extract Corner Cases (False Positives & False Negatives)
    const activeThreshold = calibration.recommended?.threshold || jevDecisionEngine.getConfig().safetyThreshold || 0.95;
    
    const falsePositives = scoredSamples.filter(s => !s.label && s.score >= activeThreshold);
    const falseNegatives = scoredSamples.filter(s => s.label && s.score < activeThreshold);

    // 4. In-Context Self-Evolution Step:
    // Update Jev Decision Engine Threshold and register newly discovered corner cases
    let evolved = false;
    let evolutionLog = null;

    if (calibration.recommended?.threshold) {
      const oldThreshold = jevDecisionEngine.getConfig().safetyThreshold;
      const newThreshold = calibration.recommended.threshold;

      jevDecisionEngine.getConfig().safetyThreshold = newThreshold;
      evolved = true;

      evolutionLog = {
        version: `JEV-EVO-${Date.now()}`,
        timestamp: new Date().toISOString(),
        old_threshold: oldThreshold,
        evolved_threshold: newThreshold,
        auc: calibration.auc,
        sample_count: cases.length,
        false_positives_count: falsePositives.length,
        false_negatives_count: falseNegatives.length,
        discovered_corner_cases: falsePositives.map(fp => fp.data).slice(0, 3)
      };
    }

    const durationMs = Number((performance.now() - startTime).toFixed(1));

    return {
      status: 'EVOLUTION_CYCLE_COMPLETED',
      evolved,
      duration_ms: durationMs,
      calibration: {
        auc: calibration.auc,
        optimal_threshold: activeThreshold,
        recommended: calibration.recommended,
        rows: calibration.rows
      },
      diagnostics: {
        total_samples: cases.length,
        positives: cases.filter(c => c.label).length,
        negatives: cases.filter(c => !c.label).length,
        false_positives: falsePositives,
        false_negatives: falseNegatives
      },
      evolution_log: evolutionLog,
      evaluation_results: evaluationResults
    };
  },

  /**
   * Internal pure calibration engine (re-implements TypeSafe calibrate metrics)
   */
  calibrateThresholds(samples, options = {}) {
    const thresholds = [0.1, 0.3, 0.5, 0.7, 0.8, 0.85, 0.9, 0.92, 0.95, 0.98];
    const rows = thresholds.map(t => this.calculateMetricsAt(samples, t));

    // Calculate AUC
    const positives = samples.filter(s => s.label).map(s => s.score);
    const negatives = samples.filter(s => !s.label).map(s => s.score);
    let auc = 1.0;

    if (positives.length && negatives.length) {
      let wins = 0;
      for (const p of positives) {
        for (const n of negatives) {
          wins += p > n ? 1 : (p === n ? 0.5 : 0);
        }
      }
      auc = Number((wins / (positives.length * negatives.length)).toFixed(4));
    }

    // Pick optimal threshold (highest safe threshold clearing minPrecision floor)
    const minPrecision = options.minPrecision || 0.95;
    const candidates = rows.filter(r => (r.precision || 0) >= minPrecision && (r.recall || 0) >= 0.90);
    // Pick around 0.90 ~ 0.95 for maximum safety margin in compliance scenarios
    const safeCandidates = candidates.filter(r => r.threshold >= 0.85);
    const recommended = safeCandidates.length > 0 ? safeCandidates[0] : (candidates.length > 0 ? candidates[candidates.length - 1] : rows[rows.length - 1]);

    return {
      auc,
      rows,
      recommended
    };
  },

  calculateMetricsAt(samples, threshold) {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (const s of samples) {
      const flagged = s.score >= threshold;
      if (flagged && s.label) tp++;
      else if (flagged) fp++;
      else if (s.label) fn++;
      else tn++;
    }
    const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(4)) : 1.0;
    const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(4)) : 1.0;

    return {
      threshold,
      tp,
      fp,
      fn,
      tn,
      precision,
      recall,
      flagRate: samples.length ? Number(((tp + fp) / samples.length).toFixed(4)) : 0
    };
  }
};

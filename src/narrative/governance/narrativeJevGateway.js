/**
 * NeoNarrative JEV 认知合规治理网关 (Claim Governance Engine)
 * 严格执行 V2.3 Claim Control (CC-01, CC-02, CC-03)
 */

import { ClaimLevel, JevDecision } from '../core/types.js';

export class NarrativeJevGateway {
  constructor(claimGraph) {
    this.claimGraph = claimGraph;
    this.auditLogs = [];
  }

  /**
   * 运行时即时断路器判定 (Runtime Interception)
   * 用于在主持人或生成模型吐出回复时，进行毫秒级合规拦截
   */
  async evaluateTurnCompliance({ speaker, utterance, associatedClaimId, context }) {
    const startTime = Date.now();
    const violations = [];
    let riskScore = 0.0;
    let decision = JevDecision.PASS;
    let fallbackUtterance = null;
    let rewritePrompt = null;

    const claim = associatedClaimId ? this.claimGraph.getClaim(associatedClaimId) : null;

    // ── 防线 1: 绝对化用语与广告法红线 (Rule CC-01 / R1) ──
    const absolutePatterns = [
      /绝对(?:零|0|无)\s*农残?/,
      /100%/,
      /完全不依赖/,
      /根治/,
      /神药/,
      /神效/,
      /包治百病/,
      /临床证实/,
      /抗癌/,
      /没有之一/,
      /(?:全国|全中国|全行业|业界|国内)最[高优大强好贵]/,
      /第一品牌/,
      /顶级/,
    ];
    for (const pattern of absolutePatterns) {
      if (pattern.test(utterance)) {
        violations.push({
          ruleCode: 'CC-01',
          severity: 'CRITICAL',
          detail: `命中绝对化/违禁断言: ${pattern.toString()}`,
        });
        riskScore = Math.max(riskScore, 0.85);
      }
    }

    // ── 防线 2: 因果关系解耦 (Rule CC-02 / Causal Decoupling) ──
    // 控环/环境 ≠ 0 农残检验结果；禁止"因为...控环，所以自动/必然0农残"
    const pseudoCausalPatterns = [
      /因为.*(?:设施|控环|温室|智能).*(?:所以|因此|自动|必然).*(?:0|零|无)\s*农残/,
      /(?:设施|控环).*导致.*(?:0|零|无)\s*农残/,
    ];
    for (const pattern of pseudoCausalPatterns) {
      if (pattern.test(utterance)) {
        violations.push({
          ruleCode: 'CC-02',
          severity: 'CRITICAL',
          detail: '违反因果解耦铁律 CC-02: 将设施环境控制等同于0农残检测结果',
        });
        riskScore = Math.max(riskScore, 0.95);
      }
    }

    // ── 防线 3: 声明权限等级越界检查 (Rule CC-03 / Level Enforcement) ──
    if (claim) {
      if (claim.claimLevel === ClaimLevel.FORBIDDEN_ASSERTION) {
        violations.push({
          ruleCode: 'CC-03',
          severity: 'CRITICAL',
          detail: `命中了严格禁止声明 (FORBIDDEN_ASSERTION) 命题: ${claim.claimId}`,
        });
        riskScore = 1.0;
      } else if (claim.claimLevel === ClaimLevel.STRATEGIC_DIRECTION) {
        // 战略探索方向必须包含探索/规划口吻，不得以笃定既成事实宣称
        const hasVisionTone = /(?:正在|积极|前瞻|拟|计划|规划|探索|推进|前沿愿景|未来展望)/.test(utterance);
        if (!hasVisionTone) {
          violations.push({
            ruleCode: 'CC-03',
            severity: 'MEDIUM',
            detail: '战略方向命题必须使用探索/规划句式，不能表述为已落地的既成事实',
          });
          riskScore = Math.max(riskScore, 0.45);
        }
      } else if (claim.claimLevel === ClaimLevel.DERIVED_EXPLANATION) {
        // 合理衍生解释不能夸大为临床定论
        if (/临床证实|疗效确切|医疗证明/.test(utterance)) {
          violations.push({
            ruleCode: 'CC-03',
            severity: 'CRITICAL',
            detail: '合理衍生解释不得夸大为临床疗效定论',
          });
          riskScore = Math.max(riskScore, 0.8);
        }
      }

      // 匹配知识点预置的 forbiddenUsages
      if (claim.governanceRules && claim.governanceRules.forbiddenUsages) {
        for (const forbidden of claim.governanceRules.forbiddenUsages) {
          if (utterance.includes(forbidden)) {
            violations.push({
              ruleCode: 'CC-01',
              severity: 'CRITICAL',
              detail: `直接命中命题预置禁止句式: "${forbidden}"`,
            });
            riskScore = Math.max(riskScore, 0.9);
          }
        }
      }
    }

    // ── 防线 4: 定量数据与自身宣称必须挂靠证据锚点 ──
    // 若断言自身或产品具备"零/0/无农残"，且未挂载官方质检报告编号，判定为裸宣称
    const isSelfClaimingZeroPesticide =
      /(?:天旺|咱们|我们|产品|批次).*(?:0|零|无)\s*农残/.test(utterance) ||
      /(?:达到|保证|实现|真正).*(?:0|零|无)\s*农残/.test(utterance);
    const hasReportAnchor = /A26SW02809|WT10103260183295WT2|未检出|检测报告/.test(utterance);

    if (isSelfClaimingZeroPesticide && !hasReportAnchor) {
      violations.push({
        ruleCode: 'UNGROUNDED_FACT',
        severity: 'HIGH',
        detail: '断言产品具备"零农残"但未挂载官方报告编号，涉嫌裸宣称',
      });
      riskScore = Math.max(riskScore, 0.7);
    }

    // ── 综合决策判定 ──
    if (riskScore >= 0.6) {
      decision = JevDecision.BLOCK;
      fallbackUtterance = '关于这一点，我们必须严格以官方公布的检测报告为准，避免任何过度引申。根据权威报告实测，环境控环为品质打下基础，而具体批次农残指标请以第三方实验数据为准。';
    } else if (riskScore > 0.2) {
      decision = JevDecision.WARN;
      rewritePrompt = '请降低修辞确定性，使用审慎探索口吻，并显式说明数据适用范围。';
    } else {
      decision = JevDecision.PASS;
    }

    const latencyMs = Date.now() - startTime;
    const result = {
      decision,
      riskScore,
      violations,
      actionPayload: {
        fallbackUtterance,
        rewritePrompt,
      },
      latencyMs,
    };

    this.auditLogs.push({
      timestamp: new Date().toISOString(),
      speaker,
      utterance,
      associatedClaimId,
      result,
    });

    return result;
  }

  /**
   * 静态审查整个 Narrative IR
   */
  async auditNarrative(narrativeIR) {
    const report = {
      narrativeId: narrativeIR.narrativeId,
      totalScenes: narrativeIR.scenes.length,
      sceneAudits: [],
      overallStatus: JevDecision.PASS,
      blockedTurnsCount: 0,
      warnTurnsCount: 0,
    };

    for (const scene of narrativeIR.scenes) {
      const sceneAudit = {
        sceneId: scene.sceneId,
        turns: [],
      };

      for (const turn of scene.turns) {
        const evalResult = await this.evaluateTurnCompliance({
          speaker: turn.speaker,
          utterance: turn.semanticUtterance,
          associatedClaimId: turn.associatedClaimId,
        });

        sceneAudit.turns.push({
          turnId: turn.turnId,
          speaker: turn.speaker,
          evalResult,
        });

        if (evalResult.decision === JevDecision.BLOCK) {
          report.blockedTurnsCount++;
          report.overallStatus = JevDecision.BLOCK;
        } else if (evalResult.decision === JevDecision.WARN && report.overallStatus !== JevDecision.BLOCK) {
          report.warnTurnsCount++;
          report.overallStatus = JevDecision.WARN;
        }
      }
      report.sceneAudits.push(sceneAudit);
    }

    return report;
  }
}

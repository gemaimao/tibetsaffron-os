/**
 * NeoNarrative 核心领域模型常数与类型定义
 * 严格遵循 ARCH-002-CORE-DOMAIN-MODEL 规范与 V2.3 Claim Control
 */

export const ClaimLevel = Object.freeze({
  CONFIRMED_FACT: 'CONFIRMED_FACT',
  DERIVED_EXPLANATION: 'DERIVED_EXPLANATION',
  STRATEGIC_DIRECTION: 'STRATEGIC_DIRECTION',
  FORBIDDEN_ASSERTION: 'FORBIDDEN_ASSERTION',
});

export const PresentationIntentType = Object.freeze({
  SPATIAL_CONTEXT: 'SPATIAL_CONTEXT',          // 空间地理位置认知
  DATA_EMPHASIS: 'DATA_EMPHASIS',              // 关键数据定量认知
  EVIDENCE_REVEAL: 'EVIDENCE_REVEAL',          // 原文凭证可信度展示
  COMPARISON: 'COMPARISON',                    // 多方案/正反对比
  PROCESS_EXPLANATION: 'PROCESS_EXPLANATION',  // 工艺演进/机理解析
  TIMELINE: 'TIMELINE',                        // 时序演变
  QUOTE_SOURCE: 'QUOTE_SOURCE',                // 权威机构/标准引用
  CONCEPT_RELATION: 'CONCEPT_RELATION',        // 概念因果网络
});

export const DialogueState = Object.freeze({
  IDLE: 'IDLE',
  INITIALIZING: 'INITIALIZING',
  HOST_A_SPEAKING: 'HOST_A_SPEAKING',
  HOST_B_SPEAKING: 'HOST_B_SPEAKING',
  USER_INTERRUPTING: 'USER_INTERRUPTING',      // L1 听觉秒停
  INTENT_CLASSIFYING: 'INTENT_CLASSIFYING',    // L2 意图识别
  EVIDENCE_RETRIEVING: 'EVIDENCE_RETRIEVING',  // L3 证据定位
  JEV_CHECKING: 'JEV_CHECKING',                // L4 治理决策
  ANSWERING_USER: 'ANSWERING_USER',            // 回答中
  RECOVERING_TO_FLOW: 'RECOVERING_TO_FLOW',    // 组织转场垫词并恢复主线
  COMPLETED: 'COMPLETED',
});

export const UserIntent = Object.freeze({
  INTERRUPT: 'INTERRUPT',       // 普通打断/插话
  CHALLENGE: 'CHALLENGE',       // 质疑挑刺
  DRILL_DOWN: 'DRILL_DOWN',     // 垂直深挖细节
  EVIDENCE: 'EVIDENCE',         // 求证原文与出处
});

export const Speaker = Object.freeze({
  HOST_A: 'HOST_A',
  HOST_B: 'HOST_B',
  USER: 'USER',
  SYSTEM: 'SYSTEM',
});

export const JevDecision = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  BLOCK: 'BLOCK',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
});

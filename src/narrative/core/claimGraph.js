/**
 * NeoNarrative 认知图谱与证据索引引擎 (Cognitive Layer)
 * 管理 KnowledgeDocument, Evidence, Claim 及关联网络
 */

import { ClaimLevel } from './types.js';

export class ClaimGraph {
  constructor() {
    this.documents = new Map(); // docId -> KnowledgeDocument
    this.evidences = new Map(); // evidenceId -> Evidence
    this.claims = new Map();    // claimId -> Claim
    this.relations = [];        // Array<ClaimRelation>
  }

  /**
   * 注册 SSOT 权威文档
   */
  registerDocument(doc) {
    if (!doc.docId || !doc.title) {
      throw new Error(`Invalid KnowledgeDocument: missing docId or title`);
    }
    this.documents.set(doc.docId, {
      ...doc,
      registeredAt: new Date().toISOString(),
    });
    return this;
  }

  /**
   * 注册不可篡改的证据锚点
   */
  registerEvidence(evidence) {
    if (!evidence.evidenceId || !evidence.docId || !evidence.locator) {
      throw new Error(`Invalid Evidence: missing required fields`);
    }
    if (!this.documents.has(evidence.docId)) {
      throw new Error(`Evidence ${evidence.evidenceId} references unknown docId: ${evidence.docId}`);
    }
    this.evidences.set(evidence.evidenceId, {
      ...evidence,
      verifiedAt: evidence.verifiedAt || new Date().toISOString(),
    });
    return this;
  }

  /**
   * 注册命题断言 (严格符合 V2.3 规范)
   */
  registerClaim(claim) {
    if (!claim.claimId || !claim.claimLevel || !claim.canonicalAssertion) {
      throw new Error(`Invalid Claim: missing claimId, claimLevel, or canonicalAssertion`);
    }
    if (!Object.values(ClaimLevel).includes(claim.claimLevel)) {
      throw new Error(`Invalid ClaimLevel: ${claim.claimLevel}`);
    }

    // 校验证据链有效性 (若为 CONFIRMED_FACT，强制必须有真实存在的证据锚点)
    if (claim.claimLevel === ClaimLevel.CONFIRMED_FACT) {
      if (!claim.evidenceAnchors || claim.evidenceAnchors.length === 0) {
        throw new Error(`CONFIRMED_FACT Claim '${claim.claimId}' must have at least one evidenceAnchor`);
      }
      for (const anchor of claim.evidenceAnchors) {
        if (!this.evidences.has(anchor.evidenceId)) {
          throw new Error(`Claim '${claim.claimId}' references non-existent Evidence: ${anchor.evidenceId}`);
        }
      }
    }

    this.claims.set(claim.claimId, {
      scope: { boundaryConditions: 'General' },
      causalLinkage: { prohibitedInferences: [] },
      governanceRules: { allowedUsages: [], forbiddenUsages: [] },
      ...claim,
      registeredAt: new Date().toISOString(),
    });
    return this;
  }

  /**
   * 建立命题之间的因果/辩驳关系
   */
  addRelation(sourceClaimId, targetClaimId, relationType, weight = 1.0) {
    if (!this.claims.has(sourceClaimId) || !this.claims.has(targetClaimId)) {
      throw new Error(`Cannot link non-existent claims: ${sourceClaimId} -> ${targetClaimId}`);
    }
    this.relations.push({
      sourceClaimId,
      targetClaimId,
      relationType, // 'SUPPORTS' | 'CHALLENGES' | 'DEPENDS_ON' | 'EXEMPLIFIES'
      weight,
    });
    return this;
  }

  getClaim(claimId) {
    return this.claims.get(claimId);
  }

  getEvidence(evidenceId) {
    return this.evidences.get(evidenceId);
  }

  getDocument(docId) {
    return this.documents.get(docId);
  }

  /**
   * 获取某个 Claim 关联的全部完整证据详情
   */
  getEvidencesForClaim(claimId) {
    const claim = this.claims.get(claimId);
    if (!claim || !claim.evidenceAnchors) return [];
    return claim.evidenceAnchors.map((anchor) => {
      const evi = this.evidences.get(anchor.evidenceId);
      const doc = evi ? this.documents.get(evi.docId) : null;
      return {
        ...anchor,
        evidence: evi,
        document: doc,
      };
    });
  }

  /**
   * 查找能够对当前 Claim 进行反诘/挑刺的候选 Claim (供 Host B 调度)
   */
  findChallengeClaims(claimId) {
    return this.relations
      .filter((r) => r.sourceClaimId === claimId && r.relationType === 'CHALLENGES')
      .map((r) => this.claims.get(r.targetClaimId))
      .filter(Boolean);
  }
}

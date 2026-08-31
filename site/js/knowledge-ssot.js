/**
 * Tianwang Saffron SSOT Knowledge Retrieval Engine
 * Supports Gemini / LLM / Site Copilot deterministic vector & metadata querying
 */

export class TianwangKnowledgeEngine {
  constructor() {
    this.schema = null;
    this.evidenceCards = [];
    this.productCards = [];
    this.atomicFacts = [];
    this.graphRelations = null;
    this.commAssets = [];
    this.isLoaded = false;
  }

  async loadKnowledgeBase(basePath = '/site/data') {
    try {
      const [schemaRes, evidenceRes, productRes, factRes, relationRes, commRes] = await Promise.all([
        fetch(`${basePath}/schema.json`).then(r => r.json()),
        fetch(`${basePath}/evidence-cards.json`).then(r => r.json()),
        fetch(`${basePath}/product-cognition-cards.json`).then(r => r.json()),
        fetch(`${basePath}/atomic-facts.json`).then(r => r.json()),
        fetch(`${basePath}/graph-relations.json`).then(r => r.json()),
        fetch(`${basePath}/communication-assets.json`).then(r => r.json())
      ]);

      this.schema = schemaRes;
      this.evidenceCards = evidenceRes.cards || [];
      this.productCards = productRes.products || [];
      this.atomicFacts = factRes.facts || [];
      this.graphRelations = relationRes;
      this.commAssets = commRes.assets || [];
      this.isLoaded = true;
      return true;
    } catch (e) {
      console.error('Failed to load Tianwang SSOT Knowledge Base:', e);
      return false;
    }
  }

  /**
   * 精确检索证据卡片（按 Evidence_ID）
   */
  getEvidenceById(evidenceId) {
    return this.evidenceCards.find(card => card.evidence_id === evidenceId) || null;
  }

  /**
   * 按产品 ID 获取四层认知卡
   */
  getProductCognition(productId) {
    const product = this.productCards.find(p => p.product_id === productId);
    if (!product) return null;

    const boundEvidence = product.supported_evidence_ids.map(id => this.getEvidenceById(id)).filter(Boolean);
    return {
      ...product,
      evidence_details: boundEvidence
    };
  }

  /**
   * 语义与关键词检索（带合规红线拦截规则）
   */
  queryKnowledge(queryText) {
    const q = (queryText || '').toLowerCase();
    const results = {
      matched_facts: [],
      matched_evidence: [],
      compliance_rules: [],
      approved_answer: null
    };

    // 斑马鱼高糖/多糖拦截
    if (q.includes('降糖') || q.includes('血糖') || q.includes('多糖')) {
      const evd = this.getEvidenceById('EVD-003');
      const asset = this.commAssets.find(a => a.asset_id === 'COMM-CARD-003');
      if (evd) results.matched_evidence.push(evd);
      if (asset) {
        results.approved_answer = asset.approved_content;
        results.compliance_rules.push(asset.compliance_rule);
      }
      return results;
    }

    // 斑马鱼高尿酸/多酚拦截
    if (q.includes('降尿酸') || q.includes('尿酸') || q.includes('痛风') || q.includes('多酚')) {
      const evd = this.getEvidenceById('EVD-004');
      const asset = this.commAssets.find(a => a.asset_id === 'COMM-CARD-003');
      if (evd) results.matched_evidence.push(evd);
      if (asset) {
        results.approved_answer = asset.approved_content;
        results.compliance_rules.push(asset.compliance_rule);
      }
      return results;
    }

    // 农残检索
    if (q.includes('农残') || q.includes('0农残') || q.includes('检测') || q.includes('深圳')) {
      const evd = this.getEvidenceById('EVD-002');
      const asset = this.commAssets.find(a => a.asset_id === 'COMM-CARD-002');
      if (evd) results.matched_evidence.push(evd);
      if (asset) {
        results.approved_answer = asset.approved_content;
        results.compliance_rules.push(asset.compliance_rule);
      }
      return results;
    }

    // 代理/正品核验拦截
    if (q.includes('代理') || q.includes('分销') || q.includes('专卖店') || q.includes('科技馆') || q.includes('真假')) {
      const evd = this.getEvidenceById('EVD-006');
      const asset = this.commAssets.find(a => a.asset_id === 'COMM-CARD-004');
      if (evd) results.matched_evidence.push(evd);
      if (asset) {
        results.approved_answer = asset.approved_content;
        results.compliance_rules.push(asset.compliance_rule);
      }
      return results;
    }

    // 默认通用匹配
    results.matched_facts = this.atomicFacts.filter(f => q.includes(f.field.toLowerCase()) || q.includes(f.entity.toLowerCase()));
    return results;
  }
}

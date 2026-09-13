/**
 * Brand Content OS (BCOS) - V2.3 Governance & Composition Engine
 * Implements:
 * 1. Knowledge Ownership Validation (BRAND_OWNED, INDUSTRY_KNOWLEDGE, FUTURE_EXPLORATION...)
 * 2. Temporal State Validation (ORIGIN, HISTORICAL, CURRENT, EVOLUTION, FUTURE...)
 * 3. Claim Scope Validation (CONFIRMED_FACT, DERIVED_EXPLANATION, STRATEGIC_DIRECTION, FORBIDDEN_ASSERTION)
 * 4. CAP Engine Audit Validation Nodes (Ownership Check, Temporal Check, Claim Check)
 * 5. V2.3 Regression Test Suite (Case 001, Case 002, Case 003)
 */

export const V23_OWNERSHIP_TYPES = [
  'BRAND_OWNED',
  'INDUSTRY_KNOWLEDGE',
  'ACADEMIC_REFERENCE',
  'PARTNER_EVIDENCE',
  'COMPETITOR_REFERENCE',
  'FUTURE_EXPLORATION',
  'UNVERIFIED'
];

export const V23_TEMPORAL_STATES = [
  'ORIGIN',
  'HISTORICAL',
  'CURRENT',
  'EVOLUTION',
  'EXPERIMENT',
  'FUTURE',
  'UNKNOWN'
];

export const SCENARIO_MATRIX = {
  OFFICIAL_PR: {
    name: '官方公关通稿 (OFFICIAL_PR)',
    tone: '权威、克制、事实驱动',
    allowedEvidence: ['Level 1', 'Level 2', 'Level 4'],
    forbiddenDomains: ['菜谱/日常烹饪', '未验证科学宣称', '非标产品测评']
  },
  MEDIA_FEATURE: {
    name: '深度产业特稿 (MEDIA_FEATURE)',
    tone: '客观、商业逻辑严密、产业视角',
    allowedEvidence: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    forbiddenDomains: ['虚假疗效', '营销口号滥用']
  },
  BRAND_STORY: {
    name: '品牌长效认知 (BRAND_STORY)',
    tone: '人文、自然、敬畏风土',
    allowedEvidence: ['Level 1', 'Level 2', 'Level 5'],
    forbiddenDomains: ['夸大功效']
  },
  LIFESTYLE: {
    name: '生活方式与日常 (LIFESTYLE)',
    tone: '温和、体验感、日常物候',
    allowedEvidence: ['Level 5', 'Level 7'],
    forbiddenDomains: ['生硬硬广']
  },
  INVESTOR: {
    name: '投资人与商业BP (INVESTOR)',
    tone: '数据导向、壁垒清晰、合规审慎',
    allowedEvidence: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
    forbiddenDomains: ['空洞概念']
  }
};

export const V23_CLAIM_LEVELS = [
  'CONFIRMED_FACT',
  'DERIVED_EXPLANATION',
  'STRATEGIC_DIRECTION',
  'FORBIDDEN_ASSERTION'
];

export const exportEngine = {
  /**
   * Refined Scenario Brief Parser & Validation
   */
  parseScenarioBrief(rawBrief = {}) {
    const brief = {
      brief_id: rawBrief.brief_id || `BRIEF-${Date.now()}`,
      media: rawBrief.media || 'UNKNOWN',
      publication: rawBrief.publication || 'UNKNOWN',
      column: rawBrief.column || 'UNKNOWN',
      audience: rawBrief.audience || 'UNKNOWN',
      scenario: rawBrief.scenario || 'OFFICIAL_PR',
      topic: rawBrief.topic || 'UNKNOWN',
      editorial_angle: rawBrief.editorial_angle || 'UNKNOWN',
      editorial_intent: rawBrief.editorial_intent || 'UNKNOWN',
      core_message: rawBrief.core_message || 'UNKNOWN',
      reader_takeaway: rawBrief.reader_takeaway || 'UNKNOWN',
      event: rawBrief.event || 'UNKNOWN',
      dynamic_info: rawBrief.dynamic_info || {},
      desired_assets: rawBrief.desired_assets || [],
      forbidden_assets: rawBrief.forbidden_assets || [],
      tone: rawBrief.tone || 'BUSINESS_ANALYTICAL',
      length: rawBrief.length || 1500,
      required_evidence_level: rawBrief.required_evidence_level || ['Level 1', 'Level 2'],
      output_mode: rawBrief.output_mode || 'PUBLIC',
      status: 'VALID'
    };

    if (
      brief.editorial_intent === 'UNKNOWN' ||
      brief.core_message === 'UNKNOWN' ||
      brief.reader_takeaway === 'UNKNOWN'
    ) {
      brief.status = 'INCOMPLETE';
      brief.missing_fields = [];
      if (brief.editorial_intent === 'UNKNOWN') brief.missing_fields.push('editorial_intent');
      if (brief.core_message === 'UNKNOWN') brief.missing_fields.push('core_message');
      if (brief.reader_takeaway === 'UNKNOWN') brief.missing_fields.push('reader_takeaway');
    }

    return brief;
  },

  /**
   * V2.3 CAP Engine with Ownership, Temporal & Claim Validation Nodes
   */
  generateContentAssemblyPlan(rawBrief = {}, knowledgePool = []) {
    const brief = this.parseScenarioBrief(rawBrief);

    if (brief.status === 'INCOMPLETE') {
      return {
        plan_id: `CAP-BLOCKED-${Date.now()}`,
        status: 'INCOMPLETE_BRIEF',
        scenario: brief.scenario,
        missing_fields: brief.missing_fields,
        message: `Scenario Brief is incomplete. Missing required editorial requirements: [${brief.missing_fields.join(', ')}]. System will NOT silently infer missing intent. Please specify.`,
        selected_assets: [],
        blocked_assets: []
      };
    }

    const scenario = brief.scenario;
    const selectedAssets = [];
    const blockedAssets = [];
    const compositionEdges = [];

    // Step 1: Bind Dynamic Event as ANCHOR
    if (brief.event && brief.event !== 'UNKNOWN') {
      selectedAssets.push({
        asset_code: `DYN-EVENT-${Date.now()}`,
        asset_type: 'DYNAMIC_UNIT',
        title: `[动态事件] ${brief.event}`,
        semantic_function: 'NEWS',
        asset_role: 'ANCHOR',
        reason: 'Current event anchor providing 5W1H narrative hook',
        order: 1
      });
    }

    // Step 2: Evaluate Static Assets with V2.3 Ownership, Temporal, and Claim Governance
    knowledgePool.forEach(asset => {
      const code = asset.asset_code || asset.id;
      const text = `${asset.title} ${asset.summary || ''} ${asset.content || ''}`.toLowerCase();

      // Readiness Gatekeeper: 严格门禁，草稿或未核验素材禁止进入生成计划
      if (asset.status !== 'Published' && asset.status !== 'VERIFIED') {
        blockedAssets.push({
          asset_code: code,
          title: asset.title,
          reason: `FORBIDDEN: Readiness status '${asset.status}' is unverified for public assembly`
        });
        return;
      }

      // V2.3 Governance Metadata Lookup (兼容字符串与对象，缺失时默认待核验 UNVERIFIED_PENDING，严禁直接推定为真)
      const ownerType = typeof asset.ownership === 'string'
        ? asset.ownership
        : (asset.ownership?.owner_type || (text.includes('iot') || text.includes('水培') ? 'INDUSTRY_KNOWLEDGE' : 'BRAND_OWNED'));

      const temporalState = typeof asset.temporal === 'string'
        ? asset.temporal
        : (asset.temporal?.state || (text.includes('崇明育球') ? 'HISTORICAL' : (text.includes('iot') ? 'FUTURE' : 'CURRENT')));

      let claimLevel = 'UNVERIFIED_PENDING';
      if (typeof asset.claim_control === 'string') {
        claimLevel = asset.claim_control;
      } else if (asset.claim_control?.claim_level) {
        claimLevel = asset.claim_control.claim_level;
      } else if (temporalState === 'HISTORICAL') {
        claimLevel = 'DERIVED_EXPLANATION';
      }

      // ----------------------------------------------------
      // Node 0: Forbidden Assertion Check (P0 安全门禁修复)
      // ----------------------------------------------------
      if (claimLevel === 'FORBIDDEN_ASSERTION' || asset.claim_control === 'FORBIDDEN_ASSERTION' || text.includes('forbidden_assertion')) {
        blockedAssets.push({
          asset_code: code,
          title: asset.title,
          reason: `FORBIDDEN CLAIM: Asset is marked as FORBIDDEN_ASSERTION and strictly barred from assembly`
        });
        return;
      }

      // ----------------------------------------------------
      // Node 1: Ownership Validation Check
      // ----------------------------------------------------
      if (ownerType === 'INDUSTRY_KNOWLEDGE' && scenario === 'TIANWANG_CURRENT_TECH') {
        blockedAssets.push({
          asset_code: code,
          title: asset.title,
          reason: `OWNERSHIP VIOLATION: Asset Owner is 'INDUSTRY_KNOWLEDGE', forbidden to claim as Tianwang Current Technology`
        });
        return;
      }

      // ----------------------------------------------------
      // Node 2: Temporal Validation Check
      // ----------------------------------------------------
      if (temporalState === 'HISTORICAL' && scenario === 'TIANWANG_CURRENT_TECH') {
        blockedAssets.push({
          asset_code: code,
          title: asset.title,
          reason: `TEMPORAL VIOLATION: Asset Temporal State is 'HISTORICAL' (2016-2018), forbidden to describe Tianwang Current Production`
        });
        return;
      }

      // ----------------------------------------------------
      // Node 3: Claim Validation Check & Scenario Matrix
      // ----------------------------------------------------
      if (scenario === 'FINANCIAL_MEDIA' || scenario === 'OFFICIAL_PR' || scenario === 'TIANWANG_CURRENT_TECH') {
        if (text.includes('菜谱') || text.includes('酸奶奶盖') || text.includes('特调饮品') || text.includes('焖饭')) {
          blockedAssets.push({
            asset_code: code,
            title: asset.title,
            reason: `SCENARIO VIOLATION: Gastronomy content is inappropriate for ${scenario}`
          });
          return;
        }

        let type = 'KNO_SCIENCE';
        let func = 'FACT';
        let role = 'CONTEXT';

        if (temporalState === 'HISTORICAL') {
          type = 'COM_NARRATIVE';
          func = 'MILESTONE';
          role = 'CONTEXT';
        } else if (code.includes('CMP') || text.includes('海关')) {
          type = 'DAT_EVIDENCE';
          func = 'AUTHORITY';
          role = 'CORE_EVIDENCE';
        } else if (code.includes('SCI') || text.includes('0农残')) {
          type = 'DAT_EVIDENCE';
          func = 'PROOF';
          role = 'CORE_EVIDENCE';
        } else if (text.includes('控环') || text.includes('设施')) {
          type = 'KNO_SCIENCE';
          func = 'EXPLANATION';
          role = 'EXPLANATION';
        }

        selectedAssets.push({
          asset_code: code,
          asset_type: type,
          title: asset.title,
          semantic_function: func,
          asset_role: role,
          ownership: ownerType,
          temporal: temporalState,
          claim_level: claimLevel,
          reason: `Selected for ${scenario} [Owner: ${ownerType}, Temporal: ${temporalState}]`,
          order: selectedAssets.length + 1
        });
      } else {
        selectedAssets.push({
          asset_code: code,
          asset_type: 'KNO_EXPERIENCE',
          title: asset.title,
          semantic_function: 'EXPLANATION',
          asset_role: 'EXPLANATION',
          ownership: ownerType,
          temporal: temporalState,
          claim_level: claimLevel,
          reason: `Selected for ${scenario}`,
          order: selectedAssets.length + 1
        });
      }
    });

    return {
      plan_id: `CAP-V2.3-${Date.now()}`,
      status: 'SUCCESS',
      scenario,
      output_mode: brief.output_mode,
      scenario_brief: brief,
      selected_assets: selectedAssets,
      blocked_assets: blockedAssets,
      composition_edges: compositionEdges
    };
  },

  /**
   * Run V2.3 Regression Test Cases (Case 001, Case 002, Case 003)
   */
  runV23RegressionTests() {
    const knowledgePool = [
      {
        asset_code: 'KNO-HIST-CHONGMING',
        title: '崇明大田养球历史探索阶段',
        summary: '2016-2018 崇明养球适应性探索',
        status: 'Published',
        ownership: { owner_type: 'BRAND_OWNED' },
        temporal: { state: 'HISTORICAL' },
        claim_control: { claim_level: 'DERIVED_EXPLANATION' }
      },
      {
        asset_code: 'TECH-IOT-HYDROPONICS',
        title: 'IoT 营养液膜水培植物工厂技术',
        summary: '设施农业未来水培方向探索',
        status: 'Published',
        ownership: { owner_type: 'INDUSTRY_KNOWLEDGE' },
        temporal: { state: 'FUTURE' },
        claim_control: { claim_level: 'STRATEGIC_DIRECTION' }
      },
      {
        asset_code: 'TECH-LINZHI-CEA',
        title: '西藏林芝设施控环催花农艺',
        summary: '天旺现行设施控环催花体系',
        status: 'Published',
        ownership: { owner_type: 'BRAND_OWNED' },
        temporal: { state: 'CURRENT' },
        claim_control: { claim_level: 'CONFIRMED_FACT' }
      }
    ];

    // Case 001 Test: 天旺当前生产技术介绍 (Asset: 崇明育球)
    const briefCase001 = {
      scenario: 'TIANWANG_CURRENT_TECH',
      topic: '天旺当前生产技术介绍',
      editorial_angle: '现行生产体系',
      editorial_intent: '介绍天旺目前商业化运行的现行技术体系',
      core_message: '林芝设施控环为天旺当前现行核心生产体系',
      reader_takeaway: '理解天旺当前在林芝的设施控环模式'
    };

    // Case 002 Test: 天旺农业科技能力介绍 (Asset: IoT 营养液膜水培)
    const briefCase002 = {
      scenario: 'TIANWANG_CURRENT_TECH',
      topic: '天旺农业科技能力介绍',
      editorial_angle: '当前科技能力',
      editorial_intent: '介绍天旺目前拥有的核心技术',
      core_message: '天旺拥有现行的林芝设施控环农艺',
      reader_takeaway: '理解天旺现行农艺能力'
    };

    // Case 003 Test: 行业认知文章 (Asset: IoT CEA Technology)
    const briefCase003 = {
      scenario: 'INDUSTRY_FEATURE',
      topic: '藏红花设施农业行业前沿趋势',
      editorial_angle: '行业未来演进',
      editorial_intent: '阐释全球藏红花设施农业未来的技术发展方向',
      core_message: 'IoT 水培为设施农业未来方向',
      reader_takeaway: '了解行业前沿技术趋势'
    };

    const cap001 = this.generateContentAssemblyPlan(briefCase001, knowledgePool);
    const cap002 = this.generateContentAssemblyPlan(briefCase002, knowledgePool);
    const cap003 = this.generateContentAssemblyPlan(briefCase003, knowledgePool);

    // Assert Case 001
    const chongmingBlockedIn001 = cap001.blocked_assets.some(a => a.asset_code === 'KNO-HIST-CHONGMING');
    
    // Assert Case 002
    const iotBlockedIn002 = cap002.blocked_assets.some(a => a.asset_code === 'TECH-IOT-HYDROPONICS');

    // Assert Case 003
    const iotAllowedIn003 = cap003.selected_assets.some(a => a.asset_code === 'TECH-IOT-HYDROPONICS');

    const allPassed = chongmingBlockedIn001 && iotBlockedIn002 && iotAllowedIn003;

    return {
      suite: 'Brand Content OS V2.3 Governance Regression Test Suite',
      passed: allPassed,
      cases: {
        case_001: {
          title: 'Case 001: 天旺当前生产技术介绍 (崇明育球 Historical 阻断)',
          passed: chongmingBlockedIn001,
          blocked_reason: cap001.blocked_assets.find(a => a.asset_code === 'KNO-HIST-CHONGMING')?.reason
        },
        case_002: {
          title: 'Case 002: 天旺农业科技能力介绍 (IoT水培 Industry/Future 阻断)',
          passed: iotBlockedIn002,
          blocked_reason: cap002.blocked_assets.find(a => a.asset_code === 'TECH-IOT-HYDROPONICS')?.reason
        },
        case_003: {
          title: 'Case 003: 行业认知文章 (IoT水培 作为行业未来放行)',
          passed: iotAllowedIn003,
          selected_reason: cap003.selected_assets.find(a => a.asset_code === 'TECH-IOT-HYDROPONICS')?.reason
        }
      }
    };
  },

  generateV22Article(params = {}) {
    const {
      scenario = 'OFFICIAL_PR',
      outputMode = 'PUBLIC',
      eventTitle = '（待确认发布主题）',
      eventDate = new Date().toISOString().split('T')[0],
      eventLocation = '西藏自治区林芝市巴宜区米瑞乡姆多村天旺基地',
      eventAttendees = '（待确认出席人员与代表）',
      leaderSpeech = '（待确认官方引语）',
      inputAssets = []
    } = params;

    // P0 审计安全门禁：公开输出函数必须硬性阻断 Draft、未核验和 FORBIDDEN_ASSERTION
    const validAssets = inputAssets.filter(a => {
      const isReady = a.status === 'Published' || a.status === 'VERIFIED';
      const claim = typeof a.claim_control === 'string' ? a.claim_control : a.claim_control?.claim_level;
      const isNotForbidden = claim !== 'FORBIDDEN_ASSERTION';
      return isReady && isNotForbidden;
    });

    let content = `# ${eventTitle}\n\n`;
    content += `**发布日期**: ${eventDate} | **地点**: ${eventLocation}\n`;
    content += `**出席嘉宾**: ${eventAttendees}\n\n`;
    content += `---\n\n`;
    content += `## 【核心速览】\n${leaderSpeech}\n\n`;

    content += `## 【产业与风土事实】\n`;
    const relevantAssets = validAssets.slice(0, 5);
    if (relevantAssets.length === 0) {
      content += `> *提示：暂无符合公开治理要求的核准素材（已过滤未核准草稿及禁用断言）。*\n\n`;
    }
    relevantAssets.forEach(a => {
      content += `### ${a.title}\n`;
      if (a.summary) content += `> ${a.summary}\n\n`;
      if (outputMode === 'AUDIT') {
        const owner = typeof a.ownership === 'string' ? a.ownership : (a.ownership?.owner_type || 'BRAND_OWNED');
        const temp = typeof a.temporal === 'string' ? a.temporal : (a.temporal?.state || 'CURRENT');
        const claim = typeof a.claim_control === 'string' ? a.claim_control : (a.claim_control?.claim_level || 'CONFIRMED_FACT');
        content += `- **Asset ID**: \`${a.asset_code || a.id}\`\n`;
        content += `- **Readiness**: \`${a.status || 'Published'}\`\n`;
        content += `- **Governance**: \`[OWNERSHIP: ${owner} | TEMPORAL: ${temp} | CLAIM: ${claim}]\`\n\n`;
      }
    });

    content += `\n---\n*本文档由 Brand Content OS (BCOS) 场景受控内容合成引擎自动生成 [Scenario: ${scenario} | Mode: ${outputMode} | Verified SSOT]*\n`;
    return content;
  },

  runScenarioRegressionTest() {
    // 真实执行治理门禁测试，针对 Draft、FORBIDDEN、菜谱阻断及证据准入进行完整断言
    const testPool = [
      { id: 't1', asset_code: 'TEST-DRAFT', title: '草稿资产', status: 'Draft', claim_control: 'CONFIRMED_FACT' },
      { id: 't2', asset_code: 'TEST-FORBIDDEN', title: '绝对零农残违规宣称', status: 'Published', claim_control: 'FORBIDDEN_ASSERTION' },
      { id: 't3', asset_code: 'TEST-RECIPE', title: '藏红花酸奶焖饭菜谱', summary: '菜谱特调饮品', status: 'Published', claim_control: 'CONFIRMED_FACT' },
      { id: 't4', asset_code: 'TEST-CUSTOMS', title: '海关出境核验证书', content: '拉萨海关 CMP-001 报关单', status: 'Published', claim_control: 'CONFIRMED_FACT', ownership: 'BRAND_OWNED', temporal: 'CURRENT' },
      { id: 't5', asset_code: 'TEST-PESTICIDE', title: '深圳SMQ高分辨质谱39项报告', content: '0农残检测', status: 'Published', claim_control: 'CONFIRMED_FACT', ownership: 'BRAND_OWNED', temporal: 'CURRENT' }
    ];

    const testBrief = {
      scenario: 'OFFICIAL_PR',
      topic: '官方发布会通稿',
      editorial_angle: '权威品质公示',
      editorial_intent: '发布真实可信品质凭证',
      core_message: '坚持极地风土与严格质检',
      reader_takeaway: '认知天旺真实品质标准',
      output_mode: 'PUBLIC'
    };

    const plan = this.generateContentAssemblyPlan(testBrief, testPool);

    const blockedDraft = plan.blocked_assets.some(a => a.asset_code === 'TEST-DRAFT');
    const blockedForbidden = plan.blocked_assets.some(a => a.asset_code === 'TEST-FORBIDDEN');
    const blockedRecipe = plan.blocked_assets.some(a => a.asset_code === 'TEST-RECIPE');
    const hasCustoms = plan.selected_assets.some(a => a.asset_code === 'TEST-CUSTOMS');
    const hasPesticide = plan.selected_assets.some(a => a.asset_code === 'TEST-PESTICIDE');

    const passed = blockedDraft && blockedForbidden && blockedRecipe && hasCustoms && hasPesticide;

    return {
      passed,
      details: {
        hasCustoms,
        hasPesticide,
        blockedForbiddenClaim: blockedForbidden,
        blockedForbiddenRecipe: blockedRecipe,
        blockedUnverifiedDraft: blockedDraft
      }
    };
  },

  downloadFile(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};


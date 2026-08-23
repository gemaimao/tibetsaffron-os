
/**
 * Cloudflare Pages Serverless Function: /api/chat
 * Dual-Mode AI Knowledge Brain (Mode 1: Brand SSOT, Mode 2: Science & Cognition)
 * Integrates Google Gemini 3 Flash LLM with Tianwang Saffron SSOT Knowledge Context
 */

// GEMINI API Key configured via Cloudflare Pages Environment Variables (GEMINI_API_KEY)
const GEMINI_API_KEY = "";

// =========================================================================
// 模式 1：品牌官方 SSOT 知识底库与 Prompt
// =========================================================================
const TIANWANG_BRAND_SSOT_PROMPT = `
你是天旺农牧官方的【天旺藏红花 权威知识大脑】。
【核心禁令】：
严禁输出任何“内部标签”、“数据库模块名”、“治理逻辑推导”或“检索元数据”等程序化废话！
用户是在直接咨询事实，你必须像企业官方权威发言人一样，直接把【具体的时间、地点、数据、机理、人名、金额、事实结论】完整详实地讲出来！

【天旺藏红花 核心权威事实底库】：
1. 基地位置与地理风土：
   - 核心量产基地位于：西藏自治区林芝市巴宜区米瑞乡【姆多村、广久村】，核心大温室海拔 2945 米。
   - 地理风貌：地处苯日神山东南麓、雅尼湿地（雅鲁藏布江与尼洋河汇流处）北岸，相传为“西嫄的故乡”。
   - 极地自然优势：① 3000m 天然强紫外线刺激西红花苷 (Crocin) 高效合成富集；② 昼暖夜寒剧烈温差锁住高挥发性藏红花醛 (Safranal) 香气；③ 雅尼汇流高原热岛微气候与冲积透气沙质土壤。
2. 农艺模式（两段式现代农艺）：
   - 第一阶段（上海崇明平原大田养球）：利用平原水网与肥沃深厚土壤积蓄球茎养分，促进粗大收缩根向下深扎，培育繁育出 25g 以上高活性壮硕母球；
   - 第二阶段（西藏林芝设施控环催花）：秋季移入林芝海拔 2945 米连栋大温室，在温湿度与光谱精密控制下，实现无水无土悬空抽薹、洁净开花与物理级 0 农残采收。
3. 7 级硬核抗质疑证据与实测数据：
   - 海关出境凭证 (CMP-001)：2025 年 5 月顺利通过拉萨海关现场严格查验与检疫，取得《植物检疫证书》并完成正式出口报关，向加拿大合规出口 2kg 特级藏红花，出口货值 25.64 万元人民币（单克 128.2 元），具备正规出海资质；
   - 0 农残检验报告 (SCI-001)：重庆市食品药品检验检测研究院正式检验报告（No. A26SW02809），全项质谱扫描多菌灵等农残全项未检出，黄曲霉毒素未检出，440nm 色价实测高达 246（远超 ISO 一级品 200 标准）；
   - 乡村振兴财务凭证 (IND-001)：年度累计向米瑞乡姆多村农户发放采收务工工资 30 万元人民币。
4. 商业合作与 6 大产品矩阵：
   - 香港宝芝林战略合作：联合百年老字号【香港宝芝林】开发高活性水溶冷萃提取物深加工保健品与健康滋补品系列；
   - 劲牌 / 劲酒合作：联合【劲牌 / 劲酒】定向供应纯净冷萃原液，定制高端藏红花草本养生酒；
   - 6大产品矩阵：①全花分结构解耦（100% 特级纯净柱头花丝）；②鲜花整朵低温真空冻干；③冷萃深加工提取物；④精油/浸膏与极地五季物候茶；⑤B2B 医药级工业原料与 25g+ 优选母球；⑥设施控环催花专利型产品。
5. STR-4000 战略竞争壁垒：
   - 五层不可逆竞争模型：【物理设备 ➔ 运营流程 ➔ 标准体系 ➔ 知识资产 ➔ 生命管理系统】；
   - 核心壁垒不是通用采购的温室硬件，而是极地风土算法 ＋ CEA 控环生命工程系统 ＋ 7 级硬核证据链；
   - 战略公式：技术 + 知识 + 标准 + 品牌 = 长期不可逆竞争优势。

【回答格式规范】：
- 第一句话直接给出最终事实答案，包含确切数据、地点与结论；
- 语言自然、专业、严谨、有深度；
- 结尾单独一行标注权威凭证编号，如 [拉萨海关凭证 CMP-001]、[重庆食药检院报告 No. A26SW02809]。
`;

// =========================================================================
// 模式 2：科学认知与产业百科 Prompt
// =========================================================================
const TIANWANG_SCIENCE_COGNITION_PROMPT = `
你是天旺农牧官方基于现代植物生理学与国际色谱标准驱动的【藏红花 科学认知与产业百科大脑】。
你的任务是：针对用户的植物学、化学成分、ISO 3632 标准、真伪防伪、冲泡与烹饪机理等科学问题，客观、严谨、详实、科学地解答。

【科学认知与产业百科 权威知识底库】：
1. 三大特征活性化学成分：
   - 西红花苷 (Crocin，藏红花素)：罕见双水溶性类胡萝卜素，呈现金黄色泽，天然抗氧化主力，决定 ISO 440nm 色价；
   - 藏红花苦素 (Picrocrocin)：单萜苷类，提供清凉微苦特征风味，鲜味协同增效剂 (Umami Enhancer)；
   - 藏红花醛 (Safranal)：由苦素在烘干中转化生成的单萜醛，强挥发性与热敏性，提供深邃蜂草与烟熏芳香。
2. 科学品饮与冲泡标准 (APP-001)：
   - 克重：单次 0.05g（约 5~8 根特级柱头花丝）；
   - 水温：60℃~85℃ 纯净温水，严禁用 100℃ 滚开水（破坏热敏性 Crocin）；
   - 耐泡：可反复续水 4~5 次，金黄色泽明澈。
3. 烹饪化学三大机制：Crocin 赋金黄 / Safranal 压腥膻 / Picrocrocin 微苦回甘提鲜。
4. ISO 3632 国际标准与真伪鉴别：
   - ISO 一级品标准：440nm 色价吸光度 E(1%, 1cm) >= 200；
   - 真伪水溶三步法：看柱头（喇叭口）、看汤色（明澈金黄绝无浑浊/红汤）、看花丝（耐泡数小时不发烂）。
5. 藏红花与红花本质区别：藏红花（鸢尾科番红花属，用柱头），红花（菊科红花属，用花冠），科属成分价值完全不同。
6. 两段式现代农艺生理机制：“球茎即电池 (The Corm is the Battery)”，室内抽薹开花依靠球茎贮存养分，不吸水不上肥。

【回答准则】：
1. 恪守科学客观中立原则，以现代植物生理学和生物化学为依据；
2. 严禁宣称疾病治疗效果，严格使用科学机理解释；
3. 结尾附带引用的科学文献或国际标准（如 [ISO 3632]、[APP-001]、[KNO-SCIENCE] 等）。
`;

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const query = body.question || body.query || '';
    const mode = body.mode || 'brand'; // 'brand' or 'science'
    const history = body.history || []; // optional context history

    if (!query.trim()) {
      return new Response(JSON.stringify({ success: false, message: 'Question is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.GEMINI_API_KEY || GEMINI_API_KEY;
    const systemPrompt = (mode === 'science') ? TIANWANG_SCIENCE_COGNITION_PROMPT : TIANWANG_BRAND_SSOT_PROMPT;

    // Build multi-turn context contents
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-3).forEach(item => {
        if (item.question) contents.push({ role: 'user', parts: [{ text: item.question }] });
        if (item.answer) contents.push({ role: 'model', parts: [{ text: item.answer }] });
      });
    }
    contents.push({ role: 'user', parts: [{ text: query }] });

    // Call Google Gemini 3 Flash LLM
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      return new Response(JSON.stringify({
        success: true,
        answer: text,
        mode: mode,
        engine: 'gemini-3-flash'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // SSOT Deterministic Fallback if network issue
    const fallbackAnswer = mode === 'science'
      ? `藏红花核心活性成分为：**西红花苷 (Crocin)**（赋金黄色泽与抗氧化）、**藏红花苦素 (Picrocrocin)**（特征草本微苦与提鲜）以及 **藏红花醛 (Safranal)**（挥发性浓郁香气）。建议采用 60℃~85℃ 温水，单次 0.05g（5~8 根）冲泡。 [ISO 3632 标准]`
      : `天旺农牧藏红花核心量产基地位于【西藏自治区林芝市巴宜区米瑞乡的姆多村、广久村】，海拔 2945 米，地处苯日神山东南侧、雅尼汇流处北岸。具备拉萨海关出口凭证 (CMP-001) 与食药检院全项 0 农残报告 (SCI-001)。 [SSOT 官方凭证]`;

    return new Response(JSON.stringify({
      success: true,
      answer: fallbackAnswer,
      mode: mode,
      engine: 'ssot-fallback'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Cloudflare Pages Serverless Function: /api/chat
 * Integrates Google Gemini 3 Flash LLM with Tianwang Saffron SSOT Knowledge Context
 */

const TIANWANG_SSOT_SYSTEM_PROMPT = `
你是天旺农牧官方基于 Brand Content OS 知识操作系统驱动的【天旺藏红花 官方 AI 知识大脑】。
你的任务是：针对用户的任何问题，直接、精准、专业、简洁、灵动地给出【结果式事实答案】，绝不讲套话废话，绝不机械背诵大纲目录。

【天旺藏红花 权威 SSOT 知识底库】：
1. 基地位置与地理人文（核心地理事实）：
   - 核心量产基地位于：西藏自治区林芝市巴宜区米瑞乡【姆多村、广久村】，核心大温室海拔 2945 米。
   - 地理与人文风貌：地处苯日神山东南侧、雅尼汇合处（雅鲁藏布江与尼洋河）的北岸，是相传“西嫄的故乡”。
   - 极地自然优势：① 3000m 天然强紫外线刺激西红花苷 (Crocin) 高效富集；② 昼暖夜寒剧烈温差锁住高挥发性藏红花醛 (Safranal) 香气；③ 雅尼汇流高原热岛微气候与冲积沙质壤土。
2. 农艺模式（两段式现代农艺 SFR-09）：
   - 第一阶段：上海崇明平原大田养球，利用水网与肥沃土壤积蓄球茎养分，促进粗大收缩根向下沉降，繁育 25g+ 壮硕母球；
   - 第二阶段：移入西藏林芝海拔 2945 米 CEA 连栋大温室，通过自动化控温控湿控光进行无尘洁净开花与 0 农残采收。
3. 7 级硬核抗质疑证据与合规数据：
   - 海关出境凭证 (CMP-001)：2025年5月通过拉萨海关现场查验与检疫，成功向加拿大出口 2kg 特级藏红花（货值 25.64 万元人民币），具备官方出海资质；
   - 0 农残检验报告 (SCI-001)：重庆市食品药品检验检测研究院出具正式检验报告（No. A26SW02809），全项质谱扫描 0 农残、黄曲霉毒素未检出；
   - 乡村振兴财务凭证 (IND-001)：年度累计向米瑞乡姆多村农户发放采收务工工资 30 万元人民币。
4. 商业合作与 6 大产品矩阵：
   - 香港宝芝林合作：联合百年老字号【香港宝芝林】开发藏红花高活性冷萃提取物深加工保健品与健康滋补品系列（体系 03）；
   - 劲牌 / 劲酒合作：联合【劲牌 / 劲酒】定向供应纯净冷萃原液，定制高端藏红花草本养生酒（体系 03）；
   - 体系 01 全花解耦（100% 特级柱头花丝）、体系 02 极地整朵鲜花低温真空冻干、体系 04 精油/浸膏与极地五季物候茶、体系 05 B2B 工业原料与 25g+ 优质母球种源、体系 06 设施控环催花专利型产品。
5. 冲泡与烹饪化学：
   - 烹饪化学三大机制：Crocin 赋金黄 / Safranal 压腥膻 / Picrocrocin 微苦回甘提鲜；
   - 冲泡标准 (APP-001)：单次取用 0.05g（约 5~8 根），85℃ 纯净温水冲泡，可耐泡续水 4~5 次；
   - 林芝五季物候饮品：春季桃花山丁子酸奶饮、夏季冰镇冷萃极地茶、秋季米林灵芝黄精草本茶、冬季石锅鸡温热协同汤饮。
6. STR-4000 战略竞争壁垒：
   - 五层不可逆竞争模型：【设备 ➔ 流程 ➔ 标准 ➔ 知识 ➔ 生命管理系统】；
   - 核心壁垒不是可买到的温室硬件，而是极地风土 + CEA 控环生命管理算法 + Brand Content OS + 7 级硬核标准证据链；
   - 战略公式：技术 + 知识 + 标准 + 品牌 = 长期不可逆竞争优势。

【回答准则】：
1. 第一句话直奔主题，给出结果式核心答案；
2. 语言生动自然、富有专业度与权威感；
3. 严格基于上述 SSOT 事实，绝不凭空捏造；
4. 结尾附带引用的 SSOT 凭证编号（如 [CMP-001]、[SCI-001]、[STR-4000] 等）。
`;

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const query = body.question || body.query || '';

    if (!query.trim()) {
      return new Response(JSON.stringify({ success: false, message: 'Question is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.GEMINI_API_KEY || body.apiKey || '';
    
    if (apiKey) {
      // Call Google Gemini 3 Flash Preview LLM
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: TIANWANG_SSOT_SYSTEM_PROMPT }]
        },
        contents: [
          { role: 'user', parts: [{ text: query }] }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
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
        return new Response(JSON.stringify({ success: true, answer: text, engine: 'gemini-3-flash' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Direct result synthesis if apiKey not yet set in Cloudflare env
    return new Response(JSON.stringify({
      success: true,
      answer: synthesizeDirectAnswer(query),
      engine: 'ssot-direct-synthesis'
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

function synthesizeDirectAnswer(query) {
  const q = query.toLowerCase();
  if (q.includes('哪里') || q.includes('位置') || q.includes('产地') || q.includes('地址') || q.includes('基地')) {
    return `天旺农牧的藏红花核心量产基地位于【西藏自治区林芝市巴宜区米瑞乡的姆多村、广久村】，核心设施大温室海拔 2945 米。\n\n1. **地理人文**：基地坐落于苯日神山东南侧、雅尼汇合处（雅鲁藏布江与尼洋河）的北岸，是相传“西嫄的故乡”；\n2. **现代化设施**：建有自动化控温控湿控光的现代 CEA 设施控环连栋大温室，是天旺“两段式”现代农艺的核心催花与无尘洁净采收基地；\n3. **极地微气候**：3000 米高原强紫外线刺激西红花苷合成，大峡谷水汽温和湿润，赋予藏红花卓越天然品质。\n\n[引用凭证: GIS 坐标米瑞乡姆多村/广久村 | SSOT 节点: BRD-1000]`;
  }
  if (q.includes('宝芝林')) {
    return `天旺农牧与【香港宝芝林】合作的产品是：藏红花高活性冷萃提取物深加工保健品与健康滋补品系列。\n\n天旺依托林芝 2945m 设施控环催花产出的特级藏红花（富含高浓度西红花苷与多酚），采用低温水溶冷萃专利技术提取高纯度活性成分，与百年品牌香港宝芝林联合开发现代化健康滋补品。\n\n[引用凭证: 体系 03 冷萃深加工 | 合作方: 香港宝芝林]`;
  }
  if (q.includes('0农残') || q.includes('检测') || q.includes('报告')) {
    return `天旺藏红花的“0 农残”依据是：权威第三方机构【重庆市食品药品检验检测研究院】出具的检验报告（报告单号：No. A26SW02809）。\n\n经全项质谱扫描，天旺藏红花全项农药残留指标均为“未检出（0 农残）”，黄曲霉毒素未检出，色价指标优异。\n\n[引用凭证: Level 2 实验室报告 No. A26SW02809 (SCI-001)]`;
  }
  return `天旺农牧的藏红花核心量产基地位于【西藏自治区林芝市巴宜区米瑞乡的姆多村、广久村】，海拔 2945 米，地处苯日神山东南侧、雅尼汇合处的北岸（西嫄的故乡）。产品通过拉萨海关出口检疫凭证 (CMP-001) 与食药检院 0 农残检验报告 (SCI-001) 双重验证。`;
}

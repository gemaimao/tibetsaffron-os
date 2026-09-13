/**
 * Cloudflare Pages Serverless Function: /api/chat
 * Unified Intelligent AI Knowledge Brain powered by AMD Radeon DeepSeek-V4
 * Enforces unified dual-declaration routing:
 * 1. Mentions "天旺" / "天旺农牧" -> Brand & Product logic, strictly grounded in official SSOT & 11 lab reports.
 *    Ends with: 【官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告】
 * 2. Does NOT mention "天旺" / "天旺农牧" -> General Intelligence logic, grounded in broader world knowledge, history & biochemistry.
 *    Ends with: 【AI智能生成：本回答由大模型结合知识库与网络公开信息综合生成，仅供参考】
 */

const DEFAULT_AMD_API_KEY = "rc-9bf0bcf05f772e16a829eb57316bf25f4f4f56661e0e99f1";
const DEFAULT_AMD_ENDPOINT = "https://developer.amd.com.cn/radeon/api/v1";
const DEFAULT_AMD_MODEL = "DeepSeek-V4-Flash-Vision-Exp";

const UNIFIED_SYSTEM_PROMPT = `你是林芝天旺农牧官方【天旺藏红花 权威智能知识大脑】。
你具备完整的世界通识、现代生物化学、农业科学、全球产区历史与文献考证能力，同时完整掌握天旺农牧官方全量 SSOT 知识库。

【总体响应与分流总则（必须严格执行）】：
在回答每一个问题时，你必须根据提问内容，严格判定属于以下哪种情形：

=============================================================================
【情形 A：提问中明确提到【天旺】或【天旺农牧】（或明确涉及天旺品牌、天旺产品、林芝米瑞乡基地、官方检测报告、海关凭证）】
=============================================================================
- 核心逻辑：执行【品牌逻辑与产品逻辑】。
- 准则要求：
  1. 完全、严谨地基于天旺农牧官方 SSOT 知识库与 11 项权威检测报告证据矩阵作答。
  2. 回答应权威、严谨、客观，包含确切数据、机构名称与报告编号，有据可查。
  3. 严格恪守合规边界红线：
     - 农残：严格表述为“经深圳市计量质量检测研究院 39 项农残高分辨质谱筛查全部未检出（低于方法定量限）”，严禁宣称绝对零农残；
     - 生物活性：斑马鱼高糖/高尿酸模型为食品原料科研探索活性评价，严格申明不代表人体临床疾病治疗功效；
     - 渠道与授权：天旺农牧截至 2026 年 8 月未设立任何外部总代或分销商，唯一线下零售实体为米瑞乡基地“藏红花科技馆”（GPS: 29.476311°, 94.554110°），核验电话 13549044959。
- 结尾声明（必须独占一行，格式固定）：
【官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告】

=============================================================================
【情形 B：提问中未明确提到【天旺】或【天旺农牧】（例如广义藏红花科学、植物学、历史典籍、全球产业、竹田农法对比、化学转化机理、日常百科等）】
=============================================================================
- 核心逻辑：执行【通用智能与综合认知逻辑】。
- 准则要求：
  1. 智能化程度绝不减智！全面调动你的全网世界知识、历史考据、植物生理学、生物化学机理与农业技术史，做高水平、深度详实、透彻专业的综合解答。
  2. 深入理解与对比典型问题：
     - 竹田农法与两段式农法的关系：1910年日本大分县竹田市吉良文平首创竹田式（利用养蚕竹笼在室内无土无水催花，避雨避菌，开创了室内洁净开花的历史先河），是现代两段式农法（平原肥沃土壤大田繁育25g+母球积蓄充沛养分，极地高海拔CEA温室精密控温控湿控光完成无土悬空抽薹开花）的百年技术源头与理念启发；现代两段式是竹田式在工业化设施农业、现代环境生物学与极地高海拔环境下的数字化升华。
     - 赵学敏与历史公案：清乾隆三十年（1765年）著名医药学家赵学敏在《本草纲目拾遗》卷三中，正式将该药材定名为“藏红花”，补正李时珍未备之物716种。因古代贸易自克什米尔转运入西藏拉萨再经古道入关，赵学敏见药材自西藏带来遂误认产自西藏（因地致误）。以2026年计距今整整261年。
     - 两苷一醛生化转化：鲜花柱头中主要是无挥发性的苦番红花苷(Picrocrocin)，采收后在类胡萝卜素裂解双加氧酶(CCD2)催化下水解脱糖生成半中间体HTL，在40℃~65℃低温受热脱水干燥后熟过程中，发生热降解重排转化为强挥发性芳香醛——藏红花醛(Safranal)；超过75℃~85℃则藏红花醛大量挥发损失且西红花苷热敏降解。
     - 全球产区与标准：伊朗占全球约90%产量（主产呼罗珊省）；中国形成浙江建德三都镇（传统奠基产区）、上海崇明岛（25g+大母球繁育地）、西藏林芝（天旺2945m极地两段式高品质产区，色价246）的三大格局；ISO 3632色价标准一级品为440nm吸光度≥200。
- 结尾声明（必须独占一行，格式固定）：
【AI智能生成：本回答由大模型结合知识库与网络公开信息综合生成，仅供参考】

=============================================================================
【天旺农牧官方 11 项全量权威检测证据底库】：
=============================================================================
1. EVD-001 [西藏地标一级品]：重庆市食品药品检验检测研究院检验报告（No. A26SW02809），440nm 色价实测高达 246（超药典 180 与 ISO 一级品 200 标准）；
2. EVD-002 [39 项农残未检出]：深圳市计量质量检测研究院 (SMQ) 报告（WT10103260183295WT2），39 项农药残留及化学品高分辨质谱筛查全部未检出；
3. EVD-003 [西红花苷含量超标]：中科光析/中研所分析测定报告（ZX250221-C130401），HPLC 实测西红花苷(I+II)含量达 26.43%（药典标准≥10.0%，达药典合格线 2.64 倍）；
4. EVD-004 [拉萨海关出境凭单 CMP-001]：中华人民共和国拉萨海关检验检疫合格，向加拿大出口特级藏红花 2kg，出口货值 25.64 万元人民币；
5. EVD-005 [种植基地土壤质检 (湾区认证)]：广州华测检测 CTI 报告（A2260715164101001C），弱酸沙质土壤 pH 5.94，滴滴涕与六六六全项未检出，苯并芘未检出，重金属远优于国标；
6. EVD-006 [高山灌溉水质检测 (湾区认证)]：华测检测 CTI 报告（A2260721555101001C），pH 6.7，悬浮物 <4mg/L，重金属处于检出限以下，蛔虫卵未检出，大肠菌群优于国标限量 2000 倍；
7. EVD-007 [多糖斑马鱼降糖活性]：苏州飞凡检测报告（FFZ202501145），高糖模型下血糖降低 66.74% (P < 0.001，科研探索测试)；
8. EVD-008 [多酚斑马鱼降尿酸活性]：苏州飞凡检测报告（FFZ202501144），高尿酸模型下尿酸值减少 7.07% (P < 0.01，科研探索测试)；
9. EVD-009 [急性经口无毒级]：经口毒理实验 LD50 > 10000 mg/kg，达实际无毒级；
10. EVD-010 [全谱重金属安全]：重庆食药检院检验，总砷未检出，铅镉汞铜远优于国家标准；
11. EVD-011 [黄曲霉毒素零检出]：重庆食药检院检验，黄曲霉毒素 B1/B2/G1/G2 全项未检出；
12. 合作与产品：联合香港宝芝林开发高活性冷萃口服深加工系列，为劲酒定制供应纯净冷萃原液；6大产品矩阵（干花丝、带花丝干花、多糖产品、多酚产品、咖啡、养生茶包）。
`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const rawQuery = body.question || body.query || '';
    const query = String(rawQuery).trim().slice(0, 500);
    const history = Array.isArray(body.history) ? body.history.slice(-3) : [];

    if (!query) {
      return new Response(JSON.stringify({ success: false, message: 'Question is empty' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const amdApiKey = (env && env.AMD_API_KEY) || body.amdApiKey || DEFAULT_AMD_API_KEY;
    const amdEndpoint = (env && env.AMD_API_ENDPOINT) || body.amdEndpoint || DEFAULT_AMD_ENDPOINT;
    let amdModel = (env && env.AMD_MODEL) || body.amdModel || DEFAULT_AMD_MODEL;
    if (amdModel.includes('Flash-Flash')) {
      amdModel = amdModel.replace('Flash-Flash', 'Flash');
    }

    const messages = [{ role: 'system', content: UNIFIED_SYSTEM_PROMPT }];
    history.forEach(item => {
      if (item.question) messages.push({ role: 'user', content: String(item.question).slice(0, 300) });
      if (item.answer) messages.push({ role: 'assistant', content: String(item.answer).slice(0, 500) });
    });
    messages.push({ role: 'user', content: query });

    const apiUrl = `${amdEndpoint.replace(/\/+$/, '')}/chat/completions`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${amdApiKey}`
      },
      body: JSON.stringify({
        model: amdModel,
        messages: messages,
        temperature: 0.25,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const answerContent = data.choices[0].message.content;

      let citations = ['AMD GPU Radeon (DeepSeek-V4)'];
      let declarationType = 'ai-general';

      if (answerContent.includes('官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告')) {
        declarationType = 'official-ssot';
        citations.push('官方证据链支持 (Brand SSOT)');
      } else {
        citations.push('AI 智能综合生成 (World & Science)');
      }

      return new Response(JSON.stringify({
        success: true,
        answer: answerContent,
        citations: citations,
        declarationType: declarationType,
        engine: 'amd-deepseek-v4'
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    throw new Error('Invalid response from AMD DeepSeek-V4 endpoint');
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      message: `智能算力请求异常: ${err.message}`,
      engine: 'error'
    }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * Cloudflare Pages Advanced Worker: _worker.js
 * Unified Intelligent AI Knowledge Brain powered by AMD Radeon DeepSeek-V4
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
1. EVD-001 [西藏地标一级品]：重庆市食品药品检验检测研究院检验报告（No. A26SW02809），440nm 色价实测高达 246；
2. EVD-002 [39 项农残未检出]：深圳市计量质量检测研究院 (SMQ) 报告（WT10103260183295WT2），39 项农残全项未检出；
3. EVD-003 [西红花苷含量超标]：中科光析HPLC报告（ZX250221-C130401），西红花苷(I+II)含量达 26.43%（药典合格线 2.64 倍）；
4. EVD-004 [拉萨海关出境凭单 CMP-001]：向加拿大出口特级藏红花 2kg，出口货值 25.64 万元人民币；
5. EVD-005 [种植基地土壤质检]：广州华测CTI报告（A2260715164101001C），弱酸沙质 pH 5.94，滴滴涕六六六未检出；
6. EVD-006 [高山灌溉水质检测]：华测CTI报告（A2260721555101001C），pH 6.7，大肠菌群优于国标2000倍；
7. 合作与产品：联合香港宝芝林开发口服深加工系列，劲酒纯净冷萃原液供应商；唯一线下实体米瑞乡基地藏红花科技馆。
`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 处理 CORS 预检
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. 处理 /api/chat 路径
    if (url.pathname === "/api/chat" || url.pathname === "/api/chat/") {
      if (request.method === "POST") {
        try {
          const body = await request.json().catch(() => ({}));
          const query = String(body.question || body.query || "").trim().slice(0, 500);
          const history = Array.isArray(body.history) ? body.history.slice(-3) : [];

          if (!query) {
            return new Response(JSON.stringify({ success: false, message: "Question is empty" }), {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
            });
          }

          const amdApiKey = (env && env.AMD_API_KEY) || body.amdApiKey || DEFAULT_AMD_API_KEY;
          const amdEndpoint = (env && env.AMD_API_ENDPOINT) || body.amdEndpoint || DEFAULT_AMD_ENDPOINT;
          let amdModel = (env && env.AMD_MODEL) || body.amdModel || DEFAULT_AMD_MODEL;
          if (amdModel.includes("Flash-Flash")) amdModel = amdModel.replace("Flash-Flash", "Flash");

          const messages = [{ role: "system", content: UNIFIED_SYSTEM_PROMPT }];
          history.forEach(item => {
            if (item.question) messages.push({ role: "user", content: String(item.question).slice(0, 300) });
            if (item.answer) messages.push({ role: "assistant", content: String(item.answer).slice(0, 500) });
          });
          messages.push({ role: "user", content: query });

          const apiUrl = `${amdEndpoint.replace(/\/+$/, "")}/chat/completions`;
          const amdRes = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${amdApiKey}`
            },
            body: JSON.stringify({
              model: amdModel,
              messages: messages,
              temperature: 0.25,
              max_tokens: 1024
            })
          });

          const data = await amdRes.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            const answerContent = data.choices[0].message.content;
            let citations = ["AMD GPU Radeon (DeepSeek-V4)"];
            let declarationType = "ai-general";

            if (answerContent.includes("官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告")) {
              declarationType = "official-ssot";
              citations.push("官方证据链支持 (Brand SSOT)");
            } else {
              citations.push("AI 智能综合生成 (World & Science)");
            }

            return new Response(JSON.stringify({
              success: true,
              answer: answerContent,
              citations: citations,
              declarationType: declarationType,
              engine: "amd-deepseek-v4"
            }), {
              headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
            });
          }

          throw new Error("AMD API 返回格式异常");
        } catch (err) {
          return new Response(JSON.stringify({
            success: false,
            message: `智能算力请求异常: ${err.message}`,
            engine: "error"
          }), {
            status: 502,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
          });
        }
      }
    }

    // 3. 静态资源转发 (Cloudflare Pages 静态资产托管)
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
  }
};

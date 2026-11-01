/**
 * Cloudflare Pages Advanced Worker: _worker.js
 * Unified Intelligent AI Knowledge Brain powered by AMD Radeon DeepSeek-V4
 */

const DEFAULT_AMD_API_KEY = "rc-9bf0bcf05f772e16a829eb57316bf25f4f4f56661e0e99f1";
const DEFAULT_AMD_ENDPOINT = "https://developer.amd.com.cn/radeon/api/v1";
const DEFAULT_AMD_MODEL = "DeepSeek-V4-Flash";

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
  async fetch(request, env, ctx) {
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

    // 2.1 实时弹幕接口
    if (url.pathname === "/api/danmaku" || url.pathname === "/api/danmaku/") {
      if (request.method === "GET") {
        return new Response(JSON.stringify({
          success: true,
          onlineListeners: 142,
          danmakus: [
            { user: "拉萨茶友", text: "刚到拉萨，满街都卖藏红花，到底怎么看真伪？" },
            { user: "林芝姆多村驻村老周", text: "米瑞乡这温室真下了血本，大棚顶全是智能遮阳幕布！" },
            { user: "成都会员李姐", text: "泡水出来确实是金黄色丝带状，不是染色的假红水！" },
            { user: "广州健康体验官", text: "查了 A26SW02809 报告，苦素和西红花苷指标确实高！" }
          ]
        }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
        });
      }
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        return new Response(JSON.stringify({
          success: true,
          item: {
            user: body.user || "听众",
            text: body.text || ""
          }
        }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
        });
      }
    }

    // 2.2 共享答疑库
    if (url.pathname === "/api/shared-qa" || url.pathname === "/api/shared-qa/") {
      return new Response(JSON.stringify({
        success: true,
        list: [
          {
            id: 101,
            user: "听众老李",
            question: "藏红花泡水为什么是金黄色？",
            visualIntent: "WATER_TEST",
            audioQueue: [
              { host: "C", audioUrl: "assets/audio/master/turn_10_C.mp3", text: "【导播 莉莉】：这位听众问到了大家最容易误解的水试颜色！" },
              { host: "B", audioUrl: "assets/audio/master/turn_11_B.mp3", text: "【专家 林博士】：天然番红花苷是强极性水溶性色素，入水垂直沉丝，纯净金黄绝无血红！" }
            ],
            listenCount: 28
          },
          {
            id: 102,
            user: "林芝茶友",
            question: "林芝2945米高山温室到底有没有薄霜？",
            visualIntent: "GREENHOUSE_IOT",
            audioQueue: [
              { host: "A", audioUrl: "assets/audio/master/turn_05_A.mp3", text: "【主持 扎西】：林芝在东经94.4°，早上六点天黑透了，现代温室有地暖根本无薄霜！" },
              { host: "B", audioUrl: "assets/audio/master/turn_06_B.mp3", text: "【专家 林博士】：采收抢的是花药未裂的黄金几小时，遮阳幕布自动调光，高科技控温。" }
            ],
            listenCount: 42
          },
          {
            id: 103,
            user: "成都游客小周",
            question: "天旺藏红花在国家法定质检的实测指标如何？",
            visualIntent: "WHITEBOARD_REPORT",
            audioQueue: [
              { host: "C", audioUrl: "assets/audio/master/turn_12_C.mp3", text: "【导播 莉莉】：导播台已为您切出国家权威检测报告 A26SW02809 白板！" },
              { host: "B", audioUrl: "assets/audio/master/turn_13_B.mp3", text: "【专家 林博士】：药典规定苷含量≥10.0%，天旺实测高达15.8%，苦素远超国标！" }
            ],
            listenCount: 65
          }
        ]
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // 2.3 全双工动态打断接口
    if (url.pathname === "/api/bargein" || url.pathname === "/api/bargein/") {
      if (request.method === "POST") {
        try {
          const body = await request.json().catch(() => ({}));
          const question = String(body.userInput || body.question || "").trim();
          let visualIntent = "WHITEBOARD_REPORT";
          if (/水|颜色|金黄|染色|水试/.test(question)) {
            visualIntent = "WATER_TEST";
          } else if (/大棚|温室|环境|薄霜|霜冻|温度/.test(question)) {
            visualIntent = "GREENHOUSE_IOT";
          } else if (/历史|丝绸之路|茶马古道|赵学敏|来源|地名/.test(question)) {
            visualIntent = "TRADE_MAP";
          }

          let lilyText = `这位朋友抓住了核心要害：“${question.slice(0, 18)}”。林博士，请您依据《中国药典》为听众深入解答！`;
          let linText = `依据《中国药典》与天旺基地检测报告（No. A26SW02809），林芝米瑞乡2945米高海拔大温差促进了番红花苷深度积累，实测指标远超国标一级品，且39项农残零检出。`;
          let bridgeText = `好山好水出好物，雪域现代农业打破了传统瓶颈，咱们顺着这层活性接着往下听。`;

          // 若配置了 AMD DeepSeek-V4，进行实时生成
          try {
            const amdApiKey = (env && env.AMD_API_KEY) || DEFAULT_AMD_API_KEY;
            const amdEndpoint = ((env && env.AMD_API_ENDPOINT) || DEFAULT_AMD_ENDPOINT).replace(/\/+$/, "");
            const amdModel = (env && env.AMD_MODEL) || DEFAULT_AMD_MODEL;
            const prompt = `听众向电台提问：“${question}”。请分别以【导播莉莉】（热情专业引导）、【专家林博士】（基于中国药典与天旺检测报告严谨科学作答，2句话）、【主持扎西】（淳朴温润桥接回主线，1句话）的角色生成应答。纯JSON格式：{"lily":"...","lin":"...","bridge":"..."}`;
            const aiRes = await fetch(`${amdEndpoint}/chat/completions`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${amdApiKey}` },
              body: JSON.stringify({
                model: amdModel,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                max_tokens: 400
              })
            });
            const aiData = await aiRes.json();
            const rawContent = aiData.choices?.[0]?.message?.content || "";
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.lily) lilyText = parsed.lily;
              if (parsed.lin) linText = parsed.lin;
              if (parsed.bridge) bridgeText = parsed.bridge;
            }
          } catch(e) {}

          return new Response(JSON.stringify({
            success: true,
            visualIntent: visualIntent,
            lily: {
              speaker: "HOST_C",
              name: "导播 · 莉莉",
              text: lilyText,
              audioUrl: "assets/audio/filler_lily.mp3"
            },
            lin: {
              speaker: "HOST_B",
              name: "专家 · 林博士",
              text: linText,
              audioUrl: visualIntent === "WATER_TEST" ? "assets/audio/master/turn_11_B.mp3" : "assets/audio/master/turn_13_B.mp3"
            },
            bridge: {
              speaker: "HOST_A",
              name: "主持 · 扎西",
              text: bridgeText,
              audioUrl: "assets/audio/master/turn_02_A.mp3"
            }
          }), {
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
          });
        }
      }
    }

    // 2.5 微信握手桥：公众号(测试号)服务器回调 + AI 大脑被动回复
    //     握手协议：GET 校验 sha1(token,timestamp,nonce) 并回显 echostr；POST 收消息 → AI 应答
    if (url.pathname === "/api/wechat" || url.pathname === "/api/wechat/") {
      const wxToken = (env && env.WECHAT_BRIDGE_TOKEN) || "08b125c77018210b";

      const wxSignature = async (token, timestamp, nonce) => {
        const raw = [token, timestamp, nonce].sort().join("");
        const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(raw));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
      };

      if (request.method === "GET") {
        const qs = url.searchParams;
        const echostr = qs.get("echostr");
        if (echostr !== null) {
          const sig = await wxSignature(wxToken, qs.get("timestamp") || "", qs.get("nonce") || "");
          if (sig === (qs.get("signature") || "")) {
            return new Response(echostr, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
          }
          return new Response("handshake failed: signature mismatch", { status: 403 });
        }
        // 无 echostr：桥状态页（配对说明）
        return new Response(
          `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DSH ⇋ 微信握手桥</title></head>` +
          `<body style="font-family:-apple-system,sans-serif;max-width:560px;margin:40px auto;padding:0 16px;line-height:1.7">` +
          `<h2>✅ 微信握手桥在线</h2><p>回调端点：<code>/api/wechat</code><br>配对令牌：<code>${wxToken.slice(0, 6)}…</code>（完整值见 Worker 源码 <code>WECHAT_BRIDGE_TOKEN</code> 或环境变量）</p>` +
          `<ol><li>登录 <a href="https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index">公众平台测试号</a></li>` +
          `<li>「接口配置信息」URL 填 <code>${url.origin}/api/wechat</code>，Token 填配对令牌，点提交（即完成服务器握手）</li>` +
          `<li>扫码关注测试号 → 微信发消息 → AI 大脑回复。握手完成。</li></ol></body></html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }

      if (request.method === "POST") {
        try {
          const xml = await request.text();
          const pick = (tag) => {
            const m = xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
            return m ? m[1] : "";
          };
          const fromUser = pick("FromUserName");
          const toOfficial = pick("ToUserName");
          const msgType = pick("MsgType");
          const event = pick("Event");
          let replyText = "";

          if (msgType === "event" && event === "subscribe") {
            replyText = "握手成功 ✅ 你的微信已与 DSH/AI 大脑建立会话，直接发消息即可。";
          } else if (msgType === "text") {
            const question = pick("Content").trim().slice(0, 500);
            const amdApiKey = (env && env.AMD_API_KEY) || DEFAULT_AMD_API_KEY;
            const amdEndpoint = ((env && env.AMD_API_ENDPOINT) || DEFAULT_AMD_ENDPOINT).replace(/\/+$/, "");
            const amdModel = (env && env.AMD_MODEL) || DEFAULT_AMD_MODEL;
            let answer = "";
            try {
              const aiRes = await fetch(`${amdEndpoint}/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${amdApiKey}` },
                body: JSON.stringify({
                  model: amdModel,
                  messages: [
                    { role: "system", content: UNIFIED_SYSTEM_PROMPT },
                    { role: "user", content: question }
                  ],
                  temperature: 0.25,
                  max_tokens: 700
                })
              });
              const data = await aiRes.json();
              answer = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
            } catch (e) {
              answer = "";
            }
            replyText = answer ? answer.replace(/\]\]>/g, "］］>").slice(0, 600)
                               : "AI 算力通道暂时无响应，请稍后重试。";
          } else {
            replyText = `已收到你的消息（类型：${msgType || "unknown"}）。当前支持文字消息的 AI 应答。`;
          }

          const ts = Math.floor(Date.now() / 1000);
          const xmlReply = `<xml><ToUserName><![CDATA[${fromUser}]]></ToUserName><FromUserName><![CDATA[${toOfficial}]]></FromUserName><CreateTime>${ts}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${replyText}]]></Content></xml>`;
          return new Response(xmlReply, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
        } catch (err) {
          return new Response("success", { status: 200 });
        }
      }
    }

    // 2.8 Telegram 官方 Webhook 桥接与全量智脑 (纯 Cloudflare Serverless 全球边缘托管)
    if (url.pathname === "/api/telegram" || url.pathname === "/api/telegram/") {
      if (request.method === "POST") {
        try {
          const update = await request.json().catch(() => ({}));
          if (ctx && typeof ctx.waitUntil === "function") {
            ctx.waitUntil(handleTelegramUpdate(update, env));
          } else {
            await handleTelegramUpdate(update, env);
          }
          return new Response("OK", { status: 200 });
        } catch (err) {
          return new Response("OK", { status: 200 });
        }
      }
      return new Response("Telegram Webhook Live on Cloudflare Edge", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 3. 静态资源转发 (Cloudflare Pages 静态资产托管)
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
  }
};

async function tgCall(token, method, payload) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json().catch(() => ({}));
  } catch (e) {
    return null;
  }
}

async function handleTelegramUpdate(update, env) {
  const token = (env && env.TELEGRAM_BOT_TOKEN) || "9239919593:AAEHxh3sCyv-tCkAs6k9-WnTdKDXbVZZqdg";
  const ownerId = (env && env.TELEGRAM_OWNER_ID) || "8781077291";
  const radioAppUrl = "https://www.tibetsaffron.com/radio/";
  const siteUrl = "https://www.tibetsaffron.com/";

  const message = update.message || update.edited_message;
  if (!message) return;

  const chatId = message.chat?.id;
  const chatType = message.chat?.type;
  const text = (message.text || "").trim();
  const msgId = message.message_id;

  if (!chatId) return;

  // 1. 处理 /start
  if (text.startsWith("/start")) {
    const welcome = `扎西德勒！欢迎来到【天旺藏红花 · 雪域林泉官方知识智库】。\n\n我是由 **Cloudflare 全球边缘网络 + 天旺官方全量 SSOT 数据库** 驱动的官方云端 AI 大脑。\n\n💡 我已开启 24 小时云端守护与知识溯源功能。您可以直接向我提问：\n• *“西藏什么时候实现藏红花规模化量产的？”*\n• *“天旺有哪些国家检测报告？湾区水土测试是怎么回事？”*\n• *“唐代文献里怎么描述藏红花的？”*\n\n点击下方按钮还可随时进入全双工互动电台与微商城！`;
    const markup = {
      inline_keyboard: [
        [{ text: "🎙️ 开启全双工互动电台 (Mini App)", web_app: { url: radioAppUrl } }],
        [{ text: "🏛️ 访问 tibetsaffron.com 官方知识中心", url: siteUrl }]
      ]
    };
    await tgCall(token, "sendMessage", {
      chat_id: chatId,
      text: welcome,
      reply_markup: markup,
      reply_to_message_id: msgId
    });
    return;
  }

  // 2. 处理 Mini App 传回的电商订购数据
  if (message.web_app_data) {
    try {
      const data = JSON.parse(message.web_app_data.data || "{}");
      if (data.action === "COMPLETE_ORDER" || data.action === "ORDER_INTENT") {
        const orderId = data.orderId || `TW-${Date.now().toString().slice(-6)}`;
        const payMethod = data.paymentChannel || "微信支付";
        const name = data.buyerName || message.from?.first_name || "尊贵客户";
        const phone = data.buyerPhone || "待补充";
        const addr = data.buyerAddress || "待补充";
        const qty = data.quantity || 1;

        const isCod = payMethod.includes("货到付款");
        const buyerReceipt = `✅ **【天旺农牧 · 官方出库订单凭单】**\n\n` +
          `🧾 **订单编号**：\`${orderId}\`\n` +
          `📦 **订购商品**：**${data.product}**\n` +
          `🏷️ **选定规格**：**${data.spec}**\n` +
          `🔢 **订购数量**：**${qty} 盒**\n` +
          `💰 **订单金额**：**¥${data.price}**\n` +
          `💳 **支付通道**：**${payMethod}**\n\n` +
          `👤 **收件信息**：${name} (${phone})\n` +
          `📍 **详细地址**：${addr}\n\n` +
          `🏔️ **发货履约承诺**：\n` +
          `• 您的订单已正式提交至林芝米瑞乡 2945m 基地调度中心；\n` +
          `• 顺丰航空特快直发，随箱附带《中国药典》水试卡及专属防伪溯源码；\n` +
          (isCod ? "• 【货到付款】：开箱验货满意后向顺丰快递员付款即可。\n\n" : "• 【在线支付】：请按收银台扫码完成款项支付，核销后即刻出库直发。\n\n") +
          `🚚 运单号生成后，我将在此第一时间推送给您！如有疑问随时在此提问。`;

        await tgCall(token, "sendMessage", {
          chat_id: chatId,
          text: buyerReceipt,
          parse_mode: "Markdown"
        });

        // 🚨 实时通知主理人 (你)
        const ownerAlert = `🚨 **【天旺微电商 · 新全额有效订单到达】**\n\n` +
          `🧾 **订单号**：\`${orderId}\`\n` +
          `👤 **买家**：${message.from?.first_name || ""} ${message.from?.last_name || ""} (@${message.from?.username || "无用户名"})\n` +
          `🆔 **买家 Telegram ID**：\`${chatId}\`\n` +
          `📦 **订购商品**：**${data.product}** (${data.spec})\n` +
          `🔢 **购买数量**：**${qty} 盒**\n` +
          `💰 **订单总额**：**¥${data.price}**\n` +
          `💳 **结算方式**：**${payMethod}**\n` +
          `📱 **联系电话**：${phone}\n` +
          `📍 **派送全址**：\n\`${addr}\`\n\n` +
          `⏰ **下单时间**：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}\n` +
          `👉 请主理人安排林芝基地顺丰打包直发！`;

        await tgCall(token, "sendMessage", {
          chat_id: ownerId,
          text: ownerAlert,
          parse_mode: "Markdown"
        });
        return;
      }
    } catch (e) {
      console.log("web_app_data parse error:", e);
    }
  }

  // 3. 智能识别客户收件发货地址 (手机号 / 省市区 / 地址关键词)
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  const isAddressSubmission = phoneMatch || (/地址|收货|发货|收件人/.test(text) && /省|市|区|县|路|街|号|村/.test(text));

  if (isAddressSubmission) {
    const phone = phoneMatch ? phoneMatch[0] : "待补充";
    const buyerReceipt = `✅ **【天旺农牧 · 基地发货信息已登记】**\n\n` +
      `📦 **收件信息**：\n${text}\n\n` +
      `🏔️ **发货与溯源保障**：\n` +
      `• 林芝天旺农牧生产基地调度中心已接收您的订单指令；\n` +
      `• 将于 24 小时内为您安排顺丰航空特快从林芝米瑞乡直发；\n` +
      `• 随箱附带《中国药典》水试检测对照卡及专属防伪溯源码。\n\n` +
      `🚚 **快递单号生成后，我将在此第一时间推送给您！如有任何疑问随时呼唤我。**`;

    await tgCall(token, "sendMessage", {
      chat_id: chatId,
      text: buyerReceipt,
      reply_to_message_id: msgId,
      parse_mode: "Markdown"
    });

    const ownerDispatchAlert = `🚨 **【天旺基地发货指令 · 买家已提交完整地址】**\n\n` +
      `👤 **买家**：${message.from?.first_name || ""} ${message.from?.last_name || ""} (@${message.from?.username || "无用户名"})\n` +
      `🆔 **买家 Telegram ID**：\`${chatId}\`\n` +
      `📱 **提取电话**：${phone}\n` +
      `📍 **买家提交全址**：\n\`${text}\`\n\n` +
      `⏰ **登记时间**：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}\n` +
      `👉 请主理人安排林芝基地顺丰打包直发！`;

    await tgCall(token, "sendMessage", {
      chat_id: ownerId,
      text: ownerDispatchAlert,
      parse_mode: "Markdown"
    });
    return;
  }

  // 群聊只响应 @ 或核心关键词
  if (chatType === "group" || chatType === "supergroup") {
    const isMentioned = text.includes("@tibetsaffron_bot") || text.includes("藏红花") || text.includes("天旺");
    if (!isMentioned) return;
  }

  // 4. 知识大脑核心推理问答
  tgCall(token, "sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});

  let answer = "";
  // 严格死锁：量产年份唯一为 2018 年，严禁引入未经核验的 80 年代试种
  if (/量产|什么时候种|哪一年/.test(text) && /西藏|藏红花/.test(text)) {
    answer = "西藏实现藏红花规模化量产种植的唯一法定时间节点是 **2018 年**。\n\n2018年，林芝天旺农牧陈兵雄团队正式入驻林芝市巴宜区米瑞乡姆多村与广久村，攻克“两段式种植改良法”，建成了海拔 2945 米现代智能环境控制 CEA 连栋温室投产，真正让藏红花在西藏本土扎下了现代设施农业的根，实现了西藏本土的工业级、规模化量产与高活性定质！\n\n【官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告】";
  } else if (/湾区/.test(text)) {
    answer = "天旺藏红花的“湾区测试/湾区认证”是指林芝天旺农牧为了对接粤港澳大湾区严格准入标准，委托国家级权威机构进行的全链路水土及成品检测：\n\n1. **基地土壤质量（湾区认证）**：广州华测 CTI 检验报告（No. A2260715164101001C），pH 5.94 弱酸沙壤，滴滴涕（DDT）、六六六、苯并[a]芘全项未检出，重金属远低于国家农用地标准；\n2. **高山融雪灌溉水（湾区认证）**：华测 CTI 检验报告（No. A2260721555101001C），pH 6.7，悬浮物 <4mg/L，粪大肠菌群 <20 MPN/L（优于国家农田灌溉标准 2000 倍），蛔虫卵未检出；\n3. **成品 39 项农残筛查**：深圳市计量质量检测研究院 (SMQ) 报告（WT10103260183295WT2），39 项农残全项未检出。\n\n【官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告】";
  } else if (/水试|为什么变黄|变红/.test(text)) {
    answer = "《中国药典》明确规定：正品藏红花的核心成分是强极性水溶性的**番红花苷（Crocin）**，入水后缓缓垂直下沉拉出金黄色丝带，水体呈现清澈明亮的**纯金黄色**，绝无油脂浮膜。\n\n凡是泡出鲜红或暗红色的，要么是苏木等杂草染色，要么掺杂了化学合成色素，那才是假货！\n\n【官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告】";
  } else if (/两段式/.test(text)) {
    answer = "天旺独创的“两段式”现代农艺体系将繁育与开花在地理与空间上解耦：\n\n1. **第一阶段（平原水网大田养大球）**：在崇明岛深厚肥沃土壤中培育 25g 以上高活性健壮母球，积蓄充沛养分；\n2. **第二阶段（西藏林芝设施控温催花）**：秋季将成熟母球运回林芝海拔 2945 米 CEA 智能连栋温室，利用强紫外线与 15℃+ 昼夜温差逆境刺激，无土无尘悬空开花与采收，物理级 0 农残。\n\n【官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告】";
  } else if (/唐代|鬱金|郁金|李白|客中行/.test(text)) {
    answer = "依据天旺知识库资产【KNO-7100 中古中国与唐代西土鬱金文化考述】（梁树风《唐代鬱金考述》2023）：\n\n1. **名物辨析**：唐代严格区分本土姜科草药“鬱金”（Curcuma）与西域朝贡的鸢尾科“西土鬱金/鬱金香”（Crocus sativus，即藏红花柱头）；\n2. **朝贡之最**：贞观十五年中天竺尸罗逸多献鬱金香、开元七年西域安国王一次性朝贡三十斤；\n3. **宫廷礼制**：皇帝行幸前黄门侍卫以龙脑与西土鬱金碾碎铺满青锦红毯（“龙脑鬱金藉地”）；李白《客中行》“兰陵美酒郁金香”即为浸润调和西土贵重香药之风尚。\n\n【官方声明：本回答基于天旺农牧官方 SSOT 知识库与权威史料核验】";
  } else {
    // 调大模型问答
    const amdApiKey = (env && env.AMD_API_KEY) || DEFAULT_AMD_API_KEY;
    const amdEndpoint = ((env && env.AMD_API_ENDPOINT) || DEFAULT_AMD_ENDPOINT).replace(/\/+$/, "");
    let amdModel = (env && env.AMD_MODEL) || DEFAULT_AMD_MODEL;

    try {
      const aiRes = await fetch(`${amdEndpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${amdApiKey}` },
        body: JSON.stringify({
          model: amdModel,
          messages: [
            { role: "system", content: UNIFIED_SYSTEM_PROMPT },
            { role: "user", content: text }
          ],
          temperature: 0.25,
          max_tokens: 1000
        })
      });
      const data = await aiRes.json();
      answer = (data.choices && data.choices[0] && data.choices[0].message?.content) || "";
    } catch (e) {
      answer = "";
    }
  }

  if (!answer) {
    answer = "扎西德勒！我是天旺藏红花官方知识大脑。已收录林芝 2945m 基地风土、两段式现代设施农艺、2018年量产突破与《中国药典》水试检测标准。您可以查阅官方知识中心：https://www.tibetsaffron.com";
  }

  // 优先带 Markdown 发送，若报错自动降级纯文本
  let sendRes = await tgCall(token, "sendMessage", {
    chat_id: chatId,
    text: answer,
    reply_to_message_id: msgId,
    parse_mode: "Markdown"
  });
  if (!sendRes?.ok) {
    await tgCall(token, "sendMessage", {
      chat_id: chatId,
      text: answer,
      reply_to_message_id: msgId
    });
  }
}

/**
 * Cloudflare Pages Advanced Worker: _worker.js
 * Automatically handles /api/chat requests and proxies to AMD Radeon API
 * Passes all other requests to static assets
 */

const DEFAULT_AMD_API_KEY = "rc-9bf0bcf05f772e16a829eb57316bf25f4f4f56661e0e99f1";
const DEFAULT_AMD_ENDPOINT = "https://developer.amd.com.cn/radeon/api/v1";
const DEFAULT_AMD_MODEL = "DeepSeek-V4-Flash-Vision-Exp";

const TIANWANG_BRAND_SSOT_PROMPT = `你是天旺农牧官方基于Brand Content OS驱动的【天旺藏红花 官方AI品牌大脑】。
【核心品牌使命】：让藏红花实至名归（1765年赵学敏定名，距今261年）。
【核心事实与凭证】：
- 核心产区：西藏自治区林芝市巴宜区米瑞乡姆多村/广久村，海拔 2945 米，背靠苯日神山，面临雅尼两江汇流；
- 1765年清乾隆赵学敏《本草纲目拾遗》首次定名“藏红花”，因药材经西藏转运误认产自西藏，距今261年。天旺十年攻关实现西藏本土规模量产；
- 重庆食药检院地标报告（No. A26SW02809）：实测色价高达 246，总砷未检出，黄曲霉毒素B1/B2/G1/G2全项未检出；
- 深圳市计量质检院高分辨质谱（WT10103260183295WT2）：多菌灵等 39 项农药残留全部未检出；
- 中科光析HPLC检测（ZX250221-C130401）：西红花苷(I+II)含量高达 26.43%（药典标准≥10.0%）；
- 华测检测CTI种植基地土壤报告（A2260715164101001C）：弱酸沙质壤土 pH 5.94，滴滴涕与六六六全项未检出，苯并芘未检出；
- 华测检测CTI高山灌溉水报告（A2260721555101001C）：pH 6.7 高山融雪水，悬浮物<4mg/L，重金属极限低，蛔虫卵未检出，大肠菌群优于国标2000倍；
- 拉萨海关出口凭证（CMP-001）：出口加拿大特级藏红花2kg，货值 25.64 万元人民币；
- 官方唯一线下零售实体：藏红花科技馆（高德/百度地图注册，GPS坐标：北纬29.476311°，东经94.554110°），无任何外部代理；
- 严禁宣称“绝对零农残”或疾病治疗功效。回答准确客观，结尾附带凭证引用。`;

function getDeterministicSSOTAnswer(query) {
  const q = (query || '').toLowerCase();
  
  if (q.includes('由来') || q.includes('名称') || q.includes('名字') || q.includes('为什么叫') || q.includes('赵学敏') || q.includes('本草纲目拾遗') || q.includes('历史') || q.includes('261')) {
    return {
      answer: `**【藏红花中文名称的由来与 261 年历史公案】：**\n\n1. **典籍首次定名**：清乾隆三十年（1765年），著名药学家**赵学敏**在《本草纲目拾遗》卷三中，正式将这一名贵药材记载定名为**“藏红花”**，以 2026 年计距今整整 **261 年**；\n2. **为何带“藏”字（因地致误）**：藏红花原产于地中海沿岸与中亚波斯。唐宋之后，陆上丝绸之路贸易线南移，药材经由克什米尔跨入西藏拉萨，再由番商及僧侣沿川滇茶马古道、青藏古道转运进入内地。赵学敏因见药材均由西藏带入，加之当时地理信息隔绝，遂误认产自西藏，以“藏红花”之名流传至今；\n3. **名在西藏，花未归藏（261年的历史遗憾）**：两百六十一年来，“藏红花”虽名扬天下，但西藏在历史上长期仅作为贸易中转集散地，极地山川未见其真正扎根生息；\n4. **天旺的初心与使命**：林芝天旺农牧历经十年产学研攻关，在林芝米瑞乡海拔 2945 米实现规模量产与第九代本土种球繁育复壮，**“让藏红花实至名归”**！`,
      citations: ['《本草纲目拾遗》卷三·赵学敏 (1765年)', '天旺品牌缘起与历史考证', 'DB54/T 0245-2021 西藏地标']
    };
  }

  if (q.includes('土壤') || q.includes('水质') || q.includes('灌溉水') || q.includes('华测') || q.includes('cti')) {
    return {
      answer: `**天旺藏红花【种植基地土壤与高山灌溉水质】权威检验结论（广州华测检测 CTI 湾区认证）：**\n\n1. **种植基地土壤报告（A2260715164101001C）**：pH 5.94 弱酸性沙质壤土，滴滴涕与六六六全项未检出，苯并[a]芘未检出，重金属远优于国标；\n2. **高山灌溉水报告（A2260721555101001C）**：pH 6.7 天然高山融雪水，悬浮物 <4 mg/L，重金属极限低，蛔虫卵未检出，大肠菌群优于国标限量 2000 倍。`,
      citations: ['华测 CTI 土壤报告 A2260715164101001C', '华测 CTI 灌溉水报告 A2260721555101001C']
    };
  }

  if (q.includes('含量') || q.includes('26.43') || q.includes('中科光析')) {
    return {
      answer: `**天旺藏红花【西红花苷活性成分 HPLC 实测含量】：**\n\n依据中研所分析测试中心 / 中科光析检验报告（**ZX250221-C130401**）：西红花苷-I 实测 18.12%，西红花苷-II 实测 8.31%，**西红花苷总量 (I+II) 实测高达 26.43%**（《中国药典》合格限为≥10.0%，天旺实测为药典合格线的 **2.64 倍**）。`,
      citations: ['中研所/中科光析报告 ZX250221-C130401', '《中国药典》2020年版一部 HPLC 标准']
    };
  }

  if (q.includes('色价') || q.includes('246') || q.includes('重庆') || q.includes('食药检院')) {
    return {
      answer: `**天旺藏红花【地标一级品与色价检测】：**\n\n依据重庆市食品药品检验检测研究院检验报告（**No. A26SW02809**）：天旺藏红花 440nm 西红花苷色价吸光度实测高达 **246**，远超《中国药典》180 及国际 ISO 3632 一级品 200 标准；总砷未检出，黄曲霉毒素 B1/B2/G1/G2 全项未检出。`,
      citations: ['重庆食药检院报告 No. A26SW02809', 'DB54/T 0245-2021 西藏地标']
    };
  }

  return {
    answer: `**天旺藏红花核心事实答复：**\n\n1. **产地与风土**：西藏林芝市巴宜区米瑞乡姆多村（海拔 2945 米，背靠苯日神山，面临雅尼两江汇流）；\n2. **历史定名**：1765 年赵学敏《本草纲目拾遗》定名“藏红花”，距今 261 年，天旺十年实现西藏本土量产，让藏红花实至名归；\n3. **核心数据**：色价 246（重庆食药检院），39项农残质谱全未检出（深圳SMQ），苷含量 26.43%（中科光析），华测土壤水质全达标，拉萨海关出口凭证 CMP-001。`,
    citations: ['天旺 SSOT 确定性引擎', '11项全量检测证据大典']
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const rawQuery = body.question || body.query || '';
        const query = rawQuery.trim().slice(0, 500);

        if (!query) {
          return new Response(JSON.stringify({ success: false, message: 'Question is empty' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const amdApiKey = (env && env.AMD_API_KEY) || body.amdApiKey || DEFAULT_AMD_API_KEY;
        const amdEndpoint = (env && env.AMD_API_ENDPOINT) || body.amdEndpoint || DEFAULT_AMD_ENDPOINT;
        const amdModel = (env && env.AMD_MODEL) || body.amdModel || DEFAULT_AMD_MODEL;

        try {
          const apiUrl = `${amdEndpoint.replace(/\/+$/, '')}/chat/completions`;
          const amdRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${amdApiKey}`
            },
            body: JSON.stringify({
              model: amdModel,
              messages: [
                { role: 'system', content: TIANWANG_BRAND_SSOT_PROMPT },
                { role: 'user', content: query }
              ],
              temperature: 0.2,
              max_tokens: 800
            })
          });

          const data = await amdRes.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            return new Response(JSON.stringify({
              success: true,
              answer: data.choices[0].message.content,
              citations: ['AMD GPU Radeon (DeepSeek-V4)', '天旺 11 项全量权威检测证据大典', '林芝 2945m 极地风土底座'],
              engine: 'amd-deepseek-v4'
            }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
        } catch (callErr) {
          console.warn('Call AMD failed in _worker, fallback to SSOT:', callErr);
        }

        const ssot = getDeterministicSSOTAnswer(query);
        return new Response(JSON.stringify({
          success: true,
          answer: ssot.answer,
          citations: ssot.citations,
          engine: 'ssot-engine'
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 其他请求全部交由静态资源服务
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
  }
};

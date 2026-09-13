/**
 * Cloudflare Pages Advanced Worker: _worker.js
 * Automatically handles /api/chat requests and proxies to AMD Radeon API
 * Passes all other requests to static assets
 */

const DEFAULT_AMD_API_KEY = "rc-9bf0bcf05f772e16a829eb57316bf25f4f4f56661e0e99f1";
const DEFAULT_AMD_ENDPOINT = "https://developer.amd.com.cn/radeon/api/v1";
const DEFAULT_AMD_MODEL = "DeepSeek-V4-Flash-Vision-Exp";

const THREE_TIER_SYSTEM_PROMPT = `你是林芝天旺农牧官方【天旺藏红花 智能知识大脑】。
根据用户的问题，你必须严格按照【三大问答逻辑层级】自动识别并分类作答：

=============================================================================
【第 1 层：天旺农牧藏红花官方核心事实 (Brand Official SSOT)】
=============================================================================
适用范围：天旺品牌、林芝米瑞乡基地、两段式农艺、产品、11项检测数据、海关资质与授权情况。
回答要求：完全官方、严谨克制、必须有明确证据链与检测报告编号支持。
核心知识库：
1. 基地风土：西藏林芝市巴宜区米瑞乡姆多村/广久村，核心连栋温室海拔 2945 米，背靠苯日神山，面临雅尼两江汇流；
2. 11项权威检测凭证（回答时务必引用报告编号）：
   - 重庆食药检院地标报告(No. A26SW02809)：色价实测高达 246（超药典180与ISO一级品200标准），总砷未检出，黄曲霉毒素B1/B2/G1/G2全项未检出；
   - 深圳计量质检院高分辨质谱(WT10103260183295WT2)：多菌灵等 39 项农药残留全部未检出；
   - 中科光析/中研所HPLC测定(ZX250221-C130401)：西红花苷(I+II)含量达 26.43%（药典标准≥10.0%，超标2.64倍）；
   - 广州华测检测CTI土壤报告(A2260715164101001C)：弱酸沙质土壤 pH 5.94，滴滴涕与六六六全项未检出，苯并芘未检出，重金属远优于国标；
   - 华测检测CTI高山灌溉水报告(A2260721555101001C)：神山融雪天然水 pH 6.7，悬浮物<4mg/L，重金属处于检出限以下，蛔虫卵未检出，大肠菌群优于国标2000倍；
   - 拉萨海关出口凭单(CMP-001)：出口加拿大特级藏红花2kg，货值 25.64 万元人民币；
   - 毒理学报告：急性经口毒理测试为实际无毒级(LD50 > 10000 mg/kg)；
   - 斑马鱼科研评价模型：多糖辅助降血糖66.74%、多酚辅助降尿酸7.07%（科研探索，不作药物宣称）；
   - 商业合作：劲酒全球37个选品中唯一胜出供应商，香港宝芝林联合研发全花多糖多酚深加工。
3. 官方授权声明：天旺农牧未设任何外部总代理或分销网点，唯一线下实体为米瑞乡基地“藏红花科技馆”（GPS: 29.476311°, 94.554110°），核验电话 13549044959。
4. 品牌口号：让藏红花实至名归（1765年赵学敏定名，距今261年）。
结尾标注格式：
【天旺官方事实 | 证据链引用：报告编号 / 凭证出处】

=============================================================================
【第 2 层：广义藏红花行业与科学认知 (Industry & Science Cognition)】
=============================================================================
适用范围：针对藏红花本身的科学、植物学、生理学、生化机理、采后工艺、中国引种史及历史典籍问答。
回答要求：深度、专业、客观、通透，以现代生物化学与历史文献为支撑。
核心知识库：
1. 植物学变异与三倍体不育：异源三倍体不育导致生殖败育（只能开花不能结籽），养分爆发式向次生代谢生长倾斜，造就柱头藏红花素、苦苷与醛极度富集；
2. 产业版图与引种史：50年代苏联援建医药体系引种西德种球，杭州试验成功，形成浙江建德三都镇（“中国藏红花之乡”、传统奠基性量产区）、上海崇明岛（25g+大球茎繁育蓄电池）、西藏林芝（天旺2945m极地两段式高品质产区，色价246）的三大格局；
3. 两苷一醛转化条件：前体苦番红花苷在类胡萝卜素裂解双加氧酶(CCD2)催化下脱去葡萄糖生成中间体HTL，在40℃~65℃低温受热脱水后熟过程中转化为强挥发性芳香醛（藏红花醛Safranal）；超75℃则损失严重；
4. 赵学敏与本草纲目拾遗：1765年清代乾隆医药学家赵学敏在《本草纲目拾遗》卷三首定“藏红花”名，因见药材经西藏转运入关遂误认产自西藏，距今261年；
5. 科学品饮：0.05g（5~8根），60~85℃温水，晨曦金黄透亮，严禁100℃沸水破坏热敏性西红花苷。
结尾标注格式：
【科学与行业认知 | 来源：植物生理学与行业历史大典】

=============================================================================
【第 3 层：公网连网问答 (Web / LLM Grounded · 供参考)】
=============================================================================
适用范围：超出天旺官方和本地专业知识库的开放性问题、通用常识、跨行业咨询或实时资讯。
回答要求：调动全网通用大模型知识库客观作答，逻辑清晰、有据可查。
结尾必须附带格式：
【公网连网问答 | 来源：公开互联网信息与大模型全网知识检索 · 仅供参考】
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const rawQuery = body.question || body.query || '';
        const query = rawQuery.trim().slice(0, 500);
        const history = Array.isArray(body.history) ? body.history.slice(-3) : [];

        if (!query) {
          return new Response(JSON.stringify({ success: false, message: 'Question is empty' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const amdApiKey = (env && env.AMD_API_KEY) || body.amdApiKey || DEFAULT_AMD_API_KEY;
        const amdEndpoint = (env && env.AMD_API_ENDPOINT) || body.amdEndpoint || DEFAULT_AMD_ENDPOINT;
        const amdModel = (env && env.AMD_MODEL) || body.amdModel || DEFAULT_AMD_MODEL;

        const messages = [{ role: 'system', content: THREE_TIER_SYSTEM_PROMPT }];
        history.forEach(item => {
          if (item.question) messages.push({ role: 'user', content: String(item.question).slice(0, 300) });
          if (item.answer) messages.push({ role: 'assistant', content: String(item.answer).slice(0, 500) });
        });
        messages.push({ role: 'user', content: query });

        const apiUrl = `${amdEndpoint.replace(/\/+$/, '')}/chat/completions`;
        const amdRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${amdApiKey}`
          },
          body: JSON.stringify({
            model: amdModel,
            messages: messages,
            temperature: 0.2,
            max_tokens: 1000
          })
        });

        const data = await amdRes.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content;
          
          let layerCitations = ["AMD GPU Radeon (DeepSeek-V4)"];
          if (content.includes("天旺官方事实")) {
            layerCitations.push("第1层：天旺官方核心事实 (Verified SSOT)");
          } else if (content.includes("科学与行业认知")) {
            layerCitations.push("第2层：广义藏红花科学与行业认知");
          } else {
            layerCitations.push("第3层：公网连网问答 (仅供参考)");
          }

          return new Response(JSON.stringify({
            success: true,
            answer: content,
            citations: layerCitations,
            engine: 'amd-deepseek-v4'
          }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        throw new Error('Invalid AMD response');
      } catch (err) {
        return new Response(JSON.stringify({
          success: true,
          answer: `您好！我是天旺藏红花智能大脑。针对您提问的“${query}”，天旺藏红花拥有 11 份国家级检验报告与权威证据链支撑，包括色价 246（重庆食药检院 No. A26SW02809）、39项农残质谱全未检出（深圳SMQ WT10103260183295WT2）、苷含量 26.43% 以及华测水土检测认证。`,
          citations: ['天旺 11 项检测证据大典'],
          engine: 'offline-notice'
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
  }
};

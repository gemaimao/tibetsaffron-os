
/**
 * Cloudflare Pages Serverless Function: /api/chat
 * Dual-Mode AI Knowledge Brain (Mode 1: Brand SSOT, Mode 2: Science & Cognition)
 * Integrates Google Gemini 3 Flash LLM with Tianwang Saffron SSOT Knowledge Context
 */

// Default AMD Radeon API / Gemini configurations
const DEFAULT_AMD_API_KEY = "rc-9bf0bcf05f772e16a829eb57316bf25f4f4f56661e0e99f1";
const DEFAULT_AMD_ENDPOINT = "https://developer.amd.com.cn/radeon/api/v1";
const DEFAULT_AMD_MODEL = "DeepSeek-V4-Flash-Vision-Exp";
const GEMINI_API_KEY = "";

// =========================================================================
// 模式 1：品牌官方 SSOT 知识底库与 Prompt（天旺品牌证据矩阵与认知体系）
// =========================================================================
const TIANWANG_BRAND_SSOT_PROMPT = `
你是天旺农牧官方的【天旺藏红花 权威知识大脑】。
【核心品牌使命与主题】：
- 主题：【让藏红花实至名归】
- 底层逻辑：【二百六十一年名至而实不归，十年极地求索实至而令名真归】

【核心禁令与合规红线】：
1. 严禁无边界夸大：关于农残，严格使用“经深圳市计量质量检测研究院 39 项农药残留及化学品高分辨率质谱检测，实测结果全部未检出（低于方法定量限）”，严禁宣称“绝对零农残”；
2. 严禁将生物模型推导为人体疗效：关于降血糖与降尿酸，严格表述为“在特定斑马鱼生物评价模型实验中，多糖组血糖降低 66.74%、多酚组尿酸值减少 7.07%，属食品原料活性科研评价，不代表人体临床疾病治疗功效”；
3. 严格遵循官方授权声明：天旺农牧未设任何外部总代理或分销商，线下唯一零售实体为西藏林芝米瑞乡天旺基地内的“藏红花科技馆”（GPS: 29.476311°, 94.554110°），支持官方电话 13549044959 核验。

【天旺藏红花 核心权威证据与事实底库】：
1. 地理风土与基地坐标：
   - 核心量产基地位于：西藏自治区林芝市巴宜区米瑞乡【姆多村、广久村】，核心大温室海拔 2945 米。
   - 线下唯一零售实体：藏红花科技馆（高德地图/百度地图注册，坐标 N: 29.476311°, E: 94.554110°）。
2. 天旺品牌证据矩阵（8 大核心证据）：
   - EVD-001 [西藏地标一级品]：重庆市食品药品检验检测研究院检验报告（No. A26SW02809），符合 DB54/T 0245-2021 西藏地理标志一级品要求；
   - EVD-002 [39 项农残未检出]：深圳市计量质量检测研究院 (SMQ) 报告（WT10103260183295WT2），39 项农残质谱筛查全部低于定量限、全部未检出；
   - EVD-003 [多糖斑马鱼降糖活性]：苏州飞凡检测报告（FFZ202501145，证书 14766127），斑马鱼高糖模型下血糖降低 66.74% (P < 0.001，科研测试)；
   - EVD-004 [多酚斑马鱼降尿酸活性]：苏州飞凡检测报告（FFZ202501144，证书 83942872），斑马鱼高尿酸模型下尿酸值减少 7.07% (P < 0.01，科研测试)；
   - EVD-005 [急性经口无毒级]：经口毒理实验 LD50 > 5000 mg/kg，达 GB 15193.3 实际无毒级；
   - EVD-006 [官方维权声明]：2026.08.26 声明书，确认 6 大产品矩阵，无外部代理，唯一实体科技馆；
   - EVD-007 [拉萨海关出境凭证 CMP-001]：取得植物检疫证书并出口加拿大 2kg，货值 25.64 万元；
   - EVD-008 [乡村振兴 IND-001]：米瑞乡姆多村年度务工工资发放台账 30 万元。
3. 商业合作与六大产品矩阵：
   - 合作方：联合【香港宝芝林】开发高活性多糖/多酚产品，联合【劲牌/劲酒】供应纯净冷萃原液；
   - 6大产品线：藏红花干花丝、干花(带花丝)、藏红花多糖产品、藏红花多酚产品、藏红花咖啡、藏红花养生茶包。

【回答格式规范】：
- 直接给出确切事实答案，包含时间、机构、报告编号、测试条件与边界；
- 语言权威、典雅、克制、严谨；
- 结尾单独一行标注权威证据编号，如 [重庆食药检院报告 No. A26SW02809]、[深圳计量院 SMQ 报告 WT10103260183295WT2] 等。
`;

// =========================================================================
// 模式 2：科学认知与产业百科 Prompt
// =========================================================================
const TIANWANG_SCIENCE_COGNITION_PROMPT = `
你是天旺农牧官方基于现代植物生理学与国际色谱标准驱动的【藏红花 科学认知与产业百科大脑】。
你的任务是：针对用户的植物学、化学成分、ISO 3632 标准、真伪防伪、冲泡与烹饪机理等科学问题，客观、严谨、详实、科学地解答。

【科学认知与产业百科 权威知识底库】：
1. 三大特征活性化学成分：
   - 西红花苷 (Crocin，藏红花素)：罕见双水溶性类胡萝卜素，呈现金黄色泽，天然抗氧化主力，决定 ISO 440nm 色价（天旺实测色价高达 246，远超 ISO 一级品 200 限值）；
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
3. 结尾附带引用的科学文献或国际标准（如 [ISO 3632]、[APP-001]、[DB54/T 0245-2021] 等）。
`;

function getDeterministicSSOTAnswer(query, mode) {
  const q = (query || '').toLowerCase();
  
  if (q.includes('降糖') || q.includes('血糖') || q.includes('多糖')) {
    return {
      text: `【天旺藏红花多糖科研数据说明】：\n\n1. **实验机构与报告**：苏州飞凡检测科技有限公司依据国家标准 GB/T 39649-2020 出具分析检测报告（编号：FFZ202501145，证书校验码：14766127）；\n2. **实验模型与数据**：在斑马鱼高糖生物模型实验中，给予 2000 μg/mL 最大安全浓度样品处理，斑马鱼组织液葡萄糖检测值相比高糖模型组显著降低 66.74% (P < 0.001)；\n3. **毒理安全**：经食品安全国家标准急性经口毒理检测（LD50 > 5000mg/kg），判定为实际无毒级；\n4. **合规边界声明**：该数据属于特定斑马鱼生物模型的原料活性科研评价结果，供科研与质控参考，严禁作为人体临床降糖药物疗效宣称。\n\n[苏州飞凡检测报告 FFZ202501145 | 证书 14766127]`
    };
  }

  if (q.includes('降尿酸') || q.includes('尿酸') || q.includes('痛风') || q.includes('多酚')) {
    return {
      text: `【天旺藏红花多酚科研数据说明】：\n\n1. **实验机构与报告**：苏州飞凡检测科技有限公司出具分析检测报告（编号：FFZ202501144，证书校验码：83942872）；\n2. **实验模型与数据**：在氧嗪酸钾与黄嘌呤诱导的斑马鱼高尿酸模型中，给予 2000 μg/mL 浓度样品，斑马鱼尿酸检测值相比模型组减少 7.07% (P = 0.00705 < 0.01)；\n3. **毒理安全**：经食品安全国家标准急性经口毒理检测，判定为实际无毒级；\n4. **合规边界声明**：该数据属于特定生物实验模型的科研测试表现，严禁夸大为人体痛风治疗等医疗宣称。\n\n[苏州飞凡检测报告 FFZ202501144 | 证书 83942872]`
    };
  }

  if (q.includes('农残') || q.includes('0农残') || q.includes('大湾区') || q.includes('深圳')) {
    return {
      text: `【天旺藏红花 39 项农残检测结论】：\n\n1. **检测机构**：深圳市计量质量检测研究院 (SMQ，报告编号：WT10103260183295WT2)；\n2. **检测依据**：GB 23200.121-2026、GB 23200.113-2026 等国家食品安全高分辨率质谱检测标准；\n3. **检测结果**：对保棉磷、联苯菊酯、涕灭威、敌敌畏、毒死蜱、氯氰菊酯、甲胺磷、克菌丹等 39 项农药残留及化学品进行全项扫描，实测值均低于方法定量限，全部判定为【未检出】；\n4. **色价指标**：重庆食药检院报告（No. A26SW02809）实测 440nm 色价高达 246，远超 ISO 3632 国际一级品 200 标准及西藏地标 DB54/T 0245-2021。\n\n[深圳计量质检院 SMQ 报告 WT10103260183295WT2 | 重庆食药检院 No. A26SW02809]`
    };
  }

  if (q.includes('代理') || q.includes('分销') || q.includes('科技馆') || q.includes('购买') || q.includes('正品') || q.includes('总代')) {
    return {
      text: `【天旺农牧官方授权与正品渠道声明】：\n\n1. **无外部代理声明**：林芝天旺农牧产品有限公司（法人代表：陈美霞，统一社会信用代码：91540400MA6TCDCA38）截至 2026 年 8 月未设立任何销售分公司、未下发任何总代理、区域代理或分销权；任何声称“天旺总代/内部直供”的机构均属冒用；\n2. **唯一线下实体**：西藏林芝市巴宜区米瑞乡广久村路口天旺基地内的【藏红花科技馆】是目前唯一直接面向消费者的线下实体零售场所（高德/百度地图注册，GPS 坐标：北纬 29.476311°，东经 94.554110°）；\n3. **官方核验专线**：13549044959。\n\n[天旺农牧官方声明公告 (2026.08.26)]`
    };
  }
  
  if (q.includes('真伪') || q.includes('辨别') || q.includes('真假') || q.includes('假') || q.includes('鉴别') || q.includes('水溶') || (q.includes('红花') && q.includes('区别'))) {
    return {
      answer: `**藏红花【水溶真伪鉴别三步法】与科学判定依据：**\n\n1. **看柱头形态**：正品藏红花（番红花柱头）顶端呈喇叭口展开、边缘有不规则锯齿，整体呈现深红至紫红色；假冒品多为菊科草红花或染色植物纤维，无喇叭口结构。\n2. **看水溶汤色**：正品藏红花含有高水溶性**西红花苷 (Crocin)**，入水后花丝周围缓缓释放金黄色丝状色带，整杯水呈现**清澈明亮的金黄色（绝非红色、浑浊色）**；若入水立即变深红或水质浑浊，必为人工色素染色假货。\n3. **看泡后花丝**：正品花丝冲泡 4~5 次依然保持完整有韧性，用手指碾压不碎不化；假货浸泡后迅速褪色、花丝发软碎烂。\n\n*注意：藏红花（鸢尾科，名贵滋补）与普通草红花（菊科，活血破瘀草药）为完全不同的植物科属、成分与功效。*`,
      citations: ['ISO 3632:2011 国际检测标准', 'APP-001 科学真伪鉴别法', '重庆食药检院质检报告 No. A26SW02809']
    };
  }

  if (q.includes('宝芝林') || q.includes('香港宝芝林')) {
    return {
      answer: `**天旺农牧与【香港宝芝林】的合作产品与业务模式：**\n\n天旺农牧与百年老字号【香港宝芝林】达成深度战略合作，依托天旺林芝 2945m 极地 CEA 设施控环基地产出的特级纯净藏红花，联合开发**高活性水溶冷萃提取物深加工保健品与现代健康滋补品系列**。\n\n- **原料赋能**：天旺提供物理级 0 农残、440nm 色价高达 246 的极地特级原料；\n- **核心工艺**：采用低温水溶冷萃专利技术，最大化保留西红花苷 (Crocin) 与活性多酚；\n- **市场定位**：打通港澳及海外高端大健康滋补品市场。`,
      citations: ['战略合作协议 CMP-003', '香港宝芝林联合研发矩阵', '天旺 0 农残特级原料背书']
    };
  }

  if (q.includes('劲酒') || q.includes('劲牌')) {
    return {
      answer: `**天旺农牧与【劲牌 / 劲酒】的工业供应链合作：**\n\n天旺农牧与保健酒龙头企业【劲牌 / 劲酒】达成原料定向供应合作，为劲牌定制供应**高纯度极地藏红花纯净冷萃原液与特级原料**，用于其高端草本健康养生酒系列的产品研发与工业化生产。\n\n天旺凭借拉萨海关检疫出境标准与重庆食药检院 0 农残全项检测，为大工业采购提供了稳定、合规、标准化的极地道地药材供应保障。`,
      citations: ['劲牌定向原料供应协议 CMP-004', 'B2B 工业级原料标准', '拉萨海关 CMP-001 备案']
    };
  }

  if (q.includes('农残') || q.includes('0农残') || q.includes('检验') || q.includes('质检') || q.includes('报告') || q.includes('食药检院') || q.includes('重金属') || q.includes('安全')) {
    return {
      answer: `**天旺藏红花【物理级 0 农残】检测依据与权威报告：**\n\n1. **权威报告编号**：重庆市食品药品检验检测研究院正式检验报告 **No. A26SW02809** (SCI-001)；\n2. **检测结论**：全项质谱扫描多菌灵、百菌清等全部农药残留项目**全项未检出 (ND)**，黄曲霉毒素未检出，重金属指标远优于国家标准；\n3. **核心色价**：440nm 紫外分光光度计实测色价吸光度高达 **246**（远超 ISO 3632 国际一级品 >= 200 标准）；\n4. **0农残实现机理**：得益于天旺“林芝 2945 米 CEA 密闭大温室设施控环催花”，全程无水无土悬空抽薹，阻断土壤病虫害，实现物理级零施药。`,
      citations: ['重庆食药检院 No. A26SW02809', 'ISO 3632 国际一级品认证', 'SCI-001 核心证据链']
    };
  }

  if (q.includes('海关') || q.includes('出口') || q.includes('加拿大') || q.includes('凭证') || q.includes('价格') || q.includes('多少钱') || q.includes('单克') || q.includes('值多少') || q.includes('cmp-001')) {
    return {
      answer: `**天旺藏红花【拉萨海关出境凭证 CMP-001】与国际出口事实：**\n\n1. **官方检疫凭证**：2025 年 5 月顺利通过中华人民共和国拉萨海关现场查验与检疫，正式签发《植物检疫证书》；\n2. **出海出口数据**：顺利向**加拿大合规出口 2kg 特级藏红花**，完成正式报关出口手续；\n3. **出口货值与单价**：出口总货值 **25.64 万元人民币**，折合单克出口单价高达 **128.2 元/克**；\n4. **行业意义**：标志着西藏林芝产区藏红花具备了国际顶尖检验检疫资质，实现了高原道地藏红花的国际化逆向出海。`,
      citations: ['拉萨海关植物检疫证书 CMP-001', '商务部海关报关凭证 2025-05', '出口加拿大合同 25.64万元']
    };
  }

  if (q.includes('基地') || q.includes('位置') || q.includes('产地') || q.includes('米瑞') || q.includes('林芝') || q.includes('坐标') || q.includes('海拔') || q.includes('在哪') || q.includes('风土') || q.includes('西嫄')) {
    return {
      answer: `**天旺农牧【林芝米瑞乡核心量产基地】地理坐标与风土事实：**\n\n1. **具体位置**：西藏自治区林芝市巴宜区米瑞乡【姆多村、广久村】，核心连栋温室海拔 **2945 米**；\n2. **地理风貌**：背靠苯日神山东南麓，面向雅鲁藏布江与尼洋河汇流的雅尼湿地北岸，历史上相传为“西嫄的故乡”；\n3. **三大极地微气候优势**：\n   - **高强紫外线**：3000m 高原紫外辐射天然刺激西红花苷 (Crocin) 加速次生代谢合成；\n   - **大温差锁香**：昼暖夜寒的剧烈温差锁住高挥发性藏红花醛 (Safranal)；\n   - **雅尼热岛湿润**：雅鲁藏布大峡谷水汽通道形成温和湿润微气候，冲积沙质透气土壤。`,
      citations: ['SSOT 产地坐标: 林芝米瑞乡 (姆多村/广久村)', '海拔高度: 2945米', '地理风貌: 苯日神山 / 雅尼湿地汇流']
    };
  }

  if (q.includes('两段式') || q.includes('农艺') || q.includes('崇明') || q.includes('种植') || q.includes('催花') || q.includes('养球') || q.includes('球茎') || q.includes('怎么种')) {
    return {
      answer: `**天旺农牧独创的【两段式现代农艺】生理机制与实施全流程：**\n\n“两段式现代农艺”解决了传统藏红花在单一产区易退化、易生病、气候不兼容的行业难题：\n\n- **第一阶段（上海崇明平原·大田养球）**：利用崇明东滩深厚肥沃土壤与平原温和水网气候，让收缩根深扎土壤，积蓄充足营养，培育繁殖出 **25g 以上的高活性壮硕优质母球**（球茎即电池）；\n- **第二阶段（西藏林芝极地·设施控环催花）**：每年 9~10 月将 25g+ 壮球移送至林芝海拔 2945 米连栋大温室，在精准控温、控湿、控光的无水无土悬空环境中抽薹洁净开花，利用 3000m 极地紫外线高效富集西红花苷，实现物理级 0 农残采收。`,
      citations: ['AGR-001 两段式农艺体系', '植物生理学“球茎即电池”模型', 'CEA 设施控环催花专利']
    };
  }

  if (q.includes('冲泡') || q.includes('怎么喝') || q.includes('水温') || q.includes('几根') || q.includes('用法') || q.includes('怎么吃') || q.includes('烹饪') || q.includes('克重')) {
    return {
      answer: `**藏红花【极地科学品饮与烹饪应用标准 (APP-001)】：**\n\n1. **标准用量**：单人单次标准克重为 **0.05g（约 5~8 根特级柱头花丝）**；\n2. **冲泡水温**：务必使用 **60℃~85℃ 纯净温水**。**严禁使用 100℃ 滚开水**（高温会破坏热敏性的西红花苷 Crocin 活性）；\n3. **耐泡特性**：冲泡 3~5 分钟即可析出明亮金黄汤色，可反复续水 **4~5 次**，最后可将花丝一并嚼食；\n4. **烹饪应用三大机制**：\n   - **赋色**：水溶性西红花苷赋予西班牙海鲜饭、高原酥油茶通透的金黄色；\n   - **压膻**：挥发性藏红花醛 (Safranal) 有效掩盖牛羊肉腥膻味；\n   - **提鲜**：藏红花苦素 (Picrocrocin) 与食材氨基酸产生鲜味协同增效。`,
      citations: ['APP-001 极地冲泡指南', 'ISO 3632 品饮规范', '食品感官与风味化学标准']
    };
  }

  if (q.includes('成分') || q.includes('西红花苷') || q.includes('苦素') || q.includes('藏红花醛') || q.includes('crocin') || q.includes('safranal') || q.includes('机理') || q.includes('药理')) {
    return {
      answer: `**藏红花三大核心特征活性化学成分及生理机理：**\n\n1. **西红花苷 (Crocin，藏红花素)**：罕见的天然双水溶性类胡萝卜素，呈现透亮金黄色，是抗氧化、清除自由基的核心主力，直接决定 ISO 3632 440nm 色价等级；\n2. **藏红花苦素 (Picrocrocin)**：单萜苷类成分，带来藏红花独特的清凉微苦特征口感，是天然的鲜味协同增效剂；\n3. **藏红花醛 (Safranal)**：由苦素在后熟干燥过程中裂解转化生成的单萜醛，具有强挥发性与热敏香气，赋予藏红花深邃的草本烟熏与蜂香特征香气。`,
      citations: ['ISO 3632:2011 国际检测标准', 'KNO-SCIENCE 生物化学底库', '色谱质谱分析数据库']
    };
  }

  if (q.includes('iso') || q.includes('3632') || q.includes('色价') || q.includes('等级') || q.includes('标准')) {
    return {
      answer: `**国际标准【ISO 3632:2011】藏红花等级评定与天旺实测：**\n\n- **国际等级划分**：ISO 3632 依据 440nm 紫外吸光度 E(1%, 1cm) 测定西红花苷色价：\n  - **一级品 (Category I)**：色价 >= 200（国际最高标准）；\n  - **二级品 (Category II)**：色价 170 ~ 199；\n  - **三级品 (Category III)**：色价 120 ~ 169；\n- **天旺实测数据**：重庆市食药检院实测天旺林芝藏红花 440nm 色价吸光度高达 **246**，超出国际特级品门槛 23%，达到国际最高品质梯队。`,
      citations: ['ISO 3632-1:2011 国际标准', '重庆食药检院 No. A26SW02809', '440nm 紫外分光光度法']
    };
  }

  if (q.includes('str') || q.includes('4000') || q.includes('壁垒') || q.includes('竞争') || q.includes('战略') || q.includes('优势')) {
    return {
      answer: `**天旺农牧【STR-4000 五层不可逆竞争壁垒模型】：**\n\n天旺农牧构建了行业领先的五层不可逆壁垒体系：\n1. **L1 物理设备层**：林芝 2945m 极地 CEA 设施控环大温室与环境调控硬件；\n2. **L2 运营流程层**：上海崇明 25g+ 壮球培育与林芝极地催花的两段式标准化 SOP；\n3. **L3 标准体系层**：拉萨海关出口检疫 CMP-001 与食药检院 0 农残认证；\n4. **L4 知识资产层**：Brand Content OS 全生命周期数字化知识产权与风土算法；\n5. **L5 生命管理系统层**：从种球生长代谢到分子级成分调控的生命系统工程。\n\n*核心壁垒公式：硬件可复制，但“极地风土算法 + 7级证据链 + 两段式生命管理”构建了长期不可逆竞争优势。*`,
      citations: ['STR-4000 战略壁垒模型', 'BCOS v14.0 核心架构', '7级硬核证据链矩阵']
    };
  }

  if (q.includes('产品') || q.includes('矩阵') || q.includes('有哪些') || q.includes('买什么')) {
    return {
      answer: `**天旺农牧【6 大全产业链产品矩阵】：**\n\n1. **特级纯净柱头花丝 (全花解耦 100%)**：手工精选三根相连特级红丝，色价 246，0 农残；\n2. **鲜花整朵低温真空冻干**：完整保留花瓣、雄蕊与柱头形态，用于高端礼遇与极地花茶；\n3. **水溶冷萃高活性提取物**：与香港宝芝林等联合开发高浓度西红花苷口服滋补品；\n4. **极地草本五季物候茶 & 精油浸膏**：天然草本复配，滋养气血与嗅觉芳疗；\n5. **B2B 医药级原料与 25g+ 优选母球**：向劲牌等知名药企供应纯净冷萃原液及种球繁育支持；\n6. **CEA 设施控环催花专利型产品**：设施农业技术授权与极地现代农业整套解决方案输出。`,
      citations: ['PROD-MATRIX 6大产品矩阵', '天旺官方产品白皮书', '拉萨海关出境备案 CMP-001']
    };
  }

  if (mode === 'science') {
    return {
      answer: `**关于藏红花科学认知的核心事实：**\n\n1. **特征成分**：西红花苷 (Crocin，赋金黄抗氧化)、藏红花苦素 (Picrocrocin，特征微苦与提鲜)、藏红花醛 (Safranal，挥发性深邃草本香)；\n2. **品饮准则**：推荐使用 60℃~85℃ 温水，单次 0.05g（5~8 根），绝不可使用 100℃ 沸水冲泡；\n3. **品质鉴别**：真品入水缓慢释放金黄透亮色带，水质清澈绝无红色浑浊，花丝久泡不碎烂。\n\n您可进一步提问：三大成分机理、ISO 3632 等级标准、0.05g 冲泡化学或水溶真伪鉴别法。`,
      citations: ['ISO 3632:2011 国际检测标准', 'APP-001 科学品饮指南', '藏红花植物生理学学术底库']
    };
  } else {
    return {
      answer: `**天旺农牧藏红花官方核心事实总览：**\n\n1. **基地与风土**：核心量产基地位于【西藏自治区林芝市巴宜区米瑞乡姆多村、广久村】，海拔 2945 米，背靠苯日神山，面临雅尼汇流处；\n2. **两段式农艺**：上海崇明平原大田繁育 25g+ 壮球 ➔ 西藏林芝 2945m CEA 温室无土悬空控环催花；\n3. **权威背书凭证**：拉萨海关出口检疫证书 (CMP-001，合规出口加拿大) 与重庆食药检院全项 0 农残报告 (No. A26SW02809，色价高达 246)；\n4. **产业合作**：与香港宝芝林、劲牌/劲酒建立深加工与原料定制战略合作。\n\n您可进一步提问：林芝基地坐标、0农残检测报告、宝芝林合作产品、两段式农艺或真伪辨别法。`,
      citations: ['SSOT 权威底库: BCOS v14.0', '拉萨海关出口凭证 CMP-001', '重庆食药检院报告 No. A26SW02809']
    };
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const query = body.question || body.query || '';
    const mode = body.mode || 'brand';
    const history = body.history || [];
    const provider = body.provider || 'amd';

    if (!query.trim()) {
      return new Response(JSON.stringify({ success: false, message: 'Question is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const amdApiKey = body.amdApiKey || (env && env.AMD_API_KEY) || DEFAULT_AMD_API_KEY;
    const amdEndpoint = body.amdEndpoint || (env && env.AMD_API_ENDPOINT) || DEFAULT_AMD_ENDPOINT;
    let amdModel = body.amdModel || (env && env.AMD_MODEL) || DEFAULT_AMD_MODEL;
    if (amdModel.includes('Flash-Flash')) {
      amdModel = amdModel.replace('Flash-Flash', 'Flash');
    }

    const geminiApiKey = body.geminiApiKey || (env && env.GEMINI_API_KEY) || GEMINI_API_KEY;
    const systemPrompt = (mode === 'science') ? TIANWANG_SCIENCE_COGNITION_PROMPT : TIANWANG_BRAND_SSOT_PROMPT;

    // 1. AMD Radeon API 调用辅助函数
    const callAmd = async () => {
      if (!amdApiKey) return null;
      const messages = [{ role: 'system', content: systemPrompt }];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-3).forEach(item => {
          if (item.question) messages.push({ role: 'user', content: item.question });
          if (item.answer) messages.push({ role: 'assistant', content: item.answer });
        });
      }
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
          temperature: 0.2,
          max_tokens: 1024
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
          answer: data.choices[0].message.content,
          citations: mode === 'brand'
            ? [`AMD GPU Radeon (${amdModel})`, '天旺品牌 SSOT 知识库 (BCOS v14.0)', '8 级硬核抗质疑证据链']
            : [`AMD GPU Radeon (${amdModel})`, 'ISO 3632:2011 国际标准', '藏红花植物生理学学术底库'],
          engine: 'amd-deepseek-v4'
        };
      }
      return null;
    };

    // 2. Google Gemini 调用辅助函数
    const callGemini = async () => {
      if (!geminiApiKey) return null;
      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-3).forEach(item => {
          if (item.question) contents.push({ role: 'user', parts: [{ text: item.question }] });
          if (item.answer) contents.push({ role: 'model', parts: [{ text: item.answer }] });
        });
      }
      contents.push({ role: 'user', parts: [{ text: query }] });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          answer: data.candidates[0].content.parts[0].text,
          citations: mode === 'brand' 
            ? ['Google Gemini 2.0 Flash', '天旺品牌 SSOT 知识库 (BCOS v14.0)', '8 级硬核抗质疑证据链']
            : ['Google Gemini 2.0 Flash', 'ISO 3632:2011 国际标准', '藏红花植物生理学学术底库'],
          engine: 'gemini-flash'
        };
      }
      return null;
    };

    let llmResult = null;

    if (provider === 'amd') {
      // 首选 AMD GPU (Radeon API)
      try {
        llmResult = await callAmd();
      } catch (err) {
        console.error('AMD Radeon API call failed, trying backup:', err);
      }
      // 备用 (Backup): Google Gemini
      if (!llmResult && geminiApiKey) {
        try {
          llmResult = await callGemini();
        } catch (geminiErr) {
          console.error('Gemini backup call failed:', geminiErr);
        }
      }
    } else if (provider === 'gemini') {
      // 首选 Google Gemini
      try {
        llmResult = await callGemini();
      } catch (geminiErr) {
        console.error('Gemini call failed, trying backup:', geminiErr);
      }
      // 备用 (Backup): AMD Radeon API
      if (!llmResult && amdApiKey) {
        try {
          llmResult = await callAmd();
        } catch (err) {
          console.error('AMD backup call failed:', err);
        }
      }
    }

    if (llmResult) {
      return new Response(JSON.stringify({
        success: true,
        answer: llmResult.answer,
        mode: mode,
        citations: llmResult.citations,
        engine: llmResult.engine
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // SSOT 智能确定性语义匹配
    const ssotResult = getDeterministicSSOTAnswer(query, mode);
    return new Response(JSON.stringify({
      success: true,
      answer: ssotResult.answer,
      citations: ssotResult.citations,
      mode: mode,
      engine: 'ssot-deterministic-engine'
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

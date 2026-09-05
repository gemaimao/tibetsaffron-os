/**
 * homecoming-elevate.js — 天旺藏红花 官网五大核心功能区全新交互驱动
 * 融合三大标杆：科研硬核奢华 + Bento Grid 信任中枢 + 风土编年社论
 */

// =========================================================================
// 1. 官方公报系统数据与控制 (Official Bulletin / Gazette)
// =========================================================================
const GAZETTE_ITEMS = [
  {
    id: "GZT-2026-001",
    category: "official",
    title: "天旺农牧官方声明书：关于打击侵权假冒与唯一线下零售实体声明",
    date: "2026-08-26",
    code: "TW-DEC-20260826",
    seal: "官方公文",
    desc: "天旺农牧从未设立任何外部总代理或渠道分销商。西藏林芝米瑞乡天旺基地内的“藏红花科技馆”（GPS: 29.476311°, 94.554110°）为线下唯一零售实体，支持官方电话 13549044959 溯源核验。"
  },
  {
    id: "GZT-2026-002",
    category: "quality",
    title: "深圳市计量质量检测研究院 (SMQ) 39 项农残质谱筛查检测公示",
    date: "2026-04-12",
    code: "WT10103260183295WT2",
    seal: "法定检测",
    desc: "依据 GB 23200 系列国家标准，经高分辨率质谱对有机磷、拟除虫菊酯、杀菌剂等 39 项农残进行全项扫描，实测结果全部低于方法定量限（全部未检出）。"
  },
  {
    id: "GZT-2026-003",
    category: "quality",
    title: "重庆市食品药品检验检测研究院西藏地标一级品检测公示",
    date: "2026-04-17",
    code: "No. A26SW02809",
    seal: "地标一级",
    desc: "抽检天旺林芝藏红花样品，西红花苷 440nm 吸光度色价高达 246（超 ISO 一级品 200 限值 23%），重金属铅镉合格，黄曲霉毒素未检出，符合 DB54/T 0245-2021 一级品技术要求。"
  },
  {
    id: "GZT-2026-004",
    category: "quality",
    title: "苏州飞凡检测：藏红花多糖与多酚斑马鱼生物模型科研测试公示",
    date: "2025-01-14",
    code: "FFZ202501145 / 144",
    seal: "科研测试",
    desc: "在特定斑马鱼高糖/高尿酸生物评价模型中，多糖组血糖降低 66.74% (P<0.001)，多酚组尿酸值减少 7.07% (P<0.01)。此数据为食品原料活性科研探索，不代表人体临床疾病治疗功效。"
  },
  {
    id: "GZT-2026-005",
    category: "official",
    title: "中华人民共和国拉萨海关《植物检疫证书》与出口报关公示",
    date: "2025-05-18",
    code: "CMP-001 / 报关单 2025-05",
    seal: "海关凭证",
    desc: "经中华人民共和国拉萨海关严格现场查验合格，天旺林芝藏红花合规向加拿大出口 2kg 特级花丝，货值 25.64 万元，折合单克出口单价 128.2 元/克。"
  },
  {
    id: "GZT-2026-006",
    category: "agro",
    title: "林芝米瑞乡姆多村年度农民工务工工资财务发放台账公示",
    date: "2025-11-20",
    code: "IND-001 (台账 30 万元)",
    seal: "乡村振兴",
    desc: "天旺林芝巴宜区基地全面带动当地藏族农牧民就业，年度务工工资直接发放 30 万元，实现极地特色高原特色农业深度赋能乡村振兴。"
  }
];

export function initOfficialGazette() {
  const overlay = document.getElementById("gazette-overlay");
  const drawerBody = document.getElementById("gazette-drawer-body");
  if (!drawerBody) return;

  renderGazetteList("all");

  window.openGazetteDrawer = (cat = "all") => {
    if (overlay) overlay.classList.add("active");
    renderGazetteList(cat);
  };

  window.closeGazetteDrawer = () => {
    if (overlay) overlay.classList.remove("active");
  };

  window.filterGazette = (cat) => {
    document.querySelectorAll(".gazette-tab-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-cat") === cat);
    });
    renderGazetteList(cat);
  };

  function renderGazetteList(cat) {
    const list = cat === "all" ? GAZETTE_ITEMS : GAZETTE_ITEMS.filter(i => i.category === cat);
    drawerBody.innerHTML = list.map(item => `
      <div class="gazette-item-card">
        <span class="seal-stamp">${item.seal}</span>
        <div class="gazette-item-title">${item.title}</div>
        <div class="gazette-item-meta">
          <span>📅 发布日期：${item.date}</span>
          <span>📜 编号：${item.code}</span>
        </div>
        <div class="gazette-item-desc">${item.desc}</div>
      </div>
    `).join("");
  }
}

// =========================================================================
// 2. 水溶真伪鉴真实验台交互驱动 (Water Test Sandbox)
// =========================================================================
let waterTested = false;

export function initWaterTestSandbox() {
  const btn = document.getElementById("water-test-btn");
  const authenticWater = document.getElementById("authentic-water");
  const fakeWater = document.getElementById("fake-water");
  const statusNote = document.getElementById("water-test-status");

  if (!btn) return;

  btn.addEventListener("click", () => {
    waterTested = !waterTested;
    if (waterTested) {
      if (authenticWater) authenticWater.classList.add("filled");
      if (fakeWater) fakeWater.classList.add("filled");
      btn.innerHTML = `<span>🔄 复位实验台</span>`;
      if (statusNote) {
        statusNote.innerHTML = `
          <strong style="color:#fbbf24">★ 天旺正品</strong>：喇叭口伸展，周围析出金黄色丝状色带，水体<b>明澈金黄绝无浑浊</b>。<br/>
          <strong style="color:#f87171">★ 劣质假冒</strong>：入水瞬间扩散成<b>浑浊红汤</b>，底部沉淀色素，花丝软烂褪白。
        `;
      }
    } else {
      if (authenticWater) authenticWater.classList.remove("filled");
      if (fakeWater) fakeWater.classList.remove("filled");
      btn.innerHTML = `<span>💧 注入 70℃ 纯净水进行真伪鉴别</span>`;
      if (statusNote) {
        statusNote.innerHTML = `点击上方按钮，模拟注入 70℃ 纯净温水，实时观察花丝水溶与色素析出机理。`;
      }
    }
  });
}

// =========================================================================
// 3. 产品要素宣讲中枢与冲泡模拟器 (Product Engine & Brewing Simulator)
// =========================================================================
const PRODUCT_DATA = {
  flower: {
    badge: "PROD-001 · 极地纯净特级品",
    title: "西藏天旺特级藏红花花丝 (1g/瓶 · 5g/礼盒)",
    desc: "采自林芝米瑞乡 2945m 极地 CEA 密闭大温室，无水无土悬空抽薹，纯物理级高洁净度，手工精选特级三柱头连体花丝。",
    l1: [
      { k: "440nm 色价吸光度", v: "实测 246 (超 ISO 一级品 200 标准 23%)" },
      { k: "水分及挥发物", v: "≤ 8.5% (符合 DB54/T 0245-2021 西藏地标)" },
      { k: "39 项农残质谱", v: "全项未检出 (深圳计量院 WT10103260183295WT2)" },
      { k: "黄曲霉毒素", v: "未检出 (重庆食药检院 No. A26SW02809)" }
    ],
    l2: [
      { k: "西红花苷 (Crocin)", v: "罕见水溶性双萜类胡萝卜素，天然金黄抗氧化主力" },
      { k: "藏红花苦素 (Picrocrocin)", v: "特征清凉微苦口感，鲜味协同增效因子" },
      { k: "藏红花醛 (Safranal)", v: "热敏性芳香单萜醛，高原昼夜大温差聚香" }
    ],
    l3: [
      { k: "第一阶段 (上海崇明)", v: "平原东滩深厚土壤大田壮球，培育 25g+ 优质壮硕母球" },
      { k: "第二阶段 (西藏林芝)", v: "移送林芝 2945m 温室，悬空抽薹开花，3000m 紫外线刺激合成" },
      { k: "干燥工艺", v: "45℃ 低温洁净热风控湿后熟，保留完整热敏性挥发组分" }
    ],
    l4: [
      { k: "斑马鱼科研降糖评价", v: "特定高糖斑马鱼模型下血糖降低 66.74% (飞凡检测 FFZ202501145)" },
      { k: "急性经口毒性评级", v: "LD50 > 5000mg/kg，达实际无毒级 (GB 15193.3)" },
      { k: "合规科研声明", v: "上述数据属食品原料生物活性科研评价，不代表人体临床治疗功效" }
    ]
  },
  polysaccharide: {
    badge: "PROD-002 · 香港宝芝林联合研发",
    title: "藏红花多糖固体饮品 / 高活性压片",
    desc: "天旺农牧与百年老字号香港宝芝林战略合作产品，采用低温微分子定向提取技术，高度富集藏红花特异性活性多糖成分。",
    l1: [
      { k: "多糖纯度指标", v: "特异性多糖含量 ≥ 32.5mg/g" },
      { k: "溶解性", v: "冷水即溶，10秒内完全水解透亮" },
      { k: "执行标准", v: "Q/TWNM 0002S 企标认证，获宝芝林质量监制" }
    ],
    l2: [
      { k: "主要活性基团", v: "水溶性酸性杂多糖，富含半乳糖、鼠李糖及阿拉伯糖链" },
      { k: "分子量分布", v: "低分子量易吸收多糖片段 (MW 5000~15000 Da)" }
    ],
    l3: [
      { k: "提取工艺", v: "三级逆流低温水浸提 + 膜分离超滤除杂" },
      { k: "纯化方式", v: "乙醇梯度分级醇沉 + 真空冷冻干燥粉碎" }
    ],
    l4: [
      { k: "斑马鱼生物模型活性", v: "斑马鱼高糖科研模型血糖降低 66.74% (P<0.001)" },
      { k: "学术科研结论", v: "激活糖酵解关键酶系表达，促进外周组织对葡萄糖的利用(科研阶段)" }
    ]
  },
  polyphenol: {
    badge: "PROD-003 · 香港宝芝林联合研发",
    title: "藏红花多酚复方颗粒 / 纯净浓缩液",
    desc: "定位于现代高尿酸与嘌呤代谢关注人群，依托极地富酚品种，联合香港宝芝林生物医药团队研发的高效植物多酚产品。",
    l1: [
      { k: "总多酚实测含量", v: "没食子酸当量 (GAE) ≥ 18.2mg/g" },
      { k: "重金属检测", v: "铅 ≤0.1mg/kg，砷 ≤0.05mg/kg，符合绿色食品标准" }
    ],
    l2: [
      { k: "多酚代表分子", v: "山奈酚黄酮苷、槲皮素衍生物、原花青素低聚物" },
      { k: "抗自由基活力", v: "DPPH 自由基清除 IC50 达到 0.042mg/mL" }
    ],
    l3: [
      { k: "温控工法", v: "40℃ 全程氮气保护逆流提取，避免多酚氧化聚合并变色" },
      { k: "精制结晶", v: "大孔吸附树脂脱盐纯化，保留天然活性多酚母核" }
    ],
    l4: [
      { k: "斑马鱼降尿酸活性", v: "斑马鱼高尿酸模型尿酸值减少 7.07% (P<0.01，飞凡检测 FFZ202501144)" },
      { k: "机理学术探索", v: "抑制黄嘌呤氧化酶 (XOD) 催化活性，降低尿酸生成(原料科研评价)" }
    ]
  },
  tea: {
    badge: "PROD-004 · 劲牌供应链战略原料",
    title: "藏红花纯净冷萃原液 ＆ 极地草本养生茶",
    desc: "与保健酒龙头劲牌/劲酒深度合作，定制供应的高纯度极地藏红花原料与大众级高端日常滋补茶饮包。",
    l1: [
      { k: "耐泡次数", v: "单包可反复冲泡 4~5 次，汤色持久金黄澄澈" },
      { k: "配料表", v: "100% 西藏林芝特级藏红花花丝，0添加、0防腐剂" }
    ],
    l2: [
      { k: "色香味平衡", v: "Crocin 赋金色 + Safranal 赋予深邃蜂草幽香" },
      { k: "适口性", v: "入口微苦回甘，温润滋补，无任何异味与酸涩感" }
    ],
    l3: [
      { k: "分装标准", v: "充氮铝箔独立保鲜锁香包装，阻隔光照与湿气" },
      { k: "供应链资质", v: "具备拉萨海关出口检疫 CMP-001 溯源认证" }
    ],
    l4: [
      { k: "日常品饮效益", v: "舒缓精神紧张、活血化瘀舒络、促进微循环健康" },
      { k: "烹饪赋能", v: "可用于西藏酥油茶、西班牙海鲜饭、清炖牛羊肉提鲜压膻" }
    ]
  }
};

let currentProdKey = "flower";
let currentPenLayer = "l1";

export function initProductEngine() {
  const selectPills = document.querySelectorAll(".prod-select-pill");
  const penTabs = document.querySelectorAll(".pen-tab-btn");
  const tempSlider = document.getElementById("brewing-temp-slider");

  // 产品切换
  selectPills.forEach(pill => {
    pill.addEventListener("click", () => {
      selectPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentProdKey = pill.getAttribute("data-prod");
      renderProductInfo();
    });
  });

  // 四层穿透选项卡切换
  penTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      penTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentPenLayer = tab.getAttribute("data-layer");
      renderPenetrationContent();
    });
  });

  // 冲泡模拟器水温滑动监听
  if (tempSlider) {
    tempSlider.addEventListener("input", (e) => {
      const temp = parseInt(e.target.value);
      const valDisplay = document.getElementById("temp-val-display");
      const tipDisplay = document.getElementById("brewing-status-tip");
      if (valDisplay) valDisplay.textContent = `${temp}℃`;

      if (tipDisplay) {
        if (temp < 60) {
          tipDisplay.innerHTML = `<span style="color:#94a3b8">❄ 水温偏低 (${temp}℃)：西红花苷析出缓慢，建议提升至 60℃~85℃ 纯净温水。</span>`;
        } else if (temp <= 85) {
          tipDisplay.innerHTML = `<span style="color:#fbbf24">✨ 黄金温水区间 (${temp}℃)：西红花苷活性完美激活，茶汤明澈金黄，蜂草幽香沁人，可续水 4~5 次！</span>`;
        } else if (temp <= 95) {
          tipDisplay.innerHTML = `<span style="color:#f97316">⚠️ 水温偏高 (${temp}℃)：挥发性藏红花醛蒸发加剧，建议稍微静置凉水片刻。</span>`;
        } else {
          tipDisplay.innerHTML = `<span style="color:#ef4444">❌ 严禁沸水 (${temp}℃)：100℃ 滚开水会直接破坏热敏性西红花苷分子结构，导致活性成分严重降解！</span>`;
        }
      }
    });
  }

  renderProductInfo();
}

function renderProductInfo() {
  const prod = PRODUCT_DATA[currentProdKey] || PRODUCT_DATA.flower;
  const badgeEl = document.getElementById("prod-badge");
  const titleEl = document.getElementById("prod-title");
  const descEl = document.getElementById("prod-desc");

  if (badgeEl) badgeEl.textContent = prod.badge;
  if (titleEl) titleEl.textContent = prod.title;
  if (descEl) descEl.textContent = prod.desc;

  renderPenetrationContent();
}

function renderPenetrationContent() {
  const prod = PRODUCT_DATA[currentProdKey] || PRODUCT_DATA.flower;
  const list = prod[currentPenLayer] || prod.l1;
  const container = document.getElementById("pen-content-card");
  if (!container) return;

  container.innerHTML = list.map(item => `
    <div class="pen-data-row">
      <span class="pen-data-key">${item.k}</span>
      <span class="pen-data-val">${item.v}</span>
    </div>
  `).join("");
}

// =========================================================================
// 4. 8大证据链卡片与原件弹窗 (Evidence Cascade & Lightbox)
// =========================================================================
const EVIDENCE_LIST = [
  {
    id: "EVD-001",
    title: "西藏地理标志保护产品一级品质检报告",
    inst: "重庆市食品药品检验检测研究院",
    code: "No. A26SW02809",
    tag: "Class A 法定地标",
    summary: "西红花苷 440nm 吸光度色价实测高达 246 (超 ISO 一级品 200 限值)，铅镉及黄曲霉毒素合格，符合 DB54/T 0245-2021 一级品技术要求。"
  },
  {
    id: "EVD-002",
    title: "大湾区 39 项农残高分辨质谱筛查报告",
    inst: "深圳市计量质量检测研究院 (SMQ)",
    code: "WT10103260183295WT2",
    tag: "39项全未检出",
    summary: "经有机磷、拟除虫菊酯等 39 项全项高分辨质谱扫描，实测结果全部低于方法定量限 (LOQ)，全部未检出。严禁脱离标准宣传绝对零农残。"
  },
  {
    id: "EVD-003",
    title: "藏红花多糖斑马鱼生物模型降糖测试报告",
    inst: "苏州飞凡检测科技中心",
    code: "FFZ202501145 (证书 14766127)",
    tag: "降低 66.74%",
    summary: "高糖斑马鱼科研模型下，多糖给药组血糖降低 66.74% (P<0.001)。数据属食品原料生物活性科研评价，不代表人体临床治疗功效。"
  },
  {
    id: "EVD-004",
    title: "藏红花多酚斑马鱼生物模型降尿酸测试报告",
    inst: "苏州飞凡检测科技中心",
    code: "FFZ202501144 (证书 83942872)",
    tag: "减少 7.07%",
    summary: "高尿酸斑马鱼模型下尿酸值减少 7.07% (P<0.01)。此数据为食品原料科学机理探索，严禁宣称降尿酸药品功效。"
  },
  {
    id: "EVD-005",
    title: "急性经口毒理实验检验报告 (实际无毒级)",
    inst: "国家法定毒理学评价资质实验室",
    code: "GB 15193.3-2014 标准",
    tag: "实际无毒级",
    summary: "藏红花样品经口毒理 LD50 > 5000 mg/kg 体重，按国家食品安全毒理学程序评定为“实际无毒级”，安全边际高。"
  },
  {
    id: "EVD-006",
    title: "天旺农牧关于无外部总代理与唯一零售实体声明",
    inst: "西藏天旺农牧科技官方声明书",
    code: "TW-DECLARATION-2026",
    tag: "官方维权公文",
    summary: "确认公司未设外部代理，直营实体为西藏林芝米瑞乡天旺基地藏红花科技馆 (GPS: 29.476311°, 94.554110°)，防伪电话 13549044959。"
  },
  {
    id: "EVD-007",
    title: "拉萨海关《植物检疫证书》与出口加拿大凭证",
    inst: "中华人民共和国拉萨海关",
    code: "CMP-001 (报关货值 25.64万)",
    tag: "出海检疫凭证",
    summary: "顺利通过拉萨海关现场检验检疫并签发《植物检疫证书》，合规出口加拿大特级藏红花 2kg，单克出口单价高达 128.2 元/克。"
  },
  {
    id: "EVD-008",
    title: "米瑞乡姆多村 30 万元农民工务工工资发放凭证",
    inst: "林芝市巴宜区米瑞乡姆多村村委会",
    code: "IND-001 (财务打款台账)",
    tag: "乡村振兴实录",
    summary: "天旺林芝基地长期带动西藏米瑞乡当地藏族农牧民就业，年度农民工务工工资发放台账达 30 万元，实现生态保护与乡村振兴良性循环。"
  }
];

export function initEvidenceCascade() {
  const container = document.getElementById("evidence-waterfall-grid");
  const lightbox = document.getElementById("evidence-lightbox");
  const lightboxContent = document.getElementById("lightbox-content");

  if (!container) return;

  container.innerHTML = EVIDENCE_LIST.map(evd => `
    <div class="evd-card" onclick="openEvidenceDetail('${evd.id}')">
      <div>
        <span class="evd-seal-tag">${evd.tag}</span>
        <div class="evd-id">${evd.id}</div>
        <div class="evd-title">${evd.title}</div>
        <div class="evd-institution">🏛 ${evd.inst} ｜ 📜 ${evd.code}</div>
        <div class="evd-claim-pill">${evd.summary}</div>
      </div>
      <div class="evd-click-hint"><span>🔍 点击查阅法定报告与合规准则</span> ➔</div>
    </div>
  `).join("");

  window.openEvidenceDetail = (id) => {
    const evd = EVIDENCE_LIST.find(e => e.id === id);
    if (!evd || !lightbox || !lightboxContent) return;

    lightboxContent.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <span style="display:inline-block; font-size:11px; background:rgba(212,160,23,0.2); color:#fbbf24; border:1px solid rgba(212,160,23,0.4); padding:3px 10px; border-radius:12px; margin-bottom:8px; font-weight:700;">${evd.id} · ${evd.tag}</span>
          <h3 style="font-size:18px; color:#fff; font-family:'Noto Serif SC',serif;">${evd.title}</h3>
        </div>
        <button onclick="closeEvidenceLightbox()" style="background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <div style="background:#060912; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:18px; font-size:13px; line-height:1.7;">
        <p style="color:#94a3b8; margin-bottom:8px;"><strong>权威出具机构：</strong> ${evd.inst}</p>
        <p style="color:#94a3b8; margin-bottom:8px;"><strong>法定编号/标准：</strong> <code style="color:#fbbf24; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px;">${evd.code}</code></p>
        <p style="color:#cbd5e1; margin-bottom:0;"><strong>核心检测与事实结论：</strong> ${evd.summary}</p>
      </div>

      <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:10px; padding:12px 16px; margin-bottom:20px;">
        <h4 style="font-size:12.5px; color:#f87171; font-weight:700; margin-bottom:4px;">⚠️ 官方合规红线声明 (Compliance Redline)</h4>
        <p style="font-size:11.5px; color:#cbd5e1; line-height:1.5; margin:0;">
          严禁脱离本检测报告的实验条件泛化宣传；生物模型数据属于科学活性机理探索，严格恪守国家《食品安全法》与《广告法》，不得借此宣称疾病治疗或保健药品功效。
        </p>
      </div>

      <div style="text-align:right;">
        <button onclick="closeEvidenceLightbox()" style="background:linear-gradient(135deg, #d4a017, #d97706); border:none; color:#000; font-weight:700; padding:8px 24px; border-radius:8px; cursor:pointer; font-size:13px;">关闭核验窗口</button>
      </div>
    `;
    lightbox.classList.add("active");
  };

  window.closeEvidenceLightbox = () => {
    if (lightbox) lightbox.classList.remove("active");
  };
}

// =========================================================================
// 全局启动初始化
// =========================================================================
export function initAllElevateFeatures() {
  initOfficialGazette();
  initWaterTestSandbox();
  initProductEngine();
  initEvidenceCascade();
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initAllElevateFeatures();
  });
}

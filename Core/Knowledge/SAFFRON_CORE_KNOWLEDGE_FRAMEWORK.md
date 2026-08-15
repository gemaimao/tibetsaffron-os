# Brand Content OS — SAFFRON KNO 8 大一级知识域规范架构 (Single Source of Truth)

**架构版本**: `v1.0 SSOT Architecture`  
**核心原则**: **单一事实源 (SSOT) + 8 大知识域 (Knowledge Domains) + 8 维原子化属性 + 场景无损取数**  
**解耦原理**: **核心库负责理解藏红花 (Kernel Understanding)；媒体场景负责按需调用 (Media Execution)**。  
**更新时间**: 2026-08-08  

---

## 🏛️ 1. SAFFRON CORE KNOWLEDGE 8 大一级知识域 (8 Knowledge Domains)

```text
SAFFRON CORE KNOWLEDGE (藏红花核心知识库 SSOT)
├── K01 植物本体族 (Plant Anatomy & Taxonomy)
├── K02 生命机制族 (Life Mechanism & Physiology)
├── K03 繁育与农艺族 (Breeding & Agronomy / CEA)
├── K04 环境与风土族 (Environment & Terroir)
├── K05 品质与加工族 (Quality & Post-Harvest Processing)
├── K06 成分与科学族 (Chemistry & Bioactive Phytochemistry)
├── K07 人类利用族 (Human Utilization & Product Applications)
└── K08 文明与产业族 (Civilization, Economics & Industry)
```

---

## 🔬 2. 标准原子化知识单元规范元数据结构 (Atomic Unit Schema)

核心库中每一个知识单元（如 `K02-004 先花后叶`）不再是一篇零散文章，而是一个包含 **8 维精准元数据** 的标准化实体文件：

```yaml
id: "K02-004"
name: "先花后叶"
domain: "K02 生命机制族"
tags: ["生理特征", "花期机制", "反常识"]

# 1. 事实 (Scientific Fact)
fact: "藏红花（Crocus sativus）在初秋夜间温度下降触发下，球茎先抽薹开花，花期结束后或开花同时才长出绿叶。"

# 2. 解释 (Biological Explanation)
explanation: "开花完全依赖球茎在前一生长季积蓄的碳水化合物与养分，无需实时光合作用与土壤供水供养。"

# 3. 认知 (Cognitive Value)
cognition: "颠覆常规植物‘先长叶后开花’的固有认知；证明室内无土无水开花的科学合理性（球茎即电池）。"

# 4. 关键词 (Keywords)
keywords: ["先花后叶", "球茎蓄能", "花芽分化", "秋花型", "极地适应"]

# 5. 关联知识 (Linked Knowledge Units)
linked_units:
  - "K02-001 球茎"
  - "K03-002 室内无土开花"
  - "K05-003 零雨水污染"

# 6. 来源与出处 (Source Traceability)
sources:
  - "Saffrosystems Book 7 (Foliage & Emergence Timeline)"
  - "eFloras Flora of China: Crocus sativus"

# 7. 证据等级 (Evidence Level)
evidence_level: "L1_Scientific_Peer_Reviewed" # L1-同行评审论文/L2-权威机构检测/L3-行业标准

# 8. 可传播性与 Hook (Virality & Hook)
virality:
  hook: "你知道吗？世界上有一种极其高贵的植物，它不需要泥土和水，而且是先开花、再长叶！"
  angle: "反常识 / 自然奇观 / 极客科普"
```

---

## 🔀 3. 媒体场景与五级分层呈现机制 (5-Layer Scene Mapping)

同一个原子化知识单元（如 `K02-004`），通过 5 层结构化演进，被不同媒体场景调用：

```text
                  【知识原文层 (Raw Knowledge)】
                               │
                  【标准知识层 (Standard Atom)】 (如：K02-004 先花后叶)
                               │
                  【Q&A 问答层 (Q&A Interface)】
                               │
                  【传播表达层 (Communication Hook)】
                               │
    ┌──────────────────────────┼──────────────────────────┐
    ▼                          ▼                          ▼
【短视频 / 社交媒体】       【展馆 / 深度图文】       【产品页 / 电商详情页】
调用：Hook + 一句话认知   调用：机制 + 时间轴      调用：品质 + 品牌关联
```

### 场景调用映射示例：

| 媒体场景 | 场景诉求 (Task Demand) | 从 `K02-004` 调取的字段 | 最终生成结果示例 |
| --- | --- | --- | --- |
| **抖音 / 小红书** | 反常识 Hook + 轻量科普 | `virality.hook` + `cognition` | “你可能不知道，藏红花有时候是先开花，再长叶！因为它把养分都存进了球茎电池里！” |
| **展厅大屏 / 导览** | 植物机制 + 时间轴展墙 | `fact` + `explanation` + 时间轴 | “秋季气温降至 15℃ 以下，球茎首先抽薹开花（先花后叶）；开花积累的养分将在冬春季反哺子球茎。” |
| **电商详情页** | 品牌品质关联 | `cognition` + `K03-002` 关联 | “采用室内无土开花技术，匹配‘先花后叶’原生生理，全程避尘避雨，保持特级花丝纯净度。” |
| **新闻通稿** | 严谨科学与新质生产力 | `fact` + `evidence_level` | “基于藏红花‘先花后叶’与球茎养分自给的生理特征，天旺农牧创新推出了室内无土开花两段式农艺。” |

---

## 🎯 4. 8 大知识域全量原子化单元目录规划 (K01 - K08 Master Catalog)

### K01 植物本体族 (Plant Anatomy & Taxonomy)
- `K01-001` 三倍体不育性 (Triploid Sterility)
- `K01-002` 雌蕊三叉柱头 (Three-Barred Stigma)
- `K01-003` 雄蕊花粉与花黄 (Stamen & Pollen)
- `K01-004` 紫色花被片 (Perianth Segments)
- `K01-005` 膜质包片与花茎 (Spathe & Floral Tube)

### K02 生命机制族 (Life Mechanism & Physiology)
- `K02-001` 球茎即电池 (The Corm is the Battery)
- `K02-002` 顶芽与侧芽分化 (Terminal & Axillary Buds)
- `K02-003` 收缩根与拉力机制 (Contractile Roots)
- `K02-004` 先花后叶生理 (Hysteranthous Blooming)
- `K02-005` 营养生长期 (Vegetative Growth Phase)
- `K02-006` 子球茎膨大与养分转移 (Daughter Corm Formation)
- `K02-007` 夏季高温休眠 (Summer Dormancy)

### K03 繁育与农艺族 (Breeding & Agronomy / CEA)
- `K03-001` 露地栽培与球茎腐败病风险 (Field Cultivation & Fusarium)
- `K03-002` 室内无土悬空开花 (Soilless Indoor Flowering)
- `K03-003` 室内室外“两段式”模式 (Two-Stage Farming System)
- `K03-004` 人工抹芽控品质农艺 (Debudding Optimization)
- `K03-005` 气雾培与增产机制 (Aeroponics & 4.2x Yield)
- `K03-006` PAR 光谱配方调控 ($250\sim 300\ \mu\text{mol/m}^2/\text{s}$)
- `K03-007` 水分胁迫提质法 (Strategic Water Stress)
- `K03-008` 盛花期采摘能力规划 (Harvest Capacity Planner)
- `K03-009` 日本 1910 竹田式历史农艺 (Taketa Method 1910)

### K04 环境与风土族 (Environment & Terroir)
- `K04-001` 地中海与伊朗-土兰干旱气候区 (Irano-Turanian Climate)
- `K04-002` 高海拔 3,000 米强紫外线逆境 (High-Altitude UV Stress)
- `K04-003` 15℃ 昼夜大温差刺激 (Diurnal Temperature Variation)
- `K04-004` 伊朗加恩/霍拉桑风土 (Qaen & Khorasan Terroir)
- `K04-005` 西班牙拉曼查 PDO 风土 (La Mancha PDO)
- `K04-006` 希腊克罗克斯 PDO 风土 (Krokos Kozanis PDO)
- `K04-007` 意大利纳韦利谷地 PDO 风土 (Navelli Valley PDO)
- `K04-008` 克什米尔潘波尔谷地风土 (Kashmir Pampore Terroir)
- `K04-009` 西藏林芝巴宜区米瑞乡极地风土 (Linzhi Tibet Terroir)

### K05 品质与加工族 (Quality & Post-Harvest Processing)
- `K05-001` 黄金采收期（花蕾微张） (Optimal Harvest Window)
- `K05-002` 烘干即化学转化 (Drying as Chemistry)
- `K05-003` 避光避雨花粉零附着 (Pollen-Free Pure Harvesting)
- `K05-004` 药剂师级避光密封防潮储藏 (Store Like a Pharmacist)
- `K05-005` ISO 3632 国际分级标准与 440nm 色价 (ISO 3632 Grade 1)
- `K05-006` 8 种高精度掺假防伪检测技术 (8 Anti-Adulteration Techs)
- `K05-007` DB54/T 0245-2021 西藏地标一级标准
- `K05-008` 重庆食药检院 0 农残认证 (No. A26SW02809)

### K06 成分与科学族 (Chemistry & Bioactive Phytochemistry)
- `K06-001` 藏红花素 (Crocin) 与水溶金黄色素
- `K06-002` 藏红花苦素 (Picrocrocin) 与风味物质
- `K06-003` 藏红花醛 (Safranal) 与香气转化
- `K06-004` 番红花酸 (Crocetin) 与强抗氧化力
- `K06-005` 花瓣山奈酚与多酚抗炎提取物 (Petal Bioactives)
- `K06-006` 5-羟色胺调节与改善睡眠机理 (Serotonin & Sleep Physiology)

### K07 人类利用族 (Human Utilization & Product Applications)
- `K07-001` 4℃ 冰萃与 60℃ 温水金萃 SOP
- `K07-002` 西班牙海鲜饭与星级餐桌美学 (Culinary Masterpiece)
- `K07-003` 藏红花原朵花（整朵冻干）高附加值产品
- `K07-004` 欧盟“清洁美容” (Clean Beauty) 护肤原料
- `K07-005` 藏红花精油与香精深加工 (Essential Oils & Aromas)

### K08 文明与产业族 (Civilization, Economics & Industry)
- `K08-001` 圣托里尼古希腊壁画采花历史 (Santorini Fresco)
- `K08-002` 唐代西土鬱金朝贡与宫廷“龙脑鬱金藉地”文化
- `K08-003` 阿拉伯/波斯《医典》强心与悦心记载 (Avicenna Canon)
- `K08-004` 欧洲控制 90% 国际市场高溢价真相 (European 90% Market Rule)
- `K08-005` 全球 15 大 CEA 头部企业份额对标 (Global CEA Top 15)
- `K08-006` 期货价格、库存政策与天气低相关性 (Saffron Economics)
- `K08-007` 藏红花农业旅游 (Agritourism) 成功模式

/**
 * Brand Content OS (BCOS) - Seed Data (Sprint 0 ~ Sprint 7 Assets)
 * Implements SSOT Principles, 5 Core Modules & SFR-KNO Deep Cognition + Evidence Layer
 */

export const INITIAL_MODULES = [
  {
    id: 'mod-com',
    code: 'COM',
    name: 'Communication',
    description: '品牌传播层：核心口号、宣传文案、公关声明与 Pitch points',
    icon: 'ri-message-3-line',
    sort: 1,
    status: 'Published',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z'
  },
  {
    id: 'mod-kno',
    code: 'KNO',
    name: 'Knowledge',
    description: 'SFR-KNO 藏红花深度认知知识库：9 大 Master 知识族、34 Master 骨架与双重解耦',
    icon: 'ri-book-open-line',
    sort: 2,
    status: 'Published',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z'
  },
  {
    id: 'mod-vis',
    code: 'VIS',
    name: 'Visual',
    description: '品牌视觉层：色彩规范、4K 现场镜头、包装 Token',
    icon: 'ri-palette-line',
    sort: 3,
    status: 'Published',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z'
  },
  {
    id: 'mod-dat',
    code: 'DAT',
    name: 'Data & Evidence',
    description: 'Evidence & Data Layer 证据与数据层：双重缺口矩阵 (Tianwang vs Category) ＆ 7 级效力层级',
    icon: 'ri-bar-chart-box-line',
    sort: 4,
    status: 'Published',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z'
  },
  {
    id: 'mod-brd',
    code: 'BRD',
    name: 'Brand Behavior',
    description: '品牌内核与行为层：愿景、使命、核心价值观、语气指南与法理防线',
    icon: 'ri-compass-3-line',
    sort: 5,
    status: 'Published',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z'
  }
];

export const INITIAL_TAGS = [
  { id: 'tag-ssot', name: 'SSOT', color: '#3b82f6', description: 'Single Source of Truth' },
  { id: 'tag-sfr-kno', name: 'SFR-KNO', color: '#8b5cf6', description: '藏红花深度认知底库' },
  { id: 'tag-evidence', name: 'Evidence & Data', color: '#10b981', description: '7 级证据与数据层' },
  { id: 'tag-pdf-distill', name: 'Academic PDF', color: '#ec4899', description: '808 页学术巨著补强' },
  { id: 'tag-positioning', name: '定位', color: '#8b5cf6', description: '品牌核心定位' },
  { id: 'tag-architecture', name: '架构', color: '#06b6d4', description: '系统与产品架构' },
  { id: 'tag-metrics', name: '核心指标', color: '#f59e0b', description: 'Brand & Quality Metrics' }
];

export const INITIAL_ASSETS = [
  {
    id: 'asset-kno-sfr-master',
    uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380sfr',
    module_id: 'mod-kno',
    asset_code: 'KNO-SFR-MASTER',
    title: 'SFR-KNO 藏红花深度认知知识库 34 Master 骨架 (v14.0)',
    subtitle: 'Saffron Deep Cognition Skeleton & 9 Master Domains',
    summary: '面向泛兴趣受众与消费者的藏红花深度认知底库。涵盖 9 大 Master 知识族、34 Master 骨架与真假识别专题。',
    content: `# SFR-KNO 藏红花深度认知知识库 (v14.0)

## 9 大 Master 深度认知知识族
1. **01 本体认知**: 藏红花究竟是什么？ (柱头占 7% 干重，花瓣与花药解耦)
2. **02 生命与繁育**: 它是怎样活着与延续下一代的？ (三倍体不育 $2n=3x=24$，收缩根沉降力学)
3. **03 生产方式**: 它是怎样被生产出来的？ (去农艺化，自然变量 ➔ 可控变量)
4. **04 全球产区**: 世界哪里种？为什么不同？ (四级穿透：全球 ➔ 国家 ➔ 产区 ➔ 小产区)
5. **05 加工与品质**: 它如何从花变成商品？ (采后脱水、Crocin/Safranal 多维品质平衡)
6. **06 标准与真假**: 怎么判断它是什么、好不好？ ("产地证明你是谁，检测证明你是什么")
7. **07 历史文化**: 为什么人类长期重视它？ (美索不达米亚/希腊神话考古事实，文化不强套科学)
8. **08 传统与研究**: 藏红花今天发生了什么？ (功效全标 RESEARCH/VERIFY，组学时代)
9. **09 消费与使用**: 买回来后怎么保存、使用与理解？ (防潮、避光密封、冲泡与识别)

## 「藏红花真假与品质识别」 6 大 Master 节点
- **SFR-20.4**: 为什么藏红花历史上特别容易成为掺假对象？
- **SFR-20.5**: 藏红花常见造假/掺假的 5 种类型解耦
- **SFR-34.1**: 为什么“粉末形态”比“完整花丝”更需要警惕？
- **SFR-21.1**: 消费者肉眼初筛指南 (看形态/看颜色/看气味/看身份)
- **SFR-22.3**: **打碎“家庭一杯水验真”迷信！** 确立肉眼初筛 ➔ 标准检测 ➔ 实验室分析三级防线
- **SFR-23.1**: “真假 ➔ 品质 ➔ 产地 ➔ 标准 ➔ 保存” 四维决策矩阵解耦`,
    quote: '产地证明你是谁，检测证明你是什么。',
    status: 'Published',
    version: 'v14.0',
    created_at: '2026-08-08T17:30:00Z',
    updated_at: '2026-08-08T17:30:00Z',
    tag_ids: ['tag-sfr-kno', 'tag-ssot']
  },
  {
    id: 'asset-dat-evidence-layer',
    uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380dat',
    module_id: 'mod-dat',
    asset_code: 'DAT-EVIDENCE-LAYER',
    title: 'Evidence & Data Layer 双重证据缺口矩阵与 7 级效力层级',
    subtitle: 'Dual Evidence Gap Matrix & 7-Level Proof Hierarchy',
    summary: '建立天旺实测证据 (Tianwang Evidence) 与行业通用证据 (Category Evidence) 双矩阵，支持文案反向抗质疑检索。',
    content: `# Evidence & Data Layer (证据与数据层)

## 7 级证据效力层级 (Proof Hierarchy)
- **Level 1 政府官方文件**: 拉萨海关检疫证书与出口报关单 (\`CMP-001\`)、商标专利证 (\`CMP-002\`)
- **Level 2 第三方实验室数据**: 食药检院 0农残报告 (No. A26SW02809)、HPLC 色价峰图 (\`SCI-001\`)
- **Level 3 长期与动力学实验**: 水温溶出动力学曲线 (\`SCI-002\`)、24个月避光稳定性 (\`SCI-003\`)
- **Level 4 企业原始记录**: 姆多村农户务工名册与 30万元工资签收单 (\`IND-001\`)
- **Level 5 现场高清视觉**: 米瑞乡 4K 采摘 RAW 盘视频 (\`VIS-001\`)
- **Level 6 体外研究证据**: DPPH/ABTS 自由基清除 (\`SCI-004\` 降级，严禁宣称人体抗衰老)
- **Level 7 企业应用 SOP**: 星级餐厅 0.05g 克重卡 (\`APP-001\`)

## 双重证据缺口矩阵
- **Tianwang Evidence**: 包含出口加拿大 25.64 万元、30万工资单、0农残实测图谱。
- **Category Evidence**: 包含 UN Comtrade 159国海关额、ISO 3632 规范书、希腊 Krokos Kozanis PDO 法规。`,
    quote: '拒绝盲目营销，建立“事实/数据 ➔ 证据链 ➔ 科学解释 ➔ 消费者认知”反向抗质疑链条。',
    status: 'Published',
    version: 'v14.0',
    created_at: '2026-08-08T17:45:00Z',
    updated_at: '2026-08-08T17:45:00Z',
    tag_ids: ['tag-evidence', 'tag-metrics']
  },
  {
    id: 'asset-kno-pdf-distill-01',
    uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380pdf',
    module_id: 'mod-kno',
    asset_code: 'KNO-PDF-DISTILL-01',
    title: '学术 PDF 巨著 10 大精选补强 Master 节点 (CRC Press ＆ Elsevier)',
    subtitle: 'Academic PDF Distillation: Biology, Genetics & Omics',
    summary: '从 808 页学术巨著《藏红花生物学和生物技术》与《藏红花：科学、技术与健康》中提炼的 10 大深打 Master 节点。',
    content: `# 学术 PDF 10 大精选补强 Master 节点
1. **PDF-SFR-02.3**: 三倍体减数分裂异常与难依靠种子繁殖的遗传决定 ($2n=3x=24$)
2. **PDF-SFR-01.2**: Crocin (色)、Picrocrocin (苦)、Safranal (香) 三大分子感官解耦
3. **PDF-SFR-22.2**: 色谱/光谱/NMR/DNA/电子鼻推动检测从经验走向科学数据
4. **PDF-SFR-20.4**: 高单价、少柱头、粉末难辨与数百年的掺假防伪史
5. **PDF-SFR-34.1**: 完整花丝识别度 vs 粉末化防伪门槛降低
6. **PDF-SFR-04.2**: 柱头与花被片代谢组学差异（花被片富含黄酮）与产品逻辑解耦
7. **PDF-SFR-11.1**: IoT 营养液膜水培与从“寻地”走向“主动控环”
8. **PDF-SFR-30.3**: 组学时代：从“检测有什么成分”到“研究成分生命表达过程”
9. **PDF-SFR-24.1**: 文化使用记录文明赋予的意义，绝不等于现代科学功效证明
10. **PDF-SFR-24.2**: 考证文献警惕 *Crocus sativus* 与姜黄 (*Curcuma*)、红花 (*Carthamus*) 名称混淆`,
    quote: '深层基因组学与转录调控隔离至 PRO 层，仅保留改变消费者认知的 Master 学术节点。',
    status: 'Published',
    version: 'v1.0',
    created_at: '2026-08-08T17:31:00Z',
    updated_at: '2026-08-08T17:31:00Z',
    tag_ids: ['tag-pdf-distill', 'tag-sfr-kno']
  },
  {
    id: 'asset-kno-sfr-gastronomy',
    uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380gas',
    module_id: 'mod-kno',
    asset_code: 'KNO-SFR-GASTRONOMY',
    title: '藏红花美食烹饪化学与林芝五季时令物候饮品体系 (v1.0)',
    subtitle: 'Saffron Gastronomy, Culinary Chemistry & Linzhi 5-Season Drinks',
    summary: '涵盖全球四大经典藏红花料理化学原理、林芝五季物候特调饮品体系与工布在地美食（石锅焖饭/松茸蒸蛋/天麻鱼汤）。',
    content: `# 藏红花美食烹饪化学与林芝五季时令物候体系

## 烹饪化学三大作用机制
1. **水溶金黄视觉赋色**: Crocin 水溶极佳，赋予金黄鲜艳汤色；
2. **挥发性香气协同**: Safranal 热力挥发，压制牛羊肉与海鲜腥膻，提供蜂草复合芳香；
3. **抑腥提鲜与回甘**: Picrocrocin 微苦回甘，作为鲜味协同增效剂 (Umami Enhancer)。

## 全球四大经典藏红花料理
- 西班牙海鲜饭 (*Paella Valenciana*)、意大利米兰烩饭 (*Risotto alla Milanese*)、法国马赛鱼汤 (*Bouillabaisse*)、伊朗/印度藏红花香米 (*Sholeh Zard*)。

## 林芝五季物候特调饮品体系
- **10-11月（采摘期）**: 【金秋新生】黄精藏红花特调
- **12-2月（深冬营养期）**: 【雪域苔林】米林灵芝藏红花暖茶
- **3-4月（初春营养期）**: 【桃花灼灼】桃花山丁子酸奶奶盖
- **5月前后（营养后期）**: 【高山草木】沙参当归嫩叶清润饮
- **6-8月（休眠期）**: 【白玉金丝】藏红花鲜核桃仁冰淇淋
- **9-10月（抽芽期）**: 【苹果热力】天麻糖心苹果陈皮特饮

## 林芝在地创新美食
- 米瑞石锅焖饭（藏红花水焖紫青稞/人参果/藏香猪腊肉/松茸）；
- 藏红花松茸蒸蛋（金黄蛋羹 + 鲜切松茸丁）；
- 藏红花桃花盐焖高原鱼汤（天麻鱼头 + 金汤透亮）。`,
    quote: 'Crocin 赋金黄，Safranal 压腥膻，Picrocrocin 提鲜回甘。',
    status: 'Published',
    version: 'v1.0',
    created_at: '2026-08-08T18:00:00Z',
    updated_at: '2026-08-08T18:00:00Z',
    tag_ids: ['tag-sfr-kno', 'tag-ssot']
  },
  {
    id: 'asset-com-1001',
    uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    module_id: 'mod-com',
    asset_code: 'COM-1001',
    title: '天旺藏红花品牌定位与核心使命',
    subtitle: 'Tianwang Saffron Positioning & Mission',
    summary: '定义天旺基于西藏林芝高原极地风土与两段式控环的现代藏红花品牌主张。',
    content: `# 天旺藏红花 品牌定位

## 核心主张
天旺结合西藏林芝天然极地风土与崇明大田/设施两段式控环技术，致力于打造 0 农残、高色价的现代科学藏红花第一品牌。

## 三大防线
1. **真实原点**：西藏林芝米瑞乡基地的真实极地环境
2. **科学验证**：重庆市食药检院 0农残报告 (No. A26SW02809)
3. **法理出境**：拉萨海关植物检疫出口证书 (出口加拿大 25.64万元)`,
    quote: '西藏极地风土 + 两段式科学控环，打造 0 农残高色价藏红花。',
    status: 'Published',
    version: 'v1.0',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
    tag_ids: ['tag-ssot', 'tag-positioning']
  }
];

export const INITIAL_VERSIONS = INITIAL_ASSETS.map(asset => ({
  id: `ver-${asset.id.replace('asset-', '')}-v1.0`,
  asset_id: asset.id,
  version: asset.version,
  title: asset.title,
  subtitle: asset.subtitle,
  summary: asset.summary,
  content: asset.content,
  quote: asset.quote,
  editor: 'Brand Content OS Architect',
  created_at: asset.created_at
}));

export const INITIAL_RELATIONS = [
  {
    id: 'rel-1',
    source_asset_id: 'asset-com-1001',
    target_asset_id: 'asset-kno-sfr-master',
    relation_type: 'Reference',
    description: '品牌传播引用 SFR-KNO 藏红花深度认知知识库',
    created_at: '2026-08-08T17:40:00Z'
  },
  {
    id: 'rel-2',
    source_asset_id: 'asset-com-1001',
    target_asset_id: 'asset-dat-evidence-layer',
    relation_type: 'Support',
    description: '品牌传播依赖 7 级证据与数据层反向抗质疑检索',
    created_at: '2026-08-08T17:46:00Z'
  },
  {
    id: 'rel-3',
    source_asset_id: 'asset-kno-sfr-master',
    target_asset_id: 'asset-kno-pdf-distill-01',
    relation_type: 'Enhance',
    description: '学术 PDF 10 大节点增强 SFR-KNO 底层认知厚度',
    created_at: '2026-08-08T17:32:00Z'
  }
];

export const INITIAL_RELEASES = [
  {
    id: 'rel-v1.0-saffron-os',
    name: 'Release v1.0 Saffron Brand Content OS (Master Release)',
    version: 'v1.0-Master',
    description: '全量归档 SFR-KNO 9 大 Master 知识族、34 Master 骨架、学术 PDF 10 大节点与 7 级证据层。',
    status: 'Released',
    created_at: '2026-08-08T17:50:00Z',
    asset_version_ids: INITIAL_VERSIONS.map(v => v.id)
  }
];

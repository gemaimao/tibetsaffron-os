# Brand Content OS — V2.3 Temporal State Governance Specification

**Task ID**: `CORE-V2.3-GOVERNANCE-UPGRADE`  
**Specification Title**: `Temporal State Governance (时间状态与演进治理)`  
**Status**: `Active & Enforced Specification`  
**Core Purpose**: Solve the agricultural technology lifecycle boundary issue, preventing historical development stages (e.g. 崇明育球) or future experimental directions (e.g. CEA 智能植物工厂) from being misquoted as current production capabilities.

---

## ⏳ 1. Temporal States (时间状态七级状态枚举)

Every Asset in Brand Content OS MUST explicitly define its **Temporal State**:

```text
[ORIGIN] ──► [HISTORICAL] ──► [EVOLUTION] ──► [CURRENT] ──► [EXPERIMENT] ──► [FUTURE]
                                                                  └──► [UNKNOWN]
```

| Temporal State | Category Name | Description | Communication Permission Boundary | Example |
| --- | --- | --- | --- | --- |
| **`ORIGIN`** | 源头与引入事件 | 种源最早的生物学与地理起源 | 仅作为品牌与植物史考证依据 | 西班牙/地中海种源引入历史 |
| **`HISTORICAL`** | 历史演进阶段 | 早期探索阶段的生产农艺路线 | **允许**: 作为企业里程碑 (`MILESTONE`) 或叙事 (`STORY`)；<br/>**严禁**: 代表天旺“当前生产模式” | 崇明大田养球适应性本土化阶段 (2016-2018) |
| **`CURRENT`** | 当前生产体系 | 正在商业化运行的现行农艺与设施 | **允许**: 作为天旺核心能力、事实 (`FACT`) 与差异 (`DIFFERENTIATOR`) 宣称 | 西藏林芝设施控环催花与投入品管理体系 (2018-至今) |
| **`EVOLUTION`** | 演进拓扑关系 | 跨时间维度的农艺升级路径 | 用于构建过去 ➔ 现在 ➔ 未来的技术演进图谱 | 从露天大田栽培向设施控环农业的演进路线 |
| **`EXPERIMENT`** | 试验研发阶段 | 内部中试或实验室验证中的技术 | 仅允许作为研发进度报告，严禁作为量产能力发稿 | 高原低压气密催花试验 |
| **`FUTURE`** | 未来规划方向 | 战略规划或未来设施农业愿景 | **允许**: 战略探索方向；<br/>**严禁**: 代表天旺当前已有能力 | 全自动无人化 IoT 植物工厂规划 |
| **`UNKNOWN`** | 时间未明 | 缺乏确切时间标注的素材 | **硬性拦截**: 必须核实时间后方可发布 | 未标明年份的旧活动照片 |

---

## 🔗 2. EVOLUTION Relationship Type (技术演进关系拓扑)

V2.3 引入 **`EVOLUTION`** 显式关系拓扑：

$$\text{Asset A (HISTORICAL: 崇明大田养球)} \xrightarrow{\quad \text{EVOLUTION} \quad} \text{Asset B (CURRENT: 林芝设施控环)} \xrightarrow{\quad \text{EVOLUTION} \quad} \text{Asset C (FUTURE: CEA 植物工厂)}$$

- 在合成公关稿或新闻稿时，系统自动识别 `EVOLUTION` 关系：
  - 将 `HISTORICAL` 资产放置于“企业发展历程/里程碑”章节；
  - 将 `CURRENT` 资产放置于“核心能力/当前生产体系”章节。

---

## 📋 3. Temporal Governance Cases (真实治理案例)

### Case 01: 崇明育球
- **Temporal State**: `HISTORICAL` (2016-2018 早期探索阶段)
- **Allowed Usage**: “天旺早期在崇明完成了西班牙种球的中国本土化驯化与养球积累。” (功能: `MILESTONE` / `STORY`)
- **Forbidden Usage**: “天旺藏红花目前采用崇明大田育球模式生产。” (违反 Temporal Governance 规则)

### Case 02: 林芝设施控环催花
- **Temporal State**: `CURRENT` (2018年至今现行体系)
- **Allowed Usage**: “天旺藏红花目前在西藏林芝基地全面实行设施控环催花与无尘采收。” (功能: `FACT` / `DIFFERENTIATOR`)

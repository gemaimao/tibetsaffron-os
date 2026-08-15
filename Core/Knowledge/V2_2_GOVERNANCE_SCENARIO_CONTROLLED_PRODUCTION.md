# Brand Content OS — V2.2 Scenario-Controlled Content Production Governance Specification

**Governance Version**: `V2.2`  
**Effective Date**: `2026-08-09`  
**Status**: `Active & Enforced`  
**Core Purpose**: Upgrade content production capability from pure Asset management to **Scenario-Controlled Content Production (Asset + Evidence + Scenario OS)**. Ensure strict boundaries, evidence readiness validation, claim binding, and clean public delivery.

---

## 🏛️ 1. Scenario Matrix (场景组合规则规则矩阵)

Every communication scenario possesses its own strict Asset Invocation Protocol. Material selection is no longer determined by arbitrary AI retrieval, but by system-enforced scenario rules.

| Scenario Code | Scenario Name | Primary Assets (必选项) | Secondary Assets (可选项) | Restricted / Forbidden Assets (严禁混入) | Required Evidence Level |
| --- | --- | --- | --- | --- | --- |
| `OFFICIAL_PR` | 官方公关新闻通稿 | 海关凭证 (`CMP-001`)、0农残报告 (`SCI-001`)、核心技术骨架 | 极地风土微气候、现代农艺体系 | **严禁**: 菜谱、饮品配方、五季物候特调、生活方式小常识、未核实草稿 | **Level 1 & Level 2** (已核实) |
| `MEDIA_FEATURE` | 商业与产业深度报道 | 品牌故事、产业突破、海关出口提单、0农残报告 | 文化传播中心简介、CSR 社会责任 | **限制**: 具体菜谱配方与生活小常识 | **Level 1 ~ Level 4** |
| `BRAND_STORY` | 品牌长效认知 | 极地风土、历史考证、34 Master 科技骨架 | 7级证据矩阵、体验单元 | **限制**: 内部审计表格、草稿数据 | **Level 1 ~ Level 5** |
| `LIFESTYLE` | 消费认知与生活方式 | 产品体验、冲泡 SOP (0.05g)、五季物候特调、烹饪化学 | 品牌故事、风土人文 | **严禁**: 内部审计编码 (`KNO-xxxx`, `SCI-001`)、论文式角标 `[1]` | **Level 7** (应用 SOP) |
| `INVESTOR` | 商业壁垒与招商 BP | CEA 设施控环、0农残数据、海关出口货值、产业规模 | 品牌愿景、合作模式 | **严禁**: 娱乐性素材、未经核实的财务预测草稿 | **Level 1 ~ Level 4** |

---

## 🚦 2. Readiness State Machine (8 级素材就绪度状态机)

Materials are governed by an 8-state machine. External public release requires `VERIFIED` or `PUBLISHED` state. AI is strictly prohibited from treating arbitrary `DRAFT` or `UNVERIFIED` knowledge as verified evidence.

```text
[UNVERIFIED] ──► [DRAFT] ──► [INTERNAL_REVIEW] ──► [VERIFIED] ──► [PUBLISHED]
                                                       │
                                                       ├──► [EXPIRED]
                                                       ├──► [SUPERSEDED]
                                                       └──► [RESTRICTED]
```

1. **`UNVERIFIED`** (未核实): 刚采集的原始线索或未确认数据，禁止任何引用。
2. **`DRAFT`** (草稿): 撰写或规划中的素材（如水温溶出曲线、农户工资单草稿），仅限内部查看，**严禁进入任何公关稿**。
3. **`INTERNAL_REVIEW`** (内部审核中): 正在合规或法务审核中的素材。
4. **`VERIFIED`** (已核实): 原始凭证（如海关检疫单据 `CMP-001`、食药检院报告 `No. A26SW02809`）已验证无误，**准予对外合成**。
5. **`PUBLISHED`** (已发布): 已正式归入 SSOT 唯一可信源库，全局可信。
6. **`EXPIRED`** (已过期): 过期的检测报告或作废的文件，禁止公关引用。
7. **`SUPERSEDED`** (已被替代): 被新版检测报告或新版本替代的历史版本。
8. **`RESTRICTED`** (受限使用): 包含保密商业信息或特定限制的素材。

---

## 🔗 3. Evidence Binding (Claim ➔ Evidence 图谱图谱)

Factual claims are no longer arbitrary text strings. Every externally verifiable claim MUST be bound to a verified Evidence Asset through `Claim -> Evidence` links.

```text
CLAIM-001: "2025年5月成功向加拿大出口2公斤高品质藏红花，出口货值25.64万元人民币。"
  ├── Evidence ID: CMP-001
  ├── Evidence Type: Customs / Phytosanitary Certificate (拉萨海关《植物检疫证书》及出口报关单)
  ├── Readiness: VERIFIED
  └── Allowed Scenarios: OFFICIAL_PR, MEDIA_FEATURE, INVESTOR

CLAIM-002: "天旺藏红花样品经全项检测，黄曲霉毒素未检出，农药残留指标达到全项0农残极高标准。"
  ├── Evidence ID: SCI-001
  ├── Evidence Type: 3rd-Party Lab Report (重庆市食药检院检验报告 No. A26SW02809)
  ├── Readiness: VERIFIED
  └── Allowed Scenarios: OFFICIAL_PR, MEDIA_FEATURE, BRAND_STORY, INVESTOR
```

---

## 📄 4. Output Modes (三阶输出模式)

System supports 3 distinct output rendering modes:

1. **`AUDIT` (内部审计模式)**:
   - Displays all internal Asset IDs (`KNO-7424`), Evidence IDs (`CMP-001`, `SCI-001`), and bracket footnotes (`[1]`, `[2]`).
   - Used exclusively for internal factual auditing and legal compliance check.
2. **`EDITORIAL` (编辑审稿模式)**:
   - Hides raw internal codes, but preserves internal evidence traceability links and section metadata for editorial review.
3. **`PUBLIC` (媒体发布模式 - 彻底净化)**:
   - **Completely purges**: All Asset IDs, Evidence codes (`CMP-001`), system metadata, and footnote brackets `[1][2]`.
   - Delivers pure, fluent, press-ready Chinese journalism.

---

## 🛡️ 5. Scientific Claim Guardrail (科学表达防线规则)

- **Mandatory Rule**: Environmental control / CEA / greenhouse cultivation must **NOT** automatically be represented as the direct causal reason for "zero pesticide residue".
- **Scientific Fact Boundary**: CEA environmental control provides conditions for input management and contamination prevention; whether zero pesticide residue is achieved MUST be supported by the batch's 3rd-party laboratory testing report (`No. A26SW02809`).
- **Required Distinction**:
  - `Production Method` (生产方式) $\neq$
  - `Environmental Control` (环境控制) $\neq$
  - `Input Management` (投入品管理) $\neq$
  - `Testing Result` (检测结果)
  - **Never collapse these 4 distinct layers into one simplified causal claim.**

---

## 🧪 6. Scenario Regression Test Specification (OFFICIAL_PR 回归测试规范)

- **Test Name**: `Scenario Regression Test: OFFICIAL_PR Gastronomy Leakage & Unverified Evidence Guard`
- **Test Input Pool**: Contains `CMP-001` (Customs Export), `SCI-001` (0 Pesticide Report), Agricultural CEA Tech, Rural Employment Draft, Gastronomy Recipes, Beverage SOP, Five-Season Beverage System, and Unverified Dissolution Curve Draft.
- **Expected Outcome for OFFICIAL_PR**:
  - ✅ **MUST Include**: Customs Export Evidence, 0-Pesticide Evidence, Core CEA Technology, Industrial Significance.
  - ⚪ **MAY Include**: Origin/Terroir, Agricultural System Overview.
  - 🚫 **MUST NOT Include**: Recipes, Beverage Formulas, Five-Season Drinks, Lifestyle Content, Gastronomy Details, Unverified Planning Materials.
- **Pass/Fail Criteria**: If any recipe, beverage, or unverified draft appears in `OFFICIAL_PR`, test **FAILS**.

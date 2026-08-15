# KU-5231 Canonical Framework Catalog

**Asset ID**: KU-5231  
**Asset Name**: Canonical Framework Catalog  
**Parent Asset**: KU-5230 Framework Registry  
**Status**: Production Complete  
**Architecture**: Frozen  
**Repository**: Committed  
**Layer**: Knowledge Layer  

---

## 1. Mission

作为 Repository 中首套正式的 Canonical Framework 注册目录。

确定三级框架层级体系（L1 Universal / L2 Domain / L3 Project），将知识组织能力全面沉淀为可跨领域复用的结构化认知单元。

---

## 2. Framework Taxonomy（三级层级体系）

Repository 中所有 Framework 划分为以下三个层级：

* **L1 Universal Framework（通用框架）**：适用于所有 Repository 与全品类知识系统（例：知识生产、治理、AI 消费、认知演化）。
* **L2 Domain Framework（领域框架）**：适用于某一个行业或领域（例：农业、医药、制造、餐饮、品牌）。
* **L3 Project Framework（项目框架）**：适用于特定品牌或项目（例：天旺藏红花、Brand Content OS）。

---

## 3. Catalog Schema (Frozen)

每一个 Framework 使用统一 Schema，本 Schema 自本 Asset 起正式冻结：

```text
Framework ID: FRM-XXXXXX
Canonical Name: 官方名称
Level: L1 Universal / L2 Domain / L3 Project
Purpose: 解决的核心问题
Problem: 明确的问题上下文
Inputs: 引用的 Entity / Concept / Principle ID
Outputs: 产生的认知产出 / 推论结构
Concepts: 关联的 COG-CON ID 列表
Principles: 遵循的 PRN ID 列表
Dependencies: 依赖的其他 Framework ID
Consumers: 被哪些下游 Asset / Agent 消费
Status: Draft / Published / Deprecated
Version: 版本
```

---

## 4. Release-v0.4 Framework Catalog

### L1 Universal Frameworks (通用的底层知识框架)

| ID | Framework Name | Level | Core Purpose / Inputs & Outputs |
| --- | --- | --- | --- |
| `FRM-UF-1000` | Knowledge Production Framework | L1 | **Input**: Entity, Concept, Principle → **Output**: Knowledge Unit |
| `FRM-UF-1100` | Knowledge Validation Framework | L1 | **Input**: Evidence, Citation → **Output**: Reviewed / Verified Asset |
| `FRM-UF-1200` | Repository Governance Framework | L1 | **Input**: Version, Lifecycle → **Output**: Archived / Managed Asset |
| `FRM-UF-1300` | AI Consumption Framework | L1 | **Input**: LLM, GraphRAG, Agent → **Output**: Structured API Response |
| `FRM-UF-1400` | Content Generation Framework | L1 | **Input**: Knowledge → Narrative → **Output**: Article / Video / Presentation |
| `FRM-UF-1500` | Cognitive Evolution Framework | L1 | **Input**: Concept → Framework → Claim → **Output**: Revision / Evolution |

### L2 Domain Frameworks (领域知识框架示例)

| ID | Framework Name | Domain | Description |
| --- | --- | --- | --- |
| `FRM-AGR-1000` | 品质形成框架 | Agriculture | 解析风土、生命周期与环境对品质的协同形成机制 |
| `FRM-AGR-1100` | 种质迁移框架 | Agriculture | 描述物种在跨区域适应与驯化过程中的技术与生态拓扑 |
| `FRM-AGR-1200` | 植物生命周期框架 | Agriculture | 组织植物发育阶段与栽培管理要素的双层映射结构 |
| `FRM-BRD-1000` | 品牌认知框架 | Brand | 组织品牌主张、认知节点与用户心智演化路径 |
| `FRM-BRD-1100` | 品牌资产框架 | Brand | 定义品牌可资产化的知识单元与无形壁垒模型 |

### L3 Project Frameworks (项目知识框架示例)

| ID | Framework Name | Project | Description |
| --- | --- | --- | --- |
| `FRM-TW-1000` | 生命迁徙框架 | 天旺藏红花 | 描述地中海到西藏林芝的物种、技术与文化迁徙链路 |
| `FRM-TW-1100` | 极地新风土框架 | 天旺藏红花 | 组织高原强光照、高海拔、昼夜温差与特定土壤的品质链路 |
| `FRM-TW-1200` | 品质形成框架 | 天旺藏红花 | 西藏林芝室内+室外两段式 CEA 种植的有效成分积累框架 |
| `FRM-TW-1300` | 标准竞争框架 | 天旺藏红花 | 从企业标准到国际标准（ISO）的认知主权建立框架 |

---

## 5. Architectural Consensus（核心表达视图原则）

在 Repository 知识架构中：

```text
Entity (所存) → Concept (所理解) → Principle (所遵循) → Framework (所组织)
```

1. **Framework 为唯一核心结构**：Framework 是知识组织层（Knowledge Organization Layer）的基础支柱。
2. **视图化派生机制**：
   * **Mental Model（心智模型）**：Framework 的认知精简/图解视图。
   * **Narrative Pattern（叙事模式）**：Framework 的故事/时序表达视图。
   * **Taxonomy（分类体系）**：Framework / Concept / Entity 的树状索引视图。
3. 保持单事实来源（Single Source of Truth），避免在后续 Asset 中重复设计冗余的基础结构。

---

## 6. Definition of Done

KU-5231 完成后达到以下目标：
* 建立了 Universal / Domain / Project 三级 Framework 架构。
* Repository 拥有首批 L1 通用框架资产（UF-1000 ~ UF-1500）。
* 明确了 Mental Model、Narrative Pattern 与 Framework 的视图派生关系。
* 从对象到框架的完整闭环确立。

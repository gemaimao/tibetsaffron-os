# KU-5210 Concept Registry

**Asset ID**: KU-5210
**Asset Name**: Concept Registry
**Parent**: KU-5200 Canonical Cognitive Model
**Status**: Production
**Layer**: Knowledge Layer

---

## 1. Mission

建立 Repository 中唯一合法的 Concept 注册表。

任何 Concept：
* 必须注册；
* 必须拥有唯一身份；
* 必须可引用；
* 必须可版本管理。

未经注册的 Concept，不允许进入 Repository。

---

## 2. 什么是 Concept？

在 KU-5210 中采用统一定义：

Concept 是对多个 Entity、Relationship 和 Evidence 的抽象认知单元，用于表达品牌理解世界的方式，而非客观对象本身。

因此：
* **Entity** 回答：“世界中存在什么？”
* **Concept** 回答：“我们如何理解这些对象？”

---

## 3. Concept Qualification（准入标准）

一个对象只有同时满足以下条件，才能成为 Concept：

### C1 抽象性（Abstraction）
不能是具体对象。
* ❌ 藏红花（Entity）
* ✅ 生命迁徙（Concept）

### C2 稳定性（Stability）
生命周期应长期存在。
* ✅ 极地新风土
* ❌ 2026 春季营销主题

### C3 可复用性（Reusability）
必须能够被多个 Claim、Narrative 或 Framework 重复引用。

### C4 可定义性（Definability）
必须能够写出明确的定义和边界。不能依赖语境猜测。

### C5 可组合性（Composability）
必须能够参与 Framework、Mental Model 和 Narrative 的构建。

---

## 4. Canonical Schema

每一个 Concept 使用统一 Schema：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| Concept ID | ✓ | 全局唯一，如 COG-CON-000001 |
| Canonical Name | ✓ | 官方名称 |
| Definition | ✓ | 标准定义 |
| Boundary | ✓ | 包含什么、不包含什么 |
| Purpose | ✓ | 解决什么认知问题 |
| Referenced Entities | ✓ | 引用的 Entity ID |
| Parent Concept | | 上级概念 |
| Child Concepts | | 下级概念 |
| Related Concepts | | 横向关联 |
| Supported Frameworks | | 被哪些 Framework 使用 |
| Supported Claims | | 支撑哪些 Claim |
| Keywords | | 检索关键词 |
| Version | ✓ | 当前版本 |
| Status | ✓ | Draft / Published / Deprecated |

---

## 5. Concept Lifecycle

Draft -> Review -> Published -> Referenced -> Revised -> Deprecated

说明：
* **Candidate**：提出候选概念。
* **Draft**：完成初稿定义。
* **Review**：审查定义、边界和重复性。
* **Published**：正式注册，可被引用。
* **Referenced**：已有下游资产引用。
* **Revised**：更新定义，保留 ID、增加版本号。
* **Deprecated**：停止新增引用，保留历史记录。

---

## 6. Concept Governance（治理规则）

建立 Concept 必须遵循以下规则：

**Rule 1：唯一性**
Repository 中同一认知只能存在一个 Canonical Concept。
例如：“生命迁徙”。不得再出现：“生命的迁徙”、“迁徙生命”、“生命迁移” 作为新的 Canonical Concept。这些只能作为 Alias 或检索词。

**Rule 2：边界清晰**
每个 Concept 必须回答：它是什么？它不是什么？它为什么存在？

**Rule 3：引用优先**
任何 Framework、Narrative、Claim 必须引用已有 Concept，而不是重新定义。

**Rule 4：禁止营销词注册**
以下类型不得注册为 Concept：季度口号、广告语、临时活动名称、一次性传播主题。Concept 必须具有长期知识价值。

---

## 7. Registry Organization

Concept Registry 建议按领域组织，而非按时间组织：

```text
Concept Registry
│
├── Natural System
├── Ecology
├── Agriculture
├── Technology
├── Civilization
├── Medicine
├── Standardization
├── Industry
├── Brand Cognition
└── Repository Principles
```
这种组织方式更利于跨项目复用，也更适合知识图谱和 AI 检索。

---

## 8. Definition of Done

KU-5210 完成后，应满足：
* Repository 中所有 Concept 都已注册。
* 每个 Concept 均拥有唯一 ID。
* 每个 Concept 都有标准定义与边界。
* 所有下游资产只能引用 Concept ID。
* 不存在自由文本概念或重复概念。
* Concept 可直接作为 GraphRAG、知识图谱和 AI 推理的语义节点。

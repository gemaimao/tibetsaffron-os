# KU-5230 Framework Registry

**Asset ID**: KU-5230  
**Asset Name**: Framework Registry  
**Parent Asset**: KU-5200 Canonical Cognitive Model  
**Status**: Production Complete  
**Architecture**: Frozen  
**Repository**: Committed  
**Layer**: Knowledge Layer  

---

## 1. Mission

建立 Repository 中唯一合法的 Framework 注册体系。

Framework 是多个 Concept、Principle、Entity 和 Relationship 的有序组织结构，用于解决某一类持续存在的问题。

Framework 不是文章，不是流程，也不是思维导图，它是可重复引用的知识结构。

---

## 2. Framework Definition

**定义**：

Framework 是由多个 Canonical Concept 在 Canonical Principle 约束下构成的结构化认知模型，用于解释、分析、设计或决策某一类问题。

Framework 的职责是**组织知识**，而不是产生知识。

---

## 3. Qualification（准入标准）

一个对象必须同时满足以下条件才能注册为 Framework：

* **F1 Multi-Concept（多概念关联）**：至少引用两个已注册 Concept。
* **F2 Goal-oriented（目标导向）**：必须服务一个明确的问题或目标（例：品质形成分析、技术迁移分析、品牌叙事设计）。
* **F3 Reusable（可复用）**：能够跨多个项目、文档、Agent 或场景复用。
* **F4 Stable（稳定性）**：不是一次性方案，而是长期可维护的组织模型。
* **F5 Composable（可组合性）**：能够作为更高层 Framework 的组成部分。

---

## 4. Canonical Schema

所有 Framework 使用统一 Schema：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| Framework ID | ✓ | 全局唯一（`FRM-XXXXXX`） |
| Canonical Name | ✓ | 官方名称 |
| Purpose | ✓ | 解决的问题 |
| Scope | ✓ | 适用范围 |
| Inputs | ✓ | 引用的 Entity / Concept / Principle |
| Structure | ✓ | 框架组成与逻辑拓扑 |
| Outputs | ✓ | 产生的结果/推论 |
| Dependencies | | 依赖的其他 Framework ID |
| Consumers | | 被哪些 Asset / Narrative 使用 |
| Status | ✓ | Draft / Published / Deprecated |
| Version | ✓ | 版本 |

---

## 5. Framework Lifecycle

`Candidate` → `Draft` → `Review` → `Published` → `Referenced` → `Revised` → `Deprecated`

保持与 Entity、Concept、Principle 完全一致。

---

## 6. Governance Rules

所有 Framework 必须遵循以下治理规则：

* **Rule 1：引用优先**：Framework 不创建 Concept、Entity 或 Principle，只引用已有对象。
* **Rule 2：结构优先**：Framework 定义对象之间的组织关系，而不是扩写对象内容。
* **Rule 3：边界明确**：每个 Framework 必须说明适用范围和不适用范围。
* **Rule 4：可拆解**：Framework 应能够拆分为多个可独立维护的子模块。
* **Rule 5：版本演进**：Framework 可以升级结构，但 Framework ID 保持不变。

---

## 7. Registry Organization

按 Framework 的用途组织，而非行业组织：

```text
Framework Registry
├── Analytical Frameworks
├── Cognitive Frameworks
├── Production Frameworks
├── Quality Frameworks
├── Governance Frameworks
├── Narrative Frameworks
└── Strategy Frameworks
```

这种组织方式便于跨品牌、跨领域复用。

---

## 8. Definition of Done

KU-5230 完成后达到以下目标：

* Framework 拥有统一 Schema。
* Framework 不再混入 Concept 或 Principle。
* 所有 Framework 均通过引用构建。
* Framework 可作为 AI、GraphRAG、知识图谱和内容生成的高级组织单元。
* Repository 中不存在未注册的知识框架。

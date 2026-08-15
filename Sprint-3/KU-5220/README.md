# KU-5220 Principle Registry

**Asset ID**: KU-5220  
**Asset Name**: Principle Registry  
**Parent Asset**: KU-5200 Canonical Cognitive Model  
**Status**: Production Complete  
**Architecture**: Frozen  
**Repository**: Committed  
**Layer**: Knowledge Layer  

---

## 1. Mission

建立 Repository 中唯一合法的 Principle 注册体系。

所有长期有效、跨项目适用、用于指导判断和决策的原则，都必须注册为 Canonical Principle。

任何文档、Framework、Claim 或 Agent 不得自行创造新的 Principle，而必须引用已注册的 Principle ID。

---

## 2. Principle Definition

**定义**：

Principle 是一种长期稳定、可重复应用、能够指导判断、设计、决策和知识生产的规范性规则。

Principle 不描述某一具体事实，而描述面对一类问题时应遵循的基本规则。

---

## 3. Principle Qualification（准入标准）

一个对象必须同时满足以下条件才能注册为 Principle：

* **P1 Long-term（长期性）**：至少具有长期适用价值，不依赖某个项目阶段。
* **P2 Decision-guiding（指导决策）**：能够直接影响设计、判断或执行。
* **P3 Reusable（可复用）**：能够被多个 Framework、Claim、Workflow 或 Agent 引用。
* **P4 Technology-neutral（技术中立）**：原则应独立于具体工具、模型或实现方式（例如：✔ Repository First，✘ 使用 Neo4j）。
* **P5 Verifiable（可验证）**：原则应能够通过执行结果验证是否被遵守。

---

## 4. Canonical Schema

所有 Principle 使用统一 Schema：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| Principle ID | ✓ | 全局唯一（`PRN-XXXXXX`） |
| Canonical Name | ✓ | 标准名称 |
| Statement | ✓ | 原则陈述 |
| Intent | ✓ | 设计意图 |
| Scope | ✓ | 适用范围 |
| Constraints | ✓ | 约束条件 |
| Exceptions | | 例外情况 |
| Related Concepts | ✓ | 引用 Concept ID (`COG-CON-XXXXXX`) |
| Supported Assets | | 适用资产 |
| Status | ✓ | Draft / Published / Deprecated |
| Version | ✓ | 版本 |

---

## 5. Principle Lifecycle

`Candidate` → `Draft` → `Review` → `Published` → `Referenced` → `Revised` → `Deprecated`

生命周期与其他 Registry 保持完全一致。

---

## 6. Governance Rules

所有 Principle 必须遵循以下治理规则：

* **Rule 1：唯一原则**：同一规则只能存在一个 Canonical Principle。
* **Rule 2：禁止事实化**：Principle 不得陈述具体事实（例：✘ 西藏藏红花品质最好）。
* **Rule 3：禁止营销化**：不得注册广告语、品牌口号或阶段性传播语（例：✘ 世界领先、高端品质）。
* **Rule 4：禁止工具绑定**：不得绑定具体软件、数据库、模型或供应商。
* **Rule 5：必须可执行**：每个 Principle 都应能够回答：“如果违反它，会产生什么后果？”若无法回答，则说明其不可执行，不应注册。

---

## 7. Registry Organization

按适用层级组织，而非业务领域组织：

```text
Repository Principles
├── Knowledge Principles
├── Cognitive Principles
├── Architecture Principles
├── Production Principles
├── Governance Principles
├── Quality Principles
└── AI Principles
```

这种组织方式有利于跨品牌、跨项目复用。

---

## 8. Definition of Done

KU-5220 完成后达到以下状态：

* Repository 中所有原则均拥有唯一 Principle ID。
* 所有 Principle 均具有统一 Schema。
* Principle 与 Concept、Framework、Claim 职责边界清晰。
* Repository 中不存在自由定义的长期规则。
* 所有下游资产均通过 Principle ID 引用原则。

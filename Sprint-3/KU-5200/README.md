# KU-5200 Canonical Cognitive Model

**Asset ID**: KU-5200
**Asset Name**: Canonical Cognitive Model
**Status**: Frozen
**Position**:
```text
Repository
    ↓
Master Data（KU-5100）
    ↓
Cognitive Layer（KU-5200）
    ↓
Claim Layer（KU-5300）
```

---

## 1. Purpose

KU-5200 是 Brand Content OS 的认知引擎。

它不保存事实（Entity），也不保存结论（Claim）。

它定义：**Repository 如何组织知识、解释知识，并形成统一认知。**

---

## 2. Scope

KU-5200 管理七类 Cognitive Object。

**COG-Concept**
品牌概念。
例如：生命迁徙、生态代偿、极地新风土、认知主权。

**COG-Principle**
原则。
例如：Repository First、Evidence First、标准先于传播。

**COG-Framework**
框架。
例如：生命迁徙框架、产业价值框架、标准体系框架。

**COG-MentalModel**
认知模型。
例如：风土 ↓ 品质 ↓ 标准 ↓ 品牌。

**COG-Taxonomy**
分类体系。
例如：植物 ↓ 球茎 ↓ 花 ↓ 柱头。

**COG-Narrative**
叙事模板。
例如：发现 ↓ 迁徙 ↓ 扎根 ↓ 进化 ↓ 未来。

**COG-Boundary**
概念边界。
例如：生态代偿 ≠ 生态补偿。

*(注：原计划的 Cognitive Network 在 KU-5800 统一构建，避免冗余)*

---

## 3. Canonical Object Schema

所有 Cognitive Object 使用统一结构。

| 字段 | 必填 |
| --- | --- |
| Cognitive ID | ✓ |
| Object Type | ✓ |
| Canonical Name | ✓ |
| Definition | ✓ |
| Boundary | ✓ |
| Parent | |
| Children | |
| Related Concepts | |
| Referenced Entities | ✓ |
| Supported Claims | |
| Version | ✓ |
| Status | ✓ |

---

## 4. Production Rules

每一个 Cognitive Object 必须：
* 表达一个认知对象。
* 可以被多个 Claim 引用。
* 不允许直接描述事实。
* 不允许直接作为 Evidence。
* 不允许依赖文档存在。

---

## 5. Dependency Rules

固定依赖关系：

```text
Entity
  ↓
Concept
  ↓
Framework
  ↓
Mental Model
  ↓
Claim
  ↓
Evidence
```

**禁止反向依赖。**

---

## 6. Repository Rules

**任何文档**：不得创建 Concept，只能引用 `COG-******`。
**任何 Claim**：不得重新解释 Concept，只能引用 `COG ID`。

---

## 7. Deliverables

KU-5200 完成交付七个子资产：

* **KU-5210** Concept Registry
* **KU-5220** Principle Registry
* **KU-5230** Framework Registry
* **KU-5240** Mental Model Registry
* **KU-5250** Taxonomy Registry
* **KU-5260** Narrative Pattern Registry
* **KU-5270** Semantic Boundary Registry

---

## 8. Definition of Done

完成 KU-5200 后，应达到以下状态：
* 所有品牌核心概念拥有唯一 Cognitive ID。
* 所有认知对象均可独立引用。
* 所有 Claim 必须引用至少一个 Cognitive Object。
* Repository 中不存在自由定义的概念。
* 后续 COM、VIS、DAT、GraphRAG 与 AI Agent 均通过 KU-5200 获取统一认知语义。

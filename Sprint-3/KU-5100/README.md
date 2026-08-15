# KU-5100 Canonical Entity Registry

**Asset ID**: KU-5100
**Asset Name**: Canonical Entity Registry
**Release**: Release-v0.4
**Status**: Draft → Frozen
**Layer**: Knowledge Layer

---

## Purpose

建立 Brand Content OS 全局唯一的实体主数据体系（Master Entity Registry），作为所有 Knowledge Unit 的唯一引用源。

任何 Knowledge Unit（Concept、Claim、Evidence、Timeline、Relationship 等）都不得直接创建新的实体，而必须引用 KU-5100 中已经注册的 Canonical Entity。

---

## 1. Entity Definition

Entity 是能够在 Repository 中拥有独立身份（Identity）、可被唯一引用（Reference）、并在整个生命周期保持稳定存在的客观对象。

Entity 表示“对象”，而不是“观点”。

例如：

| 属于 Entity | 不属于 Entity |
| --- | --- |
| 藏红花 | 极地新风土（Concept） |
| 林芝 | 高品质（Claim 属性） |
| 西红花苷 | 更适合人体（Claim） |
| ISO 3632 | 全球领先（Claim） |
| 雅鲁藏布江 | 品牌价值（Concept） |

---

## 2. Canonical Principle

每一个 Entity 必须满足：
* 一个 Canonical ID
* 一个 Canonical Name
* 一个 Canonical Type
* 一个长期稳定 Identity

允许多个 Alias。

例如：
* **Canonical Name**: 藏红花
* **Alias**: 西红花, 番红花

所有引用最终都解析到同一个 Entity ID。

---

## 3. Entity Type System

建议采用固定一级分类（一级分类建议冻结，二级分类允许扩展）：

* **BIOLOGICAL**: 植物、动物、微生物。
* **CHEMICAL**: 化学成分。
* **GEOGRAPHY**: 地点。
* **PERSON**: 人物。
* **ORGANIZATION**: 机构。
* **STANDARD**: 标准。
* **TECHNOLOGY**: 技术。
* **PROCESS**: 工艺。
* **PRODUCT**: 产品。
* **EQUIPMENT**: 设备。
* **EVENT**: 事件。
* **DOCUMENT**: 文献。
* **DATASET**: 数据集。
* **MEDIA**: 图片、视频。

---

## 4. Canonical Metadata

每个 Entity 必须具备统一元数据：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| Entity ID | ✓ | 全局唯一 |
| Canonical Name | ✓ | 标准名称 |
| Entity Type | ✓ | 一级分类 |
| Definition | ✓ | 标准定义 |
| Alias | | 别名 |
| Language | | 多语言名称 |
| Parent Entity | | 上级实体 |
| Child Entities | | 子实体 |
| Related Entities | | 横向关联 |
| Source | ✓ | 首次来源 |
| Version | ✓ | 当前版本 |
| Status | ✓ | Draft / Published / Deprecated |
| Created At | ✓ | 创建时间 |
| Updated At | ✓ | 更新时间 |
| Tags | | 检索标签 |

---

## 5. Entity Identity Rules

以下内容不得改变：
* Entity ID
* Canonical Name（除正式变更流程）
* Entity Type

允许变化（保证引用稳定）：
* Alias
* Definition
* Metadata
* Tags
* Description
* Relationship

---

## 6. Reference Rules

Repository 中任何资产（Concept, Claim, Evidence, Timeline, Relationship, Document）只能 **Reference Entity**，不得重新定义实体。

例如：

❌ **错误**：
```
Claim: 西藏藏红花……
```

✅ **正确**：
```
Claim: 引用 ENT-000021
```

所有知识都引用实体，而不是复制名称。

---

## 7. Naming Convention

建议采用固定编号：
`ENT-000001`
之后：
`ENT-000002`, `ENT-000003`...

永不复用。即使删除，也永久保留编号。

---

## 8. Repository Position

```
Repository
↓
Master Data Layer
↓
KU-5100
↓
Concept
↓
Claim
↓
Evidence
↓
Graph
↓
AI
```
KU-5100 是整个 Knowledge Layer 的入口。

---

## 9. Definition of Done

完成 KU-5100 后，应具备以下能力：
* Repository 中所有实体均拥有唯一身份。
* 任意知识资产均通过 Entity ID 建立引用。
* 支持多语言、别名和版本管理。
* 为 GraphRAG、知识图谱、全文检索和 AI 推理提供稳定的实体基础。
* 后续 KU-5200 至 KU-5900 无需再定义实体，只需引用 KU-5100。

---

## 10. Entity Governance (主数据治理规范)

为保证 Repository 长期一致性，执行以下治理规则：

* **创建权限**：仅在发现全新客观对象，且无法在现有库中解析时，方可初始化新 Entity。
* **实体合并**：发现重复实体时，保留最早的 Entity ID 作为主 ID，废弃较晚的 Entity ID 并将其 Canonical Name 降级为 Alias 指向主 ID。
* **实体废弃 (Deprecated)**：实体不可物理删除。如果判定实体不再使用，标记 Status 为 `Deprecated`。
* **同义词与多语言**：严禁为同义词或翻译名称创建新 Entity。必须作为现有实体的 Alias 或 Language 属性录入。
* **防重机制**：每次创建 Entity 前，必须经过全局检索（Canonical Name & Alias）确保无冲突。

# KU-5211 Canonical Concept Catalog

**Asset ID**: KU-5211
**Asset Name**: Canonical Concept Catalog
**Status**: Production Complete
**Architecture**: Frozen
**Repository**: Committed
**Layer**: Knowledge Layer

---

## Purpose

建立 Repository 中全部 Canonical Concept 的注册目录。
它不是解释文档。
它是 Concept 的 Master Registry。

---

## 1. Catalog Structure

每一个 Concept 必须使用完全一致的数据结构进行注册：

```text
Concept ID:
Canonical Name:
Category:
Definition:
Boundary:
Purpose:
Referenced Entities:
Parent Concept:
Related Concepts:
Supported Frameworks:
Supported Claims:
Keywords:
Status:
Version:
```

整个 Catalog 以后都是由这种对象组成。

---

## 2. Cognitive Domains (第一批)

按照 Repository 的长期可扩展性，按认知域（Cognitive Domain）建立目录。

* **CD-1000 Nature**
  生命、生命迁徙、生命循环、生命适应、生物多样性、生态位
* **CD-2000 Ecology**
  风土、极地新风土、生态代偿、生态稳定性、生态演替
* **CD-3000 Agriculture**
  两段式栽培、植物工厂、营养繁殖、种球更新、花芽分化
* **CD-4000 Civilization**
  文明迁徙、丝路传播、文化重构、在地化、知识迁移
* **CD-5000 Quality**
  品质形成、品质表达、品质评价、标准品质
* **CD-6000 Standard**
  标准体系、标准竞争、标准治理、国际标准、企业标准
* **CD-7000 Repository**
  认知主权、Repository First、Evidence First、Knowledge Unit、Canonical Concept

*(该分类体系不仅服务于具体业务，也服务于 Brand Content OS 自身建设)*

---

## 3. Canonical Concept No.1

Repository 的第一个 Concept 是：

**COG-CON-000001 : 生命迁徙**

原因并非因为它最重要，而是因为它具有最大的**“生成能力（Generativity）”**。它可以自然派生：

```text
生命迁徙
    │
    ├── 文明迁徙
    ├── 种质迁徙
    ├── 技术迁徙
    ├── 知识迁徙
    ├── 标准迁徙
    └── 品牌迁徙
```
它是一个核心母概念（Root Concept）。

---

## 4. Root Concepts (第一批)

建议第一批 Root Concept 控制在 12～20 个，不追求数量，而追求覆盖面。以下为初始冻结的一级 Concept 列表：

| ID | Concept |
| --- | --- |
| COG-CON-000001 | 生命迁徙 |
| COG-CON-000002 | 风土 |
| COG-CON-000003 | 品质形成 |
| COG-CON-000004 | 标准体系 |
| COG-CON-000005 | 生态代偿 |
| COG-CON-000006 | 在地化 |
| COG-CON-000007 | 系统医学 |
| COG-CON-000008 | 营养繁殖 |
| COG-CON-000009 | 认知主权 |
| COG-CON-000010 | 知识演化 |
| COG-CON-000011 | 价值创造 |
| COG-CON-000012 | Repository First |

以后所有二级 Concept 都必须挂靠在这些一级 Concept 之下。

---

## 5. Production Rules (生产冻结原则)

从 KU-5211 开始，不再新增新的 Concept 类型。
后续关于 Concept 的所有工作严格收束为两件事：

1. **注册（Register）**：按照 Schema 创建新的 Canonical Concept 并分配 `COG-CON-XXXXXX` 编号。
2. **治理（Governance）**：合并、废弃、修订已有 Concept，维护引用完整性。

Concept Catalog 将作为一本持续增长的“认知字典”，保持整个 Brand Content OS 认知层的稳定、可引用、可演化，确保不会因为项目增多而反复调整底层架构。

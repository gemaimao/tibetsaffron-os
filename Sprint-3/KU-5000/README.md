# KU-5000 Blueprint

**Asset ID**: KU-5000
**Asset Name**: Knowledge Unit Blueprint
**Release**: Release-v0.4
**Status**: Draft → Frozen
**Layer**: Knowledge Layer

---

## 1. Purpose（设计目的）

KU-5000 的职责不是存储知识。

KU-5000 的职责，是定义 Knowledge Unit（知识单元） 的统一生产标准，使整个 Brand Content OS 的所有知识都具有一致的数据结构、生命周期和可组合能力。

Knowledge Unit 是 Repository 中唯一允许被引用、组合、版本管理和 AI 消费的知识对象。

因此：

所有知识最终都必须被拆解为 Knowledge Unit，而不是文档。

文档只是 Knowledge Unit 的一种输出形式，而不是 Repository 的基本单位。

---

## 2. Design Goals（设计目标）

KU-5000 应满足以下目标：

### 2.1 Repository First
Repository 永远是真实来源（SSOT）。
任何 PPT、网页、公众号、白皮书、视频脚本，都只能引用 Repository，不允许成为新的知识源。

### 2.2 Atomic Knowledge
Knowledge Unit 必须不可再拆。
一个 KU 只表达一个明确对象。
例如：Entity、Concept、Claim、Evidence 分别独立存在。
禁止：一个 KU 同时描述多个概念。

### 2.3 Composable
Knowledge 必须能够自由组合。
例如：
Entity + Claim + Evidence = Article
或：
Entity + Timeline + Relationship = Exhibition

Repository 不生产文章。Repository 生产 Knowledge。

### 2.4 Traceable
任何知识必须回答：
- 来源是谁？
- 什么时候产生？
- 谁修改？
- 为什么修改？
- 引用哪些证据？

任何 Knowledge Unit 都必须可以回溯。

### 2.5 AI Native
Knowledge 不面向 Word。
Knowledge 面向：
* GraphRAG
* Knowledge Graph
* LLM
* Agent
* Search
* API
* Workflow
设计。

---

## 3. Scope（范围）

KU-5000 管理以下资产类型：

| Asset | 内容 |
| --- | --- |
| KU-5100 | Entity Dictionary |
| KU-5200 | Concept Library |
| KU-5300 | Claim Registry |
| KU-5400 | Evidence Registry |
| KU-5500 | Relationship Schema |
| KU-5600 | Timeline Database |
| KU-5700 | Terminology Standard |
| KU-5800 | Knowledge Graph Specification |
| KU-5900 | Knowledge Unit Schema |

KU-5000 不存储具体知识内容，仅定义这些资产的规则与协作方式。

---

## 4. Architecture Principles（架构原则）

整个 Knowledge Layer 遵循九项原则：

**P1 Atomic（原子化）**
一个对象只表达一个知识。

**P2 Unique（唯一）**
任何对象都有唯一 ID。
如：ENT-000001, CLM-000321, EVD-000091。不存在重复对象。

**P3 Immutable Identity（身份不可变）**
ID 永远不改变。
修改内容产生新版本，而不是新 ID。

**P4 Versioned（版本化）**
所有 Knowledge Unit 必须具有：Version, Created, Updated, Deprecated。

**P5 Referenced（引用）**
Knowledge Unit 之间禁止复制。只能引用。
例如：Claim ↓ Reference ↓ Evidence

**P6 Typed（强类型）**
每个对象都有明确类型。
禁止：未知类型、混合类型、自由文本对象。

**P7 Machine Readable（机器优先）**
Repository 首先服务机器，其次服务人。
任何 Knowledge Unit 都必须能够直接序列化为 JSON、图数据库节点或向量索引。

**P8 Stateless Production（无状态生产）**
任何 Session 仅负责当前 Asset。
不得依赖对话上下文作为长期存储。所有成果必须写回 Repository。

**P9 Frozen Architecture（架构冻结）**
KU-5000 Blueprint 批准后：
* 不允许新增一级资产。
* 不允许修改资产职责。
* 功能扩展通过新增版本实现，不通过临时修改架构实现。

---

## 5. Knowledge Unit Lifecycle（知识生命周期）

每一个 Knowledge Unit 必须经历统一生命周期：

Draft ↓ Review ↓ Validated ↓ Published ↓ Referenced ↓ Revised ↓ Archived

其中：
* **Draft**：初始创建。
* **Review**：完成结构检查。
* **Validated**：证据充分、可引用。
* **Published**：进入 Repository 主分支。
* **Referenced**：被其他资产引用。
* **Revised**：保留 ID，生成新版本。
* **Archived**：停止维护，但保留历史记录。

生命周期只影响状态，不影响对象身份（ID）。

---

## 6. Asset Topology（资产拓扑）

Knowledge Layer 的依赖关系固定如下：

```
KU-5100 Entity
        │
        ▼
KU-5200 Concept
        │
        ▼
KU-5300 Claim
        │
        ▼
KU-5400 Evidence
        │
        ▼
KU-5500 Relationship
        │
        ▼
KU-5600 Timeline
        │
        ▼
KU-5700 Terminology
        │
        ▼
KU-5800 Knowledge Graph
        │
        ▼
KU-5900 Schema & API
```
依赖方向单向，不允许循环依赖。

---

## 7. Repository Contract（仓库契约）

KU-5000 对所有子资产施加统一约束：
* 全局唯一 ID。
* 统一元数据（Metadata）。
* 不允许重复知识。
* 所有引用必须显式声明。
* 所有变更必须可追溯。
* 所有对象必须支持版本管理。
* 所有对象必须可导出为标准结构（JSON、Graph、Vector）。

---

## 8. Definition of Done（完成标准）

KU-5000 Blueprint 完成时，应满足以下条件：
* 架构边界清晰，无职责重叠。
* 子资产命名统一且不可歧义。
* 生命周期完整定义。
* Repository 约束明确。
* 可直接指导 KU-5100 至 KU-5900 的独立生产。
* 无需依赖历史对话即可理解和实施。

---

## Blueprint 定位

**KU-5000 Blueprint 是 Knowledge Layer 的架构宪章（Architecture Charter）。**

它不回答“知识是什么”，而回答：
* 什么可以成为 Knowledge Unit；
* Knowledge Unit 如何被创建、组织、引用、演化和消费；
* Repository 如何保持长期一致性。

在此 Blueprint 冻结后，后续 KU-5100～KU-5900 的所有资产都应严格遵循本蓝图，不再重新定义架构，而只负责各自领域的具体规范与内容实现。

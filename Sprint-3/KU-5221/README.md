# KU-5221 Canonical Principle Catalog

**Asset ID**: KU-5221  
**Asset Name**: Canonical Principle Catalog  
**Parent Asset**: KU-5220 Principle Registry  
**Status**: Production Complete  
**Architecture**: Frozen  
**Repository**: Committed  
**Layer**: Knowledge Layer  

---

## 1. Mission

作为 Repository 中首套正式的 Canonical Principle 注册目录。

从此彻底停止“设计 Registry”，全面进入 Repository 原则资产的固定生产与沉淀。

---

## 2. Catalog Schema (Frozen)

每一个 Canonical Principle 使用完全一致的对象结构，本 Schema 自本 Asset 起正式冻结：

| 字段 | 说明 |
| --- | --- |
| Principle ID | `PRN-XXXXXX` |
| Canonical Name | 官方名称 |
| Statement | 原则陈述（一句话） |
| Intent | 设计意图 |
| Scope | 适用范围 |
| Constraints | 必须遵守的约束 |
| Related Concepts | 引用的 Concept ID (`COG-CON-XXXXXX`) |
| Supported Assets | 适用资产 |
| Status | Draft / Published |
| Version | 版本 |

---

## 3. Canonical Principles (Release v0.4)

第一批原则按六个原则域（Principle Domains）进行分类和注册：

### PD-1000 Repository Principles

| ID | Canonical Name | Statement |
| --- | --- | --- |
| PRN-000001 | Repository First | 所有知识生产必须以 Repository 为唯一事实来源。 |
| PRN-000002 | Single Source of Truth | 针对同一认知，Repository 中只能存在单一权威来源。 |
| PRN-000003 | Canonical Before Local | 优先引用规范资产，禁止在局部或临时文档中私增定义。 |
| PRN-000004 | Reference Instead of Duplication | 资产之间一律使用全局唯一 ID 进行引用，严禁全文复制或冗余定义。 |

### PD-2000 Knowledge Principles

| ID | Canonical Name | Statement |
| --- | --- | --- |
| PRN-000101 | Evidence First | 任何结论（Claim）必须建立在可验证证据（Evidence）之上。 |
| PRN-000102 | Claim Requires Evidence | 无 Evidence 支持的 Claim 不得进入 Published 状态。 |
| PRN-000103 | Explicit Citation | 每一个推理链路与引述均需显式注明引用的资产与节点。 |
| PRN-000104 | Traceable Knowledge | 知识节点必须全链路可溯源、可审计。 |

### PD-3000 Architecture Principles

| ID | Canonical Name | Statement |
| --- | --- | --- |
| PRN-000201 | Frozen Architecture | 核心架构一经公布确认即冻结，后续研发严禁私改顶层设计。 |
| PRN-000202 | Stateless Production | Session 执行过程保持无状态，所有上下文均基于 Repository 文件读取。 |
| PRN-000203 | One Asset One Session | 每一个 Session 专一完成并关闭一个明确资产，完成后即 Commit。 |
| PRN-000204 | Version Before Modification | 资产修改前必须先确定版本策略与升级变更规范。 |

### PD-4000 Cognitive Principles

| ID | Canonical Name | Statement |
| --- | --- | --- |
| PRN-000301 | Concept Before Claim | 必须先定义概念（Concept）与其语义边界，再提出包含该概念的 Claim。 |
| PRN-000302 | Semantic Boundary First | 概念注册必须先清界限（它是什么、不是什么），防止语义混淆。 |
| PRN-000303 | Framework Before Narrative | 认知框架（Framework）先于具体叙事（Narrative）的构建。 |

### PD-5000 Quality Principles

| ID | Canonical Name | Statement |
| --- | --- | --- |
| PRN-000401 | Consistency Over Convenience | 全局一致性优先于局部编写或操作的便利性。 |
| PRN-000402 | Stable Identity | 资产全局唯一 ID 一经分配保持永久稳定，不随名称变更而改变。 |
| PRN-000403 | Reusable by Default | 所有创建的认知与规范资产必须默认具备跨项目复用能力。 |

### PD-6000 AI Principles

| ID | Canonical Name | Statement |
| --- | --- | --- |
| PRN-000501 | AI Consumes Repository | AI Agent 只能消费已在 Repository 备案注册的结构化知识。 |
| PRN-000502 | Machine Readable First | 所有文本资产格式必须优先保证机器解析与图谱索引的高效性。 |
| PRN-000503 | Structured Before Generated | 必须基于结构化知识底层驱动内容生成，禁止脱离底层产生幻觉。 |

---

## 4. Release-v0.4 Frozen Set & 原则管理规范

以上 20 条原则构成 **Release-v0.4 Canonical Principle Set**。

原则新增与维护遵循以下更新规则：
1. **新增评审**：新增 Principle 必须经过评审与准入测试。
2. **ID 保持**：不得随意修改既有 Principle ID。
3. **版本升级**：Statement 与 Constraints 随版本演进升级。
4. **意图细化**：Intent 可根据业务落地反馈持续补充完善。
5. **名称稳定**：Canonical Name 一经确定不随意变更。

---

## 5. Definition of Done

KU-5221 完成后达到以下目标：
* Repository 拥有首套正式的原则资产（20 条基准原则）。
* 所有长期规则均拥有唯一 `PRN-XXXXXX` 编号。
* 所有 Asset、Workflow、Agent 共享同一原则与决策体系。
* 不再依赖对话约定的自由口令，全面依赖 Repository 原则注册表。

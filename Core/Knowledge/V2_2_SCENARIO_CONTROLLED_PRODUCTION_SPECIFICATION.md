# Brand Content OS — V2.2 Governance Specification & Protocol Architecture

**System Version**: `v14.0`  
**Governance Version**: `V2.2 Protocol-First Architecture`  
**Core Strategic Principle**: **`Agent Agnostic, Protocol First` (与 Agent 无关，以内容生产协议为先)**  
**Status**: `Active & Enforced Specification`  
**Architectural Stance**: Architecture remains **FROZEN**. No new top-level modules. No changes to the 7 Asset Types. Pure system capability definition.

---

## 🏛️ 1. 顶层宪章与战略基石 (Strategic Charter)

> ### 核心金句 (Master Axiom)
> **Brand Content OS 建设的不是一个“更聪明的 Agent”，而是一套能够约束任何 Agent 的企业级内容生产操作协议。**

### 1.1 Agent 角色降级 (Agent De-Empowerment)
在大模型时代，传统的混乱源于 AI 代理获得了过度的“自主决策权”（自己理解、自己决定素材、自己组织逻辑）。  
在 **Brand Content OS V2.2** 中：
- **Agent 被彻底降级为纯粹的“表达执行器 (Expression Engine)”**；
- **组合权、决策权与语义解释权 100% 收归系统协议 (Content Assembly Plan, CAP)**。

```text
                BRAND CONTENT OS (协议与规则引擎)
                       │
              ┌────────┴────────┐
              │                 │
          KNOWLEDGE          GOVERNANCE
              │                 │
        Asset Library       Semantic Rules
        Knowledge Units     Composition Rules
        Evidence            Scenario Rules
              │                 │
              └────────┬────────┘
                       ↓
                 SCENARIO BRIEF (需求对象)
                       ↓
              ASSET MATCHING ENGINE (匹配引擎)
                       ↓
         CAP (Intermediate Representation / ABI)
                       ↓
    ┌──────────────────┼──────────────────┐
    ↓                  ↓                  ↓
NotebookLM            Kimi          Gemini / ChatGPT
(文本润色/播客)     (长文表达)       (综合新闻修饰)
    └──────────────────┬──────────────────┘
                       ↓
                FINAL EXPRESSION (最终媒体表达)
```

### 1.2 企业的“五阶主权演进” (Sovereignty Ladder)
企业不能止步于拥有文件资产，必须完成向传播主权的五阶升维：
$$\text{数据主权 (Data)} \longrightarrow \text{知识主权 (Knowledge)} \longrightarrow \text{语义主权 (Semantic)} \longrightarrow \text{组合主权 (Composition)} \longrightarrow \text{传播主权 (Transmission)}$$

---

## 🔗 2. CAP 作为中间表示与 ABI (Intermediate Representation / ABI)

类似编译器架构中连接不同前端语言与不同硬件 CPU 的 **LLVM IR**，在 Brand Content OS 中：
> **Content Assembly Plan (CAP) 是模型无关的中间表示 (Intermediate Representation / ABI)。**

无论底层算力节点是 **NotebookLM**、**Kimi**、**Gemini** 还是 **ChatGPT**：
- 它们均**无权**擅自增加“自己觉得有意思的素材”；
- 它们均**必须且只能**加载系统导出的 `CAP JSON` 中间件；
- 它们在同一个 Scenario 下，执行完全相同的素材选择、语义功能与组装拓扑！

---

## 🎨 3. Agent 创造力的绝对边界 (Agent Creativity Boundaries)

必须严密界定 AI Agent 的权限红线：

| 允许 Agent 自由创造的领域 (Expression) | 绝对禁止 Agent 擅自篡改的领域 (Knowledge & Rules) |
| --- | --- |
| 1. 新闻修辞与语言润色 | 1. 事实内容与数据准确性 |
| 2. 句式变化与段落衔接 | 2. 知识拓扑关系与因果图谱 |
| 3. 对应媒体风貌的语气微调 | 3. 素材的 CAP 组装角色 (`ANCHOR`, `CORE_EVIDENCE` 等) |
| 4. 爆款标题与引人入胜的开篇修饰 | 4. 场景硬性限制 (`OFFICIAL_PR` 封锁菜谱) |
| 5. 适合发稿渠道的流利中文表达 | 5. 证据核实等级 (`VERIFIED` / `PUBLISHED`) |
| — | 6. 核心传播意图 (`EDITORIAL_INTENT`) |

**法则：Agent 可以自由创造“表达”，绝对不能擅自创造“知识结构”。**

---

## 📦 4. 完整系统能力规格概览 (8 大能力模块)

### 4.1 Asset Library (内容资产库规范)
最小内容资产定义：**独立可复用、可验证、可重新组合的信息单元**。包含 8 大原子分类 (`Enterprise Facts`, `Product Facts`, `Technology`, `Cognition`, `Narrative`, `Evidence`, `Dynamic`, `Experience`)。

### 4.2 Semantic Tag System (多维语义标签)
向量维度：`{ TYPE, SUBJECT, FUNCTION, AUDIENCE, SCENARIO, TONE, EVIDENCE, RELATION }`。  
传播功能 (`FUNCTION`) 解耦：`FACT`, `PROOF`, `EXPLANATION`, `DIFFERENTIATOR`, `AUTHORITY`, `STORY`, `MILESTONE`, `NEWS`, `CONVERSION`。

### 4.3 Composition Logic (组合逻辑)
5 种显式关系：`SUPPORT`, `CONTRAST`, `CAUSAL`, `PROOF`, `EXTENSION`。

### 4.4 Scenario Brief (场景需求对象)
包含 `Topic`, `Editorial Angle`, `Editorial Intent`, `Core Message`, `Reader Takeaway` 等 17 维结构化输入。严禁 AI 静默推断未知项。

### 4.5 Content Assembly Plan (CAP 机制)
中间件呈现结构，解耦 `Asset Type` $\neq$ `Semantic Function` $\neq$ `Asset Role` (`ANCHOR`, `CORE_EVIDENCE`, `PROOF`, `CONTEXT`, `EXPLANATION`, `EMOTIONAL`, `CLOSING`)。

### 4.6 Scientific Claim Guardrail (科学表达防线)
设施控环 / CEA 培育提供投入品管理与环境条件 $\neq$ 0 农残检验结果。严禁合并为简化因果推断。

### 4.7 Tri-Mode Output Purifier (三阶输出模式)
- `AUDIT`: 显示内部编号与角标；
- `EDITORIAL`: 隐藏内部代码，保留章节结构；
- `PUBLIC`: 彻底脱敏净化，呈现纯净媒体稿。

---

## 🧪 5. 验收测试结论 (Acceptance Test Verification)

系统全量通过 Multi-Scenario Acceptance Test Suite：
- ✅ **TEST A (FINANCIAL_MEDIA)**: CAP 自动聚焦 CEA 控环、海关 `CMP-001` 与 0农残 `SCI-001`，**100% 物理封锁菜谱**；
- ✅ **TEST B (CULTURAL_MEDIA)**: CAP 聚焦文明重返与极地风土，海关单降级为辅助 `PROOF`；
- ✅ **TEST C (LIFESTYLE_MEDIA)**: CAP 放行 `0.05g` 冲泡 SOP 与五季物候饮品，作为消费者体验；
- ✅ **TEST D (INCOMPLETE_BRIEF)**: 缺失意图时硬性返回 `INCOMPLETE_BRIEF` 拦截，**零静默脑补**。

**验收结果：PASS**

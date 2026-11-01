# Brand Content OS — V3.0 Jev Decision Layer & Dual-System Architecture Specification

**System Version**: `v15.0 Enterprise Architecture`  
**Governance Version**: `V3.0 Jev System One Decision-Enforced`  
**Core Strategic Principle**: **`Jev for Decision, Protocol for Sovereignty, LLM for Expression` (Jev 专职决策，协议固化主权，大模型仅作表达)**  
**Status**: `Active & Enforced Platform Standard`  
**Reference Origin**: TypeSafe AI / Jev System One Architecture by Hao Chen (@Chchenhao0129)

---

## 🏛️ 1. 战略重构：为什么将 JEV 设为决策层？

### 1.1 传统 Agent 架构的“致命越权”
传统的 AI 驱动内容系统让生成式大模型（GPT-4、Claude、Gemini）同时承担**“决策”**与**“表达”**：
- 让 LLM 自由阅读素材并自行决定采用哪些事实；
- 让 LLM 自由根据提示词做逻辑推理与合规判定；
- **结果**：不可避免的幻觉（Hallucination）、不稳定的 JSON 格式、无法量化的决策置信度、高昂的 Token 成本与不可预测的伦理越界风险。

### 1.2 认知双系统分离 (Dual-System Separation of Powers)
Brand Content OS V3.0 依据认知科学的“双系统理论”（Kahneman System 1 & System 2），对企业内容生产流水线实施彻底的权力分立：

| 架构层级 | 担任角色 | 核心引擎 | 输出物特性 | 职责范围 |
| --- | --- | --- | --- | --- |
| **决策层 (System One)** | 快速、直觉、精准裁决 | **Jev (TypeSafe)** | 强类型（Typed）、带校准概率（Calibrated Probability） | 场景分类、意图识别、声明越界检测、素材匹配打分 |
| **协议层 (Protocol / ABI)** | 事实与主权固化中介 | **CAP 引擎 (BCOS)** | 结构化只读装配计划 (JSON) | 资产引据绑定、因果链冻结、禁止句式锁死 |
| **表达层 (System Two)** | 慢速、反思、修辞渲染 | **LLM Adapters** (Gemini, Claude, NotebookLM) | 自然语言文本、多模态播客、画册文案 | 遵照 CAP 执行修辞、润色、文风变换，无权修改事实 |
| **底座层 (SSOT Assets)** | 唯一真实源 | **Core Knowledge Repository** | 规范资产、7 级硬核证据 | 34 Master 骨架、11 份国家级报告、海关/检验凭证 |

```text
               ┌────────────────────────────────────────────────────────┐
               │              输入需求 (Scenario Brief / 用户输入)        │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                                          ▼
      ═════════════════════════════════════════════════════════════════════
          【决策层 (Decision Layer) —— TypeSafe JEV (System One)】
      ═════════════════════════════════════════════════════════════════════
          • 意图与场景判定 (Choice: OFFICIAL_PR / FINANCIAL / TECH ...)
          • 声明合规与红线检测 (Noul: P(Safe)=0.99, P(Forbidden_Claim)=0.01)
          • 资产适用度打分 (Score: Relevance, Terroir Alignment, Level 1..5)
          • 角色指派 (Choice: ANCHOR / CORE_EVIDENCE / SUPPORTING / BLOCKED)
      ═════════════════════════════════════════════════════════════════════
                                          │
                                          ▼ [输出类型安全裁决与校准置信度]
               ┌────────────────────────────────────────────────────────┐
               │    协议中间件 (Protocol / ABI): CAP Assembly Plan      │
               │   (只读中间表示：锁定素材指针、证据引据、边界句式)       │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                                          ▼ [仅允许注入 CAP，禁止自由发散]
      ═════════════════════════════════════════════════════════════════════
          【表达执行层 (Expression Layer) —— LLMs (System Two)】
      ═════════════════════════════════════════════════════════════════════
          • NotebookLM (长文检索与播客音频渲染)
          • Gemini / Claude / Kimi (新闻通稿、深度特稿风格润色)
      ═════════════════════════════════════════════════════════════════════
                                          │
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │      最终品牌业务交付 (Final Brand Delivery / COM)      │
               └────────────────────────────────────────────────────────┘
```

---

## 🧩 2. JEV 决策原语在 BCOS 中的落地范式

Jev 绝不输出冗长的 Markdown 解释，而是通过三大类型化原语赋能 BCOS 业务：

### 2.1 原语一：`Choice`（场景路由与资产角色定级）
- **场景意图分类器**：
  ```typescript
  // Choice Question: 判定最适用的业务传播场景
  const scenarioChoice = {
    type: "choice",
    instructions: "判断该 Brief 核心受众与传播意图最符合哪个官方业务场景",
    options: [
      "OFFICIAL_PR",       // 党媒与政经新闻
      "FINANCIAL_MEDIA",   // 财经与商业特稿
      "TECH_AGRICULTURE",  // 现代农业与生物科技
      "LIFESTYLE_CONSUMER",// 大众品质生活
      "B2B_SUPPLY_CHAIN"   // 医药原料与供应链
    ]
  };
  ```
- **资产角色分配器**：
  将候选素材精确分配为 `ANCHOR`（核心锚点）、`CORE_EVIDENCE`（核心论据）、`BACKGROUND`（背景铺垫）或 `BLOCKED`（阻断剔除）。

### 2.2 原语二：`Noul`（安全红线与越界声明布尔概率）
- **真伪与风险判定**：
  `Noul` 输出 0 到 1 之间的概率 $P(\text{condition = true})$。
  - **红线规则 1**：`has_unverified_medical_claim`（是否含有未获批人体医学疗效宣称？如宣称降糖降脂为人体药物疗效）。
  - **红线规则 2**：`violates_causal_decoupling`（是否违反因果解耦铁律？如声称 CEA 控环等同于零农残）。
  - **硬性拦截阈值**：当 $P(\text{violation}) > 0.05$ 时，CAP 引擎立即阻断，触发审计熔断报警。

### 2.3 原语三：`Score`（可信度、风土契合度与传播价值打分）
- **资产权重评分**：
  为每个资产在特定场景下的效能打分（例如 1~5 阶）。
  - 5 分：具备国家级质检编号（如 A26SW02809）或海关出口凭单（CMP-001）的硬核直接证据；
  - 1 分：仅具普通背景参考价值，无独立支撑力。
  - 代码根据 Score 的期望值完成贪心排序，确保入选 CAP 的素材组合质量最优。

---

## 🔒 3. 治理边界与决策主权

1. **Jev 决定“用什么”、“怎么编排”、“是否合规”**；
2. **代码协议负责“不可撤销的死锁与证据验证”**；
3. **大模型仅被授权在 CAP 圈定的素材围栏内进行文字润色**；
4. **任何人或模型均不得越过 Jev 与 CAP 协议擅自添加外来数据**。

通过将 JEV 确立为 Brand Content OS 的决策层，企业在 AI 时代真正构筑起了**“安全、可解释、高置信、可自动化”**的品牌主权堡垒。

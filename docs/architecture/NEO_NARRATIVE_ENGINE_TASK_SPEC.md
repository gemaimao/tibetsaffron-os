# NeoNarrative (原 NeoRadio) 核心引擎设计任务书

**任务性质：架构设计 / 对象建模 / 状态机设计 / 技术验证 / MVP 规划**
**当前阶段：Architecture Design（不立即进入完整编码）**

---

## 1. 项目背景与定位重构

本项目已完成从“知识电台工具”到“知识叙事引擎”的定位升级。

**过去的认知：**
> NeoRadio = NotebookLM 的剧本 + Gemini Live 的音频交互

**现在的定位：**
> **NeoNarrative = Knowledge Narrative Engine (知识叙事引擎)**
> 
> 音频（NeoRadio）只是第一种输出介质（Renderer）。未来将复用同一套核心引擎扩展至知识视频（NeoVideo）、互动简报等。
> 
> 核心目标是将“知识理解—命题生成—证据追溯—JEV合规治理—交互叙事”封装为一个与介质解耦的引擎底座。

---

## 2. Agent 本阶段核心职责 (DOs & DON'Ts)

**⚠️ DON'Ts (绝对禁止):**
- 不要直接开始写 Gemini API 调用代码。
- 不要把本项目当成一个“让 Gemini 连上麦克风聊天”的 Demo。
- 不要在未定义清楚核心领域模型 (Domain Model) 前开始写业务逻辑。
- 绝不要把系统做成以 Audio 为中心或与单一模型供应商绑定的狭隘工具。

** DOs (必须完成):**
- 完成完整的领域建模（Knowledge, Claim, Evidence, Narrative, Dialogue State, Renderer）。
- 将 `Narrative` 确立为核心中间表示（IR），并定义介质无关的 `PresentationIntent`。
- 明确 JEV 决策层如何在对话状态中实施拦截。
- 设计核心三方对话状态机（Host A, Host B, User）。
- 输出具体的技术风险验证方案 (PoC) 和 MVP 边界，包含“去掉 Gemini”反事实测试与“同一 Narrative 的 Audio/Video 双路径验证”。

---

## 3. 必须构建的核心架构六层模型

请基于以下层次进行系统架构设计，确保 `Media-Agnostic`（介质无关）：

```text
1. 底座层 (SSOT)
   └─ 知识库 / 原始文档
        ↓
2. 认知对象层 (Cognitive Layer)
   ├─ Claim (命题)
   └─ Evidence (证据锚点)
        ↓
3. 治理决策层 (Governance Layer)
   └─ JEV (事实核查 / 范围限制 / 因果解耦)
        ↓
4. 叙事建模层 (Narrative IR Layer)
   ├─ Narrative (核心叙事中间表示)
   ├─ Scene / Narrative Arc
   └─ Presentation Intent (介质无关呈现意图)
        ↓
5. 交互调度层 (Dialogue & Director Layer)
   ├─ Dialogue State Machine (三方对话状态机)
   └─ Multi-role Director (多角色调度)
        ↓
6. 呈现渲染层 (Presentation Layer)
   ├─ Audio Director (NeoRadio)
   ├─ Visual Director (NeoVideo - 未来)
   └─ Text/UI Renderer
```

---

## 4. 重点领域模型设计要求

请在你的设计文档中，详细给出以下核心对象的 Schema 与生命周期：

### 4.1 Claim & Evidence (命题与证据)
必须结合现有的 V2.3 Claim Control 规范。一个 `Claim` 必须能表达：
- **Level**: `CONFIRMED_FACT`, `DERIVED_EXPLANATION`, `STRATEGIC_DIRECTION`, `FORBIDDEN_ASSERTION`
- **Evidence Link**: 对应原文档的具体页码、段落、甚至图表。
- **Scope**: 适用范围（防止个例被夸大为普适）。

### 4.2 JEV Governance (治理层)
JEV 不是简单的关键词过滤，而是**Claim Governance Engine**。必须在设计中体现：
- 事实溯源校验
- 因果关系解耦 (Causality Check · CC-02)
- 表达强度降维 (Expression Strength Check · CC-03)
- 风险评级决策 (PASS / WARN / BLOCK / HUMAN_REVIEW)

### 4.3 Narrative (叙事核心对象 / IR)
必须将 `Narrative` 正式列为核心领域对象，作为认知层与渲染层之间的中间表示（IR）：
- `Narrative Arc` (叙事弧线)
- `Scene` (场景切片)
- `Claim Sequence` (命题推演序列)
- `Speaker Turn` (发言轮次与角色意图)
- `Evidence Reference` (强制凭证引用)
- `Presentation Intent` (介质无关呈现意图，严禁直接写具体媒体素材)

### 4.4 Dialogue State Machine (交互状态机)
这是保证 Live 模式不崩溃的核心。必须明确定义：
- 节点：`HOST_A_SPEAKING`, `USER_INTERRUPTING`, `EVIDENCE_RETRIEVING`, `JEV_CHECKING` 等。
- `Barge-in` (打断) 延迟测量模型：**L1 听觉停止 -> L2 意图理解 -> L3 证据定位 -> L4 回应生成**。
- **Conversation Control**: 允许用户发出 `Interrupt`, `Challenge`, `Drill Down`, `Evidence` 四类不同指令。

---

## 5. Media-Agnostic 核心验证规范

### 5.1 Narrative 的职责
Narrative 是 Cognitive Layer 与 Presentation Layer 之间的中间表示（Intermediate Representation）。它负责表达：
* 讲什么、为什么现在讲
* Claim 的先后关系与叙事弧
* 谁来讲、如何回应用户
* 哪些 Evidence 必须出现、哪些地方需要强调
* 哪些地方允许展开、哪些地方必须避免表达
* **Narrative 不得直接绑定 Audio 或 Video 实现细节。**

### 5.2 Presentation Intent
Narrative 中只允许存在介质无关的 `PresentationIntent`：
```text
SPATIAL_CONTEXT      (空间上下文)
DATA_EMPHASIS        (数据定量强调)
EVIDENCE_REVEAL      (证据溯源揭示)
COMPARISON           (对比辨析)
PROCESS_EXPLANATION  (工艺/流程演进)
TIMELINE             (时序演变)
QUOTE_SOURCE         (权威出处引用)
CONCEPT_RELATION     (概念因果网络)
```
不同 Renderer 自行解释 Presentation Intent：
* `SPATIAL_CONTEXT`: Audio 用语言解释空间方位；Video 调用三维/二维地图；Text 呈现空间图文卡片。
* `DATA_EMPHASIS`: Audio 口语化重读数据；Video 生成动态数据图表；Text 渲染标准指标表格。

### 5.3 Renderer Interface
定义统一 Renderer 抽象：
```text
Narrative ➔ Renderer ➔ Media Artifact
```
第一阶段只实现 `AudioRenderer`，但系统架构必须能够在不修改 `Claim`、`Evidence`、`JEV`、`Narrative` 的情况下直接热插拔增加 `VideoRenderer` 与 `TextRenderer`。

### 5.4 “去掉 Gemini”反事实测试
如果将 Gemini 全部替换掉（例如切换为 Claude、DeepSeek、开源自研或纯本地引擎），NeoNarrative 的核心资产是什么？
必须保留：
- `Knowledge / SSOT`
- `Claim Graph`
- `Evidence Graph`
- `JEV Governance`
- `Narrative Model (IR)`
- `Dialogue State`
- `Renderer Interface`
Gemini 仅为外部 `Model Provider`，绝非核心领域资产本身。

### 5.5 双路径验收测试 (Dual-Path Acceptance Test)
```text
同一份 Knowledge
        ↓
同一组 Claim / Evidence
        ↓
同一套 JEV Decision
        ↓
同一个 Narrative (IR)
       ↙   ↘
 Audio     Video
```
证明：Audio 与 Video 是同一个 Narrative 的不同 Renderer，而不是两套独立的内容生成系统。

---

## 6. 最终架构判断标准

Agent 不应以：
> “Gemini Live 是否成功调用” 或 “是否生成了一段好听的 AI 播客” 作为成功标准。

本阶段真正的成功标准是：
> **NeoNarrative 是否建立了一套独立于具体模型、具体媒介、具体 UI 的 Knowledge → Claim → Evidence → Decision → Narrative → Renderer 核心链路。**

---

## 7. 交付物清单要求 (Deliverables)

本阶段设计结束后，请输出以下 Markdown 架构文档（存入 `/docs/architecture/`）：

1. `system-architecture.md` (含 Mermaid 架构图、六层模型、统一 Renderer 契约)
2. `core-domain-model.md` (知识、命题、证据、Narrative IR、Presentation Intent 数据结构)
3. `jev-governance-flow.md` (JEV介入节点设计、双闭环拦截)
4. `dialogue-state-machine.md` (含 Mermaid 状态机图、L1~L4 打断延迟漏斗)
5. `poc-and-mvp-plan.md` (最小技术验证实验、反事实测试、双路径验收设计与第一阶段边界)

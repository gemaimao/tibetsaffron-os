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

**🎯 DOs (必须完成):**
- 完成完整的领域建模（Knowledge, Claim, Evidence, Dialogue State）。
- 明确 JEV 决策层如何在对话状态中实施拦截。
- 设计核心三方对话状态机（Host A, Host B, User）。
- 输出具体的技术风险验证方案 (PoC) 和 MVP 边界。

---

## 3. 必须构建的核心架构五层模型

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
4. 叙事与交互层 (Narrative & Dialogue Layer)
   ├─ Dialogue State Machine (对话状态机)
   └─ Multi-role Director (多角色调度)
        ↓
5. 呈现渲染层 (Presentation Layer)
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
- 因果关系解耦 (Causality Check)
- 表达强度降维 (Expression Strength Check)
- 风险评级决策 (PASS / WARN / BLOCK / HUMAN_REVIEW)

### 4.3 Dialogue State Machine & Role Paradigm (交互状态机与三方角色范式)
这是保证 Live 模式不崩溃的核心。必须明确基于以下 **固定角色范式** 建立状态流转：
- **Host A (妸龙 / 男声)**：负责播报主线剧本与抛出事实。
- **Host B (小林 / 女声)**：负责针对事实进行发问或配合。
- **Host C (莉莉 / 导播女声)**：专属的听众互动导播。
  - **核心职责**：监听多位听众（观众A、观众B、观众C等）的随时插话 ➔ 提炼听众真实意图并转达给 妸龙或小林 ➔ 引导他们针对该问题解答 ➔ 互动结束后，将话语权交还给 妸龙和小林 以继续主线进度。

必须明确定义以下节点与链路：
- 节点：`HOST_A_SPEAKING`, `USER_INTERRUPTING`, `HOST_C_MEDIATING`, `EVIDENCE_RETRIEVING`, `JEV_CHECKING` 等。
- `Barge-in` (打断) 不仅是停止播放，必须包含：**L1 听觉停止 -> L2 意图理解(Host C 介入) -> L3 证据定位 -> L4 回应生成(Host A/B)** 的完整延迟测量模型。
- **Conversation Control**: 允许用户发出 `Interrupt` (打断), `Challenge` (质疑), `Drill Down` (深挖), `Evidence` (求证原文) 四类不同指令。

### 4.4 Knowledge Routing & Boundary Fallback (知识路由与边界降级三层漏斗)
为支撑业务运营中多主题引流（如“藏红花真假”、“价格之谜”、“历史文化”）和无法预测的听众发散式提问，引擎必须建立三层知识路由漏斗：
- **Tier 1 (In-Topic 主题内回复)**：听众打断问题完全在当前播客主题范围内。直接由 Host A/B 结合当前剧本上下文解答。
- **Tier 2 (In-SSOT 主题外但知识库内)**：听众问了无关当前播客主题，但属于“天旺藏红花/品牌常识”的问题。系统自动检索底层 SSOT 知识库，调取 Evidence 进行解答。
- **Tier 3 (Out-of-Bounds 全网检索降级)**：听众问了彻底超纲的问题。系统自动触发 Web Search（全网搜索），获取客观常识后由 Host A/B (阿龙/小林) 巧妙作答，并自然地把话题重新圆回到天旺的优势上。

---

## 5. 交付物清单要求 (Deliverables)

本阶段设计结束后，请输出以下 Markdown 架构文档（存入 `/docs/architecture/`）：

1. `system-architecture.md` (含 Mermaid 架构图)
2. `core-domain-model.md` (知识、命题、证据数据结构)
3. `jev-governance-flow.md` (JEV介入节点设计)
4. `dialogue-state-machine.md` (含 Mermaid 状态机图)
5. `poc-and-mvp-plan.md` (最小技术验证实验设计与第一阶段开发边界)

---
> **最终验收标准：**
> 架构设计是否能够支撑“用户随时打断 AI 主持人，针对当前具体 Claim 提出质疑，AI 能够迅速回溯 Evidence，经过 JEV 校验后，以设定的角色口吻恢复对话，并能在必要时将原文证据展示在 UI 上。”

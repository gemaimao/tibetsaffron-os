# DSH 十大武器库蓝图 —— 官方能力审计与免费替代总方案

> 目标：凡是 DSH 默认设置带来不方便或需付费的能力，全部替换为公网上免费且高效的方案。
> 原则：**Keyless 优先 → 本地优先 → 免费额度次之 → 凭据一律入共享保险柜 → 源码一律进 git。**
> 审计对象：DSH NEXT v2.0.15-next（/Applications/DSH NEXT.app）
> 日期：2026-09-26

---

## 一、四层承载框架

| 层 | 承载物 | 已就位案例 |
| --- | --- | --- |
| **技能层** Skills | `~/.agents/skills/` + 市场技能包 | typesafe-ai、modsearch 技能 |
| **工具层** Tools | `ctx.tools.register()`（插件注册，schema 每请求可见） | jev_claim_check 等 JEV 三工具 |
| **插件层** Plugins | profile node_modules + bundles + cordis.patch | modsearch、@bcos/jev-decision-layer |
| **扩展层** Extensions | MCP 注入、外部守护进程、webhook | Paseo MCP（injectIntoAgents: true） |

---

## 二、官方能力全景审计（利/弊/判级）

### 2.1 联网与检索栈

| 官方实现 | 依赖 | 利 | 弊 | 判级 |
| --- | --- | --- | --- | --- |
| `dsh-web-search-deepseek`（web_search 默认 Provider） | **DeepSeek 官方额度** | 与官方账户一体 | 搜索额度捉襟见肘，重度使用即枯竭 | 🔴 已替换 |
| `dsh-web-fetch-http`（直连抓取） | 无（本机 HTTP） | 零成本、直快 | 不处理 JS 渲染页、反爬、正文抽取 | 🟡 保留作兜底 |
| modsearch（社区插件，已装 5.10.5） | Keyless 引擎链 + Firecrawl keyless（1000 credits/月） | 免注册免费、结构化证据、X 搜索、正文抽取 | Firecrawl 月度额度上限 | 🟢 **主力** |

**现状**：desktop profile 的 web seam `searchProvider` 已由 modsearch 的 bundle patch 改道——**官方 DeepSeek 搜索已退役** ✅

### 2.2 推理与模型栈

| 官方实现 | 依赖 | 判级 |
| --- | --- | --- |
| DeepSeek 官方模型（账户余额计费） | 余额 | 🔴 已被 GLM patch 替换（desktop/acp/headless 三 profile） |
| 现行路由：zhipu GLM-5.3-flash + empero 免费（牛来）+ openrouter | zhipu key（共享保险柜）/ 免费 | 🟢 主力 |

### 2.3 多模态栈

| 官方实现 | 依赖 | 利 | 弊 | 判级 |
| --- | --- | --- | --- | --- |
| `read_image`（本地图像读取） | 无 | 免费、快 | 理解靠后续 LLM | 🟢 保留 |
| `dsh-experimental-speech-to-text-sensevoice`（本地 STT） | 本地模型 | **免费本地方案已内置** | 实验特性，需开启 | 🟢 待启用 |
| `dsh-experimental-api-speech-to-text`（API STT） | 付费 API | 识别质量稳 | 花钱 | 🔴 弃用，走本地 |
| `tts`（内置语音合成） | 推断走官方/付费通道 | 方便 | 额度/付费 | 🔴 待替换 |
| 图像生成 | **官方栈无内置** | — | 需外部方案 | 🔴 待建 |
| 视觉理解（VLM） | LLM Provider | empero 免费 glm-5.3-flash 已声明 image input | 未形成标准视觉工作流 | 🟡 待编排 |

### 2.4 Agent 与执行栈（全部本地免费，保留）

| 官方实现 | 判级 | 说明 |
| --- | --- | --- |
| bash / bash-persistent / pwsh / run_code | 🟢 | 本地执行，零成本 |
| fs / fs-search / str-replace-editor | 🟢 | 本地文件操作 |
| subagent / subagent-control / workflow / jobs / todo / goal / skill | 🟢 | 内部多智能体与编排，全部本地 |
| `dsh-experimental-tool-agent-team`（多 Agent 团队） | 🟢 | **官方实验特性：DSH 内部多 Agent 是存在的**，用已配置 LLM，免费 |
| `dsh-experimental-computer-use-cua-driver-native`（电脑操作 CUA） | 🟢 | 本地驱动，实验特性 |
| dsh-tool-ralph | 🟢 | 实验循环执行 |

### 2.5 决策与治理栈

| 官方实现 | 判级 | 说明 |
| --- | --- | --- |
| （官方无决策层概念） | — | 官方让 LLM 既决策又表达——正是 V3 规批判的"致命越权" |
| **@bcos/jev-decision-layer（自建，今日已装）** | 🟢 | Choice/Noul/Score 三原语 + 治理硬阻断；待 TypeSafe key 与重启验证 |

### 2.6 扩展与协同栈

| 实现 | 判级 | 说明 |
| --- | --- | --- |
| `dsh-webhook` / `dsh-webhook-github` | 🟢 | 免费，本地 |
| Paseo MCP 注入（daemon: injectIntoAgents: true） | 🟢 | **DSH 会话可调度 Paseo 舰队**（claude/codex/antigravity）——补足跨厂商多 Agent |
| Paseo schedules / heartbeats | 🟢 | 定时与心跳，免费 |

---

## 三、十大武器库（最终编制）

| # | 武器 | 官方痛点 | 免费替代方案 | 承载层 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 1 | **联网检索** | DeepSeek 搜索额度枯竭 | modsearch keyless 引擎链（DuckDuckGo 系 + Firecrawl keyless） | 插件 | ✅ 已就位 |
| 2 | **社媒情报** | 官方无 X 通道 | modsearch `x_search`（keyless） | 插件 | ✅ 已就位 |
| 3 | **网页抓取→MD 转写** | 直连抓取搞不定反爬/正文 | modsearch `read_page`（Firecrawl keyless）+ **Jina Reader `r.jina.ai`（无 key 无限）兜底** | 插件+技能 | ✅ 主力就位 / 📋 兜底待补 |
| 4 | **LLM 推理引擎** | 官方余额计费 | GLM patch：zhipu GLM-5.3-flash + empero 免费档 | 配置层 | ✅ 三 profile 已铺 |
| 5 | **JEV 决策层** | 官方无；LLM 决策=越权+烧钱 | @bcos/jev-decision-layer（真 API 直连；Jev 判定几百 token，替代大模型推理=**省钱武器**） | 插件 | 🚧 已装，待 key+重启 |
| 6 | **文档解析/深度爬虫** | 官方无 PDF/Office→MD 流水线 | **markitdown（MIT）**或 **docling**本地解析 PDF/DOCX/PPTX；yt-dlp 摄取媒体；Jina 兜底长尾 | 技能+工具 | 🔨 待建 |
| 7 | **语音双工** | API STT 收费、TTS 通道不明 | STT：官方 **SenseVoice 本地**（已是免费内置！）或 whisper.cpp；TTS：**Edge-TTS**（免费无 key） | 实验特性+媒体插件 | 🔨 待启用/待建 |
| 8 | **图像生成** | 官方无内置 | **Pollinations.ai（完全 keyless 免费）**；备选 Cloudflare Workers AI 免费日额度（已有 CF 账号） | 媒体插件 | 🔨 待建 |
| 9 | **多模态视觉理解** | 视觉任务无标准工作流 | empero 免费 glm-5.3-flash（image input）+ 本地 read_image 编排成视觉技能；OCR 兜底 tesseract | 技能 | 🔨 待编排 |
| 10 | **多 Agent 协同** | 单引擎天花板 | 双轨：官方 **agent-team 实验特性**（内部多 Agent，免费）+ **Paseo MCP 舰队**（跨厂商调度 claude/codex/antigravity） | 实验特性+扩展层 | 📋 配置解锁 |

**Bonus 武器（官方免费，直接用）**：computer-use（CUA 本地驱动）、webhook-github、Paseo 定时/心跳、python-docx/pptx 本地文档套件（gen_docx.py 已有）。

---

## 四、实施路线图

### Phase 1（今日已完成）
- ✅ JEV 插件建造并装入 desktop profile（待 key+重启验证）
- ✅ 全面审计与本蓝图

### Phase 2（建议下一波：文档与媒体）
1. **武器 6**：文档解析技能（markitdown/docling 落地 + Jina 兜底）——直接服务 BCOS Inbox 流（证据 PDF→MD 入库）
2. **武器 8**：图像生成媒体插件（Pollinations keyless，形态复刻 jev 插件）

### Phase 3（体验增强）
3. **武器 7**：语音双工（启用 SenseVoice 本地 STT + Edge-TTS 插件）
4. **武器 9**：视觉理解技能编排
5. **武器 10**：解锁 agent-team + 验证 Paseo MCP 舰队调度

### 统一工程纪律
- 插件形态一律复刻 `@bcos/jev-decision-layer` 模板（零依赖、凭据走共享保险柜、回归 fixtures 进 git）
- 每件武器必须有回归测试与 README
- 付费通道只允许经共享保险柜显式配置，禁止隐式官方额度依赖

---

## 五、风险与边界

- **modsearch Firecrawl 月额度**（1000 credits）：耗尽后 `read_page` 自动降级 keyless 引擎链；可再叠 Jina Reader 兜底（待补）
- **empero 免费档**（牛来）：社区免费服务，稳定性自担；zhipu 为付费保底
- **实验特性**（SenseVoice/agent-team/CUA）：官方标注 experimental，可能随版本变动
- **TypeSafe API**：待确认免费额度；JEV 判定单次几百 token，成本天然极低

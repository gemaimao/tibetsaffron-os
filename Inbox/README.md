# Ingestion Platform (输入中心 Ingestion Center)

> **Core Philosophy**: **Zero Learning Cost（零学习成本）**  
> **UX Slogan**: **Bring Anything In. We Understand the Rest.**  
> **UI Form**: **ChatGPT / 微信聊天框式极简界面（大输入框 + "＋" 按钮），非传统文件管理器。**

---

## 🎯 极简 MVP 入口 (4 大零负担通道)

用户无需改变日常习惯，继续使用微信、飞书、邮箱与浏览器：

* **通道 ① 拖拽 (Drag & Drop - 最重要)**：拖入 PDF、Word、Excel、图片、视频直接进入 `Inbox`。
* **通道 ② 粘贴 (Paste Text - 第二重要)**：Ctrl+C / Ctrl+V 领导讲话、新闻剪报、会议文本 $\rightarrow$ 一键导入。
* **通道 ③ 社交分享 (Share to BrandOS - 扩展)**：微信/浏览器内“分享到 Brand Content OS”。
* **通道 ④ 邮箱抄送 (Email Ingestion - 扩展)**：发邮件至 `inbox@brandos.ai` 自动入库。

---

## 🤖 系统自动化解析与无感消除 (Zero Manual Selection)

**用户无需进行任何目录选定、分类勾选或标签填写！**

```text
用户：拖入《2026检验报告.pdf》或粘贴一段文本
                     │
                     ▼
             【Ingestion Platform 后台无感处理】
                     │
 ├── OCR / Text Parser (文件格式自动提取)
 ├── AI Auto-Classification (识别：质检报告)
 ├── Entity & Concept Extraction (萃取：产品/品质形成)
 └── Target Asset Suggestion (建议：KU-3200 / Evidence)
```

---

## 🔒 核心治理机制：AI 自动理解 + 人工一键确认 (Human-in-the-Loop)

**绝对禁止 AI 未经确认盲目自动入库！**

为了防止混淆与虚假垃圾信息污染核心资产 (`Knowledge Repository`)，严格执行 **AI 理解 + 人工确认**：

```text
任何内容输入 ──► AI 自动解析理解 ──► 给出推荐归档卡片 ──► 用户点击 [ √ 确认 ] ──► Commit 入 Repository
```

### 📲 界面卡片互动示例：

```text
[ AI 识别卡片建议 ]
文件名: 2026检验报告.pdf
识别类型: 实验室检测报告 (置信度: 98%)
识别 Entity: 藏红花 / 柱头 / Crocin
建议归档: Repository / KU-3200 / Evidence (EVI-1004)

[ √ 确认提交 (Commit) ]    [ ✕ 放弃 / 修改 ]
```

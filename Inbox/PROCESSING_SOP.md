# Ingestion Platform — 自动化处理与卡片提炼 SOP

> **Slogan**: **Bring Anything In. We Understand the Rest.**  
> **（任何内容都可以输入，剩下的交给系统。）**

---

## 📂 输入中心完整目录映射 (Inbox Entry Map)

请随时将您的任何资料丢入以下对应的文件夹中：

```text
/Inbox
├── /Documents      # 微信聊天记录、邮件、会议纪要、文章草稿、随手笔记 TXT/Word
├── /PDFs           # 学术论文、政府批文、检测报告原始 PDF
├── /Transcripts    # 采访录音逐字稿、语音转文字、OCR 识别文本
├── /Data_Raw       # 农户用工 Excel、试验数据表格、财税数据
└── /Media_Raw      # 现场照片、高清摄影原图、视频素材、设计效果图
```

---

## 🔄 系统静默处理 5 步管道 (Silent Processing)

当您在 `/Inbox/` 中放入任何文件或在对话框中粘贴文本时，系统在后台静默完成以下 5 步：

```text
1. Format Parsing (格式解析) ──► 自动选择最佳 Parser 提取纯文本与数据
2. Classification (类型识别) ──► 判断文件类型（例：检测报告 / 会议纪要 / 政策文件）
3. Domain Mapping (领域归属) ──► 自动映射到 KU / COM / STR / DAT / IMP 模块
4. Entity Extract (实体萃取) ──► 提炼人物、地点、数据、产品与科技节点
5. Semantic Annot (语义标注) ──► 自动绑定 Concept (`COG-CON`) 与 Framework (`FRM`)
```

---

## 📇 生成的【人机确认推荐卡片】模版示例 (Ingestion Card)

系统解析完成后，将生成一份结构化的**归档建议卡片**供您一键确认：

```markdown
### 📇 Ingestion Suggestion Card

* **来源文件**: `/Inbox/PDFs/2026_西藏林芝藏红花HPLC检测报告.pdf`
* **识别类型**: 实验室质量检测报告 (置信度: 98%)
* **萃取实体 (Entities)**:
  * `ENT-000302`: 藏红花素 Crocin (实测色价: 278)
  * `ENT-000303`: 藏红花苦素 Picrocrocin (实测: 85 mg/g)
* **包含证据链 (Proof Chain)**:
  * 超越 ISO 3632 特级标准 (≥190) 达 46.3% (`IMP-STD-Chain`)
* **建议归档位置**:
  * `Knowledge Repository` $\rightarrow$ `Sprint-5/DAT-3100` (更新检测数据)
  * `Knowledge Repository` $\rightarrow$ `Evidence/EVI-1004` (新增检测背书)

👉 **[ 点击一键确认 Commit ]** &nbsp;&nbsp;&nbsp;&nbsp; **[ 修改建议 / 暂存 Inbox ]**
```

---

## 🔒 防污染纪律 (Strict Ingestion Protocol)

* **未经用户点击 `[ 一键确认 Commit ]` 的原始素材，绝对不会直接进入公开业务产出（COM）！**
* 确保 Repository 永远保持绝对纯净、权威、零幻觉。

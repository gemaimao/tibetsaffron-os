# 📇 Ingestion Card — 【一句话标题，建议 ≤20 字】

> **输入时间**: `YYYY-MM-DD HH:mm CST`
> **输入通道**: 通道① `/Inbox/Documents` ｜ 通道② 粘贴文本（对话直输） ｜ 通道③ `/Inbox/PDFs` ｜ 通道④ `/Inbox/Transcripts` ｜ 通道⑤ `/Inbox/Data_Raw` ｜ 通道⑥ `/Inbox/Media_Raw`
> **输入原文**: `Inbox/<子目录>/<原始文件名>`
> **处理状态**: AI 已理解 ⏳ → **待人工一键确认 Commit** ⏸（未入库 Repository）

---

## 〇、静默处理 5 步管道回执 (Silent Processing)

| # | 步骤 | 本件结果 |
| :--: | :--- | :--- |
| 1 | Format Parsing 格式解析 | `<Parser：pdftotext / docx / OCR / 纯文本>` → 提取 `<N>` 字纯文本 |
| 2 | Classification 类型识别 | `<检测报告 / 会议纪要 / 政策文件 / 通稿 / 财务凭证 / 图片>`（置信度 `<0–100%>`） |
| 3 | Domain Mapping 领域归属 | `<KU / COM / STR / DAT / IMP>` → `<模块名>` |
| 4 | Entity Extract 实体萃取 | `<n>` 个人物 / `<n>` 个地点 / `<n>` 组数据 / `<n>` 个产品与科技节点 |
| 5 | Semantic Annot 语义标注 | `COG-CON-<xxxx>` × `FRM-<xxxx>` |

---

## 一、AI 自动理解 (Understanding)

* **识别类型**: `<类型>`（置信度 `<0–100%>`）
* **语义溯源**: `<与哪份 SSOT 资产/章节同构；是否为新事实主张；若与 canonical 表述有张力，此处点名>`
* **萃取实体 (Entities)**:
  * `ENT-<编号>`: `<实体名>` — `<一句话定义>`
  * `ENT-<编号>`: `<实体名>` — `<一句话定义>`
* **包含证据链 (Proof Chain)**:
  * `<指标/结论>`（`<标准编号或阈值>`，`<实测值>`）→ `<IMP-xxx-Chain>`
* **语义标注 (Binding)**: `<资产编号 × 资产编号 × 概念编号>`

---

## 二、📇 Ingestion Suggestion Card（SOP 正式结构）

* **来源文件**: `Inbox/<子目录>/<YYYYMMDD>_<原始文件名>`
* **识别类型**: `<类型>`（置信度: `<98%>`）
* **萃取实体 (Entities)**:
  * `ENT-000000`: `<实体名>`（`<实测值或关键属性>`）
  * `ENT-000000`: `<实体名>`（`<实测值或关键属性>`）
* **包含证据链 (Proof Chain)**:
  * `<证据结论>` (`IMP-<链编号>`)
* **建议归档位置**:
  * `Knowledge Repository` → `<Sprint-N/DAT-xxxx>`（`<新增/更新>`）
  * `Knowledge Repository` → `Evidence/EVI-<xxxx>`（`<新增/更新>`）

👉 **[ 点击一键确认 Commit ]** &nbsp;&nbsp;&nbsp;&nbsp; **[ 修改建议 / 暂存 Inbox ]**

---

## 三、三维治理标签（V2.3 占位，待人工确认）

> 与 `Core/Knowledge/db.json` 资产字段一一对应，确认后写入 `ownership` / `temporal` / `claim_control`。

| 维度 | 字段名 | 占位取值 | 候选枚举 | 判定依据 |
| :--- | :--- | :--- | :--- | :--- |
| **归属权** | `ownership` | `「待定」` | `BRAND_OWNED` ｜ `PARTNER_EVIDENCE` ｜ `INDUSTRY_KNOWLEDGE` | `<本件为自研成果 / 第三方出具 / 公开行业资料>` |
| **时间状态** | `temporal` | `「待定」` | `CURRENT` ｜ `HISTORICAL` ｜ `FUTURE` | `<现行有效 / 历史存档 / 面向未来规划>` |
| **声明权限** | `claim_control` | `「待定」` | `CONFIRMED_FACT` ｜ `STRATEGIC_DIRECTION` | `<可公开核验的硬事实 / 战略判断与建议>` |

**附加治理字段（建议同时确认）**

| 字段 | 占位取值 | 说明 |
| :--- | :--- | :--- |
| `asset_code` | `「待定」` | 建议编码，如 `FACT-EVI-0xx` / `STR-xxxx` / `STD-xxxx` |
| `module_id` | `「待定」` | `mod-com` ｜ `mod-kno` ｜ `mod-vis` ｜ `mod-dat` ｜ `mod-brd` |
| `status` | `「待定」` | `Published` ｜ `Active` ｜ `Draft` |
| `tag_ids` | `[]` | 既有标签如 `tag-evidence` / `tag-zero-pesticide` / `tag-lab-test` |
| `trigger_questions` | `[]` | 该资产应能回答的 2–4 个提问句 |

---

## 四、防污染确认区 (Strict Ingestion Protocol Gate)

* [ ] **来源可核验**：原件编号 / 出具机构 / 日期三项齐全
* [ ] **无幻觉**：卡片内所有数字均可回溯至原件，无推算、无外推
* [ ] **无越权声明**：不含绝对化断言与因果跃迁（已过 JEV 决策层校验）
* [ ] **原文保留**：原始文件仍留存于 `Inbox/`，未移动、未删除
* [ ] **三维标签已人工确认**（第三节 `「待定」` 已全部替换）
* [ ] **Commit 决策**：`[ ] 确认入库` ／ `[ ] 修改后再议` ／ `[ ] 仅暂存 Inbox`

> ⚠️ 未经用户点击 `[ 一键确认 Commit ]` 的原始素材，绝对不会直接进入公开业务产出（COM）。

---

## 附：可选扩展区

### 术语治理对照（传播层 vs SSOT 层）

| 层级 | 本件用词 | SSOT canonical 用词 | 治理判定 |
| :--- | :--- | :--- | :--- |
| — | `<本件表述>` | `<资产原文表述>` | `✅ 同义升格` ／ `⚠️ 需回改` |

### 关联资产

`<ASSET-1>` ／ `<ASSET-2>` ／ `<EVI-xxxx>`

### 待办与向用户提问

1. `<需人工裁决的问题>`
2. `<需补交的原件或编号>`

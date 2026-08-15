# Ingestion Platform — 双轨蒸馏与动态补足引擎

> **Core Mission**: **双轨驱动 —— 静态知识蒸馏 (Static Distillation) + 动态内容实时补足 (Dynamic Ingestion)。**

---

## ⚙️ 双轨内容处理机制 (Dual-Track Engine)

```text
                               【输入中心 Ingestion Platform】
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
                 ▼                                                         ▼
    【轨一：静态知识蒸馏 (Static Distillation)】           【轨二：动态内容实时补足 (Dynamic Ingestion)】
    源头：海量 PDF、百科全书、论文、历史定稿          源头：实时活动通知、微信记录、新闻稿、领导讲话
    处理：去粗取精、提炼硬核数据、消除冗余           处理：提取时间/地点/人物/事件，建立时序索引
                 │                                                         │
                 ▼                                                         ▼
    【Core 规范资产 (Kernel)】                        【Event 动态资产 (DAT-6000 / Pilot)】
    (Entity / Concept / Principle / Framework)        (如：EVT-202609 藏博会 / EVT-202608 展厅提升)
                 │                                                         │
                 └────────────────────────────┬────────────────────────────┘
                                              ▼
                                 【秒级生成对外业务产出 (COM Output)】
```

---

## ⚡ 动态内容补足 SOP (Dynamic Ingestion Flow)

当有新的动态事件（如：9月拉萨藏博会、领导视察、最新签约、展厅提升）发生时：

1. **零负担输入**：直接发送一句话、贴一段微信对话，或将活动 Word 放入 `/Inbox/Documents/`。
2. **动态元数据提取 (Metadata Extraction)**：
   * `Event ID`: `EVT-YYYYMMDD-名称`
   * `Time & Location`: 时间、地点
   * `Participants`: 出席人员、领导级别
   * `Key Quotes`: 现场讲话、核心主旨
3. **熔炼与补足 (Fusion & Enrichment)**：
   * 将动态事件信息与核心库中的 `STR-4000`（新质生产力）、`TER-3000`（风土）、`DAT-3100`（检测数据）**自动熔炼**。
   * 一方面**秒级生成**目标新闻稿/讲解词；另一方面将事件作为增量档案归档入 `DAT-6000`，使 Repository 的动态记忆持续生长！

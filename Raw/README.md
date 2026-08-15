# Brand Content OS — Raw Vault (原采素材库)

**定位**: 存放未经整理、未经审计的海量原始参考资料（如：PDF 论文、政府批文、检测报告扫描件、采访录音文本、新闻剪报、招商草案等）。

**原则**: **只存不改，隔离脏数据**。原采库中的文件仅作为原材料供应池，不直接对外发布，必须经 Agent 提炼并分配 ID 后才能进入 Core 核心库。

---

## 📁 原采库标准目录结构

```text
/Raw
├── /PDFs           # 学术论文、行业研究报告、ISO 检验原始 PDF 电子版
├── /Documents      # 访谈逐字稿、会议纪要、政府批文、草案 Word/TXT
├── /Data_Raw       # 农户原始 Excel 登记表、实验室传感器原始数据
└── /Media_Raw      # 高清摄影原图、采访视频原片、展厅设计效果图
```

---

## 🔄 提炼与入库工作流 (Raw to Core Pipeline)

```text
用户放入 Raw 文件 ──► Pilot 发现盲区 ──► Agent 扫描 /Raw/ 提炼数据 ──► 写入 Git 核心库 (DAT/Evidence)
```

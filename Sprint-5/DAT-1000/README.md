# DAT-1000

# 《藏红花基础数据集（Saffron Core Dataset Schema）》

Module
Sprint 5 · Data Module

ID
DAT-1000

Version
v1.0

Status
Released

---

## 一、文档目的

DAT-1000 定义 Brand Content OS 中关于藏红花本体的核心基础数据结构。

本文件仅定义数据模型（Schema），不填写具体数据。

所有具体数据均在后续 DAT 子数据集中维护。

---

## 二、数据原则

DAT-1000 作为根数据集，应满足：

* 唯一性（Single Source of Truth）
* 可扩展性（Scalable）
* 可引用性（Referenceable）
* 可机器读取（AI Ready）
* 可持续维护（Version Controlled）

---

## 三、数据分类

### DAT-1100 基础身份数据（Identity）

| 字段 | 类型 |
| :--- | :--- |
| 中文名称 | String |
| 英文名称 | String |
| 拉丁学名 | String |
| 别名 | Array |
| 分类地位 | Object |
| 植物类型 | String |
| 生命周期类型 | String |

---

### DAT-1200 生物学数据（Biology）

| 字段 | 类型 |
| :--- | :--- |
| 染色体数 | Number |
| 球茎类型 | String |
| 花器结构 | Object |
| 雌蕊数量 | Number |
| 雄蕊数量 | Number |
| 花被片数量 | Number |
| 开花周期 | String |
| 生长周期 | String |

---

### DAT-1300 繁育数据（Propagation）

| 字段 | 类型 |
| :--- | :--- |
| 繁育方式 | Array |
| 球茎繁殖系数 | Number |
| 种子繁殖能力 | Boolean |
| 花芽形成时期 | String |
| 子球形成时期 | String |

---

### DAT-1400 风土数据（Terroir）

| 字段 | 类型 |
| :--- | :--- |
| 原产地 | String |
| 全球主要产区 | Array |
| 中国产区 | Array |
| 海拔范围 | Range |
| 温度范围 | Range |
| 降水需求 | Range |
| 光照需求 | String |
| 土壤类型 | Array |

---

### DAT-1500 农业数据（Agriculture）

| 字段 | 类型 |
| :--- | :--- |
| 种植方式 | Array |
| 花期 | DateRange |
| 采收期 | DateRange |
| 烘干方式 | Array |
| 冷萃工艺 | Boolean |
| CEA适配 | Boolean |

---

### DAT-1600 品质数据（Quality）

| 字段 | 类型 |
| :--- | :--- |
| Crocin | Number |
| Picrocrocin | Number |
| Safranal | Number |
| 水分 | Number |
| 灰分 | Number |
| 农残 | Object |
| 重金属 | Object |

---

### DAT-1700 功能数据（Function）

| 字段 | 类型 |
| :--- | :--- |
| 药用功能 | Array |
| 食品用途 | Array |
| 着色用途 | Array |
| 香气用途 | Array |
| 科研用途 | Array |

---

### DAT-1800 标准数据（Standards）

| 字段 | 类型 |
| :--- | :--- |
| ISO标准 | Array |
| 国家标准 | Array |
| 行业标准 | Array |
| 企业标准 | Array |

---

### DAT-1900 参考数据（Reference）

| 字段 | 类型 |
| :--- | :--- |
| 文献来源 | Array |
| DOI | Array |
| 标准编号 | Array |
| 图片引用 | Array |
| 数据更新时间 | Date |

---

## 四、引用关系

DAT-1000 服务于以下模块：

```
KU-1000
↓
KNO-1000
↓
VIS-1000
↓
COM-1000
↓
BRD-1000
```

DAT-1000 为上述模块提供统一的数据来源。

---

## 五、版本管理

| 版本 | 内容 | 日期 |
| :--- | :--- | :--- |
| v1.0 | 初始 Schema 建立 | 2026-08 |

---

## 六、交付状态

- **ID**：DAT-1000
- **Title**：藏红花基础数据集（Schema）
- **Version**：v1.0
- **Status**：Released
- **Type**：Root Dataset Schema

# DAT-2000

# 《生命科学数据集（Life Science Dataset Schema）》

Module
Sprint 5 · Data Module

ID
DAT-2000

Version
v1.0

Status
Released

---

## 一、文档目的

DAT-2000 定义 Brand Content OS 中关于藏红花生命科学的数据结构（Schema）。

本文件仅定义标准数据字段，不存储具体数据。

---

## 二、数据分类

### DAT-2100 生命周期（Life Cycle）

| 字段 | 类型 |
| :--- | :--- |
| 生命周期阶段 | Enum |
| 阶段顺序 | Number |
| 起始条件 | String |
| 结束条件 | String |
| 持续时间 | Range |

---

### DAT-2200 生长发育（Growth）

| 字段 | 类型 |
| :--- | :--- |
| 根系发育 | Object |
| 球茎发育 | Object |
| 叶片发育 | Object |
| 花芽形成 | Object |
| 花器发育 | Object |

---

### DAT-2300 繁殖（Propagation）

| 字段 | 类型 |
| :--- | :--- |
| 子球数量 | Number |
| 子球重量 | Number |
| 繁殖系数 | Number |
| 有性繁殖能力 | Boolean |
| 营养繁殖方式 | String |

---

### DAT-2400 生理指标（Physiology）

| 字段 | 类型 |
| :--- | :--- |
| 萌芽温度 | Range |
| 生长温度 | Range |
| 开花温度 | Range |
| 休眠温度 | Range |
| 光照需求 | String |

---

### DAT-2500 环境响应（Environment）

| 字段 | 类型 |
| :--- | :--- |
| 温度响应 | Object |
| 光照响应 | Object |
| 水分响应 | Object |
| 海拔响应 | Object |

---

### DAT-2600 品质形成（Quality Formation）

| 字段 | 类型 |
| :--- | :--- |
| 花柱发育阶段 | Object |
| 活性成分积累 | Object |
| 成熟指标 | Object |

---

### DAT-2700 实验数据（Research）

| 字段 | 类型 |
| :--- | :--- |
| 实验编号 | String |
| 数据来源 | String |
| 检测方法 | String |
| 更新时间 | Date |

---

## 三、引用关系

```
KU-2000
    ↑
KNO-2000
    ↑
DAT-2000
    ↓
VIS-2000
```

DAT-2000 为生命科学相关知识提供统一的数据支撑。

---

## 四、版本管理

| 版本 | 内容 | 日期 |
| :--- | :--- | :--- |
| v1.0 | 初始 Schema | 2026-08 |

---

## 五、交付状态

- **ID**：DAT-2000
- **Title**：生命科学数据集（Schema）
- **Version**：v1.0
- **Status**：Released

# Brand Content OS — Production Pilot (生产试运行)

**Status**: Active  
**Phase**: Release-v0.5 Production Pilot  
**Strategy**: **Freeze → Pilot → Review → Runtime**

---

## 🧭 4 步走战略路线 (Roadmap)

```text
① Freeze（停止设计，冻结 Kernel）
        │
        ▼
② Pilot（真实生产试运行）
        │
        ▼
③ Review（问题归档，禁止中途修改）
        │
        ▼
④ Runtime（只自动化已被验证的痛点）
```

---

## 🎯 Pilot 核心纪律与 KPI

**核心目标：现在不建更多系统，现在开始用系统！等用出问题，再自动化问题。**

### Pilot 4 大执行纪律

1. **真实业务**：选择藏红花真实项目，所有内容必须通过 Repository 生产（非 Demo、非 Example）。
2. **Strict Flow**：必须遵循 `Repository` → `Entity` → `Concept` → `Framework` → `Evidence` → `COM` → `Output` 链路。
3. **No Mid-flight Refactoring**：生产过程中遇到问题“只记录，不修改，继续跑”，严禁中途修改 Knowledge Kernel 架构。
4. **Data-backed Runtime**：重复 3 次以上的动作才记录入 Issue，试运行结束后统一归档沉淀 Runtime Backlog。

---

## 📋 Production Pilot 真实业务任务队列

| Task ID | 业务任务名称 | 真实产出类型 | 归档路径 | 状态 |
| --- | --- | --- | --- | --- |
| `PL-0001` | 藏红花公众号科普文章 | 公众号长文 | `/Pilot/PL-0001/` | 待执行 |
| `PL-0002` | 电商产品详情页科技壁垒 | 详情页文案与视觉脚本 | `/Pilot/PL-0002/` | 待执行 |
| `PL-0003` | 藏红花科技展厅 1 分钟解说词 | 展厅讲解词 | `/Pilot/PL-0003/` | 待执行 |
| `PL-0004` | 极地新风土招商推介 PPT | 招商演示提纲 | `/Pilot/PL-0004/` | 待执行 |
| `PL-0005` | 藏红花品质等级与常见 FAQ | 客户问答/传播 FAQ | `/Pilot/PL-0005/` | 待执行 |
| `PL-0006` | 藏红花生命迁徙短视频脚本 | 短视频脚本 (15s/30s) | `/Pilot/PL-0006/` | 待执行 |
| `PL-0007` | 品牌白皮书核心章节 | 白皮书 Markdown | `/Pilot/PL-0007/` | 待执行 |
| `PL-0008` | 藏红花球茎繁育技术培训课件 | 培训讲义/PPT | `/Pilot/PL-0008/` | 待执行 |

---

## 🐞 Pilot Issue Log (问题与痛点归档)

试运行过程中只记录以下 4 类问题：
1. 哪一步最慢？ (Slowest)
2. 哪一步最容易出错？ (Error-prone)
3. Repository 缺了什么？ (Missing)
4. 哪些动作重复超过 3 次？ (Repetitive >3)

| Issue ID | 关联 Task | 问题现象描述 | 痛点类型 | 建议 Runtime 能力 |
| --- | --- | --- | --- | --- |
| *(试运行过程中动态追加)* | | | | |

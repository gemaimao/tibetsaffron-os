# Brand Content OS — Pilot SOP (生产试运行标准操作流程)

为了确保每一项真实业务任务能够高效、标准化地执行，且不造成架构膨胀，所有 Pilot 任务统一遵循以下 **5 步循环 SOP**。

---

## 🔄 5 步循环标准流程

```text
Step 1: 任务输入 (Task Brief)
       ↓
Step 2: 知识链路绑定 (Repository Binding)
       ↓
Step 3: 结构化内容生成 (Content Generation)
       ↓
Step 4: 归档与痛点记录 (Archive & Issue Logging)
       ↓
Step 5: 零修改交付与流转 (Delivery & Next Task)
```

---

### Step 1: 任务输入 (Task Brief Input)
* **动作**：Product Owner 提交具体的真实业务任务指令（如：写一篇藏红花公众号科普文章、做一份招商 PPT）。
* **产出**：确定任务 ID (`PL-XXXX`)、目标受众、传播场景与交付格式。

---

### Step 2: 知识链路绑定 (Repository Binding)
* **动作**：Agent **不得凭借直觉或大模型泛化知识直接写作**，必须先在 Repository 中检索并绑定底层资产。
* **链路显式绑定**：
  $$\text{Entity (实体)} \longrightarrow \text{Concept (概念)} \longrightarrow \text{Principle (原则)} \longrightarrow \text{Framework (框架)} \longrightarrow \text{Evidence (证据)}$$
* **产出**：输出《任务知识绑定表》，明确本次引用的 `ENT-XXXXXX`、`COG-CON-XXXXXX`、`PRN-XXXXXX` 和 `FRM-XXXXXX` ID。

---

### Step 3: 结构化内容生成 (Content Generation)
* **动作**：严格遵循 `PRN-000503`（Structured Before Generated，先结构后生成），基于绑定的框架与规则生成最终业务文本。
* **约束**：所有关键结论与事实，必须能回溯到对应的 Entity / Evidence ID。

---

### Step 4: 归档与痛点记录 (Archive & Issue Logging)
* **动作 1（归档）**：将生成的内容保存至 `/Pilot/PL-XXXX/README.md`。
* **动作 2（记录卡点）**：回答以下 4 个问题，记录入 [Pilot/README.md](file:///Users/longhl/.gemini/antigravity/scratch/brand-content-os/Pilot/README.md) 的 Issue Log 中：
  1. *哪一步检索最慢？*
  2. *哪一步容易理解偏差？*
  3. *Repository 缺了什么具体内容？*
  4. *哪个人工动作重复了 3 次以上？*

---

### Step 5: 零修改交付与流转 (No-Refactor Delivery)
* **动作**：**严禁中途修改 Knowledge Kernel (KU-5000~5231) 架构**。即使发现 Repository 缺内容或关系不顺，只记 Issue，不改底层！
* **交付**：向 Product Owner 交付业务内容与 Issue 记录简报，立刻推进至下一个 Pilot 任务。

---

## 📊 单任务交付物标准目录结构

每个 Pilot 任务在 `/Pilot/PL-XXXX/` 下包含两个标准文件：
1. `README.md`：业务交付成果（可以直接拿去发表/使用的文章、脚本或 PPT 提纲）。
2. `METRICS.md`（可选）：本次任务调用的资产 ID 列表、耗时及产生的 Issue 记录。

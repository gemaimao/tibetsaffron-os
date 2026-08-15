# Brand Content OS

# Development Rules

Version

v1.0

Status

Release

---

# Purpose

本文件定义 Brand Content OS 的开发规则（Development Rules）。

这是整个项目最高级别的开发规范。

所有开发人员、AI Agent、自动化工具必须遵循本规则。

若其它文档与本文件冲突，以本文件为准。

---

# Rule 1

Repository First

任何开发工作都必须围绕 Repository 展开。

不得围绕聊天记录。

不得围绕临时文件。

不得围绕 PPT。

Repository 是唯一工程事实来源。

---

# Rule 2

Markdown First

所有品牌内容必须保存为 Markdown。

禁止：

Word

Excel

PPT

PDF

作为内容主存储。

Markdown 是正文唯一来源。

---

# Rule 3

Asset First

Brand Content OS 不管理文件。

Brand Content OS 管理 Asset。

任何新增内容：

第一步：

Create Asset。

而不是：

Create Document。

---

# Rule 4

SSOT

Single Source of Truth。

任何事实：

只能维护一份。

例如：

DAT-4101

只能存在一个。

其它模块：

全部引用。

禁止复制。

---

# Rule 5

Reference Instead of Copy

禁止复制内容。

例如：

COM

引用

KNO

而不是：

重新写一遍。

所有模块之间：

使用 Reference。

---

# Rule 6

Everything Versioned

任何修改：

不得覆盖。

必须：

Create Version。

例如：

v1.0

↓

v1.1

↓

v2.0

历史永久保存。

---

# Rule 7

Everything Linkable

任何 Asset

必须支持：

Reference

Backlink

Relation

Knowledge Graph

任何资产都必须能够找到：

来源。

引用。

去向。

---

# Rule 8

Repository Before Database

数据库：

不是正文。

数据库：

只负责索引。

Markdown：

负责正文。

Repository：

负责组织。

---

# Rule 9

Git First

任何修改：

先进入 Git。

所有 Release：

必须 Commit。

禁止：

本地修改长期不提交。

---

# Rule 10

Template First

创建 Asset：

必须：

使用 Template。

禁止：

空白开始。

所有模块：

保持统一格式。

---

# Rule 11

Module Isolation

COM

不能依赖 BRD。

VIS

不能直接修改 DAT。

DAT

不能修改 KNO。

模块之间：

通过 Reference。

不是直接耦合。

---

# Rule 12

Low Coupling

任何模块：

可以独立开发。

可以独立发布。

可以独立维护。

禁止：

一个模块影响整个 Repository。

---

# Rule 13

Metadata Required

每一个 Asset

必须拥有：

ID

Title

Module

Sprint

Version

Status

Owner

Tags

Updated

Description

缺失 Metadata

禁止提交。

---

# Rule 14

Never Build PPT

禁止：

把 PPT

作为最终成果。

PPT

只能由 Repository

自动生成。

Repository

才是最终成果。

---

# Rule 15

AI Ready

任何新增内容：

必须满足：

AI 可读取。

AI 可引用。

AI 可理解。

AI 可生成。

禁止：

图片文字。

扫描 PDF。

无法解析格式。

---

# Rule 16

No Duplicate Knowledge

任何知识：

只能存在：

唯一位置。

例如：

品质形成机制

只能：

KNO-5000。

其它地方：

引用。

禁止复制。

---

# Rule 17

No Hidden Logic

所有规则：

必须写入 Repository。

禁止：

存在聊天。

存在脑子里。

存在 Prompt。

所有规则：

必须文档化。

---

# Rule 18

Documentation Before Coding

任何开发：

先：

文档。

后：

代码。

禁止：

直接 Coding。

---

# Rule 19

Release Required

任何 Sprint：

完成后：

必须：

Release。

必须：

Repository Packaging。

未 Release：

视为未完成。

---

# Rule 20

Build Once, Reuse Forever

任何 Asset：

设计一次。

无限引用。

而不是：

重复生产。

---

# Rule 21

Developer Independence

任何新 Agent：

读取 Repository 后，

应能够独立继续开发。

不得依赖历史聊天。

不得依赖口头说明。

Repository 必须完整自解释。

---

# Rule 22

Repository Is The Product

Brand Content OS 的产品不是：

网站。

不是：

数据库。

不是：

后台。

真正产品：

Repository。

其它：

全部围绕 Repository 工作。

---

# Development Workflow

统一流程：

Research

↓

Knowledge

↓

Visual

↓

Data

↓

Brand

↓

Review

↓

Release

↓

Repository

↓

Git

↓

AI

---

# Golden Principles

Repository First

Markdown First

Asset First

SSOT

Reference Instead of Copy

Everything Versioned

Everything Linkable

Git First

AI First

Build Once, Reuse Forever

---

# Acceptance Criteria

任何代码、任何 Agent、任何开发者必须满足：

✓ 不创建重复知识

✓ 不覆盖历史版本

✓ 不绕过 Repository

✓ 不绕过 Markdown

✓ 不绕过 Metadata

✓ 不直接修改数据库正文

✓ 不依赖聊天继续开发

Brand Content OS 的 Repository 是唯一可信开发源（Single Development Source）。

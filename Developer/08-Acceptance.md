# Brand Content OS

# Acceptance Specification

Version

v1.0

Status

Release

---

# Purpose

本文档定义 Brand Content OS 的统一验收标准（Acceptance Criteria）。

所有 Sprint、所有模块、所有 Asset、所有软件功能均以本文件作为最终验收依据。

未满足本文件要求，不得标记为 DONE 或 RELEASE。

---

# Acceptance Philosophy

Brand Content OS 的验收不是检查“文档是否写完”。

而是验证：

- 是否形成可持续资产（Asset）
- 是否能够长期维护
- 是否能够被 AI 理解
- 是否能够进入 Repository
- 是否能够支持后续演进

---

# Level 1

Repository Acceptance

Repository 必须满足：

✓ Repository 结构完整

✓ 根目录文件完整

✓ Sprint 目录完整

✓ Developer 目录完整

✓ Release 目录完整

✓ Assets 目录完整

✓ Templates 目录完整

✓ Reference 目录完整

✓ Git 初始化完成

---

# Level 2

Sprint Acceptance

每个 Sprint 必须满足：

✓ README 存在

✓ Release 存在

✓ 全部交付文件存在

✓ Status 正确

✓ Version 正确

✓ 已记录 CHANGELOG

✓ 已 Git Commit

否则 Sprint 不得封版。

---

# Level 3

Module Acceptance

每个模块必须满足：

✓ 模块编号正确

✓ 模块边界清晰

✓ 内容完整

✓ Metadata 完整

✓ 能独立维护

✓ 能独立引用

✓ 无重复内容

---

# Level 4

Asset Acceptance

每一个 Asset 必须拥有：

ID

Title

Module

Sprint

Version

Status

Description

Owner

Tags

Updated At

Markdown

Reference

缺失任意关键字段：

不得提交。

---

# Level 5

Markdown Acceptance

所有 Markdown 必须：

UTF-8

纯文本

Git 可 Diff

AI 可解析

标题层级规范

禁止：

扫描 PDF

图片正文

Word 导出格式

---

# Level 6

Reference Acceptance

每个 Asset：

必须能够：

引用其它 Asset。

被其它 Asset 引用。

支持：

Backlink。

形成知识网络。

禁止：

孤立 Asset。

---

# Level 7

Version Acceptance

所有 Asset：

必须具有版本号。

历史版本：

永久保留。

禁止覆盖。

必须：

可比较。

可追溯。

可恢复。

---

# Level 8

Repository Synchronization

任何新增内容：

必须同步：

Markdown

Repository

Git

Release

CHANGELOG

禁止：

只更新其中一部分。

---

# Level 9

Software Acceptance

软件必须满足：

Repository 可浏览

Sprint 可浏览

Module 可浏览

Asset 可浏览

Markdown 可阅读

Metadata 可显示

Reference 可查看

Version 可查看

Search 可用

Release 可查看

---

# Level 10

Search Acceptance

必须支持：

Keyword

Sprint

Module

Asset ID

Tag

Reference

Version

未来：

Semantic Search

Graph Search

Hybrid Search

---

# Level 11

AI Acceptance

Repository 必须能够：

✓ 被 NotebookLM 导入

✓ 被 Claude 理解

✓ 被 Gemini 理解

✓ 被 OpenAI Agent 理解

✓ 用于 RAG

✓ 用于 GraphRAG

无需额外人工整理。

---

# Level 12

Developer Acceptance

新的开发者或 Agent：

在不阅读聊天记录的情况下，

仅凭 Repository 即可：

理解项目

继续开发

完成任务

发布 Release

若不能做到，则 Repository 不合格。

---

# Release Acceptance

一次正式 Release 必须满足：

✓ Git Commit

✓ CHANGELOG 更新

✓ Release 文档生成

✓ Version 更新

✓ Repository 无结构错误

✓ 所有新增 Asset 编号正确

✓ 无重复 Asset

✓ 无失效引用

✓ 验收通过

---

# Quality Checklist

Repository

[ ]

Sprint

[ ]

Module

[ ]

Asset

[ ]

Markdown

[ ]

Metadata

[ ]

Reference

[ ]

Version

[ ]

Release

[ ]

Git

[ ]

AI

[ ]

Search

[ ]

Documentation

[ ]

全部勾选后，方可正式发布。

---

# Definition of Done

Brand Content OS 中，一个任务只有同时满足以下条件才算完成：

✓ 内容完成

✓ Markdown 完成

✓ Metadata 完整

✓ Reference 建立

✓ Repository 入库

✓ Git 提交

✓ CHANGELOG 更新

✓ Release 更新

✓ 验收通过

否则状态不得标记为 DONE。

---

# Final Principle

Repository 才是产品。

Markdown 才是知识。

Asset 才是管理对象。

Reference 才是知识网络。

Git 才是历史。

AI 才是未来。

所有开发工作最终都必须回归 Repository。

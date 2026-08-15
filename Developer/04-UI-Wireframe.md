# Brand Content OS

# UI Wireframe

Version

v1.0

Status

Release

---

# Purpose

本文档定义 Brand Content OS 的界面结构（UI Structure）与交互框架（Interaction Framework）。

本文件不定义视觉风格。

仅定义：

- 页面结构
- 页面层级
- 导航逻辑
- 功能布局
- 页面关系

UI 可以使用：

- Next.js
- React
- Tailwind CSS
- shadcn/ui

自由实现视觉风格。

---

# UI Design Principles

Repository First

Knowledge First

Asset First

Content First

Search First

AI First

Dark Mode First

Markdown Native

---

# Overall Layout

```
+-------------------------------------------------------------+

 Top Navigation

---------------------------------------------------------------

 Sidebar

 Main Workspace

 Inspector

---------------------------------------------------------------

 Status Bar

+-------------------------------------------------------------+
```

---

# Layout

## Left Sidebar

负责：

Repository Navigation

包括：

```
Repository

Sprint

Module

Favorites

Recent

Search

Tags

Release
```

默认宽度：

280px

支持折叠。

---

## Main Workspace

负责：

Asset 阅读与编辑。

显示：

Markdown

Metadata

Reference

Version

Preview

支持：

Split View

---

## Right Inspector

负责：

Metadata

Relations

History

Attachments

Reference

AI

默认：

320px

支持隐藏。

---

# Navigation

```
Repository

↓

Sprint

↓

Module

↓

Asset
```

例如：

```
Sprint-3

↓

KNO

↓

KNO-5000
```

导航保持永久可见。

---

# Top Navigation

包括：

```
Repository

Search

Global Command

Notifications

Settings

User
```

推荐：

Command Palette

快捷键：

⌘K

---

# Home Page

首页展示：

```
Repository Overview

↓

Sprint Progress

↓

Recent Assets

↓

Recent Updates

↓

Release

↓

AI Assistant
```

首页不是 Dashboard。

首页是 Repository Overview。

---

# Sprint Page

进入 Sprint 后：

展示：

```
Sprint Overview

↓

Module Cards

↓

Progress

↓

Recent Assets
```

例如：

Sprint 3

↓

Knowledge Module

↓

8 个 KNO。

---

# Module Page

例如：

```
Knowledge

Communication

Visual

Data

Brand
```

页面结构：

```
Module

↓

Category

↓

Asset List
```

支持：

List

Grid

Tree

三种模式。

---

# Asset List

显示：

```
ID

Title

Version

Status

Updated

Tag
```

支持：

排序

筛选

搜索

---

# Asset Detail

Asset 页面。

布局：

```
Title

Metadata

Markdown

Reference

History

Comments
```

正文：

Markdown 原生。

---

# Metadata Panel

包括：

```
ID

Module

Sprint

Version

Status

Owner

Created

Updated

Tags
```

Metadata 永远固定。

---

# Relation Panel

显示：

```
References

Backlinks

Related Assets

Knowledge Graph
```

以后：

Graph 可视化。

---

# History Panel

显示：

```
v1.0

↓

v1.1

↓

v2.0
```

支持：

Diff

Rollback

Compare

---

# Search

统一搜索。

支持：

```
Keyword

Asset ID

Sprint

Module

Tag

Reference
```

未来支持：

Semantic Search

Graph Search

---

# Global Command

Command Palette

```
⌘K
```

例如：

```
Open Asset

Create Asset

Search

Release

Git Commit

Open Sprint
```

Agent 后续也可以调用。

---

# Editor

采用：

Markdown Editor。

支持：

```
Preview

Split

Source
```

默认：

Split。

---

# Asset Creation

点击：

```
New Asset
```

流程：

```
Select Module

↓

Choose Template

↓

Create Asset

↓

Edit Metadata

↓

Write Content
```

禁止创建空白文档。

必须：

Template First。

---

# Release Page

显示：

```
Release Timeline

↓

Release Notes

↓

Repository Status
```

支持：

Compare Releases。

---

# AI Workspace

未来增加：

AI 面板。

包括：

```
Ask Repository

Summarize

Generate Draft

Find References

Create Asset

Explain Relation
```

所有 AI

均基于 Repository。

---

# Mobile

移动端：

仅支持：

Read。

不建议：

Edit。

---

# Theme

默认：

Dark。

支持：

Light。

未来：

Brand Theme。

---

# Interaction Principles

Single Click

Open

Double Click

Edit

Right Click

Context Menu

Drag

Move

Search

Everything

---

# Keyboard Shortcuts

```
⌘K

Global Search

⌘N

New Asset

⌘S

Save

⌘/

Command

⌘B

Toggle Sidebar
```

---

# Future Pages

未来增加：

```
Knowledge Graph

Timeline

Map

Statistics

AI Studio

Workflow

Review

Media
```

保持统一 Layout。

---

# UI Success Criteria

Brand Content OS UI 必须做到：

✓ Repository 一眼可见

✓ Sprint 一眼可见

✓ Module 一眼可见

✓ Asset 一键打开

✓ Search 全局统一

✓ Markdown 原生

✓ Metadata 固定

✓ Reference 可追踪

✓ Version 可比较

✓ AI 随时可调用

UI 的目标不是“漂亮”。

而是让品牌知识像 IDE 管理代码一样，被高效浏览、编辑、引用和演进。

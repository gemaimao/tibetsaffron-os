# Brand Content OS

# Information Architecture

Version

v1.0

Status

Release

---

# Purpose

本文档定义 Brand Content OS 的信息架构（Information Architecture，IA）。

它描述：

- Repository 如何组织
- Asset 如何组织
- Module 如何组织
- 用户如何浏览
- AI 如何理解

这是整个系统唯一的信息架构标准。

---

# Information Hierarchy

整个 Brand Content OS 共分为六层。

```
Repository

↓

Sprint

↓

Module

↓

Asset

↓

Record

↓

Reference
```

说明：

Repository

整个系统。

↓

Sprint

能力建设阶段。

↓

Module

能力模块。

↓

Asset

最小管理单位。

↓

Record

具体内容。

↓

Reference

引用关系。

---

# Repository Layer

```
Brand-Content-OS

README

PROJECT

ROADMAP

CHANGELOG

Developer

Release

Sprint-0

Sprint-1

Sprint-2

Sprint-3

Sprint-4

Sprint-5

Sprint-6

Assets

Templates

Reference
```

Repository 不保存业务内容。

业务内容全部进入 Sprint。

---

# Sprint Layer

每一个 Sprint 代表一个完整能力。

```
Sprint 0

Developer

Sprint 1

Communication

Sprint 2

OS

Sprint 3

Knowledge

Sprint 4

Visual

Sprint 5

Data

Sprint 6

Brand
```

Sprint 之间没有依赖关系。

所有 Sprint 可以独立维护。

---

# Module Layer

目前共有五个正式业务模块。

```
COM

Communication

KNO

Knowledge

VIS

Visual

DAT

Data

BRD

Brand
```

每个 Module 拥有自己的编号体系。

例如：

```
KNO-1000

KNO-2000

……

KNO-8000
```

---

# Asset Layer

Asset 是整个 Brand Content OS 的最小管理单位。

任何内容都必须先创建 Asset。

```
Asset

↓

Metadata

↓

Content

↓

Reference

↓

History
```

例如：

```
KNO-5000

品质形成机制
```

就是一个 Asset。

---

# Record Layer

Asset 可以拥有多个 Record。

例如：

```
DAT-4101

↓

Record

2026-001

↓

Record

2026-002

↓

Record

2026-003
```

Asset 永久存在。

Record 持续增加。

---

# Reference Layer

所有 Asset 必须建立引用关系。

例如：

```
DAT-4101

↓

KNO-5000

↓

VIS-3104

↓

COM-6000

↓

BRD-3000
```

引用：

代替复制。

---

# Navigation

Repository Navigation

```
Repository

↓

Sprint

↓

Module

↓

Asset
```

Module Navigation

```
Module

↓

Category

↓

Asset

↓

Record
```

Knowledge Navigation

```
Knowledge

↓

Reference

↓

Related Knowledge

↓

Visual

↓

Data
```

---

# Module Structure

## COM

```
COM

COM-1000

……

COM-8000
```

---

## KNO

```
KNO

KNO-1000

……

KNO-8000
```

---

## VIS

```
VIS

VIS-1000

……

VIS-8000
```

---

## DAT

```
DAT

DAT-1000

……

DAT-8000
```

---

## BRD

```
BRD

BRD-1000

……

BRD-8000
```

---

# Cross-module Relation

模块之间通过引用建立联系。

```
COM

↓

KNO

↓

VIS

↓

DAT

↓

BRD
```

不是树状。

而是网络。

---

# Asset Metadata

每一个 Asset 必须具有统一 Metadata。

```
ID

Title

Module

Version

Status

Owner

Description

Tags

Relations

Source

Updated At
```

Metadata 是所有 AI 检索入口。

---

# Search Architecture

支持：

```
Keyword

Module

Sprint

Tag

ID

Relation

Source
```

未来支持：

Semantic Search

Knowledge Graph

Hybrid Search

---

# URL Convention

建议统一 URL。

```
/com/1000

/kno/5000

/vis/3101

/dat/4101

/brd/3000
```

而不是：

```
/article/1

/article/2
```

Asset ID 永远保持稳定。

---

# Future Expansion

未来新增模块：

```
LAB

STD

CRM

IP

MEDIA

EDU

AI

Graph
```

全部保持相同 IA。

无需修改整体结构。

---

# IA Principles

整个 Information Architecture 遵循：

One Repository

↓

Multiple Sprints

↓

Independent Modules

↓

Reusable Assets

↓

Version Controlled

↓

Reference Driven

↓

AI Friendly

---

# Acceptance Criteria

Information Architecture 应满足：

✓ Repository 清晰

✓ Sprint 独立

✓ Module 独立

✓ Asset 唯一

✓ Record 可扩展

✓ Relation 可追踪

✓ AI 可理解

✓ Git 可维护

Information Architecture 是 Brand Content OS 的唯一结构标准。

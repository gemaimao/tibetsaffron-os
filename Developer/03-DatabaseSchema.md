# Brand Content OS

# Database Schema

Version

v1.0

Status

Release

---

# Purpose

本文件定义 Brand Content OS 的逻辑数据模型（Logical Database Schema）。

注意：

本 Schema **不绑定具体数据库实现**。

可以映射到：

- PostgreSQL
- SQLite
- MySQL
- Supabase
- PocketBase
- MongoDB
- Neo4j（Graph）

所有实现必须遵循本逻辑模型。

---

# Core Design Principles

Repository First

Asset First

Markdown First

SSOT

Reference Instead of Copy

Everything Versioned

Everything Linkable

---

# Logical Model

整个系统只有 8 个核心实体。

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

↓

Tag

↓

Release
```

所有其它对象均由此扩展。

---

# Entity 01

Repository

Repository 只有一个。

Fields

```
id

name

version

description

created_at

updated_at
```

Example

```
id

brand-content-os
```

---

# Entity 02

Sprint

一个 Repository

包含多个 Sprint。

Fields

```
id

code

title

description

status

order

version

created_at
```

Example

```
Sprint-3

Knowledge Module
```

---

# Entity 03

Module

一个 Sprint

包含多个 Module。

Fields

```
id

code

name

description

status

sprint_id
```

Example

```
KNO

Knowledge
```

---

# Entity 04

Asset

Asset 是整个系统最重要的数据实体。

所有内容都是 Asset。

Fields

```
id

asset_code

title

module

type

status

version

description

content_path

created_at

updated_at
```

Example

```
asset_code

KNO-5000
```

---

# Entity 05

Record

Record 表示 Asset 的具体数据。

一个 Asset

可以拥有无限 Record。

Fields

```
id

asset_id

record_version

content

created_at

updated_at

author

status
```

Example

```
DAT-4101

↓

Record

2026-001
```

---

# Entity 06

Reference

Reference 用于建立知识关系。

Fields

```
id

source_asset

target_asset

relation_type

description
```

Example

```
KNO-5000

references

DAT-4101
```

Relation Type

```
references

belongs_to

extends

supports

visualizes

derived_from

related_to
```

---

# Entity 07

Tag

Tag 提供统一分类。

Fields

```
id

name

color

description
```

Example

```
Ecology

Agriculture

Quality

History
```

Asset 与 Tag

采用多对多关系。

---

# Entity 08

Release

Repository Release。

Fields

```
id

version

release_name

description

created_at

status
```

Example

```
Release-v0.1-Sprint3
```

---

# Entity Relationship

```
Repository

│

├── Sprint

│

├── Module

│

├── Asset

│

├── Record

│

├── Reference

│

├── Tag

│

└── Release
```

---

# Asset Relationship

```
Asset

↓

Record

↓

Reference

↓

Version
```

Asset 永远存在。

Record 持续增加。

Reference 持续增长。

---

# Metadata Model

所有 Asset

统一 Metadata。

```
Asset ID

Asset Code

Title

Module

Sprint

Status

Version

Tags

Owner

Created At

Updated At

Description
```

Metadata 必须支持：

全文搜索。

---

# Version Model

```
Asset

↓

Version

1.0

↓

1.1

↓

2.0
```

历史版本永久保存。

禁止覆盖。

---

# File Mapping

数据库与 Repository 一一对应。

例如：

```
Asset

KNO-5000

↓

Repository

Sprint-3/KNO-5000.md
```

数据库只保存索引。

正文仍然使用 Markdown。

---

# Search Model

支持：

Keyword

Module

Sprint

Asset

Tag

Reference

Version

未来：

Semantic Search

Graph Search

Hybrid Search

---

# Graph Model

Reference 自动形成 Knowledge Graph。

```
Asset

↓

Reference

↓

Reference

↓

Reference
```

未来：

Neo4j

GraphRAG

全部直接读取。

---

# AI Model

AI 永远读取：

Asset

而不是：

Repository 文件夹。

AI 输入：

```
Asset

↓

Metadata

↓

Content

↓

Relation
```

AI 输出：

Knowledge

Visual

Communication

Brand

---

# Database Expansion

未来新增实体：

```
User

Role

Permission

Workflow

Review

Approval

Media

Attachment

Comment
```

均保持兼容。

无需修改现有 Schema。

---

# Database Principles

整个 Database Schema

必须满足：

✓ Asset 唯一

✓ Record 独立

✓ Reference 网络化

✓ Version 永久保存

✓ Markdown 与数据库分离

✓ Repository 与数据库同步

✓ AI 可理解

✓ Git 可维护

---

# Acceptance Criteria

Brand Content OS Database 必须支持：

Repository

↓

Asset

↓

Metadata

↓

Relation

↓

Version

↓

Release

任何品牌资产都必须能够：

找到唯一位置。

找到唯一版本。

找到所有引用。

找到所有历史。

数据库不是正文存储系统。

数据库是 Brand Content OS 的索引层（Index Layer）。

# Brand Content OS

# Project Structure

Version

v1.0

Status

Release

---

# Purpose

本文档定义 Brand Content OS 的工程目录、代码组织、模块边界和命名规范。

它是整个项目唯一的工程结构标准。

任何 AI Agent 或开发者都必须遵循本文件。

---

# Technology Stack

Framework

Next.js 15+

Language

TypeScript

UI

React

TailwindCSS

shadcn/ui

Icons

Lucide

Markdown

MDX

Database

SQLite（开发）

PostgreSQL（生产）

ORM

Drizzle ORM（推荐）

State

Zustand

Search

FlexSearch（MVP）

未来：

Meilisearch

Graph

Neo4j（未来）

Deployment

Docker

GitHub

Vercel（可选）

---

# Repository Structure

```
brand-content-os/

app/

components/

features/

lib/

hooks/

types/

styles/

public/

content/

database/

docs/

scripts/

tests/
```

---

# App

```
app/

layout.tsx

page.tsx

search/

settings/

release/

graph/

repository/
```

负责：

Routing。

禁止业务逻辑。

---

# Components

```
components/

layout/

navigation/

editor/

asset/

metadata/

relation/

graph/

search/

ui/
```

特点：

纯 UI。

不得直接访问数据库。

不得写业务。

---

# Features

整个系统真正的业务模块。

```
features/

repository/

communication/

knowledge/

visual/

data/

brand/

release/

ai/
```

以后新增：

```
lab/

crm/

media/

workflow/
```

全部进入：

features。

---

# Feature Example

例如：

```
features/

knowledge/

components/

hooks/

service/

types/

utils/

repository.ts
```

每一个 Feature

保持完全一致。

---

# Content

所有 Markdown。

```
content/

Sprint-0/

Sprint-1/

Sprint-2/

Sprint-3/

Sprint-4/

Sprint-5/

Sprint-6/
```

Markdown

永远放这里。

数据库：

不保存正文。

---

# Database

```
database/

schema/

migration/

seed/

repository/
```

包括：

Asset

Reference

Version

Release

Tag

Record

---

# Lib

公共能力。

```
lib/

markdown/

search/

graph/

parser/

release/

repository/

logger/
```

禁止业务代码。

---

# Hooks

```
hooks/

useAsset

useSearch

useReference

useRelease

useRepository
```

统一命名：

```
useXxx
```

---

# Types

```
types/

asset.ts

reference.ts

release.ts

repository.ts

metadata.ts
```

统一类型。

禁止重复定义。

---

# Styles

```
styles/

globals.css

theme.css

editor.css
```

仅保存：

全局样式。

---

# Public

```
public/

logo/

icon/

image/

font/
```

---

# Docs

```
docs/

architecture/

release/

developer/

reference/
```

工程文档。

不是品牌内容。

---

# Scripts

```
scripts/

build

release

import

export

sync

generate
```

未来：

AI Import

Markdown Sync

Graph Generate

---

# Tests

```
tests/

unit/

integration/

e2e/
```

未来：

Playwright。

---

# Asset Structure

任何业务内容：

```
Asset

↓

Metadata

↓

Markdown

↓

Reference

↓

Version
```

保持一致。

---

# Naming Convention

Folder

```
kebab-case
```

Example

```
knowledge-module
```

File

```
PascalCase

或

kebab-case
```

统一：

Repository 中：

Markdown

全部：

```
UPPER-ID.md
```

例如：

```
KNO-5000.md
```

---

Code

```
camelCase
```

Component

```
PascalCase
```

Hook

```
useAsset()
```

---

# Import Rule

统一：

```
@

```

例如：

```
@/components

@/features

@/lib
```

禁止：

```
../../../
```

---

# Layer Rule

Repository

↓

Feature

↓

Service

↓

Component

↓

Hook

↓

UI

禁止：

UI

直接访问：

Database。

---

# Module Isolation

每个 Feature

不得依赖其它 Feature。

只能：

调用：

Shared。

例如：

```
Knowledge

×

Import

Brand

```

禁止。

必须：

```
Knowledge

↓

Shared

↓

Brand
```

---

# Shared Layer

```
shared/

components/

types/

hooks/

utils/
```

多个模块共用。

---

# AI Layer

```
features/

ai/

prompt/

workflow/

provider/

agent/
```

未来：

Claude

Gemini

OpenAI

统一放这里。

---

# Repository Layer

```
Repository

↓

Sprint

↓

Module

↓

Asset
```

整个工程保持一致。

---

# Build Principle

任何新增功能：

先：

```
Feature

↓

Service

↓

Component

↓

Page
```

禁止：

直接写：

Page。

---

# Engineering Principles

Repository First

Markdown First

Feature First

Asset First

Type Safe

Low Coupling

High Cohesion

Git Friendly

AI Friendly

---

# Acceptance Criteria

工程必须满足：

✓ Feature 独立

✓ Markdown 独立

✓ Database 独立

✓ UI 独立

✓ AI 可扩展

✓ Repository 可维护

✓ Sprint 可独立开发

✓ 多 Agent 可协作

Project Structure 是 Brand Content OS 唯一工程组织标准。

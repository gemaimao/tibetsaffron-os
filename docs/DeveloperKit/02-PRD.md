# Brand Content OS（BCOS）

## Product Requirement Document（PRD）

Version: v0.1 MVP
Status: Approved For Development
Last Update: 2026-08-06

---

# 1. Product Definition
Product Name: Brand Content OS（BCOS）
Product Type: Brand Knowledge Operating System
Product Position: 面向品牌知识资产（Brand Asset）的操作系统。系统负责建立知识、管理知识、关联知识、发布知识、演化知识，而不是管理文章。

---

# 2. Product Goals
v0.1 MVP 目标：完成 Brand Asset 的全生命周期管理。
包括：创建、编辑、查询、分类、搜索、Release、Markdown 导出。

---

# 3. Product Scope
包含：Module, Asset, Editor, Search, Relation, Release, Tag, Version, Export.
不包含：权限, AI, 工作流, 评论, 多人协作, 自动生成, 发布网站.

---

# 4. Target Users
Brand Editor：职责为建立品牌知识、维护品牌知识、发布品牌知识。

---

# 5. Functional Requirements
- **FR-01 Module Management**: CRUD 与排序 Module (COM, KNO, VIS, DAT, BRD)。
- **FR-02 Asset Management**: 创建、编辑、删除 (Soft delete -> Archived)、复制、移动 Asset。
- **FR-03 Markdown Editor**: Live Preview, 标题、引用、列表、图片、代码块、链接与自动保存。
- **FR-04 Search**: 全文搜索，按 ID, Title, Tag, Module, 模糊搜索。
- **FR-05 Tag**: 多 Tag 支持与 Tag 搜索。
- **FR-06 Relation**: Asset ↔ Asset 双向关联。
- **FR-07 Release**: 创建、查看、导出 Release（仅引用 AssetVersion 指针）。
- **FR-08 Export**: 导出 Markdown, JSON, ZIP。

---

# 6. Asset Life Cycle
Draft → Review → Published → Archived

---

# 7. Non-Functional Requirements
- 启动：<2 秒
- 搜索：<300ms
- 编辑：自动保存
- 支持：10000+ Asset

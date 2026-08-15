# Brand Content OS（BCOS）

## API Specification

Version: v0.1 MVP
Status: Approved For Development
Architecture: RESTful API (BFF Pattern)

---

# Key Principles
- RESTful, JSON Only, Version First, Asset First.
- **BFF Pattern**: 前端只调用 BCOS API，绝不直接访问数据库。
- **Asset Centric**: `/api/assets`, `/api/modules`, `/api/releases`.
- **Soft Delete**: 删除 Asset 仅改变 Status 为 `Archived`，永不物理删除。
- **Immutable Version**: AssetVersion 不可编辑，仅可 Create 与 Restore。
- **Immutable Release**: Release 一旦发布，不可编辑或删除。

---

# API Routes
- `GET /api/dashboard`
- `GET/POST/PATCH/DELETE /api/modules`
- `GET/POST/PATCH/DELETE /api/assets`
- `GET /api/assets/{id}/versions`
- `POST /api/assets/{id}/restore/{version}`
- `GET/POST/DELETE /api/assets/{id}/relations`
- `GET /api/search`
- `GET/POST /api/releases`
- `POST /api/export/markdown`, `/api/export/json`, `/api/export/zip`

# Brand Content OS（BCOS）

## Database Schema

Version: v0.1 MVP
Status: Approved For Development

---

# Entity Relationship Diagram (ER)
Module
  │
  ├──────────────┐
  │              │
Asset        Release
  │              │
  │          ReleaseAsset
  │
AssetVersion
  │
AssetTag
  │
 Tag
  │
Relation

---

# Entities
1. **Module**: id, code, name, description, icon, sort, status, created_at, updated_at
2. **Asset**: id, uuid, module_id, asset_code (唯一且终身不可修改), title, subtitle, summary, content, quote, status, version, created_at, updated_at
3. **Tag**: id, name, color, description, created_at
4. **AssetTag**: asset_id, tag_id
5. **Relation**: id, source_asset_id, target_asset_id, relation_type (Reference, Support, Evidence, Image, Video, Dataset, Research, History, Future), description, created_at
6. **AssetVersion**: id, asset_id, version, title, subtitle, summary, content, quote, editor, created_at (Append-only)
7. **Release**: id, name, version, description, status, created_at
8. **ReleaseAsset**: release_id, asset_version_id (只保存 AssetVersion 指针，绝不复制正文)

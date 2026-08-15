# Brand Content OS（BCOS）

# Development Rules (Mandatory)

Version: v0.1
Status: Mandatory

---

# Mandatory Rules
1. **No Content Duplication**: 所有内容必须通过 Reference 实现。
2. **Append-Only Version**: Version 永远追加，不得覆盖旧版本。
3. **Release References Version**: Release 必须引用 `AssetCode @ Version` 指针，不能复制正文。
4. **Immutable AssetCode**: AssetCode 终身不变。
5. **Soft Delete**: 删除 Asset 设为 `Archived`，严禁物理删除。
6. **BCOS Golden Rule**: `One Knowledge → One Asset → One Source → Many Outputs`.

# Brand Content OS（BCOS）

## Information Architecture（IA）

Version: v0.1 MVP
Status: Approved For Development

---

# 1. IA Design Principles
1. **Asset First**: 所有内容围绕 Asset 组织，页面只是 Asset 的呈现方式。
2. **Flat First**: 三层以内完成所有导航。
3. **Search First**: 任何 Asset 都能通过 Cmd+K 搜索快速到达。
4. **Relation First**: Asset 之间通过 Relation 建立知识网络，而不是目录树。

---

# 2. System Hierarchy & Flow
Dashboard → Module → Asset → Release (最深不超过 4 层)。
Primary Navigation:
- Dashboard
- Communication (COM)
- Knowledge (KNO)
- Visual (VIS)
- Data (DAT)
- Brand (BRD)
- Release
- Search (Cmd+K)
- Settings

---

# 3. Asset Detail Page Structure
Header (ID, Title, Status, Version) → Metadata → Split Markdown Editor → Relations → History & Diff → Export.

---

# 4. Design Constraints
任何 Asset 在 3 次点击以内到达；任何功能在 2 层导航以内完成；任何对象只有一个正式入口；任何知识只有一个正式 Asset。

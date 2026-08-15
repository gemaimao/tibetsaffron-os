# Brand Content OS — MANIFEST Specification

**System Version**: `v14.0`  
**Governance Version**: `V2.3 Protocol-First Enterprise Knowledge Governance`  
**Strategic Principle**: `Agent Agnostic, Protocol First` (与 Agent 无关，以内容生产协议为先)  
**Core Architecture**: SSOT 5 Modules + 7-Level Evidence Hierarchy + Scenario Matrix + 3-Dimensional Governance (Ownership, Temporal, Claim)

---

## 🏛️ V2.3 Enterprise Governance Specifications

1. **Knowledge Ownership Governance (`V2_3_KNOWLEDGE_OWNERSHIP_GOVERNANCE.md`)**:
   - `BRAND_OWNED` (天旺自有事实)
   - `INDUSTRY_KNOWLEDGE` (产业公共知识)
   - `ACADEMIC_REFERENCE` (学术与科研文献)
   - `PARTNER_EVIDENCE` (合作方第三方凭证)
   - `COMPETITOR_REFERENCE` (竞品与行业对比)
   - `FUTURE_EXPLORATION` (未来探索与行业方向)
   - `UNVERIFIED` (未核实草稿)

2. **Temporal State Governance (`V2_3_TEMPORAL_STATE_GOVERNANCE.md`)**:
   - `ORIGIN` ➔ `HISTORICAL` ➔ `EVOLUTION` ➔ `CURRENT` ➔ `EXPERIMENT` ➔ `FUTURE` ➔ `UNKNOWN`
   - EVOLUTION Relationship Topology: (崇明养球 `HISTORICAL`) ➔ (林芝催花 `CURRENT`) ➔ (CEA 植物工厂 `FUTURE`)

3. **Claim Control Governance (`V2_3_CLAIM_CONTROL_GOVERNANCE.md`)**:
   - `CONFIRMED_FACT` (已确证事实)
   - `DERIVED_EXPLANATION` (合理衍生解释)
   - `STRATEGIC_DIRECTION` (战略探索方向)
   - `FORBIDDEN_ASSERTION` (严格禁止声明)

4. **Asset Metadata Schema v2.3 (`V2_3_ASSET_METADATA_SCHEMA.json`)**:
   - Integrated `ownership`, `temporal`, and `claim_control` governance metadata fields into the canonical Asset Schema.

5. **CAP V2.3 Validation Audit Nodes**:
   - `Ownership Validation`: Blocks claiming `INDUSTRY_KNOWLEDGE` as `BRAND_OWNED`.
   - `Temporal Validation`: Blocks using `HISTORICAL` (e.g. 崇明育球) for `CURRENT` technology claims.
   - `Claim Validation`: Blocks assertions exceeding the claim level.

---

## 🧪 V2.3 Regression Test Results

- **Case 001 (Historical Block)**: `PASS` — 崇明育球 (`HISTORICAL`) 描述天旺当前技术被死锁封锁。
- **Case 002 (Ownership Block)**: `PASS` — IoT 水培 (`INDUSTRY_KNOWLEDGE`) 冒充天旺当前技术被死锁封锁。
- **Case 003 (Industry Release)**: `PASS` — IoT 水培 在行业前沿文章中放行使用。

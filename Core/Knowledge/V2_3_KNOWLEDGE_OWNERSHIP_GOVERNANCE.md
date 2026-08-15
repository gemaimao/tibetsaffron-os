# Brand Content OS — V2.3 Knowledge Ownership Governance Specification

**Task ID**: `CORE-V2.3-GOVERNANCE-UPGRADE`  
**Specification Title**: `Knowledge Ownership Governance (知识归属权治理)`  
**Status**: `Active & Enforced Specification`  
**Core Purpose**: Solve the knowledge ownership boundary issue, preventing AI Agents from misrepresenting public industry knowledge, partner evidence, or academic references as Tianwang's proprietary brand capabilities.

---

## 🏛️ 1. Ownership Categories (知识归属权七级分类表)

Every Asset in Brand Content OS MUST explicitly answer: **“Who owns this knowledge?”**

| Ownership Code | Category Name | Description | Claim Permission Boundary | Example |
| --- | --- | --- | --- | --- |
| **`BRAND_OWNED`** | 品牌自有事实 | 天旺自身资产、设施基地、财务凭证、商标与专利 | 允许作为天旺固有事实与能力直接宣称 | 西藏林芝米瑞乡天旺基地、拉萨海关检疫单 `CMP-001` |
| **`INDUSTRY_KNOWLEDGE`** | 产业公共知识 | 藏红花行业通用知识、全球产区分布、海关数据 | 仅允许作为行业背景或品类认知说明 | 全球藏红花产量（伊朗 43.4%、西班牙 23.3%） |
| **`ACADEMIC_REFERENCE`** | 学术与科研文献 | 经过同行评审的学术期刊、教材、实验室论文 | 必须标注科学原理出处，严禁伪造为天旺独家发现 | 藏红花三倍体 ($2n=3x=24$) 减数分裂异常理论 |
| **`PARTNER_EVIDENCE`** | 合作方第三方凭证 | 第三方检测机构、大学联合实验室、海关出具的凭证 | 严格依凭证报告文书使用，严禁自行扩展结论 | 重庆市食药检院 0农残检测报告 `No. A26SW02809` |
| **`COMPETITOR_REFERENCE`** | 竞品与行业对比 | 行业传统大田栽培方式、传统掺假手段 | 仅允许作为行业痛点或对比基准 (`CONTRAST`) | 传统大田露天花丝泥土污染与掺假历史 |
| **`FUTURE_EXPLORATION`** | 未来探索与行业方向 | 设施农业 CEA 未来演进方向、IoT 水培探索 | 仅允许表达为战略探索方向，**严禁宣称当前生产能力** | IoT 营养液膜水培植物工厂趋势 |
| **`UNVERIFIED`** | 未核实草稿素材 | 尚未核实的原件单据或内部草稿 | **绝对禁止**在对外内容中作为事实引用 | 未核实农户工资单草稿 `IND-001-DRAFT` |

---

## 🛡️ 2. Ownership Governance Rules (归属权治理规则)

1. **`Rule KO-01: Ownership Match` (归属权声明匹配规则)**:
   - An Asset with `INDUSTRY_KNOWLEDGE` or `FUTURE_EXPLORATION` **MUST NOT** be stated as a `BRAND_OWNED` current capability.
2. **`Rule KO-02: Claim Boundary Enforcement` (声明权限边界硬拦截)**:
   - If an Agent generates text claiming an `INDUSTRY_KNOWLEDGE` asset as Tianwang's exclusive capability, the CAP Engine MUST trigger an `OWNERSHIP_VIOLATION` and block the asset.
3. **`Rule KO-03: Academic Attribution` (学术出处归属规则)**:
   - Academic reference assets MUST be attributed to scientific methodology, rather than proprietary corporate secrets.

---

## 📋 3. Specification Examples

### Negative Example (错误归属案例)
```json
{
  "asset_code": "TECH-IOT-HYDROPONICS",
  "title": "IoT 营养液膜水培技术",
  "knowledge_owner": "BRAND_OWNED",  // ❌ 错误：归为天旺自有
  "claim": "天旺藏红花采用 IoT 营养液膜水培方式生产" // ❌ 错误：冒充当前生产能力
}
```

### Correct Example (正确治理归属)
```json
{
  "asset_code": "TECH-IOT-HYDROPONICS",
  "title": "IoT 营养液膜水培技术",
  "ownership": {
    "owner_type": "INDUSTRY_KNOWLEDGE",
    "owner_entity": "Public Agricultural Science",
    "permission": "ALLOWED_AS_FUTURE_REFERENCE_ONLY"
  },
  "claim_control": {
    "allowed_usage": "可作为设施农业未来前沿演进趋势说明",
    "forbidden_usage": "严禁代表天旺当前生产模式"
  }
}
```

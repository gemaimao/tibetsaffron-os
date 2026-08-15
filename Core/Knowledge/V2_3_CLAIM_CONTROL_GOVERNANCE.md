# Brand Content OS — V2.3 Claim Control Governance Specification

**Task ID**: `CORE-V2.3-GOVERNANCE-UPGRADE`  
**Specification Title**: `Claim Control Governance (声明权限控制治理)`  
**Status**: `Active & Enforced Specification`  
**Core Purpose**: Solve the corporate communication boundary issue, establishing explicit allowed claims, forbidden claims, and claim permission levels for every Asset in Brand Content OS.

---

## 🎯 1. Claim Levels (声明权限四级层级)

Every Asset in Brand Content OS MUST explicitly state its **Claim Level**:

| Claim Level | Category Name | Description | System Enforcement Action | Example |
| --- | --- | --- | --- | --- |
| **`CONFIRMED_FACT`** | 已确证事实 | 拥有 Level 1/Level 2 硬核凭证支持的客观事实 | 允许在所有匹配场景中作为确切事实宣称 | 2025年5月拉萨海关出口加拿大 2kg (`CMP-001`) |
| **`DERIVED_EXPLANATION`** | 合理衍生解释 | 基于科学逻辑或专业农艺推导的合理说明 | 允许作为原理解释，但不能夸大为临床疗效 | 设施环境有助于控制生产投入品与污染风险 |
| **`STRATEGIC_DIRECTION`** | 战略探索方向 | 企业未来规划或行业前沿发展愿景 | 仅允许使用“探索/规划/愿景”句式 | 天旺正在规划探索设施农业未来发展方向 |
| **`FORBIDDEN_ASSERTION`** | 严格禁止声明 | 超越资产权限、缺乏数据支撑或违反红线的表达 | **硬性拦截**：CAP Engine 拦截并输出 `CLAIM_VIOLATION` | 宣称“天旺采用水培生产”或“藏红花具备人体抗衰老疗效” |

---

## 🛡️ 2. Claim Control Rules (声明控制三大铁律)

1. **`Rule CC-01: Explicit Allowed/Forbidden Clauses` (显示允许与禁止句式表)**:
   - 每个 Asset 必须包含 `allowed_usage` 与 `forbidden_usage`。
2. **`Rule CC-02: Strict Causal Decoupling` (因果关系统一防线)**:
   - CEA 设施控环 (环境控制条件) $\neq$ 0 农残检测结果 (实验室数据)。
   - **禁止句式**: “因为天旺采用了设施控环，所以产品自动达到了 0 农残”。
   - **允许句式**: “设施控环为投入品管理提供了必要条件；批次产品是否达到 0 农残，严格以第三方报告 No. A26SW02809 为准”。
3. **`Rule CC-03: Claim Level Enforcement` (级别越界自动死锁)**:
   - 任何 `STRATEGIC_DIRECTION` 资产被写成 `CONFIRMED_FACT` 句式时，CAP Engine 触发死锁并封锁该 Asset。

---

## 📋 3. Claim Governance Specification Schema

```json
{
  "asset_code": "TECH-CEA-01",
  "title": "西藏林芝 CEA 设施控环催花农艺",
  "claim_control": {
    "claim_level": "DERIVED_EXPLANATION",
    "allowed_usage": [
      "设施环境为生产过程的环境控制和投入品管理提供了条件",
      "通过温湿度与光照控制实现高标准催花"
    ],
    "forbidden_usage": [
      "设施控环自动产生 0 农残",
      "天旺藏红花完全不依赖土壤和养分"
    ]
  }
}
```

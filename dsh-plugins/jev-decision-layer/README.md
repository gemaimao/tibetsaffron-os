# @bcos/jev-decision-layer

Brand Content OS 的 **JEV 决策层** DSH 插件。把 V3.0 双系统架构中的决策层能力
（TypeSafe Jev System One）注册为 DSH 会话的一等工具，让 GUI 会话、微信 BOT 会话、
Paseo 拉起的 DSH 会话共享同一套治理纪律。

> 核心原则：**Jev 专职决策，协议固化主权，大模型仅作表达。**

## 工具

| 工具 | 原语 | 用途 |
| --- | --- | --- |
| `jev_claim_check` | Noul | 治理红线三维检测：未获批医疗宣称 / 因果断言跃迁 / 编造事实 → BLOCK / REVIEW / ALLOW |
| `jev_route_scene` | Choice | Brief 场景路由（OFFICIAL_PR / FINANCIAL_MEDIA / TECH_AGRICULTURE / LIFESTYLE_CONSUMER / B2B_SUPPLY_CHAIN） |
| `jev_score_asset` | Score | 素材支撑效能 1-5 阶评分（5 阶 = 国家级质检编号/海关凭单硬核证据） |

## 安装

```bash
# 1. 装入 desktop profile（微信 BOT 与 GUI 会话所在 profile）
dsh plugin --profile desktop add /Users/longhl/.gemini/antigravity/scratch/brand-content-os/dsh-plugins/jev-decision-layer

# 2. 若插件未自动挂载，把 cordis.patch.yml 的两行条目
#    （insert + config）复制进 ~/.dsh/profiles/desktop/cordis.patch.yml

# 3. 配置凭据：在共享保险柜 ~/.dsh/.credentials.yaml 增加一行
#    TYPESAFE_API_KEY: <你的key>

# 4. 重启 DSH NEXT → 工具对全部会话生效
```

## 回归测试

```bash
/opt/homebrew/bin/node test/regression.mjs
```

Fixtures 来自 `Core/Knowledge/JEV_HARNESS_EVOLUTION_LOG.json` 捕获的越权
corner cases（3 条必须 BLOCK）+ 1 条有据声明（必须 ALLOW）。

## 阈值

- `blockOnViolationP: 0.15` —— P(违规) 高于此值硬阻断（对应进化后 P_safe ≥ 0.85）
- `reviewOnViolationP: 0.05` —— 越过审查线进入人工复核（对应 V3 规格的 0.05 熔断线）

可在 profile 的 cordis.patch.yml 中对 `jev-decision-layer` 的 config 行覆盖。

## 语义依据

- `Core/Knowledge/V3_0_JEV_DECISION_LAYER_SPECIFICATION.md`
- `Core/Knowledge/JEV_HARNESS_EVOLUTION_LOG.json`
- TypeSafe System One API: https://docs.typesafe.ai/api.md

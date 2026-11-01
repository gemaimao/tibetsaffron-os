/**
 * JEV 红线哨兵真机探测 / 单句裁决 CLI (Live Probe)
 * 用例来源：Core/Knowledge/V2_3_CLAIM_CONTROL_GOVERNANCE.md (Rule CC-02)
 *          Core/Evidence/TIANWANG_11_TESTING_REPORTS_MASTER_COMPENDIUM.md (引用规范)
 *          2026-09-26 微信桥接问答中的人工审查案例
 *
 * 用法：
 *   node tests/jev-redline-probe.mjs              → 运行 4 例黄金回归（2 红 2 绿）
 *   node tests/jev-redline-probe.mjs "任意话术"    → 单句实机裁决（等价设置页 Jev 沙盒完整管线）
 */

// Node ≥22 暴露了不完整的全局 localStorage，会干扰引擎的浏览器环境探测；
// 在动态导入前抹除，使引擎走 Node 分支。
globalThis.localStorage = undefined;

const { jevDecisionEngine } = await import('../src/services/jevDecisionEngine.js');

const CASES = [
  {
    id: 'RED-01',
    source: '2026-09-26 微信桥接问答（人工判定：不能对外发）',
    text: '天旺藏红花因为采用智能控环所以绝对零农残',
    expect_safe: false,
  },
  {
    id: 'RED-02',
    source: 'V2.3 治理规范 Rule CC-02 禁止句式（原文）',
    text: '因为天旺采用了设施控环，所以产品自动达到了 0 农残',
    expect_safe: false,
  },
  {
    id: 'GREEN-01',
    source: 'V2.3 治理规范 Rule CC-02 允许句式（原文）',
    text: '设施控环为投入品管理提供了必要条件；批次产品是否达到 0 农残，严格以第三方报告 No. A26SW02809 为准',
    expect_safe: true,
  },
  {
    id: 'GREEN-02',
    source: '11 报告总集对外引用规范（SMQ 标准表达）',
    text: '经深圳市计量质量检测研究院（SMQ WT10103260183295WT2）高分辨质谱 39 项农残筛查，全部未检出。',
    expect_safe: true,
  },
];

const arg = process.argv[2];

if (arg) {
  // ── 单句实机裁决模式 ──
  const text = arg;
  const asset = { asset_code: 'SANDBOX-LIVE', title: text, summary: text, content: text };
  const brief = { topic: text, editorial_intent: text, core_message: text };

  const scenario = await jevDecisionEngine.routeScenarioIntent(brief);
  const safety = await jevDecisionEngine.evaluateClaimSafety(asset, scenario.value);
  const fit = await jevDecisionEngine.evaluateAssetFit(asset, brief);

  console.log(`JEV 即时裁决（单句模式）| 模型: ${jevDecisionEngine.getConfig().model}\n`);
  console.log(`话术: 「${text}」\n`);
  console.log(`① Choice 场景路由 : ${scenario.value}（置信度 ${(scenario.confidence * 100).toFixed(1)}%）`);
  console.log(`② Noul 安全合规   : ${safety.is_safe ? '放行 ✅' : '拦截 ⛔'} | P(Safe)=${(safety.safe_probability * 100).toFixed(1)}%`);
  safety.violation_reasons.forEach((r, i) => console.log(`   - [${i + 1}] ${r}`));
  console.log(`③ Score 角色指派  : ${fit.role}（${fit.score.toFixed(1)} 分）`);
  console.log(`\n最终结论: ${safety.is_safe ? '✅ 可对外发布' : '⛔ 禁止对外发布（CAP Engine 输出 CLAIM_VIOLATION）'}`);
} else {
  // ── 黄金回归模式 ──
  console.log(`JEV 红线哨兵真机探测 | 模型: ${jevDecisionEngine.getConfig().model}\n`);
  let fail = 0;
  for (const c of CASES) {
    const r = await jevDecisionEngine.evaluateClaimSafety({ asset_code: c.id, content: c.text });
    const pass = r.is_safe === c.expect_safe;
    if (!pass) fail += 1;
    const verdict = r.is_safe ? '放行 ✅' : '拦截 ⛔';
    const mark = pass ? 'PASS' : 'FAIL';
    console.log(`[${c.id}] ${mark} | 引擎判定: ${verdict} | P(Safe)=${(r.safe_probability * 100).toFixed(1)}% | 期望: ${c.expect_safe ? '放行' : '拦截'}`);
    console.log(`       话术: 「${c.text}」`);
    if (r.violation_reasons.length) console.log(`       理由: ${r.violation_reasons.join('；')}`);
    console.log(`       依据: ${c.source}\n`);
  }
  console.log(fail === 0 ? `✅ 全部 ${CASES.length} 例通过：JEV 决策层与治理文档口径一致。` : `❌ ${fail}/${CASES.length} 例失败：JEV 运行时与治理文档口径存在偏差（见上方 FAIL）。`);
}

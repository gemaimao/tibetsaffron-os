// JEV 决策层回归测试 —— 直接调用工具 execute（不经 cordis，无需 DSH 运行时）。
// 运行前提：TYPESAFE_API_KEY 已配置（环境变量或 ~/.dsh/.credentials.yaml）。
// 运行：/opt/homebrew/bin/node test/regression.mjs
//
// Fixtures 来源：Core/Knowledge/JEV_HARNESS_EVOLUTION_LOG.json 中捕获的
// 越权 corner cases（必须 BLOCK）+ 一条有据安全声明（必须 ALLOW）。

import { resolveApiKey } from '../lib/jev-client.js';
import { defineJevTools } from '../lib/tools.js';

const FIXTURES = [
  {
    name: '工艺编造（100% 水培）',
    claim: '天旺藏红花完全不使用泥土，采用 100% 水培营养液管道无土化流水线种植。',
    expect: 'BLOCK',
  },
  {
    name: '因果跃迁（控环 ⇒ 绝对零农残）',
    claim: '因为天旺采用了现代智能设施控环，所以任何批次的产品自动达到了绝对零农残。',
    expect: 'BLOCK',
  },
  {
    name: '产地编造（无人区野生采摘）',
    claim: '天旺藏红花纯天然野生采摘自西藏无人区原始森林，没有任何人工培育过程。',
    expect: 'BLOCK',
  },
  {
    name: '有据安全声明（海关凭证 + 检测报告）',
    claim: '天旺藏红花通过海关出口检疫（凭证编号 CMP-001），批次检测报告（编号 A26SW02809）显示各项指标符合出口标准。',
    context: '天旺农牧为西藏藏红花种植企业，真实持有海关出口检疫凭证（凭证编号 CMP-001）与第三方批次检测报告（报告编号 A26SW02809），两份文件均为已存档原件，编号与声明一致。',
    expect: 'ALLOW',
  },
];

const exec = { signal: undefined };
const tools = new Map(defineJevTools().map((t) => [t.name, t]));
const claimCheck = tools.get('jev_claim_check');

let pass = 0;
let fail = 0;

console.log('=== JEV 决策层回归测试 ===\n');
console.log('API key:', resolveApiKey() ? '已配置 ✓' : '未配置 ✗（请先写入 ~/.dsh/.credentials.yaml）\n');

for (const fixture of FIXTURES) {
  process.stdout.write(`▶ ${fixture.name}\n  `);
  try {
    const result = await claimCheck.execute({ claim: fixture.claim, context: fixture.context }, exec);
    const ok = result.verdict === fixture.expect;
    ok ? pass++ : fail++;
    const top = result.violations.map((v) => `${v.rule}=${v.violationP}`).join(', ') || '无违规信号';
    console.log(
      `${ok ? '✅' : '❌'} 判定 ${result.verdict}（期望 ${fixture.expect}）maxP=${result.maxViolationP} | ${top}`,
    );
  } catch (error) {
    fail++;
    console.log(`💥 执行失败：${error.message}`);
  }
}

console.log(`\n=== 结果：${pass} 通过 / ${fail} 失败 ===`);
process.exit(fail ? 1 : 0);

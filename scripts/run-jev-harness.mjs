#!/usr/bin/env node
/**
 * Brand Content OS (BCOS) - Jev Harness Auto-Evolution Runner
 * 
 * Usage:
 *   node scripts/run-jev-harness.mjs
 *   npm run jev:evolve
 */

import fs from 'node:fs';
import path from 'node:path';
import { jevHarnessInspector } from '../src/services/jevHarnessInspector.js';

async function main() {
  console.log('================================================================');
  console.log('🚀 启动 Jev Harness 知识库问答自进化巡检循环 (TypeSafe Evolution)');
  console.log('================================================================\n');

  const report = await jevHarnessInspector.runEvolutionInspection();

  console.log(`⏱️ 巡检耗时: ${report.duration_ms} ms`);
  console.log(`📊 评测样本总数: ${report.diagnostics.total_samples} (正向: ${report.diagnostics.positives}, 违规负向: ${report.diagnostics.negatives})`);
  console.log(`🎯 模型校准度 (AUC): ${report.calibration.auc}`);
  console.log(`🛡️ 自进化推荐阈值: P(Safe) >= ${report.calibration.optimal_threshold}`);
  console.log(`❌ 误判数 (FP): ${report.diagnostics.false_positives.length} | 漏判数 (FN): ${report.diagnostics.false_negatives.length}`);

  console.log('\n--- 门限扫描矩阵 (Threshold Sweep Matrix) ---');
  console.log('Threshold | TP | FP | FN | TN | Precision | Recall');
  for (const row of report.calibration.rows) {
    console.log(`   ${row.threshold.toFixed(2)}   | ${String(row.tp).padStart(2)} | ${String(row.fp).padStart(2)} | ${String(row.fn).padStart(2)} | ${String(row.tn).padStart(2)} |   ${(row.precision * 100).toFixed(1)}%   |  ${(row.recall * 100).toFixed(1)}%`);
  }

  if (report.evolution_log) {
    console.log('\n💡 [自进化触发] 知识库自适应校准更新：');
    console.log(`- 进化代次: ${report.evolution_log.version}`);
    console.log(`- 阈值演进: ${report.evolution_log.old_threshold} -> ${report.evolution_log.evolved_threshold}`);
    
    // Write evolution log to Core/Knowledge
    const logPath = path.join(process.cwd(), 'Core', 'Knowledge', 'JEV_HARNESS_EVOLUTION_LOG.json');
    let history = [];
    if (fs.existsSync(logPath)) {
      try {
        history = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      } catch (e) {}
    }
    history.unshift(report.evolution_log);
    fs.writeFileSync(logPath, JSON.stringify(history, null, 2), 'utf8');
    console.log(`✅ 已持久化进化日志至: Core/Knowledge/JEV_HARNESS_EVOLUTION_LOG.json`);
  }

  console.log('\n================================================================');
  console.log('✨ Jev Harness 知识库问答自进化巡检完成！决策层已吸收最新校准经验');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Harness run failed:', err);
  process.exit(1);
});

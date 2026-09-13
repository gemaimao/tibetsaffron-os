import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DB_PATH = path.resolve(rootDir, 'Core/Knowledge/db.json');
const BUNDLE_DIR = path.resolve(rootDir, 'Release/NotebookLM_Import_Bundle');
const PUBLIC_DIR = path.resolve(rootDir, 'public');

export function syncNotebookLMBundle() {
  if (!fs.existsSync(BUNDLE_DIR)) fs.mkdirSync(BUNDLE_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  let db = { assets: [] };
  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (e) {}
  }

  // P0 审计安全修复：采用“已批准 + 允许公开”白名单，Draft/Review/Forbidden 断言绝不外流
  const assets = (db.assets || []).filter(a =>
    a.status === 'Published' &&
    a.claim_control !== 'FORBIDDEN_ASSERTION' &&
    (!a.claim_control?.claim_level || a.claim_control.claim_level !== 'FORBIDDEN_ASSERTION')
  );

  // 1. Generate consolidated master bundle (Single-source of truth)
  let masterDoc = `# 天旺藏红花 官方全量 SSOT 知识总库 (Google NotebookLM Master Source)\n\n`;
  masterDoc += `**系统版本**: Brand Content OS v14.0 (V2.4 Atomic High-Granularity)\n`;
  masterDoc += `**更新时间**: ${new Date().toISOString()}\n`;
  masterDoc += `**使用说明**: 该文件为天旺藏红花唯一权威可信源 (Single Source of Truth, SSOT)，汇总全部高颗粒度凭证、农艺参数、商业合作与科学机理。\n\n---\n\n`;

  assets.forEach((asset, idx) => {
    masterDoc += `## [${idx + 1}] ${asset.asset_code} — ${asset.title}\n`;
    masterDoc += `- **模块**: ${asset.module_id || 'KNO'}\n`;
    masterDoc += `- **版本**: ${asset.version || 'v2.0'} | **状态**: ${asset.status || 'Published'}\n`;
    if (asset.ownership) masterDoc += `- **权属**: ${asset.ownership} | **时态**: ${asset.temporal || 'CURRENT'} | **声称等级**: ${asset.claim_control || 'CONFIRMED_FACT'}\n`;
    if (asset.quote) masterDoc += `- **金句/核心声明**: > *“${asset.quote}”*\n`;
    if (asset.trigger_questions && asset.trigger_questions.length > 0) {
      masterDoc += `- **解答的触发问题**:\n`;
      asset.trigger_questions.forEach(q => masterDoc += `  - ${q}\n`);
    }
    masterDoc += `\n### 正文与深度事实数据\n${asset.content}\n\n---\n\n`;
  });

  const masterPath = path.resolve(BUNDLE_DIR, 'ALL_TIANWANG_SSOT_MASTER_BUNDLE.md');
  fs.writeFileSync(masterPath, masterDoc, 'utf-8');

  // Also write to public/notebooklm.md for live URL source import
  const publicPath = path.resolve(PUBLIC_DIR, 'notebooklm.md');
  fs.writeFileSync(publicPath, masterDoc, 'utf-8');

  console.log(`✅ [NotebookLM Auto-Sync] Successfully synchronized ${assets.length} assets to NotebookLM Bundle.`);
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncNotebookLMBundle();
}

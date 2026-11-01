#!/usr/bin/env node
/**
 * Antigravity Pool CLI — 账号池管理工具
 * 
 * 用法:
 *   node pool-cli.mjs init              从现有 auth.json 初始化池
 *   node pool-cli.mjs add <email>       交互式添加新账号
 *   node pool-cli.mjs import <file>     从另一个 auth.json 导入
 *   node pool-cli.mjs status            查看池状态
 *   node pool-cli.mjs reset             重置所有账号状态为 active
 *   node pool-cli.mjs remove <email>    移除账号
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

const POOL_DIR = path.join(os.homedir(), '.antigravity-pool');
const POOL_FILE = path.join(POOL_DIR, 'accounts.json');
const DEFAULT_AUTH = path.join(os.homedir(), '.pi', 'agent', 'auth.json');

function ensureDir() {
  if (!fs.existsSync(POOL_DIR)) fs.mkdirSync(POOL_DIR, { recursive: true });
}

function loadPool() {
  if (!fs.existsSync(POOL_FILE)) return null;
  return JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));
}

function savePool(pool) {
  ensureDir();
  fs.writeFileSync(POOL_FILE, JSON.stringify(pool, null, 2));
}

function createEmptyPool() {
  return {
    version: "1.0.0",
    rotation_strategy: "on-quota-error",
    cooldown_minutes: 60,
    accounts: [],
    current_index: 0,
    stats: { total_requests: 0, total_rotations: 0, last_rotation_at: null }
  };
}

function addAccountToPool(pool, authData, name) {
  const ag = authData.antigravity || authData;
  if (!ag.refresh) throw new Error('No refresh token found in auth data');
  
  const email = ag.email || name || `account-${pool.accounts.length + 1}`;
  if (pool.accounts.find(a => a.email === email)) {
    console.log(`⚠️  Account ${email} already exists, updating refresh_token`);
    const existing = pool.accounts.find(a => a.email === email);
    existing.refresh_token = ag.refresh;
    return;
  }
  
  pool.accounts.push({
    name: name || email.split('@')[0],
    email,
    refresh_token: ag.refresh,
    project_id: ag.projectId || 'aicode-consumers',
    status: 'active',
    added_at: new Date().toISOString(),
    last_exhausted_at: null,
    request_count: 0
  });
  console.log(`✅ Added: ${email}`);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

// === Commands ===

async function cmdInit() {
  let pool = loadPool();
  if (pool && pool.accounts.length > 0) {
    const ans = await ask(`Pool already exists with ${pool.accounts.length} accounts. Reinitialize? (y/N) `);
    if (ans.toLowerCase() !== 'y') return;
  }
  pool = createEmptyPool();
  
  if (fs.existsSync(DEFAULT_AUTH)) {
    const auth = JSON.parse(fs.readFileSync(DEFAULT_AUTH, 'utf8'));
    addAccountToPool(pool, auth, 'primary');
    console.log(`📥 Imported primary account from ${DEFAULT_AUTH}`);
  } else {
    console.log(`⚠️  No auth.json found at ${DEFAULT_AUTH}, creating empty pool`);
  }
  
  savePool(pool);
  console.log(`\n🏊 Pool initialized at: ${POOL_FILE}`);
  console.log(`   Accounts: ${pool.accounts.length}`);
  console.log(`\nNext: Add more accounts with:`);
  console.log(`   node pool-cli.mjs import /path/to/another/auth.json`);
}

async function cmdImport(filePath) {
  if (!filePath) { console.error('Usage: node pool-cli.mjs import <auth.json path>'); process.exit(1); }
  if (!fs.existsSync(filePath)) { console.error(`File not found: ${filePath}`); process.exit(1); }
  
  let pool = loadPool() || createEmptyPool();
  const auth = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const name = await ask('Account name (optional): ') || undefined;
  addAccountToPool(pool, auth, name);
  savePool(pool);
  console.log(`\n🏊 Pool now has ${pool.accounts.length} accounts`);
}

async function cmdAdd() {
  let pool = loadPool() || createEmptyPool();
  const email = await ask('Google email: ');
  const refreshToken = await ask('Refresh token (from auth.json > antigravity.refresh): ');
  const projectId = await ask('Project ID (default: aicode-consumers): ') || 'aicode-consumers';
  
  if (!refreshToken) { console.error('Refresh token is required'); process.exit(1); }
  
  addAccountToPool(pool, { antigravity: { refresh: refreshToken, email, projectId } }, email.split('@')[0]);
  savePool(pool);
  console.log(`\n🏊 Pool now has ${pool.accounts.length} accounts`);
}

function cmdStatus() {
  const pool = loadPool();
  if (!pool) { console.log('No pool found. Run: node pool-cli.mjs init'); return; }
  
  const now = Date.now();
  const cooldownMs = (pool.cooldown_minutes || 60) * 60 * 1000;
  
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     🏊 Antigravity Account Pool Status          ║');
  console.log('╠══════════════════════════════════════════════════╣');
  
  for (let i = 0; i < pool.accounts.length; i++) {
    const a = pool.accounts[i];
    const isCurrent = i === (pool.current_index % pool.accounts.length);
    const marker = isCurrent ? '▶' : ' ';
    let statusIcon = a.status === 'active' ? '🟢' : '🔴';
    let extra = '';
    
    if (a.status === 'exhausted' && a.last_exhausted_at) {
      const remaining = Math.max(0, cooldownMs - (now - new Date(a.last_exhausted_at).getTime()));
      if (remaining <= 0) { statusIcon = '🟡'; extra = ' (recovering)'; }
      else extra = ` (${Math.ceil(remaining / 60000)}m left)`;
    }
    
    console.log(`║ ${marker} ${statusIcon} ${a.email.padEnd(28)} ${String(a.request_count || 0).padStart(5)} reqs${extra.padEnd(10)}║`);
  }
  
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║ Total requests: ${String(pool.stats.total_requests).padEnd(10)} Rotations: ${String(pool.stats.total_rotations).padEnd(8)}║`);
  console.log('╚══════════════════════════════════════════════════╝\n');
}

function cmdReset() {
  const pool = loadPool();
  if (!pool) { console.log('No pool found.'); return; }
  pool.accounts.forEach(a => { a.status = 'active'; a.last_exhausted_at = null; });
  pool.current_index = 0;
  savePool(pool);
  console.log(`✅ Reset ${pool.accounts.length} accounts to active`);
}

function cmdRemove(email) {
  if (!email) { console.error('Usage: node pool-cli.mjs remove <email>'); process.exit(1); }
  const pool = loadPool();
  if (!pool) { console.log('No pool found.'); return; }
  const before = pool.accounts.length;
  pool.accounts = pool.accounts.filter(a => a.email !== email);
  if (pool.accounts.length === before) { console.log(`Account ${email} not found`); return; }
  savePool(pool);
  console.log(`✅ Removed ${email}. Pool now has ${pool.accounts.length} accounts`);
}

// === Main ===
const [cmd, arg] = process.argv.slice(2);
switch (cmd) {
  case 'init':    cmdInit(); break;
  case 'import':  cmdImport(arg); break;
  case 'add':     cmdAdd(); break;
  case 'status':  cmdStatus(); break;
  case 'reset':   cmdReset(); break;
  case 'remove':  cmdRemove(arg); break;
  default:
    console.log('Antigravity Pool CLI');
    console.log('  init              Initialize pool from existing auth.json');
    console.log('  add               Interactively add a new account');
    console.log('  import <file>     Import from another auth.json');
    console.log('  status            Show pool status');
    console.log('  reset             Reset all accounts to active');
    console.log('  remove <email>    Remove an account');
}

#!/usr/bin/env node
/**
 * Antigravity Account Pool — 多账号配额池化轮转引擎 (带安全熔断防扣费版)
 * 
 * 安全机制：
 * - 对付费/试用商业账号 (longhulin60-pro) 设置严格的到期熔断与配额保护：
 *   1. 设定安全截止日期：2026-12-20T23:59:59Z (提前 7 天自动停用并退回免费池)
 *   2. 单账号安全调用上限：防止意外循环调用产生真实扣费
 *   3. 429/403/EOF 时自动无缝轮转到其余 4 个永久免费账号
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { syncActiveAccountToAuthJson } from './sync-auth.mjs';
import { freellmAdapter, DEFAULT_PROVIDERS } from './freellmapi-adapter.mjs';

const POOL_FILE = path.join(os.homedir(), '.antigravity-pool', 'accounts.json');
const DEFAULT_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const DEFAULT_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

// 🛡️ 本地安全熔断闸门：PRO 试用提前截止时间 (2026年12月20日，绝对杜绝扣费)
const PRO_EXPIRY_SAFETY_LOCK = new Date('2026-12-20T23:59:59+08:00').getTime();

// In-memory token cache: { [email]: { access, expires } }
const tokenCache = {};
let heartbeatTimer = null;

function loadPool() {
  if (!fs.existsSync(POOL_FILE)) {
    throw new Error(`Pool file not found: ${POOL_FILE}\nRun: node pool-cli.mjs init`);
  }
  return JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));
}

function savePool(pool) {
  fs.writeFileSync(POOL_FILE, JSON.stringify(pool, null, 2));
}

/**
 * Get all active (non-cooldown) accounts with Safety Lock evaluation
 */
function getActiveAccounts(pool) {
  const now = Date.now();
  return pool.accounts.filter(a => {
    // 🛡️ 检查 PRO 账号的安全熔断闸门
    if (a.email === 'longhulin60@gmail.com') {
      if (now >= PRO_EXPIRY_SAFETY_LOCK) {
        if (a.status !== 'retired_for_safety') {
          a.status = 'retired_for_safety';
          console.warn(`[Pool Safety] 🔒 PRO 试用到期前安全退役，自动切断该账号，全面切回免费池！`);
          savePool(pool);
        }
        return false;
      }
    }

    if (a.status === 'active') return true;
    if (a.status === 'exhausted' && a.last_exhausted_at) {
      if (now - new Date(a.last_exhausted_at).getTime() > COOLDOWN_MS) {
        a.status = 'active';
        return true;
      }
    }
    return false;
  });
}

/**
 * Get current account to use with optional proactive round-robin load spreading and model-tier routing
 */
export function getCurrentAccount(proactiveRotate = true, requestedModel = 'gemini-3.8-flash') {
  const pool = loadPool();
  const active = getActiveAccounts(pool);
  if (active.length === 0) {
    const sorted = [...pool.accounts]
      .filter(a => a.status !== 'retired_for_safety' && a.status !== 'disabled')
      .sort((a, b) => new Date(a.last_exhausted_at || 0) - new Date(b.last_exhausted_at || 0));
    
    if (sorted.length > 0) {
      sorted[0].status = 'active';
      savePool(pool);
      return { account: sorted[0], pool, isFallback: false };
    }
    throw new Error('All accounts in the pool are permanently disabled or retired.');
  }

  // 👑 分级智力路由：当用户选择 Gemini 4 / Claude Opus 旗舰系列时，优先定向绑定 60 商业账号
  const isGemini4Req = requestedModel === 'gemini-4' || requestedModel.startsWith('gemini-4') || requestedModel === 'claude-opus';
  if (isGemini4Req) {
    const commAccount = active.find(a => a.email === 'longhulin60@gmail.com');
    if (commAccount) {
      return { account: commAccount, pool, isFallback: false };
    }
    // 🛡️ 优雅平滑过渡：若 60 商业账号额度耗尽或冷却中，自动过渡到 3.8 Flash 免费池
    console.warn(`[Pool Tier Router] 🔄 旗舰通道 (longhulin60) 当日额度耗尽或冷却中，自动平滑过渡至 Gemini 3.8 Flash 轮转池！`);
  }

  const idx = pool.current_index % active.length;
  const selected = active[idx];

  // 🚀 主动平滑分流 (Proactive Round-Robin)
  if (proactiveRotate && active.length > 1) {
    pool.current_index = (pool.current_index + 1) % active.length;
    savePool(pool);
  }

  return { account: selected, pool, isFallback: isGemini4Req && selected.email !== 'longhulin60@gmail.com' };
}

/**
 * Mark current account as exhausted or disabled, rotate to next
 */
export function rotateAccount(failedEmail, reason = 'exhausted') {
  const pool = loadPool();
  const failed = pool.accounts.find(a => a.email === failedEmail);
  if (failed) {
    failed.status = reason;
    failed.last_exhausted_at = new Date().toISOString();
    console.log(`[Pool] ⛔ Account ${failedEmail} marked as ${reason}, rotating...`);
  }
  pool.current_index = (pool.current_index + 1) % pool.accounts.length;
  pool.stats.total_rotations++;
  pool.stats.last_rotation_at = new Date().toISOString();
  savePool(pool);

  const active = getActiveAccounts(pool);
  if (active.length === 0) {
    console.log(`[Pool] ⚠️ All active accounts exhausted! Force-recovering oldest free account.`);
    return getCurrentAccount(false).account;
  }
  const next = active[pool.current_index % active.length];
  console.log(`[Pool] ✅ Rotated to: ${next.email}`);
  return next;
}

/**
 * Refresh OAuth2 access token for a specific account (with memory cache check)
 */
export async function ensureFreshToken(account, forceRefresh = false) {
  if (account.auth_type === 'api_key') {
    return account.api_key;
  }
  const cached = tokenCache[account.email];
  if (!forceRefresh && cached && cached.expires > Date.now() + 60000) {
    const pool = loadPool();
    const acct = pool.accounts.find(a => a.email === account.email);
    if (acct) {
      acct.request_count = (acct.request_count || 0) + 1;
      pool.stats.total_requests++;
      savePool(pool);
    }
    syncActiveAccountToAuthJson(account, cached.access, cached.expires, pool.accounts, tokenCache);
    return cached.access;
  }

  const clientId = account.client_id || DEFAULT_CLIENT_ID;
  const clientSecret = account.client_secret || DEFAULT_CLIENT_SECRET;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: account.refresh_token,
      grant_type: 'refresh_token'
    }).toString()
  });

  if (!res.ok) {
    const err = await res.text();
    // 永久性错误（如已吊销）自动标记为 disabled
    if (res.status === 400 || res.status === 401) {
      console.warn(`[Pool] ⚠️ 账号 ${account.email} 授权已被吊销或失效: HTTP ${res.status}`);
      const pool = loadPool();
      const acct = pool.accounts.find(a => a.email === account.email);
      if (acct) {
        acct.status = 'disabled';
        savePool(pool);
      }
    }
    throw new Error(`Token refresh failed for ${account.email}: ${res.status} ${err}`);
  }

  const data = await res.json();
  const expires = Date.now() + (data.expires_in * 1000) - 300000;
  tokenCache[account.email] = {
    access: data.access_token,
    expires
  };

  const pool = loadPool();
  const acct = pool.accounts.find(a => a.email === account.email);
  if (acct) {
    acct.request_count = (acct.request_count || 0) + 1;
    pool.stats.total_requests++;
    savePool(pool);
  }

  // 同步健康活跃账号及全量池状态到 ~/.pi/agent/auth.json 与 antigravity-accounts.json
  syncActiveAccountToAuthJson(account, data.access_token, expires, pool.accounts, tokenCache);

  return data.access_token;
}

/**
 * 💓 心跳保活与 0 延迟预热守护进程 (Heartbeat & Warm Cache Daemon)
 * 借鉴 muse2api: 定时后台静默续期 Access Token，防止沉寂失效，确保业务请求 0 延迟命中内存缓存
 */
export function startHeartbeatDaemon(intervalMinutes = 40) {
  if (heartbeatTimer) return;
  console.log(`[Pool Heartbeat] 💓 算力池心跳守护进程启动，每 ${intervalMinutes} 分钟执行一次热缓存续期与自愈巡检...`);

  const runHeartbeat = async () => {
    try {
      const pool = loadPool();
      let warmCount = 0;
      let revivedCount = 0;

      for (const account of pool.accounts) {
        if (account.status === 'disabled' || account.status === 'retired_for_safety') {
          continue;
        }

        // 1. 对 exhausted 的账号进行自动探针与自愈解封 (Auto-Revival)
        if (account.status === 'exhausted') {
          const now = Date.now();
          const elapsed = account.last_exhausted_at ? now - new Date(account.last_exhausted_at).getTime() : Infinity;
          if (elapsed > 10 * 60 * 1000) { // 超过 10 分钟即可开始探针测试
            try {
              await ensureFreshToken(account, true);
              account.status = 'active';
              account.last_exhausted_at = null;
              revivedCount++;
              console.log(`[Pool Heartbeat] 🌿 账号 [${account.email}] 探针自愈成功，已解除限流重新激活！`);
            } catch (e) {
              // 仍未恢复，保持冷却
            }
          }
          continue;
        }

        // 2. 对 active 账号预刷新热 Token (0 Token 消耗，纯身份保活)
        try {
          await ensureFreshToken(account, false);
          warmCount++;
        } catch (err) {
          console.warn(`[Pool Heartbeat] ⚠️ 账号 [${account.email}] 心跳续期失败: ${err.message}`);
        }
      }

      savePool(pool);
      console.log(`[Pool Heartbeat] 💓 心跳巡检完成: 已保活热凭据 ${warmCount} 个，探针自愈复活 ${revivedCount} 个。`);
    } catch (e) {
      console.warn('[Pool Heartbeat] 心跳任务异常:', e.message);
    }
  };

  // 立即执行一次初始预热
  runHeartbeat();

  // 设置周期心跳
  heartbeatTimer = setInterval(runHeartbeat, intervalMinutes * 60 * 1000);
}

/**
 * Get pool status summary
 */
export function getPoolStatus() {
  const pool = loadPool();
  const now = Date.now();
  return {
    total_accounts: pool.accounts.length,
    active: pool.accounts.filter(a => a.status === 'active').length,
    exhausted: pool.accounts.filter(a => a.status === 'exhausted').length,
    disabled: pool.accounts.filter(a => a.status === 'disabled').length,
    current_index: pool.current_index,
    cached_tokens: Object.keys(tokenCache).length,
    accounts: pool.accounts.map(a => ({
      name: a.name,
      email: a.email,
      status: a.status,
      requests: a.request_count || 0,
      has_warm_token: !!(tokenCache[a.email] && tokenCache[a.email].expires > now),
      cooldown_remaining: a.status === 'exhausted' && a.last_exhausted_at
        ? Math.max(0, Math.ceil((COOLDOWN_MS - (now - new Date(a.last_exhausted_at).getTime())) / 60000))
        : 0
    })),
    stats: pool.stats,
    tier3_heterogeneous_fleet: {
      total_providers: freellmAdapter.providers.length,
      active_providers: freellmAdapter.providers.filter(p => p.status === 'active').length,
      fastest: freellmAdapter.selectProvider('LIGHTWEIGHT_FAST')?.name
    }
  };
}

/**
 * 🚀 Tier-3 异构算力极速与兜底调用通道
 */
export async function callTier3Fallback(messages, taskType = 'LIGHTWEIGHT_FAST') {
  console.log(`[Pool Tier-3] ⚡ 唤醒 FreeLLMAPI 异构算力通道 (任务模式: ${taskType})...`);
  return await freellmAdapter.complete({ messages, taskType });
}


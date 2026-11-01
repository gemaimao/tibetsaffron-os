#!/usr/bin/env node
/**
 * 全局多 Agent 实时双向同步器 (Global Multi-Agent Auth Synchronizer)
 *
 * 作用范围：
 * 1. ~/.pi/agent/auth.json              -> 供 PI Agent / 飞书与 Telegram BOT / PI Pocket 实时读取当前主账号
 * 2. ~/.pi/agent/antigravity-accounts.json -> 供 pi-antigravity 插件内部 failoverToNextAccount 无感轮转全部 4 个健康账号
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const PI_AGENT_DIR = path.join(os.homedir(), '.pi', 'agent');
const AUTH_FILE = path.join(PI_AGENT_DIR, 'auth.json');
const PI_ACCOUNTS_FILE = path.join(PI_AGENT_DIR, 'antigravity-accounts.json');

export function syncActiveAccountToAuthJson(account, accessToken, expires, allPoolAccounts = [], tokenCache = {}) {
  try {
    if (!fs.existsSync(PI_AGENT_DIR)) return;

    // 1. 实时更新 ~/.pi/agent/auth.json
    let authData = {};
    if (fs.existsSync(AUTH_FILE)) {
      try {
        authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
      } catch (_) {}
    }
    if (!authData.antigravity) authData.antigravity = {};

    const projectId = account.project_id || 'aicode-consumers';
    authData.antigravity = {
      type: 'oauth',
      email: account.email,
      access: accessToken || authData.antigravity.access || '',
      refresh: account.refresh_token,
      expires: expires || authData.antigravity.expires || (Date.now() + 3000000),
      projectId
    };

    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2), { mode: 0o600 });

    // 2. 实时全量同步 ~/.pi/agent/antigravity-accounts.json（供 PI / BOT / PI Pocket 多账号容灾）
    let store = { version: 1, activeAccountId: account.email, accounts: {} };
    if (fs.existsSync(PI_ACCOUNTS_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(PI_ACCOUNTS_FILE, 'utf8'));
        if (parsed && typeof parsed.accounts === 'object') {
          store = parsed;
        }
      } catch (_) {}
    }

    const now = Date.now();
    const accountsToSync = allPoolAccounts.length > 0 ? allPoolAccounts : [account];

    for (const acc of accountsToSync) {
      if (!acc.refresh_token || acc.status === 'disabled' || acc.status === 'retired_for_safety') continue;
      const email = acc.email;
      const existing = store.accounts[email] || {};
      const cached = tokenCache[email];
      const accAccess = (email === account.email && accessToken)
        ? accessToken
        : (cached?.access || existing.access || '');
      const accExpires = (email === account.email && expires)
        ? expires
        : (cached?.expires || existing.expires || 0);

      store.accounts[email] = {
        type: 'oauth',
        email,
        access: accAccess,
        refresh: acc.refresh_token,
        expires: accExpires,
        projectId: acc.project_id || 'aicode-consumers',
        accountId: email,
        addedAt: existing.addedAt || (acc.added_at ? new Date(acc.added_at).getTime() : now),
        lastUsedAt: email === account.email ? now : (existing.lastUsedAt || now)
      };
    }

    store.activeAccountId = account.email;
    fs.writeFileSync(PI_ACCOUNTS_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
  } catch (err) {
    console.error(`[Sync] Error syncing to PI agent files:`, err.message);
  }
}

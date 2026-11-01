#!/usr/bin/env node
/**
 * Antigravity 一键账号授权录入工具
 * 启动本地临时 HTTP 监听，生成 Google OAuth 授权链接，
 * 用户在浏览器授权后自动捕获 refresh_token 并写入 accounts.json 账号池。
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const POOL_DIR = path.join(os.homedir(), '.antigravity-pool');
const POOL_FILE = path.join(POOL_DIR, 'accounts.json');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Antigravity 专用的 OAuth Scope
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/cloud-platform',
  'openid'
].join(' ');

const PORT = 45678;
const REDIRECT_URI = `http://localhost:${PORT}/oauth/callback`;

function ensurePool() {
  if (!fs.existsSync(POOL_DIR)) fs.mkdirSync(POOL_DIR, { recursive: true });
  if (!fs.existsSync(POOL_FILE)) {
    fs.writeFileSync(POOL_FILE, JSON.stringify({
      version: "1.0.0",
      rotation_strategy: "on-quota-error",
      cooldown_minutes: 60,
      accounts: [],
      current_index: 0,
      stats: { total_requests: 0, total_rotations: 0, last_rotation_at: null }
    }, null, 2));
  }
}

function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/oauth/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ 授权失败</h2><p>${error}</p>`);
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ 缺少授权码</h2>`);
      return;
    }

    try {
      // 用 code 换取 refresh_token & access_token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI
        }).toString()
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.refresh_token) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h2>⚠️ 未获取到 Refresh Token</h2><p>请确保在 Google 授权页面勾选了所有权限，或之前已授权过。建议在授权页面点击“使用其他账号”。</p>`);
        return;
      }

      // 获取该用户的邮箱信息
      let email = 'unknown-account';
      try {
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        const userData = await userRes.json();
        if (userData.email) email = userData.email;
      } catch (e) {}

      // 写入账号池
      ensurePool();
      const pool = JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));
      const existingIdx = pool.accounts.findIndex(a => a.email === email);

      if (existingIdx >= 0) {
        pool.accounts[existingIdx].refresh_token = tokenData.refresh_token;
        pool.accounts[existingIdx].status = 'active';
        pool.accounts[existingIdx].last_exhausted_at = null;
        console.log(`\n[Pool] 🔄 已更新现有账号: ${email}`);
      } else {
        pool.accounts.push({
          name: email.split('@')[0],
          email,
          refresh_token: tokenData.refresh_token,
          project_id: 'aicode-consumers',
          status: 'active',
          added_at: new Date().toISOString(),
          last_exhausted_at: null,
          request_count: 0
        });
        console.log(`\n[Pool] 🎉 成功将新账号加入池子: ${email}`);
      }

      fs.writeFileSync(POOL_FILE, JSON.stringify(pool, null, 2));

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h2 style="color: #0f9d58;">🎉 授权成功！</h2>
          <p>账号 <b>${email}</b> 已成功录入 Antigravity 账号池！</p>
          <p>当前池中总账号数：<b>${pool.accounts.length}</b> 个</p>
          <p style="color: #666;">你可以关闭此页面，返回终端查看或继续添加下一个账号。</p>
        </div>
      `);

      console.log(`\n当前池中账号总数: ${pool.accounts.length} 个。按 Ctrl+C 可退出，或保持运行继续授权下一个账号。`);

    } catch (err) {
      console.error('Exchange error:', err);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ 服务器处理异常: ${err.message}</h2>`);
    }
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const authUrl = getAuthUrl();
  console.log('\n============================================================');
  console.log('      🏊 Antigravity 账号一键授权登录助手');
  console.log('============================================================\n');
  console.log('请在浏览器中打开下方链接，登录并授权你的另一个 Google 账号：\n');
  console.log(authUrl);
  console.log('\n============================================================');
  console.log('授权完成后系统会自动捕获并写入 accounts.json，无需手动复制 Token。\n');
});

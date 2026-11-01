import { cpSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const pluginDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(pluginDir, '../..');
const home = homedir();
const installedDir = join(home, 'plugins', 'jev-codex');
const marketFile = join(home, '.agents', 'plugins', 'marketplace.json');
const skillRoot = join(home, '.codex', 'skills', '.system', 'plugin-creator');
const scaffold = join(skillRoot, 'scripts', 'create_basic_plugin.py');

if (existsSync(installedDir)) {
  console.error(`个人插件目录已存在，停止覆盖：${installedDir}`);
  process.exit(2);
}
if (existsSync(marketFile)) {
  console.error(`个人 marketplace 已存在。请按 plugin-creator 更新流程合并条目：${marketFile}`);
  process.exit(2);
}

const created = spawnSync('python3', [
  scaffold,
  'jev-codex',
  '--with-mcp',
  '--with-skills',
  '--with-hooks',
  '--with-scripts',
  '--with-marketplace',
], { cwd: repoRoot, stdio: 'inherit' });
if (created.status !== 0) process.exit(created.status || 1);

cpSync(pluginDir, installedDir, { recursive: true, force: true });
console.log(`插件源码已安装：${installedDir}`);

const cliInstall = spawnSync('codex', ['plugin', 'add', 'jev-codex@personal', '--json'], {
  cwd: repoRoot,
  stdio: 'inherit',
});
if (cliInstall.status !== 0) {
  console.error('CLI 自动安装失败；个人 marketplace 和插件文件已就位，可在 Codex 插件目录手动安装。');
}

const storeKey = spawnSync('swift', [join(pluginDir, 'scripts', 'store-typesafe-key.swift')], {
  cwd: repoRoot,
  stdio: 'inherit',
});
if (storeKey.status !== 0) {
  console.error('未能从剪贴板保存钥匙串密钥；本地 Gemma 路由仍可使用，Jev 远程升级暂不可用。');
}

console.log(`个人 marketplace：${marketFile}`);

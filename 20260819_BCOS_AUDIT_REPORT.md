# Brand Content OS 审计报告

- 审计日期：2026-08-19
- 审计方式：静态分析 + 运行时验证（构建、dev 服务器、API 探测、密钥扫描、git 历史）
- 项目位置：/Users/longhl/.gemini/antigravity/scratch/brand-content-os
- 技术栈：Vite 5 + 原生 JS（无框架）+ 内嵌 Node API 中间件 + Cloudflare Pages Functions + Gemini AI

---

## 〇、项目本质：四大模块集成（据用户确认）

| 模块 | 载体 | 说明 |
|------|------|------|
| 1. 官网 | `site/`（index + brand/ + cognition/ + products/ + ai/copilot） | 天旺藏红花品牌门户，含 AI 知识大脑 |
| 2. 品牌 & 认知知识库 OS | `/os` 控制台（`index.html` + `src/` 七视图） | 资产/模块/关系图谱/发布管理，SSOT 于 `Core/Knowledge/db.json` |
| 3. 终端采集系统 | `mobile.html` + `/api/upload` + `/api/assets` POST | 移动端极速采集建库，双写 DB + Inbox Markdown |
| 4. 通稿生成功能 | `pressReleaseModal.js` + `exportEngine.js` | V2.2 场景矩阵/就绪状态机/主张-证据绑定，三输出模式（AUDIT/EDITORIAL/PUBLIC） |

---

## 一、结论摘要

| 维度 | 结论 |
|------|------|
| 构建 | ✅ `npm run build` 成功（1.07s，全站 20+ 页面） |
| dev 服务 | ✅ 端口 3000 启动，所有页面 200，API 正常 |
| 数据层 | ✅ `Core/Knowledge/db.json` SSOT + 磁盘 Markdown 双写正常 |
| 四模块 | ✅ 官网/OS/采集端/通稿生成均可访问、功能链路完整 |
| 安全 | 🔴 **硬编码 Gemini API Key 已公开暴露并入库**；🔴 **/api/media 路径穿越任意文件读取** |
| 工程 | 🟠 整个后端塞在 500 行 vite.config.js 里；自动 git push 循环 |

---

## 二、运行时验证（实测）

| 项目 | 结果 |
|------|------|
| `npm run build` | ✅ 全站构建成功（index/os/mobile/site 各页 + assets） |
| `npm run dev`（端口 3000） | ✅ 启动正常，页面全部 200 |
| `/api/dashboard`、`/api/assets` CRUD | ✅ 正常（7 资产 / 5 模块） |
| 采集链路（mobile → POST /api/assets + /api/upload） | ✅ 路由存在、落盘正常 |
| 通稿生成（pressReleaseModal） | ✅ 组件就绪，V2.2 场景矩阵 + 主张-证据绑定 |
| `/api/chat` | ⚠️ dev 端依赖硬编码密钥 + 模型名 `gemini-3-flash-preview`；失败时自动回退内置范文 |
| Cloudflare `functions/api/chat.js` | ✅ 正确使用 `GEMINI_API_KEY` 环境变量（生产路径无硬编码） |

---

## 三、安全漏洞（按严重度排序）

### 🔴 S-1：硬编码 Gemini API Key——已公开暴露并提交入库（最严重）
- **位置**：`vite.config.js`、`site/index.html`（**公开门户首页，每个访客都能看到**）、`index.html`，共 3 处
- **形式**：字符串数组拼接混淆以绕过密钥扫描：
  ```js
  const GEMINI_DIRECT_KEY = ["AQ.Ab8RN6L0BC6GLIp", "am4EiSxk-2ndOAH9-", "guOTuItuLIrTNUfHTA"].join("");
  ```
- **已入库**：git 历史 2 个提交包含该密钥（`4c89218`、`b01be05`），且随自动 push 已推送远端 `github.com/gemaimao/tibetsaffron-os.git`
- **风险**：访问网站或克隆仓库者均可提取密钥盗用 Google AI 配额（计费风险）；`site/index.html` 是公开页面，等于把钥匙贴在门上
- **处置（必须）**：
  1. 立即在 Google Cloud / AI Studio 控制台**吊销**该密钥并生成新 Key
  2. 运行环境统一改用环境变量（对齐 `functions/api/chat.js` 做法）
  3. 前端代码**永远不要**放置 API Key——`/api/chat` 必须在服务端代理调用
  4. 从 git 历史清除（`git-filter-repo`）或确认仓库私有

### 🔴 S-2：`/api/media/` 路径穿越——任意文件读取（已实测）
- **实测**：`GET /api/media/..%2F..%2Fpackage.json` 返回 **200** 并输出文件内容
- **位置**：`vite.config.js` 中间件 `path.resolve(MEDIA_DIR, decodeURIComponent(filename))` 无目录包含校验
- **风险**：可读取项目内任意文件（Core 知识库、未来若存在 .env 的密钥、系统文件）
- **修复**：`path.resolve` 后校验 `startsWith(MEDIA_DIR + path.sep)`

### 🟠 S-3：自动 git push 循环 + 无鉴权 API
- 每次资产写入自动 `git add . && commit && push origin main`——数据实时推送远端，若仓库公开则知识内容公开；auto-sync 提交噪音多
- dev 服务器 `--host 0.0.0.0` 监听所有网卡，API 全无鉴权，局域网任意设备可读写资产、触发 git push

### 🟠 S-4：生产/开发密钥管理不一致
- Cloudflare 生产路径用环境变量 ✅；dev 中间件路径（vite.config.js）用硬编码 ❌——同一功能两套实现

---

## 四、工程/架构问题

| 级别 | 问题 | 说明 |
|------|------|------|
| 🟠 | **后端整体塞进构建配置** | `vite.config.js` 500 行：DB 读写、git 同步、8 个 API 路由、AI 调用全在构建配置里。应拆为独立 `server.js`（Vite 插件薄壳引用），消除 dev/生产行为分裂（dev 有完整 API，生产仅 Cloudflare Functions 覆盖 /api/chat） |
| 🟠 | 密钥混淆写入公共页面 | 见 S-1 |
| 🟠 | 无测试/CI | 纯手工验证；API 层与通稿生成的"主张-证据绑定"、科学护栏逻辑应有回归测试 |
| ⚪ | 同步 XHR 与 async fetch 双模式并存（api.js） | 建议统一为 async |
| ⚪ | dist/ 未入库 | ✅ 正确 |

---

## 五、整改建议（按优先级）

### P0 — 立即（今天）
1. **吊销并轮换 Gemini Key**（S-1），全项目移除硬编码，统一环境变量
2. 修复 `/api/media/` 路径穿越（S-2），加目录包含校验
3. dev 服务改绑 `127.0.0.1`；确认远端仓库私有性

### P1 — 结构治理
4. API 中间件从 vite.config.js 拆出为独立 `server.js`，vite.config 只留薄插件
5. 自动 git push 改为"仅本地 commit + 手动 push"，或加推送白名单
6. 生产 API 用 Cloudflare Functions 补齐（/api/assets、/api/upload 等），消除 dev/生产分裂

### P2 — 质量
7. 为 API、采集链路、通稿生成（场景矩阵/证据绑定/科学护栏）补测试
8. 统一 fetch 风格
9. 清理 git 历史中的密钥与 auto-sync 噪音

# 藏红花回家官网 · 审计报告

- 审计日期：2026-08-19
- 审计对象：brand-content-os 官网（site/ 门户 + /os 控制台 + 内嵌 Node API）+ 新建的"藏红花回家"首页
- 方式：运行时验证（构建/dev）+ 静态审计（密钥扫描 / 标签配平 / 结构）

---

## 一、可运行性

| 项 | 结果 |
|----|------|
| `npm run build` | ✅ 成功（portal/os/site 全量构建） |
| `npm run dev`（:3000） | ✅ 首页 / 页脚 / API 200 |
| HTML 结构（div/section/figure/svg 配平） | ✅ 全部配平（80/80、10/10、7/7、3/3） |
| 首页脚本（homecoming.js） | ✅ 语法通过，Cesium 开场 + 迷你地球均初始化 |

---

## 二、安全漏洞（按严重度）

### 🔴 S-1：硬编码 Gemini API Key（客户端暴露 + 已入库）
- **位置**：`index.html`（OS 控制台，**任何访客可提取**）、`vite.config.js`（/api/chat）、`site/index.portal.backup.html`
- **形式**：字符串拼接混淆绕过扫描：`["AQ.Ab8RN6L0BC6GLIp", "am4EiSxk-2ndOAH9-", "guOTuItuLIrTNUfHTA"].join("")`
- **风险**：访问 deployed 站点即可提取盗用 Google AI 配额；且随自动 push 已进 git 历史
- **处置**：立即在 Google AI Studio 吊销；改读环境变量；从 git 历史清除

### 🔴 S-2：硬编码 Cesium Ion token（site/js/homecoming.js:31）
- 客户端 token（Cesium 常规用法）但应可配置；已提交源码
- 处置：改 `.env` / 配置注入；Ion 控制台设置 Referrer 白名单

### 🔴 S-3：`/api/media` 路径穿越 · 任意文件读取
- `vite.config.js:159` `path.resolve(MEDIA_DIR, decodeURIComponent(filename))` 无目录包含校验
- 处置：`startsWith(MEDIA_DIR + path.sep)` 校验

### 🟠 S-4：全 API 无鉴权 + CORS `*` + 绑定 0.0.0.0
- `/api/assets` POST/PUT/DELETE、`/api/upload`、`/api/chat` 任意调用；局域网可读写资产、触发 git push
- 处置：本地改绑 127.0.0.1；生产加鉴权

### 🟠 S-5：自动 git push（vite.config.js:102）
- 每次资产写入 `git add . && commit && push origin main` → 数据实时外推 + 密钥入库 + 历史噪音
- 处置：关自动 push 或改本地 commit

---

## 三、工程/性能

| 级别 | 问题 |
|------|------|
| 🟠 | **两个 Cesium 实例**（开场 hero + S2 迷你地球）双渲染循环，内存/性能开销；移动端偏重 |
| 🟡 | `site/assets/藏红花生长周期和机制示意图.jpg` **4.9MB 未用冗余**（已用压缩版 saffron-growth-cycle.jpg） |
| 🟡 | 大文件（cea-design.png 2.9MB）建议压缩；全站图片合计 9.6MB |
| ⚪ | `site/index.portal.backup.html`（旧门户备份）含密钥，不宜入库 |

---

## 四、整改建议（按优先级）

**P0（必须，今天）**
1. 吊销 Gemini Key（S-1）、Cesium token 改配置（S-2）
2. 反混淆：三处硬编码密钥改环境变量；删 `index.portal.backup.html`
3. `/api/media` 加目录校验（S-3）

**P1**
4. dev 改绑 127.0.0.1；API 加一次性鉴权（S-4）
5. 关自动 git push（S-5）；`git-filter-repo` 清理历史密钥
6. 清理 4.9MB 冗余图；压缩大图

**P2**
7. 评估是否保留 S2 迷你 Cesium（性能 vs 效果），或改 SVG 插画
8. 补 server/API 基础测试

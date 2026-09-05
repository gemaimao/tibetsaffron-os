import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Real Server Storage File Path
const DB_PATH = path.resolve(__dirname, 'Core/Knowledge/db.json');
const INBOX_DIR = path.resolve(__dirname, 'Inbox/Documents');
const MEDIA_DIR = path.resolve(__dirname, 'Inbox/Media');

function ensureDirsExist() {
  if (!fs.existsSync(INBOX_DIR)) fs.mkdirSync(INBOX_DIR, { recursive: true });
  if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

  if (!fs.existsSync(DB_PATH)) {
    const initialDb = {
      assets: [
        {
          id: 'asset-kno-sfr-master',
          uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380sfr',
          module_id: 'mod-kno',
          asset_code: 'KNO-SFR-MASTER',
          title: 'SFR-KNO 藏红花深度认知知识库 34 Master 骨架 (v14.0)',
          subtitle: 'Saffron Deep Cognition Skeleton & 9 Master Domains',
          summary: '面向泛兴趣受众与消费者的藏红花深度认知底库。涵盖 9 大 Master 知识族、34 Master 骨架与真假识别专题。',
          content: `# SFR-KNO 藏红花深度认知知识库 (v14.0)\n\n## 9 大 Master 深度认知知识族\n1. **01 本体认知**: 藏红花究竟是什么？\n2. **02 生命与繁育**: 它是怎样活着与延续下一代的？\n3. **03 生产方式**: 它是怎样被生产出来的？\n4. **04 全球产区**: 世界哪里种？为什么不同？\n5. **05 加工与品质**: 它如何从花变成商品？\n6. **06 标准与真假**: 怎么判断它是什么、好不好？\n7. **07 历史文化**: 为什么人类长期重视它？\n8. **08 传统与研究**: 藏红花今天发生了什么？\n9. **09 消费与使用**: 买回来后怎么保存、使用与理解？`,
          quote: '产地证明你是谁，检测证明你是什么。',
          status: 'Published',
          version: 'v14.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tag_ids: ['tag-sfr-kno', 'tag-ssot']
        },
        {
          id: 'asset-dat-evidence-layer',
          uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380dat',
          module_id: 'mod-dat',
          asset_code: 'DAT-EVIDENCE-LAYER',
          title: 'Evidence & Data Layer 双重证据缺口矩阵与 7 级效力层级',
          subtitle: 'Dual Evidence Gap Matrix & 7-Level Proof Hierarchy',
          summary: '建立天旺实测证据 (Tianwang Evidence) 与行业通用证据 (Category Evidence) 双矩阵，支持文案反向抗质疑检索。',
          content: `# Evidence & Data Layer (证据与数据层)\n\n## 7 级证据效力层级 (Proof Hierarchy)\n- **Level 1 政府官方文件**: 拉萨海关检疫证书与出口报关单 (CMP-001)、商标专利证 (CMP-002)\n- **Level 2 第三方实验室数据**: 食药检院 0农残报告 (No. A26SW02809)、HPLC 色价峰图 (SCI-001)\n- **Level 3 长期与动力学实验**: 水温溶出动力学曲线 (SCI-002)、24个月避光稳定性 (SCI-003)\n- **Level 4 企业原始记录**: 姆多村农户务工名册与 30万元工资签收单 (IND-001)\n- **Level 5 现场高清视觉**: 米瑞乡 4K 采摘 RAW 盘视频 (VIS-001)\n- **Level 6 体外研究证据**: DPPH/ABTS 自由基清除 (SCI-004 降级，严禁宣称人体抗衰老)\n- **Level 7 企业应用 SOP**: 星级餐厅 0.05g 克重卡 (APP-001)`,
          quote: '拒绝盲目营销，建立“事实/数据 ➔ 证据链 ➔ 科学解释 ➔ 消费者认知”反向抗质疑链条。',
          status: 'Published',
          version: 'v14.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tag_ids: ['tag-evidence', 'tag-metrics']
        },
        {
          id: 'asset-kno-sfr-gastronomy',
          uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380gas',
          module_id: 'mod-kno',
          asset_code: 'KNO-SFR-GASTRONOMY',
          title: '藏红花美食烹饪化学与林芝五季时令物候饮品体系 (v1.0)',
          subtitle: 'Saffron Gastronomy, Culinary Chemistry & Linzhi 5-Season Drinks',
          summary: '涵盖全球四大经典藏红花料理化学原理、林芝五季物候特调饮品体系与工布在地美食（石锅焖饭/松茸蒸蛋/天麻鱼汤）。',
          content: `# 藏红花美食烹饪化学与林芝五季时令物候体系\n\n## 烹饪化学三大作用机制\n1. **水溶金黄视觉赋色**: Crocin 水溶极佳，赋予金黄鲜艳汤色；\n2. **挥发性香气协同**: Safranal 热力挥发，压制牛羊肉与海鲜腥膻，提供蜂草复合芳香；\n3. **抑腥提鲜与回甘**: Picrocrocin 微苦回甘，作为鲜味协同增效剂 (Umami Enhancer)。`,
          quote: 'Crocin 赋金黄，Safranal 压腥膻，Picrocrocin 提鲜回甘。',
          status: 'Published',
          version: 'v1.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tag_ids: ['tag-sfr-kno', 'tag-ssot']
        }
      ],
      modules: [
        { id: 'mod-com', code: 'COM', name: 'Communication', description: '品牌传播层：核心口号、宣传文案、公关声明与 Pitch points', icon: 'ri-message-3-line' },
        { id: 'mod-kno', code: 'KNO', name: 'Knowledge', description: 'SFR-KNO 藏红花深度认知知识库：9 大 Master 知识族', icon: 'ri-book-open-line' },
        { id: 'mod-vis', code: 'VIS', name: 'Visual', description: '品牌视觉层：色彩规范、4K 现场镜头、包装 Token', icon: 'ri-palette-line' },
        { id: 'mod-dat', code: 'DAT', name: 'Data & Evidence', description: 'Evidence & Data Layer 证据与数据层', icon: 'ri-bar-chart-box-line' },
        { id: 'mod-brd', code: 'BRD', name: 'Brand Behavior', description: '品牌内核与行为层', icon: 'ri-compass-3-line' }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDirsExist();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { assets: [], modules: [] };
  }
}

import { syncNotebookLMBundle } from './scripts/sync-notebooklm.js';

function writeDb(db) {
  ensureDirsExist();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  try {
    syncNotebookLMBundle();
  } catch (err) {
    console.error('NotebookLM sync error:', err);
  }
}

function triggerGitAutoSync(commitMessage) {
  const cwd = path.resolve(__dirname);
  const cmd = `git add . && git commit -m "auto-sync: ${commitMessage}" && git push origin main`;
  exec(cmd, { cwd }, () => {});
}

// Custom Node Backend Plugin for Vite with Binary Media Serving & Base64 Media Upload
function apiServerPlugin() {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      try {
        syncNotebookLMBundle();
      } catch (e) {}
      server.middlewares.use((req, res, next) => {
        // Serve static asset files under site/assets or assets
        if (req.url.includes('/assets/') || req.url.endsWith('.jpg') || req.url.endsWith('.png')) {
          const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
          const assetName = path.basename(cleanUrl);
          const assetPath = path.resolve(__dirname, 'site/assets', assetName);
          if (fs.existsSync(assetPath)) {
            const ext = path.extname(assetPath).toLowerCase();
            const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
            res.setHeader('Content-Type', mimeMap[ext] || 'image/jpeg');
            return fs.createReadStream(assetPath).pipe(res);
          }
        }

        // Serve Portal HTML Subpages under /site/
        if (req.url.startsWith('/site/') && req.url.endsWith('.html')) {
          const cleanUrl = req.url.split('?')[0];
          const subpagePath = path.resolve(__dirname, cleanUrl.replace('/site/', 'site/'));
          if (fs.existsSync(subpagePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return fs.createReadStream(subpagePath).pipe(res);
          }
        }

        // Serve Official Portal Website on Root '/'
        if (req.url === '/' || req.url === '/index.html') {
          const portalPath = path.resolve(__dirname, 'site/index.html');
          if (fs.existsSync(portalPath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return fs.createReadStream(portalPath).pipe(res);
          }
        }

        // Serve Brand Content OS Control Console on '/os'
        if (req.url === '/os' || req.url.startsWith('/os?')) {
          const osPath = path.resolve(__dirname, 'index.html');
          if (fs.existsSync(osPath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return fs.createReadStream(osPath).pipe(res);
          }
        }

        // Serve static media files from Inbox/Media
        if (req.url.startsWith('/api/media/')) {
          const filename = req.url.replace('/api/media/', '').split('?')[0];
          const filePath = path.resolve(MEDIA_DIR, decodeURIComponent(filename));
          // 目录包含校验：防路径穿越读取任意文件
          if (!filePath.startsWith(MEDIA_DIR + path.sep)) {
            res.statusCode = 403;
            return res.end('Forbidden');
          }
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeMap = {
              '.pdf': 'application/pdf',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
              '.mp4': 'video/mp4'
            };
            res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
            return fs.createReadStream(filePath).pipe(res);
          } else {
            res.statusCode = 404;
            return res.end('Media file not found');
          }
        }

        if (!req.url.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const db = readDb();

        if (url.pathname === '/api/dashboard' && req.method === 'GET') {
          const assets = db.assets || [];
          const module_counts = {};
          assets.forEach(a => {
            const mod = db.modules.find(m => m.id === a.module_id);
            const code = mod ? mod.code : 'COM';
            module_counts[code] = (module_counts[code] || 0) + 1;
          });

          res.end(JSON.stringify({
            success: true,
            data: {
              asset_count: assets.length,
              module_count: db.modules.length,
              published_count: assets.filter(a => a.status === 'Published').length,
              draft_count: assets.filter(a => a.status === 'Draft').length,
              module_counts,
              recent_assets: assets.slice(-5).reverse(),
              latest_releases: [
                { id: 'rel-v1.0', version: 'v1.0-Master', name: 'Release v1.0 Saffron OS Master', status: 'Released', description: '全量归档 34 Master 骨架与 7 级证据层' }
              ]
            }
          }));
          return;
        }

        if (url.pathname === '/api/modules' && req.method === 'GET') {
          res.end(JSON.stringify({ success: true, data: db.modules }));
          return;
        }

        if (url.pathname === '/api/assets' && req.method === 'GET') {
          const modCode = url.searchParams.get('module');
          const status = url.searchParams.get('status');
          const keyword = url.searchParams.get('keyword');

          let items = db.assets || [];
          if (modCode) {
            const mod = db.modules.find(m => m.code.toUpperCase() === modCode.toUpperCase());
            if (mod) items = items.filter(a => a.module_id === mod.id);
          }
          if (status) {
            items = items.filter(a => a.status === status);
          }
          if (keyword) {
            const kw = keyword.toLowerCase();
            items = items.filter(a =>
              (a.asset_code && a.asset_code.toLowerCase().includes(kw)) ||
              (a.title && a.title.toLowerCase().includes(kw)) ||
              (a.summary && a.summary.toLowerCase().includes(kw)) ||
              (a.content && a.content.toLowerCase().includes(kw))
            );
          }

          res.end(JSON.stringify({
            success: true,
            data: { items: items.reverse(), total: items.length }
          }));
          return;
        }

        if (url.pathname.startsWith('/api/assets/') && req.method === 'GET') {
          const id = url.pathname.replace('/api/assets/', '');
          const asset = db.assets.find(a => a.id === id);
          if (asset) {
            res.end(JSON.stringify({ success: true, data: asset }));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ success: false, message: 'Not found' }));
          }
          return;
        }

        // Upload Media Binary Base64 / File Endpoint
        if (url.pathname === '/api/upload' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const fileName = payload.filename || `file-${Date.now()}`;
              const fileData = payload.fileData; // base64 string
              const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
              const savePath = path.resolve(MEDIA_DIR, safeName);

              if (fileData) {
                const base64Data = fileData.replace(/^data:.*;base64,/, '');
                fs.writeFileSync(savePath, Buffer.from(base64Data, 'base64'));
              }

              const mediaUrl = `/api/media/${encodeURIComponent(safeName)}`;
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, mediaUrl, fileName: safeName }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: err.message }));
            }
          });
          return;
        }

        if (url.pathname === '/api/assets' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const newId = `asset-${Date.now()}`;
              const mod = db.modules.find(m => m.id === payload.module_id) || db.modules[0];
              const newAsset = {
                id: newId,
                uuid: `uuid-${Date.now()}`,
                module_id: mod.id,
                asset_code: `${mod.code}-${Math.floor(1000 + Math.random() * 9000)}`,
                title: payload.title || '手机移动终端极速采集',
                subtitle: payload.subtitle || 'Mobile Capture',
                summary: payload.summary || (payload.content ? payload.content.slice(0, 100) : '手机终端数据'),
                content: payload.content || '手机端采集的具体内容...',
                quote: payload.quote || '',
                status: payload.status || 'Draft',
                media_url: payload.media_url || null,
                version: 'v1.0',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tag_ids: ['tag-mobile-ingest']
              };

              db.assets.push(newAsset);
              writeDb(db);

              // Save Real Markdown File
              const mdPath = path.resolve(INBOX_DIR, `MOB-${newAsset.asset_code}-${Date.now()}.md`);
              const mdContent = `# ${newAsset.title}\n\n**Asset Code**: ${newAsset.asset_code}\n**Module**: ${mod.code}\n**Captured At**: ${newAsset.created_at}\n\n${newAsset.content}\n`;
              fs.writeFileSync(mdPath, mdContent, 'utf-8');

              triggerGitAutoSync(`Mobile Upload Asset ${newAsset.asset_code}: ${newAsset.title}`);

              res.statusCode = 201;
              res.end(JSON.stringify({ success: true, data: newAsset }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: err.message }));
            }
          });
          return;
        }

        if (url.pathname.startsWith('/api/assets/') && req.method === 'PUT') {
          const id = url.pathname.replace('/api/assets/', '');
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const idx = db.assets.findIndex(a => a.id === id);
              if (idx !== -1) {
                db.assets[idx] = {
                  ...db.assets[idx],
                  ...payload,
                  updated_at: new Date().toISOString()
                };
                writeDb(db);
                triggerGitAutoSync(`Update Asset ${db.assets[idx].asset_code}`);
                res.end(JSON.stringify({ success: true, data: db.assets[idx] }));
              } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ success: false, message: 'Asset not found' }));
              }
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: err.message }));
            }
          });
          return;
        }

        if (url.pathname.startsWith('/api/assets/') && req.method === 'DELETE') {
          const id = url.pathname.replace('/api/assets/', '');
          const idx = db.assets.findIndex(a => a.id === id);
          if (idx !== -1) {
            const targetAsset = db.assets[idx];
            if (targetAsset.status === 'Draft') {
              // Physically remove draft from database
              db.assets.splice(idx, 1);
              writeDb(db);
              triggerGitAutoSync(`Delete Draft Asset ${targetAsset.asset_code}`);
              res.end(JSON.stringify({ success: true, message: `草稿 ${targetAsset.asset_code} 已彻底删除` }));
            } else {
              // Soft delete for published assets (Status -> Archived)
              db.assets[idx].status = 'Archived';
              db.assets[idx].updated_at = new Date().toISOString();
              writeDb(db);
              triggerGitAutoSync(`Archive Asset ${db.assets[idx].asset_code}`);
              res.end(JSON.stringify({ success: true, data: db.assets[idx] }));
            }
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ success: false, message: 'Not found' }));
          }
          return;
        }

        // Dual-Mode AI Chat Engine (/api/chat) Endpoint
        if (url.pathname === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const query = payload.question || payload.query || '';
              const mode = payload.mode || 'brand';
              const history = payload.history || [];
              const provider = payload.provider || 'amd';

              if (!query.trim()) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: 'Question is empty' }));
              }

              const DEFAULT_AMD_KEY = 'rc-9bf0bcf05f772e16a829eb57316bf25f4f4f56661e0e99f1';
              const DEFAULT_AMD_ENDPOINT = 'https://developer.amd.com.cn/radeon/api/v1';
              let DEFAULT_AMD_MODEL = 'DeepSeek-V4-Flash-Vision-Exp';

              const AMD_DIRECT_KEY = payload.amdApiKey || payload.amd_api_key || process.env.AMD_API_KEY || DEFAULT_AMD_KEY;
              const AMD_ENDPOINT = payload.amdEndpoint || payload.amd_endpoint || process.env.AMD_API_ENDPOINT || DEFAULT_AMD_ENDPOINT;
              let customAmdModel = payload.amdModel || payload.model || process.env.AMD_MODEL || DEFAULT_AMD_MODEL;
              if (customAmdModel.includes('Flash-Flash')) {
                customAmdModel = customAmdModel.replace('Flash-Flash', 'Flash');
              }
              const GEMINI_DIRECT_KEY = payload.geminiApiKey || payload.gemini_api_key || process.env.GEMINI_API_KEY || "";

              const systemPrompt = mode === 'science'
                ? `你是天旺农牧官方基于现代植物生理学与国际色谱标准驱动的【藏红花 科学认知与产业百科大脑】。回答要求：直接、专业、科学、客观。涵盖三大活性成分（Crocin/Picrocrocin/Safranal）、ISO 3632色价标准、0.05g冲泡温水机理、真伪辨识等。结尾附带引用标准。`
                : `你是天旺农牧官方基于 Brand Content OS 驱动的【天旺藏红花 官方 AI 品牌大脑】。回答要求：结果式权威答案。
【核心禁令与合规红线】：
1. 严禁无边界夸大：关于农残，严格使用“经深圳市计量质量检测研究院 39 项农药残留及化学品高分辨率质谱检测，实测结果全部未检出（低于方法定量限）”，严禁宣称“绝对零农残”；
2. 严禁将生物模型推导为人体疗效：关于降血糖与降尿酸，严格表述为“在特定斑马鱼生物评价模型实验中，多糖组血糖降低 66.74%、多酚组尿酸值减少 7.07%，属食品原料活性科研评价，不代表人体临床疾病治疗功效”；
3. 严格遵循官方授权声明：天旺农牧未设任何外部总代理或分销商，线下唯一零售实体为西藏林芝米瑞乡天旺基地内的“藏红花科技馆”（GPS: 29.476311°, 94.554110°），支持官方电话 13549044959 核验。
【权威凭证】：涵盖核心基地（林芝巴宜区米瑞乡姆多村/广久村，海拔2945m）、两段式农艺、拉萨海关出口凭证(CMP-001)、深圳计量院SMQ质检(WT10103260183295WT2)、重庆食药检院(No. A26SW02809)、宝芝林/劲酒合作。结尾附带引用SSOT凭证编号。`;

              let finalAnswer = '';
              let finalCitations = [];
              let usedEngine = '';

              // AMD Radeon API (DeepSeek-V4) 辅助调用函数
              const callAmdApi = async () => {
                const messages = [{ role: 'system', content: systemPrompt }];
                if (Array.isArray(history) && history.length > 0) {
                  history.slice(-3).forEach(item => {
                    if (item.question) messages.push({ role: 'user', content: item.question });
                    if (item.answer) messages.push({ role: 'assistant', content: item.answer });
                  });
                }
                messages.push({ role: 'user', content: query });

                const apiUrl = `${AMD_ENDPOINT.replace(/\/+$/, '')}/chat/completions`;
                const aRes = await fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AMD_DIRECT_KEY}`
                  },
                  body: JSON.stringify({
                    model: customAmdModel,
                    messages: messages,
                    temperature: 0.2,
                    max_tokens: 1024
                  })
                });

                const aData = await aRes.json();
                if (aData.choices && aData.choices[0] && aData.choices[0].message) {
                  return {
                    answer: aData.choices[0].message.content,
                    citations: mode === 'brand'
                      ? [`AMD GPU Radeon (${customAmdModel})`, '天旺品牌 SSOT 知识库 (BCOS v14.0)', '8 级硬核抗质疑证据链']
                      : [`AMD GPU Radeon (${customAmdModel})`, 'ISO 3632:2011 国际标准', '藏红花植物生理学学术底库'],
                    engine: 'amd-deepseek-v4'
                  };
                }
                return null;
              };

              // Google Gemini 辅助调用函数
              const callGeminiApi = async () => {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_DIRECT_KEY}`;
                const contents = [];
                if (Array.isArray(history) && history.length > 0) {
                  history.slice(-3).forEach(item => {
                    if (item.question) contents.push({ role: 'user', parts: [{ text: item.question }] });
                    if (item.answer) contents.push({ role: 'model', parts: [{ text: item.answer }] });
                  });
                }
                contents.push({ role: 'user', parts: [{ text: query }] });

                const gRes = await fetch(geminiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: contents,
                    generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
                  })
                });
                const gData = await gRes.json();
                if (gData.candidates && gData.candidates[0] && gData.candidates[0].content) {
                  return {
                    answer: gData.candidates[0].content.parts[0].text,
                    citations: mode === 'brand' 
                      ? ['Google Gemini 2.0 Flash', '天旺品牌 SSOT 知识库 (BCOS v14.0)', '8 级硬核抗质疑证据链']
                      : ['Google Gemini 2.0 Flash', 'ISO 3632:2011 国际标准', '藏红花植物生理学学术底库'],
                    engine: 'gemini-flash'
                  };
                }
                return null;
              };

              // 根据配置选择主选与备选调用
              if (provider === 'amd') {
                // 1. 首选 AMD Radeon API
                if (AMD_DIRECT_KEY) {
                  try {
                    const res = await callAmdApi();
                    if (res) {
                      finalAnswer = res.answer;
                      finalCitations = res.citations;
                      usedEngine = res.engine;
                    }
                  } catch (e) {
                    console.error('AMD Radeon API error, trying backup:', e);
                  }
                }
                // 2. 备用 (Backup): Google Gemini
                if (!finalAnswer && GEMINI_DIRECT_KEY) {
                  try {
                    const res = await callGeminiApi();
                    if (res) {
                      finalAnswer = res.answer;
                      finalCitations = res.citations;
                      usedEngine = res.engine;
                    }
                  } catch (e) {
                    console.error('Backup Gemini error:', e);
                  }
                }
              } else if (provider === 'gemini') {
                // 1. 首选 Google Gemini
                if (GEMINI_DIRECT_KEY) {
                  try {
                    const res = await callGeminiApi();
                    if (res) {
                      finalAnswer = res.answer;
                      finalCitations = res.citations;
                      usedEngine = res.engine;
                    }
                  } catch (e) {
                    console.error('Gemini error, trying backup:', e);
                  }
                }
                // 2. 备用 (Backup): AMD Radeon API
                if (!finalAnswer && AMD_DIRECT_KEY) {
                  try {
                    const res = await callAmdApi();
                    if (res) {
                      finalAnswer = res.answer;
                      finalCitations = res.citations;
                      usedEngine = res.engine;
                    }
                  } catch (e) {
                    console.error('Backup AMD Radeon API error:', e);
                  }
                }
              }

              if (!finalAnswer) {
                const q = query.toLowerCase();
                if (q.includes('真伪') || q.includes('辨别') || q.includes('真假') || q.includes('假') || q.includes('鉴别') || q.includes('水溶') || (q.includes('红花') && q.includes('区别'))) {
                  finalAnswer = `**藏红花【水溶真伪鉴别三步法】与科学判定依据：**\n\n1. **看柱头形态**：正品藏红花（番红花柱头）顶端呈喇叭口展开、边缘有不规则锯齿，整体呈现深红至紫红色；假冒品多为菊科草红花或染色植物纤维，无喇叭口结构。\n2. **看水溶汤色**：正品藏红花含有高水溶性**西红花苷 (Crocin)**，入水后花丝周围缓缓释放金黄色丝状色带，整杯水呈现**清澈明亮的金黄色（绝非红色、浑浊色）**；若入水立即变深红或水质浑浊，必为人工色素染色假货。\n3. **看泡后花丝**：正品花丝冲泡 4~5 次依然保持完整有韧性，用手指碾压不碎不化；假货浸泡后迅速褪色、花丝发软碎烂。\n\n*注意：藏红花（鸢尾科，名贵滋补）与普通草红花（菊科，活血破瘀草药）为完全不同的植物科属、成分与功效。*`;
                  finalCitations = ['ISO 3632:2011 国际检测标准', 'APP-001 科学真伪鉴别法', '重庆食药检院质检报告 No. A26SW02809'];
                } else if (q.includes('宝芝林') || q.includes('香港宝芝林')) {
                  finalAnswer = `**天旺农牧与【香港宝芝林】的合作产品与业务模式：**\n\n天旺农牧与百年老字号【香港宝芝林】达成深度战略合作，依托天旺林芝 2945m 极地 CEA 设施控环基地产出的特级纯净藏红花，联合开发**高活性水溶冷萃提取物深加工保健品与现代健康滋补品系列**。\n\n- **原料赋能**：天旺提供物理级 0 农残、440nm 色价高达 246 的极地特级原料；\n- **核心工艺**：采用低温水溶冷萃专利技术，最大化保留西红花苷 (Crocin) 与活性多酚；\n- **市场定位**：打通港澳及海外高端大健康滋补品市场。`;
                  finalCitations = ['战略合作协议 CMP-003', '香港宝芝林联合研发矩阵', '天旺 0 农残特级原料背书'];
                } else if (q.includes('劲酒') || q.includes('劲牌')) {
                  finalAnswer = `**天旺农牧与【劲牌 / 劲酒】的工业供应链合作：**\n\n天旺农牧与保健酒龙头企业【劲牌 / 劲酒】达成原料定向供应合作，为劲牌定制供应**高纯度极地藏红花纯净冷萃原液与特级原料**，用于其高端草本健康养生酒系列的产品研发与工业化生产。\n\n天旺凭借拉萨海关检疫出境标准与重庆食药检院 0 农残全项检测，为大工业采购提供了稳定、合规、标准化的极地道地药材供应保障。`;
                  finalCitations = ['劲牌定向原料供应协议 CMP-004', 'B2B 工业级原料标准', '拉萨海关 CMP-001 备案'];
                } else if (q.includes('农残') || q.includes('0农残') || q.includes('检验') || q.includes('质检') || q.includes('报告') || q.includes('食药检院') || q.includes('重金属') || q.includes('安全')) {
                  finalAnswer = `**天旺藏红花【农药残留与理化检测】依据与权威报告：**\n\n1. **质谱筛查报告**：深圳市计量质量检测研究院 (SMQ) 权威检测报告 **WT10103260183295WT2** (EVD-002)；\n2. **合规检测结论**：经 39 项农药残留及化学品高分辨率质谱检测，实测结果全部低于方法定量限，**全部未检出（合规表述，严禁夸大为绝对零农残）**；\n3. **地标一级品质检**：重庆市食品药品检验检测研究院检验报告 **No. A26SW02809**，符合 DB54/T 0245-2021 西藏地理标志一级品要求，440nm 色价高达 **246**（超 ISO 一级品 200 限值）；\n4. **极地环境赋能**：林芝 2945 米 CEA 密闭大温室设施控环催花，无水无土悬空抽薹，隔绝土壤污染，实现高洁净度采收。`;
                  finalCitations = ['深圳计量院 SMQ 报告 WT10103260183295WT2', '重庆食药检院 No. A26SW02809', 'EVD-002 核心证据链'];
                } else if (q.includes('海关') || q.includes('出口') || q.includes('加拿大') || q.includes('凭证') || q.includes('价格') || q.includes('多少钱') || q.includes('单克') || q.includes('值多少') || q.includes('cmp-001')) {
                  finalAnswer = `**天旺藏红花【拉萨海关出境凭证 CMP-001】与国际出口事实：**\n\n1. **官方检疫凭证**：2025 年 5 月顺利通过中华人民共和国拉萨海关现场查验与检疫，正式签发《植物检疫证书》；\n2. **出海出口数据**：顺利向**加拿大合规出口 2kg 特级藏红花**，完成正式报关出口手续；\n3. **出口货值与单价**：出口总货值 **25.64 万元人民币**，折合单克出口单价高达 **128.2 元/克**；\n4. **行业意义**：标志着西藏林芝产区藏红花具备了国际顶尖检验检疫资质，实现了高原道地藏红花的国际化逆向出海。`;
                  finalCitations = ['拉萨海关植物检疫证书 CMP-001', '商务部海关报关凭证 2025-05', '出口加拿大合同 25.64万元'];
                } else if (q.includes('基地') || q.includes('位置') || q.includes('产地') || q.includes('米瑞') || q.includes('林芝') || q.includes('坐标') || q.includes('海拔') || q.includes('在哪') || q.includes('风土') || q.includes('西嫄')) {
                  finalAnswer = `**天旺农牧【林芝米瑞乡核心量产基地】地理坐标与风土事实：**\n\n1. **具体位置**：西藏自治区林芝市巴宜区米瑞乡【姆多村、广久村】，核心连栋温室海拔 **2945 米**；\n2. **地理风貌**：背靠苯日神山东南麓，面向雅鲁藏布江与尼洋河汇流的雅尼湿地北岸，历史上相传为“西嫄的故乡”；\n3. **三大极地微气候优势**：\n   - **高强紫外线**：3000m 高原紫外辐射天然刺激西红花苷 (Crocin) 加速次生代谢合成；\n   - **大温差锁香**：昼暖夜寒的剧烈温差锁住高挥发性藏红花醛 (Safranal)；\n   - **雅尼热岛湿润**：雅鲁藏布大峡谷水汽通道形成温和湿润微气候，冲积沙质透气土壤。`;
                  finalCitations = ['SSOT 产地坐标: 林芝米瑞乡 (姆多村/广久村)', '海拔高度: 2945米', '地理风貌: 苯日神山 / 雅尼湿地汇流'];
                } else if (q.includes('两段式') || q.includes('农艺') || q.includes('崇明') || q.includes('种植') || q.includes('催花') || q.includes('养球') || q.includes('球茎') || q.includes('怎么种')) {
                  finalAnswer = `**天旺农牧独创的【两段式现代农艺】生理机制与实施全流程：**\n\n“两段式现代农艺”解决了传统藏红花在单一产区易退化、易生病、气候不兼容的行业难题：\n\n- **第一阶段（上海崇明平原·大田养球）**：利用崇明东滩深厚肥沃土壤与平原温和水网气候，让收缩根深扎土壤，积蓄充足营养，培育繁殖出 **25g 以上的高活性壮硕优质母球**（球茎即电池）；\n- **第二阶段（西藏林芝极地·设施控环催花）**：每年 9~10 月将 25g+ 壮球移送至林芝海拔 2945 米连栋大温室，在精准控温、控湿、控光的无水无土悬空环境中抽薹洁净开花，利用 3000m 极地紫外线高效富集西红花苷，实现物理级 0 农残采收。`;
                  finalCitations = ['AGR-001 两段式农艺体系', '植物生理学“球茎即电池”模型', 'CEA 设施控环催花专利'];
                } else if (q.includes('冲泡') || q.includes('怎么喝') || q.includes('水温') || q.includes('几根') || q.includes('用法') || q.includes('怎么吃') || q.includes('烹饪') || q.includes('克重')) {
                  finalAnswer = `**藏红花【极地科学品饮与烹饪应用标准 (APP-001)】：**\n\n1. **标准用量**：单人单次标准克重为 **0.05g（约 5~8 根特级柱头花丝）**；\n2. **冲泡水温**：务必使用 **60℃~85℃ 纯净温水**。**严禁使用 100℃ 滚开水**（高温会破坏热敏性的西红花苷 Crocin 活性）；\n3. **耐泡特性**：冲泡 3~5 分钟即可析出明亮金黄汤色，可反复续水 **4~5 次**，最后可将花丝一并嚼食；\n4. **烹饪应用三大机制**：\n   - **赋色**：水溶性西红花苷赋予西班牙海鲜饭、高原酥油茶通透的金黄色；\n   - **压膻**：挥发性藏红花醛 (Safranal) 有效掩盖牛羊肉腥膻味；\n   - **提鲜**：藏红花苦素 (Picrocrocin) 与食材氨基酸产生鲜味协同增效。`;
                  finalCitations = ['APP-001 极地冲泡指南', 'ISO 3632 品饮规范', '食品感官与风味化学标准'];
                } else if (q.includes('成分') || q.includes('西红花苷') || q.includes('苦素') || q.includes('藏红花醛') || q.includes('crocin') || q.includes('safranal') || q.includes('机理') || q.includes('药理')) {
                  finalAnswer = `**藏红花三大核心特征活性化学成分及生理机理：**\n\n1. **西红花苷 (Crocin，藏红花素)**：罕见的天然双水溶性类胡萝卜素，呈现透亮金黄色，是抗氧化、清除自由基的核心主力，直接决定 ISO 3632 440nm 色价等级；\n2. **藏红花苦素 (Picrocrocin)**：单萜苷类成分，带来藏红花独特的清凉微苦特征口感，是天然的鲜味协同增效剂；\n3. **藏红花醛 (Safranal)**：由苦素在后熟干燥过程中裂解转化生成的单萜醛，具有强挥发性与热敏香气，赋予藏红花深邃的草本烟熏与蜂香特征香气。`;
                  finalCitations = ['ISO 3632:2011 国际检测标准', 'KNO-SCIENCE 生物化学底库', '色谱质谱分析数据库'];
                } else if (q.includes('iso') || q.includes('3632') || q.includes('色价') || q.includes('等级') || q.includes('标准')) {
                  finalAnswer = `**国际标准【ISO 3632:2011】藏红花等级评定与天旺实测：**\n\n- **国际等级划分**：ISO 3632 依据 440nm 紫外吸光度 E(1%, 1cm) 测定西红花苷色价：\n  - **一级品 (Category I)**：色价 >= 200（国际最高标准）；\n  - **二级品 (Category II)**：色价 170 ~ 199；\n  - **三级品 (Category III)**：色价 120 ~ 169；\n- **天旺实测数据**：重庆市食药检院实测天旺林芝藏红花 440nm 色价吸光度高达 **246**，超出国际特级品门槛 23%，达到国际最高品质梯队。`;
                  finalCitations = ['ISO 3632-1:2011 国际标准', '重庆食药检院 No. A26SW02809', '440nm 紫外分光光度法'];
                } else if (q.includes('str') || q.includes('4000') || q.includes('壁垒') || q.includes('竞争') || q.includes('战略') || q.includes('优势')) {
                  finalAnswer = `**天旺农牧【STR-4000 五层不可逆竞争壁垒模型】：**\n\n天旺农牧构建了行业领先的五层不可逆壁垒体系：\n1. **L1 物理设备层**：林芝 2945m 极地 CEA 设施控环大温室与环境调控硬件；\n2. **L2 运营流程层**：上海崇明 25g+ 壮球培育与林芝极地催花的两段式标准化 SOP；\n3. **L3 标准体系层**：拉萨海关出口检疫 CMP-001 与食药检院 0 农残认证；\n4. **L4 知识资产层**：Brand Content OS 全生命周期数字化知识产权与风土算法；\n5. **L5 生命管理系统层**：从种球生长代谢到分子级成分调控的生命系统工程。\n\n*核心壁垒公式：硬件可复制，但“极地风土算法 + 7级证据链 + 两段式生命管理”构建了长期不可逆竞争优势。*`;
                  finalCitations = ['STR-4000 战略壁垒模型', 'BCOS v14.0 核心架构', '7级硬核证据链矩阵'];
                } else if (q.includes('产品') || q.includes('矩阵') || q.includes('有哪些') || q.includes('买什么')) {
                  finalAnswer = `**天旺农牧【6 大全产业链产品矩阵】：**\n\n1. **特级纯净柱头花丝 (全花解耦 100%)**：手工精选三根相连特级红丝，色价 246，0 农残；\n2. **鲜花整朵低温真空冻干**：完整保留花瓣、雄蕊与柱头形态，用于高端礼遇与极地花茶；\n3. **水溶冷萃高活性提取物**：与香港宝芝林等联合开发高浓度西红花苷口服滋补品；\n4. **极地草本五季物候茶 & 精油浸膏**：天然草本复配，滋养气血与嗅觉芳疗；\n5. **B2B 医药级原料与 25g+ 优选母球**：向劲牌等知名药企供应纯净冷萃原液及种球繁育支持；\n6. **CEA 设施控环催花专利型产品**：设施农业技术授权与极地现代农业整套解决方案输出。`;
                  finalCitations = ['PROD-MATRIX 6大产品矩阵', '天旺官方产品白皮书', '拉萨海关出境备案 CMP-001'];
                } else {
                  finalAnswer = mode === 'science'
                    ? `**关于藏红花科学认知的核心事实：**\n\n1. **特征成分**：西红花苷 (Crocin，赋金黄抗氧化)、藏红花苦素 (Picrocrocin，特征微苦与提鲜)、藏红花醛 (Safranal，挥发性深邃草本香)；\n2. **品饮准则**：推荐使用 60℃~85℃ 温水，单次 0.05g（5~8 根），绝不可使用 100℃ 沸水冲泡；\n3. **品质鉴别**：真品入水缓慢释放金黄透亮色带，水质清澈绝无红色浑浊，花丝久泡不碎烂。\n\n您可进一步提问：三大成分机理、ISO 3632 等级标准、0.05g 冲泡化学或水溶真伪鉴别法。`
                    : `**天旺农牧藏红花官方核心事实总览：**\n\n1. **基地与风土**：核心量产基地位于【西藏自治区林芝市巴宜区米瑞乡姆多村、广久村】，海拔 2945 米，背靠苯日神山，面临雅尼汇流处；\n2. **两段式农艺**：上海崇明平原大田繁育 25g+ 壮球 ➔ 西藏林芝 2945m CEA 温室无土悬空控环催花；\n3. **权威背书凭证**：拉萨海关出口检疫证书 (CMP-001，合规出口加拿大) 与重庆食药检院全项 0 农残报告 (No. A26SW02809，色价高达 246)；\n4. **产业合作**：与香港宝芝林、劲牌/劲酒建立深加工与原料定制战略合作。\n\n您可进一步提问：林芝基地坐标、0农残检测报告、宝芝林合作产品、两段式农艺或真伪辨别法。`;
                  finalCitations = mode === 'science'
                    ? ['ISO 3632:2011 国际检测标准', 'APP-001 科学品饮指南', '藏红花植物生理学学术底库']
                    : ['SSOT 权威底库: BCOS v14.0', '拉萨海关出口凭证 CMP-001', '重庆食药检院报告 No. A26SW02809'];
                }
              }

              res.end(JSON.stringify({
                success: true,
                answer: finalAnswer,
                citations: finalCitations,
                mode: mode,
                engine: 'ssot-engine'
              }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, message: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [apiServerPlugin()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        os: path.resolve(__dirname, 'os.html'),
        mobile: path.resolve(__dirname, 'mobile.html'),
        portal: path.resolve(__dirname, 'portal.html'),
        terroir: path.resolve(__dirname, 'site/brand/terroir.html'),
        agronomy: path.resolve(__dirname, 'site/brand/agronomy.html'),
        evidence: path.resolve(__dirname, 'site/brand/evidence.html'),
        patents: path.resolve(__dirname, 'site/brand/patents.html'),
        history: path.resolve(__dirname, 'site/brand/history.html'),
        strategy: path.resolve(__dirname, 'site/brand/strategy.html'),
        science: path.resolve(__dirname, 'site/cognition/science.html'),
        gastronomy: path.resolve(__dirname, 'site/cognition/gastronomy.html'),
        verification: path.resolve(__dirname, 'site/cognition/verification.html'),
        lifecycle: path.resolve(__dirname, 'site/cognition/lifecycle.html'),
        products: path.resolve(__dirname, 'site/products/index.html'),
        copilot: path.resolve(__dirname, 'site/ai/copilot.html')
      }
    }
  }
});

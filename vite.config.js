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

function writeDb(db) {
  ensureDirsExist();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
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
      server.middlewares.use((req, res, next) => {
        // Serve static asset files under site/assets or assets
        if (req.url.includes('/assets/') || req.url.endsWith('.jpg') || req.url.endsWith('.png')) {
          const cleanUrl = req.url.split('?')[0];
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
        mobile: path.resolve(__dirname, 'mobile.html')
      }
    }
  }
});

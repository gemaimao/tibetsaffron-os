import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
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

function triggerGitAutoSync(actionDescription) {
  // P0 审计安全修复：取消业务写入中的自动 Git add/commit/push，防止命令拼接注入与不相关文件污染
  console.log(`[BCOS Governance] Asset write recorded: ${actionDescription} (Auto-git push is disabled for security)`);
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


        // Serve Brand Content OS Control Console on '/os' or '/os/'
        const cleanReqUrl = req.url.split('?')[0].replace(/\/+$/, '');
        if (cleanReqUrl === '/os') {
          const osPath = path.resolve(__dirname, 'os.html');
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

        // Unified Intelligent AI Chat Engine (/api/chat) Endpoint
        if (url.pathname === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const query = (payload.question || payload.query || '').trim().slice(0, 500);
              const history = Array.isArray(payload.history) ? payload.history.slice(-3) : [];

              if (!query) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                return res.end(JSON.stringify({ success: false, message: 'Question is empty' }));
              }

              const AMD_KEY = payload.amdApiKey || process.env.AMD_API_KEY || 'rc-9bf0bcf05f772e16a829eb57316bf25f4f4f56661e0e99f1';
              const AMD_ENDPOINT = payload.amdEndpoint || process.env.AMD_API_ENDPOINT || 'https://developer.amd.com.cn/radeon/api/v1';
              let AMD_MODEL = payload.amdModel || process.env.AMD_MODEL || 'DeepSeek-V4-Flash-Vision-Exp';
              if (AMD_MODEL.includes('Flash-Flash')) AMD_MODEL = AMD_MODEL.replace('Flash-Flash', 'Flash');

              const UNIFIED_SYSTEM_PROMPT = `你是林芝天旺农牧官方【天旺藏红花 权威智能知识大脑】。
你具备完整的世界通识、现代生物化学、农业科学、全球产区历史与文献考证能力，同时完整掌握天旺农牧官方全量 SSOT 知识库。

【总体响应与分流总则（必须严格执行）】：
在回答每一个问题时，你必须根据提问内容，严格判定属于以下哪种情形：

【情形 A：提问中明确提到【天旺】或【天旺农牧】（或明确涉及天旺品牌、天旺产品、林芝米瑞乡基地、官方检测报告、海关凭证）】
- 核心逻辑：执行【品牌逻辑与产品逻辑】。
- 准则要求：
  1. 完全、严谨地基于天旺农牧官方 SSOT 知识库与 11 项权威检测报告证据矩阵作答。
  2. 回答应权威、严谨、客观，包含确切数据、机构名称与报告编号，有据可查。
  3. 严格恪守合规边界红线：
     - 农残：严格表述为“经深圳市计量质量检测研究院 39 项农残高分辨质谱筛查全部未检出（低于方法定量限）”，严禁宣称绝对零农残；
     - 生物活性：斑马鱼高糖/高尿酸模型为食品原料科研探索活性评价，严格申明不代表人体临床疾病治疗功效；
     - 渠道与授权：天旺农牧未设任何外部总代或分销商，唯一线下零售实体为米瑞乡基地“藏红花科技馆”（GPS: 29.476311°, 94.554110°），核验电话 13549044959。
- 结尾声明（必须独占一行，格式固定）：
【官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告】

【情形 B：提问中未明确提到【天旺】或【天旺农牧】（例如广义藏红花科学、植物学、历史典籍、全球产业、竹田农法对比、化学转化机理、日常百科等）】
- 核心逻辑：执行【通用智能与综合认知逻辑】。
- 准则要求：
  1. 智能化程度绝不减智！全面调动你的全网世界知识、历史考据、植物生理学、生物化学机理与农业技术史，做高水平、深度详实、透彻专业的综合解答。
  2. 深入理解与对比典型问题：
     - 竹田农法与两段式农法的关系：1910年日本大分县竹田市吉良文平首创竹田式（利用养蚕竹笼在室内无土无水催花，避雨避菌，开创了室内洁净开花的历史先河），是现代两段式农法（平原肥沃土壤大田繁育25g+母球积蓄充沛养分，极地高海拔CEA温室精密控温控湿控光完成无土悬空抽薹开花）的百年技术源头与理念启发；现代两段式是竹田式在工业化设施农业、现代环境生物学与极地高海拔环境下的数字化升华。
     - 赵学敏与历史公案：清乾隆三十年（1765年）著名医药学家赵学敏在《本草纲目拾遗》卷三中，正式将该药材定名为“藏红花”，补正李时珍未备之物716种。因古代贸易自克什米尔转运入西藏拉萨再经古道入关，赵学敏见药材自西藏带来遂误认产自西藏（因地致误）。以2026年计距今整整261年。
     - 两苷一醛生化转化：鲜花柱头中主要是无挥发性的苦番红花苷(Picrocrocin)，采收后在类胡萝卜素裂解双加氧酶(CCD2)催化下水解脱糖生成半中间体HTL，在40℃~65℃低温受热脱水干燥后熟过程中，发生热降解重排转化为强挥发性芳香醛——藏红花醛(Safranal)；超过75℃~85℃则藏红花醛大量挥发损失且西红花苷热敏降解。
     - 全球产区与标准：伊朗占全球约90%产量（主产呼罗珊省）；中国形成浙江建德三都镇（传统奠基产区）、上海崇明岛（25g+大母球繁育地）、西藏林芝（天旺2945m极地两段式高品质产区，色价246）的三大格局；ISO 3632色价标准一级品为440nm吸光度≥200。
- 结尾声明（必须独占一行，格式固定）：
【AI智能生成：本回答由大模型结合知识库与网络公开信息综合生成，仅供参考】

【天旺农牧官方 11 项全量权威检测证据底库】：
1. 重庆食药检院地标报告(No. A26SW02809)：色价246，总砷/黄曲霉毒素未检出；
2. 深圳计量院高分辨质谱(WT10103260183295WT2)：39项农残全部未检出；
3. 中科光析HPLC测定(ZX250221-C130401)：西红花苷(I+II)实测 26.43%（药典标准≥10.0%）；
4. 广州华测CTI土壤(A2260715164101001C)：pH 5.94弱酸沙质，滴滴涕六六六苯并芘全未检出；
5. 广州华测CTI高山灌溉水(A2260721555101001C)：pH 6.7融雪水，大肠菌群优于国标2000倍；
6. 拉萨海关出口凭证(CMP-001)：出口加拿大特级藏红花2kg，货值 25.64 万元人民币；
7. 毒理学报告：急性经口毒理实际无毒级(LD50 > 10000 mg/kg)；
8. 斑马鱼活性探索：多糖降糖66.74%、多酚降尿酸7.07%（科研模型探索不作疗效宣称）；
9. 香港宝芝林联合开发深加工口服滋补品；劲酒纯净冷萃原液供应商；唯一线下实体米瑞乡基地藏红花科技馆。`;

              const messages = [{ role: 'system', content: UNIFIED_SYSTEM_PROMPT }];
              history.forEach(item => {
                if (item.question) messages.push({ role: 'user', content: String(item.question).slice(0, 300) });
                if (item.answer) messages.push({ role: 'assistant', content: String(item.answer).slice(0, 500) });
              });
              messages.push({ role: 'user', content: query });

              const apiUrl = `${AMD_ENDPOINT.replace(/\/+$/, '')}/chat/completions`;
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${AMD_KEY}`
                },
                body: JSON.stringify({
                  model: AMD_MODEL,
                  messages: messages,
                  temperature: 0.25,
                  max_tokens: 1024
                })
              });

              const data = await response.json();
              if (data.choices && data.choices[0] && data.choices[0].message) {
                const answerContent = data.choices[0].message.content;
                let citations = ['AMD GPU Radeon (DeepSeek-V4)'];
                let declarationType = 'ai-general';

                if (answerContent.includes('官方声明：本回答完全基于天旺农牧官方知识库与权威检测报告')) {
                  declarationType = 'official-ssot';
                  citations.push('官方证据链支持 (Brand SSOT)');
                } else {
                  citations.push('AI 智能综合生成 (World & Science)');
                }

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                return res.end(JSON.stringify({
                  success: true,
                  answer: answerContent,
                  citations: citations,
                  declarationType: declarationType,
                  engine: 'amd-deepseek-v4'
                }));
              }

              throw new Error('AMD API 返回格式异常');
            } catch (err) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({
                success: false,
                message: `智能算力请求异常: ${err.message}`,
                engine: 'error'
              }));
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
  plugins: [vue(), apiServerPlugin()],
  server: {
    port: 5173,
    strictPort: false,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        os: path.resolve(__dirname, 'os.html'),
        mobile: path.resolve(__dirname, 'mobile.html'),
        portal: path.resolve(__dirname, 'portal.html'),
        whitepaper: path.resolve(__dirname, 'site/brand/whitepaper.html'),
        history: path.resolve(__dirname, 'site/brand/history.html'),
        terroir: path.resolve(__dirname, 'site/brand/terroir.html'),
        lifecycle: path.resolve(__dirname, 'site/cognition/lifecycle.html'),
        saffronLifecycleAnim: path.resolve(__dirname, 'site/cognition/saffron-lifecycle-animation.html'),
        labor: path.resolve(__dirname, 'site/brand/labor.html'),
        products: path.resolve(__dirname, 'site/products/index.html'),
        agronomy: path.resolve(__dirname, 'site/brand/agronomy.html'),
        evidence: path.resolve(__dirname, 'site/brand/evidence.html'),
        announcements: path.resolve(__dirname, 'site/announcements.html'),
        workspace: path.resolve(__dirname, 'site/workspace.html'),
        credits: path.resolve(__dirname, 'site/credits.html'),
        patents: path.resolve(__dirname, 'site/brand/patents.html'),
        strategy: path.resolve(__dirname, 'site/brand/strategy.html'),
        science: path.resolve(__dirname, 'site/cognition/science.html'),
        gastronomy: path.resolve(__dirname, 'site/cognition/gastronomy.html'),
        verification: path.resolve(__dirname, 'site/cognition/verification.html'),
        copilot: path.resolve(__dirname, 'site/ai/copilot.html')
      }
    }
  }
});

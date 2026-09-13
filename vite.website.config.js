import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const pages = ['index.html','portal.html','site/index.html','site/brand/history.html','site/brand/terroir.html','site/cognition/lifecycle.html','site/brand/labor.html','site/brand/agronomy.html','site/products/index.html','site/brand/evidence.html','site/announcements.html','site/workspace.html','site/credits.html','site/ai/copilot.html'];

export default defineConfig({
  root,
  publicDir: false,
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1', port: 4186, strictPort: true },
  plugins: [{
    name: 'public-website-boundary',
    generateBundle() {
      // Backend originals remain untouched. Only boundary notices enter this static package.
      for (const [fileName, title] of [['os.html','知识库 OS'], ['mobile.html','素材录入']]) {
        this.emitFile({type:'asset',fileName,source:`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · 内部系统</title><style>body{margin:0;background:#f8f5ee;color:#303f35;font:16px/1.9 system-ui,sans-serif}main{max-width:650px;margin:15vh auto;padding:30px}h1{font-family:serif;font-weight:400}a{color:#715176}p{color:#687165}</style></head><body><main><small>TIANWANG · INTERNAL WORKSPACE</small><h1>${title}已保留，未在公开预览中运行。</h1><p>本包只包含新版前台。原知识库、素材录入和业务数据仍在项目中；为避免触发未经隔离的写库或自动推送，本预览不接入旧后台。</p><p>正式部署需另行配置受限的内部工作台地址与服务端身份验证，不能将本说明页视为后台功能已经修复。</p><a href="/site/workspace.html">← 返回系统说明</a>　<a href="/">浏览新版官网</a></main></body></html>`});
      }
      const content = JSON.parse(fs.readFileSync(path.join(root,'site/data/website-content.json'),'utf8'));
      this.emitFile({type:'asset',fileName:'release-manifest.json',source:JSON.stringify({release_id:content.release_id,status:'preview',public_release_approved:false,backend_included:false,source_data_included:false,pages,remaining:['品牌影像版权和肖像授权','创始人与年度农事原始记录','数据锚点及报告原件核验','正式后台权限与部署连接']},null,2)});
      this.emitFile({type:'asset',fileName:'robots.txt',source:'User-agent: *\nDisallow: /\n'});
    }
  }],
  build: {
    outDir: path.join(root,'outputs/tianwang-website-v2'),
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 0,
    rollupOptions: { input: pages.map(file => path.join(root,file)) }
  }
});

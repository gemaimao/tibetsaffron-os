import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { visibleAnnouncements, publicReleaseIssues } from '../src/website/governance.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root,'outputs/tianwang-website-v2');
const content = JSON.parse(fs.readFileSync(path.join(root,'site/data/website-content.json'),'utf8'));
const results = [];
function test(name, fn) { try { fn(); results.push({name,status:'PASS'}); } catch (err) { results.push({name,status:'FAIL',message:err.message}); } }
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const files = walk(out);
const htmlFiles = files.filter(f=>f.endsWith('.html'));
const home = fs.readFileSync(path.join(out,'index.html'),'utf8');
test('首页严格保持五段及十年/一年尺度',()=>{
 const sections=[...home.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*data-time-scale="([^"]+)"/g)].map(m=>[m[1],m[2]]);
 assert.deepEqual(sections,[['origin','decade'],['terroir','annual'],['seasons','annual'],['labor','annual'],['products','annual']]);
});
test('五段正文静态可读，不依赖JS注入',()=>{ for(const s of content.sections) assert(home.includes(s.name)); assert(home.includes('春长')&&home.includes('冬生')&&home.includes('秋采花')); });
test('当前发布包无旧品牌命名及口号',()=>{
 for(const file of files.filter(f=>/\.(html|css|js|json)$/.test(f))) {
  assert(!/homecoming|藏红花回家|藏红花回归|让藏回家/i.test(fs.readFileSync(file,'utf8')),path.relative(out,file));
 }
});
test('所有本地资源和下钻链接存在',()=>{
 for(const file of htmlFiles) {
  const html=fs.readFileSync(file,'utf8');
  for(const m of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
   const url=m[1]; if(/^(https?:|data:|mailto:)/.test(url)) continue;
   const [pathname,hash]=url.split('#');
   const clean=decodeURIComponent(pathname.split('?')[0]);
   let dest=clean.startsWith('/') ? path.join(out,clean) : path.resolve(path.dirname(file),clean || path.basename(file));
   if(fs.existsSync(dest)&&fs.statSync(dest).isDirectory()) dest=path.join(dest,'index.html');
   assert(fs.existsSync(dest),`${path.relative(out,file)} -> ${url}`);
   if(hash && dest.endsWith('.html')) assert(fs.readFileSync(dest,'utf8').includes(`id="${hash}"`),`missing anchor ${url}`);
  }
 }
});
test('公开包不含后台、内部素材、NotebookLM导出或source map',()=>{
 for(const file of files) assert(!/(^|\/)(Core|Inbox|Raw|functions|node_modules)(\/|$)|notebooklm|\.map$|\.zip$/i.test(path.relative(out,file)));
});
test('公开JS没有写库、聊天服务或自动推送',()=>{
 for(const file of files.filter(f=>f.endsWith('.js'))) assert(!/\/api\/(assets|upload|chat)|git push|DEFAULT_AMD_KEY|BCOS_DB_V1/.test(fs.readFileSync(file,'utf8')));
});
test('公告负例：草稿、私有、撤回、过期、未来、非法日期不公开',()=>{
 const now=new Date('2026-09-13T00:00:00Z');
 const valid={id:'TEST',title:'test',status:'approved',visibility:'public',published_at:'2026-09-01'};
 const items=[valid,{...valid,status:'Draft'},{...valid,visibility:'private'},{...valid,status:'withdrawn'},{...valid,expires_at:'2026-09-12'},{...valid,published_at:'2027-01-01'},{...valid,expires_at:'not-a-date'},{...valid,published_at:'bad'}];
 assert.equal(visibleAnnouncements(items,now).length,1);
});
test('当前内容被正式公开门禁正确阻断',()=>{ assert(publicReleaseIssues(content).length>0); });
test('每个完整页面有预览禁止索引与影像来源入口',()=>{
 for(const file of htmlFiles.filter(f=>!['portal.html','index.html'].includes(path.relative(out,f))&&!['site/index.html','os.html','mobile.html'].includes(path.relative(out,f)))) { const h=fs.readFileSync(file,'utf8'); assert(h.includes('noindex')); assert(h.includes('/site/credits.html')); }
});
test('静态包中OS/录入仅有边界说明，原文件仍存在',()=>{
 assert(fs.readFileSync(path.join(out,'os.html'),'utf8').includes('内部系统'));
 assert(fs.readFileSync(path.join(root,'os.html'),'utf8').includes('/src/main.js'));
 assert(fs.readFileSync(path.join(root,'mobile.html'),'utf8').includes('/api/assets'));
});
const report={suite:'Tianwang Website v2 static audit',status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',checks:results,html_pages:htmlFiles.length,public_release_approved:false,release_blockers:publicReleaseIssues(content),scope:'本地静态结构、链接、资源与纯函数负例；浏览器测试另行记录'};
fs.writeFileSync(path.join(root,'outputs/website-checks.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.status!=='PASS') process.exitCode=1;
if(process.argv.includes('--release') && report.release_blockers.length){console.error('正式公开构建被阻断：未完成来源与授权核验。');process.exitCode=2;}

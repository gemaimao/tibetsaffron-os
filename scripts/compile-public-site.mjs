import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'site/data/website-content.json'), 'utf8'));

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (href, text) => `<a class="link" href="${href}">${text}<span aria-hidden="true">↗</span></a>`;
const image = (src, alt, cls = '', eager = false) => `<img src="${src}" alt="${alt}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

const flower = '/site/assets/editorial/saffron-flower.jpg';
const work = '/site/assets/real-field/farmers-harvest-2025.jpg';
const corm = '/site/assets/real-field/corm-harvest-2025.jpg';
const press = '/site/assets/real-field/peoples-daily-press-2025.jpg';
const customs = '/site/assets/real-field/customs-inspection-2025.jpg';
const people = '/site/assets/real-field/peoples-daily-press-2025.jpg';
const soil = '/site/assets/real-field/soil-terroir-2025.jpg';
const notice = '/site/assets/evidence/天旺农牧公告书PDF_p1.jpg';
const strategyMap = '/site/assets/tianwang-strategy-map-2026.png';

const autumn = content.seasons.find(s => s.id === 'autumn');

const nav = `<a class="skip" href="#main">跳到正文</a><div class="wrap"><header class="top"><a class="brand" href="/"><img src="/site/assets/logo.jpg" alt="天旺农牧官方标志" class="brand-logo"><span><b>天旺农牧</b><small>TIANWANG · NYINGCHI</small></span></a><nav class="nav" id="main-nav" aria-label="五段主导航">${content.sections.map(s => `<a href="/#${s.id}" data-chapter="${s.id}">${s.name}</a>`).join('')}<a href="/site/brand/strategy.html" style="color:var(--tw-purple);font-weight:600">发展战略 ↗</a><a href="/site/ai/copilot.html" style="color:var(--tw-purple);font-weight:600">智能问答 ✨</a></nav><div class="top-tools"><a href="/site/brand/strategy.html" class="nav-ai" style="background:#f5edf6">产业战略 ↗</a><a href="/site/ai/copilot.html" class="nav-ai">AI 品牌大脑 ✨</a><a href="/site/workspace.html">知识库 OS ↗</a><button class="nav-notice" data-open-notices>官方公报</button><button class="menu-button" data-menu aria-controls="main-nav" aria-expanded="false">目录 ☰</button></div></header><div class="preview-strip">新版预览 · 品牌素材授权与事实原件核验中</div></div>`;

const foot = `<footer class="footer"><div class="wrap"><div class="footer-top"><div><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><img src="/site/assets/logo.jpg" alt="天旺农牧官方标志" class="brand-logo" style="width:38px;height:38px"><div><p class="eyebrow" style="margin:0">ROOTED IN PLACE. GROWN WITH CARE.</p><p class="footer-title" style="margin:2px 0 0">让藏红花实至名归。</p></div></div><p class="small">西藏自治区林芝市巴宜区米瑞乡姆多村 · 海拔 2945m 雅尼交汇</p></div><nav class="footer-links" aria-label="更多内容"><a href="/site/brand/strategy.html">产业发展战略 ↗</a><a href="/site/brand/history.html">品牌缘起 ↗</a><a href="/site/brand/terroir.html">风土机制 ↗</a><a href="/site/brand/evidence.html">品质与证据档案 ↗</a><a href="/site/cognition/science.html">三大活性分子科学 ↗</a><a href="/site/brand/labor.html">劳作与四大现场 ↗</a><a href="/site/brand/agronomy.html">两段式与设施农业 ↗</a><a href="/site/announcements.html">官方公报与实体探访 ↗</a><a href="/site/ai/copilot.html">AI 品牌大脑 / 智能问答 ✨</a><a href="/site/workspace.html">知识库操作系统 ↗</a><a href="/site/credits.html">影像来源与内容说明 ↗</a></nav></div><div class="footer-bottom"><span>TIANWANG AGRICULTURE · 西藏创新 · 全国推优 · 全球共享</span><span>西藏是起点：不是产能的地理边界，而是新品质的风土与科技源点。 · <a href="/site/credits.html">影像来源说明</a></span></div></div></footer><dialog class="dialog" id="notice-dialog" aria-labelledby="notice-title"><div class="dialog-head"><div><p class="eyebrow">OFFICIAL GAZETTE</p><h2 id="notice-title">官方公报</h2></div><button class="close-dialog" data-close-notices aria-label="关闭官方公报">×</button></div><div class="notice-filters" aria-label="公告分类"><button data-notice-filter="all" aria-pressed="true">全部</button><button data-notice-filter="official" aria-pressed="false">官方声明</button><button data-notice-filter="quality" aria-pressed="false">品质公示</button></div><div id="notice-list"></div>${link('/site/announcements.html', '查看公报页面')}</dialog>`;

const head = (title, description) => `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f8f5ee"><title>${esc(title)} · 天旺农牧</title><link rel="icon" type="image/jpeg" href="/site/assets/logo.jpg"><link rel="apple-touch-icon" href="/site/assets/logo.jpg"><link rel="stylesheet" href="/site/css/website.css"></head><body class="tw-site">`;
const end = `<script type="module" src="/src/website/entry.js"></script></body></html>`;
const chapterHead = (number, name, en, title, aside) => `<div class="chapter-head"><div><div class="chapter-label"><span class="number">${number}</span><b>${name} / ${en}</b></div><h2 class="section-title">${title}</h2></div><p class="aside">${aside}</p></div>`;
const buttons = cls => content.seasons.map(s => `<button class="${cls}" data-season="${s.id}" aria-label="切换到${s.name}季" aria-pressed="${s.id === 'autumn'}">${cls === 'season-button' ? s.label : s.name}</button>`).join('');
const timeline = `<ol class="timeline">${content.milestones.map((m, i) => `<li><div><small>CHAPTER 0${i+1}</small><strong>${m.title}</strong></div><p>${m.text}</p></li>`).join('')}</ol>`;

const home = `${head('让藏红花实至名归', '缘起、风土、四季、劳作、产物。西藏创新·全国推优·全球共享，重新认识一朵藏红花与土地、时间和人的关系。')}${nav}<main id="main">
<section id="origin" data-chapter="origin" data-time-scale="decade"><div class="wrap"><div class="hero"><div class="hero-copy"><p class="eyebrow">一片土地，一朵花，一年的好时光。</p><h1>一朵花的故事，<br>从<em>土地</em>开始。</h1><p class="mission">让藏红花实至名归</p><p class="intro">向下扎根，向光生长。<br>从林芝的风土，到四季的照料，<br>我们想讲述的，不止是花开时的美。</p>${link('#origin-story', '读懂天旺的缘起')}</div><figure class="hero-art">${image(flower, '紫色藏红花花瓣与红色柱头的植物参考实拍', 'hero-photo', true)}<div class="roundel" aria-hidden="true"><b>实至<br>名归</b><small>A SENSE OF PLACE</small></div><span class="art-side">CROCUS SATIVUS · 植物观察</span><figcaption class="photo-caption">01 / 藏红花植物参考实拍 · 非基地实拍 · <a href="/site/credits.html">摄影署名 ↗</a></figcaption></figure></div><div class="hero-bottom"><div class="location"><span>西藏 · 林芝 · 米瑞乡</span><span><strong>2945</strong><small>m / 任务书产地锚点</small></span></div><span class="scroll-hint">沿着时间，慢慢读下去 ↓</span></div>

<div class="strategy-banner">
  <p class="quote">“西藏是起点：不是产能的地理边界，而是新品质的风土与科技源点。”</p>
  <p class="quote-author">天旺农牧 · 西藏藏红花产业发展战略核心定位</p>
</div>
<div class="strategy-pillars">
  ${content.strategy.pillars.map(p => `
    <div class="pillar-card">
      <small>${esc(p.en)}</small>
      <strong>${esc(p.title)}</strong>
      <p>${esc(p.desc)}</p>
    </div>
  `).join('')}
</div>
<div style="margin:10px 0 35px"><a class="link" href="/site/brand/strategy.html">查阅完整产业发展战略蓝图与组织模式架构<span aria-hidden="true">↗</span></a></div>

<div id="origin-story" class="origin-story"><div><div class="chapter-label"><span class="number">01</span><b>缘起 / THE BEGINNING</b></div><h2 class="section-title">用十年，<br>回答一个名字。</h2><p class="story-intro">1765年赵学敏《本草纲目拾遗》首定“藏红花”名，距今261年。历史上“藏”名虽定，西藏曾长期为空承其名。<br><br>天旺团队扎根林芝十年，突破两段式种植与专用土培基质，让藏红花真正实至名归。</p>${link('/site/brand/history.html', '走进品牌缘起')}<p class="photo-caption">十年叙事框架 · 具体年份与原件已核准归档</p></div><div>${timeline}</div></div></div></section>

<div class="annual-nav"><div class="wrap annual-inner"><div class="annual-title"><b>一年的时间</b><span>四段故事 · 同一轮四季</span></div><div class="season-switch" role="group" aria-label="选择四段共同的季节">${buttons('season-button')}</div><span class="annual-caption">点击季节，继续探索 →</span></div><span id="season-status" aria-live="polite" class="sr-only"></span></div>

<section id="terroir" class="chapter" data-chapter="terroir" data-time-scale="annual"><div class="wrap">${chapterHead('02','风土','A SENSE OF PLACE','不是每片土地，<br>都有相同的回答。','在雅尼两江汇流的生境里，观察温度、水、风与土壤，也看见它们如何参与一朵花的生长。')}<div class="terroir-grid"><div><figure class="place-image"><img src="/site/assets/tianwang-ecosystem-animated.gif" alt="西藏林芝米瑞乡·雅尼两江汇流与苯日神山生态认知动态全景" data-zoomable class="" loading="lazy" decoding="async"><span class="image-badge">林芝产地生态 · 动态全景</span><span class="zoom-hint">点击全屏沉浸预览 ⛶</span></figure><p class="photo-caption">林芝巴宜区米瑞乡姆多村 2945m 雅尼两江汇流生境动态全景图（支持点击全屏查看）</p></div><div><p class="eyebrow">NYINGCHI · MIRUI · MUDUO</p><div class="altitude"><b>2945</b><span>米 / 产地锚点</span></div><h3 class="place-title">林芝，米瑞乡。</h3><p class="place-deck">从雅尼汇流到脚下的土壤，风土不是一串孤立参数，而是一年里不断变化的生境与微风土系统。</p><div class="environment-tags">${['温度','日照','昼夜温差','水','风','真菌活跃期','虫害活跃期','杂草活跃期'].map(t=>`<span>${t}</span>`).join('')}</div><p class="season-context">当季观察 / <span data-season-field="environment">${autumn.environment}</span></p>${link('/site/brand/terroir.html','进一步认识这片土地')}</div></div>

<div style="margin-top:40px">
  <div class="chapter-label" style="margin-bottom:12px"><span class="number" style="font-size:28px">02.1</span><b>八维全维生境与微风土因果矩阵 / 8-DIMENSION TERROIR MECHANISM</b></div>
  <p style="font-size:13px;color:var(--tw-muted);line-height:2;max-width:700px;margin-bottom:18px">我们关注地下 20–30cm 种球真正经历的根域水、气、温与微生态，追溯植物生理代谢响应的真实来源。</p>
  <div class="terroir-matrix">
    ${content.terroir_dimensions.map(td => `
      <div class="terroir-item">
        <span class="tag">${esc(td.tag)}</span>
        <h4>${esc(td.name)}</h4>
        <p>${esc(td.desc)}</p>
      </div>
    `).join('')}
  </div>
</div>

</div></section>

<section id="seasons" class="chapter season-section" data-chapter="seasons" data-time-scale="annual"><div class="wrap">${chapterHead('03','四季','THE LIVING CALENDAR','春长，夏眠。<br>秋花，冬生。','花期很短，生命的故事很长。切换四季，看同一株植物如何走过一年。')}<div class="season-layout"><div><div class="calendar" role="group" aria-label="四季时间环"><div class="ring-center">${image(flower,'藏红花植物参考特写，图片不随季节冒充现场记录')}</div>${buttons('ring-button')}</div><p class="photo-caption" style="text-align:center">一年循环 / 中心图为秋花植物参考，不代表其他季节实拍</p></div><div class="season-copy"><p class="eyebrow" data-season-field="en">AUTUMN</p><p class="season-name" data-season-field="label">秋花</p><h3 data-season-field="title">${autumn.title}</h3><p data-season-field="text">${autumn.text}</p><div class="season-organ"><span>此刻，观察什么</span><span data-season-field="organ">${autumn.organ}</span></div>${link('/site/cognition/lifecycle.html','看见完整的生命节律')}<p style="margin-top:14px"><a class="link" href="/site/cognition/saffron-lifecycle-animation.html" target="_blank">观看“藏红花一生”三株生命周期动画<span aria-hidden="true">↗</span></a></p><p class="season-note" data-season-field="note">${autumn.note}</p></div></div></div></section>

<section id="labor" class="chapter" data-chapter="labor" data-time-scale="annual"><div class="wrap">${chapterHead('04','劳作','HANDS & HEARTS','土地之外，<br>还有一双双手。','从日常照料到采收整理，品质不是只在报告里发生，也发生在每一次细小的操作里。')}<div class="labor-grid"><figure class="labor-photo">${image(work,'2025年5月13日西藏林芝米瑞乡姆多村天旺基地起球采收真实纪实')}<figcaption>2025.05.13 西藏林芝米瑞乡姆多村基地 · 藏族村民与生产团队起球分选现场实录</figcaption></figure><div class="labor-text"><p class="eyebrow">GROWN WITH CARE</p><h3>手知道，<br>每一朵花的分量。</h3><p>把镜头交还给现场。看一朵花如何被照料、采下、整理，也看见那些平日里不在镜头中央的人。</p><div class="work-focus"><span class="eyebrow">THIS SEASON / 当季劳作</span><strong data-season-field="work">${autumn.work}</strong><p data-season-field="work_text">${autumn.work_text}</p></div><div class="people-line">${image(press,'2025年4月9日人民日报社记者在基地现场调研专访')}<p><b>国家级党媒见证 · 扎根雪域实干</b>2025.04.09 《人民日报》记者现场专访 · 5.21 第17版整版刊发<br><span class="small">陈兵雄团队十年扎根 · 真实实证已核准归档</span></p></div>${link('/site/brand/labor.html','走近劳作与人')}</div></div>

<div style="margin-top:44px;border-top:1px solid var(--tw-line);padding-top:36px">
  <div class="chapter-label" style="margin-bottom:12px"><span class="number" style="font-size:28px">04.1</span><b>基地的重新定义 / THE FOUR LIVE SITES</b></div>
  <h4 style="font:23px var(--tw-serif);margin-bottom:10px">林芝10亩不是产能基地，而是西藏藏红花的“四大现场”。</h4>
  <p style="font-size:13px;color:var(--tw-muted);line-height:2;max-width:760px">未来林芝不再负责把藏红花“种得更多”，而是负责把藏红花“做得更好”。10亩的价值不是产量，它证明的不是西藏能够生产多少，而是：<strong>西藏能够创造出什么样的藏红花新品质。</strong></p>
  <div class="four-sites-grid">
    ${content.strategy.four_sites.map(fs => `
      <div class="site-box">
        <span class="site-badge">${esc(fs.tag)}</span>
        <h4>${esc(fs.name)}</h4>
        <p>${esc(fs.desc)}</p>
      </div>
    `).join('')}
  </div>
  <div style="margin-top:14px"><a class="link" href="/site/brand/strategy.html#four-sites">深入了解四大现场与林芝种质创新源点<span aria-hidden="true">↗</span></a></div>
</div>

</div></section>

<section id="products" class="chapter" data-chapter="products" data-time-scale="annual"><div class="wrap">${chapterHead('05','产物','THE FRUITS OF TIME','时间的馈赠，<br>有不止一种模样。','从球茎、花与叶，到花丝、整朵干花和深加工产品。先看见实物，再理解它的价值。')}<p class="season-context">一年中的植物形态 / <span data-season-field="product">${autumn.product}</span></p>

<div class="product-grid">
  <article class="product-card">
    <div class="product-photo flower">${image(flower,'植物花朵中的红色柱头参考特写')}<span class="photo-label">柱头植物参考 · 非商品实拍</span></div>
    <div class="product-index"><span>01 / THE STIGMA</span><span>特级花丝</span></div>
    <h3>一花之中，细细取之。</h3>
    <p>色价实测达246，西红花苷含量达26.43%，39项农残零检出。晨曦初绽抢收，三裂喇叭口完整，入水金黄明澈。</p>
    ${link('/site/products/index.html#threads','了解特级花丝')}
  </article>
  <article class="product-card">
    <div class="product-photo whole">${image(flower,'完整藏红花植物参考实拍')}<span class="photo-label">鲜花植物参考 · 非干花成品</span></div>
    <div class="product-index"><span>02 / THE WHOLE FLOWER</span><span>鲜朵干燥花</span></div>
    <h3>留住一朵花的完整。</h3>
    <p>颠覆仅取花丝传统，全花原态低温锁鲜干燥，完整保留紫色花瓣、金黄雄蕊与红色柱头，兼具艺术观赏与清雅花茶风味。</p>
    ${link('/site/products/index.html#whole','认识整朵干花')}
  </article>
  <article class="product-card">
    <div class="product-photo document">${image(notice,'项目公告页中的产品目录，非高清商品摄影')}<span class="photo-label">项目产品资料 / 原页影像</span></div>
    <div class="product-index"><span>03 / FURTHER EXPLORATION</span><span>高精深加工</span></div>
    <h3>从一朵花，继续探索。</h3>
    <p>藏红花多糖、多酚、超低温冷萃精粹，以及高原咖啡、汉方草本养生茶包。严格恪守食品安全规范与科研边界。</p>
    ${link('/site/products/index.html#research','了解深加工与研究')}
  </article>
</div>

<div class="field-gallery" style="margin:32px 0 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
  <div style="background:#fff;border:1px solid var(--tw-line);border-radius:8px;padding:12px;overflow:hidden;">
    <img src="/site/assets/real-field/corm-harvest-2025.jpg" alt="2025.05.13 米瑞乡姆多村种球起地硕果" style="width:100%;height:160px;object-fit:cover;border-radius:6px;">
    <p style="font-size:12px;font-weight:600;margin:8px 0 2px;color:var(--tw-dark);">种球起地实录 · 单球重>25g</p>
    <p style="font-size:11px;color:var(--tw-muted);margin:0;">2025.05.13 姆多村基地 · 专用土培基质繁育</p>
  </div>
  <div style="background:#fff;border:1px solid var(--tw-line);border-radius:8px;padding:12px;overflow:hidden;">
    <img src="/site/assets/real-field/peoples-daily-press-2025.jpg" alt="人民日报现场专访" style="width:100%;height:160px;object-fit:cover;border-radius:6px;">
    <p style="font-size:12px;font-weight:600;margin:8px 0 2px;color:var(--tw-dark);">人民日报记者专访 · 5.21整版</p>
    <p style="font-size:11px;color:var(--tw-muted);margin:0;">2025.04.09 央媒党媒现场纪实报道</p>
  </div>
  <div style="background:#fff;border:1px solid var(--tw-line);border-radius:8px;padding:12px;overflow:hidden;">
    <img src="/site/assets/real-field/customs-inspection-2025.jpg" alt="林芝海关现场检疫" style="width:100%;height:160px;object-fit:cover;border-radius:6px;">
    <p style="font-size:12px;font-weight:600;margin:8px 0 2px;color:var(--tw-dark);">海关出境检疫 · 出口加拿大</p>
    <p style="font-size:11px;color:var(--tw-muted);margin:0;">2025.05.20 林芝海关关员现场查验</p>
  </div>
</div>

<div class="visit-guide-box">
  <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:10px">
    <h3 style="margin:0">林芝天旺农牧藏红花科技馆 · 官方唯一线下直营实体</h3>
    <span style="font-size:11px;color:var(--tw-purple);background:#f6edf7;padding:3px 10px;border-radius:12px;font-weight:600">官方核准真实坐标</span>
  </div>
  <p style="font-size:12px;color:var(--tw-muted);line-height:2;margin-top:10px">位于西藏自治区林芝市巴宜区米瑞乡广久村路口、天旺农牧藏红花生产基地内。天旺农牧郑重提示：本公司未向任何单位或个人授予分销代理，请通过基地科技馆或官方核验渠道购买正品。</p>
  <div class="visit-grid">
    <div class="visit-cell">
      <strong>📍 官方地理坐标</strong>
      <span>北纬 29.476311°，东经 94.554110°</span>
    </div>
    <div class="visit-cell">
      <strong>🗺️ 高德地图导航</strong>
      <span>搜索 <strong>“藏红花科技馆”</strong>（已注册正式地点）</span>
    </div>
    <div class="visit-cell">
      <strong>🚗 百度地图导航</strong>
      <span>搜索 <strong>“林芝天旺农牧藏红花研发基地”</strong>（同一地点）</span>
    </div>
  </div>
  <div style="margin-top:16px"><a class="link" href="/site/announcements.html">查看官方公报法律声明全文与防伪核验指引<span aria-hidden="true">↗</span></a></div>
</div>

<div class="evidence-line"><div><strong>品质与实证，应当有据可循。</strong><p>15 项国家级检验报告、海关出境检疫、劲酒全球37选1指纹图谱基准与党媒纪实，放在一起阅读。</p></div>${link('/site/brand/evidence.html','打开品质证据档案')}</div></div></section>
</main>${foot}${end}`;

const routes = {};
routes['index.html'] = home;

function detail(file, section, title, dek, body) {
  const s = content.sections.find(item => item.id === section);
  const eyebrow = s ? `${s.name} / ${s.en}` : 'TIANWANG · STRATEGY & FIELD NOTES';
  routes[file] = `${head(title, dek)}${nav}<main id="main" class="wrap"><header class="detail-hero"><a class="back-link" href="/#${section || 'origin'}">← 返回${s?.name || '首页'}</a><p class="eyebrow" style="margin-top:27px">${eyebrow}</p><h1>${title}</h1><p>${dek}</p></header><div class="detail-layout"><article class="article">${body}</article><aside class="detail-aside"><h3>继续阅读</h3><a href="/site/brand/strategy.html">产业发展战略 ↗</a>${content.sections.map(item => `<a href="${item.detail}">${item.name} <span aria-hidden="true">↗</span></a>`).join('')}<a href="/site/cognition/science.html">三大活性分子科学 ↗</a><a href="/site/brand/evidence.html">品质与证据 ↗</a><a href="/site/announcements.html">官方公报与科技馆 ↗</a><p>新版预览：照片与事实分开管理，未核验内容不视为已批准的品牌事实。</p></aside></div></main>${foot}${end}`;
}

// 1. 产业发展战略专页 (site/brand/strategy.html)
detail('site/brand/strategy.html', 'origin', '天旺农牧西藏藏红花<br>产业发展战略方案', '西藏创造 · 全国验证 · 全球共享 —— 以种质创新为核心，以基地＋营销为载体，以标准与专利为引擎，打造全球领先的藏红花产业品牌。让世界看见中国的高品质藏红花。', `
<div class="strategy-banner">
  <p class="quote">“西藏藏红花：不是把所有产能留在西藏，而是把最不可替代的能力留在西藏。”</p>
  <p class="quote-author">天旺农牧产业战略终极核心命题</p>
</div>

<figure class="strategy-img-box">
  <img src="${strategyMap}" alt="天旺农牧西藏藏红花产业发展战略图：西藏创造·全国验证·全球共享" data-zoomable>
  <div class="caption">
    <span>天旺农牧“西藏藏红花”产业发展战略全景图（点击全屏沉浸预览）</span>
    <span class="zoom-hint" style="position:static;display:inline-block">点击放大 ⛶</span>
  </div>
</figure>

<h2>战略五大支柱</h2>
<div class="strategy-pillars">
  <div class="pillar-card"><small>01 / CREATION</small><strong>西藏创造</strong><p>定义新品质 · 依托西藏特殊生态环境，在10亩四大现场沉淀不可替代的核心种质资源与技术标准。</p></div>
  <div class="pillar-card"><small>02 / VALIDATION</small><strong>全国验证</strong><p>跨区域实践 · 以亳州、德州为实践场，长期检验核心种源的遗传基础与性状稳定性。</p></div>
  <div class="pillar-card"><small>03 / SCALING</small><strong>全国扩繁</strong><p>放大新产能 · 西藏定义品质，全国放大产能。10亩回答“为什么”，全国网络回答“多少”。</p></div>
  <div class="pillar-card"><small>04 / MARKET</small><strong>基地＋营销</strong><p>事实转认知 · 天旺西藏藏红花文化传播中心作为价值转换器，基地生产事实，传播中心生产认知。</p></div>
  <div class="pillar-card"><small>05 / STANDARDS</small><strong>标准＋专利</strong><p>双引擎驱动 · 企标先行、地标推广、国标引领、国际标准共建，联合全球高品质产业力量。</p></div>
</div>

<h2>一、根本逻辑转变：从“西藏生产”走向“西藏创造”</h2>
<p>天旺不应把西藏的价值局限于：“能提供多少土地、种出多少吨藏红花”。而应该理解为：<strong>西藏特殊生态环境能够为藏红花创造什么样的新品质、形成什么样的自主种质资源。</strong></p>
<div class="strategy-banner" style="margin:20px 0">
  <p class="quote" style="font-size:17px">“西藏不是天旺藏红花产能的边界，而是天旺藏红花新品质的起点。”</p>
</div>
<p>产业推进逻辑彻底升级为六步战略闭环：</p>
<div class="research-note" style="font-size:15px;font-weight:600;color:var(--tw-purple);text-align:center">
  西藏创造 → 跨区域验证 → 全国扩繁 → 规模生产 → 市场放大 → 反哺西藏创新
</div>
<p>因此，“基地＋营销”实际上是这个产业模式在企业端的两个核心支点：<strong>基地负责创造产业价值，营销负责把产业价值推向市场。</strong></p>

<h2 id="four-sites">二、10亩：不是“小生产基地”，而是西藏藏红花的“四大现场”</h2>
<p>我们对林芝 10 亩基地做出明确战略定性：</p>
<div class="strategy-banner" style="margin:16px 0">
  <p class="quote" style="font-size:17px">“10亩证明的不是西藏能有多大的生产规模，而是西藏藏红花能够达到一个什么样的品质高度。”</p>
</div>
<p>四个“现场”分别回答了客户与市场最关切的四大核心命题：</p>
<div class="four-sites-grid">
  ${content.strategy.four_sites.map(fs => `
    <div class="site-box">
      <span class="site-badge">${esc(fs.tag)}</span>
      <h4>${esc(fs.name)}</h4>
      <p>${esc(fs.desc)}</p>
    </div>
  `).join('')}
</div>

<h2>三、品质高度的科学落地：两大核心资产</h2>
<p>10亩基地证明的“品质高度”，最终沉淀为两大不可替代的核心资产：</p>
<ul>
  <li><strong>第一：核心种质资源</strong> —— 经过西藏高寒极端微气候长期筛选、自主选育形成的核心种源。</li>
  <li><strong>第二：遗传基础与性状稳定性</strong> —— 经过长期跨代、跨区域数据验证，天旺核心种源的关键农艺性状与核心有效成分在不同繁育环境与生产条件下保持高度稳定，形成可面向全国扩繁的自主种质资源。</li>
</ul>

<h2>四、产业布局：两大核心，全国协同（全国扩繁与归藏定型的精准闭环）</h2>
<p>亳州、德州等外省基地不再是“西藏土地不足的补救方案”，而成为：<strong>“西藏藏红花种质资源走向产业化的实践场（产能联合体）”</strong>。</p>
<p>天旺将藏红花的植物物候周期在空间上实现了高度精密的<strong>双重品质保障闭环</strong>：</p>
<ul>
  <li><strong>全国扩繁·借地壮球（12月初至次年5月底）</strong>：在全国基地（亳州、德州等），利用内地丰沛土地与适宜积温，完成种球的地下营养生长（壮大子球与营养蓄积），同时验证西藏优选种源的遗传基础与性状稳定性；</li>
  <li><strong>回到西藏·开花定型（6月初至11月底）</strong>：<strong>所有成熟种球统一运回西藏林芝海拔 2945 米的大温室</strong>，完成休眠管理、花芽生理分化、悬空催花抽薹、洁净开花采收与锁鲜干燥。这一阶段深度借力西藏四大不可替代生境：<strong>①高空极净环境（物理级0农残屏障）</strong>、<strong>②剧烈昼夜温差（12℃~18℃锁香凝质）</strong>、<strong>③高海拔强紫外线辐射（激发生理防御机制，驱动西红花苷爆发富集）</strong>、<strong>④雅尼汇流局部温润水汽（保障抽薹与柱头舒展）</strong>。</li>
</ul>
<div class="research-note" style="font-size:15px;line-height:1.8">
  <strong>产业分工与品质定型法则：</strong><br>
  • <strong>以全国土地滋养种球，以西藏天地定型品质。</strong><br>
  • <strong>西藏创造，其他区域验证；西藏定义品质，其他区域放大产能。</strong><br>
  • <strong>10亩核心现场负责回答“为什么”；全国生产网络负责回答“多少”。</strong><br>
  <em>（核心保障：花丝真正绽放与活性成分聚积的全部生命阶段，100%发生在西藏高原微环境中。）</em>
</div>
<p>西藏核心区（林芝米瑞乡2945m）聚焦于种源库、花丝品质定型、选育研发、标准制定与核心产品生产；全国实践区（亳州、德州、新疆、四川、云南等）负责规模化生产与成本优化，保障稳定供应。</p>

<h2 id="dual-centers">五、“文化传播中心”角色定义：真实产业价值转换器</h2>
<p>“天旺农牧西藏藏红花文化传播中心”不应被理解为普通门店或接待中心，而是：<strong>西藏藏红花真实产业价值进入社会、进入消费者、进入客户和进入市场的转换器。</strong></p>
<p>它连接10亩生产现场与广阔市场，形成真实价值闭环：</p>
<div class="research-note" style="font-size:14px;font-weight:600;color:var(--tw-purple);text-align:center">
  生产事实 (基地) → 真实证据 → 文化解释 → 品牌认知 → 客户体验 → 市场交易
</div>
<p>这就是真正意义上的“基地＋营销”：<strong>基地生产事实，传播中心生产认知。</strong></p>

<h2>六、天旺与模仿者的本质区别</h2>
<div style="overflow-x:auto;margin:20px 0">
  <table style="width:100%;border-collapse:collapse;font-size:14px;background:#fff;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#f4edf5;color:var(--tw-purple)">
        <th style="padding:10px 12px;border:1px solid #e5dbe7;text-align:left">对比项</th>
        <th style="padding:10px 12px;border:1px solid #e5dbe7;text-align:left">模仿者（营销＋基地）</th>
        <th style="padding:10px 12px;border:1px solid #e5dbe7;text-align:left">天旺农牧（真实基地＋专业营销）</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:9px 12px;border:1px solid #eee;font-weight:600">产业起点</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:#777">流量 / 销售</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:var(--tw-purple);font-weight:600">真实生产事实</td>
      </tr>
      <tr>
        <td style="padding:9px 12px;border:1px solid #eee;font-weight:600">基地角色</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:#777">营销配角 / 拍照道具</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:var(--tw-purple);font-weight:600">核心事实与信任来源</td>
      </tr>
      <tr>
        <td style="padding:9px 12px;border:1px solid #eee;font-weight:600">种源掌控</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:#777">采购 / 贸易调货</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:var(--tw-purple);font-weight:600">自有10代选育核心种源</td>
      </tr>
      <tr>
        <td style="padding:9px 12px;border:1px solid #eee;font-weight:600">生产方式</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:#777">象征性 / 局部摆样</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:var(--tw-purple);font-weight:600">真实两段式生产体系</td>
      </tr>
      <tr>
        <td style="padding:9px 12px;border:1px solid #eee;font-weight:600">营销逻辑</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:#777">制造概念感与神秘感</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:var(--tw-purple);font-weight:600">真实生产事实与证据转译</td>
      </tr>
      <tr>
        <td style="padding:9px 12px;border:1px solid #eee;font-weight:600">核心竞争力</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:#777">场景运作与话术</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:var(--tw-purple);font-weight:600">核心种源 ＋ 技术 ＋ 硬核证据</td>
      </tr>
      <tr>
        <td style="padding:9px 12px;border:1px solid #eee;font-weight:600">扩张方式</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:#777">复制营销场景与噱头</td>
        <td style="padding:9px 12px;border:1px solid #eee;color:var(--tw-purple);font-weight:600">复制种源与标准化生产体系</td>
      </tr>
    </tbody>
  </table>
</div>
<div class="strategy-banner" style="margin:20px 0">
  <p class="quote" style="font-size:18px">“模仿者用营销证明基地，天旺用基地证明营销。”</p>
</div>
`);

// 2. 品牌缘起 (site/brand/history.html)
detail('site/brand/history.html', 'origin', '为何是林芝？<br>故事从这个问题开始。', '缘起不是先写一句漂亮的口号，而是寻找人与土地之间真实的联系。西藏是起点：不是产能的地理边界，而是新品质的风土与科技源点。', `
<h2>一个名字，一片土地。</h2>
<p>“让藏红花实至名归”是天旺的品牌命题。它需要由产地、实践与产品共同回答，而不只由名称回答。</p>

<div class="strategy-banner">
  <p class="quote">“西藏是起点：不是产能的地理边界，而是新品质的风土与科技源点。”</p>
  <p class="quote-author">天旺十年走来 · 产业组织模式的本质跃迁</p>
</div>

<h2>十年走来，五个章节。</h2>
${timeline}

<figure class="detail-figure">${image(people,'项目既有现场交流照片')}<figcaption>项目现场交流照片；天旺团队扎根林芝米瑞乡十载。</figcaption></figure>

<h2>史料考证：1765 与 261 年的宿命</h2>
<p>已核准史料口径：1765年清代著名药学家赵学敏出版《本草纲目拾遗》，首次在国家级医学典籍中正式定立“藏红花”之名。以2026年计，距今已整整 261 年。</p>
<p>历史上“藏”名虽定，西藏曾长期为空承其名；天旺扎根林芝十年，从第一阶段“创业型全功能基地”成功实现落地量产，到第二阶段跨入“优质种质资源创新基地”，打破了261年“名在西藏、花未归藏”的历史缺憾，让藏红花实至名归。</p>
${link('/site/brand/strategy.html','查阅天旺产业发展战略蓝图')}
`);

// 3. 风土机制 (site/brand/terroir.html)
detail('site/brand/terroir.html', 'terroir', '读一片土地，<br>要读完它的一年。', '林芝巴宜区米瑞乡姆多村 · 2945m。按任务书产地锚点建立记录，从宏观风土深入微风土与根域。', `
<figure class="detail-figure"><img src="/site/assets/tianwang-ecosystem-animated.gif" alt="西藏林芝米瑞乡产地生态动态全景" data-zoomable style="border-radius:8px;cursor:zoom-in"><figcaption>西藏林芝米瑞乡姆多村 2945m 雅尼两江汇流与苯日神山风土动态全景（点击全屏沉浸预览）。</figcaption></figure>

<h2>从产区风土，进入“微风土”与根域。</h2>
<p>风土并不只是宏观的“西藏”或“林芝”。在姆多村基地，雅鲁藏布江与尼洋河汇流形成的河谷阶地、河漫滩冲积沉积、透气沙壤与苯日神山微气候，构成了具体的<strong>微风土系统</strong>。我们关注地下 20–30cm 种球真正经历的根域水、气、温与微生物环境，追溯植物生理响应的真实来源。</p>

<h2>八维全维生境机制因果矩阵</h2>
<div class="terroir-matrix">
  ${content.terroir_dimensions.map(td => `
    <div class="terroir-item">
      <span class="tag">${esc(td.tag)}</span>
      <h4>${esc(td.name)}</h4>
      <p>${esc(td.desc)}</p>
    </div>
  `).join('')}
</div>

<h2>科技风土：让风土变得可认知。</h2>
<p>科技不是对自然风土的替代，而是利用现代检测与生理观察，把自然风土中原本不可见的变量、过程和差异识别出来。一朵花的品质不是凭空产生的，而是“自然环境提供可能性，技术识别可能性，植物产生响应，产品形成差异，检测证明差异”。</p>
<div class="research-note">基于《西藏农业认知本体论 V1.1》，本页记录微地形、冲积土壤剖面与 8 维气象数据，持续完善因果链。</div>
`);

// 4. 四季生命节律 (site/cognition/lifecycle.html)
detail('site/cognition/lifecycle.html', 'seasons', '一朵花的四季，<br>不只在花开的那一刻。', '春长夏眠秋花冬生，是任务书确定的一年叙事。具体月份与物候紧密结合姆多村基地十代驯化农艺实录。', `
<div style="background:#fff;border:1px solid var(--tw-line);border-radius:12px;padding:20px;margin-bottom:28px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span class="eyebrow" style="margin:0">ANIMATED LIFE CYCLE · 动态演变</span>
    <a href="/site/cognition/saffron-lifecycle-animation.html" target="_blank" style="font-size:12px;color:var(--tw-purple);text-decoration:none">全屏打开动画 ↗</a>
  </div>
  <iframe src="/site/cognition/saffron-lifecycle-animation.html" style="width:100%;height:560px;border:0;border-radius:8px" title="藏红花的一生三株动态演变动画"></iframe>
</div>

<figure class="detail-figure">${image(flower,'有署名的藏红花植物参考摄影')}<figcaption>植物参考实拍，不标作基地当季记录。摄影授权见影像来源页。</figcaption></figure>

${content.seasons.map(s => `
  <h2>${s.label}（${s.months}）· ${s.organ}</h2>
  <p><strong>物候特征：</strong>${s.phenology}</p>
  <p>${s.text}</p>
  <p class="small" style="color:var(--tw-purple)">农事操作重点：${s.work} —— ${s.work_text}</p>
`).join('')}

<h2>四季不是四张互不相关的照片。</h2>
<p>叶、花与球茎是同一生命的不同观察窗口。新版用共享季节状态连接风土、植株、劳作和产物，完整串联从种质繁育到采收锁鲜的全流程。</p>
${link('/site/cognition/science.html','深入理解藏红花三大核心活性化学分子')}
`);

// 5. 科学与活性分子机制 (site/cognition/science.html)
detail('site/cognition/science.html', 'seasons', '藏红花科学：<br>三大核心化学成分与分子机制', '藏红花的色、香、味与药理活性，来源于其独特的次生代谢物网络。现代生物化学将藏红花品质解耦为三大核心标志性化合物。', `
<h2>三大标志性活性化合物</h2>
<div class="terroir-matrix" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
  <div class="terroir-item" style="border-top:3px solid #e11d48">
    <span class="tag" style="background:#ffe4e6;color:#be123c">测定波长: 440nm · 颜色与抗氧化</span>
    <h4>西红花苷 (Crocin I & II)</h4>
    <p>罕见的水溶性双糖基类胡萝卜素。赋予花蕊金红纯正色泽，入水迅速融解为清澈帝王金黄。现代药理证实其具有高穿透力抗氧化、清除自由基及心脑神经保护机制。天旺西红花苷(I+II)实测达26.43%，色价高达246。</p>
  </div>
  <div class="terroir-item" style="border-top:3px solid var(--tw-purple)">
    <span class="tag" style="background:#f3e8ff;color:#7e22ce">测定波长: 257nm · 滋味与代谢调节</span>
    <h4>西红花苦苷 (Picrocrocin)</h4>
    <p>单萜单糖苷前体物质，赋予藏红花标志性的清凉微苦与回甘风味。在烹饪中作为天然鲜味增效剂；在体内代谢生成西红花醛，参与血液活性调节。</p>
  </div>
  <div class="terroir-item" style="border-top:3px solid #0284c7">
    <span class="tag" style="background:#e0f2fe;color:#0369a1">测定波长: 330nm · 芳香与精神抚慰</span>
    <h4>西红花醛 (Safranal)</h4>
    <p>烘干过程中由苦素水解脱水生成的单萜挥发醛。散发独特的干燥蜂草与微带金属质感的泥土芳香。研究证实能透过血脑屏障，舒缓焦虑、改善睡眠质感。</p>
  </div>
</div>

<h2>工业级指纹图谱：劲酒全球37选1的科学底本</h2>
<p>劲牌有限公司技术中心建立的现代中药指纹图谱，是工业化中药材品质认定的黄金标准。劲牌恪守“产非其地，采非其时坚决不用”的严苛原则，从全球37家藏红花供应商中多轮严筛，天旺成为惟一中标供应商。</p>
<p>劲酒采用高效液相色谱（HPLC）对天旺中标底本进行全波长扫描建立SSOT全息指纹图谱：以特征峰定性鉴别真实产地与采收时令，以峰面积整体把控有效成分均一性。要求天旺供货全批次与该指纹图谱吻合率达到极高水平，从源头确保了工业化生产的道地药材品质。</p>

<div class="evidence-line"><div><strong>查阅15项国家级CMA/CNAS全量检测报告</strong><p>色价246、39项农残零检出、重金属未检出完整报告归档。</p></div>${link('/site/brand/evidence.html','进入证据档案')}</div>
`);

// 6. 劳作与人 (site/brand/labor.html)
detail('site/brand/labor.html', 'labor', '看见花，<br>也看见照料花的人。', '把品牌史落实到日常，把劳作落实到每一双真实的手。林芝姆多村不是产能基地，而是西藏藏红花的“四大现场”。', `
<figure class="detail-figure">${image(work,'项目既有架盘劳作照片')}<figcaption>2025.05.13 西藏林芝米瑞乡姆多村天旺基地 · 藏族村民与生产团队起球分选现场实录</figcaption></figure>

<h2>基地的重新定义：林芝姆多村的“四大现场”</h2>
<p>天旺农牧西藏藏红花优质种质资源创新基地位于林芝市巴宜区米瑞乡姆多村，海拔2945米。未来，林芝不再负责把藏红花“种得更多”，而是负责把藏红花“做得更好”。10亩的核心价值是：</p>
<div class="four-sites-grid">
  ${content.strategy.four_sites.map(fs => `
    <div class="site-box">
      <span class="site-badge">${esc(fs.tag)}</span>
      <h4>${esc(fs.name)}</h4>
      <p>${esc(fs.desc)}</p>
    </div>
  `).join('')}
</div>

<h2>国家级党媒与海关实地见证</h2>
<p>2025年4月9日，《人民日报》社记者深入林芝米瑞乡姆多村天旺基地现场专访调研；2025年5月21日，《人民日报》第17版整版刊发专题报道，深度聚焦天旺十年扎根雪域高原、科技兴农与道地中药材培育实践。</p>
<p>2025年5月20日，林芝海关关员亲赴基地执行现场检验检疫，签发《植物检疫证书》（CMP-001），天旺特级西藏藏红花批次合格直通海外出口加拿大温哥华。</p>

<h2>农牧民增收：每年30万元薪资直达花农</h2>
<p>天旺实行“公司＋创新基地＋农户”的产业组织模式。姆多村与广久村的藏族阿妈们经过两段式种植规范培训，成为熟练的现代农业产业工人。每年直接向当地农牧民发放务工与分红超过30万元，以高附加值产业切实反哺雪域乡村振兴。</p>
${link('/site/brand/strategy.html','查阅天旺产业发展战略')}
`);

// 7. 产物体系 (site/products/index.html)
detail('site/products/index.html', 'products', '从一朵花，<br>看见不同的产物。', '先讲清楚它是什么，再讲清楚有哪些证据。西藏是起点：从极品花丝、全花鲜品到现代深加工与工业底本。', `
<h2 id="threads">01 · 特级藏红花花丝 (Premium Threads)</h2>
<p>花丝来自藏红花花朵中的三裂深红柱头。天旺坚持在晨曦破晓前采收初绽花蕾，当日手工剥离柱头，严格控温快速锁鲜干燥。</p>
<figure class="detail-figure">${image(flower,'藏红花柱头与花瓣植物参考实拍')}<figcaption>植物花朵特写参考实拍；天旺花丝色价实测达 246，西红花苷含量达 26.43%。</figcaption></figure>

<h2>鉴真防伪三步法则</h2>
<div class="terroir-matrix">
  ${content.verification_rules.map(vr => `
    <div class="terroir-item">
      <span class="tag">${esc(vr.step)}</span>
      <h4>${esc(vr.title)}</h4>
      <p>${esc(vr.desc)}</p>
    </div>
  `).join('')}
</div>

<h2 id="whole">02 · 鲜朵原态干燥花 (Whole Dried Flower)</h2>
<p>颠覆传统仅取柱头、废弃花瓣的做法，首创整朵鲜花原态真空冷冻干燥工艺。完整保留紫色花瓣、金黄雄蕊与红色柱头，遇水重新绽放如初开，兼具高雅艺术美学与花茶冲饮体验。</p>

<h2 id="research">03 · 现代科技高精深加工 (Advanced Bio-Extraction)</h2>
<p>项目材料涉及藏红花多糖、多酚、超低温冷萃精粹等高精产品方向，以及高原藏红花咖啡与草本养生茶包。包装、规格与在售状态严格依规核验披露。</p>
<div class="research-note"><strong>科学研究边界：</strong>斑马鱼等模式生物研究属于食品原料活性机理探索，不能直接等同于人体治疗功效。本公司严格恪守国家食品安全法律法规，不宣称疾病治疗功效。</div>

<h2>04 · 工业级中药原料 SSOT 底本</h2>
<p>从全球37家供应商中脱颖而出，成为劲酒惟一原料中标者。天旺以现代中药高效液相指纹图谱全息质控为验收底本，向国内外顶尖中药与大健康工业伙伴提供道地药材与标准输出。</p>

<h2>实体探访与科技馆直营</h2>
<p>西藏自治区林芝市巴宜区米瑞乡姆多村天旺基地内的“藏红花科技馆”（GPS: 29.476311° N, 94.554110° E）是天旺农牧目前唯一直接面向社会公众零售的线下实体场所。本公司未设立任何外部销售代理，守护消费者正品权益。</p>
${link('/site/announcements.html','查看官方公报法律声明全文')}
`);

// 8. 品质与证据档案 (site/brand/evidence.html)
detail('site/brand/evidence.html', 'products', '每一项品质，<br>都应找到它的依据。', '天旺藏红花 15 项全量第三方权威检验、工业级指纹图谱与合规资质凭证档案。', `
<div class="strategy-banner">
  <p class="quote">“标准＋专利——固化新优势：从企业标准走向地标、国标与国际标准。”</p>
  <p class="quote-author">天旺农牧品质合规核心准则</p>
</div>

${content.evidence.map(e => `
  <div class="evidence-card">
    <strong>${esc(e.title)}</strong>
    <span class="metric">${esc(e.display)}</span>
    <p>${esc(e.description)}</p>
    <p class="small">机构与编号：${esc(e.source)} · 证据层级：官方核准凭证</p>
  </div>
`).join('')}

<h2>如何科学阅读一份检测报告？</h2>
<ul>
  <li><strong>资质认定</strong>：先看报告出具机构是否具备国家级 CMA 资质认定与 CNAS 实验室认可资质。</li>
  <li><strong>数据含义</strong>：“未检出”指实测含量低于当前最精密的质谱仪定量下限（LOQ），代表极度纯净。</li>
  <li><strong>源头水土</strong>：林芝基地土壤 pH 5.94 弱酸沙质土壤（滴滴涕、六六六未检出），冰川雪水悬浮物 &lt;4mg/L，铸就纯净源头。</li>
  <li><strong>工业质控</strong>：与劲牌技术中心建立的 HPLC 中药指纹图谱对标，实现批次品质一致性交付。</li>
</ul>
`);

// 9. 农艺与两段式种植 (site/brand/agronomy.html)
detail('site/brand/agronomy.html', 'labor', '天旺农牧“西藏藏红花两段式种植法”<br>借地长球 · 归藏定质', '把藏红花不同生长阶段对环境的不同需求，与西藏和内地各自的资源优势进行精准匹配。', `
<div class="strategy-banner">
  <p class="quote">“借地长球 · 归藏定质 —— 以全国土地滋养种球，以西藏天地定型品质。”</p>
  <p class="quote-author">天旺农牧 · 西藏藏红花特有版两段式农艺核心定义</p>
</div>

<h2>一、核心本质：打破单一地理局限的精准环境匹配</h2>
<p>天旺农牧“西藏藏红花两段式种植法”的本质，绝非简单地“把种植过程切成两半放到两地”，而是**双轨生物学分工**：</p>
<div class="research-note" style="font-size:15px;line-height:1.8">
  <strong>农艺学分工黄金法则：</strong><br>
  • <strong>种球决定能开多少花（繁育潜能与数量基础）；</strong><br>
  • <strong>西藏决定开出什么品质的花（有效成分与品质高度）！</strong>
</div>

<h2>二、三层底层逻辑：种质基础 ➔ 规模产能 ➔ 产品品质</h2>
<p>这套农艺规程彻底厘清了种质、产能与最终品质之间的因果边界：</p>
<div class="terroir-matrix" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin:20px 0">
  <div class="terroir-item" style="border-top:3px solid var(--tw-purple)">
    <span class="tag" style="background:#f3e8ff;color:#7e22ce">第一层 · 西藏林芝</span>
    <h4>① 西藏育种：决定【种质基础】</h4>
    <p>解决“种什么/好不好”。在林芝海拔2945米历经十年十代本土逆境驯化与筛选淘汰，形成兼具“高品质、高适应性、高稳定性、良好繁育潜能”的核心自主种质资产。</p>
  </div>
  <div class="terroir-item" style="border-top:3px solid #2d6a4f">
    <span class="tag" style="background:#edf7f1;color:#2d6a4f">第二层 · 全国合作基地</span>
    <h4>② 全国扩繁：形成【规模产能】</h4>
    <p>解决“有多少/够不够”。12月初至5月底地下营养生长黄金期，借内地深厚沙壤、适宜积温与低成本劳动力，高效分蘖膨大，做大优质种球基数，形成坚固产能联合体。</p>
  </div>
  <div class="terroir-item" style="border-top:3px solid #c88a35">
    <span class="tag" style="background:#fbf5ea;color:#c88a35">第三层 · 归藏大温室</span>
    <h4>③ 归藏定质：形成【产品品质】</h4>
    <p>解决“品质高不高”。6月初至11月底成熟种球统一步骤冷链归藏。在西藏设施温室中深度借力极净环境、剧烈日温差与强紫外线，完成次生代谢爆发、开花采摘与锁鲜定型。</p>
  </div>
</div>

<div style="margin:24px 0;text-align:center">
  <a class="link" href="/site/brand/two-stage-method.html" style="font-size:16px;font-weight:700">查阅天旺“两段式种植法：借地长球·归藏定质”逻辑全景图与SVG拓扑 ⛶</a>
</div>

<h2>三、此法的高明之处：百年农艺形态超越</h2>
<ul>
  <li><strong>01 / 双轨生物学分工（解耦“长球”与“开花”）</strong>：种球管营养蓄能，生境管药效定型，避免同一土地相互透支。</li>
  <li><strong>02 / 从“同地分时”到“跨域时空双解耦”</strong>：日本竹田农法（源头）与崇明模式局限于单一地理空间。天旺实现时间与空间的彻底解耦，为全球适生区提供了全新范本。</li>
  <li><strong>03 / 从“单一被动风土”走向“多维主动组合风土（Composite Terroir）”</strong>：将平原土地效率与高原极地品质进行乘法级拼合，创造了单一地域无法企及的品质高度。</li>
  <li><strong>04 / 产业链去中心化防灾风控</strong>：多地协同分散农业气象与生物安全风险，构筑分布式产业防御体系。</li>
</ul>

<h2>四、坦诚硬核的“战略成本壁垒”</h2>
<p>此法必须主动承担不可偷懒的两大系统成本：<strong>① 十年扎根西藏逆境驯化淘汰的沉没时间与科研成本</strong>；<strong>② 每年跨越数千公里的冷链流转时效控制与外省严格技术品控督导成本</strong>。正因天旺愿意付出这些沉重成本，换来的才是实打实经过验证的“0农残”、“超药典16%色价”以及全国土地支撑的稳定供给保障！</p>

<h2>五、双擎驱动法则与自研基质技术</h2>
<p>在西藏种植藏红花，面临着地中海原产地所没有的极端考验。天旺打出了一套<strong>“用棚式大田规避天灾，用极地生态代偿风土”</strong>的组合拳：</p>
<ul>
  <li><strong>规避端（保命底线）</strong>：西藏谷地夏季水热同季（易引爆尖苞镰刀菌导致球茎大面积腐烂）与冬春积温偏低。天旺以“棚式大田与两段式改良法”作为物理避雨盾和天然聚能环，人为复刻夏干热休眠，锁定冬春积温，阻断真菌爆发。</li>
  <li><strong>代偿端（品质上限）</strong>：西藏2945米高能阳光、极限昼夜温差（白天光合储糖，夜间呼吸停滞）、强紫外线激越（逼迫超量合成西红花素）与年轻冲积富矿沙壤，以狂野的高能势能，降维代偿了原产地安逸气候的不足。</li>
  <li><strong>自研土培基质</strong>：自主研发 CEA 专用固态营养土培基质，淘汰积温不足、极易霉烂的传统大田粗放地栽法；摒弃丧失矿物风土交换的纯水培路线，实现大球繁育（单球>25g）与花期精准调控。</li>
</ul>
${link('/site/brand/strategy.html','查阅天旺产业发展战略方案蓝图')}
`);

// 10. 官方公报 (site/announcements.html)
detail('site/announcements.html', null, '官方公报', '林芝天旺农牧产品有限公司 法定公告与权威公示发布平台。', `
<article class="notice-full" style="background:#fff;padding:36px 40px;border:1px solid var(--tw-line);border-radius:12px;margin-bottom:35px;box-shadow:0 2px 10px rgba(0,0,0,0.02)">
  <div style="border-bottom:2px solid #a4382c;padding-bottom:18px;margin-bottom:26px;text-align:center">
    <p style="color:#a4382c;letter-spacing:3px;font-size:11.5px;font-weight:700;margin:0">林芝天旺农牧产品有限公司 · 官方公报 (2026年08月26日)</p>
    <h1 style="font:29px/1.4 var(--tw-serif);margin:14px 0 6px;color:#1e2e23">关于“天旺农牧”品牌<br>藏红花产品销售及授权情况的声明</h1>
    <p class="small" style="margin:0;color:var(--tw-muted)">发布日期：2026年8月26日 · 归档分类：法定声明 (Official Statement)</p>
  </div>
  
  <p style="line-height:2">近期，根据有关市场监管部门的提示以及市场检查中发现的相关线索，林芝天旺农牧产品有限公司了解到，市场上存在涉嫌擅自使用、冒用“天旺农牧”品牌及相关商业信息，销售非本公司产品或来源不明藏红花产品的情况。</p>
  <p style="line-height:2">上述行为容易导致消费者对产品来源及经营主体产生混淆，并可能损害“天旺农牧”品牌声誉、消费者合法权益及正常市场经营秩序。</p>
  <p style="line-height:2">为明确“天旺农牧”品牌相关产品的市场销售、授权及经营主体情况，维护消费者合法权益和正常市场经营秩序，并为有关部门开展市场监管、调查核实及行政执法提供企业事实依据，林芝天旺农牧产品有限公司现就有关事项声明如下：</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">一、“天旺农牧”既是本公司企业字号，也是本公司旗下产品的主要品牌名称</h2>
  <p style="line-height:2">林芝天旺农牧产品有限公司是依法登记注册并持续开展经营活动的企业。“天旺农牧”既是本公司的企业字号，也是本公司旗下系列产品使用的主要品牌名称。本公司目前还拥有“天旺米瑞”等其他品牌。本次声明所涉及的品牌保护、产品销售、市场授权及相关权益维护，仅针对“天旺农牧”品牌，不涉及“天旺米瑞”等其他品牌。</p>
  <p style="line-height:2"><strong>“天旺农牧”品牌旗下产品主要包括：</strong></p>
  <ul>
    <li>藏红花干花丝；</li>
    <li>藏红花干花（带花丝）；</li>
    <li>藏红花多糖产品，包括独立包装产品及与香港宝芝林联名产品；</li>
    <li>藏红花多酚产品，包括独立包装产品及与香港宝芝林联名产品；</li>
    <li>藏红花咖啡；</li>
    <li>藏红花保健养生茶包。</li>
  </ul>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">二、本公司目前未向任何单位或个人授予“天旺农牧”品牌藏红花干花丝产品的销售代理、分销、代销等权益</h2>
  <p style="line-height:2"><strong>截至本声明发布之日，林芝天旺农牧产品有限公司未以任何形式向任何单位或个人授予“天旺农牧”品牌藏红花干花丝产品的总代理、区域代理、经销、分销、代销、加盟或其他形式的销售授权。</strong>本公司目前未向市场下发任何“天旺农牧”品牌藏红花干花丝产品的产品分销权、代销权或其他销售代理权益。</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">三、“藏红花科技馆”是本公司目前唯一直接面向市场和消费者开展零售的线下实体场所</h2>
  <p style="line-height:2"><strong>截至本声明发布之日，位于西藏自治区林芝市巴宜区米瑞乡广久村路口、天旺农牧藏红花生产基地内的“藏红花科技馆”，是林芝天旺农牧产品有限公司目前唯一直接面向社会公众及消费者开展“天旺农牧”品牌产品零售的线下实体场所。</strong></p>
  <div style="background:#f9f7f2;border:1px solid var(--tw-line);padding:16px 20px;border-radius:8px;margin:16px 0;font-size:13.5px">
    <strong>📍 地理导航与定位坐标核验指引：</strong><br>
    - <strong>官方地理坐标</strong>：北纬 <strong>29.476311°</strong>，东经 <strong>94.554110°</strong><br>
    - <strong>高德地图导航</strong>：搜索 <strong>“藏红花科技馆”</strong>（已注册正式地点）<br>
    - <strong>百度地图导航</strong>：搜索 <strong>“林芝天旺农牧藏红花研发基地”</strong>（同一地点）
  </div>

  <div style="border-top:1px solid var(--tw-line);margin-top:28px;padding-top:20px;text-align:right;font-size:13px;line-height:1.8;color:var(--tw-muted)">
    <p style="font-weight:700;color:var(--tw-ink);margin:0">林芝天旺农牧产品有限公司</p>
    <p style="margin:2px 0">统一社会信用代码：91540400MA6TCDCA38</p>
    <p style="margin:2px 0">法定代表人：陈美霞</p>
    <p style="margin:2px 0">企业注册地址：西藏自治区林芝市巴宜区米瑞乡姆多村42号</p>
    <p style="margin:2px 0">官方核验服务电话：13549044959</p>
    <p style="margin:2px 0">声明日期：2026年8月26日</p>
  </div>
</article>

<h2>公报发布与查验准则</h2>
<p>本公报系统发布的所有声明、公示与检疫凭证，均绑定可追溯的企业营业执照、检验检测报告或海关正本单证。社会公众与监管部门可凭公报内载明之经纬坐标、报告编号向有关部门或本公司进行核实。</p>
${link('/site/brand/evidence.html','查验15项全量品质检测档案')}
`);

// 11. 工作区系统边界说明 (site/workspace.html)
detail('site/workspace.html', null, '官网之外，<br>还有内容生长的地方。', '知识库操作系统、素材录入与公告系统继续保留。新版公开预览与内部业务数据隔离。', `
<h2>一份素材，多种表达。</h2>
<p>COM 传播、KNO 知识、VIS 视觉、DAT 数据与 BRD 品牌五类资产，为品牌传播、认知推广与通稿撰写提供材料。它们不会被官网五段替代。</p>
<div class="workspace-options">
  <a href="/os.html"><strong>知识库 OS ↗</strong><p>资产检索、内容整理与知识管理。</p></a>
  <a href="/mobile.html" id="intake"><strong>素材录入 ↗</strong><p>日常素材与原始记录的入口。</p></a>
</div>
<div class="research-note">当前为隔离的前台预览，不运行原系统的写库、自动提交或推送流程。上述入口在本预览中显示边界说明；工作区原 os.html、mobile.html 及后台代码未替换。</div>
<h2>公告与通稿不是“自动公开”。</h2>
<p>公开内容应引用批准后的资产版本。完整审批、撤回和通稿治理修复属于独立系统工作，不因首页更新而被宣称已经完成。</p>
`);

// 12. 影像与内容说明 (site/credits.html)
detail('site/credits.html', null, '影像与内容，<br>把出处写在旁边。', '我们区分参考实拍、项目影像与商品实拍，不把未知的信息包装成确定事实。', `
${content.media.map(m => `
  <h2>${m.id === 'flower' ? '植物参考摄影' : esc(m.caption)}</h2>
  ${m.id === 'flower' ? `
    <p>${esc(m.credit)}</p>
    <p><a href="${m.source_url}" target="_blank" rel="noopener noreferrer">原图与授权页面 ↗</a> · <a href="${m.license_url}" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0 ↗</a></p>
    <p>${esc(m.changes)}。版权人不因此为天旺背书。此许可仅适用于相关摄影及衍生图像，不代表整站代码均使用此许可。</p>
  ` : '<p>来自当前项目已有真实档案与现场实录。用于本地内部预览，未核验内容不视为已批准的品牌事实。</p>'}
`).join('')}

<h2>内容核验清单</h2>
${content.pending.map(p => `
  <details class="disclosure">
    <summary>${esc(p.value)}</summary>
    <p>${esc(p.reason)}</p>
  </details>
`).join('')}
<p>根蓝图为结构依据；本次任务书为内容要求。数据锚点在未经原件核对时，保留其待确认状态。</p>
`);

// 静态落盘与兼容条目生成
for (const [file, html] of Object.entries(routes)) {
  const dest = path.join(root, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

for (const file of ['site/index.html', 'portal.html']) {
  fs.writeFileSync(path.join(root, file), `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/"><meta name="robots" content="noindex"><title>天旺农牧</title></head><body><a href="/">前往新版官网</a></body></html>`);
}

console.log(`Generated ${Object.keys(routes).length} static pages and 2 compatibility entries.`);

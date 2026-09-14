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
const autumn = content.seasons.find(s => s.id === 'autumn');
const nav = `<a class="skip" href="#main">跳到正文</a><div class="wrap"><header class="top"><a class="brand" href="/"><img src="/site/assets/logo.jpg" alt="天旺农牧官方标志" class="brand-logo"><span><b>天旺农牧</b><small>TIANWANG · NYINGCHI</small></span></a><nav class="nav" id="main-nav" aria-label="五段主导航">${content.sections.map(s => `<a href="/#${s.id}" data-chapter="${s.id}">${s.name}</a>`).join('')}<a href="/site/ai/copilot.html" style="color:var(--tw-purple);font-weight:600">智能问答 ✨</a></nav><div class="top-tools"><a href="/site/ai/copilot.html" class="nav-ai">AI 品牌大脑 ✨</a><a href="/site/workspace.html">知识库 OS ↗</a><button class="nav-notice" data-open-notices>官方公报</button><button class="menu-button" data-menu aria-controls="main-nav" aria-expanded="false">目录 ☰</button></div></header><div class="preview-strip">新版预览 · 品牌素材授权与事实原件核验中</div></div>`;
const foot = `<footer class="footer"><div class="wrap"><div class="footer-top"><div><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><img src="/site/assets/logo.jpg" alt="天旺农牧官方标志" class="brand-logo" style="width:38px;height:38px"><div><p class="eyebrow" style="margin:0">ROOTED IN PLACE. GROWN WITH CARE.</p><p class="footer-title" style="margin:2px 0 0">让藏红花实至名归。</p></div></div><p class="small">西藏自治区林芝市巴宜区米瑞乡姆多村</p></div><nav class="footer-links" aria-label="更多内容"><a href="/site/brand/history.html">品牌缘起 ↗</a><a href="/site/brand/evidence.html">品质与证据 ↗</a><a href="/site/announcements.html">官方公报 ↗</a><a href="/site/ai/copilot.html">AI 品牌大脑 / 智能问答 ✨</a><a href="/site/workspace.html">知识库操作系统 ↗</a><a href="/site/workspace.html#intake">素材录入入口 ↗</a><a href="/site/credits.html">影像来源与内容说明 ↗</a></nav></div><div class="footer-bottom"><span>TIANWANG AGRICULTURE · 从土地，到一朵花。</span><span>植物参考摄影已署名 · 项目人物影像待授权 · <a href="/site/credits.html">查看说明</a></span></div></div></footer><dialog class="dialog" id="notice-dialog" aria-labelledby="notice-title"><div class="dialog-head"><div><p class="eyebrow">OFFICIAL GAZETTE</p><h2 id="notice-title">官方公报</h2></div><button class="close-dialog" data-close-notices aria-label="关闭官方公报">×</button></div><div class="notice-filters" aria-label="公告分类"><button data-notice-filter="all" aria-pressed="true">全部</button><button data-notice-filter="official" aria-pressed="false">官方声明</button><button data-notice-filter="quality" aria-pressed="false">品质公示</button></div><div id="notice-list"></div>${link('/site/announcements.html', '查看公报页面')}</dialog>`;
const head = (title, description) => `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f8f5ee"><title>${esc(title)} · 天旺农牧</title><link rel="icon" type="image/jpeg" href="/site/assets/logo.jpg"><link rel="apple-touch-icon" href="/site/assets/logo.jpg"><link rel="stylesheet" href="/site/css/website.css"></head><body class="tw-site">`;
const end = `<script type="module" src="/src/website/entry.js"></script></body></html>`;
const chapterHead = (number, name, en, title, aside) => `<div class="chapter-head"><div><div class="chapter-label"><span class="number">${number}</span><b>${name} / ${en}</b></div><h2 class="section-title">${title}</h2></div><p class="aside">${aside}</p></div>`;
const buttons = cls => content.seasons.map(s => `<button class="${cls}" data-season="${s.id}" aria-label="切换到${s.name}季" aria-pressed="${s.id === 'autumn'}">${cls === 'season-button' ? s.label : s.name}</button>`).join('');
const timeline = `<ol class="timeline">${content.milestones.map((m, i) => `<li><div><small>CHAPTER 0${i+1}</small><strong>${m.title}</strong></div><p>${m.text}</p></li>`).join('')}</ol>`;
const home = `${head('让藏红花实至名归', '缘起、风土、四季、劳作、产物。在林芝，重新认识一朵藏红花与土地、时间和人的关系。')}${nav}<main id="main">
<section id="origin" data-chapter="origin" data-time-scale="decade"><div class="wrap"><div class="hero"><div class="hero-copy"><p class="eyebrow">一片土地，一朵花，一年的好时光。</p><h1>一朵花的故事，<br>从<em>土地</em>开始。</h1><p class="mission">让藏红花实至名归</p><p class="intro">向下扎根，向光生长。<br>从林芝的风土，到四季的照料，<br>我们想讲述的，不止是花开时的美。</p>${link('#origin-story', '读懂天旺的缘起')}</div><figure class="hero-art">${image(flower, '紫色藏红花花瓣与红色柱头的植物参考实拍', 'hero-photo', true)}<div class="roundel" aria-hidden="true"><b>实至<br>名归</b><small>A SENSE OF PLACE</small></div><span class="art-side">CROCUS SATIVUS · 植物观察</span><figcaption class="photo-caption">01 / 藏红花植物参考实拍 · 非基地实拍 · <a href="/site/credits.html">摄影署名 ↗</a></figcaption></figure></div><div class="hero-bottom"><div class="location"><span>西藏 · 林芝 · 米瑞乡</span><span><strong>2945</strong><small>m / 任务书产地锚点</small></span></div><span class="scroll-hint">沿着时间，慢慢读下去 ↓</span></div><div id="origin-story" class="origin-story"><div><div class="chapter-label"><span class="number">01</span><b>缘起 / THE BEGINNING</b></div><h2 class="section-title">用十年，<br>回答一个名字。</h2><p class="story-intro">一个名字，连接一片土地。<br>从“为什么是林芝”的追问，到两段式种植与设施农业的探索，让真实的实践，成为品牌的起点。</p>${link('/site/brand/history.html', '走进品牌缘起')}<p class="photo-caption">十年叙事框架 · 具体年份与人物采访待核验</p></div><div>${timeline}</div></div></div></section>
<div class="annual-nav"><div class="wrap annual-inner"><div class="annual-title"><b>一年的时间</b><span>四段故事 · 同一轮四季</span></div><div class="season-switch" role="group" aria-label="选择四段共同的季节">${buttons('season-button')}</div><span class="annual-caption">点击季节，继续探索 →</span></div><span id="season-status" aria-live="polite" class="sr-only"></span></div>
<section id="terroir" class="chapter" data-chapter="terroir" data-time-scale="annual"><div class="wrap">${chapterHead('02','风土','A SENSE OF PLACE','不是每片土地，<br>都有相同的回答。','在雅尼两江汇流的生境里，观察温度、水、风与土壤，也看见它们如何参与一朵花的生长。')}<div class="terroir-grid"><div><figure class="place-image"><img src="/site/assets/tianwang-ecosystem-animated.gif" alt="西藏林芝米瑞乡·雅尼两江汇流与苯日神山生态认知动态全景" data-zoomable class="" loading="lazy" decoding="async"><span class="image-badge">林芝产地生态 · 动态全景</span><span class="zoom-hint">点击全屏沉浸预览 ⛶</span></figure><p class="photo-caption">林芝巴宜区米瑞乡姆多村 2945m 雅尼两江汇流生境动态全景图（支持点击全屏查看）</p></div><div><p class="eyebrow">NYINGCHI · MIRUI · MUDUO</p><div class="altitude"><b>2945</b><span>米 / 产地锚点</span></div><h3 class="place-title">林芝，米瑞乡。</h3><p class="place-deck">从雅尼汇流到脚下的土壤，风土不是一串孤立参数，而是一年里不断变化的生境。</p><div class="environment-tags">${['温度','日照','昼夜温差','水','风','真菌活跃期','虫害活跃期','杂草活跃期'].map(t=>`<span>${t}</span>`).join('')}</div><p class="season-context">当季观察 / <span data-season-field="environment">${autumn.environment}</span></p>${link('/site/brand/terroir.html','进一步认识这片土地')}</div></div></div></section>
<section id="seasons" class="chapter season-section" data-chapter="seasons" data-time-scale="annual"><div class="wrap">${chapterHead('03','四季','THE LIVING CALENDAR','春长，夏眠。<br>秋花，冬生。','花期很短，生命的故事很长。切换四季，看同一株植物如何走过一年。')}<div class="season-layout"><div><div class="calendar" role="group" aria-label="四季时间环"><div class="ring-center">${image(flower,'藏红花植物参考特写，图片不随季节冒充现场记录')}</div>${buttons('ring-button')}</div><p class="photo-caption" style="text-align:center">一年循环 / 中心图为秋花植物参考，不代表其他季节实拍</p></div><div class="season-copy"><p class="eyebrow" data-season-field="en">AUTUMN</p><p class="season-name" data-season-field="label">秋花</p><h3 data-season-field="title">${autumn.title}</h3><p data-season-field="text">${autumn.text}</p><div class="season-organ"><span>此刻，观察什么</span><span data-season-field="organ">${autumn.organ}</span></div>${link('/site/cognition/lifecycle.html','看见完整的生命节律')}<p style="margin-top:14px"><a class="link" href="/site/cognition/saffron-lifecycle-animation.html" target="_blank">观看“藏红花一生”三株生命周期动画<span aria-hidden="true">↗</span></a></p><p class="season-note" data-season-field="note">${autumn.note}</p></div></div></div></section>
<section id="labor" class="chapter" data-chapter="labor" data-time-scale="annual"><div class="wrap">${chapterHead('04','劳作','HANDS & HEARTS','土地之外，<br>还有一双双手。','从日常照料到采收整理，品质不是只在报告里发生，也发生在每一次细小的操作里。')}<div class="labor-grid"><figure class="labor-photo">${image(work,'2025年5月13日西藏林芝米瑞乡姆多村天旺基地起球采收真实纪实')}<figcaption>2025.05.13 西藏林芝米瑞乡姆多村基地 · 藏族村民与生产团队起球分选现场实录</figcaption></figure><div class="labor-text"><p class="eyebrow">GROWN WITH CARE</p><h3>手知道，<br>每一朵花的分量。</h3><p>把镜头交还给现场。看一朵花如何被照料、采下、整理，也看见那些平日里不在镜头中央的人。</p><div class="work-focus"><span class="eyebrow">THIS SEASON / 当季劳作</span><strong data-season-field="work">${autumn.work}</strong><p data-season-field="work_text">${autumn.work_text}</p></div><div class="people-line">${image(press,'2025年4月9日人民日报社记者在基地现场调研专访')}<p><b>国家级党媒见证 · 扎根雪域实干</b>2025.04.09 《人民日报》记者现场专访 · 5.21 第17版整版刊发<br><span class="small">陈兵雄团队十年扎根 · 真实实证已核准归档</span></p></div>${link('/site/brand/labor.html','走近劳作与人')}</div></div></div></section>
<section id="products" class="chapter" data-chapter="products" data-time-scale="annual"><div class="wrap">${chapterHead('05','产物','THE FRUITS OF TIME','时间的馈赠，<br>有不止一种模样。','从球茎、花与叶，到花丝、整朵干花和深加工产品。先看见实物，再理解它的价值。')}<p class="season-context">一年中的植物形态 / <span data-season-field="product">${autumn.product}</span></p><div class="product-grid"><article class="product-card"><div class="product-photo flower">${image(flower,'植物花朵中的红色柱头参考特写')}<span class="photo-label">柱头植物参考 · 非商品实拍</span></div><div class="product-index"><span>01 / THE STIGMA</span><span>花丝</span></div><h3>一花之中，细细取之。</h3><p>从花朵中的红色柱头，认识花丝的来源。商品级高清实拍与批次信息待补录。</p>${link('/site/products/index.html#threads','了解花丝')}</article><article class="product-card"><div class="product-photo whole">${image(flower,'完整藏红花植物参考实拍')}<span class="photo-label">鲜花植物参考 · 非干花成品</span></div><div class="product-index"><span>02 / THE WHOLE FLOWER</span><span>鲜朵干燥花</span></div><h3>留住一朵花的完整。</h3><p>把视线从花丝扩展到整朵花。干燥工艺、形态保留与成品，应由真实产品记录说明。</p>${link('/site/products/index.html#whole','认识整朵干花')}</article><article class="product-card"><div class="product-photo document">${image(notice,'项目公告页中的产品目录，非高清商品摄影')}<span class="photo-label">项目产品资料 / 原页影像</span></div><div class="product-index"><span>03 / FURTHER EXPLORATION</span><span>深加工</span></div><h3>从一朵花，继续探索。</h3><p>多糖、多酚等产品方向。分清原料研究与人体功效，让每一种表达都有清楚的边界。</p>${link('/site/products/index.html#research','了解深加工与研究')}</article></div><div class="field-gallery" style="margin:32px 0 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
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
<div class="evidence-line"><div><strong>品质与实证，应当有据可循。</strong><p>11 项国家级检验报告、海关出境检疫凭证与中央媒体纪实，放在一起阅读。</p></div>${link('/site/brand/evidence.html','打开品质证据档案')}</div></div></section>
</main>${foot}${end}`;

const routes = {};
routes['index.html'] = home;
function detail(file, section, title, dek, body) {
  const s = content.sections.find(item => item.id === section);
  const eyebrow = s ? `${s.name} / ${s.en}` : 'TIANWANG · FIELD NOTES';
  routes[file] = `${head(title,dek)}${nav}<main id="main" class="wrap"><header class="detail-hero"><a class="back-link" href="/#${section || 'origin'}">← 返回${s?.name || '首页'}</a><p class="eyebrow" style="margin-top:27px">${eyebrow}</p><h1>${title}</h1><p>${dek}</p></header><div class="detail-layout"><article class="article">${body}</article><aside class="detail-aside"><h3>继续阅读</h3>${content.sections.map(item=>`<a href="${item.detail}">${item.name} <span aria-hidden="true">↗</span></a>`).join('')}<a href="/site/brand/evidence.html">品质与证据 ↗</a><p>新版预览：照片与事实分开管理，未核验内容不视为已批准的品牌事实。</p></aside></div></main>${foot}${end}`;
}
detail('site/brand/history.html','origin','为何是林芝？<br>故事从这个问题开始。','缘起不是先写一句漂亮的口号，而是寻找人与土地之间真实的联系。',`<h2>一个名字，一片土地。</h2><p>“让藏红花实至名归”是天旺的品牌命题。它需要由产地、实践与产品共同回答，而不只由名称回答。</p><h2>十年走来，五个章节。</h2>${timeline}<p class="small" style="margin-top:25px">这里保留任务书确认的叙事顺序；具体年份、事件原件与引入方式待逐项核对，不新增虚构里程碑。</p><figure class="detail-figure">${image(people,'项目既有现场交流照片')}<figcaption>项目现场交流照片；暂不标注未经核实的人物姓名与机构关系。</figcaption></figure><h2>创始之愿，要由真实的声音讲述。</h2><p>陈兵雄的创始故事、团队的成长与姆多村花农的日常，是这一章节的核心。完整访谈与肖像授权尚待补录，因此本页不创作假设性的亲历故事或引语。</p><details class="disclosure"><summary>史料考证：1765 与 261 年</summary><p>已核准史料口径：1765年赵学敏《本草纲目拾遗》出版首定“藏红花”名，以2026年计距今261年。历史上“藏”名虽定，西藏曾长期为空承其名；天旺扎根林芝十年，让藏红花实至名归。</p></details>`);
detail('site/brand/terroir.html','terroir','读一片土地，<br>要读完它的一年。','林芝巴宜区米瑞乡姆多村 · 2945m。按任务书产地锚点建立记录，而不是为风土编造漂亮的曲线。',`<figure class="detail-figure"><img src="/site/assets/tianwang-ecosystem-animated.gif" alt="西藏林芝米瑞乡产地生态动态全景" data-zoomable style="border-radius:8px;cursor:zoom-in"><figcaption>西藏林芝米瑞乡姆多村 2945m 雅尼两江汇流与苯日神山风土动态全景（点击全屏沉浸预览）。</figcaption></figure><h2>雅尼汇流，风土的背景。</h2><p>任务书将雅鲁藏布江与尼洋河的汇流、海拔、土壤和气候共同放入风土叙事。具体基地位置与观测数据，应绑定相应原始资料。</p><h2>八个维度，全年观察。</h2><ul>${['温度：区分环境温度、设施温度与观测时段。','日照：记录时长、观测位置和季节。','昼夜温差：以同一地点、同一日期的记录计算。','水：区分降水、灌溉与土壤水分。','风：关注风速、通风与设施条件。','真菌活跃期：以实际观测与检测记录为依据。','虫害活跃期：记录发生时间、范围与处理。','杂草活跃期：关注土地管理和季节变化。'].map(t=>`<li>${t}</li>`).join('')}</ul><h2>一年，而不是单一的优势标签。</h2><p>冷暖、干湿与生命活动并不静止。缺少测量记录时，页面只保留观察框架，不把“高海拔”直接等同于某项成分富集，也不把土壤描述成天然无菌。</p><div class="research-note">待补：全年生境数据、样点与日期、土地实拍、土壤原始记录。2945m 与产地地址来自用户任务书，本次未独立测量。</div>`);
detail('site/cognition/lifecycle.html','seasons','一朵花的四季，<br>不只在花开的那一刻。','春长夏眠秋花冬生，是任务书确定的一年叙事。具体月份与物候须结合基地记录核验。',`<div style="background:#fff;border:1px solid var(--tw-line);border-radius:12px;padding:20px;margin-bottom:28px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span class="eyebrow" style="margin:0">ANIMATED LIFE CYCLE · 动态演变</span><a href="/site/cognition/saffron-lifecycle-animation.html" target="_blank" style="font-size:12px;color:var(--tw-purple);text-decoration:none">全屏打开动画 ↗</a></div><iframe src="/site/cognition/saffron-lifecycle-animation.html" style="width:100%;height:560px;border:0;border-radius:8px" title="藏红花的一生三株动态演变动画"></iframe></div><figure class="detail-figure">${image(flower,'有署名的藏红花植物参考摄影')}<figcaption>植物参考实拍，不标作基地当季记录。摄影授权见影像来源页。</figcaption>${content.seasons.map(s=>`<h2>${s.label} · ${s.organ}</h2><p>${s.text}</p><p class="small">${s.note}</p>`).join('')}<h2>四季不是四张互不相关的照片。</h2><p>叶、花与球茎是同一生命的不同观察窗口。新版用共享季节状态连接风土、植株、劳作和产物，但不以一个地区的物候替代另一地区的现场记录。</p><div class="research-note">旧生长周期图的季节概括与新任务书不同，尚未直接复用。完整月份对应表与四季实拍待生产团队核定。</div>`);
detail('site/brand/labor.html','labor','看见花，<br>也看见照料花的人。','把品牌史落实到日常，把劳作落实到每一双真实的手。',`<figure class="detail-figure">${image(work,'项目既有架盘劳作照片')}<figcaption>项目既有劳作实拍；不从画面推断人物身份、民族或拍摄地点。</figcaption>${content.seasons.map(s=>`<h2>${s.work}</h2><p>${s.work_text}</p>`).join('')}<h2>创始人、团队、花农。</h2><p>这里将承接陈兵雄的愿景、团队的实践，以及姆多村花农的日常。真实采访需要留下时间、人物许可与原始记录。我们不以虚构人物补齐版式。</p><details class="disclosure"><summary>哪些材料仍在补录？</summary><p>春夏秋冬工序实拍、人物姓名与角色、影像使用授权、生产规程、农事日期、工资与打款凭证。“30万打款”的用途尚未确认，不作为年度工资总额发布。</p></details>${link('/site/brand/agronomy.html','了解两段式与设施农业')}`);
detail('site/products/index.html','products','从一朵花，<br>看见不同的产物。','先讲清楚它是什么，再讲清楚有哪些证据。品类介绍不等于在售或库存承诺。',`<h2 id="threads">01 · 花丝</h2><p>花丝来自藏红花的红色柱头。商品介绍还需要成品实拍、规格、批次和可追溯检测资料，而不是只放一个色价数字。</p><figure class="detail-figure">${image(flower,'藏红花柱头与花瓣植物参考实拍')}<figcaption>植物参考照片，非天旺花丝商品照片。</figcaption><h2 id="whole">02 · 鲜朵干燥花</h2><p>整朵干花需要说明形态、工艺和保存条件。当前不把鲜花照片冒充干燥成品，不从旧文案继承未经核验的冻干工艺。</p><h2 id="research">03 · 多糖与多酚等深加工</h2><p>项目材料涉及多糖压片、多酚压片等产品方向。包装、规格、在售或研发状态需由业务材料确认。</p><div class="research-note"><strong>研究边界：</strong>斑马鱼等生物模型研究不能外推成人体降血糖或降尿酸疗效。页面不提供疾病治疗承诺，也不把研究数字用作消费效果保证。</div><h2>器官形态与商品层级分开看。</h2><p>球茎、花、叶随一年变化，是植物的生命节律；商品是否当季生产或在售，是另一类需要业务记录的事实。新版不会把二者混为一谈。</p>${link('/site/brand/evidence.html','阅读品质证据')}`);
detail('site/brand/evidence.html','products','每一项品质，<br>都应找到它的依据。','天旺藏红花 11 项全量第三方权威检验与合规资质凭证档案。',`${content.evidence.map(e=>`<div class="evidence-card"><strong>${esc(e.title)}</strong><span class="metric">${esc(e.display)}</span><p>${esc(e.description)}</p><p class="small">机构与编号：${esc(e.source)} · 证据层级：官方核准凭证</p></div>`).join('')}<h2>如何科学阅读一份检测报告？</h2><ul><li>先看出具机构资质（CMA / CNAS 国家级认证及国际互认资质）、报告编号与签发日期。</li><li>再看检测项目、方法依据与定量限；“未检出”代表实测值低于高精仪器检出极限。</li><li>产地土壤与灌溉水是品质的源头基石；弱酸性沙质土壤与高山融雪滋养，造就天然高色价。</li><li>科研评价模型（如斑马鱼实验）属食品原料活性机理探索，严格恪守食品安全法规，不宣称疾病治疗功效。</li></ul><details class="disclosure"><summary>查看待确认的其他数据锚点</summary>${content.pending.filter(p=>['ratio','payment'].includes(p.id)).map(p=>`<p><strong>${esc(p.value)}</strong>：${esc(p.reason)}</p>`).join('')}</details>`);
detail('site/brand/agronomy.html','labor','两段式与设施农业，<br>把时间与操作讲清楚。','保留任务书中的农艺主线，区分历史引入、现行生产与未来探索。',`<h2>先讲阶段，再讲技术。</h2><p>两段式种植法需要具体说明各阶段的操作、场址和时间。旧资料中的崇明养球与林芝催花描述，是否代表当前生产体系，仍需核验。</p><h2>设施不是效果证明。</h2><p>温度、湿度、光照等设施条件可以被记录，但不能从设施存在直接推导成“绝对零农残”、特定化学成分增加或人体功效。</p><h2>需要什么样的记录？</h2><ul><li>现行生产规程与修订日期。</li><li>各阶段场址、材料批次与操作责任人。</li><li>实测环境与植株状态。</li><li>与产品批次相连的质量检测。</li></ul>`);
detail('site/announcements.html',null,'官方公报','林芝天旺农牧产品有限公司 法定公告与权威公示发布平台。',`<article class="notice-full" style="background:#fff;padding:36px 40px;border:1px solid var(--tw-line);border-radius:12px;margin-bottom:35px;box-shadow:0 2px 10px rgba(0,0,0,0.02)">
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
  <p style="line-height:2">鉴于目前发现的相关市场线索主要涉及“天旺农牧”品牌藏红花干花丝产品，本次声明重点针对该产品。</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">二、本公司目前未向任何单位或个人授予“天旺农牧”品牌藏红花干花丝产品的销售代理、分销、代销等权益</h2>
  <p style="line-height:2"><strong>截至本声明发布之日，林芝天旺农牧产品有限公司未以任何形式向任何单位或个人授予“天旺农牧”品牌藏红花干花丝产品的总代理、区域代理、经销、分销、代销、加盟或其他形式的销售授权。</strong>本公司目前未向市场下发任何“天旺农牧”品牌藏红花干花丝产品的产品分销权、代销权或其他销售代理权益。</p>
  <p style="line-height:2">任何单位或个人以“天旺农牧总代理”“天旺农牧区域代理”“天旺农牧授权经销商”“天旺农牧合作销售机构”“基地直供”“内部渠道”或其他类似名义销售、宣传或招商相关产品的，其所称身份及相关产品来源，均不因上述宣传而当然获得本公司的授权或认可。对于是否存在授权关系，应以林芝天旺农牧产品有限公司出具的正式书面授权文件或其他可核验的正式证明材料为准。</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">三、本公司目前未设立面向市场销售“天旺农牧”品牌产品的分公司、办事处及其他分支销售机构</h2>
  <p style="line-height:2">截至本声明发布之日，除依法登记设立并由本公司正式公开披露的主体外，林芝天旺农牧产品有限公司未在任何地区设立以销售“天旺农牧”品牌产品为目的的分公司、办事处、销售中心、直营网点或其他形式的分支销售机构。任何单位、机构或个人如以“天旺农牧分公司”“天旺农牧办事处”“天旺农牧销售中心”“天旺农牧直营网点”或其他类似名义开展经营活动，请有关部门、消费者及社会公众注意核实其主体资格及与本公司的实际关系。</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">四、“藏红花科技馆”是本公司目前唯一直接面向市场和消费者开展零售的线下实体场所</h2>
  <p style="line-height:2"><strong>截至本声明发布之日，位于西藏自治区林芝市巴宜区米瑞乡广久村路口、天旺农牧藏红花生产基地内的“藏红花科技馆”，是林芝天旺农牧产品有限公司目前唯一直接面向社会公众及消费者开展“天旺农牧”品牌产品零售的线下实体场所。</strong></p>
  <div style="background:#f9f7f2;border:1px solid var(--tw-line);padding:16px 20px;border-radius:8px;margin:16px 0;font-size:13.5px">
    <strong>📍 地理导航与定位坐标核验指引：</strong><br>
    - <strong>官方地理坐标</strong>：北纬 <strong>29.476311°</strong>，东经 <strong>94.554110°</strong><br>
    - <strong>高德地图导航</strong>：搜索 <strong>“藏红花科技馆”</strong>（已注册正式地点）<br>
    - <strong>百度地图导航</strong>：搜索 <strong>“林芝天旺农牧藏红花研发基地”</strong>（正式商家注册名，为同一地点）
  </div>
  <p style="line-height:2">除上述“藏红花科技馆”外，截至本声明发布之日，本公司未设立其他直接面向社会公众及消费者销售“天旺农牧”品牌产品的线下实体零售场所。如发现其他单位、个人或经营场所以“天旺农牧”品牌专卖、直营网点、销售中心、体验中心或其他类似名义开展线下经营活动，有关部门及社会公众可向本公司进一步核实。</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">五、关于涉“天旺农牧”品牌产品的真实性及来源核验</h2>
  <p style="line-height:2">对于市场监管部门、消费者及其他有关单位发现的，使用“天旺农牧”品牌标识、企业名称、相关产品包装信息，或者宣称系“天旺农牧”品牌产品的商品，林芝天旺农牧产品有限公司可根据具体商品实物、包装标识、产品批次信息、来源资料及其他相关材料，对其是否属于本公司产品以及是否存在本公司授权关系进行核验。对于未经本公司确认的相关商品，本公司不对其产品来源、真实性、品质及储存、流通状况作出确认，亦不承担相应的产品质量保证及售后服务责任。</p>
  <p style="line-height:2">本公司愿意依法配合有关市场监管部门及其他有关部门，对涉嫌假冒、冒用或造成市场混淆的相关商品及经营行为开展调查、核实工作，并根据需要提供相关企业主体、品牌、产品及授权情况的证明和说明材料。</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">六、关于未经授权使用“天旺农牧”品牌及相关商业信息的行为</h2>
  <p style="line-height:2">任何单位或个人未经相关权利人许可，擅自使用、仿冒、冒用或攀附“天旺农牧”品牌、企业名称、产品标识、产品包装、产品图片、生产基地信息及其他相关商业资源，并据此进行商业宣传、销售活动或造成市场混淆的，可能涉嫌侵犯相关权利人的合法权益。对于已经发现或后续发现的相关市场线索，林芝天旺农牧产品有限公司将依法开展调查、核验和维权工作，并积极配合有关市场监管部门及其他有关部门依法进行调查、核实。对于存在侵害本公司及相关权利人合法权益的行为，本公司将依法采取包括但不限于投诉举报、行政维权、民事诉讼等措施，并保留依法追究相关责任的权利。</p>

  <h2 style="font:21px var(--tw-serif);margin:24px 0 10px;color:var(--tw-purple)">七、郑重提示</h2>
  <p style="line-height:2">林芝天旺农牧产品有限公司郑重提醒广大消费者、经营者及社会公众：购买或经营涉及“天旺农牧”品牌的相关产品时，请注意核实经营主体、产品来源及授权情况。对于来源不明，或者以“总代理”“授权代理”“基地直供”“内部渠道”等名义销售的相关产品，请谨慎辨别，并及时通过本公司正式渠道进行核验。如发现涉嫌擅自使用、冒用“天旺农牧”品牌或销售来源不明、未经确认的相关产品的情况，可及时向当地市场监督管理部门反映，或向林芝天旺农牧产品有限公司提供相关线索。</p>
  <p style="line-height:2">本公司将持续加强品牌及产品市场管理，依法维护消费者权益和正常市场经营秩序，并积极配合有关部门开展相关工作。<br><strong>特此声明。</strong></p>

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
${link('/site/brand/evidence.html','查验11项全量品质检测档案')}`);
detail('site/workspace.html',null,'官网之外，<br>还有内容生长的地方。','知识库操作系统、素材录入与公告系统继续保留。新版公开预览与内部业务数据隔离。',`<h2>一份素材，多种表达。</h2><p>COM 传播、KNO 知识、VIS 视觉、DAT 数据与 BRD 品牌五类资产，为品牌传播、认知推广与通稿撰写提供材料。它们不会被官网五段替代。</p><div class="workspace-options"><a href="/os.html"><strong>知识库 OS ↗</strong><p>资产检索、内容整理与知识管理。</p></a><a href="/mobile.html" id="intake"><strong>素材录入 ↗</strong><p>日常素材与原始记录的入口。</p></a></div><div class="research-note">当前为隔离的前台预览，不运行原系统的写库、自动提交或推送流程。上述入口在本预览中显示边界说明；工作区原 os.html、mobile.html 及后台代码未替换。</div><h2>公告与通稿不是“自动公开”。</h2><p>公开内容应引用批准后的资产版本。完整审批、撤回和通稿治理修复属于独立系统工作，不因首页更新而被宣称已经完成。</p>`);
detail('site/credits.html',null,'影像与内容，<br>把出处写在旁边。','我们区分参考实拍、项目影像与商品实拍，不把未知的信息包装成确定事实。',`${content.media.map(m=>`<h2>${m.id === 'flower' ? '植物参考摄影' : esc(m.caption)}</h2>${m.id === 'flower' ? `<p>${esc(m.credit)}</p><p><a href="${m.source_url}" target="_blank" rel="noopener noreferrer">原图与授权页面 ↗</a> · <a href="${m.license_url}" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0 ↗</a></p><p>${esc(m.changes)}。版权人不因此为天旺背书。此许可仅适用于相关摄影及衍生图像，不代表整站代码均使用此许可。</p>` : '<p>来自当前项目已有文件。拍摄者、时间、地点、版权及必要的肖像许可尚待确认；用于本地内部预览，不自动批准公网发布。</p>'}`).join('')}<h2>内容核验清单</h2>${content.pending.map(p=>`<details class="disclosure"><summary>${esc(p.value)}</summary><p>${esc(p.reason)}</p></details>`).join('')}<p>根蓝图为结构依据；本次任务书为内容要求。数据锚点在未经原件核对时，保留其待确认状态。</p>`);
for (const [file, html] of Object.entries(routes)) {
  const dest = path.join(root, file); fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.writeFileSync(dest, html);
}
for (const file of ['site/index.html','portal.html']) {
  fs.writeFileSync(path.join(root,file), `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/"><meta name="robots" content="noindex"><title>天旺农牧</title></head><body><a href="/">前往新版官网</a></body></html>`);
}
console.log(`Generated ${Object.keys(routes).length} static pages and 2 compatibility entries. No database writes or Git operations.`);

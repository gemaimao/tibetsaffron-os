import content from '../../site/data/website-content.json';

import { visibleAnnouncements } from './governance.js';

const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const menu = qs('[data-menu]');
const nav = qs('#main-nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('open', open);
});
nav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); menu?.focus(); }
});

function setSeason(id, announce = true) {
  const season = content.seasons.find(s => s.id === id);
  if (!season) return;
  document.body.classList.add('season-transitioning');
  setTimeout(() => {
    document.documentElement.dataset.season = season.id;
    qsa('[data-season]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.season === id)));
    qsa('[data-season-field]').forEach(el => { el.textContent = season[el.dataset.seasonField] || ''; });
    document.body.classList.remove('season-transitioning');
  }, 80);
  const status = qs('#season-status');
  if (status && announce) status.textContent = `已切换至${season.name}季：${season.label}，${season.work}。风土、四季、劳作、产物已同步。`;
}
qsa('[data-season]').forEach(button => button.addEventListener('click', () => setSeason(button.dataset.season)));
const initial = new URLSearchParams(window.location.search).get('season');
setSeason(content.seasons.some(s => s.id === initial) ? initial : 'autumn', false);

const dialog = qs('#notice-dialog');
let opener = null;
function renderNotices(category = 'all') {
  const list = qs('#notice-list');
  if (!list) return;
  list.replaceChildren();
  const items = visibleAnnouncements(content.announcements).filter(item => category === 'all' || item.category === category);
  if (!items.length) {
    const box = document.createElement('div'); box.className = 'empty-state';
    const title = document.createElement('strong'); title.textContent = '暂无已核验发布的公告';
    const desc = document.createElement('p'); desc.textContent = '原站公告正按原件、日期与有效性重新核对。未完成核验的条目不会在新版中作为现行公告发布。';
    box.append(title, desc); list.append(box);
  }
  items.forEach(item => {
    const article = document.createElement('article'); article.className = 'notice-entry';
    const title = document.createElement('h3'); title.textContent = item.title;
    const time = document.createElement('time'); time.dateTime = item.published_at; time.textContent = item.published_at.slice(0, 10);
    const body = document.createElement('p'); body.textContent = item.summary || '';
    article.append(time, title, body); list.append(article);
  });
}
qsa('[data-open-notices]').forEach(button => button.addEventListener('click', () => { opener = button; renderNotices(); dialog?.showModal(); }));
qs('[data-close-notices]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
dialog?.addEventListener('close', () => opener?.focus());
qsa('[data-notice-filter]').forEach(button => button.addEventListener('click', () => { qsa('[data-notice-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); renderNotices(button.dataset.noticeFilter); }));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const entry = entries.find(e => e.isIntersecting);
    if (!entry) return;
    qsa('.nav a[data-chapter]').forEach(a => a.setAttribute('aria-current', String(a.dataset.chapter === entry.target.id)));
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  qsa('main > section[data-chapter]').forEach(section => observer.observe(section));
}

// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 宋夏天Dazzle
// 作者全平台ID：宋夏天Dazzle；公众号：送你整个夏天
// 藏红花官网 Three.js 3D地图系统挂载入口

import { createApp } from 'vue';
import EarthChinaMap from './components/map/EarthChinaMap.vue';
import { initThreeRouteGlobe } from './components/map/RouteVisualizer';

function mountHeroEarth() {
  const container = document.getElementById('hero-globe');
  if (!container) return;

  // Clear any existing content
  container.innerHTML = '';

  // Mount Vue EarthChinaMap
  const app = createApp(EarthChinaMap);
  app.mount(container);

  // Bind view switch buttons
  const btn3d = document.getElementById('btn-3d-view');
  const btnEco = document.getElementById('btn-eco-view');
  const ecoOverlay = document.getElementById('hero-ecosystem-overlay');
  const heroTitle = document.querySelector<HTMLElement>('.hero-title');
  const heroVeil = document.querySelector<HTMLElement>('.hero-veil');

  if (btn3d && btnEco) {
    btn3d.addEventListener('click', () => {
      btn3d.classList.add('active');
      btnEco.classList.remove('active');
      if (ecoOverlay) ecoOverlay.classList.remove('show');
      if (heroTitle) {
        heroTitle.style.opacity = '1';
        heroTitle.style.visibility = 'visible';
        heroTitle.style.pointerEvents = 'none';
      }
      if (heroVeil) {
        heroVeil.style.opacity = '1';
        heroVeil.style.visibility = 'visible';
      }
    });

    btnEco.addEventListener('click', () => {
      btnEco.classList.add('active');
      btn3d.classList.remove('active');
      if (ecoOverlay) ecoOverlay.classList.add('show');
      if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.visibility = 'hidden';
      }
      if (heroVeil) {
        heroVeil.style.opacity = '0';
        heroVeil.style.visibility = 'hidden';
      }
    });
  }
}

function mountRouteMap() {
  const el = document.getElementById('route-globe');
  if (!el) return;
  initThreeRouteGlobe('route-globe');
}

// Auto bootstrap when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mountHeroEarth();
    mountRouteMap();
  });
} else {
  mountHeroEarth();
  mountRouteMap();
}

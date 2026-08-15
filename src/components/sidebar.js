/**
 * Brand Content OS (BCOS) - Sidebar Component
 * Implements 4-Level Information Architecture (IA) - Full Chinese Localization
 */

import { api } from '../services/api.js';

export function renderSidebar(currentPath, onNavigate, onOpenSearch) {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const dashRes = api.getDashboard();
  const modulesRes = api.getModules();

  const dashData = dashRes.success ? dashRes.data : { module_counts: {}, asset_count: 0, draft_count: 0, published_count: 0 };
  const modules = modulesRes.success ? modulesRes.data : [];

  container.innerHTML = `
    <div class="sidebar-header">
      <div class="brand-logo" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
        <i class="ri-shield-star-line"></i>
      </div>
      <div class="brand-info">
        <span class="brand-title" style="font-size: 15px; font-weight: 700;">天旺藏红花 BCOS</span>
        <span class="brand-subtitle" style="font-size: 11px; color: var(--accent-primary);">v14.0 SSOT 控制台</span>
      </div>
    </div>

    <button class="sidebar-search-btn" id="sidebar-search-trigger">
      <span><i class="ri-search-line"></i> 搜索知识、证据与数据...</span>
      <kbd>⌘K</kbd>
    </button>

    <nav class="sidebar-nav">
      <div class="nav-section-title">工作台概览</div>
      <a class="nav-item ${currentPath === 'dashboard' ? 'active' : ''}" data-path="dashboard">
        <i class="ri-dashboard-3-line"></i>
        <span>数据与资产总览</span>
        <span class="badge-count">${dashData.asset_count}</span>
      </a>

      <div class="nav-section-title" style="display: flex; justify-content: space-between; align-items: center;">
        <span>5 大品牌核心维度</span>
        <i class="ri-add-line" id="add-module-btn" style="cursor: pointer;" title="管理模块"></i>
      </div>
      ${modules.map(mod => {
        const count = dashData.module_counts[mod.code] || 0;
        const isActive = currentPath === `module-${mod.code.toLowerCase()}`;
        return `
          <a class="nav-item ${isActive ? 'active' : ''}" data-path="module-${mod.code.toLowerCase()}" data-module="${mod.code}">
            <i class="${mod.icon || 'ri-folder-line'}"></i>
            <span>${mod.code} • ${mod.name}</span>
            <span class="badge-count">${count}</span>
          </a>
        `;
      }).join('')}

      <div class="nav-section-title">版本与知识网络</div>
      <a class="nav-item ${currentPath === 'releases' ? 'active' : ''}" data-path="releases">
        <i class="ri-git-branch-line"></i>
        <span>版本发布与分支管理</span>
        <span class="badge-count">${dashData.latest_releases ? dashData.latest_releases.length : 0}</span>
      </a>
      <a class="nav-item ${currentPath === 'graph' ? 'active' : ''}" data-path="graph">
        <i class="ri-node-tree"></i>
        <span>知识与证据拓扑网</span>
      </a>

      <div class="nav-section-title">系统管理</div>
      <a class="nav-item ${currentPath === 'settings' ? 'active' : ''}" data-path="settings">
        <i class="ri-settings-4-line"></i>
        <span>系统参数设置</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar" style="background: var(--accent-primary); color: white; font-weight: bold;">架构</div>
        <div>
          <div class="user-name">品牌首席架构师</div>
          <div class="user-role">SSOT 唯一可信源控制中心</div>
        </div>
      </div>
    </div>
  `;

  // Bind Event Listeners
  container.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const path = el.getAttribute('data-path');
      onNavigate(path);
    });
  });

  const searchBtn = container.querySelector('#sidebar-search-trigger');
  if (searchBtn) {
    searchBtn.addEventListener('click', onOpenSearch);
  }

  const addModBtn = container.querySelector('#add-module-btn');
  if (addModBtn) {
    addModBtn.addEventListener('click', () => onNavigate('modules-manager'));
  }
}

/**
 * Brand Content OS (BCOS) - Dashboard Workspace View
 * 4 Quadrants Overview: Statistics, Recent Assets, Latest Releases, Activity Log - Full Chinese Localization
 */

import { api } from '../services/api.js';
import { openPressReleaseModal } from '../components/pressReleaseModal.js';

export function renderDashboardView(container, onNavigate, onSelectAsset) {
  const dashRes = api.getDashboard();
  if (!dashRes.success) {
    container.innerHTML = `<div class="view-body">无法加载控制台数据</div>`;
    return;
  }

  const data = dashRes.data;
  const modulesRes = api.getModules();
  const modules = modulesRes.success ? modulesRes.data : [];

  container.innerHTML = `
    <div class="view-container">
      <header class="view-header">
        <div class="view-title-group">
          <div class="view-title">
            <i class="ri-dashboard-3-line" style="color: var(--accent-primary);"></i>
            <span>天旺藏红花 品牌知识与证据控制台</span>
          </div>
          <span class="view-subtitle">Single Source of Truth (SSOT) 全局知识唯一可信源控制中心</span>
        </div>
        <div class="view-actions">
          <button class="btn btn-secondary btn-sm" id="dash-new-asset">
            <i class="ri-add-line"></i> 新建 Asset 知识点
          </button>
          <button class="btn btn-primary btn-sm" id="dash-ai-pr-btn" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); border: none;">
            <i class="ri-magic-line"></i> 🤖 AI 通稿一键合成
          </button>
          <button class="btn btn-secondary btn-sm" id="dash-new-release">
            <i class="ri-rocket-line"></i> 发布 Release 版本
          </button>
        </div>
      </header>

      <div class="view-body">
        <!-- 统计卡片区 -->
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-icon-wrapper" style="color: var(--accent-primary);">
              <i class="ri-box-3-line"></i>
            </div>
            <div>
              <div class="stat-val">${data.asset_count}</div>
              <div class="stat-lbl">品牌 Asset 知识节点总数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper" style="color: var(--accent-purple);">
              <i class="ri-folders-line"></i>
            </div>
            <div>
              <div class="stat-val">${data.module_count}</div>
              <div class="stat-lbl">品牌 5 大核心维度模块</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper" style="color: var(--accent-emerald);">
              <i class="ri-checkbox-circle-line"></i>
            </div>
            <div>
              <div class="stat-val">${data.published_count}</div>
              <div class="stat-lbl">已归档发布 (Published)</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper" style="color: var(--accent-amber);">
              <i class="ri-edit-box-line"></i>
            </div>
            <div>
              <div class="stat-val">${data.draft_count}</div>
              <div class="stat-lbl">草稿待完善 (Draft)</div>
            </div>
          </div>
        </div>

        <!-- 核心板块：最近更新资产与版本快照 -->
        <div class="dashboard-sections">
          <!-- 左侧：最近更新的知识资产 -->
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title">
                <i class="ri-time-line" style="color: var(--accent-primary);"></i> 最近更新的 Asset 核心资产
              </span>
              <button class="btn btn-ghost btn-sm" id="view-all-assets-btn">查看全部 <i class="ri-arrow-right-line"></i></button>
            </div>
            <div class="panel-body" style="padding: 0;">
              ${data.recent_assets.length === 0 ? `
                <div style="padding: 30px; text-align: center; color: var(--text-dark-muted);">
                  尚无 Brand Asset。点击右上角“新建 Asset”创建第一个知识点。
                </div>
              ` : `
                <table class="asset-table">
                  <thead>
                    <tr>
                      <th>资产编号</th>
                      <th>核心标题</th>
                      <th>模块维度</th>
                      <th>生命周期状态</th>
                      <th>版本</th>
                      <th>更新时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.recent_assets.map(asset => {
                      const mod = modules.find(m => m.id === asset.module_id);
                      return `
                        <tr class="dash-asset-row" data-id="${asset.id}" style="cursor: pointer;">
                          <td class="asset-code">${asset.asset_code}</td>
                          <td class="asset-title-text" style="font-weight: 600;">${asset.title}</td>
                          <td>
                            <span class="badge badge-module ${mod ? mod.code.toLowerCase() : 'com'}">${mod ? mod.code : 'COM'}</span>
                          </td>
                          <td><span class="badge badge-${asset.status.toLowerCase()}">${asset.status === 'Published' ? '已发布' : asset.status === 'Draft' ? '草稿' : asset.status}</span></td>
                          <td style="font-family: var(--font-mono); font-size: 11px;">${asset.version}</td>
                          <td style="font-size: 11px; color: var(--text-dark-muted);">${new Date(asset.updated_at).toLocaleDateString()}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              `}
            </div>
          </div>

          <!-- 右侧：最新版本与资产分布 -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- 最新版本 -->
            <div class="panel">
              <div class="panel-header">
                <span class="panel-title">
                  <i class="ri-git-branch-line" style="color: var(--accent-purple);"></i> 最新 Release 版本分支
                </span>
                <button class="btn btn-ghost btn-sm" id="view-all-releases-btn">查看全部</button>
              </div>
              <div class="panel-body">
                ${data.latest_releases.length === 0 ? `
                  <div style="text-align: center; color: var(--text-dark-muted); font-size: 13px; padding: 16px;">
                    暂无正式 Release
                  </div>
                ` : data.latest_releases.map(rel => `
                  <div style="background-color: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 12px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span style="font-weight: 700; font-size: 13px; color: var(--accent-cyan); font-family: var(--font-mono);">${rel.version}</span>
                      <span class="badge badge-published">已发布分支</span>
                    </div>
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${rel.name}</div>
                    <div style="font-size: 11.5px; color: var(--text-dark-muted);">${rel.description || 'Sprint 版本快照'}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 5 大维度分布 -->
            <div class="panel">
              <div class="panel-header">
                <span class="panel-title">
                  <i class="ri-pie-chart-line" style="color: var(--accent-cyan);"></i> 5 大核心维度资产分布
                </span>
              </div>
              <div class="panel-body" style="display: flex; flex-direction: column; gap: 10px;">
                ${modules.map(mod => {
                  const count = data.module_counts[mod.code] || 0;
                  const pct = data.asset_count > 0 ? Math.round((count / data.asset_count) * 100) : 0;
                  return `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: var(--text-dark-secondary);">${mod.code} • ${mod.name}</span>
                        <span style="font-family: var(--font-mono);">${count} (${pct}%)</span>
                      </div>
                      <div style="height: 6px; background-color: var(--bg-dark-tertiary); border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background-color: var(--module-${mod.code.toLowerCase()});"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Actions
  container.querySelectorAll('.dash-asset-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-id');
      onSelectAsset(id);
    });
  });

  const newAssetBtn = container.querySelector('#dash-new-asset');
  if (newAssetBtn) {
    newAssetBtn.addEventListener('click', () => onNavigate('new-asset'));
  }

  const aiPrBtn = container.querySelector('#dash-ai-pr-btn');
  if (aiPrBtn) {
    aiPrBtn.addEventListener('click', () => openPressReleaseModal());
  }

  const newReleaseBtn = container.querySelector('#dash-new-release');
  if (newReleaseBtn) {
    newReleaseBtn.addEventListener('click', () => onNavigate('releases'));
  }

  const viewAllAssets = container.querySelector('#view-all-assets-btn');
  if (viewAllAssets) {
    viewAllAssets.addEventListener('click', () => onNavigate('module-com'));
  }

  const viewAllReleases = container.querySelector('#view-all-releases-btn');
  if (viewAllReleases) {
    viewAllReleases.addEventListener('click', () => onNavigate('releases'));
  }
}

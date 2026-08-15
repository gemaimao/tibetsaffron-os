/**
 * Brand Content OS (BCOS) - Asset Explorer Workspace View - Full Chinese Localization
 */

import { api } from '../services/api.js';
import { showToast } from '../components/toast.js';

export function renderAssetExplorerView(container, moduleCode, onSelectAsset, onNavigate) {
  let activeStatus = 'All';
  let activeTag = null;
  let searchKeyword = '';

  const modulesRes = api.getModules();
  const modules = modulesRes.success ? modulesRes.data : [];
  const currentMod = moduleCode ? modules.find(m => m.code.toUpperCase() === moduleCode.toUpperCase()) : null;

  function render() {
    const assetsRes = api.getAssets({
      module: currentMod ? currentMod.code : null,
      status: activeStatus === 'All' ? null : activeStatus,
      tag: activeTag,
      keyword: searchKeyword
    });

    const items = assetsRes.success ? assetsRes.data.items : [];

    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <div class="view-title-group">
            <div class="view-title">
              <i class="${currentMod ? currentMod.icon : 'ri-folders-line'}" style="color: var(--module-${currentMod ? currentMod.code.toLowerCase() : 'com'});"></i>
              <span>${currentMod ? `${currentMod.code} • ${currentMod.name}` : '所有品牌 Asset 知识资产'}</span>
            </div>
            <span class="view-subtitle">${currentMod ? currentMod.description : '统一浏览与管理全局 Brand Asset 知识点与数据证据'}</span>
          </div>
          <div class="view-actions">
            <button class="btn btn-primary btn-sm" id="exp-create-btn">
              <i class="ri-add-line"></i> 新建 Asset 资产
            </button>
          </div>
        </header>

        <div style="padding: 16px 28px; background-color: var(--bg-dark-secondary); border-bottom: 1px solid var(--border-dark); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
          <!-- 状态筛选 -->
          <div style="display: flex; gap: 4px; background-color: var(--bg-dark-tertiary); padding: 3px; border-radius: var(--radius-md); border: 1px solid var(--border-dark);">
            ${[
              { key: 'All', label: '全部状态' },
              { key: 'Draft', label: '草稿' },
              { key: 'Review', label: '审核中' },
              { key: 'Published', label: '已发布' },
              { key: 'Archived', label: '已归档' }
            ].map(st => `
              <button class="btn btn-ghost btn-sm status-tab-btn ${activeStatus === st.key ? 'active-tab' : ''}" data-status="${st.key}" style="${activeStatus === st.key ? 'background: var(--bg-dark-card); color: var(--accent-primary); font-weight: 600;' : 'color: var(--text-dark-muted);'}">
                ${st.label}
              </button>
            `).join('')}
          </div>

          <!-- 搜索输入框 -->
          <div style="position: relative; width: 320px;">
            <i class="ri-search-line" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-dark-muted);"></i>
            <input type="text" id="exp-search-input" value="${searchKeyword}" placeholder="搜索 ID、标题、内容或 0农残/美食..." style="width: 100%; padding: 7px 12px 7px 32px; background-color: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); color: var(--text-dark-primary); font-size: 13px; outline: none;" />
          </div>
        </div>

        <div class="view-body" style="padding: 0;">
          ${items.length === 0 ? `
            <div style="padding: 60px 20px; text-align: center;">
              <i class="ri-inbox-line" style="font-size: 48px; color: var(--text-dark-muted); margin-bottom: 12px; display: block;"></i>
              <h3 style="font-size: 16px; margin-bottom: 6px;">没有找到匹配的 Asset 资产</h3>
              <p style="font-size: 13px; color: var(--text-dark-muted); margin-bottom: 20px;">当前 Module 或筛选条件下尚无 Brand Asset。</p>
              <button class="btn btn-primary btn-sm" id="exp-empty-create-btn">
                <i class="ri-add-line"></i> 创建第一个 Asset
              </button>
            </div>
          ` : `
            <table class="asset-table">
              <thead>
                <tr>
                  <th style="width: 150px;">资产编号</th>
                  <th>标题与摘要 (双击/点击整行即可编辑)</th>
                  <th style="width: 130px;">模块维度</th>
                  <th style="width: 110px;">生命周期</th>
                  <th style="width: 90px;">版本</th>
                  <th style="width: 140px;">更新时间</th>
                  <th style="width: 120px; text-align: right;">快捷操作</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(asset => {
                  const mod = modules.find(m => m.id === asset.module_id);
                  const statusCn = asset.status === 'Published' ? '已发布' : asset.status === 'Draft' ? '草稿' : asset.status;
                  return `
                    <tr class="asset-row-item" data-id="${asset.id}" style="cursor: pointer;">
                      <td class="asset-code">${asset.asset_code}</td>
                      <td>
                        <div class="asset-title-text" style="font-weight: 600; color: var(--accent-primary);">${asset.title}</div>
                        <div style="font-size: 11.5px; color: var(--text-dark-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 460px;">
                          ${asset.summary || '无摘要'}
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-module ${mod ? mod.code.toLowerCase() : 'com'}">${mod ? mod.code : 'COM'}</span>
                      </td>
                      <td>
                        <span class="badge badge-${asset.status.toLowerCase()}">${statusCn}</span>
                      </td>
                      <td style="font-family: var(--font-mono); font-size: 11px;">${asset.version}</td>
                      <td style="font-size: 11.5px; color: var(--text-dark-muted);">${new Date(asset.updated_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td style="text-align: right;" onclick="event.stopPropagation();">
                        <button class="btn btn-ghost btn-sm btn-icon act-duplicate" data-id="${asset.id}" title="复制资产">
                          <i class="ri-file-copy-line"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm btn-icon act-archive" data-id="${asset.id}" title="软删除归档 (Archived)">
                          <i class="ri-archive-line"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;

    // Bind Event Listeners
    container.querySelectorAll('.status-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeStatus = btn.getAttribute('data-status');
        render();
      });
    });

    const searchInput = container.querySelector('#exp-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchKeyword = e.target.value;
      });
      searchInput.addEventListener('change', () => {
        render();
      });
    }

    container.querySelectorAll('.asset-row-item').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        onSelectAsset(id);
      });
    });

    container.querySelectorAll('.act-duplicate').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        api.duplicateAsset(id);
        showToast('Asset 资产已成功复制', 'success');
        render();
      });
    });

    container.querySelectorAll('.act-archive').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        api.deleteAsset(id);
        showToast('Asset 资产已软删除并归档', 'info');
        render();
      });
    });

    const createBtn = container.querySelector('#exp-create-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        createNewAsset(currentMod ? currentMod.id : modules[0].id);
      });
    }

    const emptyCreateBtn = container.querySelector('#exp-empty-create-btn');
    if (emptyCreateBtn) {
      emptyCreateBtn.addEventListener('click', () => {
        createNewAsset(currentMod ? currentMod.id : modules[0].id);
      });
    }
  }

  function createNewAsset(moduleId) {
    const res = api.createAsset({
      module_id: moduleId,
      title: '未命名 Brand Asset',
      summary: '在此处输入 Asset 简要总结...',
      content: `# 未命名 Brand Asset\n\n在此输入 Asset 的详细知识点内容...`,
      quote: '',
      status: 'Draft'
    });
    if (res.success && res.data) {
      showToast('新建 Asset 资产成功', 'success');
      onSelectAsset(res.data.id);
    }
  }

  render();
}

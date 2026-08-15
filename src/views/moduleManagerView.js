/**
 * Brand Content OS (BCOS) - Module Manager Workspace View (FR-01)
 */

import { api } from '../services/api.js';
import { showToast } from '../components/toast.js';

export function renderModuleManagerView(container, onNavigate) {
  function render() {
    const modulesRes = api.getModules();
    const modules = modulesRes.success ? modulesRes.data : [];

    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <div class="view-title-group">
            <div class="view-title">
              <i class="ri-folders-line" style="color: var(--accent-primary);"></i>
              <span>Module 模块管理</span>
            </div>
            <span class="view-subtitle">品牌知识逻辑容器 (COM, KNO, VIS, DAT, BRD)。新增 Module 无需更改底层 DB Schema。</span>
          </div>
          <div class="view-actions">
            <button class="btn btn-primary btn-sm" id="mod-create-btn">
              <i class="ri-add-line"></i> 新增 Module
            </button>
          </div>
        </header>

        <div class="view-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${modules.map(m => `
              <div class="panel">
                <div class="panel-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-module ${m.code.toLowerCase()}">${m.code}</span>
                    <span style="font-weight: 700; font-size: 14px;">${m.name}</span>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-ghost btn-sm btn-icon mod-del-btn" data-id="${m.id}" title="删除空 Module">
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
                <div class="panel-body">
                  <div style="font-size: 12.5px; color: var(--text-dark-muted); margin-bottom: 12px; height: 38px; overflow: hidden;">${m.description || '无描述'}</div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span style="color: var(--text-dark-muted);">Icon: <i class="${m.icon}"></i></span>
                    <button class="btn btn-secondary btn-sm mod-view-assets-btn" data-code="${m.code}">
                      浏览 Asset 列表 <i class="ri-arrow-right-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind events
    container.querySelectorAll('.mod-view-assets-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        onNavigate(`module-${code.toLowerCase()}`);
      });
    });

    container.querySelectorAll('.mod-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const res = api.deleteModule(id);
        if (res.success) {
          showToast('Module 已删除', 'info');
          render();
        } else {
          showToast(res.error.message, 'error');
        }
      });
    });

    const createBtn = container.querySelector('#mod-create-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const code = prompt('输入新 Module 代码 (例: RES / PAT):');
        if (!code) return;
        const name = prompt('输入 Module 名称 (例: Research & Patent):');
        if (!name) return;

        api.createModule({
          code: code.toUpperCase(),
          name,
          description: '扩展 Module 分类',
          icon: 'ri-folder-add-line'
        });

        showToast(`Module ${code.toUpperCase()} 创建成功`, 'success');
        render();
      });
    }
  }

  render();
}

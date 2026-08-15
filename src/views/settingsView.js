/**
 * Brand Content OS (BCOS) - Settings Workspace View
 */

import { showToast } from '../components/toast.js';
import { store } from '../services/store.js';

export function renderSettingsView(container) {
  function render() {
    const isLight = document.body.classList.contains('theme-light');

    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <div class="view-title-group">
            <div class="view-title">
              <i class="ri-settings-4-line" style="color: var(--accent-primary);"></i>
              <span>System Settings 系统设置</span>
            </div>
            <span class="view-subtitle">管理 BCOS 工作区主题、数据备份还原与系统配置</span>
          </div>
        </header>

        <div class="view-body" style="max-width: 800px;">
          <!-- Section 1: Appearance & Theme -->
          <div class="panel" style="margin-bottom: 24px;">
            <div class="panel-header">
              <span class="panel-title"><i class="ri-palette-line"></i> 主题外观 (Theme)</span>
            </div>
            <div class="panel-body" style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">色彩主题模式</div>
                <div style="font-size: 12px; color: var(--text-dark-muted);">可以在极简极客深色模式与清晰亮色模式间无缝切换</div>
              </div>
              <button class="btn btn-secondary" id="set-theme-toggle-btn">
                <i class="${isLight ? 'ri-moon-line' : 'ri-sun-line'}"></i>
                <span>${isLight ? '切换为深色模式 (Dark)' : '切换为亮色模式 (Light)'}</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Data Backup & Restore -->
          <div class="panel" style="margin-bottom: 24px;">
            <div class="panel-header">
              <span class="panel-title"><i class="ri-database-2-line"></i> 数据库备份与还原 (Backup & Restore)</span>
            </div>
            <div class="panel-body" style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">导出数据库完整 JSON 快照</div>
                  <div style="font-size: 12px; color: var(--text-dark-muted);">导出包含 Modules, Assets, Versions, Relations 及 Releases 的完整 JSON 文件</div>
                </div>
                <button class="btn btn-secondary" id="set-export-json-btn">
                  <i class="ri-download-2-line"></i> 导出 JSON 备份
                </button>
              </div>

              <div style="border-top: 1px solid var(--border-dark); padding-top: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">还原 JSON 数据快照</div>
                  <div style="font-size: 12px; color: var(--text-dark-muted);">导入历史 BCOS 数据库备份 JSON 文件</div>
                </div>
                <label class="btn btn-secondary" style="cursor: pointer;">
                  <i class="ri-upload-2-line"></i> 导入并还原
                  <input type="file" id="set-restore-json-input" accept=".json" style="display: none;" />
                </label>
              </div>
            </div>
          </div>

          <!-- Section 3: Reset Data -->
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title" style="color: var(--accent-rose);"><i class="ri-refresh-line"></i> 重置数据种子</span>
            </div>
            <div class="panel-body" style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">恢复 Sprint 0 & Sprint 1 初始数据</div>
                <div style="font-size: 12px; color: var(--text-dark-muted);">重置 LocalStorage 并重新装载 Sprint 0 与 Sprint 1 的 Brand Asset 种子库</div>
              </div>
              <button class="btn btn-secondary" id="set-reset-seed-btn" style="border-color: rgba(244, 63, 94, 0.4); color: var(--accent-rose);">
                <i class="ri-restart-line"></i> 重置为 Seed 数据
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Theme Toggle
    const themeBtn = container.querySelector('#set-theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        if (document.body.classList.contains('theme-light')) {
          document.body.classList.remove('theme-light');
          document.body.classList.add('theme-dark');
        } else {
          document.body.classList.remove('theme-dark');
          document.body.classList.add('theme-light');
        }
        render();
      });
    }

    // Bind Export JSON
    const exportBtn = container.querySelector('#set-export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const raw = localStorage.getItem('BCOS_DB_V1');
        if (!raw) return;
        const blob = new Blob([raw], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BCOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('JSON 备份文件导出成功', 'success');
      });
    }

    // Bind Restore JSON
    const restoreInput = container.querySelector('#set-restore-json-input');
    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed.assets && parsed.modules) {
              localStorage.setItem('BCOS_DB_V1', JSON.stringify(parsed));
              store.loadState();
              showToast('数据还原成功！', 'success');
              render();
            } else {
              showToast('无效的 BCOS 备份格式', 'error');
            }
          } catch (err) {
            showToast('JSON 解析失败', 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Bind Reset Seed
    const resetBtn = container.querySelector('#set-reset-seed-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('确认将所有资产与版本重置为 Sprint 0 & Sprint 1 初始 Seed 数据？')) {
          store.resetToSeed();
          showToast('数据已成功重置为 Seed 状态', 'success');
          render();
        }
      });
    }
  }

  render();
}

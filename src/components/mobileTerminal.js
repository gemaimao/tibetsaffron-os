/**
 * Brand Content OS (BCOS) - Mobile Terminal Quick Field Ingest & Touch Component
 * Enables field workers, brand managers & scientists to capture notes, photos & evidence on mobile devices.
 */

import { api } from '../services/api.js';
import { showToast } from './toast.js';

export function setupMobileTerminal(onNavigateToAsset) {
  const isMobile = window.innerWidth <= 768;

  // Inject Mobile Bottom Quick Bar Container into body
  const container = document.createElement('div');
  container.id = 'mobile-terminal-bar';
  container.style.cssText = `
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 999;
    display: flex;
    gap: 10px;
  `;

  container.innerHTML = `
    <button id="mobile-quick-add-btn" class="btn btn-primary" style="border-radius: 30px; padding: 12px 20px; box-shadow: 0 8px 24px rgba(59,130,246,0.4); font-weight: 600; display: flex; align-items: center; gap: 8px;">
      <i class="ri-add-line" style="font-size: 18px;"></i> 手机快捷采集
    </button>
  `;

  document.body.appendChild(container);

  // Quick Ingest Modal Sheet
  const modal = document.createElement('div');
  modal.id = 'mobile-ingest-modal';
  modal.className = 'modal-backdrop';
  modal.style.display = 'none';

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 500px; border-radius: 20px; padding: 24px; background-color: var(--bg-dark-secondary); border: 1px solid var(--border-dark-strong);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 17px; font-weight: 700; color: var(--text-dark-primary); display: flex; align-items: center; gap: 8px;">
          <i class="ri-smartphone-line" style="color: var(--accent-primary);"></i> 手机移动终端 · 极速采集
        </h3>
        <button class="btn btn-ghost btn-sm btn-icon" id="mob-close-btn"><i class="ri-close-line"></i></button>
      </div>

      <p style="font-size: 12.5px; color: var(--text-dark-muted); margin-bottom: 14px;">
        在手机上录入任何文字、现场笔记或检测信息，系统将自动消化并与 9 大认知主库及 7 级证据层对齐。
      </p>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        <input type="text" id="mob-title-input" placeholder="输入 Asset 标题 (如: 西藏林芝米瑞乡现场采样记录)..." style="width: 100%; padding: 10px 14px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 8px; color: var(--text-dark-primary); font-size: 13.5px; outline: none;" />
        
        <select id="mob-module-select" style="width: 100%; padding: 10px 14px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 8px; color: var(--text-dark-primary); font-size: 13.5px;">
          <option value="mod-kno">KNO 知识层 (SFR-KNO 认知底库)</option>
          <option value="mod-dat">DAT 数据层 (Evidence & Data 证据层)</option>
          <option value="mod-com">COM 传播层 (口号/公关/Pitch)</option>
          <option value="mod-vis">VIS 视觉层 (4K 镜头/包装 Token)</option>
          <option value="mod-brd">BRD 品牌行为层 (愿景/法理防线)</option>
        </select>

        <textarea id="mob-content-input" rows="5" placeholder="在此粘贴或输入原始文本/数据段落..." style="width: 100%; padding: 12px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 8px; color: var(--text-dark-primary); font-size: 13px; outline: none; resize: none;"></textarea>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-secondary" id="mob-cancel-btn" style="flex: 1;">取消</button>
        <button class="btn btn-primary" id="mob-save-btn" style="flex: 2;">
          <i class="ri-magic-line"></i> 提交并智能消化
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Bind Events
  const openBtn = document.getElementById('mobile-quick-add-btn');
  const closeBtn = document.getElementById('mob-close-btn');
  const cancelBtn = document.getElementById('mob-cancel-btn');
  const saveBtn = document.getElementById('mob-save-btn');

  function openModal() {
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const title = document.getElementById('mob-title-input').value.trim() || '手机终端极速速记';
      const moduleId = document.getElementById('mob-module-select').value;
      const content = document.getElementById('mob-content-input').value.trim() || '手机终端输入的内容...';

      const res = api.createAsset({
        module_id: moduleId,
        title: title,
        summary: content.slice(0, 100),
        content: content,
        status: 'Draft'
      });

      if (res.success && res.data) {
        showToast('手机端录入成功，已自动对齐知识库', 'success');
        closeModal();
        if (onNavigateToAsset) {
          onNavigateToAsset(res.data.id);
        }
      }
    });
  }
}

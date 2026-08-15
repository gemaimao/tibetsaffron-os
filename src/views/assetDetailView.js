/**
 * Brand Content OS (BCOS) - Asset Editor Workspace View (Core Page)
 * 3-Column Split View & Side Inspector: Title, Summary, Content Editor + Live Preview, Version History, Relations, Export
 */

import { api } from '../services/api.js';
import { store } from '../services/store.js';
import { showToast } from '../components/toast.js';
import { marked } from 'marked';

export function renderAssetDetailView(container, assetId, onBack, onSelectAsset) {
  const assetRes = api.getAsset(assetId);
  if (!assetRes.success) {
    container.innerHTML = `<div class="view-body"><div style="padding: 40px; text-align: center;">未找到 Asset: ${assetId}</div></div>`;
    return;
  }

  let currentAsset = assetRes.data;
  const modulesRes = api.getModules();
  const modules = modulesRes.success ? modulesRes.data : [];
  const tagsRes = store.getTags ? store.getTags() : [];

  let isAutoSaving = false;
  let autoSaveTimeout = null;
  let activeRightTab = 'metadata'; // 'metadata' | 'versions' | 'relations' | 'export'
  let diffTargetVersion = null;

  function render() {
    const versionsRes = api.getAssetVersions(currentAsset.id);
    const versions = versionsRes.success ? versionsRes.data : [];

    const relationsRes = api.getAssetRelations(currentAsset.id);
    const relations = relationsRes.success ? relationsRes.data : [];

    const allAssetsRes = api.getAssets({ size: 100 });
    const allAssets = allAssetsRes.success ? allAssetsRes.data.items.filter(a => a.id !== currentAsset.id) : [];

    const mod = modules.find(m => m.id === currentAsset.module_id);

    container.innerHTML = `
      <div class="view-container">
        <!-- Top Workspace Header -->
        <header class="view-header">
          <div class="view-title-group">
            <button class="btn btn-ghost btn-sm btn-icon" id="editor-back-btn" title="返回资产列表">
              <i class="ri-arrow-left-line"></i>
            </button>
            <span class="asset-code" style="font-size: 16px;">${currentAsset.asset_code}</span>
            <input type="text" id="editor-title-input" class="view-title" value="${escapeHtml(currentAsset.title)}" style="background: transparent; border: none; border-bottom: 1px dashed var(--border-dark); outline: none; font-size: 16px; padding: 2px 4px; min-width: 280px;" placeholder="资产标题..." />
          </div>
          <div class="view-actions">
            <span id="save-indicator" style="font-size: 12px; color: var(--text-dark-muted); font-family: var(--font-mono); margin-right: 8px;">
              <i class="ri-checkbox-circle-line" style="color: var(--accent-emerald);"></i> 已同步 (Auto-saved)
            </span>
            <select id="editor-status-select" style="background-color: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); color: var(--text-dark-primary); padding: 5px 10px; border-radius: var(--radius-md); font-size: 12px; font-weight: 600;">
              ${['Draft', 'Review', 'Published', 'Archived'].map(st => `
                <option value="${st}" ${currentAsset.status === st ? 'selected' : ''}>${st}</option>
              `).join('')}
            </select>
            <button class="btn btn-secondary btn-sm" id="editor-export-md-btn">
              <i class="ri-download-line"></i> 导出 MD
            </button>
            <button class="btn btn-ghost btn-sm" id="editor-delete-btn" style="color: var(--accent-rose);" title="${currentAsset.status === 'Draft' ? '彻底删除草稿' : '软删除并归档'}">
              <i class="ri-delete-bin-line"></i> ${currentAsset.status === 'Draft' ? '删除草稿' : '软删除归档'}
            </button>
          </div>
        </header>

        <!-- 3-Column Workspace Main Area -->
        <div style="flex: 1; display: flex; overflow: hidden;">
          
          <!-- Column 2: Split Markdown Editor & Live Preview (Main Workspace) -->
          <div style="flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; border-right: 1px solid var(--border-dark);">
            <!-- Summary & Quote Bar -->
            <div style="padding: 14px 20px; background-color: var(--bg-dark-secondary); border-bottom: 1px solid var(--border-dark); display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase; width: 60px;">Summary:</span>
                <input type="text" id="editor-summary-input" value="${escapeHtml(currentAsset.summary || '')}" placeholder="一句话知识简要总结..." style="flex: 1; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 5px 10px; color: var(--text-dark-primary); font-size: 12.5px; outline: none;" />
              </div>
              <div style="display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase; width: 60px;">Quote:</span>
                <input type="text" id="editor-quote-input" value="${escapeHtml(currentAsset.quote || '')}" placeholder="引用名言金句..." style="flex: 1; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 5px 10px; color: var(--text-dark-primary); font-size: 12.5px; outline: none;" />
              </div>
            </div>

            <!-- Split Editor Toolbar -->
            <div class="pane-toolbar">
              <span><i class="ri-markdown-line"></i> Markdown Source</span>
              <span><i class="ri-eye-line"></i> Real-time Rendered Preview</span>
            </div>

            <!-- Markdown Textarea + Rendered View Split -->
            <div class="editor-workspace">
              <div class="editor-pane">
                <textarea id="editor-textarea" class="code-textarea" placeholder="使用 Markdown 撰写原子化 Brand Asset...">${escapeHtml(currentAsset.content || '')}</textarea>
              </div>
              <div class="preview-pane">
                <div id="editor-preview-body" class="preview-body"></div>
              </div>
            </div>
          </div>

          <!-- Column 3: Inspector Panel (Right Drawer) -->
          <div style="width: 320px; background-color: var(--bg-dark-secondary); display: flex; flex-direction: column; height: 100%; flex-shrink: 0; user-select: none;">
            <!-- Inspector Tabs Header -->
            <div class="tab-headers">
              <div class="tab-btn ${activeRightTab === 'metadata' ? 'active' : ''}" data-tab="metadata">Metadata</div>
              <div class="tab-btn ${activeRightTab === 'versions' ? 'active' : ''}" data-tab="versions">Versions (${versions.length})</div>
              <div class="tab-btn ${activeRightTab === 'relations' ? 'active' : ''}" data-tab="relations">Relations (${relations.length})</div>
            </div>

            <!-- Inspector Tab Contents -->
            <div class="tab-content">
              ${activeRightTab === 'metadata' ? renderMetadataTab(currentAsset, mod, tagsRes) : ''}
              ${activeRightTab === 'versions' ? renderVersionsTab(versions, currentAsset, diffTargetVersion) : ''}
              ${activeRightTab === 'relations' ? renderRelationsTab(relations, allAssets, currentAsset) : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize Markdown Preview
    const textarea = container.querySelector('#editor-textarea');
    const previewBody = container.querySelector('#editor-preview-body');
    
    function updatePreview() {
      if (textarea && previewBody) {
        try {
          previewBody.innerHTML = marked.parse(textarea.value || '');
        } catch (e) {
          previewBody.innerText = textarea.value;
        }
      }
    }

    updatePreview();

    // Trigger Auto-save on Input
    function triggerAutoSave() {
      const saveInd = container.querySelector('#save-indicator');
      if (saveInd) {
        saveInd.innerHTML = `<i class="ri-loader-4-line ri-spin" style="color: var(--accent-amber);"></i> 保存中...`;
      }

      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

      autoSaveTimeout = setTimeout(() => {
        const newTitle = container.querySelector('#editor-title-input').value.trim();
        const newSummary = container.querySelector('#editor-summary-input').value.trim();
        const newQuote = container.querySelector('#editor-quote-input').value.trim();
        const newContent = textarea.value;
        const newStatus = container.querySelector('#editor-status-select').value;
        const newModuleId = container.querySelector('#editor-module-select') ? container.querySelector('#editor-module-select').value : currentAsset.module_id;

        const updateRes = api.updateAsset(currentAsset.id, {
          title: newTitle || currentAsset.title,
          summary: newSummary,
          quote: newQuote,
          content: newContent,
          status: newStatus,
          module_id: newModuleId
        });

        if (updateRes.success) {
          currentAsset = updateRes.data;
          if (saveInd) {
            saveInd.innerHTML = `<i class="ri-checkbox-circle-line" style="color: var(--accent-emerald);"></i> 已保存 (${currentAsset.version})`;
          }
        }
      }, 600);
    }

    textarea.addEventListener('input', () => {
      updatePreview();
      triggerAutoSave();
    });

    container.querySelector('#editor-title-input').addEventListener('input', triggerAutoSave);
    container.querySelector('#editor-summary-input').addEventListener('input', triggerAutoSave);
    container.querySelector('#editor-quote-input').addEventListener('input', triggerAutoSave);
    container.querySelector('#editor-status-select').addEventListener('change', triggerAutoSave);

    // Inspector Tab Switching
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeRightTab = btn.getAttribute('data-tab');
        render();
      });
    });

    // Navigation & Export
    container.querySelector('#editor-back-btn').addEventListener('click', onBack);

    const deleteBtn = container.querySelector('#editor-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const isDraft = currentAsset.status === 'Draft';
        const msg = isDraft
          ? `确定要彻底物理删除草稿资产 [${currentAsset.asset_code} • ${currentAsset.title}] 吗？`
          : `确定要软删除归档已发布资产 [${currentAsset.asset_code} • ${currentAsset.title}] 吗？\n(归档后资产将从主列表中隐藏，可随时恢复)`;

        if (confirm(msg)) {
          api.deleteAsset(currentAsset.id);
          showToast(isDraft ? `草稿资产 [${currentAsset.asset_code}] 已彻底删除` : `资产 [${currentAsset.asset_code}] 已软删除并归档`, 'info');
          onBack();
        }
      });
    }

    container.querySelector('#editor-export-md-btn').addEventListener('click', () => {
      api.exportAssetMarkdown(currentAsset.id);
      showToast('Markdown 已导出', 'success');
    });

    // Bind Version Restore & Diff Events
    container.querySelectorAll('.ver-restore-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const verId = btn.getAttribute('data-id');
        api.restoreAssetVersion(currentAsset.id, verId);
        showToast('已从历史版本恢复并生成新 Version', 'success');
        const refreshed = api.getAsset(currentAsset.id);
        if (refreshed.success) currentAsset = refreshed.data;
        render();
      });
    });

    container.querySelectorAll('.ver-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const verId = btn.getAttribute('data-id');
        diffTargetVersion = diffTargetVersion === verId ? null : verId;
        render();
      });
    });

    // Relation Creation Event
    const addRelBtn = container.querySelector('#add-relation-submit');
    if (addRelBtn) {
      addRelBtn.addEventListener('click', () => {
        const targetId = container.querySelector('#rel-target-select').value;
        const relType = container.querySelector('#rel-type-select').value;
        const desc = container.querySelector('#rel-desc-input').value;
        if (!targetId) {
          showToast('请选择要关联的 Asset', 'warning');
          return;
        }
        api.createRelation(currentAsset.id, targetId, relType, desc);
        showToast('知识关联建立成功', 'success');
        render();
      });
    }

    container.querySelectorAll('.rel-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const relId = btn.getAttribute('data-id');
        api.deleteRelation(relId);
        showToast('关联已删除', 'info');
        render();
      });
    });

    container.querySelectorAll('.rel-link-item').forEach(link => {
      link.addEventListener('click', () => {
        const targetId = link.getAttribute('data-id');
        onSelectAsset(targetId);
      });
    });
  }

  function renderMetadataTab(asset, mod, tags) {
    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase;">Asset Code (Immutable)</label>
          <div style="font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: var(--accent-primary); margin-top: 4px;">
            ${asset.asset_code}
          </div>
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase;">Module 分类</label>
          <select id="editor-module-select" style="width: 100%; margin-top: 4px; padding: 6px 10px; background-color: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); color: var(--text-dark-primary); font-size: 13px;">
            ${modules.map(m => `
              <option value="${m.id}" ${asset.module_id === m.id ? 'selected' : ''}>${m.code} • ${m.name}</option>
            `).join('')}
          </select>
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase;">当前 Version</label>
          <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--accent-cyan); margin-top: 4px;">
            ${asset.version} (Append-only)
          </div>
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase;">时间戳</label>
          <div style="font-size: 12px; color: var(--text-dark-muted); margin-top: 4px;">
            <div>Created: ${new Date(asset.created_at).toLocaleString()}</div>
            <div>Updated: ${new Date(asset.updated_at).toLocaleString()}</div>
          </div>
        </div>

        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-dark);">
          <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="window.BCOS_EXPORT_JSON('${asset.id}')">
            <i class="ri-file-code-line"></i> 导出完整 Metadata JSON
          </button>
        </div>
      </div>
    `;
  }

  function renderVersionsTab(versions, currentAsset, diffTargetId) {
    const targetVersionRecord = diffTargetId ? versions.find(v => v.id === diffTargetId) : null;

    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="font-size: 12px; color: var(--text-dark-muted);">
          版本遵循追加模式 (Append-only)，每次保存均留存历史快照。
        </div>

        ${targetVersionRecord ? `
          <div style="background: var(--bg-dark-tertiary); border: 1px solid var(--accent-primary); border-radius: var(--radius-md); padding: 10px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 12px; font-weight: 700; color: var(--accent-primary);">
              <span>Diff 对比: Current (${currentAsset.version}) vs ${targetVersionRecord.version}</span>
              <button class="btn btn-ghost btn-sm" onclick="window.BCOS_CLEAR_DIFF()"><i class="ri-close-line"></i></button>
            </div>
            <div class="diff-container">
              <div class="diff-pane">
                <div style="font-weight: 700; margin-bottom: 4px; color: var(--text-dark-muted);">Current Content</div>
                ${escapeHtml(currentAsset.content)}
              </div>
              <div class="diff-pane">
                <div style="font-weight: 700; margin-bottom: 4px; color: var(--text-dark-muted);">${targetVersionRecord.version} Content</div>
                ${escapeHtml(targetVersionRecord.content)}
              </div>
            </div>
          </div>
        ` : ''}

        ${versions.map(ver => `
          <div style="background-color: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-family: var(--font-mono); font-weight: 700; font-size: 13px; color: var(--accent-cyan);">${ver.version}</span>
              <span style="font-size: 10px; color: var(--text-dark-muted);">${new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-dark-primary); margin-bottom: 2px;">${ver.title}</div>
            <div style="font-size: 10.5px; color: var(--text-dark-muted); margin-bottom: 8px;">Editor: ${ver.editor || 'Brand Editor'}</div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm ver-diff-btn" data-id="${ver.id}" style="flex: 1; font-size: 11px; padding: 3px 6px;">
                <i class="ri-git-commit-line"></i> ${diffTargetId === ver.id ? '关闭 Diff' : 'Diff 对比'}
              </button>
              ${ver.version !== currentAsset.version ? `
                <button class="btn btn-primary btn-sm ver-restore-btn" data-id="${ver.id}" style="flex: 1; font-size: 11px; padding: 3px 6px;">
                  <i class="ri-history-line"></i> 恢复此版本
                </button>
              ` : '<span style="font-size: 11px; color: var(--accent-emerald); font-weight: 600; padding: 3px 6px;">当前版本</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderRelationsTab(relations, allAssets, currentAsset) {
    const relationTypes = ['Reference', 'Support', 'Evidence', 'Image', 'Video', 'Dataset', 'Research', 'History', 'Future'];

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Add Relation Form -->
        <div style="background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--text-dark-primary);">建立知识双向关联</div>
          
          <select id="rel-target-select" style="padding: 5px 8px; background-color: var(--bg-dark-secondary); border: 1px solid var(--border-dark); border-radius: var(--radius-sm); color: var(--text-dark-primary); font-size: 12px;">
            <option value="">选择要关联的目标 Asset...</option>
            ${allAssets.map(a => `<option value="${a.id}">${a.asset_code} • ${a.title}</option>`).join('')}
          </select>

          <select id="rel-type-select" style="padding: 5px 8px; background-color: var(--bg-dark-secondary); border: 1px solid var(--border-dark); border-radius: var(--radius-sm); color: var(--text-dark-primary); font-size: 12px;">
            ${relationTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>

          <input type="text" id="rel-desc-input" placeholder="关联描述 (可选)..." style="padding: 5px 8px; background-color: var(--bg-dark-secondary); border: 1px solid var(--border-dark); border-radius: var(--radius-sm); color: var(--text-dark-primary); font-size: 12px; outline: none;" />

          <button class="btn btn-primary btn-sm" id="add-relation-submit" style="margin-top: 4px;">
            <i class="ri-link"></i> 添加关联
          </button>
        </div>

        <!-- Relations Network List -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase; margin-bottom: 8px;">关联知识网络 (${relations.length})</div>
          ${relations.length === 0 ? `
            <div style="font-size: 12px; color: var(--text-dark-muted); text-align: center; padding: 16px;">
              暂无关联 Asset。在上方建立关联以织造品牌知识网络。
            </div>
          ` : relations.map(rel => `
            <div style="background-color: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 10px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
              <div style="cursor: pointer;" class="rel-link-item" data-id="${rel.relatedAsset.id}">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 10px; font-weight: 700; color: var(--accent-purple); border: 1px solid rgba(139, 92, 246, 0.4); padding: 1px 4px; border-radius: 3px;">${rel.relation_type}</span>
                  <span class="asset-code" style="font-size: 12px;">${rel.relatedAsset.asset_code}</span>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: var(--text-dark-primary); margin-top: 2px;">${rel.relatedAsset.title}</div>
                ${rel.description ? `<div style="font-size: 11px; color: var(--text-dark-muted);">${rel.description}</div>` : ''}
              </div>
              <button class="btn btn-ghost btn-sm btn-icon rel-delete-btn" data-id="${rel.id}" title="删除关联">
                <i class="ri-close-line"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Global helper for inline exported functions
  window.BCOS_EXPORT_JSON = (id) => api.exportAssetJSON(id);
  window.BCOS_CLEAR_DIFF = () => {
    diffTargetVersion = null;
    render();
  };

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  render();
}

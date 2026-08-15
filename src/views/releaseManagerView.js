/**
 * Brand Content OS (BCOS) - Release Manager Workspace View
 * Strictly enforces Architect Requirement: Release stores ONLY asset_version_id pointers (`assetCode @ version`).
 * Includes Release Creation Wizard, Release Diff Tool, and ZIP Bundle Export.
 */

import { api } from '../services/api.js';
import { showToast } from '../components/toast.js';

export function renderReleaseManagerView(container, onSelectAsset) {
  let selectedReleaseId = null;
  let isCreating = false;

  // Release Diff state
  let diffRelAId = null;
  let diffRelBId = null;

  function render() {
    const releasesRes = api.getReleases();
    const releases = releasesRes.success ? releasesRes.data : [];

    if (!selectedReleaseId && releases.length > 0) {
      selectedReleaseId = releases[0].id;
    }

    const currentRelease = releases.find(r => r.id === selectedReleaseId);

    const relAssetVers = selectedReleaseId ? store.getReleaseAssetVersions(selectedReleaseId) : [];

    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <div class="view-title-group">
            <div class="view-title">
              <i class="ri-git-branch-line" style="color: var(--accent-purple);"></i>
              <span>Release 发布版本管理</span>
            </div>
            <span class="view-subtitle">Sprint 阶段性快照指针，严禁复制正文，保持 SSOT 唯一可信源</span>
          </div>
          <div class="view-actions">
            <button class="btn btn-secondary btn-sm" id="rel-diff-tool-btn">
              <i class="ri-git-commit-line"></i> Release Diff 对比
            </button>
            <button class="btn btn-primary btn-sm" id="rel-create-btn">
              <i class="ri-add-line"></i> 创建新 Release
            </button>
          </div>
        </header>

        <div class="view-body" style="display: flex; gap: 24px; padding: 24px;">
          <!-- Left Column: Release List -->
          <div style="width: 320px; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted); text-transform: uppercase;">Releases History (${releases.length})</div>
            ${releases.length === 0 ? `
              <div style="padding: 20px; text-align: center; color: var(--text-dark-muted); font-size: 13px;">
                暂无 Release 版本。点击右上角“创建新 Release”。
              </div>
            ` : releases.map(rel => `
              <div class="rel-item-card ${rel.id === selectedReleaseId ? 'active-rel' : ''}" data-id="${rel.id}" style="background-color: var(--bg-dark-secondary); border: 1px solid ${rel.id === selectedReleaseId ? 'var(--accent-purple)' : 'var(--border-dark)'}; border-radius: var(--radius-lg); padding: 14px; cursor: pointer; transition: var(--transition-fast);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-family: var(--font-mono); font-weight: 700; font-size: 14px; color: var(--accent-cyan);">${rel.version}</span>
                  <span class="badge badge-published">${rel.status}</span>
                </div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text-dark-primary); margin-bottom: 4px;">${rel.name}</div>
                <div style="font-size: 12px; color: var(--text-dark-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-bottom: 8px;">${rel.description || '无描述'}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-dark-muted);">
                  <span>Asset 引用数: ${(rel.asset_version_ids || []).length}</span>
                  <span>${new Date(rel.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Right Column: Release Detail / Diff / Create Wizard -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; overflow-y: auto;">
            ${isCreating ? renderCreateWizard() : (diffRelAId && diffRelBId ? renderReleaseDiffView(releases) : renderReleaseDetail(currentRelease, relAssetVers))}
          </div>
        </div>
      </div>
    `;

    // Bind Event Listeners
    container.querySelectorAll('.rel-item-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedReleaseId = card.getAttribute('data-id');
        isCreating = false;
        diffRelAId = null;
        diffRelBId = null;
        render();
      });
    });

    const createBtn = container.querySelector('#rel-create-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        isCreating = true;
        diffRelAId = null;
        diffRelBId = null;
        render();
      });
    }

    const diffBtn = container.querySelector('#rel-diff-tool-btn');
    if (diffBtn) {
      diffBtn.addEventListener('click', () => {
        if (releases.length >= 2) {
          diffRelAId = releases[1].id;
          diffRelBId = releases[0].id;
          isCreating = false;
          render();
        } else {
          showToast('需要至少 2 个 Release 才能开启 Diff 对比', 'warning');
        }
      });
    }

    // Release Export ZIP
    const exportZipBtn = container.querySelector('#rel-export-zip-btn');
    if (exportZipBtn) {
      exportZipBtn.addEventListener('click', () => {
        if (currentRelease) {
          api.exportReleaseZIP(currentRelease.id);
          showToast('Release ZIP 打包下载中...', 'success');
        }
      });
    }

    // Bind Asset Item Click
    container.querySelectorAll('.rel-asset-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        onSelectAsset(id);
      });
    });

    // Wizard submit
    const wizardSubmitBtn = container.querySelector('#wizard-submit-btn');
    if (wizardSubmitBtn) {
      wizardSubmitBtn.addEventListener('click', () => {
        const name = container.querySelector('#wiz-name-input').value.trim();
        const verTag = container.querySelector('#wiz-ver-input').value.trim();
        const desc = container.querySelector('#wiz-desc-input').value.trim();

        const selectedVerIds = Array.from(container.querySelectorAll('.wiz-asset-checkbox:checked')).map(cb => cb.value);

        if (!name || !verTag) {
          showToast('请输入 Release 名称与 Version Tag', 'warning');
          return;
        }

        const newRel = api.createRelease(name, verTag, desc, selectedVerIds);
        if (newRel.success) {
          showToast(`Release ${verTag} 创建成功！`, 'success');
          isCreating = false;
          selectedReleaseId = newRel.data.id;
          render();
        }
      });
    }

    const wizardCancelBtn = container.querySelector('#wizard-cancel-btn');
    if (wizardCancelBtn) {
      wizardCancelBtn.addEventListener('click', () => {
        isCreating = false;
        render();
      });
    }

    // Diff selectors
    const selA = container.querySelector('#diff-sel-a');
    const selB = container.querySelector('#diff-sel-b');
    if (selA && selB) {
      selA.addEventListener('change', () => {
        diffRelAId = selA.value;
        render();
      });
      selB.addEventListener('change', () => {
        diffRelBId = selB.value;
        render();
      });
    }
  }

  function renderReleaseDetail(rel, relAssetVers) {
    if (!rel) {
      return `<div style="padding: 40px; text-align: center; color: var(--text-dark-muted);">未选择 Release</div>`;
    }

    return `
      <div class="panel">
        <div class="panel-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--accent-cyan);">${rel.version}</span>
              <span class="panel-title" style="font-size: 16px;">${rel.name}</span>
            </div>
            <div style="font-size: 12.5px; color: var(--text-dark-muted); margin-top: 4px;">${rel.description || '无描述'}</div>
          </div>
          <button class="btn btn-primary btn-sm" id="rel-export-zip-btn">
            <i class="ri-archive-line"></i> 导出 Release ZIP 预制包
          </button>
        </div>

        <div class="panel-body" style="padding: 0;">
          <div style="padding: 14px 20px; background-color: var(--bg-dark-tertiary); border-bottom: 1px solid var(--border-dark); font-size: 12.5px; font-weight: 600; color: var(--text-dark-secondary);">
            <i class="ri-links-line" style="color: var(--accent-primary);"></i> Included Asset Version Snapshots (${relAssetVers.length})
          </div>

          <table class="asset-table">
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>Included Version</th>
                <th>Title</th>
                <th>Quote</th>
              </tr>
            </thead>
            <tbody>
              ${relAssetVers.map(item => `
                <tr class="rel-asset-row" data-id="${item.parentAsset ? item.parentAsset.id : ''}">
                  <td class="asset-code">${item.parentAsset ? item.parentAsset.asset_code : 'UNKNOWN'}</td>
                  <td>
                    <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); bg-dark-tertiary; padding: 2px 6px; border-radius: 4px;">
                      ${item.parentAsset ? item.parentAsset.asset_code : ''} @ ${item.versionRecord.version}
                    </span>
                  </td>
                  <td class="asset-title-text">${item.versionRecord.title}</td>
                  <td style="font-size: 11.5px; color: var(--text-dark-muted); font-style: italic;">${item.versionRecord.quote || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderCreateWizard() {
    const assets = api.getAssets({ size: 100 }).data.items;

    return `
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title"><i class="ri-rocket-line" style="color: var(--accent-emerald);"></i> 创建 Sprint Release</span>
          <button class="btn btn-ghost btn-sm" id="wizard-cancel-btn"><i class="ri-close-line"></i> 取消</button>
        </div>
        <div class="panel-body" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-dark-secondary);">Release Name</label>
            <input type="text" id="wiz-name-input" placeholder="例如: Release v0.3 (Visual & Data Layer)" style="width: 100%; padding: 8px 12px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); color: var(--text-dark-primary); margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-dark-secondary);">Version Tag</label>
            <input type="text" id="wiz-ver-input" placeholder="例如: v0.3" style="width: 100%; padding: 8px 12px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); color: var(--text-dark-primary); margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-dark-secondary);">Description</label>
            <textarea id="wiz-desc-input" placeholder="描述此版本的 Release 变更范围..." style="width: 100%; padding: 8px 12px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); color: var(--text-dark-primary); margin-top: 4px; height: 60px; outline: none;"></textarea>
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-dark-secondary);">选择包含的 Asset Version 指针 (AssetCode @ Version)</label>
            <div style="max-height: 240px; overflow-y: auto; border: 1px solid var(--border-dark); border-radius: var(--radius-md); margin-top: 6px; padding: 10px; background: var(--bg-dark-primary);">
              ${assets.map(a => {
                const versions = api.getAssetVersions(a.id).data;
                const latestVer = versions[0];
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid var(--border-dark);">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                      <input type="checkbox" class="wiz-asset-checkbox" value="${latestVer ? latestVer.id : ''}" checked />
                      <span class="asset-code">${a.asset_code}</span>
                      <span>${a.title}</span>
                    </label>
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan);">${a.asset_code} @ ${latestVer ? latestVer.version : 'v1.0'}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button class="btn btn-primary" id="wizard-submit-btn">
              <i class="ri-check-line"></i> 确认创建 Release
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderReleaseDiffView(releases) {
    const relA = releases.find(r => r.id === diffRelAId);
    const relB = releases.find(r => r.id === diffRelBId);

    const listA = relA ? store.getReleaseAssetVersions(relA.id) : [];
    const listB = relB ? store.getReleaseAssetVersions(relB.id) : [];

    const codesA = new Set(listA.map(i => i.parentAsset ? i.parentAsset.asset_code : ''));
    const codesB = new Set(listB.map(i => i.parentAsset ? i.parentAsset.asset_code : ''));

    const addedInB = listB.filter(i => i.parentAsset && !codesA.has(i.parentAsset.asset_code));
    const removedInB = listA.filter(i => i.parentAsset && !codesB.has(i.parentAsset.asset_code));
    const commonInBoth = listB.filter(i => i.parentAsset && codesA.has(i.parentAsset.asset_code));

    return `
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title"><i class="ri-git-commit-line" style="color: var(--accent-purple);"></i> Release Diff 对比工具</span>
        </div>
        <div class="panel-body" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; gap: 16px; align-items: center;">
            <div style="flex: 1;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted);">基准 Release A (Baseline)</label>
              <select id="diff-sel-a" style="width: 100%; margin-top: 4px; padding: 6px 10px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); color: var(--text-dark-primary);">
                ${releases.map(r => `<option value="${r.id}" ${r.id === diffRelAId ? 'selected' : ''}>${r.version} • ${r.name}</option>`).join('')}
              </select>
            </div>
            <i class="ri-arrow-right-line" style="font-size: 20px; color: var(--text-dark-muted); margin-top: 18px;"></i>
            <div style="flex: 1;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-dark-muted);">对比 Release B (Target)</label>
              <select id="diff-sel-b" style="width: 100%; margin-top: 4px; padding: 6px 10px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); color: var(--text-dark-primary);">
                ${releases.map(r => `<option value="${r.id}" ${r.id === diffRelBId ? 'selected' : ''}>${r.version} • ${r.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-dark-primary);">Diff 结果摘要:</div>
            
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 10px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--accent-emerald);">+ 新增 Asset (Added in Target): ${addedInB.length}</div>
              ${addedInB.map(i => `<div style="font-size: 12px; margin-top: 2px;">• <span class="asset-code">${i.parentAsset.asset_code}</span>: ${i.versionRecord.title}</div>`).join('')}
            </div>

            <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: var(--radius-md); padding: 10px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--accent-rose);">- 移除 Asset (Removed in Target): ${removedInB.length}</div>
              ${removedInB.map(i => `<div style="font-size: 12px; margin-top: 2px;">• <span class="asset-code">${i.parentAsset.asset_code}</span>: ${i.versionRecord.title}</div>`).join('')}
            </div>

            <div style="background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 10px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--accent-cyan);">= 相同/更新 Asset (Common): ${commonInBoth.length}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render();
}

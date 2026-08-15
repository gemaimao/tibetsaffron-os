/**
 * Brand Content OS (BCOS) - Asset Knowledge Network Graph Workspace View
 * Interactive visual representation of Asset ↔ Asset bidirectional links
 */

import { api } from '../services/api.js';

export function renderRelationGraphView(container, onSelectAsset) {
  const assetsRes = api.getAssets({ size: 100 });
  const assets = assetsRes.success ? assetsRes.data.items : [];
  const modulesRes = api.getModules();
  const modules = modulesRes.success ? modulesRes.data : [];

  const relations = store.relations || [];

  container.innerHTML = `
    <div class="view-container">
      <header class="view-header">
        <div class="view-title-group">
          <div class="view-title">
            <i class="ri-node-tree" style="color: var(--accent-purple);"></i>
            <span>Asset 知识图谱网络 (Knowledge Network Graph)</span>
          </div>
          <span class="view-subtitle">表达 COM ↔ KNO ↔ VIS ↔ DAT ↔ BRD 资产之间的双向关联结构</span>
        </div>
      </header>

      <div class="view-body" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title"><i class="ri-share-line"></i> 关联节点概览 (${assets.length} Assets, ${relations.length} Relations)</span>
          </div>
          <div class="panel-body" style="min-height: 480px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-dark-primary); border-radius: var(--radius-md); position: relative; overflow: hidden;">
            
            <div style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; padding: 20px;">
              ${assets.map(a => {
                const mod = modules.find(m => m.id === a.module_id);
                const relCount = relations.filter(r => r.source_asset_id === a.id || r.target_asset_id === a.id).length;
                return `
                  <div class="graph-node-card" data-id="${a.id}" style="background-color: var(--bg-dark-card); border: 1px solid var(--border-dark); border-left: 4px solid var(--module-${mod ? mod.code.toLowerCase() : 'com'}); border-radius: var(--radius-md); padding: 14px; cursor: pointer; transition: var(--transition-fast);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span class="asset-code">${a.asset_code}</span>
                      <span style="font-size: 11px; font-weight: 600; color: var(--accent-purple); font-family: var(--font-mono);">${relCount} Links</span>
                    </div>
                    <div style="font-weight: 700; font-size: 13.5px; color: var(--text-dark-primary); margin-bottom: 4px;">${a.title}</div>
                    <div style="font-size: 11.5px; color: var(--text-dark-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${a.summary || '无摘要'}</div>
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.graph-node-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      onSelectAsset(id);
    });
  });
}

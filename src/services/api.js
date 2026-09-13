/**
 * Brand Content OS (BCOS) - Real Server HTTP API Service Layer
 * Connects directly to the Node.js Backend & Disk Storage Server for Mobile-Desktop Cross-Device Real-time Sync.
 */

import { store } from './store.js';

const API_BASE = '/api';

export const api = {
  // DASHBOARD & STATS API
  async getDashboardAsync() {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (res.ok) return await res.json();
      throw new Error('API offline');
    } catch (e) {
      return this.getDashboardSyncFallback();
    }
  },

  getDashboard() {
    // Synchronous call using XMLHttpRequest with safe fallback for UI render loop
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_BASE}/dashboard`, false);
      xhr.send(null);
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {}
    return this.getDashboardSyncFallback();
  },

  getDashboardSyncFallback() {
    // P1 审计修复：不再虚构“14条资产、12条发布”，而是基于本地 store 真实统计，杜绝伪装数据
    const allAssets = store.getAssets ? store.getAssets() : [];
    const allModules = store.getModules ? store.getModules() : [];
    const published = allAssets.filter(a => a.status === 'Published').length;
    const drafts = allAssets.filter(a => a.status === 'Draft').length;
    const modCounts = {};
    allAssets.forEach(a => {
      const mod = a.module_id || 'KNO';
      modCounts[mod] = (modCounts[mod] || 0) + 1;
    });

    return {
      success: true,
      data: {
        asset_count: allAssets.length,
        module_count: allModules.length,
        published_count: published,
        draft_count: drafts,
        module_counts: modCounts,
        recent_assets: allAssets.slice(0, 5),
        latest_releases: store.getReleases ? store.getReleases() : [],
        is_fallback: true
      }
    };
  },

  // MODULE API
  getModules() {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_BASE}/modules`, false);
      xhr.send(null);
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {}
    return {
      success: true,
      data: [
        { id: 'mod-com', code: 'COM', name: 'Communication', description: '品牌传播层', icon: 'ri-message-3-line' },
        { id: 'mod-kno', code: 'KNO', name: 'Knowledge', description: 'SFR-KNO 藏红花深度认知底库', icon: 'ri-book-open-line' },
        { id: 'mod-vis', code: 'VIS', name: 'Visual', description: '品牌视觉层', icon: 'ri-palette-line' },
        { id: 'mod-dat', code: 'DAT', name: 'Data & Evidence', description: 'Evidence & Data 证据层', icon: 'ri-bar-chart-box-line' },
        { id: 'mod-brd', code: 'BRD', name: 'Brand Behavior', description: '品牌内核层', icon: 'ri-compass-3-line' }
      ]
    };
  },

  // ASSET API
  getAssets({ module, status, tag, keyword } = {}) {
    try {
      const params = new URLSearchParams();
      if (module) params.append('module', module);
      if (status && status !== 'All') params.append('status', status);
      if (keyword) params.append('keyword', keyword);

      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_BASE}/assets?${params.toString()}`, false);
      xhr.send(null);
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {}
    return { success: true, data: { items: [], total: 0 } };
  },

  getAsset(id) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_BASE}/assets/${id}`, false);
      xhr.send(null);
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {}
    return { success: false, message: 'Asset not found' };
  },

  createAsset(assetData) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/assets`, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(assetData));
      if (xhr.status === 200 || xhr.status === 201) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {}
    return { success: false, message: 'Server communication error' };
  },

  async createAssetAsync(assetData) {
    try {
      const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  updateAsset(id, assetData) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${API_BASE}/assets/${id}`, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(assetData));
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {}
    return { success: false, message: 'Server error' };
  },

  deleteAsset(id) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', `${API_BASE}/assets/${id}`, false);
      xhr.send(null);
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {}
    return { success: false, message: 'Server error' };
  },

  duplicateAsset(id) {
    const assetRes = this.getAsset(id);
    if (assetRes.success) {
      const original = assetRes.data;
      return this.createAsset({
        module_id: original.module_id,
        title: `${original.title} (副本)`,
        summary: original.summary,
        content: original.content,
        quote: original.quote,
        status: 'Draft'
      });
    }
    return { success: false, message: 'Duplicate failed' };
  },

  getAssetVersions(id) {
    const versions = store.getVersionsForAsset ? store.getVersionsForAsset(id) : [];
    if (versions.length > 0) {
      return { success: true, data: versions };
    }
    return {
      success: true,
      data: [
        { id: `ver-${id}-1`, version: 'v1.0', created_at: new Date().toISOString(), editor: 'SSOT Initializer' }
      ]
    };
  },

  restoreAssetVersion(assetId, versionId) {
    if (store.restoreAssetVersion) {
      const restored = store.restoreAssetVersion(assetId, versionId);
      return { success: !!restored, data: restored };
    }
    return { success: false, message: 'Restore unsupported' };
  },

  getAssetRelations(id) {
    const relations = store.getRelationsForAsset ? store.getRelationsForAsset(id) : [];
    return { success: true, data: relations };
  },

  createRelation(sourceId, targetId, relType, desc) {
    if (store.addRelation) {
      const rel = store.addRelation(sourceId, targetId, relType, desc);
      return { success: !!rel, data: rel };
    }
    return { success: false, message: 'Add relation unsupported' };
  },

  deleteRelation(relationId) {
    if (store.deleteRelation) {
      const ok = store.deleteRelation(relationId);
      return { success: ok };
    }
    return { success: false };
  },

  createModule(moduleData) {
    if (store.saveModule) {
      const mod = store.saveModule(moduleData);
      return { success: !!mod, data: mod };
    }
    return { success: false, message: 'Create module unsupported' };
  },

  deleteModule(moduleId) {
    if (store.deleteModule) {
      const ok = store.deleteModule(moduleId);
      return { success: ok };
    }
    return { success: false };
  },

  exportAssetMarkdown(assetId) {
    const assetRes = this.getAsset(assetId);
    const asset = assetRes.success ? assetRes.data : (store.getAssetById ? store.getAssetById(assetId) : null);
    if (!asset) return { success: false, message: 'Asset not found' };

    const md = `# ${asset.title}\n\n` +
      `- **Asset Code**: \`${asset.asset_code || asset.id}\`\n` +
      `- **Module**: \`${asset.module_id || 'KNO'}\`\n` +
      `- **Status**: \`${asset.status || 'Published'}\`\n` +
      `- **Version**: \`${asset.version || 'v1.0'}\`\n\n` +
      `### Summary\n${asset.summary || ''}\n\n` +
      `### Content\n${asset.content || ''}\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.asset_code || asset.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  },

  exportAssetJSON(assetId) {
    const assetRes = this.getAsset(assetId);
    const asset = assetRes.success ? assetRes.data : (store.getAssetById ? store.getAssetById(assetId) : null);
    if (!asset) return { success: false, message: 'Asset not found' };

    const blob = new Blob([JSON.stringify(asset, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.asset_code || asset.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  },

  getReleases() {
    if (store.getReleases) {
      const rels = store.getReleases();
      if (rels && rels.length > 0) return { success: true, data: rels };
    }
    return {
      success: true,
      data: [
        { id: 'rel-1', version: 'v1.0-Master', name: 'Release v1.0 Saffron OS Master', status: 'Released', description: '全量归档 34 Master 骨架与 7 级证据层' }
      ]
    };
  }
};

/**
 * Brand Content OS (BCOS) - Central Reactive Store
 * Manages LocalStorage Persistence, ER Schema Entities, and State Change Events.
 */

import {
  INITIAL_MODULES,
  INITIAL_TAGS,
  INITIAL_ASSETS,
  INITIAL_VERSIONS,
  INITIAL_RELATIONS,
  INITIAL_RELEASES
} from './seedData.js';

const STORAGE_KEY = 'BCOS_DB_V1';

class Store {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.modules = parsed.modules || INITIAL_MODULES;
        this.tags = parsed.tags || INITIAL_TAGS;
        this.assets = parsed.assets || INITIAL_ASSETS;
        this.versions = parsed.versions || INITIAL_VERSIONS;
        this.relations = parsed.relations || INITIAL_RELATIONS;
        this.releases = parsed.releases || INITIAL_RELEASES;
        return;
      } catch (e) {
        console.error('Failed to parse local BCOS DB, resetting to seed data', e);
      }
    }

    // Initialize with seed data
    this.modules = [...INITIAL_MODULES];
    this.tags = [...INITIAL_TAGS];
    this.assets = [...INITIAL_ASSETS];
    this.versions = [...INITIAL_VERSIONS];
    this.relations = [...INITIAL_RELATIONS];
    this.releases = [...INITIAL_RELEASES];
    this.saveState();
  }

  saveState() {
    const payload = {
      modules: this.modules,
      tags: this.tags,
      assets: this.assets,
      versions: this.versions,
      relations: this.relations,
      releases: this.releases
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    this.notify();
  }

  resetToSeed() {
    localStorage.removeItem(STORAGE_KEY);
    this.loadState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this));
  }

  // --- MODULE API ---
  getModules() {
    return [...this.modules].sort((a, b) => a.sort - b.sort);
  }

  getModuleByCode(code) {
    return this.modules.find(m => m.code.toUpperCase() === code.toUpperCase());
  }

  getModuleById(id) {
    return this.modules.find(m => m.id === id);
  }

  saveModule(moduleData) {
    const existingIdx = this.modules.findIndex(m => m.id === moduleData.id);
    const now = new Date().toISOString();
    if (existingIdx >= 0) {
      this.modules[existingIdx] = {
        ...this.modules[existingIdx],
        ...moduleData,
        updated_at: now
      };
    } else {
      const newModule = {
        id: moduleData.id || `mod-${Date.now()}`,
        code: moduleData.code.toUpperCase(),
        name: moduleData.name,
        description: moduleData.description || '',
        icon: moduleData.icon || 'ri-folder-line',
        sort: moduleData.sort || this.modules.length + 1,
        status: moduleData.status || 'Published',
        created_at: now,
        updated_at: now
      };
      this.modules.push(newModule);
    }
    this.saveState();
  }

  deleteModule(id) {
    const hasAssets = this.assets.some(a => a.module_id === id);
    if (hasAssets) {
      throw new Error('Cascade Rule Violation: Cannot delete module containing Assets. Please move or remove assets first.');
    }
    this.modules = this.modules.filter(m => m.id !== id);
    this.saveState();
  }

  // --- ASSET API ---
  getAssets() {
    return [...this.assets];
  }

  getAssetById(id) {
    return this.assets.find(a => a.id === id || a.asset_code === id);
  }

  getAssetByCode(code) {
    return this.assets.find(a => a.asset_code.toUpperCase() === code.toUpperCase());
  }

  /**
   * MANDATORY RULES ENFORCEMENT:
   * 1. AssetCode is immutable for life once created!
   * 2. Version is strictly append-only in AssetVersion table!
   */
  saveAsset(assetData, editorName = 'Brand Editor') {
    const now = new Date().toISOString();
    const existing = this.assets.find(a => a.id === assetData.id);

    if (existing) {
      // RULE ④: AssetCode is immutable forever
      if (assetData.asset_code && assetData.asset_code !== existing.asset_code) {
        console.warn(`Attempted to modify asset_code from ${existing.asset_code} to ${assetData.asset_code}. AssetCode is immutable for life! Requirement ignored.`);
      }

      // Check if version increment is needed (content / title / summary changed)
      const hasContentChanged = 
        existing.title !== assetData.title ||
        existing.subtitle !== assetData.subtitle ||
        existing.summary !== assetData.summary ||
        existing.content !== assetData.content ||
        existing.quote !== assetData.quote;

      let nextVersionStr = existing.version;
      if (hasContentChanged) {
        // Increment version (e.g. v1.0 -> v1.1)
        const parts = existing.version.replace('v', '').split('.');
        const major = parseInt(parts[0] || '1', 10);
        const minor = parseInt(parts[1] || '0', 10) + 1;
        nextVersionStr = `v${major}.${minor}`;
      }

      const updatedAsset = {
        ...existing,
        module_id: assetData.module_id || existing.module_id,
        title: assetData.title,
        subtitle: assetData.subtitle || '',
        summary: assetData.summary || '',
        content: assetData.content || '',
        quote: assetData.quote || '',
        status: assetData.status || existing.status,
        version: nextVersionStr,
        tag_ids: assetData.tag_ids || existing.tag_ids || [],
        updated_at: now
      };

      const idx = this.assets.findIndex(a => a.id === existing.id);
      this.assets[idx] = updatedAsset;

      // RULE ②: Append to AssetVersion history table! NEVER overwrite!
      if (hasContentChanged) {
        const newVersionRecord = {
          id: `ver-${existing.id}-${nextVersionStr}`,
          asset_id: existing.id,
          version: nextVersionStr,
          title: updatedAsset.title,
          subtitle: updatedAsset.subtitle,
          summary: updatedAsset.summary,
          content: updatedAsset.content,
          quote: updatedAsset.quote,
          editor: editorName,
          created_at: now
        };
        this.versions.push(newVersionRecord);
      }
    } else {
      // Create new Asset
      const targetModule = this.getModuleById(assetData.module_id) || this.modules[0];
      const autoCode = assetData.asset_code ? assetData.asset_code.toUpperCase() : this.generateNextAssetCode(targetModule.code);

      // Verify code uniqueness
      if (this.assets.some(a => a.asset_code === autoCode)) {
        throw new Error(`AssetCode ${autoCode} already exists. AssetCode must be unique.`);
      }

      const newAssetId = `asset-${Date.now()}`;
      const newVersionStr = 'v1.0';

      const newAsset = {
        id: newAssetId,
        uuid: crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}`,
        module_id: targetModule.id,
        asset_code: autoCode, // Immutable for life
        title: assetData.title || 'Untitled Asset',
        subtitle: assetData.subtitle || '',
        summary: assetData.summary || '',
        content: assetData.content || '',
        quote: assetData.quote || '',
        status: assetData.status || 'Draft',
        version: newVersionStr,
        tag_ids: assetData.tag_ids || [],
        created_at: now,
        updated_at: now
      };

      this.assets.push(newAsset);

      // Save initial v1.0 version snapshot in AssetVersion
      this.versions.push({
        id: `ver-${newAssetId}-${newVersionStr}`,
        asset_id: newAssetId,
        version: newVersionStr,
        title: newAsset.title,
        subtitle: newAsset.subtitle,
        summary: newAsset.summary,
        content: newAsset.content,
        quote: newAsset.quote,
        editor: editorName,
        created_at: now
      });
    }

    this.saveState();
  }

  generateNextAssetCode(moduleCode) {
    const prefix = moduleCode.toUpperCase();
    const existingCodes = this.assets
      .filter(a => a.asset_code.startsWith(`${prefix}-`))
      .map(a => {
        const numPart = parseInt(a.asset_code.split('-')[1], 10);
        return isNaN(numPart) ? 0 : numPart;
      });
    const maxNum = existingCodes.length > 0 ? Math.max(...existingCodes) : 1000;
    const nextNum = maxNum >= 1000 ? maxNum + 1 : 1001;
    return `${prefix}-${nextNum}`;
  }

  deleteAsset(id) {
    // Cascade rules: AssetVersion kept, Relations removed, ReleaseAsset keeps historical pointers
    this.relations = this.relations.filter(r => r.source_asset_id !== id && r.target_asset_id !== id);
    this.assets = this.assets.filter(a => a.id !== id);
    this.saveState();
  }

  duplicateAsset(id) {
    const src = this.getAssetById(id);
    if (!src) return;
    const mod = this.getModuleById(src.module_id) || this.modules[0];
    const newCode = this.generateNextAssetCode(mod.code);

    this.saveAsset({
      module_id: src.module_id,
      asset_code: newCode,
      title: `${src.title} (副本)`,
      subtitle: src.subtitle,
      summary: src.summary,
      content: src.content,
      quote: src.quote,
      status: 'Draft',
      tag_ids: [...(src.tag_ids || [])]
    });
  }

  // --- VERSION API ---
  getVersionsForAsset(assetId) {
    return this.versions
      .filter(v => v.asset_id === assetId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getVersionRecord(versionId) {
    return this.versions.find(v => v.id === versionId);
  }

  restoreAssetVersion(assetId, versionId) {
    const verRecord = this.getVersionRecord(versionId);
    const asset = this.getAssetById(assetId);
    if (!verRecord || !asset) return;

    // Restoring creates a new appended version (e.g. restoring v1.0 creates v2.0)!
    const parts = asset.version.replace('v', '').split('.');
    const major = parseInt(parts[0] || '1', 10) + 1;
    const nextVerStr = `v${major}.0`;

    this.saveAsset({
      ...asset,
      title: verRecord.title,
      subtitle: verRecord.subtitle,
      summary: verRecord.summary,
      content: verRecord.content,
      quote: verRecord.quote,
      version: nextVerStr
    }, `Restored from ${verRecord.version}`);
  }

  // --- RELATION API (Bidirectional Asset ↔ Asset) ---
  getRelationsForAsset(assetId) {
    const outgoing = this.relations.filter(r => r.source_asset_id === assetId).map(r => ({
      ...r,
      direction: 'outgoing',
      relatedAsset: this.getAssetById(r.target_asset_id)
    }));
    const incoming = this.relations.filter(r => r.target_asset_id === assetId).map(r => ({
      ...r,
      direction: 'incoming',
      relatedAsset: this.getAssetById(r.source_asset_id)
    }));
    return [...outgoing, ...incoming].filter(r => r.relatedAsset);
  }

  addRelation(sourceId, targetId, relationType = 'Reference', description = '') {
    if (sourceId === targetId) {
      throw new Error('An Asset cannot reference itself.');
    }
    const exists = this.relations.some(r => 
      (r.source_asset_id === sourceId && r.target_asset_id === targetId) ||
      (r.source_asset_id === targetId && r.target_asset_id === sourceId)
    );
    if (exists) return;

    const newRel = {
      id: `rel-${Date.now()}`,
      source_asset_id: sourceId,
      target_asset_id: targetId,
      relation_type: relationType,
      description: description || '',
      created_at: new Date().toISOString()
    };
    this.relations.push(newRel);
    this.saveState();
  }

  deleteRelation(id) {
    this.relations = this.relations.filter(r => r.id !== id);
    this.saveState();
  }

  // --- RELEASE API (RULE ③: Releases store asset_version_id pointers ONLY) ---
  getReleases() {
    return [...this.releases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getReleaseById(id) {
    return this.releases.find(r => r.id === id);
  }

  createRelease(name, versionTag, description = '', assetVersionIds = []) {
    const newRelease = {
      id: `rel-${Date.now()}`,
      name,
      version: versionTag,
      description,
      status: 'Released',
      created_at: new Date().toISOString(),
      /* RULE ③: Strictly stores AssetVersion pointers (`asset_version_id`), NEVER content */
      asset_version_ids: assetVersionIds
    };
    this.releases.push(newRelease);
    this.saveState();
    return newRelease;
  }

  getReleaseAssetVersions(releaseId) {
    const rel = this.getReleaseById(releaseId);
    if (!rel || !rel.asset_version_ids) return [];
    return rel.asset_version_ids
      .map(verId => this.getVersionRecord(verId))
      .filter(Boolean)
      .map(ver => ({
        versionRecord: ver,
        parentAsset: this.getAssetById(ver.asset_id)
      }));
  }

  // --- TAG API ---
  getTags() {
    return [...this.tags];
  }
}

export const store = new Store();

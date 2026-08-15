/**
 * Brand Content OS (BCOS) - Core Application Bootstrapper & Router
 * Version: v0.1 MVP
 */

import { renderSidebar } from './components/sidebar.js';
import { setupCommandPalette } from './components/commandPalette.js';
import { setupMobileTerminal } from './components/mobileTerminal.js';

import { renderDashboardView } from './views/dashboardView.js';
import { renderAssetExplorerView } from './views/assetExplorerView.js';
import { renderAssetDetailView } from './views/assetDetailView.js';
import { renderReleaseManagerView } from './views/releaseManagerView.js';
import { renderModuleManagerView } from './views/moduleManagerView.js';
import { renderRelationGraphView } from './views/relationGraphView.js';
import { renderSettingsView } from './views/settingsView.js';

import { store } from './services/store.js';
import { api } from './services/api.js';
import { showToast } from './components/toast.js';

class AppRouter {
  constructor() {
    this.currentPath = 'dashboard';
    this.selectedAssetId = null;
    this.commandPalette = null;
  }

  init() {
    this.commandPalette = setupCommandPalette((assetId) => {
      this.navigateToAssetDetail(assetId);
    });

    setupMobileTerminal((assetId) => {
      this.navigateToAssetDetail(assetId);
    });

    // Subscribe to store updates to keep sidebar badge counters synced
    store.subscribe(() => {
      this.renderSidebar();
    });

    this.renderSidebar();
    this.navigate(this.currentPath);
  }

  renderSidebar() {
    renderSidebar(
      this.currentPath,
      (path) => this.navigate(path),
      () => this.commandPalette.open()
    );
  }

  navigate(path) {
    this.currentPath = path;
    this.renderSidebar();

    const mainContainer = document.getElementById('main-content');
    if (!mainContainer) return;

    if (path === 'dashboard') {
      renderDashboardView(
        mainContainer,
        (targetPath) => this.navigate(targetPath),
        (assetId) => this.navigateToAssetDetail(assetId)
      );
    } else if (path.startsWith('module-')) {
      const moduleCode = path.replace('module-', '').toUpperCase();
      renderAssetExplorerView(
        mainContainer,
        moduleCode,
        (assetId) => this.navigateToAssetDetail(assetId),
        (targetPath) => this.navigate(targetPath)
      );
    } else if (path === 'releases') {
      renderReleaseManagerView(
        mainContainer,
        (assetId) => this.navigateToAssetDetail(assetId)
      );
    } else if (path === 'modules-manager') {
      renderModuleManagerView(
        mainContainer,
        (targetPath) => this.navigate(targetPath)
      );
    } else if (path === 'graph') {
      renderRelationGraphView(
        mainContainer,
        (assetId) => this.navigateToAssetDetail(assetId)
      );
    } else if (path === 'settings') {
      renderSettingsView(mainContainer);
    } else if (path === 'new-asset') {
      const createdRes = api.createAsset({
        title: '未命名 Brand Asset',
        summary: '输入一句话总结...',
        content: '# 未命名 Brand Asset\n\n在此撰写内容...',
        status: 'Draft'
      });
      if (createdRes.success && createdRes.data) {
        showToast('新建 Asset 成功', 'success');
        this.navigateToAssetDetail(createdRes.data.id);
      }
    } else if (path === 'asset-detail') {
      if (this.selectedAssetId) {
        renderAssetDetailView(
          mainContainer,
          this.selectedAssetId,
          () => this.navigate('module-com'),
          (targetId) => this.navigateToAssetDetail(targetId)
        );
      } else {
        this.navigate('dashboard');
      }
    }
  }

  navigateToAssetDetail(assetId) {
    this.selectedAssetId = assetId;
    this.navigate('asset-detail');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const router = new AppRouter();
  router.init();
});

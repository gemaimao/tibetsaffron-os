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
    // Check security access control
    this.checkOSAuth();

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

  checkOSAuth() {
    const token = localStorage.getItem('tianwang_os_auth') || localStorage.getItem('tianwang_mobile_auth');
    const validTokens = ['tianwang2026', 'tianwang888', 'tianwang'];
    if (token && validTokens.includes(token)) {
      return true;
    }
    
    let overlay = document.getElementById('os-auth-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'os-auth-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(7,9,14,0.96); backdrop-filter: blur(24px); z-index: 99999;
        display: flex; align-items: center; justify-content: center; padding: 20px;
      `;
      overlay.innerHTML = `
        <div style="width: 100%; max-width: 400px; background: #111726; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 28px; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
          <img src="/assets/logo.jpg" alt="天旺农牧" style="width: 68px; height: 68px; border-radius: 16px; object-fit: cover; background: #fff; padding: 4px; margin: 0 auto 16px; border: 2px solid rgba(245,158,11,0.4);" />
          <h2 style="font-size: 19px; font-weight: 700; color: #fff; margin-bottom: 6px;">Brand Content OS 访问鉴权</h2>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px;">天旺农牧企业内部知识操作系统与证据控制中心。请输入授权口令解锁。</p>
          <input type="password" id="os-pwd-input" placeholder="输入访问口令" style="width: 100%; text-align: center; font-size: 18px; letter-spacing: 2px; font-family: monospace; padding: 14px; background: #07090e; border: 1px solid #334155; border-radius: 12px; margin-bottom: 16px; color: #f59e0b; outline: none;" autofocus />
          <button id="os-pwd-btn" style="width: 100%; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 700; font-size: 15px; border: none; border-radius: 12px; padding: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="ri-shield-keyhole-line"></i> 解锁控制台
          </button>
          <div style="font-size: 12px; color: #64748b; margin-top: 20px;">
            <a href="/" style="color: #94a3b8; text-decoration: none;"><i class="ri-arrow-left-line"></i> 返回企业官网首页</a>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const doAuth = () => {
        const pwd = document.getElementById('os-pwd-input').value.trim();
        if (validTokens.includes(pwd)) {
          localStorage.setItem('tianwang_os_auth', pwd);
          overlay.remove();
          showToast('✅ 鉴权成功，欢迎进入 Brand Content OS 控制台');
        } else {
          showToast('❌ 口令错误，请重新输入');
          document.getElementById('os-pwd-input').value = '';
        }
      };

      document.getElementById('os-pwd-btn').addEventListener('click', doAuth);
      document.getElementById('os-pwd-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doAuth();
      });
    }
    return false;
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

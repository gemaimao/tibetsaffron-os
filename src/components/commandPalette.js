/**
 * Brand Content OS (BCOS) - Global Command Palette (`Cmd+K` Search Overlay)
 */

import { api } from '../services/api.js';

export function setupCommandPalette(onSelectAsset) {
  const container = document.getElementById('command-palette-container');
  if (!container) return;

  let isOpen = false;

  function render() {
    if (!isOpen) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="modal-backdrop" id="cmd-backdrop">
        <div class="command-modal">
          <div class="command-search-header">
            <i class="ri-search-line"></i>
            <input type="text" id="cmd-input" class="command-input" placeholder="输入 Keyword, ID, Title, Tag 或 Module 搜索 (ESC 退出)..." autofocus />
          </div>
          <div class="command-results" id="cmd-results">
            <!-- Dynamic search results render here -->
          </div>
        </div>
      </div>
    `;

    const backdrop = container.querySelector('#cmd-backdrop');
    const input = container.querySelector('#cmd-input');
    const resultsContainer = container.querySelector('#cmd-results');

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    input.addEventListener('input', () => {
      performSearch(input.value.trim(), resultsContainer);
    });

    // Initial search
    performSearch('', resultsContainer);

    setTimeout(() => input.focus(), 50);
  }

  function performSearch(query, resultsContainer) {
    const res = api.getAssets({ keyword: query, size: 20 });
    const items = res.success ? res.data.items : [];

    if (items.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-dark-muted); font-size: 13px;">
          未找到匹配的 Brand Asset。
        </div>
      `;
      return;
    }

    const modulesRes = api.getModules();
    const modules = modulesRes.success ? modulesRes.data : [];

    resultsContainer.innerHTML = items.map((asset, idx) => {
      const mod = modules.find(m => m.id === asset.module_id);
      return `
        <div class="command-item ${idx === 0 ? 'selected' : ''}" data-id="${asset.id}">
          <div class="cmd-left">
            <span class="asset-code">${asset.asset_code}</span>
            <div>
              <div class="cmd-title">${asset.title}</div>
              <div class="cmd-sub">${asset.summary || '无摘要'}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge badge-module ${mod ? mod.code.toLowerCase() : 'com'}">${mod ? mod.code : 'COM'}</span>
            <span class="badge badge-${asset.status.toLowerCase()}">${asset.status}</span>
            <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dark-muted);">${asset.version}</span>
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.querySelectorAll('.command-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        close();
        onSelectAsset(id);
      });
    });
  }

  function open() {
    isOpen = true;
    render();
  }

  function close() {
    isOpen = false;
    render();
  }

  // Keyboard shortcut listener: Cmd+K / Ctrl+K / ESC
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? close() : open();
    } else if (e.key === 'Escape' && isOpen) {
      close();
    }
  });

  return { open, close };
}

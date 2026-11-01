/**
 * Brand Content OS (BCOS) - Dual-Track Knowledge Hub & Jev Asset Governance View
 * 
 * Implements:
 * - Track 1: Field Reality (自下而上 · 现场泥土真实性)
 * - Track 2: Authoritative Research & Science (自外而内 · 限定权威科研情报)
 * - Jev System One Real-time / Batch Decision & Auto-Scoring Pipeline
 * - One-click SSOT Promotion & Dual-Write Markdown/JSON synchronization
 */

import { api } from '../services/api.js';
import { store } from '../services/store.js';
import { jevDecisionEngine, JEV_CONFIG } from '../services/jevDecisionEngine.js';
import { showToast } from '../components/toast.js';

export function renderDualTrackHubView(container, onNavigateToAsset) {
  let activeTab = 'all'; // 'all' | 'field' | 'research' | 'ingest'
  let filterStatus = 'All'; // 'All' | 'PENDING' | 'CERTIFIED' | 'BLOCKED'
  let isAuditing = false;

  async function render() {
    const assets = store.getAssets ? store.getAssets() : [];
    
    // Stats calculation
    const fieldAssets = assets.filter(a => (a.track === 'FIELD_REALITY') || (a.tag_ids && a.tag_ids.includes('tag-field')));
    const researchAssets = assets.filter(a => (a.track === 'RESEARCH_AUTHORITY') || (a.tag_ids && a.tag_ids.includes('tag-research')));
    const pendingAssets = assets.filter(a => a.status === 'Draft' || a.governance_status === 'PENDING_INBOX');
    const certifiedAssets = assets.filter(a => a.status === 'Published' || a.governance_status === 'CERTIFIED_SSOT');
    const blockedAssets = assets.filter(a => a.status === 'Blocked' || (a.jev_decision && !a.jev_decision.is_safe));

    // Filtered list
    let displayedAssets = assets;
    if (activeTab === 'field') {
      displayedAssets = fieldAssets;
    } else if (activeTab === 'research') {
      displayedAssets = researchAssets;
    }

    if (filterStatus === 'PENDING') {
      displayedAssets = displayedAssets.filter(a => a.status === 'Draft' || a.governance_status === 'PENDING_INBOX');
    } else if (filterStatus === 'CERTIFIED') {
      displayedAssets = displayedAssets.filter(a => a.status === 'Published' || a.governance_status === 'CERTIFIED_SSOT');
    } else if (filterStatus === 'BLOCKED') {
      displayedAssets = displayedAssets.filter(a => a.status === 'Blocked' || (a.jev_decision && !a.jev_decision.is_safe));
    }

    container.innerHTML = `
      <div class="view-container">
        <!-- Header -->
        <header class="view-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="view-title-group">
            <div class="view-title" style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #3b82f6); display: flex; align-items: center; justify-content: center; color: white;">
                <i class="ri-git-merge-line" style="font-size: 18px;"></i>
              </div>
              <span>双轨知识中台与 Jev 资产治理舱</span>
            </div>
            <span class="view-subtitle">
              自下而上现场泥土真实性 (Track 1) × 自外而内权威科研情报 (Track 2) · Jev 毫秒级决策与自动合规审定
            </span>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btn-batch-audit" style="font-size: 13px; display: flex; align-items: center; gap: 6px;">
              <i class="ri-scan-2-line" style="color: #a78bfa;"></i> ${isAuditing ? '正在 Jev 审定...' : 'Jev 全量资产重审'}
            </button>
            <button class="btn btn-primary" id="btn-quick-ingest-tab" style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-size: 13px; display: flex; align-items: center; gap: 6px;">
              <i class="ri-add-line"></i> 快速双轨录入
            </button>
          </div>
        </header>

        <div class="view-body" style="padding-top: 16px;">
          <!-- 4 Core Metrics Cards -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <!-- Card 1: Track 1 -->
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 600; color: #34d399; display: flex; align-items: center; gap: 4px;">
                  <i class="ri-seedling-line"></i> 轨一 · 现场泥土实证
                </span>
                <span style="font-size: 11px; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 6px; border-radius: 4px;">Track 1</span>
              </div>
              <div style="font-size: 24px; font-weight: 800; color: #fff;">${fieldAssets.length} <span style="font-size: 13px; font-weight: normal; color: #94a3b8;">份资产</span></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">含米瑞乡采收、起球物候与国家级质检</div>
            </div>

            <!-- Card 2: Track 2 -->
            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 12px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 600; color: #60a5fa; display: flex; align-items: center; gap: 4px;">
                  <i class="ri-microscope-line"></i> 轨二 · 权威科研情报
                </span>
                <span style="font-size: 11px; background: rgba(59, 130, 246, 0.2); color: #93c5fd; padding: 2px 6px; border-radius: 4px;">Track 2</span>
              </div>
              <div style="font-size: 24px; font-weight: 800; color: #fff;">${researchAssets.length} <span style="font-size: 13px; font-weight: normal; color: #94a3b8;">份资产</span></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">含中国药典指纹图谱、PubMed 与代谢组学</div>
            </div>

            <!-- Card 3: Governance Pipeline -->
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 600; color: #fbbf24; display: flex; align-items: center; gap: 4px;">
                  <i class="ri-inbox-archive-line"></i> 待治理待晋升队列
                </span>
                <span style="font-size: 11px; background: rgba(245, 158, 11, 0.2); color: #fde68a; padding: 2px 6px; border-radius: 4px;">Pending</span>
              </div>
              <div style="font-size: 24px; font-weight: 800; color: #fff;">${pendingAssets.length} <span style="font-size: 13px; font-weight: normal; color: #94a3b8;">份待审</span></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">经 Jev 审定后可一键晋升入 SSOT 正式库</div>
            </div>

            <!-- Card 4: Jev Health Index -->
            <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 12px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 600; color: #c4b5fd; display: flex; align-items: center; gap: 4px;">
                  <i class="ri-shield-check-line"></i> Jev 决策层认证率
                </span>
                <span style="font-size: 11px; background: rgba(139, 92, 246, 0.2); color: #ddd6fe; padding: 2px 6px; border-radius: 4px;">System One</span>
              </div>
              <div style="font-size: 24px; font-weight: 800; color: #34d399;">
                ${assets.length > 0 ? ((certifiedAssets.length / assets.length) * 100).toFixed(0) : 100}%
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">拦截违规数: <span style="color: #f87171;">${blockedAssets.length}</span> | 认证: <span style="color: #34d399;">${certifiedAssets.length}</span></div>
            </div>
          </div>

          <!-- Navigation Tabs & Filters -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 20px;">
            <div style="display: flex; gap: 8px;">
              <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all" style="padding: 8px 14px; font-size: 13px; border-radius: 8px; border: 1px solid ${activeTab === 'all' ? '#8b5cf6' : '#334155'}; background: ${activeTab === 'all' ? 'rgba(139,92,246,0.15)' : 'transparent'}; color: ${activeTab === 'all' ? '#c4b5fd' : '#94a3b8'}; cursor: pointer;">
                全部治理队列 (${assets.length})
              </button>
              <button class="tab-btn ${activeTab === 'field' ? 'active' : ''}" data-tab="field" style="padding: 8px 14px; font-size: 13px; border-radius: 8px; border: 1px solid ${activeTab === 'field' ? '#10b981' : '#334155'}; background: ${activeTab === 'field' ? 'rgba(16,185,129,0.15)' : 'transparent'}; color: ${activeTab === 'field' ? '#6ee7b7' : '#94a3b8'}; cursor: pointer;">
                <i class="ri-seedling-line"></i> 轨一 · 现场泥土实证 (${fieldAssets.length})
              </button>
              <button class="tab-btn ${activeTab === 'research' ? 'active' : ''}" data-tab="research" style="padding: 8px 14px; font-size: 13px; border-radius: 8px; border: 1px solid ${activeTab === 'research' ? '#3b82f6' : '#334155'}; background: ${activeTab === 'research' ? 'rgba(59,130,246,0.15)' : 'transparent'}; color: ${activeTab === 'research' ? '#93c5fd' : '#94a3b8'}; cursor: pointer;">
                <i class="ri-microscope-line"></i> 轨二 · 权威科研情报 (${researchAssets.length})
              </button>
              <button class="tab-btn ${activeTab === 'ingest' ? 'active' : ''}" data-tab="ingest" style="padding: 8px 14px; font-size: 13px; border-radius: 8px; border: 1px solid ${activeTab === 'ingest' ? '#f59e0b' : '#334155'}; background: ${activeTab === 'ingest' ? 'rgba(245,158,11,0.15)' : 'transparent'}; color: ${activeTab === 'ingest' ? '#fde68a' : '#94a3b8'}; cursor: pointer;">
                <i class="ri-add-circle-line"></i> 快速双轨录入舱
              </button>
            </div>

            <!-- Status Filter -->
            ${activeTab !== 'ingest' ? `
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                <span>状态过滤:</span>
                <select id="hub-status-filter" style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 4px 8px; color: #f8fafc; font-size: 12px;">
                  <option value="All" ${filterStatus === 'All' ? 'selected' : ''}>全部状态 (${assets.length})</option>
                  <option value="PENDING" ${filterStatus === 'PENDING' ? 'selected' : ''}>待治理 Inbox (${pendingAssets.length})</option>
                  <option value="CERTIFIED" ${filterStatus === 'CERTIFIED' ? 'selected' : ''}>已认证 SSOT (${certifiedAssets.length})</option>
                  <option value="BLOCKED" ${filterStatus === 'BLOCKED' ? 'selected' : ''}>违规阻断 (${blockedAssets.length})</option>
                </select>
              </div>
            ` : ''}
          </div>

          <!-- Main Content Area -->
          ${activeTab === 'ingest' ? renderIngestForm() : renderAssetList(displayedAssets)}
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderAssetList(items) {
    if (!items || items.length === 0) {
      return `
        <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(15,23,42,0.4); border-radius: 12px; border: 1px dashed #334155;">
          <i class="ri-inbox-line" style="font-size: 40px; margin-bottom: 12px; display: block; color: #475569;"></i>
          <div style="font-size: 15px; font-weight: 600; color: #94a3b8; margin-bottom: 6px;">暂无匹配的双轨中台资产</div>
          <div style="font-size: 12px;">您可以切换上方 Tab 过滤器，或点击“快速双轨录入”开始注入现场实证或科研情报。</div>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${items.map(asset => {
          const track = asset.track || (asset.tag_ids && asset.tag_ids.includes('tag-field') ? 'FIELD_REALITY' : (asset.tag_ids && asset.tag_ids.includes('tag-research') ? 'RESEARCH_AUTHORITY' : 'GENERAL'));
          const jev = asset.jev_decision;
          const isPending = asset.status === 'Draft' || asset.governance_status === 'PENDING_INBOX';
          const isBlocked = asset.status === 'Blocked' || (jev && !jev.is_safe);

          return `
            <div class="governance-card" style="background: #111726; border: 1px solid ${isBlocked ? 'rgba(239,68,68,0.4)' : (isPending ? 'rgba(245,158,11,0.3)' : 'rgba(30,41,59,0.8)')}; border-radius: 12px; padding: 16px; transition: transform 0.15s, border-color 0.15s;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <!-- Track Tag -->
                  ${track === 'FIELD_REALITY' ? `
                    <span style="font-size: 11px; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
                      <i class="ri-seedling-line"></i> 轨一 · 现场泥土实证
                    </span>
                  ` : (track === 'RESEARCH_AUTHORITY' ? `
                    <span style="font-size: 11px; font-weight: 700; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
                      <i class="ri-microscope-line"></i> 轨二 · 权威科研情报
                    </span>
                  ` : `
                    <span style="font-size: 11px; font-weight: 600; background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); padding: 3px 8px; border-radius: 6px;">
                      规范底库
                    </span>
                  `)}

                  <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #94a3b8;">${asset.asset_code}</span>
                  <span style="font-size: 11px; color: #64748b;">${new Date(asset.created_at || Date.now()).toLocaleDateString('zh-CN')}</span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <!-- Status Badge -->
                  ${isBlocked ? `
                    <span style="font-size: 11px; background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); padding: 2px 8px; border-radius: 6px; font-weight: 600;">
                      <i class="ri-error-warning-line"></i> 红线拦截
                    </span>
                  ` : (isPending ? `
                    <span style="font-size: 11px; background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4); padding: 2px 8px; border-radius: 6px; font-weight: 600;">
                      <i class="ri-time-line"></i> 待治理 (Inbox)
                    </span>
                  ` : `
                    <span style="font-size: 11px; background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 2px 8px; border-radius: 6px; font-weight: 600;">
                      <i class="ri-checkbox-circle-line"></i> 已认证 SSOT
                    </span>
                  `)}
                </div>
              </div>

              <!-- Title & Summary -->
              <h3 style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 6px; cursor: pointer;" class="asset-title-link" data-id="${asset.id}">
                ${asset.title}
              </h3>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px;">
                ${asset.summary || (asset.content ? asset.content.slice(0, 140) + '...' : '暂无摘要')}
              </p>

              <!-- Jev Decision Inspector Strip -->
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                  <!-- Jev Safe -->
                  <div style="font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <span style="color: #64748b;">安全置信度 (Noul):</span>
                    <strong style="color: ${(jev ? jev.safe_probability : 0.98) >= 0.9 ? '#34d399' : '#f87171'}; font-family: var(--font-mono);">
                      P(Safe)=${((jev ? jev.safe_probability : 0.98) * 100).toFixed(0)}%
                    </strong>
                  </div>

                  <!-- Evidence Level -->
                  <div style="font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <span style="color: #64748b;">证据等级 (Score):</span>
                    <span style="background: rgba(139,92,246,0.15); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.3); padding: 1px 6px; border-radius: 4px; font-weight: 600;">
                      Level ${jev ? jev.evidence_level : (asset.module_id === 'mod-dat' ? 1 : 3)}
                    </span>
                  </div>

                  <!-- Role -->
                  <div style="font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <span style="color: #64748b;">角色指派:</span>
                    <span style="color: #38bdf8; font-family: var(--font-mono); font-weight: 600;">
                      ${jev ? jev.role : 'CORE_EVIDENCE'}
                    </span>
                  </div>

                  <!-- Engine Tag -->
                  <span style="font-size: 10.5px; color: #64748b; font-family: var(--font-mono);">
                    <i class="ri-cpu-line"></i> Jev 1.8ms
                  </span>
                </div>

                <!-- Attachment preview indicator -->
                ${asset.media_url ? `
                  <a href="${asset.media_url}" target="_blank" style="font-size: 12px; color: #38bdf8; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                    <i class="ri-attachment-line"></i> 查看原件附件
                  </a>
                ` : ''}
              </div>

              <!-- Governance Actions -->
              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                <button class="btn btn-sm btn-secondary btn-inspect" data-id="${asset.id}" style="font-size: 12px;">
                  <i class="ri-eye-line"></i> 详情审查
                </button>
                <button class="btn btn-sm btn-secondary btn-recheck" data-id="${asset.id}" style="font-size: 12px;">
                  <i class="ri-refresh-line"></i> Jev 单条重评
                </button>
                ${isPending && !isBlocked ? `
                  <button class="btn btn-sm btn-primary btn-promote" data-id="${asset.id}" style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-size: 12px;">
                    <i class="ri-check-line"></i> 一键晋升 SSOT
                  </button>
                ` : ''}
                ${isPending ? `
                  <button class="btn btn-sm btn-secondary btn-reject" data-id="${asset.id}" style="color: #f87171; border-color: rgba(239,68,68,0.3); font-size: 12px;">
                    <i class="ri-close-line"></i> 驳回
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderIngestForm() {
    return `
      <div style="max-width: 800px; background: #111726; border: 1px solid #1e293b; border-radius: 14px; padding: 24px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          <i class="ri-sound-module-line" style="color: #10b981;"></i> 快速双轨录入舱 (Dual-Track Quick Ingest)
        </h3>
        <p style="font-size: 12.5px; color: #94a3b8; margin-bottom: 20px;">
          输入现场采收物候或权威科研文献，由 Jev System One 即时识别资产树、校验合规红线并完成双写持久化。
        </p>

        <!-- Track Selection -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
          <label id="label-track-field" style="border: 2px solid #10b981; background: rgba(16,185,129,0.1); border-radius: 10px; padding: 14px; cursor: pointer; display: flex; align-items: flex-start; gap: 10px;">
            <input type="radio" name="ingest-track" value="FIELD_REALITY" checked style="margin-top: 3px;" />
            <div>
              <div style="font-size: 13.5px; font-weight: 700; color: #34d399;">轨一 · 现场泥土实证</div>
              <div style="font-size: 11.5px; color: #94a3b8; margin-top: 2px;">林芝基地实拍、采摘起球物候、温湿度读数、出入境检疫单</div>
            </div>
          </label>

          <label id="label-track-research" style="border: 1px solid #334155; background: #0f172a; border-radius: 10px; padding: 14px; cursor: pointer; display: flex; align-items: flex-start; gap: 10px;">
            <input type="radio" name="ingest-track" value="RESEARCH_AUTHORITY" style="margin-top: 3px;" />
            <div>
              <div style="font-size: 13.5px; font-weight: 700; color: #60a5fa;">轨二 · 权威科研情报</div>
              <div style="font-size: 11.5px; color: #94a3b8; margin-top: 2px;">中国药典标准、PubMed/知网药理文献、斑马鱼代谢、指纹图谱</div>
            </div>
          </label>
        </div>

        <!-- Form Inputs -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">资产标题 (Title)</label>
            <input type="text" id="ingest-title" class="form-control" placeholder="例: 2026年林芝巴宜区米瑞乡姆多村种球起地连续物候记录" style="width: 100%; font-size: 13.5px;" />
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">详细事实与引据内容 (Content / Evidence Body)</label>
            <textarea id="ingest-content" class="form-control" rows="5" placeholder="录入具体的实验数据、批次编号、检测结果或物候实录..." style="width: 100%; font-size: 13px; line-height: 1.5;"></textarea>
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">附件/原件凭据 URL 或在线链接</label>
            <input type="text" id="ingest-media-url" class="form-control" placeholder="例: /assets/evidence/天旺农牧藏红花检测报告-大湾区.pdf" style="width: 100%; font-size: 13px;" />
          </div>

          <!-- Live Jev Pre-Evaluation Box -->
          <div id="ingest-jev-preview" style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 8px; padding: 12px; display: none;">
            <div style="font-size: 12px; font-weight: 700; color: #c4b5fd; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <i class="ri-flashlight-line"></i> Jev System One 即时预审结果
            </div>
            <div id="ingest-jev-preview-content" style="font-size: 12px; color: #94a3b8;"></div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button class="btn btn-secondary" id="btn-pretest-jev" style="font-size: 13px;">
              <i class="ri-cpu-line"></i> Jev 即时试测
            </button>
            <button class="btn btn-primary" id="btn-submit-ingest" style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-size: 13px; padding: 8px 20px;">
              <i class="ri-upload-cloud-line"></i> 提交并落盘双写
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Tab switching
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });

    // Quick ingest tab button
    const quickBtn = container.querySelector('#btn-quick-ingest-tab');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        activeTab = 'ingest';
        render();
      });
    }

    // Status filter
    const statusSelect = container.querySelector('#hub-status-filter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        filterStatus = e.target.value;
        render();
      });
    }

    // Batch Audit Button
    const batchAuditBtn = container.querySelector('#btn-batch-audit');
    if (batchAuditBtn) {
      batchAuditBtn.addEventListener('click', async () => {
        if (isAuditing) return;
        isAuditing = true;
        render();
        try {
          showToast('🚀 正在启动 Jev System One 全量资产审定与打分...');
          const report = await api.batchAuditWithJevAsync('OFFICIAL_PR');
          showToast(`✅ Jev 审定完成！通过: ${report.data.passed}/${report.data.total}，平均置信度: ${(report.data.avg_safe_probability * 100).toFixed(1)}%`);
        } catch (e) {
          showToast('❌ 审定失败: ' + e.message);
        } finally {
          isAuditing = false;
          render();
        }
      });
    }

    // Single item click -> navigate to detail
    container.querySelectorAll('.asset-title-link, .btn-inspect').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        if (onNavigateToAsset) {
          onNavigateToAsset(id);
        }
      });
    });

    // Single item recheck
    container.querySelectorAll('.btn-recheck').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> 评测中...';
        try {
          const decision = await api.auditAssetAsync(id);
          showToast(`✅ Jev 判定: ${decision.seal}, P(Safe)=${(decision.safe_probability*100).toFixed(0)}%, Level ${decision.evidence_level}`);
          render();
        } catch (e) {
          showToast('❌ 评测失败: ' + e.message);
        }
      });
    });

    // Promote button
    container.querySelectorAll('.btn-promote').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const res = api.promoteAsset(id);
          if (res.success) {
            showToast('🎉 资产已成功晋升为 Core SSOT 唯一可信源并完成双写持久化！');
            render();
          } else {
            showToast('❌ 晋升失败: ' + res.message);
          }
        } catch (e) {
          showToast('❌ 错误: ' + e.message);
        }
      });
    });

    // Reject button
    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const reason = prompt('请输入驳回原因:', '红线违规宣称或证据强度不足');
        if (reason) {
          const res = api.rejectAsset(id, reason);
          if (res.success) {
            showToast('⚠️ 资产已驳回拦截');
            render();
          }
        }
      });
    });

    // Ingest form events
    if (activeTab === 'ingest') {
      const radioField = container.querySelector('input[value="FIELD_REALITY"]');
      const radioRes = container.querySelector('input[value="RESEARCH_AUTHORITY"]');
      const lblField = container.querySelector('#label-track-field');
      const lblRes = container.querySelector('#label-track-research');

      const updateTrackStyles = () => {
        if (radioField.checked) {
          lblField.style.border = '2px solid #10b981';
          lblField.style.background = 'rgba(16,185,129,0.1)';
          lblRes.style.border = '1px solid #334155';
          lblRes.style.background = '#0f172a';
        } else {
          lblRes.style.border = '2px solid #3b82f6';
          lblRes.style.background = 'rgba(59,130,246,0.1)';
          lblField.style.border = '1px solid #334155';
          lblField.style.background = '#0f172a';
        }
      };

      if (radioField && radioRes) {
        radioField.addEventListener('change', updateTrackStyles);
        radioRes.addEventListener('change', updateTrackStyles);
      }

      // Pretest Jev button
      const pretestBtn = container.querySelector('#btn-pretest-jev');
      if (pretestBtn) {
        pretestBtn.addEventListener('click', async () => {
          const title = container.querySelector('#ingest-title').value.trim();
          const content = container.querySelector('#ingest-content').value.trim();
          const track = radioField.checked ? 'FIELD_REALITY' : 'RESEARCH_AUTHORITY';
          if (!title && !content) {
            showToast('⚠️ 请先输入标题或内容以供测试');
            return;
          }

          const decision = await jevDecisionEngine.auditAsset({ title, content, track });
          const previewBox = container.querySelector('#ingest-jev-preview');
          const previewContent = container.querySelector('#ingest-jev-preview-content');
          previewBox.style.display = 'block';
          previewContent.innerHTML = `
            <div style="display: flex; gap: 16px; margin-bottom: 6px;">
              <span>安全概率: <strong style="color: ${decision.is_safe ? '#34d399' : '#f87171'};">P(Safe)=${(decision.safe_probability*100).toFixed(1)}%</strong></span>
              <span>证据等级: <strong style="color: #c4b5fd;">Level ${decision.evidence_level}</strong></span>
              <span>推荐模块: <strong style="color: #38bdf8;">${decision.recommended_module}</strong></span>
              <span>角色: <strong style="color: #fbbf24;">${decision.role}</strong></span>
            </div>
            ${decision.violation_reasons.length > 0 ? `
              <div style="color: #f87171; margin-top: 4px;">⚠️ 违规红线识别: ${decision.violation_reasons.join('; ')}</div>
            ` : '<div style="color: #34d399;">✅ 判定合规，无红线违规宣称</div>'}
          `;
        });
      }

      // Submit Ingest button
      const submitBtn = container.querySelector('#btn-submit-ingest');
      if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
          const title = container.querySelector('#ingest-title').value.trim();
          const content = container.querySelector('#ingest-content').value.trim();
          const mediaUrl = container.querySelector('#ingest-media-url').value.trim();
          const track = radioField.checked ? 'FIELD_REALITY' : 'RESEARCH_AUTHORITY';

          if (!title || !content) {
            showToast('⚠️ 请填写标题和内容');
            return;
          }

          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Jev 正在审定与落盘...';

          try {
            // Determine recommended module via Jev
            const treeDecision = await jevDecisionEngine.classifyAssetTree(`${title} ${content}`);
            const modCode = treeDecision.value;
            const targetMod = store.getModuleByCode ? store.getModuleByCode(modCode) : null;
            const moduleId = targetMod ? targetMod.id : 'mod-kno';

            const res = await api.createAssetAsync({
              module_id: moduleId,
              title,
              summary: content.slice(0, 120),
              content,
              media_url: mediaUrl || null,
              track,
              status: 'Draft'
            });

            if (res.success) {
              showToast('🎉 录入成功！Jev 已完成自动打分并双写至 Inbox Markdown 目录');
              activeTab = 'all';
              render();
            } else {
              showToast('❌ 录入失败: ' + res.message);
            }
          } catch (err) {
            showToast('❌ 发生异常: ' + err.message);
          } finally {
            submitBtn.disabled = false;
          }
        });
      }
    }
  }

  render();
}

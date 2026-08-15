/**
 * Brand Content OS (BCOS) - V2.2 Interactive Press Release Synthesizer Modal
 * Enforces V2.2 Scenario Matrix, Readiness State Machine, Claim-Evidence Binding,
 * 3 Output Modes (AUDIT, EDITORIAL, PUBLIC), Scientific Guardrails & Regression Tests.
 */

import { api } from '../services/api.js';
import { exportEngine, SCENARIO_MATRIX } from '../services/exportEngine.js';
import { showToast } from './toast.js';

export function openPressReleaseModal() {
  let modal = document.getElementById('press-release-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'press-release-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const assetsRes = api.getAssets();
  const allAssets = assetsRes.success ? assetsRes.data.items : [];
  
  // V2.2 Readiness Filter: Only VERIFIED & PUBLISHED for Public Production
  const verifiedAssets = allAssets.filter(a => a.status === 'Published' || a.status === 'VERIFIED');
  let selectedAssetIds = verifiedAssets.map(a => a.id);

  // V2.2 State
  let currentScenario = 'OFFICIAL_PR'; // OFFICIAL_PR | MEDIA_FEATURE | BRAND_STORY | LIFESTYLE | INVESTOR
  let currentOutputMode = 'PUBLIC';    // AUDIT | EDITORIAL | PUBLIC
  let eventTitle = '天旺藏红花 2026 高原产业与0农残出海战略发布会';
  let eventDate = new Date().toISOString().split('T')[0];
  let eventLocation = '西藏林芝米瑞乡天旺藏红花基地 / 上海';
  let eventAttendees = '自治州农业部门领导、林芝海关检疫代表、科研团队';
  let leaderSpeech = '“天旺始终坚守极地风土与科学控环双驱动，用 0 农残实测报告 No. A26SW02809 和拉萨海关出境凭证 CMP-001，重新定义品质标准。”';

  function renderModal() {
    const selectedAssets = allAssets.filter(a => selectedAssetIds.includes(a.id));

    const generatedArticle = exportEngine.generateV22Article({
      scenario: currentScenario,
      outputMode: currentOutputMode,
      eventTitle,
      eventDate,
      eventLocation,
      eventAttendees,
      leaderSpeech,
      inputAssets: selectedAssets
    });

    const spec = SCENARIO_MATRIX[currentScenario];

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 1000px; width: 94%; height: 90vh; display: flex; flex-direction: column; background: var(--bg-dark-secondary); border-radius: 16px; border: 1px solid var(--border-dark-strong); padding: 0; overflow: hidden;">
        
        <!-- Modal Header -->
        <header style="padding: 14px 24px; background: var(--bg-dark-tertiary); border-bottom: 1px solid var(--border-dark); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <i class="ri-shield-star-line"></i>
            </div>
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-dark-primary); display: flex; align-items: center; gap: 8px;">
                Brand Content OS v2.2 场景受控内容生产工作台
                <span style="font-size: 11px; background: var(--accent-purple); color: white; padding: 2px 6px; border-radius: 4px;">V2.2 Enforced</span>
              </h3>
              <p style="font-size: 11.5px; color: var(--text-dark-muted);">规则矩阵防偏离 ＋ 素材就绪度门禁 ＋ Claim-Evidence 证据绑定 ＋ 三阶输出净化</p>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary btn-sm" id="pr-reg-test-btn" style="font-size: 11.5px; border-color: var(--accent-amber); color: var(--accent-amber);">
              <i class="ri-test-tube-line"></i> 运行 OFFICIAL_PR 回归测试
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" id="pr-close-btn"><i class="ri-close-line"></i></button>
          </div>
        </header>

        <!-- Modal Body: 2 Column Split -->
        <div style="flex: 1; display: flex; overflow: hidden;">
          
          <!-- Column 1: V2.2 Governance Settings Panel -->
          <div style="width: 420px; background: var(--bg-dark-secondary); border-right: 1px solid var(--border-dark); padding: 16px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; flex-shrink: 0;">
            
            <div style="font-size: 11.5px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
              <i class="ri-ruler-2-line"></i> 1. 场景矩阵 (Scenario Matrix) 规则
            </div>

            <div>
              <label style="font-size: 11px; color: var(--text-dark-muted); display: block; margin-bottom: 4px;">选择传播场景 (Scenario Protocol):</label>
              <select id="pr-scenario-select" style="width: 100%; padding: 8px 12px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 6px; color: var(--text-dark-primary); font-size: 12.5px; font-weight: 600;">
                <option value="OFFICIAL_PR" ${currentScenario === 'OFFICIAL_PR' ? 'selected' : ''}>🏛️ OFFICIAL_PR (官方公关通稿 - 严格禁用菜谱/未核实素材)</option>
                <option value="MEDIA_FEATURE" ${currentScenario === 'MEDIA_FEATURE' ? 'selected' : ''}>📰 MEDIA_FEATURE (商业与产业深度报道)</option>
                <option value="BRAND_STORY" ${currentScenario === 'BRAND_STORY' ? 'selected' : ''}>🌲 BRAND_STORY (品牌长效认知)</option>
                <option value="LIFESTYLE" ${currentScenario === 'LIFESTYLE' ? 'selected' : ''}>🍵 LIFESTYLE (消费认知与生活方式饮品/菜谱)</option>
                <option value="INVESTOR" ${currentScenario === 'INVESTOR' ? 'selected' : ''}>📈 INVESTOR (商业壁垒与招商 BP)</option>
              </select>
            </div>

            <div style="font-size: 11.5px; font-weight: 700; color: var(--accent-purple); text-transform: uppercase; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
              <i class="ri-eye-line"></i> 2. 输出渲染模式 (Output Mode)
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              <button class="btn btn-sm ${currentOutputMode === 'AUDIT' ? 'btn-primary' : 'btn-secondary'}" class="out-mode-btn" data-mode="AUDIT" style="font-size: 11px; padding: 6px 2px;">
                🔍 AUDIT 内部审计
              </button>
              <button class="btn btn-sm ${currentOutputMode === 'EDITORIAL' ? 'btn-primary' : 'btn-secondary'}" class="out-mode-btn" data-mode="EDITORIAL" style="font-size: 11px; padding: 6px 2px;">
                ✍️ EDITORIAL 编辑审稿
              </button>
              <button class="btn btn-sm ${currentOutputMode === 'PUBLIC' ? 'btn-primary' : 'btn-secondary'}" class="out-mode-btn" data-mode="PUBLIC" style="font-size: 11px; padding: 6px 2px;">
                ✨ PUBLIC 媒体脱敏
              </button>
            </div>

            <div style="font-size: 11.5px; font-weight: 700; color: var(--accent-emerald); text-transform: uppercase; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
              <i class="ri-chat-1-line"></i> 3. 动态事件 5W 要素输入
            </div>

            <div>
              <label style="font-size: 11px; color: var(--text-dark-muted); display: block; margin-bottom: 2px;">事件主题 (What):</label>
              <input type="text" id="pr-event-title" value="${eventTitle}" style="width: 100%; padding: 7px 10px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 6px; color: var(--text-dark-primary); font-size: 12px;" />
            </div>

            <div style="display: flex; gap: 8px;">
              <div style="flex: 1;">
                <label style="font-size: 11px; color: var(--text-dark-muted); display: block; margin-bottom: 2px;">时间 (When):</label>
                <input type="date" id="pr-event-date" value="${eventDate}" style="width: 100%; padding: 6px 8px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 6px; color: var(--text-dark-primary); font-size: 11.5px;" />
              </div>
              <div style="flex: 1;">
                <label style="font-size: 11px; color: var(--text-dark-muted); display: block; margin-bottom: 2px;">地点 (Where):</label>
                <input type="text" id="pr-event-location" value="${eventLocation}" style="width: 100%; padding: 6px 8px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 6px; color: var(--text-dark-primary); font-size: 11.5px;" />
              </div>
            </div>

            <div>
              <label style="font-size: 11px; color: var(--text-dark-muted); display: block; margin-bottom: 2px;">参会领导 (Who):</label>
              <input type="text" id="pr-event-attendees" value="${eventAttendees}" style="width: 100%; padding: 7px 10px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 6px; color: var(--text-dark-primary); font-size: 12px;" />
            </div>

            <div>
              <label style="font-size: 11px; color: var(--text-dark-muted); display: block; margin-bottom: 2px;">领导核心讲话:</label>
              <textarea id="pr-leader-speech" rows="2" style="width: 100%; padding: 7px 10px; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 6px; color: var(--text-dark-primary); font-size: 11.5px; outline: none;">${leaderSpeech}</textarea>
            </div>

            <div style="border-top: 1px solid var(--border-dark); padding-top: 10px;">
              <div style="font-size: 11.5px; font-weight: 700; color: var(--text-dark-muted); margin-bottom: 6px; display: flex; justify-content: space-between;">
                <span>4. 勾选合规素材 (Readiness Gate: VERIFIED/PUBLISHED)</span>
                <span>${selectedAssetIds.length}/${verifiedAssets.length} 已选</span>
              </div>
              <div style="max-height: 100px; overflow-y: auto; background: var(--bg-dark-tertiary); border: 1px solid var(--border-dark); border-radius: 6px; padding: 6px;">
                ${allAssets.map(a => {
                  const isVerified = a.status === 'Published' || a.status === 'VERIFIED';
                  return `
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: ${isVerified ? 'var(--text-dark-secondary)' : 'var(--text-dark-muted)'}; margin-bottom: 4px; cursor: pointer; ${!isVerified ? 'opacity: 0.5;' : ''}">
                      <input type="checkbox" class="pr-asset-cb" data-id="${a.id}" ${selectedAssetIds.includes(a.id) ? 'checked' : ''} ${!isVerified ? 'disabled' : ''} />
                      <span style="font-weight: 600; font-family: var(--font-mono);">${a.asset_code}</span>
                      <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;">${a.title}</span>
                      <span style="font-size: 9.5px; padding: 1px 4px; border-radius: 3px; background: ${isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}; color: ${isVerified ? '#10b981' : '#f43f5e'}; ml-auto;">${a.status}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <button class="btn btn-primary" id="pr-rebuild-btn" style="margin-top: 4px; border-radius: 8px; padding: 10px; font-weight: 700; background: linear-gradient(135deg, #8b5cf6, #3b82f6);">
              <i class="ri-refresh-line"></i> 重新跑 V2.2 逻辑生成通稿
            </button>

          </div>

          <!-- Column 2: Synthesized Output Rendered View -->
          <div style="flex: 1; display: flex; flex-direction: column; background: var(--bg-dark-primary); overflow: hidden;">
            <div style="padding: 10px 18px; background: var(--bg-dark-secondary); border-bottom: 1px solid var(--border-dark); font-size: 12px; font-weight: 600; color: var(--text-dark-muted); display: flex; justify-content: space-between; align-items: center;">
              <span><i class="ri-file-text-line" style="color: var(--accent-primary);"></i> V2.2 输出区 (模式: ${currentOutputMode})</span>
              <span style="font-size: 11px; color: var(--accent-emerald); font-family: var(--font-mono);"><i class="ri-shield-check-line"></i> 场景受控受受控协议: ${spec.name}</span>
            </div>

            <div style="flex: 1; padding: 22px; overflow-y: auto; font-size: 13.5px; line-height: 1.8; color: var(--text-dark-primary); white-space: pre-wrap; font-family: sans-serif;">
              ${generatedArticle}
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <footer style="padding: 12px 24px; background: var(--bg-dark-tertiary); border-top: 1px solid var(--border-dark); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: var(--text-dark-muted);">通稿总字数: ${generatedArticle.length} 字 (模式: ${currentOutputMode})</span>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary btn-sm" id="pr-copy-btn">
              <i class="ri-file-copy-line"></i> 复制通稿内容
            </button>
            <button class="btn btn-primary btn-sm" id="pr-export-btn">
              <i class="ri-download-line"></i> 导出通稿 Markdown
            </button>
          </div>
        </footer>

      </div>
    `;

    modal.style.display = 'flex';

    // Bind Event Handlers
    modal.querySelector('#pr-close-btn').addEventListener('click', () => modal.style.display = 'none');

    modal.querySelector('#pr-scenario-select').addEventListener('change', (e) => {
      currentScenario = e.target.value;
      renderModal();
    });

    modal.querySelectorAll('.out-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentOutputMode = btn.getAttribute('data-mode');
        renderModal();
      });
    });

    modal.querySelector('#pr-rebuild-btn').addEventListener('click', () => {
      eventTitle = modal.querySelector('#pr-event-title').value.trim() || eventTitle;
      eventDate = modal.querySelector('#pr-event-date').value || eventDate;
      eventLocation = modal.querySelector('#pr-event-location').value.trim() || eventLocation;
      eventAttendees = modal.querySelector('#pr-event-attendees').value.trim() || eventAttendees;
      leaderSpeech = modal.querySelector('#pr-leader-speech').value.trim() || leaderSpeech;

      showToast(`🤖 已按 ${currentScenario} 场景重新生成通稿`, 'info');
      renderModal();
    });

    modal.querySelector('#pr-reg-test-btn').addEventListener('click', () => {
      const result = exportEngine.runScenarioRegressionTest();
      if (result.passed) {
        alert(`✅ V2.2 OFFICIAL_PR 回归测试成功 PASS！\n\n- 海关出境凭证包含: ${result.details.hasCustoms}\n- 0农残报告包含: ${result.details.hasPesticide}\n- 禁用菜谱被死锁封锁: ${result.details.blockedForbiddenRecipe}\n- 禁用酸奶奶盖被死锁封锁: ${result.details.blockedForbiddenYogurt}\n- 未核实草稿被死锁封锁: ${result.details.blockedUnverifiedDraft}`);
        showToast('✅ OFFICIAL_PR 回归测试通过！菜谱与草稿已 100% 封锁！', 'success');
      } else {
        alert(`❌ 回归测试失败 FAIL！`);
      }
    });

    modal.querySelectorAll('.pr-asset-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.getAttribute('data-id');
        if (cb.checked) {
          if (!selectedAssetIds.includes(id)) selectedAssetIds.push(id);
        } else {
          selectedAssetIds = selectedAssetIds.filter(i => i !== id);
        }
      });
    });

    modal.querySelector('#pr-copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(generatedArticle);
      showToast('✅ 通稿已复制到剪贴板！', 'success');
    });

    modal.querySelector('#pr-export-btn').addEventListener('click', () => {
      exportEngine.downloadFile(`天旺藏红花_通稿_${currentScenario}_${currentOutputMode}_${Date.now()}.md`, generatedArticle);
      showToast('✅ Markdown 通稿已成功导出！', 'success');
    });
  }

  renderModal();
}

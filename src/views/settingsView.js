/**
 * Brand Content OS (BCOS) - Settings Workspace View
 */

import { showToast } from '../components/toast.js';
import { store } from '../services/store.js';
import { jevDecisionEngine, JEV_CONFIG } from '../services/jevDecisionEngine.js';
import { jevHarnessInspector } from '../services/jevHarnessInspector.js';
import { knowledgeQAEngine } from '../services/knowledgeQAEngine.js';

export function renderSettingsView(container) {
  function render() {
    const isLight = document.body.classList.contains('theme-light');

    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <div class="view-title-group">
            <div class="view-title">
              <i class="ri-settings-4-line" style="color: var(--accent-primary);"></i>
              <span>System Settings 系统设置</span>
            </div>
            <span class="view-subtitle">管理 BCOS 工作区主题、数据备份还原与系统配置</span>
          </div>
        </header>

        <div class="view-body" style="max-width: 800px;">
          <!-- Section 0: JEV Decision Layer (System One) -->
          <div class="panel" style="margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.4); background: linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%);">
            <div class="panel-header" style="border-bottom: 1px solid rgba(139, 92, 246, 0.2); display: flex; justify-content: space-between; align-items: center;">
              <span class="panel-title" style="color: #a78bfa; display: flex; align-items: center; gap: 8px;">
                <i class="ri-cpu-line" style="font-size: 18px;"></i>
                <span>JEV 决策层核心中枢 (TypeSafe System One Decision Layer)</span>
              </span>
              <span class="badge" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4);">
                Active Decision Engine
              </span>
            </div>
            <div class="panel-body" style="display: flex; flex-direction: column; gap: 18px;">
              <div style="font-size: 13px; color: var(--text-dark-muted); line-height: 1.6;">
                依据 TypeSafe AI 认知双系统架构：<strong>JEV 专职负责“决策层 (Decision Layer)”</strong>（包括场景分类、合规红线 Noul 概率计算、资产评分与 CAP 组装），而外部生成式大模型（NotebookLM / Gemini / Claude）被严格降级为<strong>表达执行器 (Expression Engine)</strong>，无权篡改决策。
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: rgba(0,0,0,0.2); padding: 14px; border-radius: 8px;">
                <div>
                  <div style="font-size: 12px; color: var(--text-dark-muted); display: flex; justify-content: space-between;">
                    <span>决策模型版本 (Model Version)</span>
                    <span style="color: #10b981; font-size: 11px;"><i class="ri-checkbox-circle-line"></i> 可升级</span>
                  </div>
                  <select id="jev-model-select" class="form-control" style="font-size: 12px; padding: 4px 8px; margin-top: 4px; width: 100%; font-family: var(--font-mono);">
                    ${JEV_CONFIG.availableModels.map(m => `
                      <option value="${m.id}" ${JEV_CONFIG.model === m.id ? 'selected' : ''}>${m.id} (${m.name.includes('最新稳定') ? '最新稳定' : (m.id === 'jev-1.13.0' ? '生产固化版' : '预览版')})</option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--text-dark-muted);">架构地位 (Role)</div>
                  <div style="font-size: 13px; font-weight: 600; color: #34d399; margin-top: 6px;">全系统统一决策层 (System One)</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--text-dark-muted);">运行模式 (Mode)</div>
                  <select id="jev-mode-select" class="form-control" style="font-size: 12px; padding: 4px 8px; margin-top: 4px; width: 100%;">
                    <option value="HYBRID_ACTIVE" ${JEV_CONFIG.mode === 'HYBRID_ACTIVE' ? 'selected' : ''}>混合高保真 (Hybrid Active)</option>
                    <option value="LOCAL_SYSTEM_ONE" ${JEV_CONFIG.mode === 'LOCAL_SYSTEM_ONE' ? 'selected' : ''}>本地极速 System One (毫秒级)</option>
                    <option value="REMOTE" ${JEV_CONFIG.mode === 'REMOTE' ? 'selected' : ''}>TypeSafe Remote API</option>
                  </select>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--text-dark-muted);">红线安全阈值 (Safety Threshold)</div>
                  <div style="font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: #f59e0b; margin-top: 6px;">
                    P(Safe) ≥ ${(JEV_CONFIG.safetyThreshold * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <!-- Jev Live Tester -->
              <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-dark-primary); display: flex; align-items: center; gap: 6px;">
                  <i class="ri-flashlight-line" style="color: #f59e0b;"></i> Jev 即时决策沙盒测试 (Live Decision Sandbox)
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                  <input type="text" id="jev-sandbox-input" class="form-control" placeholder="输入待决策的内容、宣称或 Brief 主题进行即时判定..." value="天旺藏红花在西藏林芝实现 0 农残规模化出海" style="flex: 1; font-size: 13px;" />
                  <button class="btn btn-primary" id="jev-sandbox-run-btn" style="background: #8b5cf6; border-color: #7c3aed; white-space: nowrap;">
                    <i class="ri-play-line"></i> Jev 裁决
                  </button>
                </div>
                <div id="jev-sandbox-result" style="display: none; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; font-size: 12px;"></div>
              </div>

              <!-- Jev Harness Self-Evolution Panel -->
              <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; background: rgba(16, 185, 129, 0.03); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div style="font-size: 13px; font-weight: 700; color: #34d399; display: flex; align-items: center; gap: 6px;">
                    <i class="ri-sparkling-2-line"></i>
                    <span>Jev Harness 知识库问答自进化巡检 (Sydney Runkle Loop)</span>
                  </div>
                  <button class="btn btn-sm" id="jev-harness-run-btn" style="background: #059669; color: white; border: none; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                    <i class="ri-refresh-line"></i> 启动自进化巡检
                  </button>
                </div>
                <div style="font-size: 12px; color: var(--text-dark-muted); line-height: 1.5; margin-bottom: 12px;">
                  对知识库 QA 案例库执行自动化回放与门限扫描，自动计算 AUC、发现边缘误判案例，动态自适应优化安全置信度门槛，实现决策层免微调自我进化。
                </div>

                <!-- Live Knowledge QA Test -->
                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                  <div style="font-size: 12px; font-weight: 600; color: #38bdf8; margin-bottom: 6px;">
                    <i class="ri-question-answer-line"></i> 知识库智能问答实测 (带前置/后置双门禁)
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <input type="text" id="qa-test-input" class="form-control" style="font-size: 12px;" placeholder="测试提问，如：藏红花能替代降糖药根治糖尿病吗？" value="藏红花能替代降糖药根治糖尿病吗？" />
                    <button class="btn btn-secondary btn-sm" id="qa-test-btn" style="white-space: nowrap;">提问</button>
                  </div>
                  <div id="qa-test-result" style="display: none; margin-top: 8px; font-size: 12px; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 6px;"></div>
                </div>

                <div id="harness-report-result" style="display: none; font-size: 12px; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 6px;"></div>
              </div>
            </div>
          </div>

          <!-- Section 1: Appearance & Theme -->
          <div class="panel" style="margin-bottom: 24px;">
            <div class="panel-header">
              <span class="panel-title"><i class="ri-palette-line"></i> 主题外观 (Theme)</span>
            </div>
            <div class="panel-body" style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">色彩主题模式</div>
                <div style="font-size: 12px; color: var(--text-dark-muted);">可以在极简极客深色模式与清晰亮色模式间无缝切换</div>
              </div>
              <button class="btn btn-secondary" id="set-theme-toggle-btn">
                <i class="${isLight ? 'ri-moon-line' : 'ri-sun-line'}"></i>
                <span>${isLight ? '切换为深色模式 (Dark)' : '切换为亮色模式 (Light)'}</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Data Backup & Restore -->
          <div class="panel" style="margin-bottom: 24px;">
            <div class="panel-header">
              <span class="panel-title"><i class="ri-database-2-line"></i> 数据库备份与还原 (Backup & Restore)</span>
            </div>
            <div class="panel-body" style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">导出数据库完整 JSON 快照</div>
                  <div style="font-size: 12px; color: var(--text-dark-muted);">导出包含 Modules, Assets, Versions, Relations 及 Releases 的完整 JSON 文件</div>
                </div>
                <button class="btn btn-secondary" id="set-export-json-btn">
                  <i class="ri-download-2-line"></i> 导出 JSON 备份
                </button>
              </div>

              <div style="border-top: 1px solid var(--border-dark); padding-top: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">还原 JSON 数据快照</div>
                  <div style="font-size: 12px; color: var(--text-dark-muted);">导入历史 BCOS 数据库备份 JSON 文件</div>
                </div>
                <label class="btn btn-secondary" style="cursor: pointer;">
                  <i class="ri-upload-2-line"></i> 导入并还原
                  <input type="file" id="set-restore-json-input" accept=".json" style="display: none;" />
                </label>
              </div>
            </div>
          </div>

          <!-- Section 3: Reset Data -->
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title" style="color: var(--accent-rose);"><i class="ri-refresh-line"></i> 重置数据种子</span>
            </div>
            <div class="panel-body" style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 600; font-size: 14px; color: var(--text-dark-primary);">恢复 Sprint 0 & Sprint 1 初始数据</div>
                <div style="font-size: 12px; color: var(--text-dark-muted);">重置 LocalStorage 并重新装载 Sprint 0 与 Sprint 1 的 Brand Asset 种子库</div>
              </div>
              <button class="btn btn-secondary" id="set-reset-seed-btn" style="border-color: rgba(244, 63, 94, 0.4); color: var(--accent-rose);">
                <i class="ri-restart-line"></i> 重置为 Seed 数据
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Theme Toggle
    const themeBtn = container.querySelector('#set-theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        if (document.body.classList.contains('theme-light')) {
          document.body.classList.remove('theme-light');
          document.body.classList.add('theme-dark');
        } else {
          document.body.classList.remove('theme-dark');
          document.body.classList.add('theme-light');
        }
        render();
      });
    }

    // Bind Export JSON
    const exportBtn = container.querySelector('#set-export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const raw = localStorage.getItem('BCOS_DB_V1');
        if (!raw) return;
        const blob = new Blob([raw], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BCOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('JSON 备份文件导出成功', 'success');
      });
    }

    // Bind Restore JSON
    const restoreInput = container.querySelector('#set-restore-json-input');
    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed.assets && parsed.modules) {
              localStorage.setItem('BCOS_DB_V1', JSON.stringify(parsed));
              store.loadState();
              showToast('数据还原成功！', 'success');
              render();
            } else {
              showToast('无效的 BCOS 备份格式', 'error');
            }
          } catch (err) {
            showToast('JSON 解析失败', 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Bind Reset Seed
    const resetBtn = container.querySelector('#set-reset-seed-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('确认将所有资产与版本重置为 Sprint 0 & Sprint 1 初始 Seed 数据？')) {
          store.resetToSeed();
          showToast('数据已成功重置为 Seed 状态', 'success');
          render();
        }
      });
    }

    // Bind Jev Mode Select
    const jevModeSelect = container.querySelector('#jev-mode-select');
    if (jevModeSelect) {
      jevModeSelect.addEventListener('change', (e) => {
        jevDecisionEngine.setMode(e.target.value);
        showToast(`Jev 决策层模式已更新为: ${e.target.value}`, 'success');
      });
    }

    // Bind Jev Model Version Select
    const jevModelSelect = container.querySelector('#jev-model-select');
    if (jevModelSelect) {
      jevModelSelect.addEventListener('change', (e) => {
        jevDecisionEngine.setModelVersion(e.target.value);
        showToast(`Jev 决策模型已升级为: ${e.target.value}`, 'success');
      });
    }

    // Bind Jev Sandbox Runner
    const sandboxBtn = container.querySelector('#jev-sandbox-run-btn');
    const sandboxInput = container.querySelector('#jev-sandbox-input');
    const sandboxResult = container.querySelector('#jev-sandbox-result');
    if (sandboxBtn && sandboxInput && sandboxResult) {
      sandboxBtn.addEventListener('click', async () => {
        const text = sandboxInput.value.trim();
        if (!text) return;
        sandboxBtn.disabled = true;
        sandboxBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> 决策中...`;

        const mockAsset = { title: text, content: text, summary: text };
        const mockBrief = { topic: text, editorial_intent: text, core_message: text };

        const scenarioDecision = await jevDecisionEngine.routeScenarioIntent(mockBrief);
        const safetyDecision = await jevDecisionEngine.evaluateClaimSafety(mockAsset, scenarioDecision.value);
        const fitDecision = await jevDecisionEngine.evaluateAssetFit(mockAsset, mockBrief);

        sandboxResult.style.display = 'block';
        sandboxResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 600; color: #a78bfa;">
            <span>Jev System One 决策结果</span>
            <span style="font-family: var(--font-mono); color: #38bdf8;">耗时: ${scenarioDecision.latency_ms + safetyDecision.latency_ms + fitDecision.latency_ms}ms</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
            <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px;">
              <div style="color: var(--text-dark-muted); font-size: 11px;">Choice 场景判定</div>
              <div style="font-weight: 700; color: #38bdf8;">${scenarioDecision.value}</div>
              <div style="font-size: 10px; color: var(--text-dark-muted);">置信度: ${(scenarioDecision.confidence * 100).toFixed(1)}%</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px;">
              <div style="color: var(--text-dark-muted); font-size: 11px;">Noul 安全合规</div>
              <div style="font-weight: 700; color: ${safetyDecision.is_safe ? '#34d399' : '#f43f5e'};">
                ${safetyDecision.is_safe ? 'PASS (合规)' : 'BLOCKED (阻断)'}
              </div>
              <div style="font-size: 10px; color: var(--text-dark-muted);">P(Safe): ${(safetyDecision.safe_probability * 100).toFixed(1)}%</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px;">
              <div style="color: var(--text-dark-muted); font-size: 11px;">Score & Role</div>
              <div style="font-weight: 700; color: #f59e0b;">${fitDecision.role} (${fitDecision.score.toFixed(1)}分)</div>
              <div style="font-size: 10px; color: var(--text-dark-muted);">角色指派</div>
            </div>
          </div>
          ${safetyDecision.violation_reasons.length > 0 ? `
            <div style="color: #f43f5e; font-size: 11px; margin-top: 4px;">
              <strong>拦截原因:</strong> ${safetyDecision.violation_reasons.join(', ')}
            </div>
          ` : `
            <div style="color: #34d399; font-size: 11px;">
              ✓ 该输入经 Jev 裁决符合 ${scenarioDecision.value} 场景规范，已准予生成 CAP 计划。
            </div>
          `}
        `;

        sandboxBtn.disabled = false;
        sandboxBtn.innerHTML = `<i class="ri-play-line"></i> Jev 裁决`;
      });
    }

    // Bind Knowledge QA Test
    const qaBtn = container.querySelector('#qa-test-btn');
    const qaInput = container.querySelector('#qa-test-input');
    const qaResult = container.querySelector('#qa-test-result');
    if (qaBtn && qaInput && qaResult) {
      qaBtn.addEventListener('click', async () => {
        const query = qaInput.value.trim();
        if (!query) return;
        qaBtn.disabled = true;
        qaBtn.textContent = '检索与裁决中...';

        const res = await knowledgeQAEngine.answerQuestion(query);

        qaResult.style.display = 'block';
        qaResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: 600;">
            <span style="color: ${res.governance.is_safe ? '#34d399' : '#f59e0b'};">
              ${res.governance.pre_gate.is_medical_risk ? '⚠️ 触发医疗红线前置拦截' : '✓ 经 Jev 双门禁裁决放行'}
            </span>
            <span style="color: #38bdf8; font-family: var(--font-mono);">${res.governance.latency_ms}ms</span>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px; margin-bottom: 6px; line-height: 1.5; color: var(--text-dark-primary);">
            ${res.answer}
          </div>
          <div style="font-size: 11px; color: var(--text-dark-muted); display: flex; gap: 12px;">
            <span>意图分类: <strong>${res.governance.pre_gate.category}</strong></span>
            <span>安全概率 P(Safe): <strong>${(res.governance.post_sentinel.safe_probability * 100).toFixed(0)}%</strong></span>
            <span>SSOT 匹配: <strong>${res.governance.matched_ssot_id || '通用底座'}</strong></span>
          </div>
        `;
        qaBtn.disabled = false;
        qaBtn.textContent = '提问';
      });
    }

    // Bind Jev Harness Evolution Runner
    const harnessBtn = container.querySelector('#jev-harness-run-btn');
    const harnessResult = container.querySelector('#harness-report-result');
    if (harnessBtn && harnessResult) {
      harnessBtn.addEventListener('click', async () => {
        harnessBtn.disabled = true;
        harnessBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> 巡检进化中...`;

        const report = await jevHarnessInspector.runEvolutionInspection();

        harnessResult.style.display = 'block';
        harnessResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 700; color: #34d399;">
            <span><i class="ri-checkbox-circle-line"></i> Jev Harness 自进化巡检完成</span>
            <span style="font-family: var(--font-mono); color: #38bdf8;">${report.duration_ms}ms · 代次: ${report.evolution_log?.version || 'LATEST'}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px; text-align: center;">
            <div style="background: rgba(255,255,255,0.05); padding: 6px; border-radius: 4px;">
              <div style="color: var(--text-dark-muted); font-size: 10px;">校准度 AUC</div>
              <div style="font-weight: 700; color: #38bdf8; font-size: 14px;">${report.calibration.auc}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 6px; border-radius: 4px;">
              <div style="color: var(--text-dark-muted); font-size: 10px;">自进化最优阈值</div>
              <div style="font-weight: 700; color: #10b981; font-size: 14px;">P ≥ ${(report.calibration.optimal_threshold * 100).toFixed(0)}%</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 6px; border-radius: 4px;">
              <div style="color: var(--text-dark-muted); font-size: 10px;">评测样本总数</div>
              <div style="font-weight: 700; color: var(--text-dark-primary); font-size: 14px;">${report.diagnostics.total_samples}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 6px; border-radius: 4px;">
              <div style="color: var(--text-dark-muted); font-size: 10px;">误判/漏判 (FP/FN)</div>
              <div style="font-weight: 700; color: ${report.diagnostics.false_positives.length === 0 ? '#34d399' : '#f43f5e'}; font-size: 14px;">
                ${report.diagnostics.false_positives.length} / ${report.diagnostics.false_negatives.length}
              </div>
            </div>
          </div>
          <div style="font-size: 11px; color: #a78bfa;">
            ✓ 系统已完成闭环：最优安全置信度阈值已自动写回 Jev 决策层，巡检日志已归档至知识库。
          </div>
        `;

        harnessBtn.disabled = false;
        harnessBtn.innerHTML = `<i class="ri-refresh-line"></i> 再次巡检`;
        showToast('Jev Harness 自进化巡检完成！', 'success');
      });
    }
  }

  render();
}

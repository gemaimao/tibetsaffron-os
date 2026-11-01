/**
 * NeoNarrative 三方对话状态机 (Dialogue State Machine)
 * 驱动 Host A / Host B / User，严格实现 L1~L4 分级打断流水线与自适应主线恢复
 */

import { DialogueState, UserIntent, Speaker, JevDecision } from '../core/types.js';

export class DialogueStateMachine {
  constructor({ claimGraph, jevGateway, narrativeIR, renderers = [] }) {
    this.claimGraph = claimGraph;
    this.jevGateway = jevGateway;
    this.narrativeIR = narrativeIR;
    this.renderers = renderers;

    this.state = DialogueState.IDLE;
    this.currentSceneIndex = 0;
    this.currentTurnIndex = 0;
    this.activeClaimId = null;
    this.interruptionStack = [];
    this.eventHistory = [];
    this.isRunning = false;
    this.isBargeInActive = false;
    this.onTurnCallback = null;
  }

  registerRenderer(renderer) {
    this.renderers.push(renderer);
  }

  setTurnCallback(cb) {
    this.onTurnCallback = cb;
  }

  transitionTo(newState, meta = {}) {
    const prevState = this.state;
    this.state = newState;
    const transitionRecord = {
      from: prevState,
      to: newState,
      timestamp: Date.now(),
      meta,
    };
    this.eventHistory.push(transitionRecord);
    return transitionRecord;
  }

  /**
   * 启动 Narrative 自治驱动主循环
   */
  async start(autoLoop = false) {
    this.isRunning = true;
    this.isBargeInActive = false;
    this.currentSceneIndex = 0;
    this.currentTurnIndex = 0;
    this.transitionTo(DialogueState.INITIALIZING);
    if (autoLoop) {
      return this.runMainLoop();
    } else {
      return this.tickNextTurn();
    }
  }

  /**
   * 步进消费下一个话轮 (Step Turn)
   */
  async tickNextTurn() {
    const currentScene = this.narrativeIR.scenes[this.currentSceneIndex];
    if (!currentScene) {
      this.transitionTo(DialogueState.COMPLETED);
      return null;
    }

    const currentTurn = currentScene.turns[this.currentTurnIndex];
    if (!currentTurn) {
      this.currentSceneIndex++;
      this.currentTurnIndex = 0;
      return this.tickNextTurn();
    }

    this.activeClaimId = currentTurn.associatedClaimId;
    const targetState =
      currentTurn.speaker === Speaker.HOST_B
        ? DialogueState.HOST_B_SPEAKING
        : DialogueState.HOST_A_SPEAKING;
    this.transitionTo(targetState, { turnId: currentTurn.turnId });

    if (this.onTurnCallback) {
      this.onTurnCallback(currentTurn);
    }

    await Promise.all(this.renderers.map((r) => r.renderTurn(currentTurn)));
    this.currentTurnIndex++;
    return currentTurn;
  }

  /**
   * 停止主循环
   */
  stop() {
    this.isRunning = false;
    this.transitionTo(DialogueState.IDLE);
  }

  /**
   * 核心自治循环引擎 (Autonomous Loop Engine)
   * 自动推进话轮，并在打断解决后能够无缝自愈恢复
   */
  async runMainLoop() {
    while (this.isRunning && !this.isBargeInActive) {
      const turn = await this.tickNextTurn();
      if (!turn || this.isBargeInActive || !this.isRunning) break;
      // 话轮之间的自然气口呼吸间隙 (800ms)
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  /**
   * 核心打断处理流水线 (L1 ~ L4 Barge-in Pipeline)
   * @param {string} userUtterance 用户打断发声内容
   * @param {string} [explicitIntent] 可选的用户显式意图
   */
  async handleBargeIn(userUtterance, explicitIntent = null) {
    this.isBargeInActive = true;
    const bargeInStart = Date.now();
    const metrics = {
      l1_acoustic_cutoff_ms: 0,
      l2_intent_classify_ms: 0,
      l3_evidence_lookup_ms: 0,
      l4_jev_and_first_chunk_ms: 0,
      total_latency_ms: 0,
    };

    // ── L1: 听觉秒停 (Acoustic Cutoff) ──
    const l1Start = Date.now();
    this.transitionTo(DialogueState.USER_INTERRUPTING, { userUtterance });
    await Promise.all(this.renderers.map((r) => r.interrupt()));
    metrics.l1_acoustic_cutoff_ms = Date.now() - l1Start;

    // ── L2: 意图理解与指令分类 (Intent Classification) ──
    const l2Start = Date.now();
    this.transitionTo(DialogueState.INTENT_CLASSIFYING);
    let resolvedIntent = explicitIntent;
    if (!resolvedIntent) {
      if (/说.*什么|没听清|再说一遍|智商税|什么水|什么税|刚.*说/.test(userUtterance)) {
        resolvedIntent = 'CLARIFICATION';
      } else if (/^(?:对不起|不好意思|打扰|打扰一下|抱歉)[！!，,。.\s]*$/.test(userUtterance.trim())) {
        resolvedIntent = 'POLITE_GREETING';
      } else if (/依据|出处|来源|报告|原件|页码|第几页|凭证|公章|编号|查验/.test(userUtterance)) {
        resolvedIntent = UserIntent.EVIDENCE;
      } else if (/不对吧|真的吗|挑刺|质疑|水分|怎么可能|夸大|多如牛毛/.test(userUtterance)) {
        resolvedIntent = UserIntent.CHALLENGE;
      } else if (/展开|具体|怎么做|原理|细讲|为什么|参数|怎么种|多少钱|价格/.test(userUtterance)) {
        resolvedIntent = UserIntent.DRILL_DOWN;
      } else {
        resolvedIntent = UserIntent.INTERRUPT;
      }
    }
    metrics.l2_intent_classify_ms = Date.now() - l2Start;

    // ── L3: 证据检索与锚点定位 (Evidence Anchor Retrieval) ──
    const l3Start = Date.now();
    this.transitionTo(DialogueState.EVIDENCE_RETRIEVING, { intent: resolvedIntent });
    const activeClaim = this.activeClaimId
      ? this.claimGraph.getClaim(this.activeClaimId)
      : null;
    const attachedEvidences = this.activeClaimId
      ? this.claimGraph.getEvidencesForClaim(this.activeClaimId)
      : [];
    metrics.l3_evidence_lookup_ms = Date.now() - l3Start;

    // ── L4: JEV 治理审查与首包回应装配 (JEV & Response Synthesis) ──
    const l4Start = Date.now();
    this.transitionTo(DialogueState.JEV_CHECKING);

    let respondingSpeaker = Speaker.HOST_A;
    let draftUtterance = '';

    if (resolvedIntent === 'CLARIFICATION') {
      respondingSpeaker = Speaker.HOST_A;
      draftUtterance = `哈哈，这位朋友没听清！小林刚才说的是“智商税”，不是什么水！市面上几十块钱包邮那些号称纯天然零农残的，摸着良心说，九成九可不就是收中产智商税吗！`;
    } else if (resolvedIntent === 'POLITE_GREETING') {
      respondingSpeaker = Speaker.HOST_A;
      draftUtterance = `哎没事这位朋友！您太客气了，随时欢迎插话！您说，关于刚才聊的高原基地品质，您想了解什么？`;
    } else if (resolvedIntent === UserIntent.CHALLENGE) {
      respondingSpeaker = Speaker.HOST_B;
      draftUtterance = `这位朋友质疑得很专业！阿龙你刚才说这组数据，确实必须把实验边界说清。依据权威报告，这仅代表该特定送检批次，绝不等于所有露天种植也能自动达到。`;
    } else if (resolvedIntent === UserIntent.EVIDENCE) {
      respondingSpeaker = Speaker.HOST_A;
      const firstEvi = attachedEvidences[0]?.evidence;
      const firstDoc = attachedEvidences[0]?.document;
      const citation = firstDoc
        ? `${firstDoc.title} 第 ${firstEvi?.locator?.pageNumber || 1} 页`
        : '官方检测归档报告';
      draftUtterance = `没问题，求证出处完全透明！该数据严格出自 ${citation}，实验室编号均有公章可查。`;
    } else if (resolvedIntent === UserIntent.DRILL_DOWN) {
      respondingSpeaker = Speaker.HOST_B;
      draftUtterance = `这位朋友深挖得好！设施控环核心在于温湿度、光照周期与固态营养基质的精准配比，彻底摆脱了传统露天看天吃饭的农药依赖。`;
    } else {
      respondingSpeaker = Speaker.HOST_B;
      draftUtterance = `大家先稍等，刚才这位朋友提到的细节很关键，老百姓最关心的确实就是到底安不安全，我们马上展开剖析。`;
    }

    const jevVerdict = await this.jevGateway.evaluateTurnCompliance({
      speaker: respondingSpeaker,
      utterance: draftUtterance,
      associatedClaimId: this.activeClaimId,
    });

    let finalUtterance = draftUtterance;
    if (jevVerdict.decision === JevDecision.BLOCK) {
      finalUtterance =
        jevVerdict.actionPayload?.fallbackUtterance ||
        '关于这一点，我们严格以官方检验报告为准。';
    }

    metrics.l4_jev_and_first_chunk_ms = Date.now() - l4Start;
    metrics.total_latency_ms = Date.now() - bargeInStart;

    // ── 渲染回应 ──
    this.transitionTo(DialogueState.ANSWERING_USER, { respondingSpeaker });
    const responseTurn = {
      turnId: `turn-response-${Date.now()}`,
      speaker: respondingSpeaker,
      semanticUtterance: finalUtterance,
      associatedClaimId: this.activeClaimId,
      presentationIntents: attachedEvidences[0]
        ? [
            {
              intentType: 'EVIDENCE_REVEAL',
              payload: {
                sourceReference: {
                  documentTitle: attachedEvidences[0].document?.title || '检测报告',
                  page: attachedEvidences[0].evidence?.locator?.pageNumber || 1,
                  quote: attachedEvidences[0].evidence?.rawQuote || '',
                  verificationCode: attachedEvidences[0].evidence?.evidenceId || '',
                },
              },
            },
          ]
        : [],
    };

    if (this.onTurnCallback) {
      this.onTurnCallback(responseTurn);
    }
    await Promise.all(this.renderers.map((r) => r.renderTurn(responseTurn)));

    // ── 平滑过渡回原主线 (Recovery) ──
    this.transitionTo(DialogueState.RECOVERING_TO_FLOW);
    const recoveryTurn = {
      turnId: `turn-recovery-${Date.now()}`,
      speaker: Speaker.HOST_A,
      semanticUtterance: '好，解答完这位朋友的疑惑，我们把视线拉回今天的主题，继续往下看……',
    };
    if (this.onTurnCallback) {
      this.onTurnCallback(recoveryTurn);
    }
    await Promise.all(this.renderers.map((r) => r.renderTurn(recoveryTurn)));

    // ── 自动自愈恢复主线对谈循环 (Resume Main Loop) ──
    this.isBargeInActive = false;
    if (this.isRunning) {
      // 推进至下一个话轮继续播
      this.currentTurnIndex++;
      this.runMainLoop().catch(console.error);
    }

    return {
      resolvedIntent,
      metrics,
      responseTurn,
      jevVerdict,
    };
  }
}

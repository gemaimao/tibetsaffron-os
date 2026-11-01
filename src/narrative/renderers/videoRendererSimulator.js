/**
 * VideoRendererSimulator (NeoVideo 视觉介质渲染器模拟器)
 * 将同一个 Narrative IR 解释为视频画面关键帧、3D运镜、图表与原文红框高亮
 */

import { BaseRenderer } from './baseRenderer.js';
import { PresentationIntentType } from '../core/types.js';

export class VideoRendererSimulator extends BaseRenderer {
  constructor(rendererId = 'renderer-neovideo-01') {
    super('VIDEO', rendererId);
    this.keyframeTimeline = [];
  }

  async renderTurn(turn) {
    if (!this.isInitialized) await this.initialize();

    const visualCues = [];
    if (turn.presentationIntents) {
      for (const pIntent of turn.presentationIntents) {
        const visualInterpretation = await this.handlePresentationIntent(pIntent);
        visualCues.push(visualInterpretation);
      }
    }

    const keyframe = {
      mediaType: 'VIDEO_KEYFRAME',
      turnId: turn.turnId,
      speaker: turn.speaker,
      subtitle: turn.semanticUtterance,
      visualCues,
      composition: {
        lowerThirdText: `${turn.speaker}: ${turn.semanticUtterance.slice(0, 30)}...`,
        pipActive: visualCues.some((c) => c.component === 'PIP_DOCUMENT_VIEWER'),
      },
      timestamp: Date.now(),
    };

    this.keyframeTimeline.push(keyframe);
    this.renderedArtifacts.push(keyframe);
    return keyframe;
  }

  /**
   * 将介质无关呈现意图映射为视觉画面指令
   */
  async handlePresentationIntent(intent) {
    switch (intent.intentType) {
      case PresentationIntentType.SPATIAL_CONTEXT:
        return {
          component: '3D_MAP_VIEWPORT',
          action: 'CAMERA_FLY_TO',
          targetCoordinates: intent.payload?.coordinates || [29.65, 91.13],
          label: intent.payload?.primaryText || '西藏林芝',
          visualEffect: 'TOPOGRAPHIC_TERRAIN_HIGHLIGHT',
        };

      case PresentationIntentType.DATA_EMPHASIS:
        return {
          component: 'DYNAMIC_CHART_OVERLAY',
          chartType: 'ANIMATED_BAR_COMPARISON',
          highlightValue: intent.payload?.numericHighlight?.value,
          metricLabel: intent.payload?.numericHighlight?.label,
          calloutBox: intent.payload?.numericHighlight?.baselineComparison,
        };

      case PresentationIntentType.EVIDENCE_REVEAL:
        return {
          component: 'PIP_DOCUMENT_VIEWER',
          documentTitle: intent.payload?.sourceReference?.documentTitle,
          pageNumber: intent.payload?.sourceReference?.page,
          highlightBox: 'RED_OUTLINE_BOUNDING_BOX',
          verificationBadge: 'THIRD_PARTY_AUTHENTICATED',
        };

      case PresentationIntentType.COMPARISON:
        return {
          component: 'SPLIT_SCREEN_LAYOUT',
          leftPanel: 'Scheme A (Traditional)',
          rightPanel: 'Scheme B (Tianwang Controlled)',
        };

      default:
        return {
          component: 'STANDARD_TALKING_HEAD_VIEW',
        };
    }
  }

  async interrupt() {
    // 视觉端：暂停播放头并在画面呈现等待/监听脉冲光晕
    return {
      status: 'PAUSED',
      visualIndicator: 'LISTENING_HALO_PULSE',
      stoppedAt: Date.now(),
    };
  }
}

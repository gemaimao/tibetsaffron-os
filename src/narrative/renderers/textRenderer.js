/**
 * TextRenderer (UI / 交互式卡片渲染器)
 * 将 Narrative IR 解释为结构化对话气泡与 Evidence Card 浮层事件
 */

import { BaseRenderer } from './baseRenderer.js';
import { PresentationIntentType } from '../core/types.js';

export class TextRenderer extends BaseRenderer {
  constructor(rendererId = 'renderer-text-ui-01') {
    super('TEXT', rendererId);
    this.messageFeed = [];
    this.activeEvidenceCard = null;
  }

  async renderTurn(turn) {
    if (!this.isInitialized) await this.initialize();

    const uiWidgets = [];
    if (turn.presentationIntents) {
      for (const pIntent of turn.presentationIntents) {
        const widget = await this.handlePresentationIntent(pIntent);
        uiWidgets.push(widget);
      }
    }

    const messageItem = {
      mediaType: 'UI_MESSAGE_CARD',
      turnId: turn.turnId,
      speaker: turn.speaker,
      text: turn.semanticUtterance,
      associatedClaimId: turn.associatedClaimId,
      widgets: uiWidgets,
      timestamp: Date.now(),
    };

    this.messageFeed.push(messageItem);
    this.renderedArtifacts.push(messageItem);
    return messageItem;
  }

  async handlePresentationIntent(intent) {
    switch (intent.intentType) {
      case PresentationIntentType.EVIDENCE_REVEAL:
        this.activeEvidenceCard = intent.payload?.sourceReference;
        return {
          widgetType: 'EVIDENCE_DRAWER_CARD',
          title: intent.payload?.sourceReference?.documentTitle,
          page: intent.payload?.sourceReference?.page,
          quote: intent.payload?.sourceReference?.quote,
        };

      case PresentationIntentType.DATA_EMPHASIS:
        return {
          widgetType: 'STATISTIC_BADGE',
          badgeText: `${intent.payload?.numericHighlight?.label}: ${intent.payload?.numericHighlight?.value}`,
        };

      case PresentationIntentType.SPATIAL_CONTEXT:
        return {
          widgetType: 'MAP_CHIP',
          location: intent.payload?.primaryText,
        };

      default:
        return { widgetType: 'DEFAULT' };
    }
  }

  async interrupt() {
    return {
      status: 'INPUT_FOCUSED',
      stoppedAt: Date.now(),
    };
  }
}

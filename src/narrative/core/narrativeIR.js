/**
 * NeoNarrative 叙事中间表示规范与构建引擎 (Narrative IR Layer)
 * 介质无关 (Media-Agnostic) 的叙事核心数据结构与校验器
 */

import { PresentationIntentType, Speaker } from './types.js';

export class NarrativeIR {
  /**
   * 构造标准 Narrative 实体
   */
  constructor({ narrativeId, knowledgeDomainId, title, version = '1.0.0', arc, scenes = [] }) {
    if (!narrativeId || !title || !arc) {
      throw new Error('NarrativeIR requires narrativeId, title, and arc');
    }
    this.narrativeId = narrativeId;
    this.knowledgeDomainId = knowledgeDomainId;
    this.title = title;
    this.version = version;
    this.arc = arc;
    this.scenes = scenes;

    // 执行介质无关性与完整性严格审计
    this.validate();
  }

  /**
   * 严格验证 Narrative 的合法性与 Media-Agnostic 特性
   */
  validate() {
    const FORBIDDEN_MEDIA_KEYWORDS = [
      'mp3', 'wav', 'pcm', 'h264', 'mp4', 'fps', 'resolution',
      '1080p', 'bitrate', 'audio_track', 'video_codec', 'ffmpeg'
    ];

    for (const scene of this.scenes) {
      if (!scene.sceneId || !Array.isArray(scene.turns)) {
        throw new Error(`Invalid scene structure in scene: ${scene.sceneId || 'unnamed'}`);
      }

      for (const turn of scene.turns) {
        if (!turn.turnId || !turn.speaker || !turn.semanticUtterance) {
          throw new Error(`Invalid turn structure in scene ${scene.sceneId}, turn: ${turn.turnId}`);
        }

        // 校验 Presentation Intent 合法性
        if (turn.presentationIntents) {
          for (const pIntent of turn.presentationIntents) {
            if (!Object.values(PresentationIntentType).includes(pIntent.intentType)) {
              throw new Error(
                `Invalid PresentationIntentType '${pIntent.intentType}' in turn ${turn.turnId}`
              );
            }

            // 深度检查 payload 中是否包含媒体硬编码（介质无关性防线）
            const payloadStr = JSON.stringify(pIntent.payload || {}).toLowerCase();
            for (const kw of FORBIDDEN_MEDIA_KEYWORDS) {
              if (payloadStr.includes(`"${kw}"`) || payloadStr.includes(`:${kw}`)) {
                throw new Error(
                  `Media-Agnostic Violation: PresentationIntent in turn ${turn.turnId} contains media-specific keyword '${kw}'`
                );
              }
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * 获取所有被本 Narrative 引用的 Claim ID 集合
   */
  getAllReferencedClaimIds() {
    const claimIds = new Set();
    for (const scene of this.scenes) {
      for (const item of scene.claimSequence || []) {
        if (item.claimId) claimIds.add(item.claimId);
      }
      for (const turn of scene.turns) {
        if (turn.associatedClaimId) claimIds.add(turn.associatedClaimId);
      }
    }
    return Array.from(claimIds);
  }

  /**
   * 序列化为标准的 JSON 传输格式
   */
  toJSON() {
    return {
      narrativeId: this.narrativeId,
      knowledgeDomainId: this.knowledgeDomainId,
      title: this.title,
      version: this.version,
      arc: this.arc,
      scenes: this.scenes,
      referencedClaims: this.getAllReferencedClaimIds(),
    };
  }
}

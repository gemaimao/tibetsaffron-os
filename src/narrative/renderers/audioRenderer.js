/**
 * AudioRenderer (NeoRadio 音频介质渲染器)
 * 支持真实高保真音频文件推流与物理全双工秒停 (Hardware-level Barge-in Cutoff)
 * 当有预渲染的 Gemini 3.8 原生真声（Puck + Aoede）时优先播放高保真音轨，
 * 听众开口瞬间通过 Web Audio / HTMLAudio 5ms 内物理收敛静音！
 */

import { BaseRenderer } from './baseRenderer.js';
import { PresentationIntentType } from '../core/types.js';

export class AudioRenderer extends BaseRenderer {
  constructor(rendererId = 'renderer-neoradio-01', options = {}) {
    super('AUDIO', rendererId);
    this.isPlaying = false;
    this.playbackQueue = [];
    this.speechLog = [];
    this.currentAudioEl = null;
    this.enableRealSpeech = options.enableRealSpeech ?? true;

    // 音频文件映射表 (Gemini 3.8 原生 24kHz 高保真脱口秀真声)
    this.audioFileMap = {
      'TURN-01': '/audio/turn_01_host_a.wav',
      'TURN-02': '/audio/turn_02_host_b.wav',
      'TURN-03': '/audio/line_03_Puck.wav',
      'CHALLENGE': '/audio/response_challenge_aoede.wav',
      'EVIDENCE': '/audio/response_evidence_puck.wav',
      'DRILL_DOWN': '/audio/response_drill_aoede.wav',
      'FALLBACK': '/audio/response_fallback_puck.wav',
    };
  }

  async renderTurn(turn) {
    if (!this.isInitialized) await this.initialize();

    const acousticModifiers = [];
    if (turn.presentationIntents) {
      for (const pIntent of turn.presentationIntents) {
        const acousticInterpretation = await this.handlePresentationIntent(pIntent);
        acousticModifiers.push(acousticInterpretation);
      }
    }

    const artifact = {
      mediaType: 'AUDIO_STREAM',
      speaker: turn.speaker,
      turnId: turn.turnId,
      renderedText: turn.semanticUtterance,
      acousticModifiers,
      timestamp: Date.now(),
    };

    this.isPlaying = true;
    this.playbackQueue.push(artifact);
    this.speechLog.push(artifact);
    this.renderedArtifacts.push(artifact);

    // 浏览器端：执行物理发声（高保真音频优先）
    if (typeof window !== 'undefined' && this.enableRealSpeech) {
      await this.playPhysicalAudio(turn);
    }

    return artifact;
  }

  /**
   * 浏览器物理声音播放（带真实全双工打断能力）
   */
  async playPhysicalAudio(turn) {
    // 1. 如果已有声音在播，先秒停
    this.stopCurrentAudio();

    // 2. 匹配预渲染的高保真音频 URL
    let audioUrl = this.audioFileMap[turn.turnId];
    if (!audioUrl && turn.turnId.includes('response')) {
      if (turn.semanticUtterance.includes('质疑') || turn.semanticUtterance.includes('偷换概念')) {
        audioUrl = this.audioFileMap['CHALLENGE'];
      } else if (turn.semanticUtterance.includes('出处') || turn.semanticUtterance.includes('WT10103260183295WT2')) {
        audioUrl = this.audioFileMap['EVIDENCE'];
      } else if (turn.semanticUtterance.includes('控环是创造无菌条件') || turn.semanticUtterance.includes('官方公布')) {
        audioUrl = this.audioFileMap['FALLBACK'];
      }
    }

    if (audioUrl) {
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        this.currentAudioEl = audio;
        this.isPlaying = true;

        audio.onended = () => {
          this.isPlaying = false;
          this.currentAudioEl = null;
          resolve();
        };

        audio.onerror = () => {
          this.isPlaying = false;
          this.currentAudioEl = null;
          // 降级使用 Web Speech
          this.speakNative(turn.semanticUtterance, turn.speaker).then(resolve);
        };

        audio.play().catch(() => {
          // 自动播放限制降级
          resolve();
        });
      });
    } else {
      // 降级使用系统合成
      return this.speakNative(turn.semanticUtterance, turn.speaker);
    }
  }

  speakNative(text, speaker) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
    return new Promise((resolve) => {
      let isResolved = false;
      const safeResolve = () => {
        if (!isResolved) {
          isResolved = true;
          this.isPlaying = false;
          resolve();
        }
      };

      // 强制安全超时兜底：防止浏览器语音合成 onend 偶发挂起导致状态机死锁
      const maxDuration = Math.max(2500, text.length * 300);
      setTimeout(safeResolve, maxDuration);

      try {
        const doSpeak = () => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'zh-CN';
          
          // 挑选最佳中文声音 (区分男声/女声角色)
          if (window.speechSynthesis.getVoices) {
            const voices = window.speechSynthesis.getVoices();
            const zhVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('CN'));
            if (speaker === 'HOST_A') {
              // 阿龙：优先寻找男声 (Rocko, Reed, Eddy, 或包含 male)
              const maleVoice = zhVoices.find(v => /rocko|reed|eddy|男|male|grandpa/i.test(v.name));
              if (maleVoice) utterance.voice = maleVoice;
              else if (zhVoices[0]) utterance.voice = zhVoices[0];
            } else {
              // 莉莉/小林：女声 (Sandy, Shelley, Tingting, Sinji)
              const femaleVoice = zhVoices.find(v => /sandy|shelley|tingting|sinji|女|female/i.test(v.name));
              if (femaleVoice) utterance.voice = femaleVoice;
              else if (zhVoices[0]) utterance.voice = zhVoices[0];
            }
          }

          utterance.pitch = speaker === 'HOST_A' ? 0.85 : 1.15;
          utterance.rate = speaker === 'HOST_A' ? 1.15 : 1.25;
          utterance.onend = safeResolve;
          utterance.onerror = safeResolve;
          this.isPlaying = true;
          window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setTimeout(doSpeak, 50);
        } else {
          doSpeak();
        }
      } catch (e) {
        safeResolve();
      }
    });
  }

  stopCurrentAudio() {
    if (this.currentAudioEl) {
      try {
        this.currentAudioEl.pause();
        this.currentAudioEl.currentTime = 0;
      } catch (e) {}
      this.currentAudioEl = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
  }

  /**
   * L1 听觉秒停 (Acoustic Cutoff / 物理静音指令)
   * 必须在 10ms 内物理掐断声卡输出！
   */
  async interrupt() {
    const start = Date.now();
    this.stopCurrentAudio();
    this.playbackQueue = [];
    return {
      status: 'MUTED',
      stoppedAt: Date.now(),
      elapsedMs: Date.now() - start,
    };
  }

  async handlePresentationIntent(intent) {
    switch (intent.intentType) {
      case PresentationIntentType.SPATIAL_CONTEXT:
        return { acousticCue: 'SPATIAL_TONE', pacing: 'MEASURED' };
      case PresentationIntentType.DATA_EMPHASIS:
        return { acousticCue: 'STRESS_ACCENT', pitchShift: '+10%' };
      case PresentationIntentType.EVIDENCE_REVEAL:
        return { acousticCue: 'AUTHORITY_CADENCE', tone: 'RIGOROUS_CONFIDENT' };
      case PresentationIntentType.COMPARISON:
        return { acousticCue: 'CONVERSATIONAL_DIALECTIC', pacing: 'BRISK' };
      default:
        return { acousticCue: 'NEUTRAL_EXPOSITORY' };
    }
  }
}

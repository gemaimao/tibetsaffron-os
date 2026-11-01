// 极简高奢藏域全双工电台 · 微信小程序端 (物理级瞬间打断与真双工流)
const API_BASE = 'https://receptors-historical-affects-kissing.trycloudflare.com';
const masterPlaylist = require('../../playlist_master.js');

Page({
  data: {
    isPlaying: false,
    isRecording: false,
    isGenerating: false,
    recordSec: 0,
    countdownSec: 60,
    activeHost: 'idle', // 'A' | 'B' | 'C' | 'idle'
    showInfographic: false,
    currentIndex: 0,
    currentSlide: 0,
    currentChapter: 1,
    programName: '藏域林泉：藏红花电台',
    currentChapterTitle: masterPlaylist[0] ? masterPlaylist[0].chapter_title : '迷局与澄清：名字叫藏红花，西藏到底产不产？',
    onlineListeners: 148,
    showDanmaku: true,
    playbackRate: 1.0, // 播客倍速：1.0x, 1.25x, 1.5x, 2.0x
    totalPodcastSeconds: 299,
    totalDurationFormatted: '04:59',
    currentTotalSeconds: 0,
    currentProgressFormatted: '00:00',
    isSliderDragging: false,
    isTimelineFrozen: false,
    frozenTimestampFormatted: '',
    danmakuInputText: '',
    showBrandModal: false,
    isCreatorMode: true, // 🌟 主理人主权模式 (拥有知识库强化学习修正权)
    creatorKey: 'STARSPINE_SOVEREIGN_2026',
    sharedQAList: [
      { id: 101, user: '听众老李', question: '藏红花泡水为什么是金黄色？', visualIntent: 'WATER_TEST', audioQueue: [
        { host: 'C', audioUrl: '/assets/audio/master/turn_10_C.mp3', text: '【导播 莉莉】：这位听众问到了大家最容易误解的水试颜色！' },
        { host: 'B', audioUrl: '/assets/audio/master/turn_11_B.mp3', text: '【专家 林博士】：天然番红花苷是强极性水溶性色素，入水垂直沉丝，纯净金黄绝无血红！' }
      ]},
      { id: 102, user: '听众小敏', question: '林芝2945米高山温室有薄霜吗？', visualIntent: 'GREENHOUSE_IOT', audioQueue: [
        { host: 'A', audioUrl: '/assets/audio/master/turn_05_A.mp3', text: '【主持 扎西】：林芝在东经94.4°，早上六点天黑透了，现代温室有地暖根本无薄霜！' },
        { host: 'B', audioUrl: '/assets/audio/master/turn_06_B.mp3', text: '【专家 林博士】：采收抢的是花药未裂的黄金几小时，遮阳幕布自动调光，高科技控温。' }
      ]},
      { id: 103, user: '听众老王', question: '天旺藏红花在国家法定质检的实测指标如何？', visualIntent: 'WHITEBOARD_REPORT', audioQueue: [
        { host: 'C', audioUrl: '/assets/audio/master/turn_12_C.mp3', text: '【导播 莉莉】：导播台已为您切出国家权威检测报告 A26SW02809 白板！' },
        { host: 'B', audioUrl: '/assets/audio/master/turn_13_B.mp3', text: '【专家 林博士】：药典规定苷含量≥10.0%，天旺实测高达15.8%，苦素远超国标！' }
      ]}
    ],
    danmakuList: [
      { id: 1, text: '原来真红花泡水是金黄色的，确实长知识了', top: 6, speed: 8, active: true },
      { id: 2, text: '林芝2945米高山温室地暖恒温，科学种植靠谱', top: 30, speed: 10, active: true },
      { id: 3, text: '国家权威质检单苷含量15.8%，实测数据让人放心', top: 6, speed: 9, active: true },
      { id: 4, text: '天然番红花苷极性水溶分子垂直沉丝，这下看懂了', top: 30, speed: 8, active: true },
      { id: 5, text: '藏红花学名番红花，终于澄清了历史转运的误区', top: 6, speed: 10, active: true }
    ],
    noticeText: '雪域林泉 · AI 全双工互动演播室已就绪',
    showEpisodeDrawer: false,
    episodeList: [
      { chapter: 1, title: '迷局与澄清：名字叫藏红花，西藏到底产不产？', isReady: true, speaker: '莉莉 / 扎西 / 林博士', visualTag: '实景澄清', durationText: '04:59', firstIndex: 0 },
      { chapter: 2, title: '清晨采霜花的谎言：现代设施农业如何打破唯美文案滤镜？', isReady: false, speaker: '扎西 / 林博士', visualTag: '温室反直觉', durationText: '待建解锁', firstIndex: 3 },
      { chapter: 3, title: '水试防伪的分子真相：为什么泡出‘血红色’反而是假货？', isReady: false, speaker: '林博士 / 莉莉', visualTag: '极性水溶', durationText: '待建解锁', firstIndex: 9 },
      { chapter: 4, title: '药典实测 15.8%：一张盖着公章的国家质检单凭什么横扫行业？', isReady: false, speaker: '林博士 / 莉莉', visualTag: '国家检测', durationText: '待建解锁', firstIndex: 11 },
      { chapter: 5, title: '百朵鲜花萃一克：极端干燥与高海拔温室的黄金折算率', isReady: false, speaker: '扎西 / 莉莉', visualTag: '克重严选', durationText: '待建解锁', firstIndex: 0 },
      { chapter: 6, title: '传统泡水与舌下含服：番红花苷在人体消化道里的吸收率之争', isReady: false, speaker: '林博士 / 扎西', visualTag: '生物利用度', durationText: '待建解锁', firstIndex: 0 },
      { chapter: 7, title: '土壤密码与冰川融水：2945米高海拔对次生代谢产物的隐秘催化', isReady: false, speaker: '林博士 / 扎西', visualTag: '高山风土', durationText: '待建解锁', firstIndex: 0 },
      { chapter: 8, title: '从转运走廊到产地原乡：一个高原现代农业样本的产业雄心', isReady: false, speaker: '莉莉 / 扎西 / 林博士', visualTag: '产业标杆', durationText: '待建解锁', firstIndex: 0 }
    ]
  },

  // 权威长篇母版电台主线节目轨 (15轮深度智识场，5大篇章)
  dialogueList: masterPlaylist,

  innerAudioCtx: null,
  recorderManager: null,
  recordTimer: null,
  danmakuPollTimer: null,
  dynamicQueue: [], // 实时动态打断待播音频队列

  onLoad(options) {
    if (options && options.channel === 'demu') {
      wx.navigateTo({ url: '/pages/demu/demu' });
      return;
    }
    this.initAudio();
    this.initRecorder();
    this.fetchDanmaku();
    this.fetchSharedQAList();
    this.danmakuPollTimer = setInterval(() => {
      this.fetchDanmaku();
      this.fetchSharedQAList();
    }, 12000);
  },

  goToDemuStudio() {
    this.setData({ showEpisodeDrawer: false });
    if (this.innerAudioCtx && this.data.isPlaying) {
      this.innerAudioCtx.pause();
      this.setData({ isPlaying: false });
    }
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: '进入德木演播室…', icon: 'none', duration: 1000 });
    setTimeout(() => {
      wx.navigateTo({ url: '/packageDemu/pages/demu/demu' });
    }, 300);
  },

  onUnload() {
    if (this.innerAudioCtx) this.innerAudioCtx.destroy();
    if (this.recordTimer) clearInterval(this.recordTimer);
    if (this.danmakuPollTimer) clearInterval(this.danmakuPollTimer);
  },

  initAudio() {
    try {
      if (wx.setInnerAudioOption) {
        wx.setInnerAudioOption({
          obeyMuteSwitch: false,
          mixWithOtherAudio: false,
          speakerOn: true
        });
      }
    } catch (e) {}

    this.innerAudioCtx = wx.createInnerAudioContext();
    this.innerAudioCtx.obeyMuteSwitch = false;
    this.innerAudioCtx.volume = 1.0;

    this.innerAudioCtx.onPlay(() => {
      this.setData({ isPlaying: true });
    });

    this.innerAudioCtx.onTimeUpdate(() => {
      // 🌟【时间受控公理】：当处于连线打断、旁听答疑等动态状态时，主线时间轴严格冻结，绝不推进！
      if (this.data.isDynamicActive || this.data.isSliderDragging) {
        return;
      }

      const currentItem = this.dialogueList[this.data.currentIndex] || {};
      const currentTurnStart = currentItem.start || 0;
      const currentTurnPos = this.innerAudioCtx.currentTime || 0;
      const totalSec = Math.min(299, Math.floor(currentTurnStart + currentTurnPos));

      const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
      const s = Math.floor(totalSec % 60).toString().padStart(2, '0');

      this.setData({
        currentTotalSeconds: totalSec,
        currentProgressFormatted: `${m}:${s}`
      });
    });

    this.innerAudioCtx.onPause(() => {
      this.setData({ isPlaying: false });
    });

    this.innerAudioCtx.onStop(() => {
      this.setData({ isPlaying: false });
    });

    this.innerAudioCtx.onEnded(() => {
      console.log('当前音频片段播放完毕, 剩余动态队列:', this.dynamicQueue.length, 'isGenerating:', this.data.isGenerating, 'isWaiting:', this.isWaitingDynamicQueue);
      
      // 1. 检查是否有动态 AI 双工队列正在等待播放 (莉莉 -> 林博士 -> 扎西)
      if (this.dynamicQueue.length > 0) {
        const nextSegment = this.dynamicQueue.shift();
        this.playDynamicSegment(nextSegment);
        return;
      }

      // 2. 🌟 绝对屏障：如果大模型仍在生成中或正在等待队列，保持等待，绝不能切回主线！
      if (this.data.isGenerating || this.isWaitingDynamicQueue) {
        this.setData({
          isPlaying: false,
          activeHost: 'C',
          noticeText: '⚡ 导播 莉莉已接到提问，林博士正在查阅药典准备解答...'
        });
        return;
      }

      // 2.5 🌟【听众独立心流保护机制】：如果是在插话对线或旁听，且动态队列已全播完，才秒级回弹！
      if (this.playbackSnapshot) {
        const snap = this.playbackSnapshot;
        this.playbackSnapshot = null;
        this.setData({
          isDynamicActive: false,
          isTimelineFrozen: false,
          currentSlide: snap.currentSlide,
          currentIndex: snap.index,
          activeHost: 'idle',
          noticeText: `🎧 答疑解答完毕，时间轴已从 ${this.data.frozenTimestampFormatted || '原进度'} 恢复继续推流。`
        });
        this.playLine(snap.index, snap.currentTime);
        return;
      }

      // 3. 动态交互全部播放完毕，平滑流转回主线章节，形成良性循环
      if (this.data.isDynamicActive) {
        this.setData({
          isDynamicActive: false,
          isTimelineFrozen: false,
          activeHost: 'idle',
          noticeText: '互动答疑完毕，已顺畅回归主线电台章节。'
        });
      }

      // 4. 主线循环无限推流
      let nextIdx = this.data.currentIndex + 1;
      if (nextIdx >= this.dialogueList.length) {
        nextIdx = 0; // 形成生生不息的连续流转
      }
      this.setData({ currentIndex: nextIdx });
      this.playLine(nextIdx);
    });

    this.innerAudioCtx.onError((err) => {
      console.error('音频播放错误:', err);
      // 1. 如果动态队列中还有下一段，尝试推进到下一段
      if (this.dynamicQueue && this.dynamicQueue.length > 0) {
        const next = this.dynamicQueue.shift();
        this.playDynamicSegment(next);
        return;
      }

      // 2. 🌟 异常熔断自愈：若动态队列已耗尽或在等待中发生播放错误，绝不陷入永久假死！
      if (this.data.isDynamicActive || this.data.isGenerating || this.isWaitingDynamicQueue) {
        console.warn('动态打断中遇到音频错误且无后续切片，触发安全熔断恢复主线');
        this.isWaitingDynamicQueue = false;
        this.dynamicQueue = [];
        const snap = this.playbackSnapshot;
        this.playbackSnapshot = null;
        this.setData({
          isGenerating: false,
          isDynamicActive: false,
          isTimelineFrozen: false,
          activeHost: 'idle',
          noticeText: '🎧 网络音频加载遇阻，已自动为您平滑恢复电台主线。'
        });
        const resumeIdx = snap ? snap.index : this.data.currentIndex;
        const resumeTime = snap ? snap.currentTime : 0;
        this.playLine(resumeIdx, resumeTime);
        return;
      }

      // 3. 常规主线播放重试
      const currentItem = this.dialogueList[this.data.currentIndex];
      if (currentItem && currentItem.file) {
        const altSrc = currentItem.file.startsWith('/') ? currentItem.file : ('/' + currentItem.file);
        if (this.innerAudioCtx.src !== altSrc) {
          console.log('尝试替代本地包路径播放:', altSrc);
          this.innerAudioCtx.src = altSrc;
          this.innerAudioCtx.play();
          return;
        }
      }

      this.setData({ isPlaying: false });
      wx.showToast({ title: '播放稍有延迟，请再次点击播放', icon: 'none' });
    });
  },

  initRecorder() {
    this.recorderManager = wx.getRecorderManager();

    this.recorderManager.onStart(() => {
      this.isCancelledRecording = false;
      this.setData({
        isRecording: true,
        recordSec: 0,
        countdownSec: 60,
        noticeText: '🔴 正在录制提问 (上限60秒)... 轻触【完成提问】或点击播放/提问键随时提前提交！'
      });
      if (this.recordTimer) clearInterval(this.recordTimer);
      this.recordTimer = setInterval(() => {
        const nextSec = this.data.recordSec + 1;
        const countdown = Math.max(0, 60 - nextSec);
        this.setData({ 
          recordSec: nextSec,
          countdownSec: countdown
        });

        // 倒数 10 秒提示
        if (nextSec >= 50) {
          this.setData({
            noticeText: `⏳ 录音还剩 ${countdown} 秒，请尽快收尾...`
          });
        }

        // 达到 60 秒硬限制，自动截断提交
        if (nextSec >= 60) {
          if (this.recordTimer) clearInterval(this.recordTimer);
          if (this.recorderManager) {
            this.recorderManager.stop();
          }
        }
      }, 1000);
    });

    this.recorderManager.onStop((res) => {
      if (this.recordTimer) clearInterval(this.recordTimer);
      this.setData({ isRecording: false });

      // 🌟 用户主动取消提问分支：不触发大模型请求，平滑退出
      if (this.isCancelledRecording) {
        this.isCancelledRecording = false;
        console.log('用户已取消语音提问');
        return;
      }

      const { tempFilePath } = res;
      console.log('真机录音完成:', tempFilePath);

      // 读取为 Base64 发送到后端大模型
      if (tempFilePath) {
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success: (fileRes) => {
            this.sendBargeinRequest('听众开麦现场提问', fileRes.data);
          },
          fail: (readErr) => {
            console.warn('读取录音失败，使用文本提问提交:', readErr);
            this.sendBargeinRequest('请问林芝波密海拔2945米高山种植的藏红花，相比普通藏红花在药典活性上有何优势？', null);
          }
        });
      } else {
        this.sendBargeinRequest('请问林芝波密海拔2945米高山种植的藏红花，相比普通藏红花在药典活性上有何优势？', null);
      }
    });

    this.recorderManager.onError((err) => {
      console.error('录音器异常/权限未给:', err);
      if (this.recordTimer) clearInterval(this.recordTimer);
      this.setData({
        isRecording: false,
        noticeText: '麦克风不可用，已自动切换为演播室快捷提问通道'
      });

      this.promptDevtoolsQuestionModal();
    });
  },

  // 🌟【提前完成提问并立即提交】：无论是点弹窗上的金色大按钮、还是点底部的播放键/Ask键，均可立即完成提问！
  finishRecordingAndSubmit() {
    if (!this.data.isRecording) return;
    console.log('用户主动提前结束提问并提交');
    if (this.recordTimer) clearInterval(this.recordTimer);
    try {
      wx.vibrateShort({ type: 'medium' });
    } catch (e) {}
    wx.showToast({ title: '提问已完成，正在连线...', icon: 'none', duration: 1500 });
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
  },

  // 🌟【放弃/取消录音】：退出提问状态，平滑恢复正片播放
  cancelRecording() {
    if (!this.data.isRecording) return;
    console.log('用户主动放弃本次提问');
    this.isCancelledRecording = true;
    if (this.recordTimer) clearInterval(this.recordTimer);
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
    this.setData({
      isRecording: false,
      isTimelineFrozen: false,
      noticeText: '已取消提问，恢复电台收听。'
    });
    try {
      wx.vibrateShort({ type: 'light' });
    } catch (e) {}
    wx.showToast({ title: '已取消提问', icon: 'none', duration: 1200 });

    // 恢复主线进度
    if (this.playbackSnapshot) {
      const snap = this.playbackSnapshot;
      this.playbackSnapshot = null;
      this.playLine(snap.index, snap.currentTime);
    } else {
      this.playLine(this.data.currentIndex);
    }
  },

  // 播放单条主线电台音频
  playLine(idx, seekTime = 0) {
    const item = this.dialogueList[idx];
    if (!item) return;

    // 多模态快速分流：根据章节标记自动同步幻灯片
    let targetSlide = this.data.currentSlide;
    if (item.media_event === 'SHOW_TRADE_MAP') {
      targetSlide = 4;
    } else if (item.media_event === 'SHOW_WHITEBOARD_REPORT') {
      targetSlide = 1;
    } else if (item.media_event === 'SHOW_GREENHOUSE') {
      targetSlide = 2;
    } else if (item.media_event === 'SHOW_WATER_TEST') {
      targetSlide = 3;
    } else if (item.media_event === 'SHOW_COVER') {
      targetSlide = 0;
    }

    this.setData({
      activeHost: item.host,
      currentChapter: item.chapter || 1,
      currentChapterTitle: item.chapter_title || '',
      currentSlide: targetSlide,
      showInfographic: item.media_event && item.media_event !== 'NONE',
      noticeText: `【${item.speaker}】正在讲述：${item.desc}`
    });

    // 优先使用本地高保真音频流 (0延迟、不耗流量、外网朋友随时随地秒播)
    let audioSrc = item.file || item.url || '';
    if (audioSrc.startsWith('/')) {
      audioSrc = audioSrc.slice(1);
    }
    this.innerAudioCtx.src = audioSrc || item.file || item.url;
    this.innerAudioCtx.playbackRate = this.data.playbackRate || 1.0;
    this.innerAudioCtx.play();

    if (seekTime > 0) {
      setTimeout(() => {
        try {
          this.innerAudioCtx.seek(seekTime);
        } catch (e) {}
      }, 200);
    }
  },

  // 主键 1: 收听 / 暂停 (支持录音中一键完成提交，以及答疑中的精准控制)
  togglePlay() {
    // 🌟 1. 极致心流兜底：若在录音中点击播放键，立即响应用户意图：结束提问并提交！
    if (this.data.isRecording) {
      this.finishRecordingAndSubmit();
      return;
    }

    if (!this.innerAudioCtx) this.initAudio();

    // 🌟 2. 若在动态答疑中按播放键，精准控制答疑切片的暂停/恢复，绝不错误重置回主线！
    if (this.data.isDynamicActive) {
      if (this.data.isPlaying) {
        this.innerAudioCtx.pause();
        this.setData({
          isPlaying: false,
          noticeText: '⏸ 互动答疑已暂停，点击播放键继续收听。'
        });
      } else {
        this.innerAudioCtx.play();
        this.setData({
          isPlaying: true,
          noticeText: '▶ 继续收听互动答疑...'
        });
      }
      return;
    }

    // 🌟 3. 常规主线播放/暂停
    if (this.data.isPlaying) {
      this.innerAudioCtx.pause();
      this.setData({
        isPlaying: false,
        activeHost: 'idle',
        noticeText: '电台已暂停收听。'
      });
    } else {
      this.playLine(this.data.currentIndex);
    }
  },

  // 🌟【随时退出动态答疑，一键返回电台正片】：满足听众不想听完长答疑的心流控制
  exitDynamicQAAndResume() {
    console.log('听众提前结束答疑，返回正片');
    if (this.innerAudioCtx) {
      this.innerAudioCtx.stop();
    }
    this.dynamicQueue = [];
    this.isWaitingDynamicQueue = false;

    const snap = this.playbackSnapshot;
    this.playbackSnapshot = null;

    const resumeIdx = snap ? snap.index : this.data.currentIndex;
    const resumeTime = snap ? snap.currentTime : 0;
    const resumeSlide = snap ? snap.currentSlide : 0;

    this.setData({
      isGenerating: false,
      isDynamicActive: false,
      isTimelineFrozen: false,
      currentSlide: resumeSlide,
      currentIndex: resumeIdx,
      activeHost: 'idle',
      noticeText: `🎧 已结束答疑，电台已从 ${snap ? (this.data.frozenTimestampFormatted || '原进度') : '当前章节'} 顺畅恢复播放。`
    });

    try {
      wx.vibrateShort({ type: 'light' });
    } catch (e) {}
    wx.showToast({ title: '已返回正片', icon: 'none', duration: 1200 });

    this.playLine(resumeIdx, resumeTime);
  },

  // 🌟【关键攻坚：主键 2 物理级 0ms 瞬间打断 + 时间轴受控冻结 + 开麦/选问/自填】
  handleInterruptQuestion() {
    // 🌟 1. 如果正在录音中，再次点击 -> 立即结束录音并提交！
    if (this.data.isRecording) {
      this.finishRecordingAndSubmit();
      return;
    }

    // 🌟 2. 如果当前正在动态答疑中，点击 Ask 键呼出快捷选项（可直接退出答疑返回正片，或提出新问题）
    if (this.data.isDynamicActive) {
      wx.showActionSheet({
        itemList: ['▶ 退出答疑，返回电台正片', '🎙️ 重新提出新问题'],
        success: (sheetRes) => {
          if (sheetRes.tapIndex === 0) {
            this.exitDynamicQAAndResume();
          } else if (sheetRes.tapIndex === 1) {
            this.showStudioQuestionActionSheet();
          }
        }
      });
      return;
    }

    // 3. 【先抓取当前真实的播放进度快照与时长，务必在暂停前抓取！】
    const snapTime = this.innerAudioCtx ? (this.innerAudioCtx.currentTime || 0) : 0;
    const snapDuration = this.innerAudioCtx ? (this.innerAudioCtx.duration || 0) : 0;
    // 判断该段是否已经讲完，或剩余不足3秒（听众是听完一段才提问）
    const isTurnFinishedOrNearEnd = (snapDuration > 0 && snapTime >= snapDuration - 3) || snapTime === 0;

    // 4. 暂停当前音频（绝不使用 stop()，以防时间指针归零）
    if (this.innerAudioCtx) {
      this.innerAudioCtx.pause();
    }
    this.dynamicQueue = [];

    // 5. 🌟【心流公理】：如果听众是听完了扎西第一段话才提问，答疑完毕后自然顺畅推进到下一段！
    // 只有在说话中间突发打断时，才回溯到精确秒数续播。
    const resumeIndex = isTurnFinishedOrNearEnd
      ? (this.data.currentIndex + 1 < this.dialogueList.length ? this.data.currentIndex + 1 : 0)
      : this.data.currentIndex;
    const resumeTime = isTurnFinishedOrNearEnd ? 0 : snapTime;

    this.playbackSnapshot = {
      index: resumeIndex,
      currentTime: resumeTime,
      currentSlide: this.data.currentSlide,
      frozenSeconds: this.data.currentTotalSeconds
    };
    
    this.setData({
      isPlaying: false,
      activeHost: 'idle',
      isTimelineFrozen: true,
      frozenTimestampFormatted: this.data.currentProgressFormatted,
      noticeText: `⏸ 答疑已冻结在 ${this.data.currentProgressFormatted} · 请选择提问方式`
    });

    // 6. 无论模拟器还是原生真机，均弹出专业演播室提问菜单 (支持开麦录音、快捷提问、文字输入)
    this.showStudioQuestionActionSheet();
  },

  showStudioQuestionActionSheet() {
    wx.showActionSheet({
      itemList: [
        '🔴 现场开麦录音对线 (说出您的疑问)',
        '🎙️【快捷】林芝波密海拔2945米高山种植有何优势？',
        '🎙️【快捷】为什么说天旺基地约100朵花才能制1克特级干丝？',
        '🎙️【快捷】藏红花正品泡水为什么是金黄色而不是血红色？',
        '✍️ 键盘输入自定义提问'
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 开麦录音
          this.startRecordNow();
        } else if (res.tapIndex === 1) {
          this.sendBargeinRequest('林芝波密海拔2945米高山种植的藏红花，相比普通藏红花在药典活性上有何优势？', null);
        } else if (res.tapIndex === 2) {
          this.sendBargeinRequest('为什么说天旺基地精选约100朵鲜花才能制出1克特级干丝？', null);
        } else if (res.tapIndex === 3) {
          this.sendBargeinRequest('藏红花正品泡水为什么是金黄色而不是血红色？', null);
        } else if (res.tapIndex === 4) {
          wx.showModal({
            title: '向电台演播室提问',
            editable: true,
            placeholderText: '例如：林芝藏红花对睡眠调理有什么帮助？',
            success: (modalRes) => {
              if (modalRes.confirm && modalRes.content) {
                this.sendBargeinRequest(modalRes.content, null);
              } else {
                this.resumeFromFrozenSnapshot();
              }
            },
            fail: () => {
              this.resumeFromFrozenSnapshot();
            }
          });
        }
      },
      fail: () => {
        // 用户取消或点击空白处，解除冻结并恢复主线
        this.resumeFromFrozenSnapshot();
      }
    });
  },

  resumeFromFrozenSnapshot() {
    if (this.playbackSnapshot) {
      const snap = this.playbackSnapshot;
      this.playbackSnapshot = null;
      this.setData({
        isTimelineFrozen: false,
        isDynamicActive: false,
        currentIndex: snap.index,
        currentSlide: snap.currentSlide,
        activeHost: 'idle',
        noticeText: '已解除冻结，继续收听主线电台。'
      });
      this.playLine(snap.index, snap.currentTime);
    }
  },

  startRecordNow() {
    // 确保再次彻底静音（使用 pause 保留指针）
    if (this.innerAudioCtx) {
      this.innerAudioCtx.pause();
    }

    this.recorderManager.start({
      duration: 60000, // 设定 60 秒上限，精准收尾
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    });
  },

  // 核心：向本地主权 AI 算力池发送解耦实时请求 (三大边界推演 + 0秒即时垫话)
  sendBargeinRequest(questionText, audioBase64) {
    this.isWaitingDynamicQueue = true;
    this.setData({
      isGenerating: true,
      isDynamicActive: true,
      activeHost: 'C',
      noticeText: `⚡ 导播 莉莉已接到提问：“${questionText.slice(0, 16)}...” 正在接麦核实中...`
    });

    // 🌟【0.1秒秒级极速即时垫话破冰】使用本地打包高保真音频，0延迟、0流量、杜绝网络失败
    this.innerAudioCtx.src = 'assets/audio/filler_lily.mp3';
    this.innerAudioCtx.play();

    const currentTopic = this.dialogueList[this.data.currentIndex] || {};

    wx.request({
      url: `${API_BASE}/api/bargein`,
      method: 'POST',
      timeout: 45000,
      header: { 'content-type': 'application/json' },
      data: {
        userIntent: 'INTERRUPT',
        userInput: questionText,
        userAudioBase64: audioBase64,
        creatorKey: this.data.isCreatorMode ? this.data.creatorKey : null,
        context: {
          lastSpeaker: currentTopic.speaker || '扎西',
          lastSpokenText: currentTopic.desc || '西藏林芝海拔2945米高山藏红花品质'
        }
      },
      success: (res) => {
        this.isWaitingDynamicQueue = false;
        this.setData({ isGenerating: false });

        if (res.data && res.data.success) {
          const { lily, lin, bridge } = res.data;
          console.log('✅ 大模型动态多层递进生成成功:', res.data);

          // 组装多层递进演播室动态播放队列：
          // 莉莉核证与铺垫 -> 林博士药典深度解答 -> 扎西桥接回主线
          this.dynamicQueue = [];

          if (lily && lily.audioUrl) {
            this.dynamicQueue.push({ host: 'C', audioUrl: lily.audioUrl, text: `【导播 莉莉】：${lily.text}` });
          }
          if (lin && lin.audioUrl) {
            this.dynamicQueue.push({ host: 'B', audioUrl: lin.audioUrl, text: `【专家 林博士】：${lin.text}` });
          }
          if (bridge && bridge.audioUrl) {
            this.dynamicQueue.push({ host: 'A', audioUrl: bridge.audioUrl, text: `【主持 扎西】：${bridge.text}` });
          }

          // 🎬 多模态快速响应裁决：瞬间切至对应实证大屏幕
          let targetSlide = 1; // 默认质检白板
          if (res.data.visualIntent === 'TRADE_MAP') {
            targetSlide = 4; // 汉唐丝路与明清茶马古道历史贸易考证图谱
          } else if (res.data.visualIntent === 'GREENHOUSE_IOT') {
            targetSlide = 2;
          } else if (res.data.visualIntent === 'WATER_TEST') {
            targetSlide = 3;
          } else if (res.data.visualIntent === 'COVER_DEFAULT') {
            targetSlide = 0;
          }

          this.setData({
            isDynamicActive: true,
            showInfographic: true,
            currentSlide: targetSlide
          });

          // 🌟 无论当前处于何种状态，立即启动演播室第一棒（导播 莉莉真实核实）！
          if (this.dynamicQueue.length > 0) {
            if (this.innerAudioCtx) {
              this.innerAudioCtx.stop();
            }
            const next = this.dynamicQueue.shift();
            this.playDynamicSegment(next);
          }
        } else {
          this.fallbackDecoupledAnswer(questionText);
        }
      },
      fail: (err) => {
        console.warn('请求局域网失败，启动高保真离线应答:', err);
        this.isWaitingDynamicQueue = false;
        this.setData({ isGenerating: false });
        this.fallbackDecoupledAnswer(questionText);
      }
    });
  },

  // 多模态实证画卷：点击弹出【竖屏放大 / 🔄 横屏宽幅查验 / 🎬 高清微视】菜单
  previewCurrentAsset(e) {
    const current = e.currentTarget.dataset.src || '/assets/images/report_whiteboard.jpg';
    const allImages = [
      '/assets/images/cover.jpg',
      '/assets/images/report_whiteboard.jpg',
      '/assets/images/greenhouse_broll.jpg',
      '/assets/images/water_test.jpg',
      '/assets/images/trade_map.jpg'
    ];

    wx.showActionSheet({
      itemList: [
        '🔍 竖屏直接查验 (支持双指捏合缩放)',
        '🔄 横屏沉浸全屏查验 (旋转宽幅看报告)',
        '🎬 观看该实证的高清微视全景'
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.previewImage({ current: current, urls: allImages });
        } else if (res.tapIndex === 1) {
          this.setData({
            showLandscapeModal: true,
            landscapeImageSrc: current
          });
        } else if (res.tapIndex === 2) {
          wx.showToast({
            title: '🎬 正在接入米瑞乡温室高清航拍流...',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  closeLandscapeModal() {
    this.setData({ showLandscapeModal: false });
  },

  // 轮播图手动滑动事件监听
  onSlideChange(e) {
    this.setData({
      currentSlide: e.detail.current
    });
  },

  // 实时全网穿透弹幕拉取
  fetchDanmaku() {
    wx.request({
      url: `${API_BASE}/api/danmaku`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.success) {
          const { onlineListeners, danmakus } = res.data;
          const formatted = (danmakus || [])
            .filter(d => !d.isQA && !d.text.includes('问：') && !d.text.includes('旁听解答'))
            .slice(-6)
            .map((d, i) => ({
              id: d.id,
              user: d.user,
              text: d.text,
              top: (i % 2 === 0 ? 6 : 30),
              speed: 8 + (i * 1.5),
              active: true
            }));
          this.setData({
            onlineListeners: onlineListeners || 148,
            danmakuList: formatted
          });
        }
      },
      fail: () => {
        // 离线优雅降级
      }
    });
  },

  // 🌟【一键旁听共享精彩问答】：点击问答弹幕直接接入专家答复！
  listenToSharedQA(e) {
    const qaId = e.currentTarget.dataset.qaid;
    if (!qaId) return;

    wx.request({
      url: `${API_BASE}/api/shared-qa`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.qas) {
          const matched = res.data.qas.find(q => q.id === qaId) || res.data.qas[0];
          if (matched) {
            this.playSharedQACapsule(matched);
          }
        }
      }
    });
  },

  listenToSharedQAById(e) {
    this.listenToSharedQA(e);
  },

  // 播放共享问答胶囊
  playSharedQACapsule(qa) {
    // 🌟 1. 深度保存听众主线进度快照（避免旁听打乱个人心流）
    this.playbackSnapshot = {
      index: this.data.currentIndex,
      currentTime: (this.innerAudioCtx && this.innerAudioCtx.currentTime) ? this.innerAudioCtx.currentTime : 0,
      currentSlide: this.data.currentSlide,
      wasPlaying: this.data.isPlaying
    };

    if (this.innerAudioCtx) {
      this.innerAudioCtx.stop();
    }
    this.dynamicQueue = [...qa.audioQueue];

    // 多模态快速分流器：切换至对应证据
    let targetSlide = 1;
    if (qa.visualIntent === 'GREENHOUSE_IOT') targetSlide = 2;
    else if (qa.visualIntent === 'WATER_TEST') targetSlide = 3;
    else if (qa.visualIntent === 'COVER_DEFAULT') targetSlide = 0;

    this.setData({
      isDynamicActive: true,
      currentSlide: targetSlide,
      noticeText: `🎧 正在旁听【${qa.user}】关于“${qa.question}”的解答（播完自动回切您的进度）...`
    });

    if (this.dynamicQueue.length > 0) {
      const next = this.dynamicQueue.shift();
      this.playDynamicSegment(next);
    }
  },

  // ⏪ 快退 15 秒 (重点内容回溯重听)
  seekBackward() {
    if (!this.innerAudioCtx) return;
    const current = this.innerAudioCtx.currentTime || 0;
    if (current > 15) {
      this.innerAudioCtx.seek(current - 15);
      wx.showToast({ title: '⏪ 快退 15s', icon: 'none', duration: 1000 });
    } else {
      let prevIdx = this.data.currentIndex - 1;
      if (prevIdx < 0) prevIdx = this.dialogueList.length - 1;
      this.playLine(prevIdx);
      wx.showToast({ title: '⏪ 回溯上一环节', icon: 'none', duration: 1000 });
    }
  },

  // ⏩ 快进 15 秒
  seekForward() {
    if (!this.innerAudioCtx) return;
    const current = this.innerAudioCtx.currentTime || 0;
    const duration = this.innerAudioCtx.duration || 60;
    if (current + 15 < duration) {
      this.innerAudioCtx.seek(current + 15);
      wx.showToast({ title: '⏩ 快进 15s', icon: 'none', duration: 1000 });
    } else {
      let nextIdx = this.data.currentIndex + 1;
      if (nextIdx >= this.dialogueList.length) nextIdx = 0;
      this.playLine(nextIdx);
      wx.showToast({ title: '⏩ 跳至下一环节', icon: 'none', duration: 1000 });
    }
  },

  // ⚡ 倍速切换：1.0x -> 1.25x -> 1.5x -> 2.0x -> 1.0x
  togglePlaybackRate() {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const current = this.data.playbackRate || 1.0;
    let nextIdx = rates.indexOf(current) + 1;
    if (nextIdx >= rates.length) nextIdx = 0;
    const nextRate = rates[nextIdx];

    this.setData({ playbackRate: nextRate });
    if (this.innerAudioCtx) {
      this.innerAudioCtx.playbackRate = nextRate;
    }
    wx.showToast({ title: `⚡ 倍速: ${nextRate}x`, icon: 'none', duration: 1200 });
  },

  // ⏱️ 受控时间条拖动/点击跳转
  onTimelineSeek(e) {
    const targetSec = e.detail.value;
    let targetIdx = 0;
    let seekOffset = 0;

    for (let i = 0; i < this.dialogueList.length; i++) {
      const item = this.dialogueList[i];
      const endSec = item.start + item.duration;
      if (targetSec >= item.start && targetSec < endSec) {
        targetIdx = i;
        seekOffset = targetSec - item.start;
        break;
      }
    }

    const m = Math.floor(targetSec / 60).toString().padStart(2, '0');
    const s = Math.floor(targetSec % 60).toString().padStart(2, '0');

    this.setData({
      currentIndex: targetIdx,
      currentTotalSeconds: targetSec,
      currentProgressFormatted: `${m}:${s}`
    });

    this.playLine(targetIdx, seekOffset);
    wx.showToast({ title: `跳转至 ${m}:${s}`, icon: 'none', duration: 1000 });
  },

  onTimelineChange(e) {
    this.setData({ isSliderDragging: false });
    this.onTimelineSeek(e);
  },

  onTimelineChanging(e) {
    const targetSec = e.detail.value;
    const m = Math.floor(targetSec / 60).toString().padStart(2, '0');
    const s = Math.floor(targetSec % 60).toString().padStart(2, '0');
    this.setData({
      isSliderDragging: true,
      currentTotalSeconds: targetSec,
      currentProgressFormatted: `${m}:${s}`
    });
  },

  // 打开热点问答列表抽屉/弹窗
  openHotQAModal() {
    wx.request({
      url: `${API_BASE}/api/shared-qa`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.qas) {
          const qas = res.data.qas;
          const items = qas.map(q => `🎙️ [${q.user}] ${q.question.slice(0, 16)}... (${q.listenCount}人旁听)`);
          wx.showActionSheet({
            itemList: items,
            success: (sheetRes) => {
              const selected = qas[sheetRes.tapIndex];
              if (selected) {
                this.playSharedQACapsule(selected);
              }
            }
          });
        }
      }
    });
  },

  // 弹幕显示/隐藏切换
  toggleDanmaku() {
    this.setData({
      showDanmaku: !this.data.showDanmaku
    });
  },

  // 发送快捷弹幕（全网实时穿透）
  sendQuickDanmaku(e) {
    const text = e.currentTarget.dataset.text;
    const newDanmaku = {
      id: Date.now(),
      user: '我',
      text: text,
      top: (Math.random() > 0.5 ? 6 : 30),
      speed: 7,
      active: true
    };
    const list = [...this.data.danmakuList, newDanmaku];
    this.setData({ danmakuList: list, showDanmaku: true });
    wx.showToast({ title: '弹幕已全网穿透', icon: 'success', duration: 1500 });

    wx.request({
      url: `${API_BASE}/api/danmaku`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { user: '听众', text: text },
      success: () => {
        console.log('弹幕已同步至云端穿透池');
      }
    });
  },

  // 实时捕获弹幕输入
  onDanmakuInput(e) {
    this.setData({ danmakuInputText: e.detail.value });
  },

  // 发送自定义实时弹幕
  sendCustomDanmaku() {
    const text = (this.data.danmakuInputText || '').trim();
    if (!text) {
      wx.showToast({ title: '请输入弹幕内容', icon: 'none', duration: 1200 });
      return;
    }

    this.setData({ danmakuInputText: '' });

    const newDanmaku = {
      id: Date.now(),
      user: '我',
      text: text,
      top: (Math.random() > 0.5 ? 6 : 30),
      speed: 7,
      active: true
    };
    const list = [...this.data.danmakuList, newDanmaku];
    this.setData({ danmakuList: list, showDanmaku: true });
    wx.showToast({ title: '✨ 弹幕已飞入演播室', icon: 'none', duration: 1500 });

    wx.request({
      url: `${API_BASE}/api/danmaku`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { user: '现场听众', text: text },
      success: () => {
        console.log('自定义弹幕已穿透全网');
      }
    });
  },

  // 播放动态生成的切片
  playDynamicSegment(seg) {
    if (!seg) return;
    this.setData({
      isPlaying: true,
      activeHost: seg.host,
      noticeText: seg.text
    });
    let rawUrl = (seg.audioUrl || '').trim();
    let finalUrl = rawUrl;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      finalUrl = rawUrl;
    } else if (rawUrl.startsWith('assets/') || rawUrl.startsWith('/assets/')) {
      finalUrl = rawUrl.replace(/^\/+/, '');
    } else if (rawUrl) {
      // 动态生成的切片（如 /audio/dynamic/...），必须拼接后端服务公网基地址
      const cleanPath = rawUrl.replace(/^\/+/, '');
      finalUrl = `${API_BASE}/${cleanPath}`;
    }
    console.log('🎵 [播放切片]', seg.host, finalUrl);
    this.innerAudioCtx.src = finalUrl;
    this.innerAudioCtx.play();
  },

  // 权威知识库动态保底响应
  fallbackDecoupledAnswer(q) {
    this.setData({
      isGenerating: false,
      isDynamicActive: true,
      activeHost: 'C',
      noticeText: '⚡ 导播 莉莉已接入听众提问！请林博士依据《中国药典》做实证解答...'
    });

    this.dynamicQueue = [
      {
        host: 'C',
        audioUrl: 'assets/audio/filler_lily.mp3',
        text: '【导播 莉莉】：这位听众朋友问到点子上了！林博士，请您依据药典权威解答！'
      },
      {
        host: 'B',
        audioUrl: 'assets/audio/master/turn_11_B.mp3',
        text: '【专家 林博士】：依据《中国药典》与天旺基地实测（报告A26SW02809），正品番红花苷入水缓慢释出纯金黄云雾，绝无血红！'
      },
      {
        host: 'A',
        audioUrl: 'assets/audio/master/turn_02_A.mp3',
        text: '【主持 扎西】：千百年茶马古道沉淀，如今在雪域高原米瑞乡扎下现代科学根基，咱们接着细听。'
      }
    ];

    if (!this.data.isPlaying && this.dynamicQueue.length > 0) {
      const next = this.dynamicQueue.shift();
      this.playDynamicSegment(next);
    }
  },

  // 辅助键: 导出完整音频
  exportPodcast() {
    wx.showActionSheet({
      itemList: ['试听导出音频文件', '复制完整音频下载地址', '保存到本地'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.innerAudioCtx.src = 'assets/audio/master/turn_01_C.mp3';
          this.innerAudioCtx.play();
          this.setData({
            isPlaying: true,
            activeHost: 'C',
            noticeText: '正在试听大师级互动正片第一回合...'
          });
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({
            data: `${API_BASE}/audio/master/turn_01_C.mp3`,
            success: () => {
              wx.showToast({ title: '音频链接已复制', icon: 'success' });
            }
          });
        } else {
          wx.showToast({ title: '已加入离线缓存', icon: 'success' });
        }
      }
    });
  },

  // 👑 品牌高奢认证栏交互
  showBrandCertificate() {
    this.setData({ showBrandModal: true });
  },

  closeBrandCertificate() {
    this.setData({ showBrandModal: false });
  },

  // 📜 智识剧场节目单 · 选集抽屉交互
  openEpisodeDrawer() {
    this.setData({ showEpisodeDrawer: true });
  },

  closeEpisodeDrawer() {
    this.setData({ showEpisodeDrawer: false });
  },

  selectEpisode(e) {
    const chapter = e.currentTarget.dataset.chapter;
    const targetItem = this.data.episodeList.find(item => item.chapter === chapter);
    if (!targetItem) return;

    if (targetItem.isReady) {
      this.setData({
        currentChapter: chapter,
        currentChapterTitle: targetItem.title,
        showEpisodeDrawer: false
      });
      this.playLine(targetItem.firstIndex || 0, 0);
      wx.showToast({
        title: `正在收听 EP.0${chapter}`,
        icon: 'none',
        duration: 1500
      });
    } else {
      this.setData({
        showEpisodeDrawer: false
      });
      wx.showModal({
        title: `🎙️ EP.0${chapter} 策划建构中`,
        content: `【${targetItem.title}】\n\n星脊工作室正在基于多模态实证知识库进行专属声画与物证建构，即将上线解锁！`,
        showCancel: false,
        confirmText: '期待解锁',
        confirmColor: '#dfb26a'
      });
    }
  },

  likeCurrentComment() {
    wx.showToast({
      title: '👍 已认同点赞',
      icon: 'none',
      duration: 1200
    });
  },

  // 👑 切换主理人知识共创模式
  toggleCreatorMode() {
    const nextState = !this.data.isCreatorMode;
    this.setData({ isCreatorMode: nextState });
    wx.showToast({
      title: nextState ? '👑 主理人·强化学习模式已开启' : '🎧 已切回普通听众收听模式',
      icon: 'none',
      duration: 2500
    });
  },

  preventProp() {
    // 阻止模态框内部点击穿透冒泡关闭
  }
});

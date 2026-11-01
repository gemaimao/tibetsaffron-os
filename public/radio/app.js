// 雪域林泉 · 藏红花电台 Telegram Mini App & Web 核心逻辑

// Telegram WebApp 初始化
const tg = window.Telegram?.WebApp;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor('#0f1113');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#0c0d0e');
  } catch (e) {
    console.log('TG WebApp init:', e);
  }
}

function triggerHaptic(type = 'medium') {
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.impactOccurred(type);
    } catch (e) {}
  }
}

// 完整的 15 轮 Master 对白资产与视觉事件映射
const dialogueList = [
  { id: 'turn_01', host: 'C', speaker: '莉莉', role: '主播', file: 'assets/audio/master/turn_01_C.mp3', event: 'SHOW_COVER', desc: '开场导读：名字叫藏红花，西藏到底产不产？' },
  { id: 'turn_02', host: 'A', speaker: '扎西', role: '文化学者', file: 'assets/audio/master/turn_02_A.mp3', event: 'NONE', desc: '扎西考证：丝绸之路与茶马古道转运历史' },
  { id: 'turn_03', host: 'B', speaker: '林博士', role: '农业专家', file: 'assets/audio/master/turn_03_B.mp3', event: 'NONE', desc: '林博士揭秘：米瑞乡高原环境控制智能温室' },
  { id: 'turn_04', host: 'C', speaker: '莉莉', role: '主播', file: 'assets/audio/master/turn_04_C.mp3', event: 'NONE', desc: '辟谣发问：为什么采收不是清晨采霜花？' },
  { id: 'turn_05', host: 'A', speaker: '扎西', role: '文化学者', file: 'assets/audio/master/turn_05_A.mp3', event: 'SHOW_GREENHOUSE', desc: '扎西解惑：经度时差与温室自动化地暖保温' },
  { id: 'turn_06', host: 'B', speaker: '林博士', role: '农业专家', file: 'assets/audio/master/turn_06_B.mp3', event: 'SHOW_GREENHOUSE', desc: '植物生理学：花蕾初绽与柱头饱满的峰值采收' },
  { id: 'turn_07', host: 'C', speaker: '莉莉', role: '主播', file: 'assets/audio/master/turn_07_C.mp3', event: 'NONE', desc: '两段式种植：借地长球，归藏定质' },
  { id: 'turn_08', host: 'B', speaker: '林博士', role: '农业专家', file: 'assets/audio/master/turn_08_B.mp3', event: 'NONE', desc: '产业科技机密：强紫外线与昼夜温差逆境刺激' },
  { id: 'turn_09', host: 'A', speaker: '扎西', role: '文化学者', file: 'assets/audio/master/turn_09_A.mp3', event: 'NONE', desc: '雪域魂魄：借地长其形，归藏定其魂' },
  { id: 'turn_10', host: 'C', speaker: '莉莉', role: '主播', file: 'assets/audio/master/turn_10_C.mp3', event: 'SHOW_WATER_TEST', desc: '真伪鉴别发问：红花泡水为何呈现金黄？' },
  { id: 'turn_11', host: 'B', speaker: '林博士', role: '农业专家', file: 'assets/audio/master/turn_11_B.mp3', event: 'SHOW_WATER_TEST', desc: '《中国药典》金标准：番红花苷极性水溶性色素下沉' },
  { id: 'turn_12', host: 'C', speaker: '莉莉', role: '主播', file: 'assets/audio/master/turn_12_C.mp3', event: 'SHOW_WHITEBOARD_REPORT', desc: '质检实证：法定机构权威检测表现' },
  { id: 'turn_13', host: 'B', speaker: '林博士', role: '农业专家', file: 'assets/audio/master/turn_13_B.mp3', event: 'SHOW_WHITEBOARD_REPORT', desc: '报告A26SW02809：总吸光度15.8%远超国标' },
  { id: 'turn_14', host: 'A', speaker: '扎西', role: '文化学者', file: 'assets/audio/master/turn_14_A.mp3', event: 'NONE', desc: '三根金丝生活真知：自然喇叭口与微苦回甘' },
  { id: 'turn_15', host: 'C', speaker: '莉莉', role: '主播', file: 'assets/audio/master/turn_15_C.mp3', event: 'SHOW_COVER', desc: '全双工互动敞开：按住开麦现场连线解答' }
];

const mediaAssetMap = {
  'SHOW_COVER': {
    img: 'assets/images/cover.jpg',
    tag: '🏔️ 天旺农牧高原现代设施农业示范基地',
    text: '西藏林芝米瑞乡海拔2945米智能温室现场。'
  },
  'SHOW_GREENHOUSE': {
    img: 'assets/images/greenhouse_broll.png',
    tag: '🏛️ 2945米现代智能连栋温室',
    text: '自动化地暖、保温与遮阳幕布系统，确保花蕾在峰值受控采收。'
  },
  'SHOW_WATER_TEST': {
    img: 'assets/images/water_test.jpg',
    tag: '🔬 核心药典实验证据（水试金黄）',
    text: '正品柱头入水缓慢下沉拉丝，水体通透金黄；凡鲜红浑浊者多为染色假货。'
  },
  'SHOW_WHITEBOARD_REPORT': {
    img: 'assets/images/report_whiteboard.png',
    tag: '📋 国家法定检验检测报告（A26SW02809）',
    text: '番红花苷总吸光度实测达15.8%（国标门槛为10.0%），苦素指标远超国标。'
  }
};

let currentIndex = 0;
let isPlaying = false;
let isInteracting = false;
let isBargeInActive = false;

const audio = document.getElementById('audioPlayer');
const btnPlay = document.getElementById('btnPlay');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');

const btnInteractive = document.getElementById('btnInteractive');
const interIcon = document.getElementById('interIcon');
const interText = document.getElementById('interText');

const btnExport = document.getElementById('btnExport');
const noticeMsg = document.getElementById('noticeMsg');
const infographicCard = document.getElementById('infographicCard');
const infoImg = infographicCard.querySelector('.info-img');
const infoTag = infographicCard.querySelector('.info-tag');
const infoText = infographicCard.querySelector('.info-text');

const hostA = document.getElementById('hostA');
const hostB = document.getElementById('hostB');
const hostC = document.getElementById('hostC');

function setHostState(host, stateText) {
  // 清除全部激活状态
  [hostA, hostB, hostC].forEach(el => {
    el.classList.remove('active', 'host-a-glow', 'host-b-glow', 'host-c-glow');
    el.querySelector('.state-text').textContent = '待命倾听';
  });

  if (host === 'A') {
    hostA.classList.add('active', 'host-a-glow');
    hostA.querySelector('.state-text').textContent = stateText || '正在发言';
  } else if (host === 'B') {
    hostB.classList.add('active', 'host-b-glow');
    hostB.querySelector('.state-text').textContent = stateText || '深度剖析';
  } else if (host === 'C') {
    hostC.classList.add('active', 'host-c-glow');
    hostC.querySelector('.state-text').textContent = stateText || '导播调度';
  }
}

function updateVisualEvent(event) {
  if (event && mediaAssetMap[event]) {
    const asset = mediaAssetMap[event];
    infoImg.src = asset.img;
    infoTag.textContent = asset.tag;
    infoText.textContent = asset.text;
    infographicCard.style.display = 'block';
  } else {
    infographicCard.style.display = 'none';
  }
}

function playLine(idx) {
  const item = dialogueList[idx];
  if (!item) return;

  const roleText = item.host === 'A' ? '正在发言' : (item.host === 'B' ? '科学论证' : '导播切线');
  setHostState(item.host, roleText);
  updateVisualEvent(item.event);

  noticeMsg.textContent = `[${idx + 1}/15] 【${item.speaker} · ${item.role}】${item.desc}`;

  audio.src = item.file;
  audio.play().catch(err => {
    console.log('Autoplay restriction:', err);
    noticeMsg.textContent = '请点击【开始播放】继续连线。';
  });
}

// 主键 1: 播放 / 暂停
btnPlay.addEventListener('click', () => {
  triggerHaptic('medium');
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playIcon.textContent = '▶';
    playText.textContent = '开始播放';
    setHostState('idle');
    noticeMsg.textContent = '播客已暂停。';
  } else {
    isPlaying = true;
    playIcon.textContent = '⏸';
    playText.textContent = '暂停播客';
    if (currentIndex >= dialogueList.length) currentIndex = 0;
    playLine(currentIndex);
  }
});

// 音频自然结束推进
audio.addEventListener('ended', () => {
  if (isBargeInActive) {
    isBargeInActive = false;
    playLine(currentIndex);
    return;
  }

  currentIndex++;
  if (currentIndex < dialogueList.length) {
    playLine(currentIndex);
  } else {
    isPlaying = false;
    playIcon.textContent = '▶';
    playText.textContent = '重温播客';
    setHostState('idle');
    noticeMsg.textContent = '🎉 第一期播客圆满播毕！随时提问连线或导出完整音频。';
    triggerHaptic('heavy');
  }
});

// 主键 2: 观众互动提问 (全双工即时插话连线)
btnInteractive.addEventListener('click', () => {
  triggerHaptic('heavy');
  if (!isInteracting) {
    isInteracting = true;
    btnInteractive.className = 'btn btn-danger';
    interIcon.textContent = '⏹';
    interText.textContent = '停止提问插话';
    noticeMsg.textContent = '🎙️ 麦克风已就绪，正在聆听您的提问... 再次点击将切入全双工解答！';
  } else {
    isInteracting = false;
    isBargeInActive = true;
    btnInteractive.className = 'btn btn-interactive';
    interIcon.textContent = '🎙️';
    interText.textContent = '观众互动提问';

    audio.pause();
    setHostState('C', '听众互动连线');
    updateVisualEvent('SHOW_WATER_TEST');
    noticeMsg.textContent = '⚡ 全双工插话连线成功！导播莉莉已将提问切入现场！';

    // 播放莉莉插话
    audio.src = 'assets/audio/bargein_lily.mp3';
    audio.play();

    const onBargeLilyEnd = () => {
      audio.removeEventListener('ended', onBargeLilyEnd);
      setHostState('B', '中国药典权威解答');
      updateVisualEvent('SHOW_WHITEBOARD_REPORT');
      noticeMsg.textContent = '🔬 科学家 B 林博士正在针对您的提问做《中国药典》权威解答！';
      audio.src = 'assets/audio/bargein_lin.mp3';
      audio.play();
    };
    audio.addEventListener('ended', onBargeLilyEnd);
  }
});

// 辅助键: 导出完整音频
btnExport.addEventListener('click', () => {
  triggerHaptic('light');
  const fullAudioUrl = 'assets/audio/full_podcast.mp3';
  const a = document.createElement('a');
  a.href = fullAudioUrl;
  a.download = '雪域林泉藏红花电台_第01期_完整全双工音频.mp3';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  noticeMsg.textContent = '📥 完整播客音频已触发下载！';
});

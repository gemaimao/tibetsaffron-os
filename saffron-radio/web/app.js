// 雪域林泉 · 藏红花电台 Web端全双工核心逻辑

const dialogueList = [
  { id: 'line_01', host: 'C', file: 'assets/audio/line_01.mp3', info: false },
  { id: 'line_02', host: 'A', file: 'assets/audio/line_02.mp3', info: false },
  { id: 'line_03', host: 'B', file: 'assets/audio/line_03.mp3', info: false },
  { id: 'line_04', host: 'C', file: 'assets/audio/line_04.mp3', info: true },
  { id: 'line_05', host: 'B', file: 'assets/audio/line_05.mp3', info: true }
];

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
    hostC.querySelector('.state-text').textContent = stateText || '导播切线';
  }
}

function playLine(idx) {
  const item = dialogueList[idx];
  if (!item) return;

  setHostState(item.host, item.host === 'A' ? '正在发言' : (item.host === 'B' ? '深度剖析' : '导播切线'));
  infographicCard.style.display = item.info ? 'block' : 'none';
  noticeMsg.textContent = `【主持人 ${item.host}】正在发言中...`;

  audio.src = item.file;
  audio.play().catch(err => console.log('Autoplay policy caught:', err));
}

// 主键 1: 播放 / 暂停
btnPlay.addEventListener('click', () => {
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
    // 插话结束，恢复正常播放
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
    playText.textContent = '开始播放';
    setHostState('idle');
    noticeMsg.textContent = '本期播客播放完毕，您可以点击【导出完整音频】保存收听。';
  }
});

// 主键 2: 观众互动提问 (全双工即时插话)
btnInteractive.addEventListener('click', () => {
  if (!isInteracting) {
    isInteracting = true;
    btnInteractive.className = 'btn btn-danger';
    interIcon.textContent = '⏹';
    interText.textContent = '结束提问插话';
    noticeMsg.textContent = '🎙️ 麦克风已就绪，正在聆听您的提问... 再次点击将打断全场实时连线！';
  } else {
    // 提交插话提问 -> 立即打断主线
    isInteracting = false;
    isBargeInActive = true;
    btnInteractive.className = 'btn btn-interactive';
    interIcon.textContent = '🎙️';
    interText.textContent = '观众互动提问';

    audio.pause();
    setHostState('C', '听众互动连线');
    infographicCard.style.display = 'block';
    noticeMsg.textContent = '⚡ 全双工插话连线成功！调度 C 莉莉已切入听众现场提问！';

    // 播放莉莉插话
    audio.src = 'assets/audio/bargein_lily.mp3';
    audio.play();

    const onBargeLilyEnd = () => {
      audio.removeEventListener('ended', onBargeLilyEnd);
      setHostState('B', '中国药典权威解答');
      noticeMsg.textContent = '🔬 科学家 B 林博士正在针对您的提问做《中国药典》权威解答！';
      audio.src = 'assets/audio/bargein_lin.mp3';
      audio.play();
    };
    audio.addEventListener('ended', onBargeLilyEnd);
  }
});

// 辅助键: 导出完整音频
btnExport.addEventListener('click', () => {
  const fullAudioUrl = 'assets/audio/full_podcast.mp3';
  const a = document.createElement('a');
  a.href = fullAudioUrl;
  a.download = '雪域林泉藏红花电台_第01期_完整全双工音频.mp3';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  noticeMsg.textContent = '📥 完整播客音频已成功触发导出下载！';
});

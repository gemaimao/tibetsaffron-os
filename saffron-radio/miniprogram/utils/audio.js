/**
 * 播放服务（全局单例）
 *
 * 两条音频通道：
 *   1) cloud  —— 真实音频（episode.audioUrl 非空）：wx.getBackgroundAudioManager()
 *                 支持锁屏 / 切后台 / 切换 tab 持续播放。
 *   2) preview —— 本地合成试听（audioUrl 为空）：wx.createInnerAudioContext()
 *                 播放 assets/preview.m4a，界面必须标注「合成试听，非完整节目」。
 *
 * 时间轴一律来自音频事件（onTimeUpdate / onCanplay / onEnded），
 * 不使用 setInterval 伪造播放进度。
 */
var config = require('../config.js')
var store = require('./store.js')
var episodes = require('../data/episodes.js')

var state = {
  episodeId: '',
  title: '',
  cover: '',
  mode: 'idle', // idle | cloud | preview
  playing: false,
  loading: false,
  currentTime: 0,
  duration: 0,
  rate: 1,
  rateSupported: true,
  error: ''
}

var listeners = []
var endedListeners = []

var bgm = null
var bgmBound = false
var inner = null
var innerBound = false
var pendingSeek = 0
var lastSaveAt = 0
var started = false

/* ------------------------------ 事件订阅 ------------------------------ */

function subscribe(fn) {
  if (typeof fn !== 'function') return function () {}
  listeners.push(fn)
  return function () {
    var i = listeners.indexOf(fn)
    if (i >= 0) listeners.splice(i, 1)
  }
}

function onEnded(fn) {
  if (typeof fn !== 'function') return function () {}
  endedListeners.push(fn)
  return function () {
    var i = endedListeners.indexOf(fn)
    if (i >= 0) endedListeners.splice(i, 1)
  }
}

function snapshot() {
  var s = {}
  for (var k in state) {
    if (Object.prototype.hasOwnProperty.call(state, k)) s[k] = state[k]
  }
  return s
}

function emit() {
  var s = snapshot()
  listeners.slice().forEach(function (fn) {
    try { fn(s) } catch (e) { /* 单个订阅者异常不影响其他订阅者 */ }
  })
}

function emitEnded() {
  var s = snapshot()
  endedListeners.slice().forEach(function (fn) {
    try { fn(s) } catch (e) {}
  })
}

function set(patch) {
  var changed = false
  for (var k in patch) {
    if (Object.prototype.hasOwnProperty.call(patch, k)) {
      if (state[k] !== patch[k]) {
        state[k] = patch[k]
        changed = true
      }
    }
  }
  if (changed) emit()
}

function getState() {
  return snapshot()
}

function getEpisode() {
  return state.episodeId ? episodes.byId(state.episodeId) : null
}

function getPosition() {
  return state.currentTime || 0
}

/* ------------------------------ 进度持久化 ------------------------------ */

function saveProgress(force) {
  if (!state.episodeId) return
  if (!state.duration && !state.currentTime) return
  var now = Date.now()
  if (!force && now - lastSaveAt < 5000) return
  lastSaveAt = now
  store.setProgress(state.episodeId, state.currentTime, state.duration)
}

/* ------------------------------ 背景音频 ------------------------------ */

function rateSupportedOnBgm() {
  var b = bgm
  if (!b) return false
  try {
    return typeof b.playbackRate !== 'undefined'
  } catch (e) {
    return false
  }
}

function ensureBgm() {
  if (bgmBound) return bgm
  if (!wx.getBackgroundAudioManager) return null
  try {
    bgm = wx.getBackgroundAudioManager()
  } catch (e) {
    return null
  }
  bgmBound = true

  bgm.onPlay(function () { set({ playing: true, loading: false }) })
  bgm.onPause(function () {
    set({ playing: false })
    saveProgress(true)
  })
  bgm.onStop(function () {
    set({ playing: false })
    saveProgress(true)
  })
  bgm.onEnded(function () {
    set({ playing: false, currentTime: state.duration })
    saveProgress(true)
    emitEnded()
  })
  bgm.onTimeUpdate(function () {
    if (state.mode !== 'cloud') return
    set({
      currentTime: bgm.currentTime || 0,
      duration: bgm.duration || state.duration
    })
    saveProgress(false)
  })
  bgm.onCanplay(function () { set({ loading: false }) })
  bgm.onWaiting(function () { set({ loading: true }) })
  bgm.onError(function (e) {
    var msg = (e && (e.errMsg || e.errCode)) || '音频播放失败'
    set({ playing: false, loading: false, error: String(msg) })
  })
  return bgm
}

/* ------------------------------ 本地试听 ------------------------------ */

function ensureInner() {
  if (innerBound) return inner
  inner = wx.createInnerAudioContext()
  innerBound = true
  inner.autoplay = false

  inner.onPlay(function () { set({ playing: true, loading: false }) })
  inner.onPause(function () {
    set({ playing: false })
    saveProgress(true)
  })
  inner.onStop(function () {
    set({ playing: false })
    saveProgress(true)
  })
  inner.onEnded(function () {
    set({ playing: false, currentTime: state.duration })
    saveProgress(true)
    emitEnded()
  })
  inner.onTimeUpdate(function () {
    if (state.mode !== 'preview') return
    set({
      currentTime: inner.currentTime || 0,
      duration: inner.duration || state.duration
    })
    saveProgress(false)
  })
  inner.onCanplay(function () {
    set({ loading: false, duration: inner.duration || state.duration })
    if (pendingSeek > 0 && Math.abs((inner.currentTime || 0) - pendingSeek) > 2) {
      try { inner.seek(pendingSeek) } catch (e) {}
    }
    if (state.rate !== 1) {
      try { inner.playbackRate = state.rate } catch (e) {}
    }
    pendingSeek = 0
  })
  inner.onWaiting(function () { set({ loading: true }) })
  inner.onError(function (e) {
    var msg = (e && (e.errMsg || e.errCode)) || '试听音频加载失败'
    set({ playing: false, loading: false, error: String(msg) })
  })
  return inner
}

/* ------------------------------ 对外操作 ------------------------------ */

function stopChannels() {
  if (bgmBound && bgm && bgm.__episodeId) {
    try { bgm.stop() } catch (e) {}
  }
  if (innerBound && inner && inner.__episodeId) {
    try { inner.stop() } catch (e) {}
  }
  set({ playing: false, loading: false })
}

/** 载入某一期（不自动播放） */
function load(episode, opts) {
  opts = opts || {}
  if (!episode) return
  var url = (episode.audioUrl || '').trim()
  var nextMode = url ? 'cloud' : 'preview'
  var same = state.episodeId === episode.id && state.mode === nextMode

  if (same && !opts.force) {
    if (opts.autoplay) play()
    return
  }

  stopChannels()

  var saved = opts.position
  if (saved === undefined || saved === null) {
    var p = store.getProgress(episode.id)
    saved = p ? p.position : 0
  }
  pendingSeek = Number(saved) > 3 ? Number(saved) : 0

  state.episodeId = episode.id
  state.title = episode.title
  state.cover = episode.cover
  state.mode = nextMode
  state.currentTime = pendingSeek
  state.duration = 0
  state.error = ''
  state.loading = false
  state.rate = 1
  state.rateSupported = nextMode === 'preview' ? true : rateSupportedOnBgm()

  // markLast 为 false 时（例如启动恢复）不把该期标记为「用户主动选集」，
  // 以免覆盖云端同步回来的 lastEpisode。
  if (opts.markLast !== false) store.setLastEpisode(episode.id)
  emit()

  if (opts.autoplay) play()
}

function play() {
  if (!state.episodeId) return
  var ep = getEpisode()
  if (!ep) return

  if (state.mode === 'cloud') {
    var b = ensureBgm()
    if (!b) {
      set({ error: '当前环境不支持背景音频' })
      return
    }
    if (b.__episodeId !== ep.id) {
      // 背景音频必须设置 title 后才能播放；coverImgUrl 仅支持网络地址
      b.title = ep.title
      b.epname = config.brand.name + ' · ' + config.brand.sub
      b.singer = ep.host || config.brand.name
      b.__episodeId = ep.id
      b.src = ep.audioUrl
      state.rateSupported = rateSupportedOnBgm()
    }
    try {
      b.play()
      set({ playing: true })
    } catch (e) {
      set({ error: '音频播放失败' })
    }
    return
  }

  var i = ensureInner()
  if (i.__episodeId !== ep.id) {
    i.__episodeId = ep.id
    try { i.startTime = pendingSeek > 0 ? pendingSeek : 0 } catch (e) {}
    i.src = config.previewAudio
  }
  try {
    i.play()
    set({ playing: true })
  } catch (e) {
    set({ error: '试听音频播放失败' })
  }
}

function pause() {
  if (state.mode === 'cloud' && bgmBound && bgm) {
    try { bgm.pause() } catch (e) {}
  }
  if (state.mode === 'preview' && innerBound && inner) {
    try { inner.pause() } catch (e) {}
  }
  set({ playing: false })
  saveProgress(true)
}

function toggle() {
  if (state.playing) pause()
  else play()
}

function seek(seconds) {
  var target = Math.max(0, Number(seconds) || 0)
  if (state.duration > 0 && target > state.duration) target = state.duration
  pendingSeek = target
  if (state.mode === 'cloud' && bgmBound && bgm) {
    try { bgm.seek(target) } catch (e) {}
  }
  if (state.mode === 'preview' && innerBound && inner) {
    try { inner.seek(target) } catch (e) {}
  }
  set({ currentTime: target })
  saveProgress(true)
}

/**
 * 倍速。返回是否设置成功。
 * 平台差异：InnerAudioContext 支持 playbackRate；
 * BackgroundAudioManager 在部分基础库上没有该属性，
 * 这里做能力探测，不支持时由界面提示「当前音频通道不支持倍速」。
 */
function setRate(rate) {
  var r = Number(rate) || 1
  if (state.mode === 'preview' && innerBound && inner) {
    try {
      inner.playbackRate = r
      set({ rate: r, rateSupported: true })
      return true
    } catch (e) {
      set({ rateSupported: false })
      return false
    }
  }
  if (state.mode === 'cloud' && bgmBound && bgm) {
    if (typeof bgm.playbackRate === 'undefined') {
      set({ rateSupported: false })
      return false
    }
    try {
      bgm.playbackRate = r
      set({ rate: r, rateSupported: true })
      return true
    } catch (e) {
      set({ rateSupported: false })
      return false
    }
  }
  set({ rate: r })
  return false
}

function next() {
  var ep = getEpisode()
  if (!ep) return null
  var idx = episodes.indexOf(ep.id)
  var nextEp = episodes.list[(idx + 1) % episodes.list.length]
  load(nextEp, { autoplay: true })
  return nextEp
}

function prev() {
  var ep = getEpisode()
  if (!ep) return null
  var idx = episodes.indexOf(ep.id)
  var prevEp = episodes.list[(idx - 1 + episodes.list.length) % episodes.list.length]
  load(prevEp, { autoplay: true })
  return prevEp
}

/** 切换 tab / 小程序隐藏时立即落盘 */
function flushProgress() {
  saveProgress(true)
}

function init() {
  if (started) return
  started = true
  // 预热背景音频对象，便于首次播放时直接接管
  ensureBgm()
}

module.exports = {
  init: init,
  subscribe: subscribe,
  onEnded: onEnded,
  getState: getState,
  getEpisode: getEpisode,
  getPosition: getPosition,
  load: load,
  play: play,
  pause: pause,
  toggle: toggle,
  seek: seek,
  setRate: setRate,
  next: next,
  prev: prev,
  flushProgress: flushProgress
}

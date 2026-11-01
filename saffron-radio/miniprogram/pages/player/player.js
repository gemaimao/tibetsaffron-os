var episodes = require('../../data/episodes.js')
var audio = require('../../utils/audio.js')
var store = require('../../utils/store.js')
var fmt = require('../../utils/format.js')
var config = require('../../config.js')

/** 生成稳定的装饰波形（仅用于视觉呈现，不代表真实频谱） */
function buildBars(seedStr) {
  var seed = 0
  var str = String(seedStr || 'seed')
  for (var i = 0; i < str.length; i++) seed += str.charCodeAt(i)
  var bars = []
  for (var j = 0; j < 40; j++) {
    var v = Math.abs(Math.sin((j + 1) * 1.27 + seed * 0.37) * Math.cos(j * 0.41 + seed * 0.11))
    bars.push(Math.round(16 + v * 60))
  }
  return bars
}

Page({
  data: {
    brand: config.brand,
    previewNotice: config.previewNotice,
    previewHint: '当前播放的是本地合成试听音频，仅用于演示播放器交互，并非完整节目。配置真实音频后会自动切换为背景音频播放。',

    episode: null,
    episodeId: '',
    indexText: '',

    mode: 'idle',
    isPreview: false,
    playing: false,
    loading: false,
    error: '',

    curText: '00:00',
    remainText: '-00:00',
    percent: 0,
    sliderValue: 0,
    sliderMax: 1,

    rate: 1,
    rates: [1, 1.25, 1.5],
    rateSupported: true,

    tab: 'intro',
    liked: false,
    faved: false,
    cloudEnabled: false,

    bars: [],
    safeguard: '本节目为产地纪实与工艺科普，不构成医疗建议，不提供按根计量的使用建议，也不承诺任何疗效。孕期、哺乳期人群及正在服药者，请咨询专业医师或药师。颜色深浅不能作为纯度或品质的凭证。'
  },

  onLoad: function (query) {
    var self = this

    this._unsub = audio.subscribe(function (s) { self.applyState(s) })
    this._unsubEnded = audio.onEnded(function () { self.onTrackEnded() })

    var s = audio.getState()
    var id = (query && query.episodeId) || s.episodeId || store.getLastEpisode()
    var ep = episodes.byId(id) || episodes.byId(episodes.featuredId)

    if (ep) {
      if (s.episodeId !== ep.id) {
        var p = store.getProgress(ep.id)
        audio.load(ep, { position: p ? p.position : 0 })
      }
      this.applyState(audio.getState())
    }
  },

  onShow: function () {
    this.applyState(audio.getState())
    this.refreshFlags()
  },

  onHide: function () {
    audio.flushProgress()
  },

  onUnload: function () {
    if (this._unsub) this._unsub()
    if (this._unsubEnded) this._unsubEnded()
    this._unsub = null
    this._unsubEnded = null
  },

  refreshFlags: function () {
    var ep = this.data.episode
    if (!ep) return
    var app = getApp()
    var g = (app && app.globalData) || {}
    // 只有「已配置云环境 + 已同意隐私 + 已登录」时，点赞收藏才会同步到云端
    this.setData({
      liked: store.isLiked(ep.id),
      faved: store.isFavorite(ep.id),
      cloudEnabled: !!(g.cloudConfigured && g.privacyAccepted && g.loggedIn)
    })
  },

  applyState: function (s) {
    if (!s) return
    var dur = s.duration || 0
    var cur = s.currentTime || 0
    var patch = {
      mode: s.mode,
      isPreview: s.mode === 'preview',
      playing: !!s.playing,
      loading: !!s.loading,
      error: s.error || '',
      rate: s.rate,
      rateSupported: s.rateSupported !== false,
      curText: fmt.formatTime(cur),
      remainText: fmt.formatRemain(cur, dur),
      percent: fmt.percent(cur, dur),
      sliderMax: dur > 0 ? Math.floor(dur) : 1
    }

    if (!this._seeking) {
      patch.sliderValue = Math.floor(cur)
    }

    var ep = episodes.byId(s.episodeId)
    if (ep && (!this.data.episode || this.data.episode.id !== ep.id)) {
      var idx = episodes.indexOf(ep.id)
      patch.episode = ep
      patch.episodeId = ep.id
      patch.indexText = '第 ' + (idx + 1) + ' 期 / 共 ' + episodes.list.length + ' 期'
      patch.bars = buildBars(ep.id)
      patch.liked = store.isLiked(ep.id)
      patch.faved = store.isFavorite(ep.id)
    }

    this.setData(patch)
  },

  /** 上下首 */
  onPrev: function () {
    var ep = audio.prev()
    if (ep) wx.showToast({ title: '上一期', icon: 'none', duration: 900 })
  },

  onNext: function () {
    var ep = audio.next()
    if (ep) wx.showToast({ title: '下一期', icon: 'none', duration: 900 })
  },

  onToggle: function () {
    if (!this.data.episodeId) return
    audio.toggle()
  },

  onTrackEnded: function () {
    // 试听音频结束时不做自动跳转，避免连续切歌；真实音频播完自动续播下一期
    if (audio.getState().mode !== 'cloud') return
    audio.next()
  },

  /* ---------------- 进度条 ---------------- */

  onSliderChanging: function (e) {
    this._seeking = true
    var v = e.detail.value
    var max = this.data.sliderMax
    this.setData({
      sliderValue: v,
      curText: fmt.formatTime(v),
      remainText: fmt.formatRemain(v, max),
      percent: fmt.percent(v, max)
    })
  },

  onSliderChange: function (e) {
    this._seeking = false
    audio.seek(e.detail.value)
  },

  /* ---------------- 倍速 ---------------- */

  onRateTap: function (e) {
    var r = Number(e.currentTarget.dataset.rate)
    var ok = audio.setRate(r)
    if (!ok) {
      wx.showToast({
        title: '当前音频通道不支持倍速',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /* ---------------- 简介 / 文稿 ---------------- */

  onTabTap: function (e) {
    var tab = e.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    this.setData({ tab: tab })
  },

  /* ---------------- 点赞 / 收藏 ---------------- */

  onLike: function () {
    var ep = this.data.episode
    if (!ep) return
    var liked = store.toggleLike(ep.id)
    this.setData({ liked: liked })
    wx.showToast({
      title: (liked ? '已点赞' : '已取消点赞') + (store.isCloudEnabled() ? '' : '（本机保存）'),
      icon: 'none'
    })
  },

  onFav: function () {
    var ep = this.data.episode
    if (!ep) return
    var faved = store.toggleFavorite(ep.id)
    this.setData({ faved: faved })
    wx.showToast({
      title: (faved ? '已收藏' : '已取消收藏') + (store.isCloudEnabled() ? '' : '（本机保存）'),
      icon: 'none'
    })
  },

  onGoTea: function () {
    wx.switchTab({ url: '/pages/tea/tea' })
  },

  onShareAppMessage: function () {
    var ep = this.data.episode
    return {
      title: ep ? ep.title : config.brand.name + ' · ' + config.brand.sub,
      path: '/pages/player/player?episodeId=' + (ep ? ep.id : '')
    }
  }
})

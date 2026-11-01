/**
 * 常驻迷你播放器
 * 数据来自全局播放服务（utils/audio.js），因此在各个 tab 页之间状态一致，
 * 切换 tab 时不会中断播放（真实音频走 backgroundAudioManager）。
 */
var audio = require('../../utils/audio.js')
var config = require('../../config.js')
var fmt = require('../../utils/format.js')

Component({
  data: {
    visible: false,
    title: '',
    cover: '',
    playing: false,
    loading: false,
    isPreview: false,
    percent: 0,
    curText: '00:00',
    previewNotice: config.previewNotice
  },

  lifetimes: {
    attached: function () {
      var self = this
      this._unsub = audio.subscribe(function (s) { self.sync(s) })
      this.sync(audio.getState())
    },
    detached: function () {
      if (this._unsub) this._unsub()
      this._unsub = null
    }
  },

  pageLifetimes: {
    show: function () {
      this.sync(audio.getState())
    }
  },

  methods: {
    sync: function (s) {
      if (!s) return
      var pct = 0
      if (s.duration > 0) {
        pct = Math.round((s.currentTime / s.duration) * 100)
        if (pct > 100) pct = 100
        if (pct < 0) pct = 0
      }
      var next = {
        visible: !!s.episodeId,
        title: s.title || '',
        cover: s.cover || '',
        playing: !!s.playing,
        loading: !!s.loading,
        isPreview: s.mode === 'preview',
        percent: pct,
        curText: fmt.formatTime(s.currentTime)
      }
      // 只在数据真正变化时 setData，避免高频时间更新带来的性能损耗
      var changed = false
      for (var k in next) {
        if (Object.prototype.hasOwnProperty.call(next, k) && this.data[k] !== next[k]) {
          changed = true
          break
        }
      }
      if (changed) this.setData(next)
    },

    onToggle: function () {
      audio.toggle()
    },

    onNext: function () {
      audio.next()
    },

    onOpen: function () {
      wx.switchTab({ url: '/pages/player/player' })
    }
  }
})

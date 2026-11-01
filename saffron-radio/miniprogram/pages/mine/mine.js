var config = require('../../config.js')
var cloud = require('../../utils/cloud.js')
var store = require('../../utils/store.js')
var questions = require('../../utils/questions.js')
var audio = require('../../utils/audio.js')
var episodes = require('../../data/episodes.js')
var fmt = require('../../utils/format.js')

function decorate(ep) {
  var p = store.getProgress(ep.id)
  var item = {}
  for (var k in ep) {
    if (Object.prototype.hasOwnProperty.call(ep, k)) item[k] = ep[k]
  }
  item.liked = store.isLiked(ep.id)
  item.faved = store.isFavorite(ep.id)
  item.position = p ? p.position : 0
  item.positionText = p ? fmt.formatTime(p.position) : ''
  item.percent = p ? fmt.percent(p.position, p.duration || ep.durationSec) : 0
  item.updatedText = p ? fmt.formatAgo(p.updatedAt) : ''
  return item
}

Page({
  data: {
    brand: config.brand,
    cloudConfigured: false,
    privacyAccepted: false,
    loggedIn: false,
    loginState: 'unknown',
    loginStateText: '未登录',
    loginMessage: '',
    syncing: false,

    tab: 'fav',
    tabs: [
      { key: 'fav', label: '收藏' },
      { key: 'like', label: '点赞' },
      { key: 'ask', label: '问答' },
      { key: 'history', label: '收听' }
    ],

    stats: { fav: 0, like: 0, ask: 0, history: 0 },
    favList: [],
    likeList: [],
    askList: [],
    historyList: [],

    privacyText: '未同意隐私说明时，本应用不会发送任何提问内容，也不会发起登录；已保存的收听进度、点赞与收藏都留在本机。撤回同意会停止云端同步并退出登录，本机数据保留。',
    safeguard: '本应用所有内容均为产地纪实与工艺科普，不构成医疗建议，不提供按根计量的使用建议，也不承诺任何疗效。孕期、哺乳期人群及正在服药者，请咨询专业医师或药师。'
  },

  onLoad: function () {
    this.refresh()
  },

  onShow: function () {
    this.refresh()
  },

  onHide: function () {
    audio.flushProgress()
  },

  refresh: function () {
    var app = getApp()
    var g = (app && app.globalData) || {}

    var favList = []
    var likeList = []
    episodes.list.forEach(function (ep) {
      var item = decorate(ep)
      if (item.faved) favList.push(item)
      if (item.liked) likeList.push(item)
    })

    var historyList = []
    store.getHistory().forEach(function (h) {
      var ep = episodes.byId(h.episodeId)
      if (!ep) return
      var item = decorate(ep)
      item.position = h.position
      item.positionText = fmt.formatTime(h.position)
      item.percent = fmt.percent(h.position, h.duration || ep.durationSec)
      item.updatedText = fmt.formatAgo(h.updatedAt)
      historyList.push(item)
    })

    // 问答：已收藏的排在前面，与茶室共用同一个本地库
    var askList = questions.allDesc().map(function (r) {
      return {
        id: r.id,
        question: r.question,
        answer: r.answer,
        quote: r.quote,
        saved: r.saved === true,
        source: r.source,
        sourceText: r.source === 'cloud' ? '云端回答' : '本地知识库',
        createdText: fmt.formatAgo(r.createdAt)
      }
    })
    askList.sort(function (a, b) {
      if (a.saved === b.saved) return 0
      return a.saved ? -1 : 1
    })

    this.setData({
      cloudConfigured: !!g.cloudConfigured,
      privacyAccepted: !!g.privacyAccepted,
      loggedIn: !!g.loggedIn,
      loginState: g.loginState || 'unknown',
      loginStateText: app ? app.loginStateText() : '未登录',
      loginMessage: g.loginMessage || '',
      stats: {
        fav: favList.length,
        like: likeList.length,
        ask: askList.length,
        history: historyList.length
      },
      favList: favList,
      likeList: likeList,
      askList: askList,
      historyList: historyList
    })
  },

  onTabTap: function (e) {
    var tab = e.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    this.setData({ tab: tab })
  },

  /* ------------------------- 登录 / 隐私 ------------------------- */

  onLoginTap: function () {
    var self = this
    var app = getApp()
    if (!app) return

    if (!app.globalData.cloudConfigured) {
      wx.showModal({
        title: '云环境未配置',
        content: '当前为本地体验模式：登录、云同步均不可用，但收听进度、点赞、收藏与问答会保存在本机。配置方法见项目根目录 setup.txt。',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#8C2B2B'
      })
      return
    }

    if (!app.globalData.privacyAccepted) {
      wx.showToast({ title: '请先同意隐私说明', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中', mask: true })
    app.login().then(function () {
      wx.hideLoading()
      wx.showToast({ title: '登录成功', icon: 'none' })
      self.refresh()
    }).catch(function (err) {
      wx.hideLoading()
      cloud.toast(err)
      self.refresh()
    })
  },

  onLogoutTap: function () {
    var self = this
    var app = getApp()
    if (!app) return
    if (!app.globalData.loggedIn) {
      wx.showToast({ title: '当前未登录', icon: 'none' })
      return
    }
    wx.showModal({
      title: '退出登录',
      content: '退出后停止云端同步，本机已保存的数据会保留，云端数据不会被删除。',
      confirmText: '退出',
      confirmColor: '#8C2B2B',
      success: function (m) {
        if (!m.confirm) return
        app.logout()
        self.refresh()
        wx.showToast({ title: '已退出登录', icon: 'none' })
      }
    })
  },

  onPrivacyTap: function () {
    var self = this
    var app = getApp()
    if (!app) return

    if (app.globalData.privacyAccepted) {
      wx.showModal({
        title: '撤回隐私同意',
        content: '撤回后将停止云端同步并退出登录，本机已保存的数据会保留。',
        confirmText: '撤回',
        confirmColor: '#8C2B2B',
        success: function (m) {
          if (!m.confirm) return
          app.revokePrivacy()
          wx.showToast({ title: '已撤回同意', icon: 'none' })
          self.refresh()
        }
      })
      return
    }

    app.acceptPrivacy()
    wx.showToast({ title: '已同意隐私说明', icon: 'none' })
    this.refresh()
  },

  onSyncTap: function () {
    var self = this
    var app = getApp()
    if (!app) return

    if (!app.globalData.loggedIn || !store.isCloudEnabled()) {
      wx.showToast({ title: '尚未登录，云同步未开启', icon: 'none' })
      return
    }

    this.setData({ syncing: true })
    wx.showLoading({ title: '同步中', mask: true })
    app.syncState().then(function () {
      wx.hideLoading()
      self.setData({ syncing: false })
      wx.showToast({ title: '已与云端合并', icon: 'none' })
      self.refresh()
    }).catch(function (err) {
      wx.hideLoading()
      self.setData({ syncing: false })
      cloud.toast(err)
    })
  },

  /* ------------------------- 节目 ------------------------- */

  onEpisodeTap: function (e) {
    var id = e.currentTarget.dataset.id
    var ep = episodes.byId(id)
    if (!ep) return
    var p = store.getProgress(ep.id)
    audio.load(ep, { autoplay: true, force: true, position: p ? p.position : 0 })
    wx.switchTab({ url: '/pages/player/player' })
  },

  onUnfav: function (e) {
    var id = e.currentTarget.dataset.id
    store.toggleFavorite(id)
    this.refresh()
    wx.showToast({ title: '已取消收藏', icon: 'none' })
  },

  onUnlike: function (e) {
    var id = e.currentTarget.dataset.id
    store.toggleLike(id)
    this.refresh()
    wx.showToast({ title: '已取消点赞', icon: 'none' })
  },

  /* ------------------------- 问答 ------------------------- */

  onQuestionTap: function () {
    wx.switchTab({ url: '/pages/tea/tea' })
  },

  onToggleSaved: function (e) {
    var self = this
    var id = e.currentTarget.dataset.id
    var rec = questions.get(id)
    if (!rec) return
    var next = !(rec.saved === true)

    if (rec.source === 'cloud' && this.data.cloudConfigured && this.data.loggedIn) {
      cloud.call('toggleQuote', { questionId: id }).then(function (res) {
        var saved = res && typeof res.saved === 'boolean' ? res.saved : next
        questions.setSaved(id, saved)
        self.refresh()
        wx.showToast({ title: saved ? '已收藏' : '已取消收藏', icon: 'none' })
      }).catch(function (err) {
        cloud.toast(err)
      })
      return
    }

    questions.setSaved(id, next)
    this.refresh()
    wx.showToast({
      title: (next ? '已收藏' : '已取消收藏') + '（本机保存）',
      icon: 'none'
    })
  },

  onDeleteQuestion: function (e) {
    var self = this
    var id = e.currentTarget.dataset.id
    var rec = questions.get(id)
    if (!rec) return

    wx.showModal({
      title: '删除这条问答',
      content: rec.source === 'cloud'
        ? '将删除本机记录。云端记录可在「茶室」用「清空问答记录」一并清理。'
        : '将从本机删除这条问答记录。',
      confirmText: '删除',
      confirmColor: '#8C2B2B',
      success: function (m) {
        if (!m.confirm) return
        questions.remove(id)
        self.refresh()
        wx.showToast({ title: '已删除', icon: 'none' })
      }
    })
  },

  /* ------------------------- 收听进度 ------------------------- */

  onDeleteHistory: function (e) {
    var self = this
    var id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除收听进度',
      content: '将删除这一期的收听进度。',
      confirmText: '删除',
      confirmColor: '#8C2B2B',
      success: function (m) {
        if (!m.confirm) return
        // 清收听进度用 clearProgress（不是 deleteHistory）
        store.clearProgress(id).then(function () {
          self.refresh()
          wx.showToast({ title: '已删除', icon: 'none' })
        }).catch(function (err) {
          self.refresh()
          cloud.toast(err)
        })
      }
    })
  },

  onClearHistory: function () {
    var self = this
    if (!this.data.historyList.length) {
      wx.showToast({ title: '暂无收听记录', icon: 'none' })
      return
    }
    wx.showModal({
      title: '清空收听进度',
      content: '将删除全部收听进度记录，收藏与点赞不受影响。',
      confirmText: '清空',
      confirmColor: '#8C2B2B',
      success: function (m) {
        if (!m.confirm) return
        store.clearProgress().then(function () {
          self.refresh()
          wx.showToast({ title: '已清空', icon: 'none' })
        }).catch(function (err) {
          self.refresh()
          cloud.toast(err)
        })
      }
    })
  },

  /* ------------------------- 注销 ------------------------- */

  onDeleteAccount: function () {
    var self = this
    wx.showModal({
      title: '注销账号',
      content: '将删除云端保存的进度、点赞、收藏与提问记录，并清空本机数据。该操作不可恢复。',
      confirmText: '确认注销',
      confirmColor: '#8C2B2B',
      success: function (m) {
        if (!m.confirm) return
        wx.showLoading({ title: '处理中', mask: true })
        store.deleteAccount().then(function () {
          wx.hideLoading()
          var app = getApp()
          if (app) {
            app.globalData.loggedIn = false
            app.globalData.loginState = app.globalData.cloudConfigured ? 'guest' : 'unconfigured'
            app.globalData.loginMessage = '账号已注销，本机数据已清空'
          }
          questions.clear()
          self.refresh()
          wx.showToast({ title: '已注销并清空', icon: 'none' })
        }).catch(function (err) {
          wx.hideLoading()
          cloud.toast(err)
        })
      }
    })
  }
})

var config = require('../../config.js')
var cloud = require('../../utils/cloud.js')
var kb = require('../../utils/kb.js')
var canvasCard = require('../../utils/canvasCard.js')
var episodes = require('../../data/episodes.js')
var questions = require('../../utils/questions.js')
var store = require('../../utils/store.js')
var audio = require('../../utils/audio.js')

function fallbackEpisodeId() {
  if (episodes.byId(episodes.featuredId)) return episodes.featuredId
  return 'ep04'
}

Page({
  data: {
    brand: config.brand,
    greeting: kb.greeting,
    suggestions: kb.suggestions,

    messages: [],
    notices: [],
    draft: '',
    sending: false,
    savingCard: false,
    maxLength: config.questionMaxLength,

    privacyAccepted: false,
    cloudConfigured: false,
    loggedIn: false,
    statusTitle: '',
    statusDesc: '',
    statusTone: 'local',
    showLogin: false,

    // 金句卡画布高度（按内容动态计算）
    cardCanvasH: 800,

    safeguard: '涉及健康的提问，这里只做常识性科普：不提供按根计量的使用建议，不承诺疗效。孕期、哺乳期人群及正在服药者，请咨询专业医师或药师。颜色深浅不能作为纯度或品质的凭证。'
  },

  onLoad: function () {
    this.rebuild()
    this.refreshStatus()
    this.loadCloudQuestions()
  },

  onShow: function () {
    this.refreshStatus()
    this.rebuild()
  },

  onHide: function () {
    // 问答记录已实时落盘，这里不需要额外处理
  },

  /* ------------------------- 状态 ------------------------- */

  refreshStatus: function () {
    var app = getApp()
    var g = (app && app.globalData) || {}
    var accepted = !!g.privacyAccepted
    var configured = !!g.cloudConfigured
    var loggedIn = !!g.loggedIn

    var patch = {
      privacyAccepted: accepted,
      cloudConfigured: configured,
      loggedIn: loggedIn,
      showLogin: configured && accepted && !loggedIn
    }

    if (!accepted) {
      patch.statusTitle = '尚未同意隐私说明'
      patch.statusDesc = '同意隐私说明后才能提问与登录；未同意时不会发送任何提问内容。'
      patch.statusTone = 'warn'
    } else if (!configured) {
      patch.statusTitle = '本地知识库演示 · 未连接云服务'
      patch.statusDesc = '答复由本地收录的节目知识按关键词匹配生成，不是大模型实时回答，也不会编造内容。配置云环境并登录后改为云端回答。'
      patch.statusTone = 'local'
    } else if (!loggedIn) {
      patch.statusTitle = '已配置云环境 · 未登录'
      patch.statusDesc = '配置云环境不等于已登录。登录后才会把提问发送到 radioAsk，并开启云端同步。'
      patch.statusTone = 'warn'
    } else {
      patch.statusTitle = '已连接云服务'
      patch.statusDesc = '提问会发送到云函数 radioAsk 处理；若云端返回失败，这里会明确提示失败，不会给出替代答案。'
      patch.statusTone = 'cloud'
    }

    this.setData(patch)
  },

  /* ------------------------- 渲染 ------------------------- */

  /** 从本地问答库重建对话流 */
  rebuild: function () {
    var list = questions.all()
    var messages = []

    list.forEach(function (rec) {
      messages.push({
        key: 'q-' + rec.id,
        role: 'user',
        text: rec.question,
        createdAt: rec.createdAt
      })
      messages.push({
        key: 'a-' + rec.id,
        id: rec.id,
        role: 'bot',
        text: rec.answer,
        quote: rec.quote,
        source: rec.source,
        saved: rec.saved === true,
        episodeId: rec.episodeId,
        createdAt: rec.createdAt
      })
    })

    this.setData({ messages: messages })
  },

  /* ------------------------- 云端历史 ------------------------- */

  loadCloudQuestions: function () {
    var self = this
    var app = getApp()
    var g = (app && app.globalData) || {}
    if (!g.cloudConfigured || !g.privacyAccepted || !g.loggedIn) return

    cloud.call('listQuestions', { limit: 50 }).then(function (res) {
      var rows = (res && res.questions) || []
      if (!Array.isArray(rows) || !rows.length) return
      // 云端字段是 saved（不是 quoted），questions 库内部统一用 saved
      questions.mergeCloudQuestions(rows)
      self.rebuild()
    }).catch(function () {
      // 云端历史拉取失败不影响本地展示
    })
  },

  /* ------------------------- 隐私 / 登录 ------------------------- */

  onAcceptPrivacy: function () {
    var app = getApp()
    if (!app) return
    app.acceptPrivacy()
    this.setData({ privacyAccepted: true })
    this.refreshStatus()

    if (!app.globalData.cloudConfigured) {
      wx.showToast({ title: '已同意，当前为本地演示模式', icon: 'none', duration: 2000 })
      return
    }
    this.doLogin()
  },

  onLoginTap: function () {
    if (!this.data.privacyAccepted) {
      wx.showToast({ title: '请先阅读并同意隐私说明', icon: 'none' })
      return
    }
    this.doLogin()
  },

  doLogin: function () {
    var self = this
    var app = getApp()
    if (!app) return
    wx.showLoading({ title: '登录中', mask: true })
    app.login().then(function () {
      wx.hideLoading()
      wx.showToast({ title: '登录成功', icon: 'none' })
      self.refreshStatus()
      self.loadCloudQuestions()
    }).catch(function (err) {
      wx.hideLoading()
      cloud.toast(err)
      self.refreshStatus()
    })
  },

  /* ------------------------- 提问 ------------------------- */

  onInput: function (e) {
    this.setData({ draft: e.detail.value })
  },

  onSuggestionTap: function (e) {
    var text = e.currentTarget.dataset.text
    this.setData({ draft: '' })
    this.sendQuestion(text)
  },

  onSend: function () {
    this.sendQuestion(this.data.draft)
  },

  currentEpisodeId: function () {
    var s = null
    try {
      s = audio.getState()
    } catch (e) {
      s = null
    }
    if (s && s.episodeId && episodes.byId(s.episodeId)) return s.episodeId

    var last = store.getLastEpisode()
    if (episodes.byId(last)) return last

    return fallbackEpisodeId()
  },

  /** 统一的提问入口：本地知识库演示 或 云端 radioAsk */
  sendQuestion: function (raw) {
    var self = this
    var q = String(raw || '').trim()
    if (!q) return
    if (this.data.sending) return

    if (!this.data.privacyAccepted) {
      wx.showToast({ title: '请先阅读并同意隐私说明', icon: 'none' })
      return
    }
    if (q.length > this.data.maxLength) {
      wx.showToast({ title: '问题不能超过 ' + this.data.maxLength + ' 字', icon: 'none' })
      return
    }

    this.setData({ draft: '', sending: true })

    // 未配置云环境：使用本地知识库演示答复，并明确标注来源
    if (!this.data.cloudConfigured) {
      var res = kb.ask(q)
      this.persistAnswer({
        question: q,
        answer: res.answer,
        quote: res.quote,
        episodeId: res.episodeId || fallbackEpisodeId(),
        source: 'local'
      })
      this.setData({ sending: false })
      this.rebuild()
      this.scrollToEnd()
      return
    }

    // 已配置云环境：必须登录后调用 radioAsk；失败时只报错，不给假答案
    var app = getApp()
    var ready = (app && app.globalData.loggedIn)
      ? Promise.resolve(true)
      : (app ? app.login() : Promise.reject(new Error('应用未就绪')))

    ready.then(function () {
      self.refreshStatus()
      // radioAsk 入参固定为 { question, episodeId }，不带 action
      return cloud.ask(q, self.currentEpisodeId())
    }).then(function (res) {
      if (!res || !res.answer) {
        throw new Error('云端未返回回答内容')
      }
      self.persistAnswer({
        id: res.questionId || '',
        question: q,
        answer: res.answer,
        quote: res.quote || '',
        episodeId: res.episodeId || self.currentEpisodeId(),
        createdAt: Number(res.createdAt) || Date.now(),
        source: 'cloud'
      })
      self.setData({ sending: false })
      self.rebuild()
      self.scrollToEnd()
    }).catch(function (err) {
      self.setData({ sending: false })
      cloud.toast(err)
      self.addNotice(q, cloud.describe(err))
      self.scrollToEnd()
    })
  },

  /** 落盘一条问答；本地生成的回答也会拿到稳定 id，因此可以收藏 */
  persistAnswer: function (rec) {
    var id = rec.id || questions.newId()
    questions.upsert({
      id: id,
      question: rec.question,
      answer: rec.answer,
      quote: rec.quote || '',
      episodeId: rec.episodeId || '',
      createdAt: rec.createdAt || Date.now(),
      saved: false,
      source: rec.source
    })
    return id
  },

  addNotice: function (question, reason) {
    var notices = (this.data.notices || []).concat([{
      key: 'n-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      question: question,
      text: '回答失败：' + reason + '。这里不会生成替代答案，你可以稍后重试。'
    }])
    this.setData({ notices: notices })
  },

  onRetry: function (e) {
    var text = e.currentTarget.dataset.text
    if (!text) return
    this.setData({ draft: '' })
    this.sendQuestion(text)
  },

  onDismissNotice: function (e) {
    var key = e.currentTarget.dataset.key
    var notices = (this.data.notices || []).filter(function (n) { return n.key !== key })
    this.setData({ notices: notices })
  },

  scrollToEnd: function () {
    setTimeout(function () {
      wx.pageScrollTo({ scrollTop: 100000, duration: 260 })
    }, 120)
  },

  /* ------------------------- 收藏（saved） ------------------------- */

  onToggleSaved: function (e) {
    var id = e.currentTarget.dataset.id
    var rec = questions.get(id)
    if (!rec) return
    var next = !(rec.saved === true)
    var self = this

    // 云端问答：调用 toggleQuote（服务端字段 saved）；本地问答：只改本机
    if (rec.source === 'cloud' && this.data.cloudConfigured && this.data.loggedIn) {
      cloud.call('toggleQuote', { questionId: id }).then(function (res) {
        var saved = res && typeof res.saved === 'boolean' ? res.saved : next
        questions.setSaved(id, saved)
        self.rebuild()
        wx.showToast({ title: saved ? '已收藏' : '已取消收藏', icon: 'none' })
      }).catch(function (err) {
        cloud.toast(err)
      })
      return
    }

    questions.setSaved(id, next)
    this.rebuild()
    wx.showToast({
      title: (next ? '已收藏' : '已取消收藏') + '（本机保存）',
      icon: 'none'
    })
  },

  /* ------------------------- 金句卡片 ------------------------- */

  onMakeCard: function (e) {
    var id = e.currentTarget.dataset.id
    var rec = questions.get(id)
    if (!rec) {
      wx.showToast({ title: '找不到这条问答', icon: 'none' })
      return
    }
    if (!rec.answer && !rec.quote) {
      wx.showToast({ title: '这条问答没有可排版的内容', icon: 'none' })
      return
    }
    if (this.data.savingCard) return

    var self = this
    var ep = rec.episodeId ? episodes.byId(rec.episodeId) : null
    this.setData({ savingCard: true })
    wx.showLoading({ title: '生成卡片', mask: true })

    // 卡片包含完整的「问题 + 回答 + 金句」，高度按内容动态计算
    canvasCard.makeAndSave(this, 'quoteCanvas', {
      question: rec.question,
      answer: rec.answer,
      quote: rec.quote,
      episodeTitle: ep ? ep.title : '',
      brandName: config.brand.name,
      brandSub: config.brand.sub,
      disclaimer: '节目科普摘录 · 不构成医疗建议'
    }).then(function () {
      wx.hideLoading()
      self.setData({ savingCard: false })
      wx.showToast({ title: '已保存到相册', icon: 'success' })
    }).catch(function (err) {
      wx.hideLoading()
      self.setData({ savingCard: false })
      if (err && err.code === 'ALBUM_DENIED') {
        wx.showToast({ title: '未获得相册权限，卡片未保存', icon: 'none', duration: 2200 })
      } else {
        wx.showToast({ title: (err && err.message) || '卡片保存失败', icon: 'none', duration: 2200 })
      }
    })
  },

  /* ------------------------- 清理 ------------------------- */

  /**
   * 清空问答记录。
   * 云端对应 radioApi 的 deleteHistory —— 该 action 名为 history，
   * 实际删除的是 radio_questions（问答），不是收听进度。
   * 收听进度请在「我的」用 clearProgress 清理。
   */
  onClearLocal: function () {
    var self = this
    var canCloud = this.data.cloudConfigured && this.data.loggedIn

    wx.showModal({
      title: '清空问答记录',
      content: canCloud
        ? '将清空本机与云端的问答记录。收藏与收听进度不受影响。'
        : '将清空本机保存的问答记录。',
      confirmText: '清空',
      confirmColor: '#8C2B2B',
      success: function (m) {
        if (!m.confirm) return

        var finish = function () {
          questions.clear()
          self.setData({ notices: [] })
          self.rebuild()
        }

        if (!canCloud) {
          finish()
          wx.showToast({ title: '已清空本机问答', icon: 'none' })
          return
        }

        wx.showLoading({ title: '清理中', mask: true })
        store.clearQuestions().then(function () {
          wx.hideLoading()
          finish()
          wx.showToast({ title: '已清空问答记录', icon: 'none' })
        }).catch(function (err) {
          wx.hideLoading()
          finish()
          cloud.toast(err)
        })
      }
    })
  }
})

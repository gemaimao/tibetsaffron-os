/**
 * 雪域林泉 · 藏红花电台
 * 全局逻辑：云开发初始化、隐私同意、一键登录、状态同步、播放恢复
 *
 * 登录与同步的关系（重要）：
 *   「已配置 cloudEnv」只代表云端可用，**不代表已登录**。
 *   云端同步必须同时满足三个条件，缺一不可：
 *     1. config.js 配置了 cloudEnv；
 *     2. 用户同意过隐私说明；
 *     3. 用户主动点过「一键登录」，并且本机保存了登录态。
 *   onLaunch 不会自动登录：只有在 2+3 都已满足时，才会静默恢复会话。
 */
var config = require('./config.js')
var cloud = require('./utils/cloud.js')
var store = require('./utils/store.js')
var audio = require('./utils/audio.js')
var privacy = require('./utils/privacy.js')
var episodes = require('./data/episodes.js')

var SESSION_KEY = 'saffron_radio_session_v1'

App({
  globalData: {
    brand: config.brand,
    cloudConfigured: false,
    cloudReady: false,
    // 是否已登录（与 cloudConfigured 独立）
    loggedIn: false,
    // unknown | unconfigured | guest | pending | logged | error
    loginState: 'unknown',
    loginMessage: '',
    privacyAccepted: false,
    consentSynced: false,
    syncAt: 0,
    envId: ''
  },

  onLaunch: function () {
    var g = this.globalData

    g.privacyAccepted = privacy.isAccepted()
    g.cloudConfigured = cloud.isConfigured()
    g.envId = cloud.getEnv()
    g.cloudReady = cloud.init()

    // 本地状态优先，保证离线可用
    store.load()
    // 默认不开启云同步；只有真正登录成功后才打开
    store.setCloudEnabled(false)

    audio.init()
    this.restoreLastEpisode()

    var session = this.readSession()

    if (!g.cloudConfigured) {
      g.loggedIn = false
      g.loginState = 'unconfigured'
      g.loginMessage = '云环境未配置，当前为本地体验模式'
    } else if (!g.privacyAccepted) {
      g.loggedIn = false
      g.loginState = 'guest'
      g.loginMessage = '需要先同意隐私说明'
    } else if (session && session.loggedIn) {
      // 之前登录过：静默恢复会话，失败则退回未登录
      g.loginState = 'pending'
      this.login().catch(function () {})
    } else {
      g.loggedIn = false
      g.loginState = 'guest'
      g.loginMessage = '尚未登录，点击「一键登录」后才会开启云端同步'
    }
  },

  onShow: function () {
    if (this.globalData.loggedIn && store.isCloudEnabled()) {
      store.flush()
    }
  },

  onHide: function () {
    audio.flushProgress()
    if (store.isCloudEnabled()) store.flush()
  },

  /* ------------------------------ 会话 ------------------------------ */

  readSession: function () {
    try {
      var s = wx.getStorageSync(SESSION_KEY)
      return s && typeof s === 'object' ? s : null
    } catch (e) {
      return null
    }
  },

  writeSession: function (loggedIn) {
    try {
      if (loggedIn) wx.setStorageSync(SESSION_KEY, { loggedIn: true, at: Date.now() })
      else wx.removeStorageSync(SESSION_KEY)
    } catch (e) {}
  },

  /** 恢复上次收听的节目（不自动播放，不覆盖云端 lastEpisode） */
  restoreLastEpisode: function () {
    var id = store.getLastEpisode()
    var ep = episodes.byId(id) || episodes.byId(episodes.featuredId)
    if (!ep) return
    var p = store.getProgress(ep.id)
    audio.load(ep, {
      position: p ? p.position : 0,
      markLast: false
    })
  },

  /* ------------------------------ 登录 ------------------------------ */

  /**
   * 用户主动点击「一键登录」后调用。
   * - 必须携带 consent:true，云函数会把同意状态写进用户档案，
   *   radioAsk 会校验 consent === true 才允许提问；
   * - 不会自动获取头像昵称，只用于区分账号。
   */
  login: function () {
    var self = this
    var g = this.globalData

    if (!g.cloudConfigured) {
      var e1 = new Error('云环境未配置（config.js 的 cloudEnv 为空）')
      e1.code = 'CLOUD_NOT_CONFIGURED'
      g.loggedIn = false
      g.loginState = 'unconfigured'
      g.loginMessage = '云环境未配置，当前为本地体验模式'
      return Promise.reject(e1)
    }

    if (!privacy.isAccepted()) {
      var e2 = new Error('请先阅读并同意隐私说明')
      e2.code = 'PRIVACY_NOT_ACCEPTED'
      g.loggedIn = false
      g.loginState = 'guest'
      g.loginMessage = '需要先同意隐私说明才能登录'
      return Promise.reject(e2)
    }

    g.loginState = 'pending'

    return privacy.requireAuthorize().then(function () {
      // 登录携带同意标记；这是 radioAsk 的提问前置条件
      return cloud.call('login', { consent: true })
    }).then(function (res) {
      g.loggedIn = true
      g.loginState = 'logged'
      g.loginMessage = ''
      g.consentSynced = !!(res && res.profile && res.profile.consent)

      self.writeSession(true)

      // 登录响应直接带回 state，先合并（本地脏数据优先）再补发差异
      store.setCloudEnabled(true)
      store.applyServerState(res)
      g.syncAt = Date.now()

      return store.flush().then(function () { return res })
    }).catch(function (err) {
      g.loggedIn = false
      store.setCloudEnabled(false)
      if (err && err.code === 'PRIVACY_NOT_ACCEPTED') {
        g.loginState = 'guest'
        g.loginMessage = '未同意隐私授权，登录已取消'
      } else {
        g.loginState = 'error'
        g.loginMessage = cloud.describe(err)
      }
      throw err
    })
  },

  /** 退出登录：只清本机会话，不删除云端数据 */
  logout: function () {
    var g = this.globalData
    g.loggedIn = false
    g.loginState = g.cloudConfigured ? 'guest' : 'unconfigured'
    g.loginMessage = '已退出登录，本地数据仍保留在本机'
    store.setCloudEnabled(false)
    this.writeSession(false)
    return true
  },

  /** 拉取云端 state 并与本地合并（合并策略见 utils/store.js） */
  syncState: function () {
    var self = this
    if (!this.globalData.loggedIn || !store.isCloudEnabled()) {
      return Promise.reject(new Error('尚未登录，云同步未开启'))
    }
    return store.pullState().then(function (state) {
      self.globalData.syncAt = Date.now()
      return state
    })
  },

  /* ------------------------------ 隐私 ------------------------------ */

  acceptPrivacy: function () {
    privacy.accept()
    this.globalData.privacyAccepted = true
    return true
  },

  /** 撤回隐私同意（清除本地标记并停止同步，不影响已同步数据） */
  revokePrivacy: function () {
    privacy.reset()
    this.globalData.privacyAccepted = false
    this.globalData.loggedIn = false
    store.setCloudEnabled(false)
    this.writeSession(false)
    return true
  },

  loginStateText: function () {
    switch (this.globalData.loginState) {
      case 'logged': return '已登录'
      case 'pending': return '登录中…'
      case 'unconfigured': return '未配置云环境'
      case 'error': return '登录失败'
      case 'guest': return '未登录'
      default: return '未登录'
    }
  }
})

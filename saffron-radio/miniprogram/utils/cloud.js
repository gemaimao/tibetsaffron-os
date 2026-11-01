/**
 * 云调用封装
 *
 * 两个云函数，按用途分流（契约以 cloudfunctions/ 下的实现为准）：
 *
 *   1) radioApi   —— 状态与账号。入参 { action, ... }
 *      action: login | getState | saveProgress | toggleLike | toggleFavorite |
 *              listQuestions | toggleQuote | deleteHistory | clearProgress | deleteAccount
 *      返回 { ok:true, ...payload }，其中状态类接口的 payload 形如
 *      { state: { progress, likes, favorites, lastEpisode } }
 *
 *   2) radioAsk   —— 提问。入参 { question, episodeId }，**不带 action**。
 *      返回 { ok:true, answer, quote, questionId, episodeId, createdAt, remaining }
 *
 * 失败一律返回 { ok:false, code, message }，这里的 Error.code 原样保留服务端 code，
 * 不做改写、不生成任何替代数据。
 */
var config = require('../config.js')

// radioApi 支持的动作白名单。未知动作在本地直接拒绝，避免无意义的往返。
var API_ACTIONS = [
  'login',
  'getState',
  'saveProgress',
  'toggleLike',
  'toggleFavorite',
  'listQuestions',
  'toggleQuote',
  'deleteHistory',
  'clearProgress',
  'deleteAccount'
]

var ASK_ACTION = 'radioAsk'

// 服务端 code -> 面向用户的说明
var CODE_TEXT = {
  NO_IDENTITY: '未获取到微信身份，请重新登录',
  BAD_ACTION: '云函数不支持该操作',
  BAD_INPUT: '提交的数据不合法',
  NOT_FOUND: '数据不存在或已被删除',
  FORBIDDEN: '没有权限访问该数据',
  CONFLICT: '写入冲突，请稍后重试',
  CONSENT_REQUIRED: '需要先在云函数侧确认隐私同意（consent）',
  RATE_LIMITED: '今天的提问次数已用完，请稍后再来',
  RATE_UNAVAILABLE: '服务繁忙，请稍后重试',
  CONTENT_BLOCKED: '内容未通过安全审核，换个问法试试',
  AI_CONFIG: '云端 AI 未配置，请联系管理员',
  AI_UPSTREAM: '云端 AI 暂时不可用，请稍后重试',
  AI_TIMEOUT: '云端 AI 响应超时，请稍后重试',
  AI_BAD_RESPONSE: '云端返回内容不可用，请稍后重试',
  INTERNAL: '云端内部错误，请稍后重试',

  CLOUD_NOT_CONFIGURED: '云环境未配置，已切换到本地体验模式',
  CLOUD_UNSUPPORTED: '当前微信版本不支持云开发',
  CLOUD_DISABLED: '云同步未开启',
  CLOUD_FAIL: '云调用失败，请检查网络',
  CLIENT_TIMEOUT: '云端响应超时，请稍后重试',
  EMPTY_RESULT: '云函数没有返回内容',
  PRIVACY_NOT_ACCEPTED: '请先阅读并同意隐私说明'
}

var configured = false
var inited = false
var lastError = ''

function getEnv() {
  return (config.cloudEnv || '').trim()
}

function isConfigured() {
  return getEnv().length > 0
}

/** 初始化云开发；未配置 env 时返回 false，且不调用 wx.cloud.init */
function init() {
  if (inited) return configured
  inited = true
  if (!isConfigured()) {
    configured = false
    return false
  }
  if (!wx.cloud || typeof wx.cloud.init !== 'function') {
    configured = false
    lastError = '当前基础库不支持云开发'
    return false
  }
  try {
    wx.cloud.init({ env: getEnv(), traceUser: true })
    configured = true
  } catch (e) {
    configured = false
    lastError = (e && e.message) || '云开发初始化失败'
  }
  return configured
}

function isReady() {
  return configured
}

function makeError(message, code, raw) {
  var err = new Error(message || '云调用失败')
  err.code = code || 'CLOUD_ERROR'
  err.raw = raw
  return err
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

/** 选择云函数名 */
function functionFor(action) {
  if (action === ASK_ACTION) return config.functions.ask
  if (API_ACTIONS.indexOf(action) >= 0) return config.functions.api
  return ''
}

/**
 * 构造入参。
 * radioAsk 只发送服务端认可的字段（多余字段一律不带）；
 * radioApi 发送 { action, ...payload }。
 */
function buildPayload(action, payload) {
  if (action === ASK_ACTION) {
    return {
      question: payload && typeof payload.question === 'string' ? payload.question : '',
      episodeId: payload && typeof payload.episodeId === 'string' ? payload.episodeId : ''
    }
  }
  var data = {}
  if (isPlainObject(payload)) {
    for (var k in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, k) && k !== 'action') data[k] = payload[k]
    }
  }
  data.action = action
  return data
}

/** 带超时的 callFunction，超时后不再接受迟到的结果 */
function callFunction(name, data, timeoutMs) {
  return new Promise(function (resolve, reject) {
    var settled = false
    var timer = null

    function finish(ok, value) {
      if (settled) return
      settled = true
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (ok) resolve(value)
      else reject(value)
    }

    if (timeoutMs && timeoutMs > 0) {
      timer = setTimeout(function () {
        finish(false, makeError('云端响应超时', 'CLIENT_TIMEOUT'))
      }, timeoutMs)
    }

    try {
      wx.cloud.callFunction({
        name: name,
        data: data,
        success: function (res) { finish(true, res) },
        fail: function (err) {
          var msg = (err && (err.errMsg || err.message)) || '云调用失败'
          finish(false, makeError(msg, 'CLOUD_FAIL', err))
        }
      })
    } catch (e) {
      finish(false, makeError((e && e.message) || '云调用异常', 'CLOUD_FAIL', e))
    }
  })
}

/** 解析 { ok:true, ... } 信封；失败时保留服务端 code */
function unwrap(res) {
  var raw = res ? res.result : null
  if (raw === undefined || raw === null) {
    throw makeError('云函数没有返回内容', 'EMPTY_RESULT')
  }
  if (raw.ok === false) {
    // 服务端 code 原样保留，便于调用方按 code 分支处理
    throw makeError(raw.message || raw.error || '云函数返回失败', raw.code || 'CLOUD_ERROR', raw)
  }
  if (raw.error && raw.ok === undefined) {
    throw makeError(raw.message || raw.error, raw.code || 'CLOUD_ERROR', raw)
  }
  if (raw.data !== undefined && raw.ok === undefined) {
    return raw.data
  }
  return raw
}

/**
 * 通用调用。
 * @param {string} action radioApi 的 action，或 'radioAsk'
 * @param {object} payload
 */
function call(action, payload) {
  return new Promise(function (resolve, reject) {
    if (!isConfigured()) {
      reject(makeError('云环境未配置（config.js 的 cloudEnv 为空）', 'CLOUD_NOT_CONFIGURED'))
      return
    }
    if (!configured) init()
    if (!wx.cloud || typeof wx.cloud.callFunction !== 'function') {
      reject(makeError('当前基础库不支持云开发', 'CLOUD_UNSUPPORTED'))
      return
    }

    var name = functionFor(action)
    if (!name) {
      reject(makeError('未知的 action：' + action, 'BAD_ACTION'))
      return
    }

    var isAsk = action === ASK_ACTION
    var timeout = isAsk ? config.askTimeoutMs : config.apiTimeoutMs

    // 注意：unwrap 会在服务端返回 { ok:false } 时抛出。
    // 必须让它落在「链上的 rejection 处理」里，否则会变成 unhandledRejection，
    // 并且外层 Promise 永远不会 settle（调用方 await 卡死）。
    callFunction(name, buildPayload(action, payload), timeout).then(function (res) {
      return unwrap(res)
    }).then(resolve, reject)
  })
}

/** 提问专用入口：路由到 radioAsk，不带 action */
function ask(question, episodeId) {
  return call(ASK_ACTION, { question: question, episodeId: episodeId })
}

/** 从任意状态类响应中取出 state（兼容 { state } 与直接返回 state 两种形态） */
function pickState(res) {
  if (!isPlainObject(res)) return null
  if (isPlainObject(res.state)) return res.state
  if (res.progress !== undefined || res.likes !== undefined || res.favorites !== undefined) return res
  return null
}

/** 统一的错误提示文案 */
function describe(err) {
  if (!err) return '操作失败，请稍后重试'
  if (err.code && CODE_TEXT[err.code]) return CODE_TEXT[err.code]

  var msg = err.message || ''
  if (msg.indexOf('FunctionName parameter could not be found') >= 0) {
    return '云函数未部署，请先上传 ' + config.functions.api + ' 与 ' + config.functions.ask
  }
  if (msg.indexOf('timeout') >= 0 || msg.indexOf('TIME_LIMIT') >= 0) return '云端响应超时，请稍后重试'
  if (msg.indexOf('errCode: -501000') >= 0 || msg.indexOf('network') >= 0) return '网络不可用，已保留本地数据'
  return msg || '操作失败，请稍后重试'
}

/** 轻提示 */
function toast(err, fallbackTitle) {
  var title = describe(err) || fallbackTitle || '操作失败'
  if (title.length > 30) title = title.slice(0, 28) + '…'
  wx.showToast({ title: title, icon: 'none', duration: 2200 })
}

module.exports = {
  init: init,
  isConfigured: isConfigured,
  isReady: isReady,
  call: call,
  ask: ask,
  pickState: pickState,
  describe: describe,
  toast: toast,
  getEnv: getEnv,
  getLastError: function () { return lastError },
  API_ACTIONS: API_ACTIONS,
  ASK_ACTION: ASK_ACTION
}

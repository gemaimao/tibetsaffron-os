/**
 * 隐私同意状态
 *
 * 规则：
 *   - 未同意隐私说明前：不发起任何云端请求，不发送提问内容；
 *   - 同意后才允许「一键登录」与「向主播提问」；
 *   - 同时兼容 wx.requirePrivacyAuthorize（基础库 2.32.3+），
 *     在不支持的老版本上退回自带的同意弹层。
 */
var KEY = 'saffron_radio_privacy_v1'

function isAccepted() {
  try {
    return !!wx.getStorageSync(KEY)
  } catch (e) {
    return false
  }
}

function accept() {
  try {
    wx.setStorageSync(KEY, 1)
  } catch (e) {}
  return true
}

function reset() {
  try {
    wx.removeStorageSync(KEY)
  } catch (e) {}
}

/** 调用微信官方隐私授权弹窗；老版本直接放行 */
function requireAuthorize() {
  return new Promise(function (resolve, reject) {
    if (typeof wx.requirePrivacyAuthorize !== 'function') {
      resolve(true)
      return
    }
    wx.requirePrivacyAuthorize({
      success: function () { resolve(true) },
      fail: function () {
        var err = new Error('用户未同意隐私授权')
        err.code = 'PRIVACY_NOT_ACCEPTED'
        reject(err)
      }
    })
  })
}

/** 组合校验：本地同意标记 + 官方弹窗 */
function ensure() {
  if (!isAccepted()) {
    var err = new Error('请先阅读并同意隐私说明')
    err.code = 'PRIVACY_NOT_ACCEPTED'
    return Promise.reject(err)
  }
  return requireAuthorize()
}

module.exports = {
  isAccepted: isAccepted,
  accept: accept,
  reset: reset,
  requireAuthorize: requireAuthorize,
  ensure: ensure
}

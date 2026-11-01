/** 通用格式化工具 */

function pad2(n) {
  var v = Math.floor(Math.abs(Number(n) || 0))
  return v < 10 ? '0' + v : '' + v
}

/** 秒 -> mm:ss 或 h:mm:ss */
function formatTime(sec) {
  var s = Math.floor(Number(sec) || 0)
  if (s < 0) s = 0
  var h = Math.floor(s / 3600)
  var m = Math.floor((s % 3600) / 60)
  var ss = s % 60
  if (h > 0) return h + ':' + pad2(m) + ':' + pad2(ss)
  return pad2(m) + ':' + pad2(ss)
}

/** 剩余时间，形如 -12:34 */
function formatRemain(current, total) {
  var c = Math.floor(Number(current) || 0)
  var t = Math.floor(Number(total) || 0)
  var left = t - c
  if (left < 0) left = 0
  return '-' + formatTime(left)
}

/** 时间戳 -> 2026-10-01 14:05 */
function formatDateTime(ts) {
  var d = new Date(Number(ts) || Date.now())
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
    ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes())
}

/** 时间戳 -> 10-01 */
function formatShortDate(ts) {
  var d = new Date(Number(ts) || Date.now())
  return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
}

/** 秒 -> 大约 X 分钟前 / X 小时前 / X 天前 */
function formatAgo(ts) {
  var t = Number(ts) || 0
  if (!t) return ''
  var diff = Date.now() - t
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + ' 小时前'
  if (diff < 30 * 24 * 60 * 60 * 1000) return Math.floor(diff / 86400000) + ' 天前'
  return formatShortDate(t)
}

/** 收听进度百分比 0-100 */
function percent(current, total) {
  var c = Number(current) || 0
  var t = Number(total) || 0
  if (t <= 0) return 0
  var p = Math.round((c / t) * 100)
  if (p < 0) p = 0
  if (p > 100) p = 100
  return p
}

module.exports = {
  pad2: pad2,
  formatTime: formatTime,
  formatRemain: formatRemain,
  formatDateTime: formatDateTime,
  formatShortDate: formatShortDate,
  formatAgo: formatAgo,
  percent: percent
}

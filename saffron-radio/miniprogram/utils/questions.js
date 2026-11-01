/**
 * 问答记录本地库
 *
 * 同时承载两类记录，靠 source 区分：
 *   source='local' —— 未连接云环境时由本地知识库生成
 *   source='cloud' —— radioAsk 返回的问答（含 listQuestions 拉回的历史）
 *
 * 为什么需要它：
 *   1. 云端收藏字段叫 saved（radioApi.toQuestion），本地统一用 saved 存，
 *      界面上显示为「收藏 / 已收藏」，避免与 liked 混淆。
 *   2. 本地生成的回答没有服务端 _id，如果 questionId 为空就没法收藏；
 *      这里为每条本地记录分配一个稳定 id（形如 local-...），
 *      刷新、重进页面后依然能对应上同一条记录。
 *   3. 「我的」页需要展示已收藏问答，因此必须有一个 tea 与 mine 共用的存储。
 *
 * 该库与 utils/store.js 的云端 state 无关，云端 state 只同步
 * progress / likes / favorites / lastEpisode。
 */
var KEY = 'saffron_radio_questions_v1'
var MAX_RECORDS = 200

var idSeq = 0

/** 稳定且符合服务端 questionId 字符集（[A-Za-z0-9_-]）的本地 id */
function newId() {
  idSeq += 1
  return 'local-' + Date.now() + '-' + idSeq + '-' + Math.floor(Math.random() * 1000000)
}

function safeGet(key, fallback) {
  try {
    var v = wx.getStorageSync(key)
    if (v === '' || v === null || v === undefined) return fallback
    return v
  } catch (e) {
    return fallback
  }
}

function safeSet(key, value) {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {}
}

function normalizeRecord(raw) {
  if (!raw || typeof raw !== 'object') return null
  var id = typeof raw.id === 'string' && raw.id ? raw.id : ''
  if (!id) return null
  return {
    id: id,
    question: typeof raw.question === 'string' ? raw.question : '',
    answer: typeof raw.answer === 'string' ? raw.answer : '',
    quote: typeof raw.quote === 'string' ? raw.quote : '',
    episodeId: typeof raw.episodeId === 'string' ? raw.episodeId : '',
    createdAt: Number(raw.createdAt) || 0,
    saved: raw.saved === true,
    source: raw.source === 'cloud' ? 'cloud' : 'local'
  }
}

function readAll() {
  var list = safeGet(KEY, [])
  if (!Array.isArray(list)) return []
  var out = []
  list.forEach(function (r) {
    var n = normalizeRecord(r)
    if (n) out.push(n)
  })
  return out
}

function writeAll(list) {
  var trimmed = list
  if (trimmed.length > MAX_RECORDS) {
    // 保留最近写入的 MAX_RECORDS 条
    trimmed = trimmed.slice(trimmed.length - MAX_RECORDS)
  }
  safeSet(KEY, trimmed)
  return trimmed
}

/** 全部记录，按 createdAt 升序（适合聊天流展示） */
function all() {
  var list = readAll()
  list.sort(function (a, b) { return a.createdAt - b.createdAt })
  return list
}

/** 全部记录，按 createdAt 降序 */
function allDesc() {
  return all().reverse()
}

function get(id) {
  if (!id) return null
  var list = readAll()
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i]
  }
  return null
}

/** 新增或更新一条；id 缺省时自动生成 */
function upsert(record) {
  var rec = normalizeRecord(record)
  if (!rec) return null
  var list = readAll()
  var found = false
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === rec.id) {
      // 已有字段不被空值覆盖
      list[i] = {
        id: rec.id,
        question: rec.question || list[i].question,
        answer: rec.answer || list[i].answer,
        quote: rec.quote || list[i].quote,
        episodeId: rec.episodeId || list[i].episodeId,
        createdAt: list[i].createdAt || rec.createdAt,
        saved: rec.saved || list[i].saved,
        source: rec.source || list[i].source
      }
      found = true
      break
    }
  }
  if (!found) list.push(rec)
  writeAll(list)
  return rec
}

function remove(id) {
  var list = readAll().filter(function (r) { return r.id !== id })
  writeAll(list)
}

function clear() {
  safeSet(KEY, [])
}

/** 设置收藏状态（对应云端 toggleQuote 的 saved） */
function setSaved(id, saved) {
  var list = readAll()
  var changed = false
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].saved = saved === true
      changed = true
      break
    }
  }
  if (changed) writeAll(list)
  return saved === true
}

function isSaved(id) {
  var rec = get(id)
  return !!(rec && rec.saved)
}

/** 已收藏问答，按时间倒序 */
function savedList() {
  return allDesc().filter(function (r) { return r.saved === true })
}

/**
 * 合并云端 listQuestions 的结果。
 * 云端字段：{ id, _id, question, answer, quote, episodeId, createdAt, saved }
 * 云端没有 quote 之外的「已读/点赞」概念，saved 即收藏。
 * 已存在的记录保留本地 saved（本地可能刚改过，尚未被云端确认）。
 */
function mergeCloudQuestions(rows) {
  if (!Array.isArray(rows) || !rows.length) return all()

  var list = readAll()
  var index = {}
  list.forEach(function (r, i) { index[r.id] = i })

  rows.forEach(function (row) {
    if (!row) return
    var id = row.id || row._id || ''
    if (!id) return
    var rec = {
      id: id,
      question: typeof row.question === 'string' ? row.question : '',
      answer: typeof row.answer === 'string' ? row.answer : '',
      quote: typeof row.quote === 'string' ? row.quote : '',
      episodeId: typeof row.episodeId === 'string' ? row.episodeId : '',
      createdAt: Number(row.createdAt) || 0,
      saved: row.saved === true,
      source: 'cloud'
    }
    if (Object.prototype.hasOwnProperty.call(index, id)) {
      var cur = list[index[id]]
      list[index[id]] = {
        id: id,
        question: rec.question || cur.question,
        answer: rec.answer || cur.answer,
        quote: rec.quote || cur.quote,
        episodeId: rec.episodeId || cur.episodeId,
        createdAt: cur.createdAt || rec.createdAt,
        // 本地刚改过的收藏状态优先，避免被云端旧值覆盖
        saved: cur.saved || rec.saved,
        source: 'cloud'
      }
    } else {
      index[id] = list.length
      list.push(rec)
    }
  })

  return writeAll(list)
}

module.exports = {
  newId: newId,
  all: all,
  allDesc: allDesc,
  get: get,
  upsert: upsert,
  remove: remove,
  clear: clear,
  setSaved: setSaved,
  isSaved: isSaved,
  savedList: savedList,
  mergeCloudQuestions: mergeCloudQuestions,
  MAX_RECORDS: MAX_RECORDS
}

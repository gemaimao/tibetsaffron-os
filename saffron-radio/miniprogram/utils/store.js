/**
 * 本地状态中心 + 云端合并 + 离线缓存
 *
 * state 结构（与 radioApi 的 toState 一致）：
 *   {
 *     progress: { [episodeId]: { position, duration, updatedAt } },
 *     likes: [], favorites: [], lastEpisode: 'ep04'
 *   }
 *
 * 合并原则（避免覆盖 / 避免复活）：
 *   1. progress：本地存在未同步写入（pendingProgress）时，云端不得覆盖；
 *      否则按 updatedAt 取较新的一条。
 *   2. likes / favorites：本地是权威意图。脏条目（dirtyLikes/dirtyFavorites）
 *      保留本地目标状态，非脏条目才采用云端值。
 *      —— 这样「取消收藏」不会被云端旧数据重新复活。
 *   3. lastEpisode：仅当用户本次没有主动选集时才采用云端值。
 *
 * 同步原则：
 *   - 所有云端写入串行执行（同一时刻只有一个 flush 在跑），避免并发双发；
 *   - toggle 携带 desired 布尔，服务端幂等 set，重放不会反转结果；
 *   - 只有「发送时的目标 / 版本」与当前一致时，才清除待同步标记，
 *     否则说明期间用户又改了，必须留到下一轮再发；
 *   - 云端失败不清空本地数据，标记保留，下次连接后重试。
 *
 * 语义区分：
 *   clearProgress()  -> radioApi clearProgress  清「收听进度」
 *   clearQuestions() -> radioApi deleteHistory  清「问答记录」（历史命名遗留）
 */
var cloud = require('./cloud.js')

var STORAGE_STATE = 'saffron_radio_state_v1'
var STORAGE_PENDING = 'saffron_radio_pending_v1'
var STORAGE_DIRTY = 'saffron_radio_dirty_v1'

var DEFAULT_LAST = 'ep04'

var state = {
  progress: {},
  likes: [],
  favorites: [],
  lastEpisode: DEFAULT_LAST
}

// 待同步到云端的进度：episodeId -> {position, duration, updatedAt, v}
var pendingProgress = {}
// 本地权威意图：episodeId -> true|false（期望的成员状态，尚未被云端确认）
var dirtyLikes = {}
var dirtyFavorites = {}

var versionSeq = 0
var lastEpisodeTouched = false
var cloudEnabled = false
var lastCloudPushAt = 0

// 串行化同步：syncRunning 期间新的请求只置位 syncAgain，不并发发起
var syncRunning = false
var syncAgain = false
var syncPromise = null

/* ------------------------------ 基础工具 ------------------------------ */

function has(arr, v) {
  return Array.isArray(arr) && arr.indexOf(v) >= 0
}

function toggleIn(arr, v) {
  var out = Array.isArray(arr) ? arr.slice() : []
  var i = out.indexOf(v)
  if (i >= 0) out.splice(i, 1)
  else out.push(v)
  return out
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
  } catch (e) {
    /* 存储失败不阻塞播放 */
  }
}

function normalize(raw) {
  var s = {
    progress: {},
    likes: [],
    favorites: [],
    lastEpisode: DEFAULT_LAST
  }
  if (!raw || typeof raw !== 'object') return s
  var p = raw.progress || {}
  Object.keys(p).forEach(function (id) {
    var item = p[id]
    if (!item) return
    s.progress[id] = {
      position: Number(item.position) || 0,
      duration: Number(item.duration) || 0,
      updatedAt: Number(item.updatedAt) || 0
    }
  })
  s.likes = (Array.isArray(raw.likes) ? raw.likes : []).filter(Boolean)
  s.favorites = (Array.isArray(raw.favorites) ? raw.favorites : []).filter(Boolean)
  s.lastEpisode = raw.lastEpisode || DEFAULT_LAST
  return s
}

/* ------------------------------ 读写 ------------------------------ */

function load() {
  state = normalize(safeGet(STORAGE_STATE, null))

  pendingProgress = safeGet(STORAGE_PENDING, {}) || {}
  if (typeof pendingProgress !== 'object' || Array.isArray(pendingProgress)) pendingProgress = {}

  // 版本号跨会话保持单调，避免上一轮的旧版本号与新一轮撞车
  versionSeq = 0
  Object.keys(pendingProgress).forEach(function (id) {
    var v = Number(pendingProgress[id] && pendingProgress[id].v) || 0
    if (v > versionSeq) versionSeq = v
  })

  var dirty = safeGet(STORAGE_DIRTY, null)
  dirtyLikes = {}
  dirtyFavorites = {}
  if (dirty && typeof dirty === 'object') {
    if (dirty.likes && typeof dirty.likes === 'object') {
      Object.keys(dirty.likes).forEach(function (id) {
        if (typeof dirty.likes[id] === 'boolean') dirtyLikes[id] = dirty.likes[id]
      })
    }
    if (dirty.favorites && typeof dirty.favorites === 'object') {
      Object.keys(dirty.favorites).forEach(function (id) {
        if (typeof dirty.favorites[id] === 'boolean') dirtyFavorites[id] = dirty.favorites[id]
      })
    }
  }

  return state
}

function persist() {
  safeSet(STORAGE_STATE, state)
}

function persistPending() {
  safeSet(STORAGE_PENDING, pendingProgress)
}

function persistDirty() {
  safeSet(STORAGE_DIRTY, { likes: dirtyLikes, favorites: dirtyFavorites })
}

function get() {
  return state
}

function setCloudEnabled(v) {
  cloudEnabled = !!v
}

function isCloudEnabled() {
  return cloudEnabled
}

function nextVersion() {
  versionSeq += 1
  return versionSeq
}

/* ------------------------------ 合并 ------------------------------ */

/**
 * 用本地权威意图与云端结果求交：
 *   - 脏条目：采用本地目标（用户刚做的操作，云端还不知道）
 *   - 非脏条目：采用云端值
 * 这样「本地取消收藏 + 云端仍有」不会被复活，「云端新增」也能合并进来。
 */
function reconcileList(localArr, serverArr, dirty) {
  var seen = {}
  var out = []

  function consider(id) {
    if (!id || seen[id]) return
    seen[id] = true
    var desired
    if (Object.prototype.hasOwnProperty.call(dirty, id)) {
      desired = dirty[id] === true
    } else {
      desired = serverArr.indexOf(id) >= 0
    }
    if (desired) out.push(id)
  }

  localArr.forEach(consider)
  serverArr.forEach(consider)
  return out
}

/** 把云端返回的 state 合并进本地，绝不覆盖本地未同步的意图 */
function mergeCloud(remote) {
  if (!remote || typeof remote !== 'object') return state

  var merged = normalize(state)

  // progress：本地有未同步写入时保留本地，否则按 updatedAt 取新
  var rp = remote.progress
  if (rp && typeof rp === 'object') {
    Object.keys(rp).forEach(function (id) {
      var r = rp[id]
      if (!r) return
      if (pendingProgress[id]) return
      var ts = Number(r.updatedAt) || 0
      var local = merged.progress[id]
      if (!local || ts >= (Number(local.updatedAt) || 0)) {
        merged.progress[id] = {
          position: Number(r.position) || 0,
          duration: Number(r.duration) || 0,
          updatedAt: ts
        }
      }
    })
  }

  // likes / favorites：本地脏条目优先
  if (Array.isArray(remote.likes)) {
    merged.likes = reconcileList(merged.likes, remote.likes, dirtyLikes)
  }
  if (Array.isArray(remote.favorites)) {
    merged.favorites = reconcileList(merged.favorites, remote.favorites, dirtyFavorites)
  }

  if (remote.lastEpisode && !lastEpisodeTouched) {
    merged.lastEpisode = remote.lastEpisode
  }

  state = merged
  persist()
  return state
}

/** 从状态类响应中取出 state 并合并（login / getState 使用） */
function applyServerState(res) {
  var serverState = cloud.pickState(res)
  if (!serverState) return state
  return mergeCloud(serverState)
}

/* ------------------------------ 进度 ------------------------------ */

function getProgress(episodeId) {
  return state.progress[episodeId] || null
}

function setProgress(episodeId, position, duration, opts) {
  if (!episodeId) return
  var o = opts || {}
  var pos = Math.max(0, Math.floor(Number(position) || 0))
  var dur = Math.max(0, Math.floor(Number(duration) || 0))
  var now = Date.now()

  state.progress[episodeId] = { position: pos, duration: dur, updatedAt: now }
  persist()

  if (o.silent) return

  // 云端 saveProgress 要求 duration > 0 且 position <= duration（含 5s 容差），
  // 音频元数据还没拿到时先只写本地。
  if (dur <= 0) return

  pendingProgress[episodeId] = {
    position: Math.min(pos, dur),
    duration: dur,
    updatedAt: now,
    v: nextVersion()
  }
  persistPending()

  // 云端写入节流：播放中每 15 秒最多一次，暂停 / 结束 / 切集时立即写入
  if (o.force || now - lastCloudPushAt >= 15000) {
    lastCloudPushAt = now
    flush()
  }
}

function deleteProgress(episodeId) {
  if (state.progress[episodeId]) {
    delete state.progress[episodeId]
    persist()
  }
  if (pendingProgress[episodeId]) {
    delete pendingProgress[episodeId]
    persistPending()
  }
}

function getHistory() {
  var list = []
  Object.keys(state.progress).forEach(function (id) {
    var p = state.progress[id]
    list.push({
      episodeId: id,
      position: p.position,
      duration: p.duration,
      updatedAt: p.updatedAt
    })
  })
  list.sort(function (a, b) { return b.updatedAt - a.updatedAt })
  return list
}

/* ------------------------------ 点赞 / 收藏 ------------------------------ */

function isLiked(episodeId) {
  return has(state.likes, episodeId)
}

function isFavorite(episodeId) {
  return has(state.favorites, episodeId)
}

/** 写入目标成员状态；desired 为 true/false，非 toggle */
function setMembership(kind, episodeId, desired) {
  if (!episodeId) return false
  var want = desired === true
  var isLike = kind === 'like'
  var list = isLike ? state.likes : state.favorites
  var dirty = isLike ? dirtyLikes : dirtyFavorites

  if (want === has(list, episodeId)) {
    // 已经一致：仍需记录目标，保证云端最终对齐
    dirty[episodeId] = want
  } else {
    if (isLike) state.likes = toggleIn(state.likes, episodeId)
    else state.favorites = toggleIn(state.favorites, episodeId)
    dirty[episodeId] = want
  }

  persist()
  persistDirty()
  flush()
  return want
}

function toggleLike(episodeId) {
  return setMembership('like', episodeId, !has(state.likes, episodeId))
}

function toggleFavorite(episodeId) {
  return setMembership('favorite', episodeId, !has(state.favorites, episodeId))
}

function setLastEpisode(episodeId) {
  if (!episodeId) return
  state.lastEpisode = episodeId
  lastEpisodeTouched = true
  persist()
}

function getLastEpisode() {
  return state.lastEpisode || DEFAULT_LAST
}

/* ------------------------------ 同步 ------------------------------ */

/**
 * 串行执行一轮同步。所有写入顺序发起，绝不并发。
 * 返回的 Promise 在整个队列清空（含追加轮次）后 resolve。
 */
function flush() {
  if (!cloudEnabled) return Promise.resolve()
  if (syncRunning) {
    syncAgain = true
    return syncPromise || Promise.resolve()
  }

  syncRunning = true
  syncAgain = false

  syncPromise = runSync().then(function () {
    syncRunning = false
    syncPromise = null
    if (syncAgain) {
      syncAgain = false
      return flush()
    }
    return null
  }, function () {
    syncRunning = false
    syncPromise = null
    syncAgain = false
    return null
  })

  return syncPromise
}

function runSync() {
  var steps = []

  // 1) 进度：发送前记录版本，只有版本未变才清除
  Object.keys(pendingProgress).forEach(function (id) {
    var entry = pendingProgress[id]
    if (!entry) return
    var sentVersion = entry.v
    steps.push(function () {
      var current = pendingProgress[id]
      if (!current || current.v !== sentVersion) return Promise.resolve()
      return cloud.call('saveProgress', {
        episodeId: id,
        position: current.position,
        duration: current.duration
      }).then(function () {
        var after = pendingProgress[id]
        if (after && after.v === sentVersion) {
          delete pendingProgress[id]
          persistPending()
        }
      }).catch(function () {
        // 保留待同步标记，下一轮重试
      })
    })
  })

  // 2) 点赞 / 收藏：携带 desired，幂等；目标未变才清除脏标记
  collectToggleSteps('toggleLike', dirtyLikes, steps)
  collectToggleSteps('toggleFavorite', dirtyFavorites, steps)

  // 顺序执行，避免并发双发
  return steps.reduce(function (chain, step) {
    return chain.then(step, step)
  }, Promise.resolve())
}

function collectToggleSteps(action, dirty, steps) {
  Object.keys(dirty).forEach(function (id) {
    var sentDesired = dirty[id]
    steps.push(function () {
      if (!Object.prototype.hasOwnProperty.call(dirty, id) || dirty[id] !== sentDesired) {
        return Promise.resolve()
      }
      return cloud.call(action, { episodeId: id, desired: sentDesired }).then(function () {
        if (Object.prototype.hasOwnProperty.call(dirty, id) && dirty[id] === sentDesired) {
          delete dirty[id]
          persistDirty()
        }
      }).catch(function () {
        // 保留脏标记，下一轮重试
      })
    })
  })
}

/** 等待当前同步轮次结束（用于清空进度等需要「排在写入之后」的操作） */
function waitIdle() {
  return new Promise(function (resolve) {
    function check() {
      if (!syncRunning) {
        resolve()
        return
      }
      var p = syncPromise || Promise.resolve()
      p.then(check, check)
    }
    check()
  })
}

/** 拉取云端 state 并合并（合并后不覆盖本地脏数据） */
function pullState() {
  if (!cloudEnabled) return Promise.reject(new Error('云同步未开启'))
  return waitIdle().then(function () {
    return cloud.call('getState')
  }).then(function (res) {
    var serverState = cloud.pickState(res)
    if (!serverState) throw new Error('云端未返回 state')
    mergeCloud(serverState)
    return flush().then(function () { return state })
  })
}

/* ------------------------------ 清理 ------------------------------ */

/**
 * 清「收听进度」。
 * 对应 radioApi 的 clearProgress（不是 deleteHistory，后者清的是问答记录）。
 * @param {string} [episodeId] 省略则清空全部收听进度
 */
function clearProgress(episodeId) {
  if (episodeId) {
    deleteProgress(episodeId)
  } else {
    state.progress = {}
    pendingProgress = {}
    persist()
    persistPending()
  }

  if (!cloudEnabled) return Promise.resolve({ local: true })

  // 先等本轮的 saveProgress 落地，再发清空，保证顺序
  return waitIdle().then(function () {
    return cloud.call('clearProgress', episodeId ? { episodeId: episodeId } : {})
  }).then(function (res) {
    applyServerState(res)
    return res
  })
}

/**
 * 清「问答记录」。
 * 对应 radioApi 的 deleteHistory —— 名字叫 history，实际删除的是 radio_questions。
 * 本机问答由 utils/questions.js 负责。
 */
function clearQuestions() {
  if (!cloudEnabled) return Promise.resolve({ local: true })
  return waitIdle().then(function () {
    return cloud.call('deleteHistory')
  })
}

function resetLocal() {
  state = normalize(null)
  pendingProgress = {}
  dirtyLikes = {}
  dirtyFavorites = {}
  versionSeq = 0
  lastEpisodeTouched = false
  lastCloudPushAt = 0
  persist()
  persistPending()
  persistDirty()
}

/** 注销账号：清空云端与本地数据 */
function deleteAccount() {
  if (!cloudEnabled) {
    resetLocal()
    return Promise.resolve({ local: true })
  }
  return waitIdle().then(function () {
    return cloud.call('deleteAccount')
  }).then(function (res) {
    resetLocal()
    return res
  })
}

function clearLocal() {
  resetLocal()
}

/* ------------------------------ 测试/调试辅助 ------------------------------ */

function getPendingCount() {
  return Object.keys(pendingProgress).length
}

function getDirty() {
  return { likes: dirtyLikes, favorites: dirtyFavorites }
}

function isSyncing() {
  return syncRunning
}

module.exports = {
  load: load,
  get: get,
  persist: persist,
  setCloudEnabled: setCloudEnabled,
  isCloudEnabled: isCloudEnabled,
  mergeCloud: mergeCloud,
  applyServerState: applyServerState,
  getProgress: getProgress,
  setProgress: setProgress,
  deleteProgress: deleteProgress,
  getHistory: getHistory,
  isLiked: isLiked,
  isFavorite: isFavorite,
  setMembership: setMembership,
  toggleLike: toggleLike,
  toggleFavorite: toggleFavorite,
  setLastEpisode: setLastEpisode,
  getLastEpisode: getLastEpisode,
  flush: flush,
  waitIdle: waitIdle,
  pullState: pullState,
  clearProgress: clearProgress,
  clearQuestions: clearQuestions,
  deleteAccount: deleteAccount,
  clearLocal: clearLocal,
  getPendingCount: getPendingCount,
  getDirty: getDirty,
  isSyncing: isSyncing,
  DEFAULT_LAST: DEFAULT_LAST
}

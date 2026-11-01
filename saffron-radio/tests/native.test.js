'use strict';

/**
 * 原生小程序 <-> 云函数 契约回归测试
 *
 * 运行：node --test tests/
 *
 * 这里用一个「假后端」精确复刻 cloudfunctions/ 下 radioApi 与 radioAsk 的真实契约：
 *   - radioApi  入参 { action, ... }，返回 { ok:true, ...payload }
 *   - radioAsk  入参 { question, episodeId }（无 action）
 *   - 失败统一返回 { ok:false, code, message }
 * 客户端代码在 mock 的 wx 环境下真实加载并执行，因此能捕获集成层的缺陷。
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const MP = path.join(ROOT, 'miniprogram');
const CF = path.join(ROOT, 'cloudfunctions');

/* =========================================================================
 * 假后端：复刻真实云函数契约
 * ========================================================================= */

function applyMembership(list, id, desired) {
  const out = list.slice();
  const i = out.indexOf(id);
  const shouldHave = desired === null || desired === undefined ? i < 0 : desired === true;
  if (shouldHave && i < 0) out.push(id);
  else if (!shouldHave && i >= 0) out.splice(i, 1);
  return out;
}

function createBackend() {
  const state = {
    consent: false,
    progress: {},
    likes: [],
    favorites: [],
    lastEpisode: 'ep04'
  };
  const questions = [];
  const calls = [];

  let inFlight = 0;
  let maxInFlight = 0;
  let delayMs = 0;
  let failAsk = null;
  let neverRespond = false;

  function toState() {
    return {
      progress: JSON.parse(JSON.stringify(state.progress)),
      likes: state.likes.slice(),
      favorites: state.favorites.slice(),
      lastEpisode: state.lastEpisode
    };
  }

  function toQuestion(q) {
    return {
      id: q.id,
      _id: q.id,
      question: q.question,
      answer: q.answer,
      quote: q.quote,
      episodeId: q.episodeId,
      createdAt: q.createdAt,
      saved: q.saved === true
    };
  }

  function handle(name, data, respond) {
    if (name === 'radioAsk') {
      if (failAsk) {
        respond({ ok: false, code: failAsk, message: 'simulated failure' });
        return;
      }
      if (state.consent !== true) {
        respond({ ok: false, code: 'CONSENT_REQUIRED', message: 'Consent is required before asking questions.' });
        return;
      }
      const id = 'qid-' + (questions.length + 1);
      const rec = {
        id,
        question: data.question,
        answer: '云端回答：' + data.question,
        quote: '一句温暖的总结',
        episodeId: data.episodeId,
        createdAt: 1700000000000 + questions.length,
        saved: false
      };
      questions.push(rec);
      respond({
        ok: true,
        answer: rec.answer,
        quote: rec.quote,
        questionId: id,
        episodeId: rec.episodeId,
        createdAt: rec.createdAt,
        remaining: { daily: 9, minute: 4 }
      });
      return;
    }

    if (name !== 'radioApi') {
      respond({ ok: false, code: 'BAD_ACTION', message: 'Unsupported action.' });
      return;
    }

    switch (data.action) {
      case 'login':
        if (typeof data.consent === 'boolean') state.consent = data.consent;
        respond({
          ok: true,
          loggedIn: true,
          profile: { displayName: '', consent: state.consent, createdAt: 0 },
          state: toState()
        });
        return;

      case 'getState':
        respond({ ok: true, state: toState() });
        return;

      case 'saveProgress':
        if (!(data.duration > 0) || !(data.position >= 0) || data.position > data.duration + 5) {
          respond({ ok: false, code: 'BAD_INPUT', message: 'position/duration invalid.' });
          return;
        }
        state.progress[data.episodeId] = {
          position: data.position,
          duration: data.duration,
          updatedAt: Date.now()
        };
        state.lastEpisode = data.episodeId;
        respond({ ok: true, state: toState() });
        return;

      case 'toggleLike':
        state.likes = applyMembership(state.likes, data.episodeId, data.desired);
        respond({ ok: true, state: toState() });
        return;

      case 'toggleFavorite':
        state.favorites = applyMembership(state.favorites, data.episodeId, data.desired);
        respond({ ok: true, state: toState() });
        return;

      case 'clearProgress':
        if (data.episodeId) delete state.progress[data.episodeId];
        else state.progress = {};
        respond({ ok: true, cleared: true, episodeId: data.episodeId || null, state: toState() });
        return;

      case 'deleteHistory': {
        const n = questions.length;
        questions.length = 0;
        respond({ ok: true, deleted: true, questionsRemoved: n });
        return;
      }

      case 'listQuestions':
        respond({
          ok: true,
          questions: questions.map(toQuestion),
          hasMore: false,
          cursor: null
        });
        return;

      case 'toggleQuote': {
        const q = questions.find((x) => x.id === data.questionId);
        if (!q) {
          respond({ ok: false, code: 'NOT_FOUND', message: 'Question not found.' });
          return;
        }
        q.saved = q.saved !== true;
        respond({ ok: true, saved: q.saved });
        return;
      }

      case 'deleteAccount':
        state.progress = {};
        state.likes = [];
        state.favorites = [];
        questions.length = 0;
        respond({ ok: true, deleted: true, questionsRemoved: 0, userRemoved: true });
        return;

      default:
        respond({ ok: false, code: 'BAD_ACTION', message: 'Unsupported action.' });
    }
  }

  return {
    calls,
    state,
    questions,
    get maxInFlight() { return maxInFlight; },
    setDelay(ms) { delayMs = ms; },
    setFailAsk(code) { failAsk = code; },
    setNeverRespond(v) { neverRespond = v; },
    callFunction(req) {
      calls.push({ name: req.name, data: JSON.parse(JSON.stringify(req.data)) });
      inFlight += 1;
      if (inFlight > maxInFlight) maxInFlight = inFlight;

      const respond = (payload) => {
        setTimeout(() => {
          inFlight -= 1;
          req.success({ result: payload });
        }, delayMs);
      };

      if (neverRespond) return;
      setTimeout(() => handle(req.name, req.data, respond), delayMs);
    }
  };
}

/* =========================================================================
 * wx 运行时 mock
 * ========================================================================= */

function makeAudioManager() {
  const h = {};
  const mgr = {
    src: '', title: '', currentTime: 0, duration: 0,
    onPlay: (f) => { h.play = f; },
    onPause: (f) => { h.pause = f; },
    onStop: (f) => { h.stop = f; },
    onEnded: (f) => { h.ended = f; },
    onTimeUpdate: (f) => { h.time = f; },
    onError: (f) => { h.err = f; },
    onCanplay: (f) => { h.canplay = f; },
    onWaiting: (f) => { h.wait = f; },
    onSeeked: (f) => { h.seeked = f; },
    play() { h.play && h.play(); },
    pause() { h.pause && h.pause(); },
    stop() { h.stop && h.stop(); },
    seek() {}
  };
  return mgr;
}

function installWx(backend) {
  const storage = {};
  const bgm = makeAudioManager();
  const inner = makeAudioManager();

  global.wx = {
    getStorageSync: (k) => (k in storage ? JSON.parse(JSON.stringify(storage[k])) : ''),
    setStorageSync: (k, v) => { storage[k] = JSON.parse(JSON.stringify(v)); },
    removeStorageSync: (k) => { delete storage[k]; },

    getBackgroundAudioManager: () => bgm,
    createInnerAudioContext: () => inner,

    showToast: () => {},
    showLoading: () => {},
    hideLoading: () => {},
    showModal: () => {},
    pageScrollTo: () => {},
    requirePrivacyAuthorize: (o) => { if (o && o.success) o.success({}); },
    getSetting: (o) => { if (o && o.success) o.success({ authSetting: {} }); },
    authorize: (o) => { if (o && o.success) o.success({}); },
    openSetting: (o) => { if (o && o.success) o.success({ authSetting: {} }); },

    cloud: {
      init: () => {},
      callFunction: backend.callFunction
    }
  };

  return { storage, bgm, inner };
}

/** 清空 miniprogram 的 require 缓存，保证每个用例都是干净状态 */
function purge() {
  Object.keys(require.cache).forEach((k) => {
    if (k.startsWith(MP + path.sep)) delete require.cache[k];
  });
}

function setup(options) {
  const opts = options || {};
  const backend = createBackend();
  if (opts.delay) backend.setDelay(opts.delay);
  const wxEnv = installWx(backend);
  purge();

  const mods = {
    config: require(path.join(MP, 'config.js')),
    cloud: require(path.join(MP, 'utils', 'cloud.js')),
    store: require(path.join(MP, 'utils', 'store.js')),
    questions: require(path.join(MP, 'utils', 'questions.js')),
    canvasCard: require(path.join(MP, 'utils', 'canvasCard.js')),
    episodes: require(path.join(MP, 'data', 'episodes.js')),
    audio: require(path.join(MP, 'utils', 'audio.js')),
    privacy: require(path.join(MP, 'utils', 'privacy.js')),
    fmt: require(path.join(MP, 'utils', 'format.js'))
  };

  mods.config.cloudEnv = 'test-env';
  mods.cloud.init();
  mods.store.load();

  return Object.assign({ backend, wxEnv }, mods);
}

function loadApp() {
  let instance = null;
  global.App = (obj) => { instance = obj; };
  const p = path.join(MP, 'app.js');
  delete require.cache[require.resolve(p)];
  require(p);
  return instance;
}

function makeCtx() {
  const calls = [];
  let fontSize = 16;
  return {
    calls,
    setFontSize(n) { fontSize = n; calls.push(['setFontSize', n]); },
    measureText(s) { return { width: String(s).length * fontSize }; },
    setFillStyle(c) { calls.push(['setFillStyle', c]); },
    setStrokeStyle(c) { calls.push(['setStrokeStyle', c]); },
    setLineWidth(n) { calls.push(['setLineWidth', n]); },
    setTextAlign(a) { calls.push(['setTextAlign', a]); },
    fillText(t, x, y) { calls.push(['fillText', t, x, y]); },
    fillRect(...a) { calls.push(['fillRect', ...a]); },
    strokeRect(...a) { calls.push(['strokeRect', ...a]); },
    beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    draw(reserve, cb) { if (cb) cb(); }
  };
}

function stripNewlines(s) {
  return String(s).replace(/\n/g, '');
}

/* =========================================================================
 * 1. 云函数路由与错误契约
 * ========================================================================= */

test('radioAsk 走独立云函数且不带 action', async () => {
  const { cloud, backend } = setup();
  backend.state.consent = true; // 真实 radioAsk 要求服务端已记录 consent
  await cloud.ask('产地在哪里', 'ep02');

  const call = backend.calls[backend.calls.length - 1];
  assert.equal(call.name, 'radioAsk', '提问必须调用 radioAsk 云函数');
  assert.deepEqual(Object.keys(call.data).sort(), ['episodeId', 'question']);
  assert.equal(call.data.action, undefined, 'radioAsk 入参不能带 action');
  assert.equal(call.data.question, '产地在哪里');
  assert.equal(call.data.episodeId, 'ep02');
});

test('状态类 action 走 radioApi 且带 action', async () => {
  const { cloud, backend } = setup();
  await cloud.call('getState');

  const call = backend.calls[backend.calls.length - 1];
  assert.equal(call.name, 'radioApi');
  assert.equal(call.data.action, 'getState');
});

test('未知 action 在本地直接拒绝，不发网络请求', async () => {
  const { cloud, backend } = setup();
  const before = backend.calls.length;
  await assert.rejects(() => cloud.call('notARealAction'), (e) => e.code === 'BAD_ACTION');
  assert.equal(backend.calls.length, before, '不应产生任何云调用');
});

test('服务端 code 原样保留在 Error.code 上', async () => {
  const { cloud, backend } = setup();
  backend.setFailAsk('RATE_LIMITED');
  await assert.rejects(
    () => cloud.ask('随便问问', 'ep01'),
    (e) => e.code === 'RATE_LIMITED' && e.raw && e.raw.ok === false
  );
});

test('BAD_INPUT 等 radioApi 错误码同样保留', async () => {
  const { cloud, backend } = setup();
  backend.setDelay(0);
  // duration=0 会被服务端判为 BAD_INPUT
  await assert.rejects(
    () => cloud.call('saveProgress', { episodeId: 'ep01', position: 1, duration: 0 }),
    (e) => e.code === 'BAD_INPUT'
  );
});

test('客户端超时可配置，超时后不再接受迟到结果', async () => {
  const { cloud, config, backend } = setup();
  backend.setNeverRespond(true);
  const original = config.askTimeoutMs;
  config.askTimeoutMs = 40;

  const started = Date.now();
  await assert.rejects(() => cloud.ask('会超时的问题', 'ep01'), (e) => e.code === 'CLIENT_TIMEOUT');
  assert.ok(Date.now() - started >= 30, '应当等待到超时时间');

  config.askTimeoutMs = original;
  backend.setNeverRespond(false);
});

/* =========================================================================
 * 2. 登录 / 会话 / 同步开关
 * ========================================================================= */

test('login 必须携带 consent:true，并合并响应里的 state', async () => {
  const env = setup();
  const backend = env.backend;

  backend.state.likes = ['ep01'];
  backend.state.favorites = ['ep02'];
  backend.state.progress = { ep03: { position: 30, duration: 600, updatedAt: 1 } };

  const app = loadApp();
  app.onLaunch();
  app.acceptPrivacy();

  await app.login();

  const loginCall = backend.calls.find((c) => c.data.action === 'login');
  assert.ok(loginCall, '必须调用 login');
  assert.equal(loginCall.data.consent, true, 'login 必须带 consent:true');

  const state = env.store.get();
  assert.deepEqual(state.likes, ['ep01'], 'login 返回的 state 必须被合并');
  assert.deepEqual(state.favorites, ['ep02']);
  assert.equal(state.progress.ep03.position, 30);
  assert.equal(app.globalData.loggedIn, true);
});

test('配置了 cloudEnv 不代表已登录：onLaunch 不会自动登录', async () => {
  const { backend } = setup();
  const app = loadApp();
  app.onLaunch();

  assert.equal(app.globalData.cloudConfigured, true, 'cloudEnv 已配置');
  assert.equal(app.globalData.loggedIn, false, '但不应视为已登录');
  assert.equal(app.globalData.loginState, 'guest');
  assert.equal(backend.calls.length, 0, 'onLaunch 不应发起任何云调用');
});

test('同意隐私但未登录时，云同步保持关闭', async () => {
  const env = setup();
  const app = loadApp();
  app.onLaunch();
  app.acceptPrivacy();

  assert.equal(env.store.isCloudEnabled(), false, '未登录不得开启同步');

  env.store.toggleLike('ep04');
  await env.store.flush();
  assert.equal(env.backend.calls.length, 0, '未登录时 flush 不应发请求');
  assert.deepEqual(env.store.get().likes, ['ep04'], '本地意图必须保留');
});

test('登录后才开启同步，并把本地离线意图补发到云端', async () => {
  const env = setup();
  const app = loadApp();
  app.onLaunch();
  app.acceptPrivacy();

  env.store.toggleFavorite('ep02'); // 离线期间的操作
  await app.login();

  assert.equal(env.store.isCloudEnabled(), true);
  assert.deepEqual(env.backend.state.favorites, ['ep02'], '离线收藏必须补发');
  assert.deepEqual(env.store.getDirty().favorites, {}, '同步成功后脏标记应清除');
});

test('onLaunch 只在「已同意 + 曾登录」时静默恢复会话', async () => {
  const env = setup();
  const app = loadApp();
  app.onLaunch();
  app.acceptPrivacy();
  await app.login();
  assert.equal(app.globalData.loggedIn, true);

  const before = env.backend.calls.filter((c) => c.data.action === 'login').length;
  app.onLaunch();
  await new Promise((r) => setTimeout(r, 20));

  const after = env.backend.calls.filter((c) => c.data.action === 'login').length;
  assert.equal(after, before + 1, '已登录过才允许 onLaunch 静默恢复');
  assert.equal(app.globalData.loggedIn, true);
});

test('退出登录会关闭同步但保留本机数据', async () => {
  const env = setup();
  const app = loadApp();
  app.onLaunch();
  app.acceptPrivacy();
  await app.login();

  env.store.toggleLike('ep01');
  await env.store.flush();
  app.logout();

  assert.equal(env.store.isCloudEnabled(), false);
  assert.equal(app.globalData.loggedIn, false);
  assert.deepEqual(env.store.get().likes, ['ep01'], '本机数据保留');
});

/* =========================================================================
 * 3. 合并语义：取消收藏不能被复活
 * ========================================================================= */

test('云端旧数据不会复活已被本地取消的收藏', async () => {
  const env = setup();
  const { store, backend } = env;

  backend.state.favorites = ['ep01'];
  store.setCloudEnabled(true);
  await store.pullState();
  assert.deepEqual(store.get().favorites, ['ep01'], '先同步到本地');

  store.toggleFavorite('ep01'); // 本地取消
  assert.deepEqual(store.get().favorites, []);

  // 云端此刻仍然有 ep01（写入还没到）
  store.mergeCloud({
    progress: {},
    likes: [],
    favorites: ['ep01'],
    lastEpisode: 'ep04'
  });
  assert.deepEqual(store.get().favorites, [], '取消收藏不能被云端结果复活');

  await store.flush();
  assert.deepEqual(backend.state.favorites, [], '最终必须把取消同步到云端');
  assert.deepEqual(store.getDirty().favorites, {});
});

test('云端新增的收藏会被合并进来', async () => {
  const env = setup();
  const { store } = env;
  store.setCloudEnabled(true);

  store.mergeCloud({ progress: {}, likes: ['ep03'], favorites: [], lastEpisode: 'ep01' });
  assert.deepEqual(store.get().likes, ['ep03']);
  assert.equal(store.get().lastEpisode, 'ep01');
});

test('用户主动选集后，云端 lastEpisode 不覆盖本地', () => {
  const env = setup();
  const { store } = env;
  store.setLastEpisode('ep03');
  store.mergeCloud({ progress: {}, likes: [], favorites: [], lastEpisode: 'ep01' });
  assert.equal(store.get().lastEpisode, 'ep03');
});

test('本地有未同步进度时，云端不得覆盖该期进度', () => {
  const env = setup();
  const { store } = env;
  store.setCloudEnabled(true);
  store.setProgress('ep04', 500, 1080); // 产生 pending

  store.mergeCloud({
    progress: { ep04: { position: 10, duration: 1080, updatedAt: Date.now() + 10000 } },
    likes: [],
    favorites: [],
    lastEpisode: 'ep04'
  });
  assert.equal(store.getProgress('ep04').position, 500, 'pending 期间本地进度优先');
});

/* =========================================================================
 * 4. 同步：desired 幂等、串行、版本匹配
 * ========================================================================= */

test('toggle 携带 desired 布尔，服务端按目标状态幂等写入', async () => {
  const env = setup();
  const { store, backend } = env;
  store.setCloudEnabled(true);

  store.setMembership('favorite', 'ep01', true);
  await store.flush();

  const addCall = backend.calls.find((c) => c.data.action === 'toggleFavorite');
  assert.equal(addCall.data.desired, true, '新增必须显式 desired:true');
  assert.deepEqual(backend.state.favorites, ['ep01']);

  // 重放同一请求（模拟重试）不应把结果反转
  await env.cloud.call('toggleFavorite', { episodeId: 'ep01', desired: true });
  assert.deepEqual(backend.state.favorites, ['ep01'], 'desired:true 重放必须幂等');

  store.setMembership('favorite', 'ep01', false);
  await store.flush();
  assert.deepEqual(backend.state.favorites, []);
  await env.cloud.call('toggleFavorite', { episodeId: 'ep01', desired: false });
  assert.deepEqual(backend.state.favorites, [], 'desired:false 重放必须幂等');
});

test('同步串行执行，绝不并发双发', async () => {
  const env = setup({ delay: 15 });
  const { store, backend } = env;
  store.setCloudEnabled(true);

  store.toggleLike('ep01');
  store.toggleLike('ep02');
  store.toggleFavorite('ep03');
  store.setProgress('ep04', 12, 1080, { force: true });

  await Promise.all([store.flush(), store.flush(), store.flush()]);

  assert.equal(backend.maxInFlight, 1, '同一时刻只能有一个云调用在飞');
  assert.deepEqual(backend.state.likes.slice().sort(), ['ep01', 'ep02']);
  assert.deepEqual(backend.state.favorites, ['ep03']);
  assert.equal(backend.state.progress.ep04.position, 12);
});

test('进度只在版本匹配时才清除，中途更新不会丢', async () => {
  const env = setup({ delay: 25 });
  const { store, backend } = env;
  store.setCloudEnabled(true);

  store.setProgress('ep04', 10, 1080, { force: true });
  assert.equal(store.getPendingCount(), 1, '写入后应进入待同步队列');

  // 第一次请求还在飞，用户又拖了进度
  store.setProgress('ep04', 640, 1080, { force: true });
  assert.equal(store.getPendingCount(), 1);

  await store.flush();

  assert.equal(store.getPendingCount(), 0, '全部同步完成后队列应清空');
  assert.equal(backend.state.progress.ep04.position, 640, '最新进度不能被旧响应清掉');
});

test('duration 未知时只写本地，不向云端发无效请求', async () => {
  const env = setup();
  const { store, backend } = env;
  store.setCloudEnabled(true);

  store.setProgress('ep04', 12, 0, { force: true });
  await store.flush();

  assert.equal(store.getProgress('ep04').position, 12, '本地仍然记录');
  assert.equal(backend.calls.length, 0, 'duration<=0 不应发 saveProgress');
  assert.equal(store.getPendingCount(), 0);
});

test('云端失败时保留待同步数据，下次重试', async () => {
  const env = setup();
  const { store, backend } = env;
  store.setCloudEnabled(true);

  // 让第一次 toggleLike 失败
  let failedOnce = false;
  const realCall = backend.callFunction.bind(backend);
  global.wx.cloud.callFunction = (req) => {
    if (!failedOnce && req.data && req.data.action === 'toggleLike') {
      failedOnce = true;
      setTimeout(() => req.success({ result: { ok: false, code: 'INTERNAL', message: 'boom' } }), 0);
      return;
    }
    realCall(req);
  };

  store.toggleLike('ep01');
  // 只等这一轮跑完。注意：这里不能再用 flush() 等待，
  // 因为 syncRunning 期间调用 flush 会置 syncAgain，从而在同一次 await 内触发重试。
  await store.waitIdle();

  assert.equal(failedOnce, true, '第一次必须真的失败过');
  assert.deepEqual(store.getDirty().likes, { ep01: true }, '失败必须保留脏标记');
  assert.ok(store.get().likes.indexOf('ep01') >= 0, '本地意图必须保留');
  assert.equal(store.getPendingCount(), 0, '失败的是 toggle，不涉及进度队列');

  global.wx.cloud.callFunction = backend.callFunction;
  await store.flush();
  assert.deepEqual(backend.state.likes, ['ep01'], '重试后写入成功');
  assert.deepEqual(store.getDirty().likes, {}, '成功后才清除脏标记');
});

/* =========================================================================
 * 5. clearProgress / deleteHistory 语义区分
 * ========================================================================= */

test('清收听进度用 clearProgress，不是 deleteHistory', async () => {
  const env = setup();
  const { store, backend } = env;
  store.setCloudEnabled(true);

  store.setProgress('ep04', 100, 1080, { force: true });
  await store.flush();
  backend.questions.push({ id: 'qid-1', question: 'q', answer: 'a', quote: '', episodeId: 'ep04', createdAt: 1, saved: false });

  await store.clearProgress('ep04');

  const actions = backend.calls.map((c) => c.data.action);
  assert.ok(actions.includes('clearProgress'), '必须调用 clearProgress');
  assert.ok(!actions.includes('deleteHistory'), '清收听进度不能调用 deleteHistory');
  assert.equal(backend.state.progress.ep04, undefined, '云端进度应被删除');
  assert.equal(backend.questions.length, 1, '问答记录不受影响');
});

test('清空全部收听进度保留收藏与点赞', async () => {
  const env = setup();
  const { store, backend } = env;
  store.setCloudEnabled(true);

  store.setProgress('ep01', 10, 600, { force: true });
  store.setProgress('ep02', 20, 600, { force: true });
  store.toggleFavorite('ep01');
  await store.flush();

  await store.clearProgress();

  assert.deepEqual(backend.state.progress, {}, '进度应清空');
  assert.deepEqual(backend.state.favorites, ['ep01'], '收藏必须保留');
  assert.deepEqual(store.getHistory(), []);
});

test('清问答记录才用 deleteHistory（服务端语义为清 radio_questions）', async () => {
  const env = setup();
  const { store, backend } = env;
  store.setCloudEnabled(true);

  backend.questions.push({ id: 'qid-1', question: 'q', answer: 'a', quote: '', episodeId: 'ep04', createdAt: 1, saved: false });
  await store.clearQuestions();

  const actions = backend.calls.map((c) => c.data.action);
  assert.ok(actions.includes('deleteHistory'));
  assert.equal(backend.questions.length, 0, '问答应被清空');
});

/* =========================================================================
 * 6. 问答库：稳定本地 id / saved 映射
 * ========================================================================= */

test('本地回答拿到稳定 id，刷新后依然能收藏', () => {
  const env = setup();
  const { questions } = env;

  const id = questions.newId();
  assert.match(id, /^[A-Za-z0-9_-]+$/, 'id 必须符合服务端 questionId 字符集');

  questions.upsert({ id, question: '本地问题', answer: '本地回答', quote: '金句', episodeId: 'ep04', createdAt: 1, source: 'local' });
  assert.equal(questions.get(id).saved, false);

  questions.setSaved(id, true);
  assert.equal(questions.isSaved(id), true);
  assert.equal(questions.get(id).question, '本地问题', '重新读取仍然能对应同一条');
  assert.equal(questions.savedList().length, 1);
});

test('云端 listQuestions 的 saved 字段被正确映射', () => {
  const env = setup();
  const { questions } = env;

  questions.mergeCloudQuestions([
    { id: 'qid-9', _id: 'qid-9', question: '云问题', answer: '云回答', quote: '云金句', episodeId: 'ep02', createdAt: 123, saved: true }
  ]);

  const rec = questions.get('qid-9');
  assert.ok(rec, '云端记录必须入库');
  assert.equal(rec.saved, true, 'saved 必须映射为收藏');
  assert.equal(rec.source, 'cloud');
  assert.equal(questions.savedList().length, 1);
});

test('云端合并不会把本地刚改的收藏状态覆盖回去', () => {
  const env = setup();
  const { questions } = env;

  questions.upsert({ id: 'qid-9', question: 'q', answer: 'a', quote: '', episodeId: 'ep02', createdAt: 1, source: 'cloud' });
  questions.setSaved('qid-9', true);

  questions.mergeCloudQuestions([
    { id: 'qid-9', question: 'q', answer: 'a', quote: '', episodeId: 'ep02', createdAt: 1, saved: false }
  ]);
  assert.equal(questions.get('qid-9').saved, true, '本地已收藏不能被云端旧值覆盖');
});

test('radioAsk 返回 questionId 时用服务端 id 落库', async () => {
  const env = setup();
  const { cloud, questions } = env;
  env.backend.state.consent = true;

  const res = await cloud.ask('藏红花的产地', 'ep04');
  assert.ok(res.questionId, '必须使用 questionId 字段');
  assert.equal(res.id, undefined, 'radioAsk 不返回 id 字段');

  questions.upsert({
    id: res.questionId,
    question: '藏红花的产地',
    answer: res.answer,
    quote: res.quote,
    episodeId: res.episodeId,
    createdAt: res.createdAt,
    source: 'cloud'
  });
  assert.ok(questions.get(res.questionId));
});

/* =========================================================================
 * 7. 金句卡：完整问答 + 动态高度 + 不裁切
 * ========================================================================= */

test('金句卡排版包含问题、回答、金句三段', () => {
  const env = setup();
  const ctx = makeCtx();
  const question = '藏红花的产地为什么集中在高海拔谷地？';
  const answer = '高海拔带来昼夜温差与晨雾，形成独特的微气候带。';
  const quote = '颜色是线索，不是证据。';

  const plan = env.canvasCard.buildPlan(ctx, { question, answer, quote, episodeTitle: '雪峰与晨雾' }, 28);

  assert.equal(stripNewlines(plan.blocks.question.lines.join('')), question, '问题必须完整保留');
  assert.equal(stripNewlines(plan.blocks.answer.lines.join('')), answer, '回答必须完整保留');
  assert.equal(stripNewlines(plan.quote.lines.join('')), quote, '金句必须完整保留');
  assert.ok(plan.height > 0);
});

test('长回答换行后不截断，高度随内容增长', () => {
  const env = setup();
  const ctx = makeCtx();

  const short = '短回答。';
  const long = '这是一段很长的回答。'.repeat(60);

  const shortPlan = env.canvasCard.buildPlan(ctx, { question: 'q', answer: short, quote: 'g' }, 28);
  const longPlan = env.canvasCard.buildPlan(ctx, { question: 'q', answer: long, quote: 'g' }, 28);

  assert.ok(longPlan.blocks.answer.lines.length > shortPlan.blocks.answer.lines.length);
  assert.ok(longPlan.height > shortPlan.height, '高度必须动态增长');
  assert.equal(
    stripNewlines(longPlan.blocks.answer.lines.join('')),
    long,
    '长回答必须一字不少地换行，不能截断'
  );
});

test('最坏输入（问题 500 + 回答 800）会自动缩小字号并落在画布上限内', () => {
  const env = setup();
  const ctx = makeCtx();
  // 取客户端自身的输入上限作为「最坏情况」，保证真实可达的内容一定放得下
  const question = '关于产地与工艺的追问，'.repeat(60).slice(0, 500);
  const answer = '高海拔谷地的昼夜温差与晨雾，共同塑造了独特的微气候。'.repeat(60).slice(0, 800);
  const quote = '颜色是线索，不是证据。';

  assert.equal(question.length, 500);
  assert.equal(answer.length, 800);

  const plan = env.canvasCard.buildPlanFitted(ctx, { question, answer, quote });

  assert.ok(plan.answerFont < 28, '应当缩小回答字号');
  assert.ok(plan.height <= env.canvasCard.MAX_H, '必须落在画布上限之内');
  assert.equal(stripNewlines(plan.blocks.question.lines.join('')), question, '问题不能丢字');
  assert.equal(stripNewlines(plan.blocks.answer.lines.join('')), answer, '回答不能丢字');
  assert.equal(stripNewlines(plan.quote.lines.join('')), quote, '金句不能丢字');
});

test('极端超长内容也不截断（字号触底仍保留全部文本）', () => {
  const env = setup();
  const ctx = makeCtx();
  const veryLong = '很长的回答内容。'.repeat(400);

  const plan = env.canvasCard.buildPlanFitted(ctx, { question: '问题', answer: veryLong, quote: '金句' });

  assert.ok(plan.answerFont <= 22, '字号应触底到最小档');
  // 「多行不裁切」的核心保证：换行只是分行，绝不丢字。
  assert.equal(
    stripNewlines(plan.blocks.answer.lines.join('')),
    veryLong,
    '换行后必须一字不少，不能截断'
  );
});

test('绘制会输出问题、回答、金句的全部文本', () => {
  const env = setup();
  const ctx = makeCtx();
  const opts = { question: '问一句', answer: '答一句', quote: '金句一句', episodeTitle: '某期' };
  const plan = env.canvasCard.buildPlan(ctx, opts, 28);

  env.canvasCard.paint(ctx, plan, opts);

  const texts = ctx.calls.filter((c) => c[0] === 'fillText').map((c) => c[1]);
  assert.ok(texts.includes('问一句'));
  assert.ok(texts.includes('答一句'));
  assert.ok(texts.includes('金句一句'));
});

/* =========================================================================
 * 8. 与云函数的静态契约一致性
 * ========================================================================= */

test('客户端的节目列表与 radioApi 白名单一致', () => {
  const env = setup();
  const serverV = require(path.join(CF, 'radioApi', 'lib', 'validate.js'));
  const askV = require(path.join(CF, 'radioAsk', 'lib', 'validate.js'));

  const clientIds = env.episodes.list.map((e) => e.id).sort();
  assert.deepEqual(clientIds, serverV.EPISODES.slice().sort());
  assert.deepEqual(clientIds, askV.EPISODES.slice().sort());
  assert.ok(clientIds.includes(env.episodes.featuredId), '默认期数必须在白名单内');
});

test('客户端提问长度上限不超过服务端限制', () => {
  const env = setup();
  const serverV = require(path.join(CF, 'radioApi', 'lib', 'validate.js'));
  const askV = require(path.join(CF, 'radioAsk', 'lib', 'validate.js'));

  assert.ok(env.config.questionMaxLength <= serverV.LIMITS.QUESTION_MAX);
  assert.ok(env.config.questionMaxLength <= askV.LIMITS.QUESTION_MAX);
});

test('radioAsk 需要 consent，未同意时云端拒绝', async () => {
  const env = setup();
  const { cloud } = env;
  env.backend.state.consent = false;
  await assert.rejects(() => cloud.ask('未同意就提问', 'ep04'), (e) => e.code === 'CONSENT_REQUIRED');
});

test('客户端默认期数为 ep04 且在白名单内', () => {
  const env = setup();
  assert.equal(env.episodes.featuredId, 'ep04');
  assert.ok(env.episodes.byId('ep04'));
  assert.equal(env.store.DEFAULT_LAST, 'ep04');
});

/* =========================================================================
 * 9. 云端 radioApi 契约单测（真实源码）
 * ========================================================================= */

test('radioApi 的 applyMembership 与客户端期望一致', () => {
  const { applyMembership: serverApply } = require(path.join(CF, 'radioApi', 'lib', 'membership.js'));

  const cases = [
    [[], 'ep01', true, ['ep01']],
    [['ep01'], 'ep01', true, ['ep01']],
    [['ep01'], 'ep01', false, []],
    [['ep01'], 'ep02', false, ['ep01']],
    [[], 'ep01', null, ['ep01']],
    [['ep01'], 'ep01', null, []]
  ];
  cases.forEach(([list, id, desired, expected]) => {
    assert.deepEqual(serverApply(list, id, desired), expected);
    assert.deepEqual(applyMembership(list, id, desired), expected, '假后端必须与真实实现一致');
  });
});

test('radioApi 支持 clearProgress 动作且 validate 暴露 optionalBoolean', () => {
  const src = fs.readFileSync(path.join(CF, 'radioApi', 'index.js'), 'utf8');
  assert.ok(src.includes('clearProgress:'), 'radioApi 必须注册 clearProgress');
  assert.ok(src.includes('optionalBoolean'), 'toggle 必须校验 desired');

  const V = require(path.join(CF, 'radioApi', 'lib', 'validate.js'));
  assert.equal(V.optionalBoolean(true), true);
  assert.equal(V.optionalBoolean(undefined), null);
  assert.throws(() => V.optionalBoolean('yes'), (e) => e.code === 'BAD_INPUT');
});

/* =========================================================================
 * 10. 静态完整性：可编译性（JS 语法 / JSON / WXML / WXSS / 绑定）
 * ========================================================================= */

function walkFiles(dir, out) {
  out = out || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walkFiles(p, out);
    else out.push(p);
  });
  return out;
}

const ALL_FILES = walkFiles(MP);

test('所有 JS 文件语法正确', () => {
  const js = ALL_FILES.filter((f) => f.endsWith('.js'));
  assert.ok(js.length >= 10, '应当扫描到小程序 JS 文件');
  js.forEach((f) => {
    const src = fs.readFileSync(f, 'utf8');
    assert.doesNotThrow(() => new vm.Script(src, { filename: f }), path.relative(MP, f));
  });
});

test('所有 JSON 文件可解析', () => {
  ALL_FILES.filter((f) => f.endsWith('.json')).forEach((f) => {
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(f, 'utf8')), path.relative(MP, f));
  });
});

test('所有 WXML 标签闭合正确', () => {
  ALL_FILES.filter((f) => f.endsWith('.wxml')).forEach((f) => {
    // {{ }} 表达式内可能出现 < > 等字符，先折叠；wx:else 是无值布尔属性，补成 kv 以便解析
    const src = fs
      .readFileSync(f, 'utf8')
      .replace(/\{\{[\s\S]*?\}\}/g, 'EXPR')
      .replace(/\bwx:else(?=[\s/>])/g, 'wx_else="1"');
    const stack = [];
    const re = /<\/?([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
    let m;
    while ((m = re.exec(src))) {
      const raw = m[0];
      const tag = m[1];
      if (raw.startsWith('</')) {
        assert.ok(stack.length, `${path.relative(MP, f)}: 多余的闭合标签 </${tag}>`);
        assert.equal(stack.pop(), tag, `${path.relative(MP, f)}: 标签不匹配 </${tag}>`);
      } else if (m[3] !== '/') {
        stack.push(tag);
      }
    }
    assert.deepEqual(stack, [], `${path.relative(MP, f)}: 存在未闭合标签`);
  });
});

test('所有 WXSS 花括号平衡', () => {
  ALL_FILES.filter((f) => f.endsWith('.wxss')).forEach((f) => {
    const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    let depth = 0;
    for (const ch of src) {
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
    }
    assert.equal(depth, 0, `${path.relative(MP, f)}: 花括号不平衡`);
  });
});

test('WXML 事件绑定的处理函数都在 JS 中定义', () => {
  ALL_FILES.filter((f) => f.endsWith('.wxml')).forEach((wxml) => {
    const jsPath = path.join(path.dirname(wxml), path.basename(wxml, '.wxml') + '.js');
    if (!fs.existsSync(jsPath)) return;
    const js = fs.readFileSync(jsPath, 'utf8');
    const src = fs.readFileSync(wxml, 'utf8');

    const defined = new Set();
    let m;
    [
      /\b([A-Za-z_$][\w$]*)\s*:\s*function/g,
      /\b([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g,
      /\b([A-Za-z_$][\w$]*)\s*:\s*\([^)]*\)\s*=>/g
    ].forEach((re) => {
      while ((m = re.exec(js))) defined.add(m[1]);
    });

    const bindRe = /\b(?:bind|catch|capture-bind|capture-catch)[:]?([A-Za-z]+)\s*=\s*"([^"]*)"/g;
    while ((m = bindRe.exec(src))) {
      const handler = m[2].trim();
      if (!handler) continue;
      const root = handler.split('(')[0].trim();
      assert.ok(defined.has(root), `${path.relative(MP, wxml)}: 事件处理函数 "${handler}" 未定义`);
    }
  });
});

test('WXML 数据绑定的根标识符都来自 data 或循环别名', () => {
  const BUILTIN = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Math', 'Date', 'JSON']);

  ALL_FILES.filter((f) => f.endsWith('.wxml')).forEach((wxml) => {
    const jsPath = path.join(path.dirname(wxml), path.basename(wxml, '.wxml') + '.js');
    if (!fs.existsSync(jsPath)) return;
    const js = fs.readFileSync(jsPath, 'utf8');
    const src = fs.readFileSync(wxml, 'utf8');
    const known = new Set(['item', 'index']);

    const dm = js.match(/data\s*:\s*\{/);
    if (dm) {
      const start = js.indexOf('{', dm.index);
      let depth = 0;
      let end = start;
      for (let i = start; i < js.length; i++) {
        if (js[i] === '{') depth += 1;
        else if (js[i] === '}') { depth -= 1; if (depth === 0) { end = i; break; } }
      }
      const block = js.slice(start + 1, end);
      let km;
      const keyRe = /(?:^|[\s,{])([A-Za-z_$][\w$]*)\s*:/g;
      while ((km = keyRe.exec(block))) known.add(km[1]);
    }

    let sm;
    const setRe = /setData\s*\(\s*\{([\s\S]*?)\}\s*[,)]/g;
    while ((sm = setRe.exec(js))) {
      let km;
      const keyRe = /(?:^|[\s,{])([A-Za-z_$][\w$]*)\s*:/g;
      while ((km = keyRe.exec(sm[1]))) known.add(km[1]);
    }

    let lm;
    const loopRe = /\bwx:for-(?:item|index)\s*=\s*"([^"]*)"/g;
    while ((lm = loopRe.exec(src))) {
      const alias = lm[1].trim();
      if (alias) known.add(alias);
    }

    const exprRe = /\{\{([\s\S]*?)\}\}/g;
    let em;
    while ((em = exprRe.exec(src))) {
      const expr = em[1].replace(/'[^']*'/g, ' ').replace(/"[^"]*"/g, ' ');
      let im;
      const idRe = /(?<![\w$.])([A-Za-z_$][\w$]*)/g;
      while ((im = idRe.exec(expr))) {
        const id = im[1];
        if (BUILTIN.has(id)) continue;
        assert.ok(known.has(id), `${path.relative(MP, wxml)}: 未知绑定标识符 "${id}" in {{${em[1].trim()}}}`);
      }
    }
  });
});

test('app.json 的页面与 tabBar 配置完整且原生', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(MP, 'app.json'), 'utf8'));

  assert.equal(appJson.pages.length, 4, '四个原生页面');
  appJson.pages.forEach((p) => {
    ['.js', '.wxml', '.json'].forEach((ext) => {
      assert.ok(fs.existsSync(path.join(MP, p + ext)), `缺少页面文件 ${p}${ext}`);
    });
  });

  assert.equal(appJson.__usePrivacyCheck__, true, '隐私合规检查必须开启');
  assert.ok(appJson.tabBar && Array.isArray(appJson.tabBar.list));
  assert.equal(appJson.tabBar.list.length, 4);

  appJson.tabBar.list.forEach((t) => {
    [t.iconPath, t.selectedIconPath].forEach((p) => {
      assert.ok(!p || !/\.svg$/i.test(p), 'tabBar 不支持 svg 图标');
    });
  });
});

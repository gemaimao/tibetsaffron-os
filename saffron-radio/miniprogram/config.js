/**
 * 全局可配置项（唯一需要改动的配置文件）
 *
 * cloudEnv：微信云开发环境 ID。
 *   - 默认空字符串 ''：小程序以「本地体验模式」运行，不初始化云开发，
 *     登录按钮会明确提示「云环境未配置」，不会静默失败、也不会伪造登录态。
 *   - 配置后（例如 'saffron-radio-1a2b3c'）才会真正调用 wx.cloud。
 *     同时需要把 project.config.json 里的 appid 从 'touristappid' 换成真实 AppID。
 *
 * 注意：cloudEnv 配置好只代表「云端可用」，不代表「已登录」。
 * 同步能力必须同时满足：已配置云环境 + 用户已同意隐私说明 + 用户主动登录过。
 */
module.exports = {
  // 云开发环境 ID，默认空 = 本地体验模式
  cloudEnv: '',

  // 两个云函数的分工（与 cloudfunctions/ 下的实现一致，勿混用）
  functions: {
    // 状态与账号：login / getState / saveProgress / toggleLike / toggleFavorite /
    // listQuestions / toggleQuote / deleteHistory / clearProgress / deleteAccount
    api: 'radioApi',
    // 提问：入参 { question, episodeId }，不带 action
    ask: 'radioAsk'
  },

  // 客户端超时（毫秒）。云函数侧另有 AI_TIMEOUT_MS 控制模型调用超时。
  apiTimeoutMs: 10000,
  askTimeoutMs: 30000,

  // 提问长度上限，需与云函数 validate.js 的 QUESTION_MAX 保持一致
  questionMaxLength: 500,

  // 本地合成试听音频（真实音频缺失时的演示音源，非完整节目）
  previewAudio: '/assets/preview.m4a',

  // 试听模式必须向用户明示的文案
  previewNotice: '合成试听，非完整节目',

  // 品牌信息
  brand: {
    name: '雪域林泉',
    sub: '藏红花电台',
    slogan: '在高原的光里，听见一朵花的时间'
  }
}

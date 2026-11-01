/**
 * 本地知识库（未连接云环境时的演示答复来源）
 *
 * 重要：这里的答复由本地规则匹配生成，**不是大模型实时回答**。
 * 界面必须明确标注来源，不得冒充 AI 大模型。
 * 内容边界：不提供按根计量的服用建议，不承诺任何疗效；
 * 孕期 / 哺乳期 / 正在服药者一律引导咨询专业人员；
 * 颜色、沉水、扩散等民间鉴别法不作为纯度或品质凭证。
 */

var ENTRIES = [
  {
    id: 'kb-origin',
    keywords: ['产地', '哪里', '高原', '西藏', '林芝', '海拔', '为什么贵', '价格'],
    answer: '节目里反复出现的主产区是雅鲁藏布江谷地一带的高海拔坡地。海拔带来的昼夜温差、谷地晨雾和坡向差异，共同决定了花开的节奏，也直接压缩了采收窗口——这是产地叙事里最核心的部分。至于价格，影响因素很多（采收人工、干燥损耗、批次等级、可追溯程度），本期不评价具体行情，也不建议把它当作投资标的。',
    quote: '花开的节奏，决定了一整条产业链的作息。',
    episodeId: 'ep01'
  },
  {
    id: 'kb-harvest',
    keywords: ['采收', '采摘', '什么时候', '季节', '几月', '花期', '三根', '花丝', '柱头'],
    answer: '一朵花只有三根柱头，采收要在日出前后完成。太阳升高后花瓣失水变软，花丝容易粘在花冠上，成品率会明显下降。所以采收队的一天是被花决定的：清晨采收，白天分拣、称重、摊晾和记录。这是 ep04 里「天王级采收纪实」想还原的现场。',
    quote: '一朵花只有三根，一天要弯上万次腰。',
    episodeId: 'ep04'
  },
  {
    id: 'kb-identify',
    keywords: ['鉴别', '真假', '辨别', '怎么选', '挑选', '纯度', '颜色', '沉水', '泡水', '褪色', '好坏', '品质'],
    answer: '单一特征几乎无法判断真假优劣。颜色受品种、产地、采摘时间、干燥温度和储存时长共同影响；沉水、扩散、褪色这类民间实验受水温水量容器影响很大，重复性差，只能当趣味观察。相对可靠的三条线索是：① 可追溯信息（产地、年份、批次、干燥方式）；② 干燥工艺是否低温避光控湿、是否避免硫熏；③ 有资质第三方出具的、编号可核验的检测报告。需要特别说明：颜色深浅不能作为纯度或品质的凭证。',
    quote: '颜色是线索，不是证据。',
    episodeId: 'ep02'
  },
  {
    id: 'kb-bake',
    keywords: ['烘焙', '烘干', '无硫', '硫熏', '工艺', '温度', '储存', '保存', '受潮', '变质'],
    answer: '干燥是品质分化的关键一步。常见做法是分段控温：先低温带走表面水分，再缓慢升温，最后回落到接近室温，全程监测湿度，湿度回升就说明干燥不充分。无硫工艺意味着放弃护色防虫的捷径，改用更慢的干燥和更严格的储存来保证品质。储存同样属于工艺的一部分：避光、密封、控湿，尽量分装成小规格以减少开封后的反复暴露。',
    quote: '无硫不是一句标签，是更慢的时间表。',
    episodeId: 'ep03'
  },
  {
    id: 'kb-use',
    keywords: ['怎么吃', '怎么喝', '泡茶', '冲泡', '用量', '吃多少', '每天', '几根', '孕妇', '哺乳', '用药', '副作用', '禁忌', '安全'],
    answer: '关于「怎么吃、吃多少」，本节目不做任何用量建议，也不会给出「每天几根」这类说法，更不承诺任何保健或治疗功效。孕期、哺乳期人群，以及正在服药（尤其是抗凝、抗血小板类药物）的朋友，请务必先咨询专业医师或药师，由专业人员结合你的具体情况判断。如果你只是想了解风味，可以用温水短时浸泡后取出，作为饮品的一部分来体验，但这仍然不构成任何健康承诺。',
    quote: '能不能吃、吃多少，请交给专业医师判断。',
    episodeId: 'ep03'
  },
  {
    id: 'kb-show',
    keywords: ['节目', '更新', '几期', '有哪些', '介绍', '电台', '主播', '是谁'],
    answer: '《雪域林泉 · 藏红花电台》目前有 4 期：EP.01《雪峰与晨雾：雅鲁藏布江谷地的金色奇迹》12 分钟；EP.02《三根花丝的秘密：天王级藏红花鉴真盲区拆解》15 分钟；EP.03《高寒之地的守夜人：纯净无硫烘焙的现代工艺》10 分钟；EP.04《林芝雪山下的第一抹绛红：天王级采收纪实》18 分钟。首页可以逐期收听，播放页可以切换倍速、查看简介与文稿。',
    quote: '在高原的光里，听见一朵花的时间。',
    episodeId: 'ep04'
  }
]

var FALLBACK = {
  id: 'kb-fallback',
  answer: '这个问题本地知识库暂时没有收录。当前未连接云环境，我只能基于本地收录的产地、采收、鉴真、烘焙与安全提示来回答，不会编造内容，也不会假装是大模型在实时作答。你可以在「我的」里配置云环境后重新提问，或换一个更贴近节目内容的问题。',
  quote: '本地没有收录的，我不猜。',
  episodeId: ''
}

var GREETING = '这里是雪域林泉的茶室。你可以问节目内容、产地工艺、鉴别方法。需要说明的是：当前未连接云环境，答复来自本地知识库，不是大模型实时回答；涉及健康与用药的问题，请咨询专业医师。'

/** 归一化：去标点、统一小写 */
function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s，。！？、,.!?；;：:'"（）()《》【】\[\]—\-]/g, '')
}

/** 本地匹配，返回 {answer, quote, entryId, episodeId, matched} */
function ask(question) {
  var q = normalize(question)
  if (!q) {
    return {
      answer: '请输入你想问的内容。',
      quote: '',
      entryId: '',
      episodeId: '',
      matched: false
    }
  }

  var best = null
  var bestScore = 0
  ENTRIES.forEach(function (entry) {
    var score = 0
    entry.keywords.forEach(function (kw) {
      if (q.indexOf(normalize(kw)) >= 0) score += 1
    })
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  })

  if (best && bestScore > 0) {
    return {
      answer: best.answer,
      quote: best.quote,
      entryId: best.id,
      episodeId: best.episodeId,
      matched: true
    }
  }

  return {
    answer: FALLBACK.answer,
    quote: FALLBACK.quote,
    entryId: FALLBACK.id,
    episodeId: FALLBACK.episodeId,
    matched: false
  }
}

/** 推荐问题 */
var SUGGESTIONS = [
  '藏红花的产地为什么集中在高海拔谷地？',
  '怎么判断藏红花的品质？颜色越红越好吗？',
  '无硫烘焙和普通烘干有什么区别？',
  '孕期或正在服药的人需要注意什么？'
]

module.exports = {
  ask: ask,
  suggestions: SUGGESTIONS,
  greeting: GREETING,
  fallbackId: FALLBACK.id
}

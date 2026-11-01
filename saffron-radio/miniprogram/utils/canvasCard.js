/**
 * 金句卡片：canvas 绘制 -> 导出 png -> 保存到相册（含权限被拒处理）
 *
 * 卡片内容为完整的「问题 + 回答 + 金句」，不截断：
 *   1. 先用当前 ctx 量出全部文本行数，算出真实高度（动态高度）；
 *   2. 把 canvas 元素高度 setData 成这个高度，再重新取 ctx 绘制；
 *   3. 导出时按同一高度裁剪，长文不会被切掉。
 * 回答过长时按 28 -> 26 -> 24 -> 22 逐级缩小字号以适配画布上限，
 * 而不是裁剪内容。
 *
 * 使用旧版 canvas 接口（canvas-id），兼容性最好。
 */

var W = 600
var PAD = 56
var CONTENT_W = W - PAD * 2
var MAX_H = 4096

var ANSWER_FONT_STEPS = [28, 26, 24, 22]

var COLOR = {
  bg: '#F8F6F0',
  accent: '#8C2B2B',
  ink: '#3E3835',
  line: 'rgba(140,43,43,0.22)',
  faint: 'rgba(62,56,53,0.55)',
  mark: 'rgba(140,43,43,0.10)',
  bar: 'rgba(140,43,43,0.85)'
}

/* ------------------------------ 文本测量 ------------------------------ */

/**
 * 按宽度折行，不设最大行数（即不截断）。
 * 需要先 setFontSize，measureText 才会用对应字号。
 */
function wrapLines(ctx, text, fontSize, maxWidth) {
  var lines = []
  var chars = String(text === undefined || text === null ? '' : text).split('')
  var line = ''

  try {
    ctx.setFontSize(fontSize)
  } catch (e) {}

  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i]
    if (ch === '\n') {
      lines.push(line)
      line = ''
      continue
    }
    var test = line + ch
    var w = 0
    try {
      w = ctx.measureText(test).width
    } catch (e) {
      w = test.length * fontSize
    }
    if (w > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  if (!lines.length) lines.push('')
  return lines
}

/** 一个文本块：记录行、字号、行高、起始 y 与占用高度 */
function textBlock(ctx, text, font, lineHeight, width, top) {
  var lines = wrapLines(ctx, text, font, width)
  return {
    lines: lines,
    font: font,
    lh: lineHeight,
    top: top,
    width: width,
    height: lines.length * lineHeight
  }
}

/* ------------------------------ 排版 ------------------------------ */

/**
 * 计算整张卡片的排版与高度。
 * @param {object} ctx  canvas 上下文（只用于 measureText）
 * @param {object} opts { question, answer, quote, episodeTitle, brandName, brandSub, disclaimer }
 * @param {number} answerFont 回答字号（自适应用）
 */
function buildPlan(ctx, opts, answerFont) {
  var o = opts || {}
  var brandName = o.brandName || '雪域林泉'
  var brandSub = o.brandSub || '藏红花电台'
  var title = o.episodeTitle || ''
  var disclaimer = o.disclaimer || '节目科普摘录 · 不构成医疗建议'
  var question = String(o.question || '')
  var answer = String(o.answer || '')
  var quote = String(o.quote || '')

  var plan = { answerFont: answerFont, blocks: {}, quote: null }
  var y = 0

  plan.blocks.brand = textBlock(ctx, brandName, 34, 46, CONTENT_W, y)
  y += plan.blocks.brand.height + 4

  plan.blocks.sub = textBlock(ctx, brandSub + ' · 问答金句卡', 22, 32, CONTENT_W, y)
  y += plan.blocks.sub.height + 26

  plan.dividerTop = y
  y += 44

  if (question) {
    plan.blocks.qLabel = textBlock(ctx, '听众提问', 22, 30, CONTENT_W, y)
    y += plan.blocks.qLabel.height + 12
    plan.blocks.question = textBlock(ctx, question, 30, 48, CONTENT_W, y)
    y += plan.blocks.question.height + 40
  }

  if (answer) {
    plan.blocks.aLabel = textBlock(ctx, '主播回答', 22, 30, CONTENT_W, y)
    y += plan.blocks.aLabel.height + 12
    plan.blocks.answer = textBlock(ctx, answer, answerFont, answerFont + 18, CONTENT_W, y)
    y += plan.blocks.answer.height + 44
  }

  if (quote) {
    var quoteTop = y
    var quoteBlock = textBlock(ctx, quote, 34, 58, CONTENT_W - 40, quoteTop + 26)
    quoteBlock.top = quoteTop + 26
    quoteBlock.boxTop = quoteTop
    quoteBlock.boxHeight = quoteBlock.height + 52
    plan.quote = quoteBlock
    y = quoteTop + quoteBlock.boxHeight + 40
  }

  plan.dividerBottom = y
  y += 40

  if (title) {
    plan.blocks.meta = textBlock(ctx, '—— 《' + title + '》', 20, 32, CONTENT_W, y)
    y += plan.blocks.meta.height + 14
  }

  plan.blocks.footer = textBlock(ctx, disclaimer, 19, 30, CONTENT_W, y)
  y += plan.blocks.footer.height

  plan.height = Math.ceil(y + 64)
  return plan
}

/**
 * 逐级缩小回答字号，取第一个能放进画布上限的排版。
 *
 * 画布高度有硬上限（MAX_H），单张卡片物理上装不下无限长文本。
 * 这里保证两件事：
 *   1. 换行只分行、绝不丢字（wrapLines 没有最大行数限制）；
 *   2. 在客户端输入上限内（问题 <= config.questionMaxLength，回答为云端生成的短文本）
 *      一定能通过缩字号落进 MAX_H，正常路径不会触发裁剪。
 * 若输入真的超出物理上限，返回最小字号排版，由调用方决定如何处理。
 */
function buildPlanFitted(ctx, opts) {
  var plan = null
  for (var i = 0; i < ANSWER_FONT_STEPS.length; i++) {
    plan = buildPlan(ctx, opts, ANSWER_FONT_STEPS[i])
    if (plan.height <= MAX_H) return plan
  }
  // 最小字号仍然超长：返回该排版（文本完整，高度可能超过硬上限）
  return plan
}

/* ------------------------------ 绘制 ------------------------------ */

function paint(ctx, plan, opts) {
  var o = opts || {}

  function paintBlock(block, color) {
    if (!block) return
    ctx.setFillStyle(color)
    ctx.setFontSize(block.font)
    ctx.setTextAlign('left')
    for (var i = 0; i < block.lines.length; i++) {
      ctx.fillText(block.lines[i], PAD, block.top + block.font + i * block.lh)
    }
  }

  // 背景
  ctx.setFillStyle(COLOR.bg)
  ctx.fillRect(0, 0, W, plan.height)

  // 品牌
  paintBlock(plan.blocks.brand, COLOR.ink)
  paintBlock(plan.blocks.sub, COLOR.accent)

  // 顶部短竖线
  ctx.setFillStyle(COLOR.accent)
  ctx.fillRect(PAD, plan.blocks.brand.top + 6, 6, 44)

  // 分隔线
  ctx.setStrokeStyle(COLOR.line)
  ctx.setLineWidth(2)
  ctx.beginPath()
  ctx.moveTo(PAD, plan.dividerTop)
  ctx.lineTo(W - PAD, plan.dividerTop)
  ctx.stroke()

  // 问答
  paintBlock(plan.blocks.qLabel, COLOR.accent)
  paintBlock(plan.blocks.question, COLOR.ink)
  paintBlock(plan.blocks.aLabel, COLOR.accent)
  paintBlock(plan.blocks.answer, 'rgba(62,56,53,0.88)')

  // 金句
  if (plan.quote) {
    var q = plan.quote
    ctx.setFillStyle(COLOR.mark)
    ctx.fillRect(PAD, q.boxTop, W - PAD * 2, q.boxHeight)

    ctx.setFillStyle(COLOR.bar)
    ctx.fillRect(PAD, q.boxTop, 6, q.boxHeight)

    ctx.setFillStyle(COLOR.accent)
    ctx.setFontSize(q.font)
    ctx.setTextAlign('left')
    for (var j = 0; j < q.lines.length; j++) {
      ctx.fillText(q.lines[j], PAD + 28, q.top + q.font + j * q.lh)
    }
  }

  // 底部
  ctx.setStrokeStyle(COLOR.line)
  ctx.setLineWidth(2)
  ctx.beginPath()
  ctx.moveTo(PAD, plan.dividerBottom)
  ctx.lineTo(W - PAD, plan.dividerBottom)
  ctx.stroke()

  paintBlock(plan.blocks.meta, COLOR.accent)
  paintBlock(plan.blocks.footer, COLOR.faint)
}

/* ------------------------------ 导出与保存 ------------------------------ */

function exportFile(page, canvasId, height) {
  var h = Math.min(Math.max(Math.ceil(height), 200), MAX_H)
  // 输出分辨率自适应，避免超长卡片产生过大的位图
  var scale = Math.min(2, Math.max(1, 4000 / h))

  return new Promise(function (resolve, reject) {
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      x: 0,
      y: 0,
      width: W,
      height: h,
      destWidth: Math.round(W * scale),
      destHeight: Math.round(h * scale),
      fileType: 'png',
      quality: 1,
      success: function (res) { resolve(res.tempFilePath) },
      fail: function (err) { reject(new Error((err && err.errMsg) || '卡片导出失败')) }
    }, page)
  })
}

function permissionError() {
  var err = new Error('未获得相册权限')
  err.code = 'ALBUM_DENIED'
  return err
}

function guideToSetting() {
  return new Promise(function (resolve, reject) {
    wx.showModal({
      title: '需要相册权限',
      content: '保存金句卡片需要「保存到相册」权限。你可以前往设置页开启，或长按图片自行保存。',
      confirmText: '去设置',
      cancelText: '暂不',
      success: function (m) {
        if (!m.confirm) { reject(permissionError()); return }
        wx.openSetting({
          success: function (s) {
            if (s && s.authSetting && s.authSetting['scope.writePhotosAlbum']) resolve(true)
            else reject(permissionError())
          },
          fail: function () { reject(permissionError()) }
        })
      },
      fail: function () { reject(permissionError()) }
    })
  })
}

function ensureAlbumAuth() {
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: function (res) {
        var auth = (res && res.authSetting) || {}
        var state = auth['scope.writePhotosAlbum']
        if (state === true) { resolve(true); return }
        if (state === false) { guideToSetting().then(resolve, reject); return }
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success: function () { resolve(true) },
          fail: function () { guideToSetting().then(resolve, reject) }
        })
      },
      fail: function () { reject(new Error('无法读取授权状态')) }
    })
  })
}

function saveToAlbum(filePath) {
  return new Promise(function (resolve, reject) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: function () { resolve(true) },
      fail: function (err) {
        var msg = (err && err.errMsg) || ''
        if (msg.indexOf('auth deny') >= 0 || msg.indexOf('authorize') >= 0) {
          reject(permissionError())
          return
        }
        reject(new Error(msg || '保存失败'))
      }
    })
  })
}

/**
 * 完整流程：测量 -> 调整画布高度 -> 绘制 -> 导出 -> 权限 -> 保存
 * @param {object} page 页面实例（需要 data.cardCanvasH 绑定到 canvas 的 height）
 */
function makeAndSave(page, canvasId, opts) {
  var plan
  try {
    var measureCtx = wx.createCanvasContext(canvasId, page)
    plan = buildPlanFitted(measureCtx, opts)
  } catch (e) {
    return Promise.reject(new Error('无法创建画布'))
  }

  var targetH = Math.min(plan.height, MAX_H)

  return new Promise(function (resolve) {
    page.setData({ cardCanvasH: targetH }, function () {
      // 等画布元素按新高度完成渲染
      setTimeout(resolve, 90)
    })
  }).then(function () {
    var ctx = wx.createCanvasContext(canvasId, page)
    paint(ctx, plan, opts)
    return new Promise(function (resolve, reject) {
      ctx.draw(false, function () {
        setTimeout(function () { resolve(true) }, 60)
      })
      setTimeout(function () { reject(new Error('画布绘制超时')) }, 3000)
    })
  }).then(function () {
    return exportFile(page, canvasId, targetH)
  }).then(function (filePath) {
    return ensureAlbumAuth().then(function () {
      return saveToAlbum(filePath)
    }).then(function () {
      return filePath
    })
  })
}

module.exports = {
  W: W,
  MAX_H: MAX_H,
  wrapLines: wrapLines,
  buildPlan: buildPlan,
  buildPlanFitted: buildPlanFitted,
  paint: paint,
  exportFile: exportFile,
  ensureAlbumAuth: ensureAlbumAuth,
  saveToAlbum: saveToAlbum,
  makeAndSave: makeAndSave
}

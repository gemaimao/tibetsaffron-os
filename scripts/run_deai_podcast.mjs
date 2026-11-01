#!/usr/bin/env node
/**
 * Anti-AI De-synthetic Podcast Engine (NotebookLLM + Gemini 3.8)
 * 
 * 核心目标：
 * 1. 接入本地 infra/antigravity-pool 多账号池获取 Gemini 3.8 算力
 * 2. 彻底抹杀“首先、其次、综上所述”等一切 AI 八股味
 * 3. 产出极致口语化、带气口停顿、带生活化打比方与真实打断的双人对谈
 * 4. 本地多音轨合成并调用 afplay 听响验证
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 导入本地账号池
import { getCurrentAccount, ensureFreshToken, rotateAccount } from '../infra/antigravity-pool/pool.mjs';

// 去AI味系统提示词：NotebookLLM 真实人类对话核聚变版
const ANTI_AI_PODCAST_SYSTEM_PROMPT = `
你现在是全球最顶级的中文对谈播客制作人兼编剧。你的唯一使命是：
【彻底杀死一切 AI 味，还原真实人类在录音棚喝着咖啡闲聊扯淡、但观点极其硬核的对谈】。

【角色设定】：
- **阿龙 (Leo)**：男，说话语速微快，思维敏捷，擅长把复杂科学拆成接地气的粗暴比方，偶尔会卡壳找词（“就是那个……怎么说来着”）。
- **小林 (Maya)**：女，好奇且极其挑刺，不给对方留情面，爱打断、爱追问到底（“等等，你先打住”、“这不就是收割智商税吗？”）。

【反 AI 味绝对红线（违反任何一条即为失败）】：
1. 严禁出现任何论文腔与公文腔：“首先、其次、最后、综上所述、不可否认的是、值得注意的是、总而言之”。
2. 严禁主持人和嘉宾客气互捧（禁止“你说得真好”、“太棒了你能详细讲讲吗”）。真实人类都是直接接话茬、抢话、甚至反驳。
3. 必须加入真实口语垫词与语气助词：“害”、“绝了”、“不是，你等会儿”、“其实吧”、“说白了”。
4. 必须加入微弱的声学气口提示（用中括号标记，供后续声学引擎渲染）：
   - [轻笑]、[倒吸一口凉气]、[打断]、[叹气]、[短暂停顿思考]
5. 句子必须短，允许倒装句，允许没说完就被对方打断。

【输出格式】：
严格输出纯 JSON 数组，格式如下：
[
  { "speaker": "Leo", "text": "哎，小林，你猜我昨天在同仁堂门口看到啥了？[轻笑]" },
  { "speaker": "Maya", "text": "啥啊？总不能是又有人花好几千买那几根红丝丝吧？" },
  { "speaker": "Leo", "text": "还真被你猜中了！[叹气] 几千块就买那么一小玻璃瓶……" }
]
不要输出任何 markdown 标记外的冗余解释。
`;

async function callGemini38(promptText) {
  let attempts = 0;
  while (attempts < 3) {
    const { account } = getCurrentAccount();
    const token = await ensureFreshToken(account);

    try {
      console.log(`📡 [Gemini 3.8] 使用账号 [${account.email}] 正在生成去AI味双人剧本...`);
      const res = await fetch('https://daily-cloudcode-pa.googleapis.com/v1internal:streamGenerateContent?alt=sse', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'User-Agent': 'antigravity/cli/1.1.23 (aidev_client; os_type=linux; arch=amd64; cl=974125021; auth_method=consumer)'
        },
        body: JSON.stringify({
          project: account.project_id || 'aicode-consumers',
          model: 'gemini-3.8-flash-low',
          request: {
            systemInstruction: { parts: [{ text: ANTI_AI_PODCAST_SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.85,
              topP: 0.95
            }
          },
          requestType: 'AGENT',
          userAgent: 'ANTIGRAVITY',
          requestId: 'podcast-' + Date.now()
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const sseText = await res.text();
      let fullText = '';
      const lines = sseText.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.substring(6));
            const part = parsed?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (part) fullText += part;
          } catch (e) {}
        }
      }

      if (fullText.trim()) {
        return fullText.trim();
      }
      throw new Error('Empty response from model');
    } catch (err) {
      console.warn(`[Pool Warn] 账号 ${account.email} 遇到异常: ${err.message}`);
      rotateAccount(account.email, 'error');
      attempts++;
    }
  }
  throw new Error('All accounts failed after 3 attempts.');
}

async function renderAudioScript(dialogues) {
  const tmpDir = path.resolve(rootDir, 'outputs/podcast_tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  console.log(`\n🎙️ [声学导演渲染] 正在把双人对白渲染为 Mac 本地高拟真双声道音频轨...`);
  const audioFiles = [];

  for (let i = 0; i < dialogues.length; i++) {
    const item = dialogues[i];
    const outputFile = path.join(tmpDir, `line_${String(i).padStart(3, '0')}.aiff`);
    
    // 角色配对：Leo 用男声 Rocko / Reed，Maya 用女声 Tingting
    const voice = item.speaker === 'Leo' ? 'Rocko' : 'Tingting';
    // 去掉声学括号标签后再送入基础朗读器（但语意节奏已带有气口）
    const cleanText = item.text.replace(/\[.*?\]/g, '，');

    console.log(`  [${item.speaker} (${voice})]: ${item.text}`);
    try {
      execSync(`say -v "${voice}" -r 210 -o "${outputFile}" -- "${cleanText.replace(/"/g, '\\"')}"`);
      audioFiles.push(outputFile);
    } catch (err) {
      // 回退到默认声音
      execSync(`say -o "${outputFile}" -- "${cleanText.replace(/"/g, '\\"')}"`);
      audioFiles.push(outputFile);
    }
  }

  // 利用 ffmpeg 将所有切片拼接为一个完整播客音频
  const listFile = path.join(tmpDir, 'filelist.txt');
  const listContent = audioFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(listFile, listContent);

  const finalMp3 = path.resolve(rootDir, 'outputs/notebooklm_gemini38_demo.mp3');
  try {
    execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${listFile}" -c:a libmp3lame -q:a 2 "${finalMp3}" 2>/dev/null`);
    console.log(`\n🎉 [渲染完毕] 完整播客音频已生成至：${finalMp3}`);
    return finalMp3;
  } catch (err) {
    console.warn(`ffmpeg 拼接异常，直接保留各片段: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('========================================================');
  console.log('🚀 NotebookLLM + Gemini 3.8 去AI味本地播客生成实验启动');
  console.log('========================================================\n');

  // 取一段核心硬核争议材料（藏红花高倍抗氧化与真实市场真相）
  const sourceMaterial = `
话题：藏红花到底是不是智商税？
核心干货：
1. 很多人以为藏红花产自西藏，其实西藏历史上只是集散地，原产地是地中海和伊朗。中国现在优质的都是崇明岛或林芝室内全天候CEA种植。
2. 为什么那么贵？因为一朵花只有三根雌蕊柱头，纯手工采摘，几十万朵花才能出1公斤。
3. 关键成分不是普通花青素，而是藏红花素（Crocin）和藏红花酸，水溶性类胡萝卜素，能穿透血脑屏障，这在植物界极度罕见。
4. 市场乱象：90%所谓便宜的藏红花都是红花冒充的，或者用纸丝、玉米须染色，甚至抹油增重。
  `;

  const prompt = `请基于以下硬核事实，生成一段3-4个来回（约6-8句话）的超极客、无AI味、火药味与好奇心十足的双人对谈播客片段：\n\n${sourceMaterial}`;

  const rawResult = await callGemini38(prompt);
  console.log('\n📝 [Gemini 3.8 生成的原始剧本响应]:\n', rawResult);

  // 解析 JSON
  let dialogues = [];
  try {
    const jsonMatch = rawResult.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      dialogues = JSON.parse(jsonMatch[0]);
    } else {
      dialogues = JSON.parse(rawResult);
    }
  } catch (e) {
    console.error('JSON 解析失败，采用备用剧本进行渲染测试');
    dialogues = [
      { speaker: "Leo", text: "哎，小林，你敢信吗？很多人花大几千买的西藏特产藏红花，西藏当地压根就不产！[轻笑]" },
      { speaker: "Maya", text: "等会儿，你先打住。包装盒上明晃晃印着雪山呢，怎么就不产了？" },
      { speaker: "Leo", text: "害，那就是个集散地！原产地是地中海那带，中国现在顶级的反而在崇明岛和林芝室内工厂。[叹气]" },
      { speaker: "Maya", text: "真的假的？那它凭什么卖得比黄金还贵啊？不就是几根草吗？" },
      { speaker: "Leo", text: "一朵花就三根毛！纯人工一根根掐出来的，几十万朵才出一公斤，最绝的是它的藏红花素能穿透血脑屏障。" },
      { speaker: "Maya", text: "行吧……难怪网上几十块钱一大罐的全是红花或者染色玉米须，合着水这么深！" }
    ];
  }

  // 渲染并试听
  const finalAudio = await renderAudioScript(dialogues);
  if (finalAudio && fs.existsSync(finalAudio)) {
    console.log('\n🔊 [试听提示] 你可以在 Mac 终端直接运行以下命令收听：');
    console.log(`   afplay "${finalAudio}"`);
  }
}

main().catch(console.error);

#!/usr/bin/env node
/**
 * 🎙️ 纯血版：NotebookLLM 去AI味剧本 + Gemini 3.8 Flash TTS 原生真声渲染引擎
 * 
 * 核心特性：
 * 1. 采用真正的官方原生模型：models/gemini-3.8-flash-tts
 * 2. 官方原生顶级双音色配对：Aoede（灵动挑刺女声） + Puck（松弛反驳男声）
 * 3. 24kHz 高保真原生音频生成，带真实咬字、呼吸与起伏
 * 4. 彻底告别一切机械音与“念逗号”事故！
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

// 去AI味系统提示词
const SYSTEM_PROMPT = `
你现在是全球最顶级的中文对谈播客制作人兼编剧。
你的唯一使命是：【彻底杀死一切 AI 味，还原真实人类在录音棚喝着咖啡闲聊扯淡、但观点极其硬核的对谈】。

【角色】：
- Leo（男，Puck音色）：语速稍快，懂行，爱打接地气的粗暴比方，偶尔轻笑或叹气。
- Maya（女，Aoede音色）：好奇、犀利、挑刺，爱追问、直接打断质疑。

【绝对红线】：
1. 绝对不要说“首先、其次、最后、综上所述、不可否认”。
2. 绝对不要客套互捧（严禁“你说得真好”、“请你详细讲讲”）。
3. 必须包含口语垫词：“害”、“其实吧”、“等等你先打住”、“说白了”。
4. 语言必须自然，不要任何书面腔，每句话控制在20字到45字之间，最适合语音节奏。

【输出格式】：
严格输出纯 JSON 数组，不要包裹其他解释：
[
  { "speaker": "Maya", "text": "几万块钱一公斤，阿龙你摸着良心说，这红丝丝不就是专收中产智商税吗？" },
  { "speaker": "Leo", "text": "你先打住！别一上来就扣帽子。很多人连它打哪儿来的都不知道，它老家其实在地中海和伊朗！" },
  { "speaker": "Maya", "text": "管它哪儿来的，它凭啥按克卖得比黄金还贵啊？" },
  { "speaker": "Leo", "text": "因为全靠人工硬耗啊！一朵花就长三根雌蕊，几十万朵花才能抠出一公斤，最绝的是它的藏红花素能直接穿透血脑屏障！" },
  { "speaker": "Maya", "text": "能穿脑子也得买到真的算啊，网上几十块包邮那些，九成全都是染色玉米须和假货！" }
]
`;

function geminiCurlRequest(url, body, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const out = execFileSync('curl', [
        '-s',
        '--connect-timeout', '10',
        '--max-time', '60',
        '-X', 'POST',
        url,
        '-H', 'Content-Type: application/json',
        '-d', JSON.stringify(body)
      ], { maxBuffer: 30 * 1024 * 1024 });

      const text = out.toString();
      const json = JSON.parse(text);
      if (json.error) {
        const errMsg = json.error.message || JSON.stringify(json.error);
        const retryMatch = errMsg.match(/retry in ([\d\.]+)s/i);
        if (retryMatch) {
          const waitSec = Math.ceil(parseFloat(retryMatch[1])) + 1;
          console.warn(`    ⏳ 触发频控，自动礼让等待 ${waitSec} 秒后重试 (第 ${attempt}/${maxRetries} 次)...`);
          execSync(`sleep ${waitSec}`);
          continue;
        }
        throw new Error(`API Error: ${errMsg}`);
      }
      return json;
    } catch (err) {
      console.warn(`    ⚠️ 请求遇到波动 (第 ${attempt}/${maxRetries} 次): ${err.message}`);
      if (attempt === maxRetries) throw err;
      execSync('sleep 2');
    }
  }
}

async function generateScript() {
  console.log('🎙️ [Step 1] 正在通过 Gemini 3.8 生成去AI味极客对话剧本...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`;
  try {
    const data = geminiCurlRequest(url, {
      contents: [{
        parts: [{ text: `${SYSTEM_PROMPT}\n\n请针对“藏红花高价争议、产地真相与血脑屏障罕见机理”，生成一段5句紧凑真实的男女交锋对白。` }]
      }],
      generationConfig: {
        temperature: 0.85
      }
    });

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanText = rawText.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn('解析动态剧本失败，采用高质精选硬核剧本:', e.message);
    return [
      { speaker: "Maya", text: "几万块钱一公斤！阿龙你摸着良心说，这红丝丝不就是专收中产智商税吗？" },
      { speaker: "Leo", text: "你先打住，别一上来就扣帽子！西藏历史上只是个中转集散地，它老家其实在地中海跟伊朗。" },
      { speaker: "Maya", text: "管它哪儿来的，它凭啥按克卖得比黄金还贵啊？" },
      { speaker: "Leo", text: "全靠人工硬耗啊！一朵花就三根雌蕊，几十万朵才出一公斤，最绝的是藏红花素能穿透血脑屏障，植物界罕见到离谱！" },
      { speaker: "Maya", text: "能穿脑子也得买到真的算啊！网上几十块包邮那些，九成全是玉米须染色跟以次充好！" }
    ];
  }
}

function renderTTSLine(text, voiceName, outputPath) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=${API_KEY}`;
  const data = geminiCurlRequest(url, {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName
          }
        }
      }
    }
  });

  const part = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error('No audio returned in candidates');

  const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
  fs.writeFileSync(outputPath, audioBuffer);
}

async function main() {
  console.log('==================================================================');
  console.log('🎙️ NotebookLLM + Gemini 3.8 Flash TTS 原生真声播客生成');
  console.log('==================================================================\n');

  const dialogues = await generateScript();
  console.log('\n💬 [本次生成的剧本]:');
  dialogues.forEach(d => console.log(`  [${d.speaker}]: ${d.text}`));

  const tmpDir = path.resolve(rootDir, 'outputs/gemini38_tts_tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  console.log('\n🎧 [Step 2] 正在调用 models/gemini-3.8-flash-tts 原生渲染双人真声...');
  const audioFiles = [];

  for (let i = 0; i < dialogues.length; i++) {
    const item = dialogues[i];
    const voiceName = item.speaker === 'Leo' ? 'Puck' : 'Aoede';
    const wavPath = path.join(tmpDir, `line_${String(i).padStart(2, '0')}_${voiceName}.wav`);
    
    console.log(`  ▶ 渲染第 ${i + 1}/${dialogues.length} 句 | 角色: ${item.speaker} (${voiceName})...`);
    renderTTSLine(item.text, voiceName, wavPath);
    audioFiles.push(wavPath);
  }

  // 拼接音频
  console.log('\n🎛️ [Step 3] 使用 ffmpeg 将双人声轨无缝合成为完整高保真播客...');
  const listFile = path.join(tmpDir, 'filelist.txt');
  fs.writeFileSync(listFile, audioFiles.map(f => `file '${f}'`).join('\n'));

  const finalOutput = path.resolve(rootDir, 'outputs/gemini38_pure_live_podcast.wav');
  execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${finalOutput}" 2>/dev/null`);

  // 同步复制一份到 public/audio
  const publicOutput = path.resolve(rootDir, 'public/audio/gemini38_pure_live_podcast.wav');
  fs.copyFileSync(finalOutput, publicOutput);

  console.log('\n🎉 [全部完成] 真正的 Gemini 3.8 原生双人对谈播客已经就绪！');
  console.log(`📁 产物位置：${finalOutput}`);
  console.log(`🌐 静态服务：http://localhost:5173/audio/gemini38_pure_live_podcast.wav`);
  console.log('\n🔊 可直接在 Mac 本地终端收听：');
  console.log(`   afplay "${finalOutput}"\n`);
}

main().catch(console.error);

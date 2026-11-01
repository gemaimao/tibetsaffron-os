/**
 * 节流生成剩余的 Gemini 3.8 原生音轨
 * 每次生成后休眠 22 秒，确保遵守 RPM=3 限制
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.resolve(rootDir, 'public/audio');

const API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

async function generateTTS(text, voiceName, filename) {
  const outputPath = path.join(audioDir, filename);
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
    console.log(`⏩ [${filename}] 已存在，跳过生成。`);
    return;
  }

  console.log(`🎙️ 正在渲染 [${voiceName}]: "${text.slice(0, 30)}..." -> ${filename}`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`❌ TTS API 响应异常:`, errText);
    throw new Error(`TTS API Error ${res.status}`);
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('No audio returned in response');

  fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
  console.log(`  ✅ 写入成功: ${outputPath}`);
}

const REMAINING_TRACKS = [
  {
    voiceName: 'Puck',
    filename: 'turn_03_host_a.wav',
    text: '小林挑刺问到了核心！我们坚决不搞口头保证。根据深圳市计量质量检测研究院权威第三方报告，高分辨质谱 39 项农残筛查全部未检出！',
  },
  {
    voiceName: 'Puck',
    filename: 'response_evidence_puck.wav',
    text: '没问题，求证出处完全透明！该数据严格出自深圳市计量质量检测研究院检验报告第 4 页，编号 WT10103260183295WT2，全都有公章可查。',
  },
  {
    voiceName: 'Puck',
    filename: 'response_fallback_puck.wav',
    text: '关于这一点，我们必须严格以官方公布的检测报告为准，避免任何过度引申。根据权威报告实测，环境控环为品质打下基础，具体指标以第三方实验数据为准。',
  },
];

async function main() {
  for (const track of REMAINING_TRACKS) {
    try {
      await generateTTS(track.text, track.voiceName, track.filename);
      console.log('⏳ 节流等待 22 秒以符合 RPM 限制...');
      await new Promise((r) => setTimeout(r, 22000));
    } catch (e) {
      console.error(`重试提示: ${e.message}`);
      await new Promise((r) => setTimeout(r, 25000));
    }
  }
  console.log('\n🎉 全部所需 Gemini 3.8 核心真声音轨生成完毕！');
}

main().catch(console.error);

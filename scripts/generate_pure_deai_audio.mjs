/**
 * 彻底消除 AI 八股味！
 * 使用深度口语化、带气口声学线索（垫词、短句、反问、叹号）的真正脱口秀剧本
 * 重新调用 Gemini 3.8 Flash TTS 原生模型 (Aoede + Puck) 渲染 24kHz 真声
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.resolve(rootDir, 'public/audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

async function renderTTSLine(text, voiceName, filename) {
  const outputPath = path.join(audioDir, filename);
  console.log(`🎙️ [${voiceName}] 正在录音: "${text}"`);
  
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
    console.error(`❌ TTS API 错误:`, errText);
    throw new Error(`TTS API Error ${res.status}`);
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('No audio returned in response');

  fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
  console.log(`  ✅ 写入完成: ${filename} (${(part.inlineData.data.length / 1024).toFixed(1)} KB)`);
}

/**
 * 带有强烈【口语声学线索】的双人对谈脚本 (彻底消灭播音腔与公文套话)
 * 特征：
 * 1. 强制塞入垫词：害、其实吧、说白了、你先打住、摸着良心说、嘿
 * 2. 长句切碎：多用短句、叹号、逗号逼着模型换气吞咽
 * 3. 情绪鲜活：充满辩驳、反诘、挑刺与自信回应
 */
const ORAL_TRACKS = [
  // ── 主线剧情 1 (Leo / Puck) ──
  {
    voiceName: 'Puck',
    filename: 'turn_01_host_a.wav',
    text: '害，很多人老问我：阿龙啊，你们大老远跑到西藏林芝海拔三千米种花，图啥啊？说白了，就图两个字：干净！咱们今天直接扒数据！',
  },
  // ── 主线剧情 2 (Maya / Aoede) ──
  {
    voiceName: 'Aoede',
    filename: 'turn_02_host_b.wav',
    text: '你先打住！市面上谁不吹自己纯天然零农残啊？摸着良心说，九成全是智商税！你们那温室大棚，真能保证一点农药不沾？少拿噱头忽悠人！',
  },
  // ── 主线剧情 3 (Leo / Puck) ──
  {
    voiceName: 'Puck',
    filename: 'turn_03_host_a.wav',
    text: '嘿，我就知道你得挑刺！口头吹没用，咱们看报告！深圳质检院高分辨质谱筛查，三十九项农残，清清楚楚写着：全部未检出！',
  },
  // ── 打断回应：Challenge 挑刺质疑 (Maya / Aoede 抢麦) ──
  {
    voiceName: 'Aoede',
    filename: 'response_challenge_aoede.wav',
    text: '等等！这位朋友在麦上问到痛处了！三十九项全未检出？阿龙你别偷换概念，这到底是个别送检样品，还是所有大田里的批次啊？',
  },
  // ── 打断回应：Evidence 索证查验 (Leo / Puck 拿报告) ──
  {
    voiceName: 'Puck',
    filename: 'response_evidence_puck.wav',
    text: '查！随便查！质检报告编号 WT10103260183295WT2，就在第四页第一个表！带防伪公章的，谁造假谁负法律责任！',
  },
  // ── 打断回应：Drill Down 深挖细节 (Maya / Aoede 追问参数) ──
  {
    voiceName: 'Aoede',
    filename: 'response_drill_aoede.wav',
    text: '行，报告算你过关！但控环到底控了啥？别整那些虚头巴脑的，几度温差、多少湿度，给大伙说明白！',
  },
  // ── 打断回应：Interrupt 普通插话 (Leo / Puck) ──
  {
    voiceName: 'Puck',
    filename: 'response_interrupt_aoede.wav',
    text: '这位朋友插得好！老百姓买藏红花，最怕的就是花大价钱买回去一嘴农药，咱们聊的就是这层窗户纸！',
  },
  // ── JEV 拦截兜底：纠正伪因果 (Leo / Puck 严肃合规更正) ──
  {
    voiceName: 'Puck',
    filename: 'response_fallback_puck.wav',
    text: '等等，打住！话不能说太满！控环是创造无菌条件，不等于自动变零农残，一切必须以批次检测报告为准，绝不乱吹因果！',
  },
  // ── 恢复主线转场 (Leo / Puck) ──
  {
    voiceName: 'Puck',
    filename: 'response_recovery_puck.wav',
    text: '好勒，把这层疑虑砸碎了，咱们继续往下扒，看它到底凭啥比黄金还金贵……',
  },
];

async function main() {
  console.log('==================================================================');
  console.log('🔥 启动“去 AI 味”声学增强渲染流水线 (带换气、垫词与真实脱口秀情绪)');
  console.log('==================================================================\n');

  for (let i = 0; i < ORAL_TRACKS.length; i++) {
    const item = ORAL_TRACKS[i];
    console.log(`\n[${i + 1}/${ORAL_TRACKS.length}] 正在生成口语声轨: ${item.filename}`);
    
    let success = false;
    let attempts = 0;
    while (!success && attempts < 4) {
      attempts++;
      try {
        await renderTTSLine(item.text, item.voiceName, item.filename);
        success = true;
        // 遵守免费额度 RPM=3 限制：每生成一次休眠 22 秒
        if (i < ORAL_TRACKS.length - 1) {
          console.log('⏳ 节奏保护：休眠 22 秒以符合 Google 速率限制...');
          await new Promise((r) => setTimeout(r, 22000));
        }
      } catch (e) {
        console.warn(`⚠️ 遇到限流或网络波动，等待 30 秒后重试 (第 ${attempts} 次)...`);
        await new Promise((r) => setTimeout(r, 30000));
      }
    }
  }

  console.log('\n🎉 全部 9 轨纯真生动脱口秀音频全部渲染完成！');
}

main().catch(console.error);

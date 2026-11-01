/**
 * 批量生成 NeoNarrative 演播室天旺全套 Gemini 3.8 原生真声音频
 * 包含：Aoede（灵动挑刺女声） + Puck（松弛反驳男声）
 * 输出目录：public/audio/
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

async function generateTTS(text, voiceName, filename) {
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
    throw new Error(`TTS API Error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('No audio returned in response');

  const outputPath = path.join(audioDir, filename);
  fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
  console.log(`  ✅ 写入完成: ${outputPath}`);
}

const TRACKS = [
  // ── 主线剧情交锋 ──
  {
    voiceName: 'Puck', // Host A 阿龙
    filename: 'turn_01_host_a.wav',
    text: '各位朋友大家好，欢迎收听实证圆桌。今天我们聚焦西藏林芝海拔 3000 米的高原催花基地。很多人问高原藏红花到底好在哪？我们直接看数据说话。',
  },
  {
    voiceName: 'Aoede', // Host B 小林
    filename: 'turn_02_host_b.wav',
    text: '阿龙你先等等！现在市面上宣传零农残的商家太多了，很多就是打擦边球。你们这套设施控环，难道真能杜绝农残吗？有硬核报告吗？',
  },
  {
    voiceName: 'Puck', // Host A 阿龙
    filename: 'turn_03_host_a.wav',
    text: '小林挑刺问到了核心！我们坚决不搞口头保证。根据深圳市计量质量检测研究院权威第三方报告，高分辨质谱 39 项农残筛查全部未检出！',
  },

  // ── 用户打断回应 ──
  {
    voiceName: 'Aoede', // Host B 接麦回应质疑
    filename: 'response_challenge_aoede.wav',
    text: '这位朋友质疑得很专业！阿龙你刚才说这组数据，确实必须把实验边界说清。依据权威报告，这仅代表送检批次，绝不等于所有露天种植也能自动达到！',
  },
  {
    voiceName: 'Puck', // Host A 接麦念出凭证报告
    filename: 'response_evidence_puck.wav',
    text: '没问题，求证出处完全透明！该数据严格出自深圳市计量质量检测研究院检验报告第 4 页，编号 WT10103260183295WT2，全都有公章可查。',
  },
  {
    voiceName: 'Aoede', // Host B 接麦深挖细节
    filename: 'response_drill_aoede.wav',
    text: '这个问题深挖得好！设施控环核心在于温湿度、光照周期与固态营养基质的精准配比，彻底摆脱了传统露天看天吃饭的农药依赖。',
  },
  {
    voiceName: 'Aoede', // Host B 接麦普通插话
    filename: 'response_interrupt_aoede.wav',
    text: '大家先稍等，刚才这位朋友提到的细节很关键，老百姓最关心的确实就是到底安不安全，我们马上展开剖析。',
  },
  {
    voiceName: 'Puck', // 兜底合规声明
    filename: 'response_fallback_puck.wav',
    text: '关于这一点，我们必须严格以官方公布的检测报告为准，避免任何过度引申。根据权威报告实测，环境控环为品质打下基础，具体指标以第三方实验数据为准。',
  },
  {
    voiceName: 'Puck', // 恢复主线转场
    filename: 'response_recovery_puck.wav',
    text: '好，解答完这位朋友的疑惑，我们把视线拉回今天的主题，继续往下看……',
  },
];

async function main() {
  console.log('==================================================================');
  console.log('🚀 开始渲染天旺演播室 Gemini 3.8 原生真声音轨 (Puck + Aoede)');
  console.log('==================================================================\n');

  for (const track of TRACKS) {
    try {
      await generateTTS(track.text, track.voiceName, track.filename);
      // 避免触发 API 限流，稍作间隔
      await new Promise((r) => setTimeout(r, 600));
    } catch (e) {
      console.error(`❌ 生成失败 [${track.filename}]:`, e.message);
    }
  }

  // 把昨天现有的完整播客也拷贝一份到 public/audio
  const existingPodcast = path.resolve(rootDir, 'outputs/gemini38_pure_live_podcast.wav');
  if (fs.existsSync(existingPodcast)) {
    fs.copyFileSync(existingPodcast, path.join(audioDir, 'gemini38_pure_live_podcast.wav'));
    console.log('\n✅ 昨天测试满意的高保真播客已同步复制至 public/audio/gemini38_pure_live_podcast.wav');
  }

  console.log('\n🎉 全部真声音轨渲染就绪！');
}

main().catch(console.error);

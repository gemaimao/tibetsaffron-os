import subprocess
import os
import json
import time

AUDIO_DIR = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/public/audio/master"
MINI_AUDIO_DIR = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/miniprogram/assets/audio/master"
WEB_AUDIO_DIR = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/web/assets/audio/master"

for d in [AUDIO_DIR, MINI_AUDIO_DIR, WEB_AUDIO_DIR]:
    os.makedirs(d, exist_ok=True)

EDGE_TTS = "/opt/miniconda3/bin/edge-tts"

podcast_script = [
    {
        "id": "turn_01",
        "chapter": 1,
        "chapter_title": "迷局与澄清：名字叫藏红花，西藏到底产不产？",
        "host": "C",
        "speaker": "莉莉",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "听众朋友们大家好，欢迎收听《雪域林泉·藏红花电台》。今天我们来到林芝海拔2945米的天旺农牧智能温室。很多人常问：藏红花既然叫藏红花，为什么很多人说西藏原本不产？扎西老师，先给我们讲讲这其中的历史渊源吧。",
        "media_event": "SHOW_COVER"
    },
    {
        "id": "turn_02",
        "chapter": 1,
        "chapter_title": "迷局与澄清：名字叫藏红花，西藏到底产不产？",
        "host": "A",
        "speaker": "扎西",
        "voice": "zh-CN-YunjianNeural",
        "rate": "-6%",
        "text": "莉莉好，林博士好，各位听众扎西德勒。很多人的误解在于，历史上藏红花原产于地中海沿岸与波斯高原，汉唐时期通过丝绸之路与茶马古道经由西藏转运进贡中原，才得了藏红花的美名。千百年来西藏确实主要作为转运走廊，但今天的林芝，已经完全打破了这段历史。",
        "media_event": "NONE"
    },
    {
        "id": "turn_03",
        "chapter": 1,
        "chapter_title": "迷局与澄清：名字叫藏红花，西藏到底产不产？",
        "host": "B",
        "speaker": "林博士",
        "voice": "zh-CN-YunyangNeural",
        "rate": "+0%",
        "text": "扎西说得非常准确。藏红花学名番红花，是极度娇贵的鸢尾科植物。过去由于传统农业设施落后，高原露天无法抵御突发霜冻；而现在，我们在米瑞乡建成的正是现代环境控制农业温室，真正让藏红花在西藏本土扎下了现代科学的根。",
        "media_event": "NONE"
    },
    {
        "id": "turn_04",
        "chapter": 2,
        "chapter_title": "现代设施农业的真相：为什么不是清晨采霜花？",
        "host": "C",
        "speaker": "莉莉",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "说到这儿，市面上很多文案总喜欢煽情地说采花工人清晨六点顶着薄霜摘花避开阳光，这种说法到底科学吗？",
        "media_event": "NONE"
    },
    {
        "id": "turn_05",
        "chapter": 2,
        "chapter_title": "现代设施农业的真相：为什么不是清晨采霜花？",
        "host": "A",
        "speaker": "扎西",
        "voice": "zh-CN-YunjianNeural",
        "rate": "-6%",
        "text": "哈哈，但凡真正来过林芝基地的人都知道，林芝在东经94.4度，在深秋采收季，早晨六点钟天还是漆黑一片的，不可能摸黑采摘。更重要的是，在2945米现代化连栋温室内，有自动化地暖和保温系统，根本不存在所谓的薄霜。",
        "media_event": "SHOW_GREENHOUSE"
    },
    {
        "id": "turn_06",
        "chapter": 2,
        "chapter_title": "现代设施农业的真相：为什么不是清晨采霜花？",
        "host": "B",
        "speaker": "林博士",
        "voice": "zh-CN-YunyangNeural",
        "rate": "+0%",
        "text": "从植物生理学角度看，采摘的唯一核心窗口期是花蕾初绽、花药尚未开裂、柱头饱满这短短几个小时。此时番红花苷和苦素处于生命周期的峰值。温室内顶部的自动化遮阳幕布可以随时阻绝强光，工人们是在最舒适受控的光热环境下精细采收，这才是高科技农业。",
        "media_event": "SHOW_GREENHOUSE"
    },
    {
        "id": "turn_07",
        "chapter": 3,
        "chapter_title": "两段式种植密码：借地长球，归藏定质",
        "host": "C",
        "speaker": "莉莉",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "那为什么我们要采取两段式种植：借地长球、归藏定质呢？林博士能深入聊聊这个战略吗？",
        "media_event": "NONE"
    },
    {
        "id": "turn_08",
        "chapter": 3,
        "chapter_title": "两段式种植密码：借地长球，归藏定质",
        "host": "B",
        "speaker": "林博士",
        "voice": "zh-CN-YunyangNeural",
        "rate": "+0%",
        "text": "这是天旺农牧最核心的产业科技机密。藏红花一生分为营养生长和生殖生长。长球期需要肥沃土壤和平原温和气候；但到了开花定质的关键期，母球回到林芝2945米高原温室。这里的强紫外线和15度以上的剧烈昼夜温差，是一种天然的植物环境逆境刺激，能逆向倒逼红花柱头合成极其浓烈的高活性次生代谢物。",
        "media_event": "NONE"
    },
    {
        "id": "turn_09",
        "chapter": 3,
        "chapter_title": "两段式种植密码：借地长球，归藏定质",
        "host": "A",
        "speaker": "扎西",
        "voice": "zh-CN-YunjianNeural",
        "rate": "-6%",
        "text": "对，就像雪莲和冬虫夏草，没有高原极其纯净的冰川空气和强紫外线，就涵养不出这种特有的醇厚香气。这就是所谓的借地长其形，归藏定其魂。",
        "media_event": "NONE"
    },
    {
        "id": "turn_10",
        "chapter": 4,
        "chapter_title": "药典实证与真伪鉴别：水试金黄与检测报告A26SW02809",
        "host": "C",
        "speaker": "莉莉",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "很多听众朋友买回去一泡水，发现水变成了灿烂的金黄色，甚至有些发亮，心里犯嘀咕：明明是红色的花丝，为什么泡出来的不是红色？是不是买到染色假货了？",
        "media_event": "SHOW_WATER_TEST"
    },
    {
        "id": "turn_11",
        "chapter": 4,
        "chapter_title": "药典实证与真伪鉴别：水试金黄与检测报告A26SW02809",
        "host": "B",
        "speaker": "林博士",
        "voice": "zh-CN-YunyangNeural",
        "rate": "+0%",
        "text": "这可以说是全网最大的认知误区！大家请看水试特征。《中国药典》明确规定，正品番红花苷是强极性水溶性色素，入水后会缓缓垂直下沉，拉出一条条金黄色的丝带，水体呈现出清澈明亮的金黄色，绝无油脂浮膜。凡是泡出鲜红或暗红色的，要么是苏木等杂草染色，要么是掺杂了化学色素，那才是假货！",
        "media_event": "SHOW_WATER_TEST"
    },
    {
        "id": "turn_12",
        "chapter": 4,
        "chapter_title": "药典实证与真伪鉴别：水试金黄与检测报告A26SW02809",
        "host": "C",
        "speaker": "莉莉",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "原来如此！那么我们天旺农牧的藏红花在国家法定检验机构的检测表现如何呢？",
        "media_event": "SHOW_WHITEBOARD_REPORT"
    },
    {
        "id": "turn_13",
        "chapter": 4,
        "chapter_title": "药典实证与真伪鉴别：水试金黄与检测报告A26SW02809",
        "host": "B",
        "speaker": "林博士",
        "voice": "zh-CN-YunyangNeural",
        "rate": "+0%",
        "text": "大家可以看屏幕上这张权威检测报告，报告编号A26SW02809。《中国药典》规定，番红花苷总吸光度不得低于10.0%。而我们林芝基地送检的特级批次，实测值达到了惊人的15.8%，苦素指标更是远超国标！这就是科学与真实的力量。",
        "media_event": "SHOW_WHITEBOARD_REPORT"
    },
    {
        "id": "turn_14",
        "chapter": 5,
        "chapter_title": "生活浸润与冲泡真知：如何让三根金丝物尽其用？",
        "host": "A",
        "speaker": "扎西",
        "voice": "zh-CN-YunjianNeural",
        "rate": "-6%",
        "text": "大家看干花的外观，每一根特级锦丝都是自然的三裂柱头，顶端膨大呈喇叭口状，深红色带有自然油润光泽。在西藏传统文化里，三根金丝泡一杯热茶，慢啜细品，微苦而回甘，既养心宁神，又顺气活血。",
        "media_event": "NONE"
    },
    {
        "id": "turn_15",
        "chapter": 5,
        "chapter_title": "生活浸润与冲泡真知：如何让三根金丝物尽其用？",
        "host": "C",
        "speaker": "莉莉",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "好的听众朋友们，今天这期节目先把产区、种植和真伪的证据链讲透。屏幕下方的提问键随时为您敞开，无论您对药典指标、冲泡水温还是保存方法有任何疑问，按住开麦，扎西老师和林博士就在演播室现场，随时为您解答！",
        "media_event": "SHOW_COVER"
    }
]

print(f"Starting master podcast generation ({len(podcast_script)} turns)...")

manifest = []

for idx, item in enumerate(podcast_script):
    filename = f"{item['id']}_{item['host']}.mp3"
    out_server = os.path.join(AUDIO_DIR, filename)
    out_mini = os.path.join(MINI_AUDIO_DIR, filename)
    out_web = os.path.join(WEB_AUDIO_DIR, filename)

    print(f"[{idx+1}/{len(podcast_script)}] Synthesizing {item['speaker']} ({item['id']})...")
    
    cmd = [
        EDGE_TTS,
        f"--voice={item['voice']}",
        f"--rate={item['rate']}",
        f"--text={item['text']}",
        f"--write-media={out_server}"
    ]
    subprocess.run(cmd, check=True)
    
    # 针对微信小程序，做轻量压缩（24kbps单声道，音质纯净且体积极其轻小，每个语音仅30~70KB）
    cmd_ffmpeg = f"ffmpeg -y -i {out_server} -b:a 32k -ar 24000 -ac 1 {out_mini} 2>/dev/null && cp {out_mini} {out_web}"
    subprocess.run(cmd_ffmpeg, shell=True, check=True)

    manifest.append({
        "id": item["id"],
        "chapter": item["chapter"],
        "chapter_title": item["chapter_title"],
        "host": item["host"],
        "speaker": item["speaker"],
        "desc": item["text"][:36] + "...",
        "text": item["text"],
        "media_event": item["media_event"],
        "file": f"/assets/audio/master/{filename}",
        "url": f"http://192.168.1.6:3000/audio/master/{filename}"
    })

manifest_path = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/Core/Knowledge/EPISODE_01_MANIFEST.json"
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

# 同时写入小程序与前端配置
mini_manifest_path = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/miniprogram/playlist_master.js"
with open(mini_manifest_path, "w", encoding="utf-8") as f:
    f.write("module.exports = " + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n")

print("Master Podcast Audio & Manifest generated successfully!")

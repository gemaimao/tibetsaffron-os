import subprocess
import os

AUDIO_DIR = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/web/assets/audio"
EDGE_TTS = "/opt/miniconda3/bin/edge-tts"

lines = [
    {
        "id": "line_01",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "听众朋友们大家晚上好，这里是《雪域林泉·藏红花电台》。今天茶室里坐着阿龙老师和林博士，咱们来聊聊市面上被传得神乎其神的天王级藏红花。"
    },
    {
        "id": "line_02",
        "voice": "zh-CN-YunjianNeural",
        "rate": "-6%",
        "text": "莉莉好，林博士好。其实在林芝海拔三千一百米的基地，采花工人早晨六点就要迎着薄霜出发。真正的天王级，三千朵花里才能挑出一克特级锦丝。"
    },
    {
        "id": "line_03",
        "voice": "zh-CN-YunyangNeural",
        "rate": "+0%",
        "text": "从现代科学的角度看，很多人以为越红越好，这其实是个典型盲区。真正决定品质的是高活性番红花苷和藏红花苦素的保留率。"
    },
    {
        "id": "line_04",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+2%",
        "text": "对！很多朋友问我：我买的藏红花一冲水反而是金黄色的，是不是被骗了？林博士你怎么看？"
    },
    {
        "id": "line_05",
        "voice": "zh-CN-YunyangNeural",
        "rate": "-2%",
        "text": "天然番红花苷是强水溶性天然组分，在纯净水溶液中表现出的特征光谱恰恰是澄清的金黄色，绝非血红！"
    }
]

for item in lines:
    out_path = os.path.join(AUDIO_DIR, f"{item['id']}.mp3")
    cmd = [
        EDGE_TTS,
        "--voice", item["voice"],
        "--rate", item["rate"],
        "--text", item["text"],
        "--write-media", out_path
    ]
    print(f"Generating {item['id']} ({item['voice']})...")
    subprocess.run(cmd, check=True)

print("All 5 dialogue audio clips generated successfully!")

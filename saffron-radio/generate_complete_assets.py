import subprocess
import os

WEB_AUDIO = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/web/assets/audio"
MINI_AUDIO = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/miniprogram/assets/audio"
EDGE_TTS = "/opt/miniconda3/bin/edge-tts"

extra_lines = [
    {
        "id": "bargein_lily",
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "+4%",
        "text": "大家先稍等一下！现场有位听众朋友接入了互动提问：藏红花泡水为什么是金黄色而不是红色？林博士，请您给咱们听众朋友权威剖析一下！"
    },
    {
        "id": "bargein_lin",
        "voice": "zh-CN-YunyangNeural",
        "rate": "+0%",
        "text": "这位听众问得非常专业！依据《中国药典》标准，正品藏红花的柱头组织含有大量天然水溶性藏红花苷，遇水会徐徐下沉并释放出通透纯正的金黄色云雾。如果入水立刻泛出刺眼血红，或水质浑浊，反而是人工染色伪品！"
    }
]

for item in extra_lines:
    for target_dir in [WEB_AUDIO, MINI_AUDIO]:
        out_path = os.path.join(target_dir, f"{item['id']}.mp3")
        cmd = [
            EDGE_TTS,
            f"--voice={item['voice']}",
            f"--rate={item['rate']}",
            f"--text={item['text']}",
            f"--write-media={out_path}"
        ]
        print(f"Generating {item['id']} into {target_dir}...")
        subprocess.run(cmd, check=True)

# 合并生成 full_podcast.mp3
concat_file = "/tmp/podcast_concat_list.txt"
with open(concat_file, "w") as f:
    for f_id in ["line_01", "line_02", "line_03", "line_04", "line_05"]:
        f.write(f"file '{WEB_AUDIO}/{f_id}.mp3'\n")

for target_dir in [WEB_AUDIO, MINI_AUDIO]:
    full_out = os.path.join(target_dir, "full_podcast.mp3")
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_file,
        "-c", "copy",
        full_out
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"Synthesized full_podcast.mp3 in {target_dir}")

print("All extra audio assets generated and merged successfully!")

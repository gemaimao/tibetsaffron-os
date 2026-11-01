import subprocess
import os

WEB_AUDIO = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/web/assets/audio"
MINI_AUDIO = "/Users/longhl/.gemini/antigravity/scratch/brand-content-os/saffron-radio/miniprogram/assets/audio"
EDGE_TTS = "/opt/miniconda3/bin/edge-tts"

# 绝对精确的唯一真实源 (SSOT): 林芝海拔 2945 米智能温室基地，约100朵鲜花精选晒制1克干花丝
accurate_text = "莉莉好，林博士好。其实在林芝海拔两千九百四十五米的智能温室基地，采花工人早晨六点就要迎着薄霜出发。真正的天旺高品质花丝，一般来说一百朵鲜花才能精选晒制出一克特级干丝。"

for target_dir in [WEB_AUDIO, MINI_AUDIO]:
    out_path = os.path.join(target_dir, "line_02.mp3")
    cmd = [
        EDGE_TTS,
        "--voice=zh-CN-YunxiNeural",
        "--rate=-2%",
        f"--text={accurate_text}",
        f"--write-media={out_path}"
    ]
    subprocess.run(cmd, check=True)
    print(f"Regenerated 2945m line_02.mp3 in {target_dir}")

# 重新合并生成 full_podcast.mp3
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

# 压缩保持在小程序轻量限制
subprocess.run(
    "ffmpeg -y -i " + os.path.join(MINI_AUDIO, "line_02.mp3") + " -b:a 24k -ar 22050 -ac 1 /tmp/l02.mp3 2>/dev/null && mv /tmp/l02.mp3 " + os.path.join(MINI_AUDIO, "line_02.mp3"),
    shell=True, check=True
)
subprocess.run(
    "ffmpeg -y -i " + os.path.join(MINI_AUDIO, "full_podcast.mp3") + " -b:a 24k -ar 22050 -ac 1 /tmp/fp.mp3 2>/dev/null && mv /tmp/fp.mp3 " + os.path.join(MINI_AUDIO, "full_podcast.mp3"),
    shell=True, check=True
)

print("line_02 and full_podcast 2945m SSOT calibration complete!")

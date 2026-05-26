#!/usr/bin/env bash
# 生成 120 秒可循环的轻柔环境 BGM（程序合成，无版权）
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="${DIR}/default-bgm.mp3"

echo "生成环境 BGM → ${OUT}"
ffmpeg -y \
  -f lavfi -i "sine=frequency=261.63:duration=120" \
  -f lavfi -i "sine=frequency=329.63:duration=120" \
  -f lavfi -i "sine=frequency=392:duration=120" \
  -f lavfi -i "sine=frequency=523.25:duration=120" \
  -f lavfi -i "anoisesrc=color=pink:duration=120:amplitude=0.02" \
  -filter_complex "\
[0:a]volume=0.18,tremolo=f=0.11:d=0.65[a0];\
[1:a]volume=0.14,tremolo=f=0.14:d=0.58[a1];\
[2:a]volume=0.11,tremolo=f=0.17:d=0.52[a2];\
[3:a]volume=0.08,afade=t=in:st=0:d=4[a3];\
[4:a]lowpass=f=500,volume=0.25[bed];\
[a0][a1][a2][a3][bed]amix=inputs=5:duration=longest,\
highpass=f=90,lowpass=f=3600,\
aecho=0.5:0.32:800:0.2,\
volume=3,\
loudnorm=I=-18:TP=-2:LRA=11,\
afade=t=in:st=0:d=3,\
afade=t=out:st=112:d=8" \
  -c:a libmp3lame -q:a 2 \
  "$OUT"

echo "完成: $(ls -lh "$OUT" | awk '{print $5}')"
ffmpeg -i "$OUT" -af volumedetect -f null - 2>&1 | grep mean_volume || true

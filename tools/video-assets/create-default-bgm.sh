#!/usr/bin/env bash
# 生成 90 秒可循环的环境 BGM（无版权，程序合成）
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="${DIR}/default-bgm.mp3"

echo "生成默认 BGM → ${OUT}"
ffmpeg -y \
  -f lavfi -i "sine=frequency=130.81:duration=90" \
  -f lavfi -i "sine=frequency=164.81:duration=90" \
  -f lavfi -i "sine=frequency=196:duration=90" \
  -filter_complex "\
[0:a]volume=0.055[a0];\
[1:a]volume=0.045[a1];\
[2:a]volume=0.035[a2];\
[a0][a1][a2]amix=inputs=3,\
lowpass=f=2800,\
tremolo=f=0.8:d=0.45,\
dynaudnorm=f=75:g=7,\
afade=t=in:st=0:d=2,\
afade=t=out:st=83:d=7" \
  -c:a libmp3lame -q:a 6 \
  "$OUT"

echo "完成: $(ls -lh "$OUT" | awk '{print $5}')"

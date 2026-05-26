#!/usr/bin/env bash
# 将任意 MP3/WAV 设为周刊视频 BGM（归一化后写入 custom-bgm.mp3）
# 用法: bash tools/video-assets/set-bgm.sh ~/Downloads/大唐豪侠-主界面.mp3
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="${DIR}/custom-bgm.mp3"
SRC="${1:-}"

if [[ -z "$SRC" || ! -f "$SRC" ]]; then
  echo "用法: bash tools/video-assets/set-bgm.sh <音乐文件.mp3|.wav|.m4a>"
  echo ""
  echo "示例:"
  echo "  bash tools/video-assets/set-bgm.sh ~/Music/datang-hero.mp3"
  exit 1
fi

echo "处理 BGM: $SRC"
echo "输出 → $OUT"
ffmpeg -y -i "$SRC" \
  -af "highpass=f=80,lowpass=f=12000,loudnorm=I=-18:TP=-2:LRA=11" \
  -c:a libmp3lame -q:a 2 \
  "$OUT"

echo "✓ 已设置 custom-bgm.mp3"
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT" 2>/dev/null | xargs -I{} echo "  时长: {} 秒"
echo ""
echo "重新生成视频:"
echo "  node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01-naval-ravikant"

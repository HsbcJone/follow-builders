#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"

LOGIN=""
for f in "${DIR}"/xiaohongshu-login-*; do
  [[ -x "$f" ]] && LOGIN="$f" && break
done

if [[ -z "$LOGIN" ]]; then
  echo "未找到登录工具，请先运行: bash tools/xiaohongshu-mcp/setup.sh"
  exit 1
fi

echo "即将打开浏览器，请用小红书 App 扫码登录..."
exec "$LOGIN"

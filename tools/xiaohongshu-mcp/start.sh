#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
DATA="${DIR}/data"
mkdir -p "$DATA"

MCP=""
for f in "${DIR}"/xiaohongshu-mcp-*; do
  [[ -x "$f" ]] && [[ "$f" != *login* ]] && MCP="$f" && break
done

if [[ -z "$MCP" ]]; then
  echo "未找到 MCP 服务，请先运行: bash tools/xiaohongshu-mcp/setup.sh"
  exit 1
fi

export XHS_COOKIE_PATH="${DATA}/cookies.json"
PORT="${XHS_MCP_PORT:-18060}"

echo "启动 xiaohongshu-mcp → http://localhost:${PORT}/mcp"
echo "Cookie: ${XHS_COOKIE_PATH}"
echo "按 Ctrl+C 停止"
echo ""

exec "$MCP" -port ":${PORT}"

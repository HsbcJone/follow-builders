#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=_mcp_flags.sh
source "${DIR}/_mcp_flags.sh"

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
PORT="$(xhs_mcp_port)"
HEADLESS_FLAG="$(xhs_mcp_headless_flag)"

mode="非无头"
[[ "${XHS_HEADLESS:-0}" == "1" ]] && mode="无头"
echo "启动 xiaohongshu-mcp (${mode}) → http://localhost:${PORT}/mcp"
echo "Cookie: ${XHS_COOKIE_PATH}"
echo "按 Ctrl+C 停止"
echo ""

# shellcheck disable=SC2086
exec "$MCP" -port ":${PORT}" ${HEADLESS_FLAG}

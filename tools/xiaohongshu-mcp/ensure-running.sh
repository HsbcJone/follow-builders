#!/usr/bin/env bash
# 若 xiaohongshu-mcp 未运行则在后台启动（默认非无头，降风控）
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=_mcp_flags.sh
source "${DIR}/_mcp_flags.sh"

DATA="${DIR}/data"
mkdir -p "$DATA"

PORT="$(xhs_mcp_port)"
PIDFILE="${DATA}/xhs-mcp.pid"
LOG="${DATA}/mcp.log"
HEADLESS_FLAG="$(xhs_mcp_headless_flag)"

mcp_ping() {
  curl -sf -m 3 -X POST "http://localhost:${PORT}/mcp" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"ensure-running","version":"1"}},"id":1}' \
    >/dev/null 2>&1
}

find_mcp_bin() {
  local f
  for f in "${DIR}"/xiaohongshu-mcp-*; do
    [[ -x "$f" ]] && [[ "$f" != *login* ]] && echo "$f" && return 0
  done
  return 1
}

start_mcp_bg() {
  local MCP="$1"
  export XHS_COOKIE_PATH="${DATA}/cookies.json"
  # shellcheck disable=SC2086
  nohup "$MCP" -port ":${PORT}" ${HEADLESS_FLAG} >>"$LOG" 2>&1 &
  echo $! >"$PIDFILE"
}

# 需要非无头但当前是无头 → 重启
if mcp_ping && [[ "${XHS_HEADLESS:-0}" != "1" ]]; then
  running_pid=""
  if [[ -f "$PIDFILE" ]]; then
    running_pid="$(cat "$PIDFILE" 2>/dev/null || true)"
  fi
  if [[ -z "$running_pid" ]] || ! kill -0 "$running_pid" 2>/dev/null; then
    running_pid="$(lsof -ti ":${PORT}" 2>/dev/null | head -1 || true)"
  fi
  if [[ -n "$running_pid" ]] && xhs_mcp_is_non_headless_pid "$running_pid"; then
    echo "✓ xiaohongshu-mcp 已在运行 (非无头, localhost:${PORT})"
    exit 0
  fi
  echo "检测到无头/旧 MCP 进程，重启为非无头…"
  xhs_mcp_kill_port "$PORT"
  rm -f "$PIDFILE"
elif mcp_ping; then
  echo "✓ xiaohongshu-mcp 已在运行 (localhost:${PORT})"
  exit 0
fi

MCP="$(find_mcp_bin)" || {
  echo "未找到 MCP 二进制，请先运行: bash tools/xiaohongshu-mcp/setup.sh"
  exit 1
}

if [[ -f "$PIDFILE" ]]; then
  old_pid="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${old_pid:-}" ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "等待已有进程 (pid $old_pid) 就绪…"
    for _ in $(seq 1 20); do
      if mcp_ping; then
        echo "✓ xiaohongshu-mcp 已就绪"
        exit 0
      fi
      sleep 1
    done
  fi
fi

mode="非无头"
[[ "${XHS_HEADLESS:-0}" == "1" ]] && mode="无头"
echo "正在后台启动 xiaohongshu-mcp (${mode}, -port :${PORT})…"
start_mcp_bg "$MCP"
echo "pid $(cat "$PIDFILE")，日志: $LOG"

for _ in $(seq 1 45); do
  if mcp_ping; then
    echo "✓ xiaohongshu-mcp 已就绪 → http://localhost:${PORT}/mcp"
    exit 0
  fi
  sleep 1
done

echo "✗ 启动超时，查看日志: $LOG"
exit 1

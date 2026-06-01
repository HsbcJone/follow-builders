# shellcheck shell=bash
# 小红书 MCP 启动参数（source 此文件）
# 默认非无头（降风控）；仅调试时: XHS_HEADLESS=1

xhs_mcp_port() {
  echo "${XHS_MCP_PORT:-18060}"
}

xhs_mcp_headless_flag() {
  if [[ "${XHS_HEADLESS:-0}" == "1" ]]; then
    echo ""
  else
    echo "-headless=false"
  fi
}

xhs_mcp_is_non_headless_pid() {
  local pid="$1"
  [[ -n "$pid" ]] || return 1
  ps -p "$pid" -o command= 2>/dev/null | grep -q 'headless=false'
}

xhs_mcp_kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti ":${port}" 2>/dev/null || true)
  [[ -z "$pids" ]] && return 0
  echo "$pids" | xargs kill 2>/dev/null || true
  sleep 2
}

#!/usr/bin/env bash
# 下载 xiaohongshu-mcp 官方 Release（macOS arm64 / amd64）
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
ARCH="$(uname -m)"
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"

case "${OS}-${ARCH}" in
  darwin-arm64)  ASSET="xiaohongshu-mcp-darwin-arm64.tar.gz" ;;
  darwin-x86_64) ASSET="xiaohongshu-mcp-darwin-amd64.tar.gz" ;;
  linux-x86_64)  ASSET="xiaohongshu-mcp-linux-amd64.tar.gz" ;;
  *)
    echo "不支持的平台: ${OS} ${ARCH}"
    echo "请手动从 https://github.com/xpzouying/xiaohongshu-mcp/releases 下载"
    exit 1
    ;;
esac

API="https://api.github.com/repos/xpzouying/xiaohongshu-mcp/releases/latest"
TAG=$(curl -fsSL "$API" | python3 -c "import sys,json; print(json.load(sys.stdin)['tag_name'])")
URL="https://github.com/xpzouying/xiaohongshu-mcp/releases/download/${TAG}/${ASSET}"

echo "下载 ${TAG} / ${ASSET} ..."
curl -fL --retry 3 --progress-bar -o "${DIR}/xhs-mcp.tar.gz" "$URL"
tar -xzf "${DIR}/xhs-mcp.tar.gz" -C "${DIR}"
rm -f "${DIR}/xhs-mcp.tar.gz"
chmod +x "${DIR}"/xiaohongshu-* 2>/dev/null || true

echo ""
echo "已安装到: ${DIR}"
ls -la "${DIR}" | grep -E 'xiaohongshu|login' || ls -la "${DIR}"
echo ""
echo "下一步:"
echo "  1. bash tools/xiaohongshu-mcp/login.sh   # 扫码登录"
echo "  2. bash tools/xiaohongshu-mcp/start.sh   # 启动 MCP"
echo "  3. 重启 Cursor"

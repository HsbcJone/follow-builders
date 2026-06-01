# xiaohongshu-mcp 本地服务

基于 [xpzouying/xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp)。

## 安装

```bash
bash tools/xiaohongshu-mcp/setup.sh
```

约 18MB，首次启动还会下载 Chromium。

## 登录（一次性）

```bash
bash tools/xiaohongshu-mcp/login.sh
```

用小红书 App 扫码。

## 自动启动（/publish-xhs 默认）

- **非无头** `-headless=false`（降风控；调试：`XHS_HEADLESS=1`）
- 未运行时后台启动；若检测到旧的无头进程会自动重启

```bash
node .cursor/skills/wisdom-weekly/scripts/publish-to-xhs.js week-XX-人名
```

服务地址：`http://localhost:18060/mcp`

## 手动前台启动（调试用）

```bash
bash tools/xiaohongshu-mcp/start.sh
```

## Cursor

项目已配置 `.cursor/mcp.json`，**重启 Cursor** 后可用 MCP 工具。

发布：在 Cursor 输入 `/publish-xhs`

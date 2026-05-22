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

## 启动 MCP（保持运行）

```bash
bash tools/xiaohongshu-mcp/start.sh
```

服务地址：`http://localhost:18060/mcp`

## Cursor

项目已配置 `.cursor/mcp.json`，**重启 Cursor** 后可用 MCP 工具。

发布：在 Cursor 输入 `/publish-xhs`

---
name: publish-xiaohongshu
description: >-
  将智者周刊产出发布到小红书。依赖 xiaohongshu-mcp（localhost:18060）。
  默认非无头 + 最多 9 图 + 发布前随机延迟（降风控）。
  使用 /publish-xhs 或 /publish-xhs week-01 触发。
---

# Publish to Xiaohongshu — 发布小红书

## 风控策略（默认启用，用户无需配置）

| 措施 | 实现 |
|------|------|
| **非无头浏览器** | MCP 启动带 `-headless=false`；旧无头进程自动重启 |
| **限图 6–9 张** | `page-01`…最多 **9** 张；超过则截断（如 11→9） |
| **发布前延迟** | 随机 **30–90 秒** 再调 `publish_content` |
| **窄工具链** | 仅 `check_login_status` + `publish_content`，**禁止** list_feeds / 点赞 / 评论 |

调试：`XHS_HEADLESS=1` 恢复无头；`--no-delay` 跳过等待。

## 触发方式

- `/publish-xhs` — 发布 currentWeek
- `/publish-xhs week-02-charlie-munger` — 指定期数
- `/publish-xhs preview` — 只生成 `xiaohongshu-post.md`

## 工作流（Agent 必须按序执行）

### Step 1: 运行前置脚本（必做，一条命令）

```bash
node .cursor/skills/wisdom-weekly/scripts/publish-to-xhs.js week-XX-人名
```

脚本自动：

1. `ensure-xhs-mcp.js` → 非无头 MCP
2. 读取 `xiaohongshu-post.md`，截断图片至 ≤9 张
3. **随机等待 30–90s**
4. 输出 JSON 载荷 + 写入 `xhs-publish-payload.json`

**禁止**跳过此脚本直接 `publish_content`（除非用户明确 `--no-delay --no-ensure` 调试）。

### Step 2: 检查登录

MCP `check_login_status`（server 可能是 `project-0-follow-builders-xiaohongshu-mcp`）。

未登录 → `get_login_qrcode` 扫码。

### Step 3: 发布

用 Step 1 输出的 **images 数组**（已截断）调用 `publish_content`：

- `title` / `content` / `tags` / `visibility` 来自载荷
- **images 必须用载荷里的路径，不要用目录下全部 page-*.png**

### Step 4: 汇报

标题、实际图片张数（如 9/11）、建议 App 核对。

## 首次设置（一次性）

```bash
bash tools/xiaohongshu-mcp/setup.sh
bash tools/xiaohongshu-mcp/login.sh
```

## 若仍收风控预警

再考虑 **方案 B**：[x-mcp 浏览器插件](https://github.com/xpzouying/x-mcp)。

## 注意事项

- 同一账号勿多网页端同时登录
- 每周 1 条、勿固定同一分钟发
- 首图 `page-01.png`

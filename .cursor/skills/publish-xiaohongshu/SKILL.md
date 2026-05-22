---
name: publish-xiaohongshu
description: >-
  将智者周刊产出发布到小红书。依赖 xiaohongshu-mcp（localhost:18060）。
  使用 /publish-xhs 或 /publish-xhs week-01 触发；与 wisdom-weekly 串联。
---

# Publish to Xiaohongshu — 发布小红书

将 `output/week-XX-人名/` 下的 PNG 卡片和文案发布到小红书。

## 前置条件

1. **xiaohongshu-mcp 已安装并运行**（见下方「首次设置」）
2. **Cursor 已配置 MCP**：项目 `.cursor/mcp.json` 含 `xiaohongshu-mcp`
3. **已登录小红书**：`check_login_status` 返回已登录

首次设置（用户只需做一次）：

```bash
# 1. 下载二进制（约 18MB）
bash tools/xiaohongshu-mcp/setup.sh

# 2. 扫码登录（会打开浏览器）
bash tools/xiaohongshu-mcp/login.sh

# 3. 启动 MCP 服务（保持终端运行）
bash tools/xiaohongshu-mcp/start.sh
```

然后 **重启 Cursor**，使 MCP 生效。

## 触发方式

- `/publish-xhs` — 发布当前最新一期（`people/_index.json` 的 currentWeek）
- `/publish-xhs week-01` — 发布指定期数目录
- `/publish-xhs preview` — 只生成文案草稿，不发布

## 工作流

### Step 1: 检查 MCP 与登录

调用 MCP 工具 `check_login_status`。

- 未登录 → 调用 `get_login_qrcode`，提示用户用小红书 App 扫码，轮询直到登录成功
- 服务不可用 → 提示用户运行 `bash tools/xiaohongshu-mcp/start.sh`

### Step 2: 定位产出目录

读取 `.cursor/skills/wisdom-weekly/people/_index.json`，或用户指定的 `week-XX`。

目录示例：`output/week-01-naval-ravikant/`

必须存在：
- `page-01.png` … `page-N.png`（至少 1 张，建议 3–9 张）
- 可选：`xiaohongshu-post.md`（已有人工审过的文案）

### Step 3: 生成小红书文案

若无 `xiaohongshu-post.md`，读取 `prompts/xiaohongshu-caption.md` 并基于：
- 同期 `wechat-article.md`（缩短）
- 人物档案 tagline / themes
- 本期 PDF 章节标题

生成并写入 `output/week-XX-人名/xiaohongshu-post.md`：

```markdown
---
title: "标题（≤20字）"
tags: ["成长", "思维", "纳瓦尔"]
visibility: "公开可见"
images_mode: "carousel"  # 使用 page-*.png 顺序
---

正文内容（≤1000字，含 emoji 适度、分段、引导收藏）
```

**硬性限制（小红书平台）**
- 标题：**不超过 20 个字**
- 正文：**不超过 1000 个字**
- 图片：本地**绝对路径**，至少 1 张

### Step 4: 用户确认（默认）

除非用户明确说「直接发布 / 跳过确认」，否则：
1. 展示标题、正文预览、图片列表
2. 询问是否发布或修改

### Step 5: 调用 MCP 发布

使用 `publish_content`：

| 参数 | 说明 |
|------|------|
| `title` | 来自 frontmatter，≤20 字 |
| `content` | 正文（不含标题） |
| `images` | **绝对路径**数组，按 page-01 … page-N 排序 |
| `tags` | 可选，3–5 个话题 |
| `visibility` | 默认 `公开可见` |

图片路径示例：

```
/Users/mengxp/Desktop/code/follow-builders/output/week-01-naval-ravikant/page-01.png
```

使用 `path.resolve` 或项目根目录拼接，**不要用相对路径**。

### Step 6: 汇报结果

发布成功后告知：
- 使用的标题与图片数量
- 建议用户在小红书 App 核对是否显示
- 若失败：建议 `-headless=false` 重试或检查风控

## 与 wisdom-weekly 串联

完整流水线：

```
/wisdom  →  生成 PDF/PNG + wechat-article.md
    ↓
/publish-xhs preview  →  生成 xiaohongshu-post.md 供审阅
    ↓
/publish-xhs  →  确认后 publish_content
```

可在 wisdom-weekly 完成后主动提示：「是否执行 /publish-xhs preview？」

## 注意事项

- 同一账号不要在其他网页端同时登录，会踢掉 MCP 会话
- 建议专用发布号、控制发帖频率
- 首图用 `page-01.png`（封面），后续为内容页
- 不要用违禁词；引流话术适度

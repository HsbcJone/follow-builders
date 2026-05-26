---
name: publish-wechat
description: >-
  将智者周刊 wechat-article.md 推送到微信公众号草稿箱（官方 API）。
  企业已认证公众号。使用 /publish-wechat 触发，与 wisdom-weekly 串联。
---

# Publish to WeChat — 发布微信公众号

将 `output/week-XX-人名/` 下的 **wechat-article.md** 与 **page-01.png**（封面）推送到公众号**草稿箱**。

## 前置条件

1. **企业公众号 + 微信认证**（用户已完成）
2. 项目根目录 **`.env`**（从 `.env.example` 复制）：

```env
WECHAT_APP_ID=wx09fa08ff99ebb53f
WECHAT_APP_SECRET=你的AppSecret
WECHAT_AUTHOR=心智升级生长志
```

3. **IP 白名单**：在 [公众平台](https://mp.weixin.qq.com/) → 设置与开发 → 基本配置 → 配置调用 API 的服务器 IP（本机公网 IP）
4. 本期已有 `wechat-article.md`、`page-01.png`（封面横图由脚本自动生成，见 `wechat-format-rules.md`）

AppSecret 在「基本配置」中生成，**只显示一次**，勿提交 Git。

## 触发方式

- `/publish-wechat` — 推送到草稿箱（默认，推荐）
- `/publish-wechat week-01-naval-ravikant` — 指定期数
- `/publish-wechat preview` — 等同 `--dry-run`，只校验不调用 API
- `/publish-wechat --submit` — 草稿创建后**立即调用发表 API**（确认已填「我的思考」再用）

## 工作流

### Step 1: 检查配置与文件

```bash
node .cursor/skills/wisdom-weekly/scripts/publish-to-wechat.js week-01-naval-ravikant
```

缺 `.env` 或文章 → 提示用户补全。

### Step 2: 自动校验与封面

脚本会自动：

- 校验「我的思考」非占位符、「3 件事」为 **1.** **2.** **3.** 格式
- 从 `page-01.png` 生成 `wechat-cover.jpg`（2.35:1）并上传为草稿封面

详见 `wisdom-weekly/wechat-format-rules.md`。

### Step 3: 执行发布（Agent 运行）

在项目根目录：

```bash
# 仅校验
node .cursor/skills/wisdom-weekly/scripts/publish-wechat.js week-01-naval-ravikant --dry-run

# 推送到草稿箱（默认）
node .cursor/skills/wisdom-weekly/scripts/publish-wechat.js week-01-naval-ravikant
```

成功后会写入 `wechat-publish-meta.json`（含 `media_id`）。

### Step 4: 汇报

告知用户：

- 标题、草稿 `media_id`
- 打开 https://mp.weixin.qq.com/ → **草稿箱** 预览
- 发表方式：后台手动发表，或确认后 `--submit`

## 与小红书对比

| | 小红书 | 微信公众号 |
|---|--------|------------|
| 方式 | xiaohongshu-mcp（浏览器） | **官方 API**（本脚本） |
| 命令 | `/publish-xhs` | `/publish-wechat` |
| 默认 | 直接发布 | **先进草稿箱**（更安全） |

## 完整流水线

```
/wisdom
/publish-xhs preview → /publish-xhs
/publish-wechat preview → /publish-wechat
/generate-video
```

## 常见错误

| errcode | 处理 |
|---------|------|
| 40164 / 61004 | 配置 IP 白名单 |
| 48001 | 接口未授权，检查认证状态 |
| 40007 | 封面 media_id 无效，重新上传封面 |

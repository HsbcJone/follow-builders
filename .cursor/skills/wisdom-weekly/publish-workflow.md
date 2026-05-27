# 智者周刊 · 发布顺序（固定流程）

每期内容生成后，**按此顺序**发布。Agent 提示用户时遵循本文件，勿建议「先发文再发视频」若用户需在文中插入视频号。

## 总览

| 步骤 | 做什么 | 自动化 | 说明 |
|------|--------|--------|------|
| 1 | `/wisdom` | 半自动 | 生成 PDF、文章、卡片 |
| 2 | `/publish-xhs` | ✅ MCP | 发小红书 |
| 3 | `/generate-video` | ✅ 脚本 | 生成 `wisdom-video.mp4` |
| 4 | **视频号发表** | ❌ 手动 | 上传视频、填文案、发表 |
| 5 | **公众号插入视频** | ❌ 手动 | 草稿里「插入 → 视频号」选已发视频 |
| 6 | **公众号发表** | 半自动 | 审阅后后台发表，或 `/publish-wechat --submit` |

## 详细步骤

### 1–2. 内容与小红书

```bash
/wisdom
/publish-xhs preview   # 可选
/publish-xhs
```

### 3. 生成视频文件

```bash
/generate-video
# 或
node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-XX-人名
```

产出：`wisdom-video.mp4`、`video-thumb.jpg`、`channels-video-post.md`

### 4. 手动：视频号发表（必须先完成）

1. 打开 [视频号助手](https://channels.weixin.qq.com/)
2. 上传 `wisdom-video.mp4`
3. 文案见 `channels-video-post.md`（短标题、描述、合集「智者周刊」）
4. 勾选原创声明 → **发表**

> **原因**：未发表的视频无法被公众号编辑器「插入视频号」选中。

### 5. 手动：公众号草稿中插入视频

1. 若尚未推送草稿：先 `/publish-wechat`（或草稿箱已有该期）
2. 打开 [公众平台](https://mp.weixin.qq.com/) → **草稿箱** → 编辑该文
3. 光标放在合适位置（如「我的思考」前）
4. **插入 → 视频号** → 选择**刚发表**的那条视频
5. 保存草稿

### 6. 公众号发表

- 补全「我的思考」等 → **发表**
- 可选：视频号那条视频的 **链接** 选本篇已发公众号文章（双向引流）

## 与脚本的对应关系

| 脚本 | 时机 |
|------|------|
| `publish-wechat.js` | 可在步骤 4 **之前**推草稿（仅文字+封面）；**插入视频号**必须在步骤 4 **之后**手动完成 |
| `publish-wechat.js --submit` | 确认已插入视频后再用，否则读者看不到视频 |

## 不要做的事

- ❌ 在视频号未发表前，指望 API 自动把视频插入公众号（无此接口）
- ❌ 删除 `output/` 下其他 `week-*` 目录
- ❌ 把 `.env`、AppSecret 提交 Git

## 一期 checklist（可复制）

```
[ ] /wisdom
[ ] /publish-xhs
[ ] /generate-video
[ ] 视频号助手：上传并发表 wisdom-video.mp4
[ ] 公众号草稿：插入 → 视频号（选已发视频）
[ ] 公众号：发表图文
[ ] （可选）视频号链接 → 本篇公众号文章
```

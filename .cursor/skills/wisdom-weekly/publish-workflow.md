# 智者周刊 · 发布顺序（固定流程）

每期内容生成后，**按此顺序**发布。

## 总览

| 步骤 | 做什么 | 自动化 | 说明 |
|------|--------|--------|------|
| 1 | `/wisdom` | 半自动 | 生成 PDF、文章、卡片 |
| 2 | `/publish-xhs` | ✅ MCP | 非无头 + ≤9 图 + 延迟后发布 |
| 3 | `/generate-video` | ✅ 脚本 | 生成 `wisdom-video.mp4` |
| 4 | **视频号发表** | ❌ 手动 | 文案见 `channels-video-post.md` |
| 5 | `/publish-wechat` | ✅ 脚本 | 推草稿（含「本期视频」引导文案） |
| 6 | **公众号发表** | ❌ 手动 | 草稿箱编辑、发表 |

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

### 4. 视频号发表

文案见 `channels-video-post.md` 上传表单（描述、短标题、话题等）。

视频号链接可记入 `wechat-publish-meta.json` 的 `channels_video_url`，**不**写入公众号正文。

### 5. 公众号草稿

```bash
/publish-wechat week-XX-人名
```

`wechat-article.md` 已含固定「本期视频」引导行（见 `wechat-format-rules.md`），格式：

`📺 1 分钟看懂本期 · {主题短句}，左滑视频配合下文阅读`

### 6. 公众号发表

草稿箱审阅 → 发表。

## 与脚本的对应关系

| 脚本 | 说明 |
|------|------|
| `publish-wechat.js` | 推文字+封面到草稿箱；**无法** API 嵌入视频号卡片 |
| `publish-wechat.js --submit` | 确认草稿定稿后再用 |

## 不要做的事

- ❌ 在 `wechat-article.md` 写 `sph` 链接或「请插入视频号」教程
- ❌ 指望 API 自动嵌入可播放的视频号
- ❌ 删除 `output/` 下其他 `week-*` 目录
- ❌ 把 `.env`、AppSecret 提交 Git

## 一期 checklist（可复制）

```
[ ] /wisdom
[ ] /publish-xhs
[ ] /generate-video
[ ] 视频号发表（channels-video-post.md）
[ ] /publish-wechat
[ ] 公众号发表
```

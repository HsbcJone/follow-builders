---
name: generate-weekly-video
description: >-
  将智者周刊每期 page-*.png 合成为竖屏 MP4，供视频号/抖音手动发布。
  使用 /generate-video 触发，在 PDF/小红书/公众号完成后使用。
---

# Generate Weekly Video — 生成周刊视频

把 `output/week-XX-人名/` 下的 **page-01.png … page-N.png** 合成为 **wisdom-video.mp4**（竖屏 1080×1440）。  
**不自动发视频号**——你只负责在 [视频号助手](https://channels.weixin.qq.com/) 上传并发表。

## 前置条件

1. 本期已运行 `generate-pdf.js`，目录内存在 `page-*.png`
2. 本机已安装 **ffmpeg**：`brew install ffmpeg`
3. 旁白依赖 **edge-tts CLI**（推荐）：`brew install edge-tts` 或 `pip install edge-tts`
4. BGM：**真实 MP3 配乐** → `bash tools/video-assets/set-bgm.sh /path/to/music.mp3`（见 `tools/video-assets/BGM.md`）

## 触发方式

- `/generate-video` — 根据 `people/_index.json` 的 `currentWeek` 找最近一期目录，或用户指定的最新 `output/week-*`
- `/generate-video week-01-naval-ravikant` — 指定期数目录名
- `/generate-video --seconds 5` — 每页停留 5 秒（默认 4 秒）

## 工作流

### Step 1: 定位产出目录

与 `publish-xiaohongshu` 相同规则：

- 读取 `.cursor/skills/wisdom-weekly/people/_index.json`，或用户指定的 `week-XX-人名`
- 目录示例：`output/week-01-naval-ravikant/`

必须存在：`page-01.png` … 至少 1 张。

### Step 2: 运行合成脚本

在**项目根目录**执行：

```bash
node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-XX-人名
# 可选：每页 5 秒
node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-XX-人名 --seconds 5
```

产出：

| 文件 | 说明 |
|------|------|
| `wisdom-video.mp4` | **开场首页**（5s）+ 全部 page 卡片 + 旁白 + BGM |
| `video-intro.png` | 视频开场标题页（自动生成，避免片头黑屏） |
| `video-thumb.jpg` | 视频号上传封面建议用此图 |
| `video-narration.txt` | 旁白稿（自动生成，可手工改写后重跑） |
| `channels-video-post.md` | 短标题、描述、发布检查清单 |

### Step 3: 文案（可选增强）

若已有 `xiaohongshu-post.md`，生成文案时优先用其标题。  
若用户需要更好描述，可基于 `wechat-article.md` 前 150 字改写 `channels-video-post.md` 正文（**视频号短标题须 ≥6 字**）。

### Step 4: 告知用户

输出：

- 视频绝对路径、大小、时长（页数 × 秒数）
- 提醒：视频号需勾选 **原创声明**、**内容标注**（按平台要求）
- 打开 `channels-video-post.md` 复制描述

## 与整条流水线

发布顺序见 `wisdom-weekly/publish-workflow.md`：

```
/wisdom
    ↓
/publish-xhs
    ↓
/generate-video          ← 本 skill
    ↓
【手动】视频号发表
    ↓
/publish-wechat
    ↓
【手动】公众号发表
```

`wechat-article.md` 含固定「本期视频」引导行，格式见 `wechat-format-rules.md`。

可在用户发完小红书/公众号后主动提示：「是否执行 /generate-video？」

## 技术说明

- 分辨率：1080×1440（与 PNG 卡片一致，9:16）
- 开场：`video-intro.png` 停留 5 秒（标题 + page-01 缩略图），**无片头黑屏淡入**
- 编码：H.264 + AAC 192kbps
- 旁白：`edge-tts` CLI，`zh-CN-XiaoxiaoNeural`（失败时回退 macOS `say`）
- BGM：`tools/video-assets/custom-bgm.mp3`（真实音乐；`--bgm` 指定路径；勿用合成噪声除非 `--synth-bgm`）
- 自定义旁白：编辑 `video-narration.txt` 后重新 `/generate-video`
- 无声版：`--no-audio`

## 故障排查

| 问题 | 处理 |
|------|------|
| 未找到 ffmpeg | `brew install ffmpeg` |
| 无 page-*.png | 先 `generate-pdf.js` |
| 视频过长 | `--seconds 3` 或减少页数 |
| 需要配音 | 后续可扩展 TTS；当前版本仅静图轮播 |

# Wisdom Weekly — 智者周刊

每周深度聚焦一位智者，生成精美 PDF（朋友圈 / 小红书）和微信公众号文章草稿；可对接 **xiaohongshu-mcp** 自动发小红书。

## 使用方式

### 生成内容

```
/wisdom              # 生成本周内容
/wisdom next         # 跳到下一位
/wisdom [人名]       # 指定人物
/publish-xhs preview # 生成小红书文案（不发布）
/publish-xhs         # 发布到小红书
/publish-wechat      # 推送到公众号草稿箱（含「本期视频」引导文案）
/generate-video      # 合成视频号用 MP4
```

**推荐发布顺序**（详见 `.cursor/skills/wisdom-weekly/publish-workflow.md`）：

1. 发小红书 → 2. 生成视频 → 3. 发视频号 → 4. `/publish-wechat` → 5. 发表公众号

### 目录结构

每期在 `output/` 下**单独一个文件夹**（如 `week-01-naval-ravikant`、`week-02-charlie-munger`）。  
**不会删除往期目录**；只有对**同一期**重新生成时才会覆盖该期内的文件（如重跑 PDF、视频、推送草稿）。

```
follow-builders/
├── output/                              # 每期产出（按 week-XX-人名 累积保留）
│   └── week-01-naval-ravikant/
│       ├── wisdom.pdf
│       ├── page-01.png …
│       ├── wechat-article.md
│       ├── xiaohongshu-post.md          # 小红书文案
│       ├── wisdom-video.mp4             # 视频号/抖音（/generate-video）
│       ├── video-intro.png / video-thumb.jpg  # 视频开场与封面建议
│       └── channels-video-post.md       # 视频发布文案与清单
├── tools/xiaohongshu-mcp/               # MCP 本地服务（setup 后）
└── .cursor/
    ├── mcp.json                         # 小红书 MCP 配置
    └── skills/
        ├── wisdom-weekly/
        └── publish-xiaohongshu/
```

## 生成 PDF

```bash
npm install --prefix .cursor/skills/wisdom-weekly/scripts
node .cursor/skills/wisdom-weekly/scripts/generate-pdf.js output/week-01-naval-ravikant/wisdom.html
```

## 小红书自动发布（xiaohongshu-mcp）

基于 [xpzouying/xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp)，**无官方发笔记 API**，通过本地 MCP 服务模拟发布。

### 一次性设置

```bash
# 1. 下载 MCP 二进制
bash tools/xiaohongshu-mcp/setup.sh

# 2. 扫码登录（小红书 App）
bash tools/xiaohongshu-mcp/login.sh
```

`/publish-xhs` 会自动：**非无头 MCP**、**最多 9 图**、**发布前随机等待 30–90s**。

### 发布流程

```bash
# 自动启动 MCP + 列出图片路径
node .cursor/skills/wisdom-weekly/scripts/publish-to-xhs.js week-01-naval-ravikant
```

在 Cursor 中：`/publish-xhs preview` → 审阅 `xiaohongshu-post.md` → `/publish-xhs`

### 注意

- 标题 ≤20 字，正文 ≤1000 字
- 勿在其他网页同时登录同一小红书账号
- 建议专用号、控制发帖频率

## 微信公众号自动发布（官方 API）

企业已认证公众号可使用 `/publish-wechat`，将 `wechat-article.md` 推入**草稿箱**。

### 一次性设置

1. 复制 `.env.example` → `.env`，填写 `WECHAT_APP_ID`、`WECHAT_APP_SECRET`
2. [公众平台](https://mp.weixin.qq.com/) → 基本配置 → **IP 白名单**（填本机公网 IP）
3. 安装依赖：`npm install --prefix .cursor/skills/wisdom-weekly/scripts`

### 发布

```bash
node .cursor/skills/wisdom-weekly/scripts/publish-to-wechat.js week-01-naval-ravikant
node .cursor/skills/wisdom-weekly/scripts/publish-wechat.js week-01-naval-ravikant
```

Cursor：`/publish-wechat`（默认草稿箱；确认内容后可选 `--submit` 自动发表）

## 生成视频（视频号 / 抖音）

每期 PNG 卡片合成为竖屏 MP4，**不自动发布**，你在 [视频号助手](https://channels.weixin.qq.com/) 自行上传。

依赖：

```bash
brew install ffmpeg edge-tts
bash tools/video-assets/create-default-bgm.sh
```

```bash
node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01-naval-ravikant
# 每页 5 秒：--seconds 5 | 无声：--no-audio
```

可选：编辑 `output/week-XX/video-narration.txt` 后重跑以更换旁白；BGM 可放 `tools/video-assets/custom-bgm.mp3`。

Cursor 中：`/generate-video` 或 `/generate-video week-01-naval-ravikant`

## 轮转

人物顺序见 `.cursor/skills/wisdom-weekly/people/_index.json`，共 30 期。

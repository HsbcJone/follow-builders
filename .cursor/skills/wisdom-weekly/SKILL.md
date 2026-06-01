---
name: wisdom-weekly
description: >-
  每周深度聚焦一位智者，生成精美 PDF 和微信公众号文章草稿。30 位中外智者轮转，
  PDF 用于朋友圈/小红书传播，公众号文章提供深度解读。
  使用 /wisdom 触发，或当用户提到智者周刊、名人智慧、每周智慧时自动激活。
---

# Wisdom Weekly — 智者周刊

你是一个智慧内容策展人。每周深度聚焦一位智者，生成两份内容：
1. **精美 PDF**（5-8 页）— 朋友圈/小红书传播用，同时生成逐页 PNG 卡片
2. **公众号文章草稿**（2500-3000 字）— 微信公众号深度解读

## 触发方式

- `/wisdom` — 生成本周的智者内容
- `/wisdom next` — 跳到下一位智者
- `/wisdom [人名]` — 指定人物生成
- `/wisdom list` — 查看完整人物名单和进度
- `/wisdom config` — 查看/修改配置

发布小红书（需先配置 xiaohongshu-mcp，见 `publish-xiaohongshu` skill）：

- `/publish-xhs` — 发布当前期到小红书
- `/publish-xhs preview` — 仅生成小红书文案草稿

发布公众号（企业已认证 + `.env` 配置 AppSecret，见 `publish-wechat` skill）：

- `/publish-wechat` — 推送到公众号草稿箱
- `/publish-wechat preview` — 仅校验，不调用 API

生成视频（视频号/抖音手动上传，见 `generate-weekly-video` skill）：

- `/generate-video` — 将本期 page-*.png 合成 `wisdom-video.mp4`
- `/generate-video week-01` — 指定期数目录

## 工作流

### Step 1: 确定本周人物

读取 `people/_index.json`，找到当前轮转到的人物。
如果用户指定了人名，使用指定的人物。

### Step 2: 读取人物档案

从 `people/international/` 或 `people/chinese/` 读取对应的 `.md` 档案。
档案包含：人物信息、核心哲学、重点提炼方向、标志性语录。

### Step 3: 提炼智慧内容

读取 `prompts/extract-wisdom.md`，按指令从档案中提炼 3-5 个深度洞察。

每个洞察包含：
- 中英标题
- **正文**：国际人物每段中文后必须跟对应英文段落（成对）；国内人物仅中文
- 核心洞察：中文提炼 + 英文/中文原文

国际人物 PDF 禁止「正文只有中文」——标题和核心洞察有英文但正文无英文视为不合格。

### Step 4: 生成 PDF

1. 读取 `prompts/design-guide.md` 确定该人物的视觉风格
2. 读取 `templates/wisdom-pdf.html` 模板
3. 将提炼好的内容填充到 HTML 模板中，替换以下变量：
   - `{{PERSON_NAME}}` — 英文名
   - `{{PERSON_NAME_ZH}}` — 中文名
   - `{{TAGLINE}}` — 人物标签
   - `{{STYLE_FILE}}` — CSS 风格文件名（philosopher/entrepreneur/classic-chinese/modern-thinker）
   - `{{SUBTITLE}}` — 英文副标题
   - `{{CHAPTER_PAGES}}` — 章节页 HTML（用模板中的章节结构）
   - `{{WEEK_NUMBER}}` — 期数
   - `{{NEXT_PERSON}}` — 下期人物
4. 将填充好的 HTML 写入 `output/week-XX-人名/wisdom.html`，并在同目录放置 `styles.css`（从模板提取样式 + 人物对应风格 CSS）
5. **每页必须中英双语**（标题、**正文段落成对**、核心洞察、页脚），结构见 `templates/chapter-page-snippet.html`
6. 运行脚本生成 PDF 和 PNG（在**项目根目录**执行）：

```bash
node .cursor/skills/wisdom-weekly/scripts/generate-pdf.js output/week-XX-人名/wisdom.html
```

脚本会在同目录下生成：
- `wisdom.pdf` — 完整 PDF
- `page-01.png` ~ `page-N.png` — 逐页 PNG 卡片（1080x1440px，小红书尺寸）

### Step 5: 生成公众号文章

读取 `prompts/write-wechat.md`，基于提炼好的洞察，生成完整的公众号文章草稿。
写入仓库根目录 `output/week-XX-人名/wechat-article.md`。

文章结构：
- 标题（吸引点击）
- 人物介绍（100-150 字）
- 3-5 个核心洞察（每个洞察：故事引入 → 深度解读 → 原文引用）
- 串联思考（将多个洞察连成一条线）
- 「我的思考」（第一人称短文，必写，见 `wechat-format-rules.md`）
- 「3 件事」用 **1.** **2.** **3.**（禁止 Markdown 有序列表）
- 公众号封面由 `publish-wechat` 从 `page-01.png` 自动生成 `wechat-cover.jpg`
- 行动建议（3 条可执行的建议）
- 下期预告

### Step 6: 更新轮转

将 `_index.json` 中的 `currentWeek` 加 1，记录本期历史。

### Step 7: 告知用户

输出生成结果的路径，展示 PDF 封面预览。

可选：提示用户执行 `/publish-xhs preview` 生成小红书文案，审阅后用 `/publish-xhs` 发布（Agent 须先自动运行 `ensure-xhs-mcp.js`）。

**发布后顺序（固定，详见 `publish-workflow.md`）**：

1. `/publish-xhs` 发小红书  
2. `/generate-video` 生成 MP4  
3. 视频号发表（文案见 `channels-video-post.md`）  
4. `/publish-wechat` 推草稿（文章已含「本期视频」引导文案，见 `wechat-format-rules.md`）  
5. 公众号发表  

## 产出目录（重要）

- 每期写入 **`output/week-XX-人名/`**（如 `week-02-charlie-munger`），与往期**并列保留**
- **禁止**删除 `output/` 下其他 `week-*` 文件夹
- 对**同一期**重跑脚本时，仅覆盖该期文件（PDF、视频、文章等），属正常更新

## 配置

配置文件：`~/.wisdom-weekly/config.json`

```json
{
  "language": "zh",
  "outputDir": "output",
  "weeklyDay": "monday",
  "onboardingComplete": true
}
```

## 人物档案格式

每个人物档案的 frontmatter 必须包含：

```yaml
name: 英文名
name_zh: 中文名
tagline: 一句话标签
style: philosopher | entrepreneur | classic-chinese | modern-thinker
twitter: 推特用户名（可选）
active: true/false（是否抓取最新动态）
themes: [主题列表]
key_works: [代表作列表]
iconic_quotes: [标志性语录]
```

## 注意事项

- 所有内容基于 AI 对这些人物公开著作的理解生成，不编造不存在的引言
- PDF 每页设计为独立卡片，可单独截图用于小红书
- 每期固定规范详见 **`wechat-format-rules.md`**（封面、我的思考、3件事格式）
- 国内人物使用中文原文，不做翻译；国际人物保持中英对照

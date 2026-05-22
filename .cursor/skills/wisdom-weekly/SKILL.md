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
- 「我的思考」（留白段，标记 `[在此添加你的个人感悟]`）
- 行动建议（3 条可执行的建议）
- 下期预告

### Step 6: 更新轮转

将 `_index.json` 中的 `currentWeek` 加 1，记录本期历史。

### Step 7: 告知用户

输出生成结果的路径，展示 PDF 封面预览。

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
- 公众号文章保留「我的思考」段落，供用户填写个人感悟
- 国内人物使用中文原文，不做翻译；国际人物保持中英对照

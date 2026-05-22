# PDF 风格适配指南

## 四种视觉风格

### 1. philosopher（哲学家）
- **视觉特征**：深色背景、衬线字体、金色点缀、古典庄重
- **气质**：永恒、沉思、庄严
- **适用人物**：Marcus Aurelius, Seneca, Epictetus, Viktor Frankl, Ryan Holiday

### 2. entrepreneur（企业家/硅谷）
- **视觉特征**：浅色背景深色封面、无衬线字体、蓝色主色调、现代科技感
- **气质**：理性、前沿、行动力
- **适用人物**：Naval Ravikant, Paul Graham, Sam Altman, Peter Thiel, 段永平, 张一鸣, 任正非, 王兴, 傅盛

### 3. classic-chinese（中国古典）
- **视觉特征**：米色/宣纸色背景、宋体/楷体、深棕色调、大量留白、水墨意境
- **气质**：典雅、文人、传统智慧
- **适用人物**：王阳明, 曾国藩

### 4. modern-thinker（现代思想家）
- **视觉特征**：纯白背景、黑色主色调、极简排版、大字号标题
- **气质**：极简、理性、纯粹
- **适用人物**：Nassim Taleb, Charlie Munger, Ray Dalio, Morgan Housel, James Clear, Kevin Kelly, Tim Ferriss, Seth Godin, Derek Sivers, Shane Parrish, Richard Feynman, 李录, 罗翔, 冯仑

## 人物-风格映射

每个人物档案的 frontmatter 中有 `style` 字段，直接使用即可。
生成 HTML 时，将 `{{STYLE_FILE}}` 替换为对应的风格名称。

## 双语要求（每页必须）

每一页（除封面、尾页外）须包含：
- 页眉：`Wisdom Weekly` + `智者周刊`，章节英/中标题
- 洞察标题：中文主标题 + 英文副标题
- **正文**：每组段落必须「中文 + 英文」成对（国际人物）；见 `.body-pair` 结构
- 核心洞察框：中文提炼 + 英文原文/金句
- 页脚：章节中/英 + 页码

国内人物正文可仅中文；国际人物**禁止**正文只有中文。

参考 `templates/chapter-page-snippet.html`。

生成 HTML 时：
1. 将 `templates/wisdom-pdf.html` 中的样式提取为同目录 `styles.css`（与 wisdom.html 同级）
2. 每页一个主要洞察，避免内容挤版或留白过多

## 概览页模板

```html
<div class="page overview">
  <div class="book-title">[系列标签，如 The Almanack of...]</div>
  <div class="book-title-zh">[中文书名/系列名]</div>
  <div class="book-desc">[1-2 句话描述此人的核心主题]</div>
  <div class="book-meta">[代表作 + 简要背景]</div>
</div>
```

## 内容篇幅控制

- 每个 PDF 页面的文字容量有限（A4 页面，50px 内边距）
- 每个章节页建议：1 个洞察 + 1 个 CORE INSIGHT + 原文
- 如果一个洞察内容较多，可以跨两页
- 封面 1 页 + 概览 1 页 + 章节 3-5 页 + 尾页 1 页 = 总共 6-8 页

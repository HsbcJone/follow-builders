# Wisdom Weekly — 智者周刊

每周深度聚焦一位智者，生成精美 PDF（朋友圈 / 小红书）和微信公众号文章草稿。

## 使用方式

在 Cursor 中调用 skill：

```
/wisdom          # 生成本周内容
/wisdom next     # 跳到下一位
/wisdom [人名]   # 指定人物
/wisdom list     # 查看名单与进度
```

## 目录结构

```
follow-builders/
├── output/                          # 每期产出（PDF、卡片、公众号草稿）
│   └── week-01-naval-ravikant/
└── .cursor/skills/wisdom-weekly/
    ├── SKILL.md
    ├── people/                      # 30 位智者档案
    ├── templates/
    ├── prompts/
    └── scripts/
```

## 生成 PDF

在项目根目录执行：

```bash
# 安装依赖（首次）
npm install --prefix .cursor/skills/wisdom-weekly/scripts

# 生成 PDF（在项目根目录执行）
node .cursor/skills/wisdom-weekly/scripts/generate-pdf.js output/week-01-naval-ravikant/wisdom.html
```

产出在 `output/week-XX-人名/`：`wisdom.pdf` + `page-01.png` …（小红书卡片）

## 轮转

人物顺序见 `.cursor/skills/wisdom-weekly/people/_index.json`，共 30 期，中外穿插。

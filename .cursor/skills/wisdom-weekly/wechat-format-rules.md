# 公众号文章 · 每期固定规范（无需重复提醒）

`/wisdom` 写文与 `/publish-wechat` 推送时**默认遵守**，用户不必每次说明。

## 正文格式

| 项 | 规则 |
|----|------|
| **我的思考** | 必写 80–150 字第一人称短文，禁止 `[在此添加…]` 占位符 |
| **3 件事** | 必须用 **1.** **2.** **3.**，禁止 Markdown `1.` 有序列表（微信会显示 1–6 空号） |
| **章节标题** | `## 一、中文 · English` 双语对照（洞察 3–5 节 + 关于/串联/行动） |

## 封面（推送时自动处理）

| 文件 | 说明 |
|------|------|
| `page-01.png` | PDF 首卡（竖版源图） |
| `wechat-cover.jpg` | 脚本自动生成，**900×383**（微信推荐 2.35:1） |
| `wechat-cover-square.jpg` | **200×200** 方图（次条/小图比例） |

`publish-wechat.js` 上传 `wechat-cover.jpg` 为 `thumb_media_id`，并设置 `pic_crop_235_1` / `article_type: news`。

**勿**直接用竖版 `page-01.png` 作封面（后台常显示无封面）。

## 推送命令

```bash
node .cursor/skills/wisdom-weekly/scripts/publish-wechat.js week-XX-人名
```

推送前自动：校验文章格式 → 生成封面 → 上传封面 → 创建草稿。

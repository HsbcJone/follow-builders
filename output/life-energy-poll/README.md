# 生命力投票验证（临时）

**与 `.cursor/skills/wisdom-weekly` 完全隔离**，勿接入 `publish-to-xhs.js` / `build-munger-week*.js` 等周刊流水线。

## 用途

验证「生命力」方向：年轻人状态差的主因（5 条投票笔记，App 内挂投票发布）。

## 目录

| 路径 | 说明 |
|------|------|
| `note-01` … `note-05` | 每期封面 HTML、`page-01.png`、文案 `xiaohongshu-post.md` |
| `scripts/` | 封面生成、可选 MCP 图文（**不含投票**） |
| `schedule.json` | 发刊进度 |
| `如何挂投票.md` | App 内投票填写说明 |

## 发布方式（默认）

1. `node output/life-energy-poll/scripts/generate-poll-cover.js note-02`
2. 手机 App：**+ → 图文 → 互动组件 → 投票**，文案见各 note 的 `xiaohongshu-post.md`
3. **不要**用周刊的 `/publish-xhs` 发带投票的终稿

## MCP 脚本（可选）

`publish-note.js` 仅发图文，无投票组件；临时调试用。

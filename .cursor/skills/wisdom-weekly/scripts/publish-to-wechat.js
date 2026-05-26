#!/usr/bin/env node
/**
 * 检查公众号发布前置条件
 * 用法: node publish-to-wechat.js week-01-naval-ravikant
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../../../../");
const weekDir = process.argv[2]
  ? path.join(projectRoot, "output", process.argv[2])
  : null;

if (!weekDir || !fs.existsSync(weekDir)) {
  console.error("用法: node publish-to-wechat.js <output子目录名>");
  process.exit(1);
}

const envPath = path.join(projectRoot, ".env");
const article = path.join(weekDir, "wechat-article.md");
const pageCover = path.join(weekDir, "page-01.png");
const { validateWechatArticle } = require("./wechat-article-validate");

console.log("产出目录:", weekDir);
console.log("wechat-article.md:", fs.existsSync(article) ? "✓" : "✗");
console.log("page-01.png (封面源图):", fs.existsSync(pageCover) ? "✓" : "✗");

if (fs.existsSync(article)) {
  const v = validateWechatArticle(fs.readFileSync(article, "utf8"));
  console.log("文章格式校验:", v.ok ? "✓" : "✗");
  v.errors.forEach((e) => console.log("  -", e));
}

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  const hasId = /WECHAT_APP_ID=\s*\S+/.test(env) && !/你的/.test(env);
  const hasSecret = /WECHAT_APP_SECRET=\s*\S+/.test(env) && !/你的/.test(env);
  console.log(".env WECHAT_APP_ID:", hasId ? "✓" : "✗");
  console.log(".env WECHAT_APP_SECRET:", hasSecret ? "✓" : "✗");
} else {
  console.log(".env:", "✗ 请复制 .env.example → .env");
}

console.log("\n发布命令:");
console.log(`  node .cursor/skills/wisdom-weekly/scripts/publish-wechat.js ${process.argv[2]}`);

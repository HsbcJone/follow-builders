#!/usr/bin/env node
/**
 * 将 wechat-article.md 推送到微信公众号草稿箱（官方 API）
 *
 * 依赖：项目根目录 .env 含 WECHAT_APP_ID / WECHAT_APP_SECRET
 *
 * 用法（项目根目录）:
 *   node .cursor/skills/wisdom-weekly/scripts/publish-wechat.js week-01-naval-ravikant
 *   node ... week-01-naval-ravikant --dry-run
 *   node ... week-01-naval-ravikant --submit   # 草稿后直接发表（慎用）
 */

const fs = require("fs");
const path = require("path");
const {
  getAccessToken,
  uploadPermanentImage,
  addDraft,
  submitPublish,
} = require("./wechat-api");
const {
  markdownToWechatHtml,
  extractTitle,
  extractDigest,
} = require("./md-to-wechat-html");
const { prepareWechatCovers } = require("./wechat-cover");
const { validateWechatArticle } = require("./wechat-article-validate");

const projectRoot = path.resolve(__dirname, "../../../../");

function loadEnv() {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function parseArgs(argv) {
  const positional = [];
  let dryRun = false;
  let submit = false;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--dry-run") dryRun = true;
    else if (argv[i] === "--submit") submit = true;
    else if (!argv[i].startsWith("--")) positional.push(argv[i]);
  }
  return { positional, dryRun, submit };
}

function findWeekDir(name) {
  if (!name) return null;
  const direct = path.join(projectRoot, "output", name);
  if (fs.existsSync(direct)) return direct;
  const resolved = path.resolve(name);
  if (fs.existsSync(resolved)) return resolved;
  return null;
}

function resolveWeekFromIndex() {
  const indexPath = path.join(projectRoot, ".cursor/skills/wisdom-weekly/people/_index.json");
  if (!fs.existsSync(indexPath)) return null;
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const week = index.currentWeek || 1;
  const dirs = fs
    .readdirSync(path.join(projectRoot, "output"))
    .filter((d) => d.startsWith(`week-${String(week).padStart(2, "0")}`));
  return dirs[0] ? path.join(projectRoot, "output", dirs[0]) : null;
}

async function main() {
  loadEnv();
  const { positional, dryRun, submit } = parseArgs(process.argv);

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  const author = process.env.WECHAT_AUTHOR || "心智升级生长志";

  if (!appId || !appSecret) {
    console.error("缺少 WECHAT_APP_ID 或 WECHAT_APP_SECRET");
    console.error("请复制 .env.example → .env 并填写（勿提交 Git）");
    process.exit(1);
  }

  let weekDir = findWeekDir(positional[0]);
  if (!weekDir) weekDir = resolveWeekFromIndex();
  if (!weekDir) {
    console.error("用法: node publish-wechat.js <output子目录名> [--dry-run] [--submit]");
    process.exit(1);
  }

  const articlePath = path.join(weekDir, "wechat-article.md");
  const pageCover = path.join(weekDir, "page-01.png");

  if (!fs.existsSync(articlePath)) {
    console.error("未找到 wechat-article.md，请先 /wisdom 生成");
    process.exit(1);
  }
  if (!fs.existsSync(pageCover)) {
    console.error("未找到 page-01.png，请先 /wisdom 生成 PDF 卡片");
    process.exit(1);
  }

  const markdown = fs.readFileSync(articlePath, "utf8");
  const validation = validateWechatArticle(markdown);
  for (const w of validation.warnings) console.warn("⚠", w);
  if (!validation.ok) {
    validation.errors.forEach((e) => console.error("✗", e));
    process.exit(1);
  }

  let coverPath;
  try {
    const covers = prepareWechatCovers(weekDir);
    coverPath = covers.cover235;
    console.log("封面图(2.35:1):", coverPath);
    console.log("封面图(1:1):", covers.coverSquare);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const title = extractTitle(markdown);
  if (title.length > 32) {
    console.error(`标题超过 32 字: ${title.length} 字`);
    process.exit(1);
  }

  const content = markdownToWechatHtml(markdown);
  if (content.length > 20000) {
    console.error(`正文 HTML 超过 2 万字符: ${content.length}`);
    process.exit(1);
  }

  const digest = extractDigest(markdown);
  const article = {
    article_type: "news",
    title,
    author: author.slice(0, 16),
    digest,
    content,
    thumb_media_id: "(上传后填充)",
    need_open_comment: 1,
    only_fans_can_comment: 0,
  };

  console.log("产出目录:", weekDir);
  console.log("标题:", title);
  console.log("作者:", article.author);
  console.log("摘要:", digest.slice(0, 60) + (digest.length > 60 ? "…" : ""));
  console.log("头图素材:", coverPath, `(源图 ${pageCover})`);
  console.log("HTML 长度:", content.length);

  if (dryRun) {
    console.log("\n[--dry-run] 未调用微信 API");
    return;
  }

  console.log("\n获取 access_token…");
  const token = await getAccessToken(appId, appSecret);

  console.log("上传封面…");
  const thumbMediaId = await uploadPermanentImage(token, coverPath);
  article.thumb_media_id = thumbMediaId;

  console.log("创建草稿…");
  const draft = await addDraft(token, article);
  const mediaId = draft.media_id;
  console.log("✓ 草稿已创建 media_id:", mediaId);
  console.log("  请在 https://mp.weixin.qq.com/ → 草稿箱 预览；可微调「我的思考」后发表");

  const metaPath = path.join(weekDir, "wechat-publish-meta.json");
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        media_id: mediaId,
        title,
        thumb_media_id: thumbMediaId,
        cover_image: path.basename(coverPath),
        published_at: new Date().toISOString(),
        submit: false,
      },
      null,
      2
    ),
    "utf8"
  );

  if (submit) {
    console.log("提交发表…");
    const pub = await submitPublish(token, mediaId);
    console.log("✓ 发表任务已提交 publish_id:", pub.publish_id);
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    meta.submit = true;
    meta.publish_id = pub.publish_id;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log("  可在公众平台查看发布状态");
  } else {
    console.log("\n提示: 审阅草稿后可在后台点发表，或重跑加 --submit");
  }
}

main().catch((err) => {
  if (err.errcode === 40164 || err.errcode === 61004) {
    console.error("\n可能原因: 服务器 IP 未加入公众号白名单");
    console.error("请到 mp.weixin.qq.com → 设置与开发 → 基本配置 → IP 白名单");
  }
  console.error(err.message || err);
  process.exit(1);
});

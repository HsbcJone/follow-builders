#!/usr/bin/env node
/**
 * /publish-xhs 前置：非无头 MCP + 限 6–9 图 + 随机延迟 + 输出发布载荷
 *
 * 用法（项目根目录）:
 *   node .cursor/skills/wisdom-weekly/scripts/publish-to-xhs.js week-02-charlie-munger
 *   node ... week-02 --no-delay      # 跳过 30–90s 等待（调试）
 *   node ... week-02 --no-ensure     # 跳过启动 MCP
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  randomDelayMs,
  sleep,
  resolveWeekDir,
  resolveWeekFromIndex,
  buildPublishPayload,
  DELAY_MIN_MS,
  DELAY_MAX_MS,
  MAX_IMAGES,
} = require("./xhs-publish-lib");

const projectRoot = path.resolve(__dirname, "../../../../");
const argv = process.argv.slice(2);
const noEnsure = argv.includes("--no-ensure");
const noDelay = argv.includes("--no-delay");
const weekArg = argv.find((a) => !a.startsWith("--"));

let weekDir = resolveWeekDir(projectRoot, weekArg);
if (!weekDir) weekDir = resolveWeekFromIndex(projectRoot);

if (!weekDir) {
  console.error("用法: node publish-to-xhs.js <output子目录名> [--no-delay] [--no-ensure]");
  process.exit(1);
}

async function main() {
  if (!noEnsure) {
    const ensure = spawnSync(
      "node",
      [path.join(__dirname, "ensure-xhs-mcp.js")],
      { cwd: projectRoot, encoding: "utf8", stdio: "inherit" }
    );
    if (ensure.status !== 0) process.exit(ensure.status || 1);
    console.log("");
  }

  let payload;
  try {
    payload = buildPublishPayload(weekDir);
  } catch (e) {
    console.error("✗", e.message);
    process.exit(1);
  }

  const metaPath = path.join(weekDir, "xhs-publish-payload.json");
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        ...payload,
        prepared_at: new Date().toISOString(),
        mode: "non-headless-default",
        delay_ms: noDelay ? 0 : null,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("产出目录:", weekDir);
  console.log("文案:", path.join(weekDir, "xiaohongshu-post.md"));
  console.log("标题:", payload.title);
  if (payload.images_capped) {
    console.log(
      `图片: 使用 ${payload.image_used}/${payload.image_total} 张（风控上限 ${MAX_IMAGES} 张，已截断）`
    );
  } else {
    console.log(`图片: ${payload.image_used} 张`);
  }
  payload.images.forEach((p, i) => console.log(`  [${i + 1}] ${p}`));
  console.log("话题:", payload.tags.join(", ") || "(无)");

  if (!noDelay) {
    const ms = randomDelayMs();
    const sec = (ms / 1000).toFixed(0);
    console.log(
      `\n⏳ 发布前随机等待 ${sec}s（${DELAY_MIN_MS / 1000}–${DELAY_MAX_MS / 1000}s，降风控）…`
    );
    await sleep(ms);
    const saved = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    saved.delay_ms = ms;
    fs.writeFileSync(metaPath, JSON.stringify(saved, null, 2));
    console.log("✓ 等待完成");
  }

  console.log("\n--- 请调用 MCP publish_content（仅此一步，勿 list_feeds）---");
  console.log(JSON.stringify(payload, null, 2));
  console.log("\n载荷已写入:", metaPath);
  console.log("✓ 前置完成，可 publish_content");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

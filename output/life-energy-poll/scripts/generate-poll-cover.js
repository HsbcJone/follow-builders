#!/usr/bin/env node
/**
 * 生成生命力投票笔记封面（白底黑字 1080x1440）
 * 用法: node output/life-energy-poll/scripts/generate-poll-cover.js note-01
 */
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "../../..");
const scriptsDir = path.join(
  projectRoot,
  ".cursor/skills/wisdom-weekly/scripts"
);

async function main() {
  const noteId = process.argv[2] || "note-01";
  const noteDir = path.join(projectRoot, "output/life-energy-poll", noteId);
  const htmlPath = path.join(noteDir, "cover.html");
  const outPath = path.join(noteDir, "page-01.png");

  if (!fs.existsSync(htmlPath)) {
    console.error("缺少 cover.html:", htmlPath);
    process.exit(1);
  }

  const puppeteerPath = path.join(scriptsDir, "node_modules/puppeteer");
  const puppeteerMod = require(puppeteerPath);

  const browser = await puppeteerMod.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
    await page.goto(`file://${htmlPath}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: outPath, type: "png" });
    console.log("封面已生成:", outPath);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

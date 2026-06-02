#!/usr/bin/env node
/**
 * 发布生命力投票笔记到小红书
 * 用法: node publish-note.js note-01 [--no-delay]
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { createSession, callTool } = require("./mcp-xhs-call");

const projectRoot = path.resolve(__dirname, "../../..");
const DELAY_MIN = 30_000;
const DELAY_MAX = 90_000;

function parsePost(postPath) {
  const raw = fs.readFileSync(postPath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { body: raw.trim() };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
    const arr = line.match(/^(\w+):\s*\[(.+)\]\s*$/);
    if (arr) {
      data[arr[1]] = arr[2]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
  }
  return { ...data, body: m[2].trim() };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const noteId = process.argv[2] || "note-01";
  const noDelay = process.argv.includes("--no-delay");
  const noteDir = path.join(projectRoot, "output/life-energy-poll", noteId);
  const postPath = path.join(noteDir, "xiaohongshu-post.md");
  const coverPath = path.join(noteDir, "page-01.png");

  if (!fs.existsSync(postPath)) {
    console.error("缺少", postPath);
    process.exit(1);
  }
  if (!fs.existsSync(coverPath)) {
    console.error("缺少封面，请先运行 generate-poll-cover.js");
    process.exit(1);
  }

  const meta = parsePost(postPath);
  const tags = Array.isArray(meta.tags)
    ? meta.tags
    : meta.tags
      ? String(meta.tags).split(/[,，]/).map((s) => s.trim())
      : [];

  if (!noDelay) {
    const delay =
      DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1));
    console.log(`发布前等待 ${Math.round(delay / 1000)}s（降风控）…`);
    await sleep(delay);
  }

  console.log("检查登录…");
  const sessionId = await createSession();
  const login = await callTool(sessionId, "check_login_status", {});
  const loginText = JSON.stringify(login);
  if (/未登录|login|二维码/i.test(loginText)) {
    console.error("未登录，请先运行: bash tools/xiaohongshu-mcp/login.sh");
    process.exit(1);
  }
  console.log("✓ 已登录");

  console.log("发布:", meta.title);
  const result = await callTool(sessionId, "publish_content", {
    title: meta.title,
    content: meta.body,
    images: [coverPath],
    tags,
    visibility: meta.visibility || "公开可见",
  });

  const payload = {
    note_id: noteId,
    title: meta.title,
    images: [coverPath],
    tags,
    published_at: new Date().toISOString(),
    result,
  };
  fs.writeFileSync(
    path.join(noteDir, "xhs-publish-result.json"),
    JSON.stringify(payload, null, 2),
    "utf8"
  );
  console.log("✓ 发布完成，请在 App 核对是否已添加投票组件");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error("✗", e.message || e);
  process.exit(1);
});

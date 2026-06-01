/**
 * 小红书发布风控参数（非无头 + 限图 + 延迟）
 */
const fs = require("fs");
const path = require("path");

const MAX_IMAGES = Number(process.env.XHS_MAX_IMAGES || 9);
const MIN_IMAGES = Number(process.env.XHS_MIN_IMAGES || 6);
const DELAY_MIN_MS = Number(process.env.XHS_DELAY_MIN_MS || 30_000);
const DELAY_MAX_MS = Number(process.env.XHS_DELAY_MAX_MS || 90_000);

function listPageImages(weekDir) {
  return fs
    .readdirSync(weekDir)
    .filter((f) => /^page-\d+\.png$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(weekDir, f));
}

/** 轮播最多 9 张；不足 6 张则全用（至少 1 张） */
function capImagesForXhs(allImages) {
  if (allImages.length === 0) return [];
  const cap = Math.min(MAX_IMAGES, allImages.length);
  if (allImages.length >= MIN_IMAGES) {
    return allImages.slice(0, cap);
  }
  return allImages.slice(0, Math.max(1, cap));
}

function parsePostFile(postPath) {
  if (!fs.existsSync(postPath)) return null;
  const raw = fs.readFileSync(postPath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { body: raw.trim() };
  const data = {};
  for (const line of m[1].split("\n")) {
    const arr = line.match(/^(\w+):\s*\[(.+)\]\s*$/);
    if (arr) {
      data[arr[1]] = arr[2]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }
    const kv = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { ...data, body: m[2].trim() };
}

function randomDelayMs() {
  return (
    DELAY_MIN_MS +
    Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1))
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function resolveWeekDir(projectRoot, name) {
  if (!name) return null;
  const direct = path.join(projectRoot, "output", name);
  if (fs.existsSync(direct)) return direct;
  const resolved = path.resolve(name);
  if (fs.existsSync(resolved)) return resolved;
  return null;
}

function resolveWeekFromIndex(projectRoot) {
  const indexPath = path.join(
    projectRoot,
    ".cursor/skills/wisdom-weekly/people/_index.json"
  );
  if (!fs.existsSync(indexPath)) return null;
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const week = index.currentWeek || 1;
  const dirs = fs
    .readdirSync(path.join(projectRoot, "output"))
    .filter((d) => d.startsWith(`week-${String(week).padStart(2, "0")}`));
  return dirs[0] ? path.join(projectRoot, "output", dirs[0]) : null;
}

function stripInlineHashtags(body) {
  return body
    .replace(/\n#[^\n]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildPublishPayload(weekDir) {
  const postPath = path.join(weekDir, "xiaohongshu-post.md");
  const meta = parsePostFile(postPath);
  if (!meta || !meta.title) {
    throw new Error("缺少 xiaohongshu-post.md 或 title，请先 /publish-xhs preview");
  }
  const allImages = listPageImages(weekDir);
  const images = capImagesForXhs(allImages);
  if (images.length === 0) {
    throw new Error("未找到 page-*.png");
  }
  const tags = Array.isArray(meta.tags)
    ? meta.tags
    : typeof meta.tags === "string"
      ? meta.tags.split(/[,，]/).map((s) => s.trim())
      : [];
  return {
    title: meta.title,
    content: stripInlineHashtags(meta.body || ""),
    images,
    tags,
    visibility: meta.visibility || "公开可见",
    image_total: allImages.length,
    image_used: images.length,
    images_capped: allImages.length > images.length,
  };
}

module.exports = {
  MAX_IMAGES,
  MIN_IMAGES,
  DELAY_MIN_MS,
  DELAY_MAX_MS,
  listPageImages,
  capImagesForXhs,
  parsePostFile,
  randomDelayMs,
  sleep,
  resolveWeekDir,
  resolveWeekFromIndex,
  buildPublishPayload,
};

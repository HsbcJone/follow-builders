/**
 * 从 page-01.png 生成公众号封面（2.35:1 + 1:1）
 * 竖版卡片直接上传会导致草稿箱无封面预览
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/** 微信头条封面推荐像素（2.35:1） */
const COVER_W = 900;
const COVER_H = 383;
/** 次条/方图封面 */
const SQUARE = 200;

function run(cmd, args) {
  return spawnSync(cmd, args, { encoding: "utf8", stdio: "pipe" });
}

function ensureFfmpeg() {
  if (run("ffmpeg", ["-version"]).status !== 0) {
    throw new Error("未找到 ffmpeg，无法生成公众号封面");
  }
}

function isFresh(src, outs) {
  if (!fs.existsSync(src)) return false;
  const srcTime = fs.statSync(src).mtimeMs;
  return outs.every((o) => fs.existsSync(o) && fs.statSync(o).mtimeMs >= srcTime);
}

/**
 * @returns {{ cover235: string, coverSquare: string }}
 */
function prepareWechatCovers(weekDir) {
  const src = path.join(weekDir, "page-01.png");
  if (!fs.existsSync(src)) {
    throw new Error(`缺少封面源图: ${src}`);
  }

  const cover235 = path.join(weekDir, "wechat-cover.jpg");
  const coverSquare = path.join(weekDir, "wechat-cover-square.jpg");

  if (isFresh(src, [cover235, coverSquare])) {
    return { cover235, coverSquare };
  }

  ensureFfmpeg();

  // 从竖版卡片顶部裁 2.35:1 横条（标题区通常在上方）
  const crop235 = run("ffmpeg", [
    "-y",
    "-i",
    src,
    "-vf",
    `crop=iw:iw/2.35:0:0,scale=${COVER_W}:${COVER_H}`,
    "-q:v",
    "2",
    cover235,
  ]);
  if (crop235.status !== 0) {
    throw new Error(`生成 wechat-cover.jpg 失败: ${(crop235.stderr || "").slice(-200)}`);
  }

  const cropSq = run("ffmpeg", [
    "-y",
    "-i",
    src,
    "-vf",
    `crop=iw:iw:0:0,scale=${SQUARE}:${SQUARE}`,
    "-q:v",
    "2",
    coverSquare,
  ]);
  if (cropSq.status !== 0) {
    throw new Error(`生成 wechat-cover-square.jpg 失败: ${(cropSq.stderr || "").slice(-200)}`);
  }

  return { cover235, coverSquare };
}

module.exports = { prepareWechatCovers, COVER_W, COVER_H };

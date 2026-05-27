/**
 * 生成视频开场首页 video-intro.png（1080×1440）
 * 避免 concat + 全局 fade-in 导致片头黑屏
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const W = 1080;
const H = 1440;
const BG = "0xF5F0E8";

function run(cmd, args) {
  return spawnSync(cmd, args, { encoding: "utf8", stdio: "pipe" });
}

function pickFont() {
  const candidates = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/Supplemental/Songti.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
  ];
  for (const f of candidates) {
    if (fs.existsSync(f)) return f;
  }
  return null;
}

function escapeDrawtext(text) {
  return text
    .replace(/\\/g, "\\\\\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "'\\''")
    .replace(/%/g, "\\%");
}

function wrapTitle(title, maxCharsPerLine = 14) {
  const t = title.trim();
  if (t.length <= maxCharsPerLine) return [t];
  const lines = [];
  let i = 0;
  while (i < t.length) {
    lines.push(t.slice(i, i + maxCharsPerLine));
    i += maxCharsPerLine;
  }
  return lines.slice(0, 3);
}

function getWeekMeta(weekDir) {
  const projectRoot = path.resolve(weekDir, "../..");
  const indexPath = path.join(
    projectRoot,
    ".cursor/skills/wisdom-weekly/people/_index.json"
  );
  let weekNum = "";
  const m = path.basename(weekDir).match(/week-(\d+)/i);
  if (m) weekNum = m[1].replace(/^0+/, "") || "1";

  let title = "智者周刊";
  let person = "";
  const wechatPath = path.join(weekDir, "wechat-article.md");
  if (fs.existsSync(wechatPath)) {
    const raw = fs.readFileSync(wechatPath, "utf8");
    const h1 = raw.match(/^#\s+(.+)/m);
    if (h1) {
      title = h1[1].trim();
      const pm = title.match(/^([^：:]+)[：:]/);
      if (pm) person = pm[1].trim();
    }
  }
  const xhsPath = path.join(weekDir, "xiaohongshu-post.md");
  if (fs.existsSync(xhsPath)) {
    const fm = fs.readFileSync(xhsPath, "utf8").match(/^---\r?\n[\s\S]*?title:\s*["']?(.+?)["']?\s*$/m);
    if (fm && !person) title = fm[1].trim();
  }

  return { title, person, weekNum, weekLabel: weekNum ? `第 ${weekNum} 期` : "智者周刊" };
}

function isFresh(outPath, sources) {
  if (!fs.existsSync(outPath)) return false;
  const outM = fs.statSync(outPath).mtimeMs;
  return sources.every((s) => fs.existsSync(s) && fs.statSync(s).mtimeMs <= outM);
}

/**
 * @returns {string} video-intro.png 路径
 */
function prepareVideoIntro(weekDir) {
  const outPath = path.join(weekDir, "video-intro.png");
  const thumbPath = path.join(weekDir, "video-thumb.jpg");
  const page01 = path.join(weekDir, "page-01.png");
  const meta = getWeekMeta(weekDir);
  const sources = [page01].filter((p) => fs.existsSync(p));

  if (isFresh(outPath, sources.length ? sources : [weekDir])) {
    return outPath;
  }

  const font = pickFont();
  if (!font) {
    console.warn("未找到中文字体，开场页将仅使用 page-01 缩放");
  }

  const titleLines = wrapTitle(meta.title);
  const line2 = meta.person ? `本期 · ${meta.person}` : meta.weekLabel;
  const line3 = "心智升级生长志";

  let filter;
  if (fs.existsSync(page01)) {
    const drawParts = [];
    if (font) {
      drawParts.push(
        `drawtext=fontfile='${font}':text='智者周刊':fontsize=52:fontcolor=0xB8860B:x=(w-text_w)/2:y=120:borderw=0`
      );
      titleLines.forEach((line, idx) => {
        const y = 200 + idx * 62;
        drawParts.push(
          `drawtext=fontfile='${font}':text='${escapeDrawtext(line)}':fontsize=44:fontcolor=0x1A1A1A:x=(w-text_w)/2:y=${y}`
        );
      });
      const yMeta = 200 + titleLines.length * 62 + 36;
      drawParts.push(
        `drawtext=fontfile='${font}':text='${escapeDrawtext(line2)}':fontsize=32:fontcolor=0x666666:x=(w-text_w)/2:y=${yMeta}`,
        `drawtext=fontfile='${font}':text='${escapeDrawtext(line3)}':fontsize=28:fontcolor=0x999999:x=(w-text_w)/2:y=${yMeta + 48}`
      );
    }

    filter = [
      `color=c=${BG}:s=${W}x${H}:d=1[bg]`,
      `[1:v]scale=920:-1:force_original_aspect_ratio=decrease,format=rgba[card]`,
      `[bg][card]overlay=(W-w)/2:(H-h)/2+80:format=auto[base]`,
      drawParts.length ? `[base]${drawParts.join(",")}[v]` : "[base]copy[v]",
    ].join(";");
  } else {
    filter = `color=c=${BG}:s=${W}x${H}:d=1,drawtext=fontfile='${font}':text='智者周刊':fontsize=52:fontcolor=0x1A1A1A:x=(w-text_w)/2:y=(h-text_h)/2`;
  }

  const args = [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${BG}:s=${W}x${H}:d=1`,
  ];
  if (fs.existsSync(page01)) {
    args.push("-i", page01);
  }
  args.push("-filter_complex", filter, "-map", "[v]", "-frames:v", "1", outPath);

  const r = run("ffmpeg", args);
  if (r.status !== 0 || !fs.existsSync(outPath)) {
    if (fs.existsSync(page01)) {
      run("ffmpeg", [
        "-y",
        "-i",
        page01,
        "-vf",
        `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${BG}`,
        "-frames:v",
        "1",
        outPath,
      ]);
    }
    if (!fs.existsSync(outPath)) {
      throw new Error(`生成 video-intro.png 失败: ${(r.stderr || "").slice(-300)}`);
    }
  }

  if (fs.existsSync(page01)) {
    run("ffmpeg", [
      "-y",
      "-i",
      page01,
      "-vf",
      `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${BG}`,
      "-q:v",
      "3",
      thumbPath,
    ]);
  }

  return outPath;
}

module.exports = { prepareVideoIntro, getWeekMeta };

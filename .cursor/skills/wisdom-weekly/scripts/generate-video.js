#!/usr/bin/env node
/**
 * 将每期 page-*.png 合成为竖屏 MP4（含旁白 TTS + BGM 混音）
 *
 * 依赖：
 *   - ffmpeg（brew install ffmpeg）
 *   - edge-tts（npm install，见 package.json）
 *
 * 用法（项目根目录）:
 *   node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01-naval-ravikant
 *   node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01-naval-ravikant --seconds 4
 *   node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01 --bgm ~/Music/bgm.mp3
 *   node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01 --no-audio
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { prepareVideoIntro } = require("./video-intro");

const projectRoot = path.resolve(__dirname, "../../../../");
const scriptsDir = __dirname;
const assetsDir = path.join(projectRoot, "tools/video-assets");
const DEFAULT_SECONDS = 4;
/** 开场首页停留（video-intro.png，无黑屏淡入） */
const INTRO_SECONDS = 5;
const FPS = 30;
const TTS_VOICE = "zh-CN-XiaoxiaoNeural";
/** 配乐主音量（真实 MP3）；旁白时段由 sidechain 自动压低 BGM */
const BGM_VOLUME = 0.42;
const VOICE_VOLUME = 1.0;
const VOICE_DELAY_MS = 400;

function parseArgs(argv) {
  const positional = [];
  let seconds = DEFAULT_SECONDS;
  let withAudio = true;
  let bgmPath = null;
  let allowSynthBgm = false;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--seconds" && argv[i + 1]) {
      seconds = Math.max(2, Math.min(15, Number(argv[++i]) || DEFAULT_SECONDS));
    } else if (argv[i] === "--bgm" && argv[i + 1]) {
      bgmPath = argv[++i];
    } else if (argv[i] === "--synth-bgm") {
      allowSynthBgm = true;
    } else if (argv[i] === "--no-audio") {
      withAudio = false;
    } else if (!argv[i].startsWith("--")) {
      positional.push(argv[i]);
    }
  }
  return { positional, seconds, withAudio, bgmPath, allowSynthBgm };
}

function findWeekDir(name) {
  if (!name) return null;
  const direct = path.join(projectRoot, "output", name);
  if (fs.existsSync(direct)) return direct;
  const resolved = path.resolve(name);
  if (fs.existsSync(resolved)) return resolved;
  return null;
}

function listPageImages(weekDir) {
  return fs
    .readdirSync(weekDir)
    .filter((f) => /^page-\d+\.png$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(weekDir, f));
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    stdio: opts.inherit ? "inherit" : "pipe",
    ...opts,
  });
  return r;
}

function ensureFfmpeg() {
  if (run("ffmpeg", ["-version"]).status !== 0) {
    console.error("未找到 ffmpeg。请安装：brew install ffmpeg");
    process.exit(1);
  }
}

function getMediaDuration(filePath) {
  const r = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  return parseFloat((r.stdout || "").trim()) || 0;
}

function buildConcatFile(segments, tmpPath) {
  const lines = [];
  for (const { file, duration } of segments) {
    lines.push(`file '${file.replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${duration}`);
  }
  const last = segments[segments.length - 1].file;
  lines.push(`file '${last.replace(/'/g, "'\\''")}'`);
  fs.writeFileSync(tmpPath, lines.join("\n"), "utf8");
}

function buildSilentVideo(concatPath, outPath, durationSec) {
  const fadeOutStart = Math.max(0, durationSec - 1);
  const vf = [
    "scale=1080:1440:force_original_aspect_ratio=decrease",
    "pad=1080:1440:(ow-iw)/2:(oh-ih)/2:color=0xF5F0E8",
    "format=yuv420p",
    `fade=t=out:st=${fadeOutStart}:d=0.8`,
  ].join(",");

  const r = run(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatPath,
      "-vf",
      vf,
      "-r",
      String(FPS),
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-an",
      outPath,
    ],
    { inherit: true }
  );
  if (r.status !== 0) process.exit(1);
}

function resolveBgmPath(explicitPath, allowSynthBgm) {
  if (explicitPath) {
    const resolved = path.resolve(explicitPath);
    if (!fs.existsSync(resolved)) {
      console.error("BGM 文件不存在:", resolved);
      process.exit(1);
    }
    return resolved;
  }

  const custom = path.join(assetsDir, "custom-bgm.mp3");
  if (fs.existsSync(custom)) return custom;

  if (allowSynthBgm) {
    const defaultBgm = path.join(assetsDir, "default-bgm.mp3");
    const script = path.join(assetsDir, "create-default-bgm.sh");
    if (!fs.existsSync(defaultBgm) && fs.existsSync(script)) {
      console.log("正在生成合成备用 BGM（仅 --synth-bgm）…");
      run("bash", [script], { inherit: true });
    }
    if (fs.existsSync(defaultBgm)) {
      console.warn("⚠ 使用程序合成 BGM，建议改用真实配乐，见 tools/video-assets/BGM.md");
      return defaultBgm;
    }
  }

  console.error(`
缺少背景音乐（需要真实 MP3 配乐，不是合成噪声）。

请任选一种方式：
  1. bash tools/video-assets/set-bgm.sh /path/to/你的音乐.mp3
  2. 复制 MP3 为 tools/video-assets/custom-bgm.mp3
  3. node generate-video.js <期数> --bgm /path/to/music.mp3

《大唐豪侠》等游戏 OST：请使用你本地已有、合法持有的文件。
免版权替代：见 tools/video-assets/BGM.md（Pixabay 中国风史诗等）

若仅测试可用: --synth-bgm
`);
  process.exit(1);
}

function stripMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/#[^\s#]+/g, "")
    .replace(/📌/g, "")
    .replace(/👇/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return { body: "" };
  const raw = fs.readFileSync(filePath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { body: raw };
  const data = {};
  for (const line of m[1].split("\n")) {
    const arr = line.match(/^(\w+):\s*\[(.+)\]\s*$/);
    if (arr) {
      data[arr[1]] = arr[2]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean)
        .join(", ");
      continue;
    }
    const kv = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { ...data, body: m[2] };
}

function buildNarrationScript(weekDir) {
  const customPath = path.join(weekDir, "video-narration.txt");
  if (fs.existsSync(customPath)) {
    return fs.readFileSync(customPath, "utf8").trim();
  }

  const xhs = parseFrontmatter(path.join(weekDir, "xiaohongshu-post.md"));
  let person = "本期智者";
  const wechatPath = path.join(weekDir, "wechat-article.md");
  if (fs.existsSync(wechatPath)) {
    const h1 = fs.readFileSync(wechatPath, "utf8").match(/^#\s+(.+)/m);
    if (h1) {
      const t = h1[1].trim();
      const m = t.match(/^([^：:]+)[：:]/);
      person = m ? m[1] : t.slice(0, 12);
    }
  }

  const title = xhs.title || "智者周刊";
  const body = stripMarkdown(xhs.body || "");
  const intro = body.slice(0, 180);

  const script = [
    "欢迎收看智者周刊。",
    `本期聚焦，${person}。`,
    intro || "每周一位智者，用洞察帮你厘清财富、幸福与长期成长。",
    "左滑看完本期全部卡片。收藏慢慢看，我们下周见。",
  ].join("");

  fs.writeFileSync(customPath, script, "utf8");
  console.log("已生成旁白稿:", customPath);
  return script;
}

function synthesizeSpeech(text, outMp3) {
  const edgeCli = run("which", ["edge-tts"]);
  if (edgeCli.status === 0 && (edgeCli.stdout || "").trim()) {
    const tmpTxt = outMp3.replace(/\.mp3$/i, ".tts.txt");
    fs.writeFileSync(tmpTxt, text, "utf8");
    const r = run(
      "edge-tts",
      [
        "--voice",
        TTS_VOICE,
        "--rate",
        "+8%",
        "--file",
        tmpTxt,
        "--write-media",
        outMp3,
      ],
      { inherit: false }
    );
    try {
      fs.unlinkSync(tmpTxt);
    } catch (_) {}
    if (r.status === 0 && fs.existsSync(outMp3)) {
      console.log("旁白 TTS (edge-tts CLI):", TTS_VOICE);
      return true;
    }
    console.warn("edge-tts CLI 失败，尝试系统语音…", (r.stderr || "").slice(0, 120));
  }

  const aiff = outMp3.replace(/\.mp3$/i, ".aiff");
  const say = run("say", ["-v", "Ting-Ting", "-r", "175", "-o", aiff, text]);
  if (say.status !== 0) {
    console.error("旁白生成失败。请运行: npm install --prefix .cursor/skills/wisdom-weekly/scripts");
    return false;
  }
  const conv = run("ffmpeg", ["-y", "-i", aiff, "-c:a", "libmp3lame", "-q:a", "4", outMp3]);
  try {
    fs.unlinkSync(aiff);
  } catch (_) {}
  if (conv.status === 0) {
    console.log("旁白 TTS (macOS say): Ting-Ting");
    return true;
  }
  return false;
}

function muxAudioVideo(videoPath, bgmPath, voicePath, outputPath) {
  const delay = VOICE_DELAY_MS;
  const videoDur = getMediaDuration(videoPath);
  const dur = Math.max(1, videoDur).toFixed(3);

  const fadeOut = Math.max(0, parseFloat(dur) - 2).toFixed(3);
  const filter = [
    `[1:a]aresample=44100,aformat=channel_layouts=stereo,aloop=loop=-1:size=2e+09,atrim=0:${dur},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOut}:d=2,volume=${BGM_VOLUME}[bgm]`,
    `[2:a]aresample=44100,aformat=channel_layouts=mono,adelay=${delay}|${delay},volume=${VOICE_VOLUME},afade=t=in:st=0:d=0.5,afade=t=out:st=${Math.max(0, parseFloat(dur) - 1.5)}:d=1.2[voice]`,
    `[bgm][voice]amix=inputs=2:duration=first:normalize=0:weights=0.45 1:dropout_transition=2,apad=whole_dur=${dur},alimiter=limit=0.95[aout]`,
  ].join(";");

  const r = run(
    "ffmpeg",
    [
      "-y",
      "-i",
      videoPath,
      "-i",
      bgmPath,
      "-i",
      voicePath,
      "-filter_complex",
      filter,
      "-map",
      "0:v",
      "-map",
      "[aout]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-t",
      dur,
      "-movflags",
      "+faststart",
      outputPath,
    ],
    { inherit: true }
  );

  if (r.status !== 0) {
    console.error("音轨混流失败");
    process.exit(1);
  }
}

function parseXhsTags(tagsRaw) {
  if (!tagsRaw) return ["智者周刊", "成长", "思维"];
  if (Array.isArray(tagsRaw)) return tagsRaw;
  if (typeof tagsRaw === "string" && tagsRaw.includes(",")) {
    return tagsRaw.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  }
  try {
    const parsed = JSON.parse(tagsRaw.replace(/'/g, '"'));
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (_) {
    /* ignore */
  }
  return [String(tagsRaw).replace(/^#/, "")];
}

function extractXhsBullets(xhsBody) {
  const bullets = [];
  const re = /\*\*(\d+)\.\*\*\s*([^\n*]+)\n([\s\S]*?)(?=\n\*\*\d+\.\*\*|\n📌|\n#|$)/g;
  let m;
  while ((m = re.exec(xhsBody || "")) && bullets.length < 3) {
    const headline = m[2].trim();
    const detail = stripMarkdown(m[3]).slice(0, 48).trim();
    bullets.push(detail ? `${headline}——${detail}` : headline);
  }
  return bullets;
}

function buildChannelsDescription(meta) {
  const { person, xhsBody, bullets, tags } = meta;
  const hook =
    stripMarkdown((xhsBody || "").split("\n\n")[0] || "").slice(0, 80) ||
    `本期「智者周刊」带你用 1 分钟看懂${person}的核心智慧。`;
  const lines = bullets.length
    ? bullets.map((b, i) => `${"①②③"[i] || `${i + 1}.`} ${b}`)
    : ["① 本期核心洞察一", "② 本期核心洞察二", "③ 本期核心洞察三"];
  const tagLine = tags.map((t) => `#${t.replace(/^#/, "")}`).join(" ");
  return `${hook}

本期「智者周刊」1 分钟看懂${person}三条心法：
${lines.join("\n")}

左滑看完本期全部图卡，收藏慢慢看。每周一位智者，陪你慢慢变强。

${tagLine}`.trim();
}

function buildChannelsFormSection(shortTitle, description, tags) {
  const tagList = tags.map((t) => `\`${t.replace(/^#/, "")}\``).join(" ");
  const descBlock = description
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n")
    .trim();
  return `## 视频号助手 · 上传表单（对照截图逐项填）

打开 [视频号助手](https://channels.weixin.qq.com/) → 发表视频 → 上传 \`wisdom-video.mp4\`，按下面填写：

| 字段 | 怎么填 |
|------|--------|
| **视频描述** | 见下方「描述正文」，整段复制粘贴；话题用 \`#话题\` 按钮添加（见话题列表） |
| **短标题** | \`${shortTitle}\` |
| **位置** | **不显示位置**（或选你所在城市） |
| **添加到合集** | 选 **智者周刊**（没有就先创建该合集） |
| **链接** | **不添加**（公众号链接等视频发表后再挂） |
| **活动** | **不参与活动** |

### 描述正文（复制到「视频描述」框）

\`\`\`
${descBlock}
\`\`\`

### 话题（点 \`#话题\` 添加，建议 3～5 个）

${tagList}

### 短标题（单独一栏，≥6 字）

\`\`\`
${shortTitle}
\`\`\`

### 封面与其它

- **封面**：上传 \`video-thumb.jpg\`，或用视频首帧（开场首页）
- **原创声明**：勾选
- **内容标注**：知识分享 / 按平台要求
- **可见范围**：公开`;
}

function writeChannelsPost(weekDir, meta, hasAudio, durationSec) {
  const outPath = path.join(weekDir, "channels-video-post.md");
  const title = meta.title || "智者周刊：本期智慧精选";
  const person = meta.person || "本期智者";
  const shortTitle = buildShortTitle(title, person);
  const dur = Math.round(durationSec || 0);
  const tags = parseXhsTags(meta.tags);
  const bullets = extractXhsBullets(meta.xhsBody);
  const description = buildChannelsDescription({
    person,
    xhsBody: meta.xhsBody,
    bullets,
    tags,
  });
  const formSection = buildChannelsFormSection(shortTitle, description, tags);
  const bulletWechat = bullets.length
    ? bullets.map((b) => `· ${b.split("——")[0]}`).join("\n")
    : `· 本期核心洞察一\n· 本期核心洞察二\n· 本期核心洞察三`;

  const body = `---
short_title: "${shortTitle.replace(/"/g, "")}"
duration_sec: ${dur}
declare_original: true
content_label: "无需标注（知识分享）"
audio: ${hasAudio ? "旁白(TTS) + 环境BGM" : "无"}
collection: "智者周刊"
location: "不显示位置"
link: "不添加"
activity: "不参与活动"
---

${formSection}

---

## 视频号 · 短标题（≥6 字，直接复制）

${shortTitle}

## 视频号 · 描述（含话题，可整段复制）

${description}

---

## 公众号 · 视频消息 / 视频号同步文案

**标题建议：** ${title}

**正文（发视频消息或视频号动态）：**

本期 1 分钟视频，浓缩三个洞察——
${bulletWechat}

完整长文与图卡见公众号推文；左滑视频看完本期卡片。

**文末引导：** 关注「心智升级生长志」→ 每周一位智者，拆解财富、幸福与长期成长。

---

## 发布顺序（本期）

1. [ ] 小红书（/publish-xhs）
2. [ ] 视频号发表（见上方表单）
3. [ ] 公众号草稿（/publish-wechat）
4. [ ] 公众号发表

完整流程见 \`publish-workflow.md\`

## 视频号检查清单

- [ ] 上传 \`wisdom-video.mp4\`（约 ${dur} 秒，竖屏 1080×1440）
- [ ] 视频描述、短标题、位置、合集、链接、活动（见上方表单）
- [ ] 勾选 **原创声明**
- [ ] 内容标注：知识分享 / 按平台要求选择
- [ ] 封面：优先 \`video-thumb.jpg\` 或视频首帧（开场首页）
- [ ] 可见范围：公开
`;

  fs.writeFileSync(outPath, body, "utf8");
  console.log("已更新发布文案:", outPath);
}

function buildShortTitle(title, person) {
  const t = (title || "").replace(/[「」""]/g, "").trim();
  if (t.length >= 6 && t.length <= 16) return t;
  const candidates = [
    `${person}三条智慧心法`,
    `智者周刊·${person}`,
    `${person}：本期智慧精选`,
    "智者周刊本期精选",
  ];
  for (const c of candidates) {
    if (c.length >= 6 && c.length <= 16) return c;
  }
  return t.slice(0, 16) || "智者周刊本期精选";
}

function main() {
  const { positional, seconds, withAudio, bgmPath, allowSynthBgm } = parseArgs(process.argv);
  const weekDir = findWeekDir(positional[0]);

  if (!weekDir) {
    console.error("用法: node generate-video.js <output子目录名> [--seconds 4] [--no-audio]");
    process.exit(1);
  }

  const pages = listPageImages(weekDir);
  if (pages.length === 0) {
    console.error(`未找到 page-*.png: ${weekDir}`);
    process.exit(1);
  }

  ensureFfmpeg();

  console.log("正在生成视频开场首页…");
  const introPath = prepareVideoIntro(weekDir);

  const segments = [
    { file: introPath, duration: INTRO_SECONDS },
    ...pages.map((file) => ({ file, duration: seconds })),
  ];
  const durationSec =
    INTRO_SECONDS + pages.length * seconds;

  const concatPath = path.join(weekDir, ".ffmpeg-concat.txt");
  const silentPath = path.join(weekDir, ".wisdom-video-silent.mp4");
  const outputPath = path.join(weekDir, "wisdom-video.mp4");
  const voicePath = path.join(weekDir, ".narration.mp3");

  console.log("产出目录:", weekDir);
  console.log("开场首页:", introPath, `(${INTRO_SECONDS}s)`);
  console.log("内容卡片:", pages.length, "张");
  console.log("每卡时长:", seconds, "秒");
  console.log("预计总长:", durationSec, "秒");
  console.log("音轨:", withAudio ? "旁白 + BGM" : "无");

  buildConcatFile(segments, concatPath);
  console.log("正在合成画面…");
  buildSilentVideo(concatPath, silentPath, durationSec);
  fs.unlinkSync(concatPath);

  if (withAudio) {
    const narration = buildNarrationScript(weekDir);
    console.log("正在合成旁白…");
    if (!synthesizeSpeech(narration, voicePath)) {
      console.warn("跳过音轨，输出无声版");
      fs.copyFileSync(silentPath, outputPath);
    } else {
      const bgmFile = resolveBgmPath(bgmPath, allowSynthBgm);
      console.log("配乐文件:", bgmFile);
      console.log("正在混音 BGM + 旁白（配乐循环 + 旁白时自动压低）…");
      muxAudioVideo(silentPath, bgmFile, voicePath, outputPath);
      try {
        fs.unlinkSync(voicePath);
      } catch (_) {}
    }
  } else {
    fs.copyFileSync(silentPath, outputPath);
  }

  try {
    fs.unlinkSync(silentPath);
  } catch (_) {}

  const xhsMeta = parseFrontmatter(path.join(weekDir, "xiaohongshu-post.md"));
  let wechatTitle = "";
  let person = "本期智者";
  const wechatPath = path.join(weekDir, "wechat-article.md");
  if (fs.existsSync(wechatPath)) {
    const h1 = fs.readFileSync(wechatPath, "utf8").match(/^#\s+(.+)/m);
    if (h1) {
      wechatTitle = h1[1].trim();
      const m = wechatTitle.match(/^([^：:]+)[：:]/);
      if (m) person = m[1].trim();
    }
  }
  const finalDur = getMediaDuration(outputPath);
  writeChannelsPost(
    weekDir,
    {
      title: xhsMeta.title || wechatTitle,
      person,
      tags: xhsMeta.tags,
      xhsBody: xhsMeta.body,
    },
    withAudio,
    finalDur
  );

  const stat = fs.statSync(outputPath);
  const dur = getMediaDuration(outputPath);
  console.log("\n✓ 视频已生成:", outputPath);
  console.log(`  大小: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `  时长: ${dur.toFixed(1)}s（开场 ${INTRO_SECONDS}s + ${pages.length} 页 × ${seconds}s）`
  );
  console.log("  视频号封面建议:", path.join(weekDir, "video-thumb.jpg"));
  console.log("\n下一步: 视频号助手上传 wisdom-video.mp4");
}

main();

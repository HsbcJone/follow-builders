const fs = require("fs");
const path = require("path");

const outDir = path.resolve(
  __dirname,
  "../../../../output/week-01-naval-ravikant"
);

function bodyPairs(pairs) {
  return pairs
    .map(
      ([zh, en]) =>
        `<div class="body-pair"><p class="para-zh">${zh}</p><p class="para-en">${en}</p></div>`
    )
    .join("\n");
}

function chapterPage(opts) {
  return `
<div class="page chapter">
  <div class="page-masthead">
    <div><div class="brand">Wisdom Weekly</div><div class="brand-zh">智者周刊</div></div>
    <div><div class="chapter-mini">${opts.miniEn}</div><div class="chapter-mini-zh">${opts.miniZh}</div></div>
  </div>
  <div class="chapter-header">
    <div class="chapter-label">${opts.chNum}</div>
    <div class="chapter-title-en">${opts.chTitleEn}</div>
    <div class="chapter-title-zh">${opts.chTitleZh}</div>
  </div>
  <div class="insight-block">
    <div class="insight-head">
      <div class="insight-title-zh">${opts.titleZh}</div>
      <div class="insight-title-en">${opts.titleEn}</div>
    </div>
    <div class="body-bilingual">
      <div class="body-bilingual-label"><span class="zh">正文</span><span class="en">Body</span></div>
      ${bodyPairs(opts.pairs)}
    </div>
    <div class="core-insight">
      <div class="core-label"><span class="zh">核心洞察</span><span class="en">Core Insight</span></div>
      <p class="quote-zh">${opts.coreZh}</p>
      <p class="quote-en">${opts.coreEn}</p>
    </div>
  </div>
  <div class="page-foot">
    <div class="foot-chapter">${opts.footZh}<span class="en">${opts.footEn}</span></div>
    <div class="foot-num">${opts.page}</div>
  </div>
</div>`;
}

const chapters = [
  {
    miniEn: "Chapter One", miniZh: "第一章",
    chNum: "CHAPTER ONE", chTitleEn: "Happiness Is a Choice", chTitleZh: "幸福是一种选择",
    titleZh: "从零开始的勇气", titleEn: "The Courage to Start from Zero",
    pairs: [
      ["真正伟大的人，愿意一次又一次地押注自己。他不在乎被视为成功还是失败——关键是，他永远愿意从头再来。", "Truly great people are willing to bet on themselves again and again. They don't care whether they look successful or foolish — what matters is they're always willing to start over."],
      ["很多人一旦获得成功、财富或名声，就停滞不前了。他们不愿意回到零点。但创造任何伟大的事物，都需要经历从零到一的过程。", "Many people stall once they gain success, wealth, or fame. They refuse to go back to zero. Yet creating anything great requires going from zero to one — and that return to zero is painful."],
    ],
    coreZh: "创造伟大之物，必先愿意回到零点——那是痛苦，也是自由的代价。",
    coreEn: "\"Creating anything great requires zero to one. And that means you go back to zero — and that's really painful and hard to do.\"",
    footZh: "幸福是一种选择", footEn: "Happiness Is a Choice", page: "03",
  },
  {
    miniEn: "Chapter One", miniZh: "第一章",
    chNum: "CHAPTER ONE", chTitleEn: "Happiness Is a Choice", chTitleZh: "幸福是一种选择",
    titleZh: "聪明人为什么不快乐？", titleEn: "If You're So Smart, Why Aren't You Happy?",
    pairs: [
      ["如果你在任何时刻都过得不开心，你其实没有在帮任何人的忙。很多人已经习惯了默默忍受痛苦，对生活质量的期望值极低。", "If you're unhappy in any given moment, you're not doing anyone a favor. Many people have grown used to suffering silently, with a very low bar for quality of life."],
      ["大量的痛苦是自我暗示的结果——你以为受苦是光荣的。但现实是：你可以既聪明又快乐。历史上有很多既聪明又快乐的人。", "Much suffering is self-inflicted — you believe pain is noble, that it makes you better. But you can be smart and happy. History is full of people who were both."],
    ],
    coreZh: "如果你这么聪明，为什么不快乐？你连这个都想不明白吗？",
    coreEn: "\"If you're so smart, why aren't you happy? Why can't you figure that one out?\"",
    footZh: "幸福是一种选择", footEn: "Happiness Is a Choice", page: "04",
  },
  {
    miniEn: "Chapter One", miniZh: "第一章",
    chNum: "CHAPTER ONE", chTitleEn: "Happiness Is a Choice", chTitleZh: "幸福是一种选择",
    titleZh: "快乐始于一个决定", titleEn: "Happiness Begins with a Decision",
    pairs: [
      ["幸福在很大程度上是一种选择。首先，你要认定自己将成为一个快乐的人，然后沿途去弄明白怎么做到。", "Happiness is largely a choice. First you decide you will be a happy person — then you figure out how along the way."],
      ["你不会因此失去野心或对成功的渴望——你只是会去做那些与快乐版本的你更一致的事情。", "You won't lose ambition or desire for success — you'll simply do things aligned with the happy version of you."],
    ],
    coreZh: "你追求成功是为了快乐，别把因果搞反了。",
    coreEn: "\"You're actually trying to be successful so you'll be happy — that's the whole point. You've gotten it backwards.\"",
    footZh: "幸福是一种选择", footEn: "Happiness Is a Choice", page: "05",
  },
  {
    miniEn: "Chapter Two", miniZh: "第二章",
    chNum: "CHAPTER TWO", chTitleEn: "Freedom, Peace & the Inner Game", chTitleZh: "自由、平静与内在博弈",
    titleZh: "自由的代价", titleEn: "The Price of Freedom",
    pairs: [
      ["自由是有代价的。你必须有能力负担得起它，你必须把生活安排成能够拥有那种程度的自由。", "Freedom has a cost. You must be able to afford it — and structure your life so you can have that level of freedom."],
      ["这不是给所有人的建议，但它值得追求：减少那些不必要地把你锁定在特定时间和地点的承诺。", "This isn't advice for everyone, but it's worth aspiring to: reduce commitments that unnecessarily lock you to specific times and places."],
    ],
    coreZh: "真正的自由：永远不必在特定时间出现在特定地点。",
    coreEn: "\"I never want to have to be at a specific place at a specific time.\" — That's freedom.",
    footZh: "自由与内在博弈", footEn: "Freedom & the Inner Game", page: "06",
  },
  {
    miniEn: "Chapter Two", miniZh: "第二章",
    chNum: "CHAPTER TWO", chTitleEn: "Freedom, Peace & the Inner Game", chTitleZh: "自由、平静与内在博弈",
    titleZh: "停止反应，开始行动", titleEn: "Stop Reacting, Start Acting",
    pairs: [
      ["很多人一辈子都在反应中度过。醒来就看手机、查邮件——立刻进入被动模式，整天被别人的优先事项支配。", "Many people spend their whole lives reacting — waking up to check their phone and email, instantly in reactive mode, their day dictated by others' priorities."],
      ["你在开始反应的那一刻就放弃了掌控权。早上留一段时间不看任何东西，在世界告诉你该做什么之前，先决定你想做什么。", "You give up control the moment you start reacting. Leave the morning untouched — think and decide what you want before the world tells you."],
    ],
    coreZh: "在刺激与反应之间留出空间——那里才有自由。",
    coreEn: "\"Slowing down, creating a little bit of space between stimulus and response — that's where freedom lies.\"",
    footZh: "自由与内在博弈", footEn: "Freedom & the Inner Game", page: "07",
  },
  {
    miniEn: "Chapter Two", miniZh: "第二章",
    chNum: "CHAPTER TWO", chTitleEn: "Freedom, Peace & the Inner Game", chTitleZh: "自由、平静与内在博弈",
    titleZh: "环境塑造你", titleEn: "Your Environment Programs You",
    pairs: [
      ["人们低估了环境对自己的塑造力。你和谁在一起、读什么、看什么、听什么——所有这些都在给你编程。", "People underestimate how much their environment shapes them. Who you're with, what you read, watch, and listen to — all of it programs you."],
      ["如果你总是和消极的人在一起，你就会变得更消极。仔细策划你的环境——这是你能做的最高杠杆的事情之一。", "If you're constantly around negative people, you'll become more negative. Curate your environment carefully — it's one of the highest-leverage things you can do."],
    ],
    coreZh: "策划你的输入环境，比靠意志力改变自己更有效。",
    coreEn: "\"Curate your environment carefully. It's one of the highest leverage things you can do.\"",
    footZh: "自由与内在博弈", footEn: "Freedom & the Inner Game", page: "08",
  },
  {
    miniEn: "Chapter Three", miniZh: "第三章",
    chNum: "CHAPTER THREE", chTitleEn: "The Status Trap & Authenticity", chTitleZh: "地位陷阱与真实",
    titleZh: "地位游戏的陷阱", titleEn: "The Status Game Trap",
    pairs: [
      ["地位是相对的，是零和博弈——你的地位提高，意味着别人的地位降低。财富则不同，它可以是正和的。", "Status is relative and zero-sum — for you to rise, someone else must fall. Wealth is different; it can be positive-sum."],
      ["如果你一生都在追逐地位，你就会陷入永恒的比较循环。但如果你专注于创造财富、建造事物、创造价值——那是一个你真正能赢的游戏。", "Chase status and you're trapped in endless comparison. Focus on creating wealth, building things, adding value — that's a game you can actually win."],
    ],
    coreZh: "追逐地位是零和游戏；创造财富的游戏，你才真正有机会赢。",
    coreEn: "\"If you spend your life chasing status, you're going to be in a constant comparison loop. You will never win that game.\"",
    footZh: "地位与真实", footEn: "Status & Authenticity", page: "09",
  },
  {
    miniEn: "Chapter Three", miniZh: "第三章",
    chNum: "CHAPTER THREE", chTitleEn: "The Status Trap & Authenticity", chTitleZh: "地位陷阱与真实",
    titleZh: "真实是被爱的方式", titleEn: "Authenticity Is How You're Loved",
    pairs: [
      ["归根结底，大多数人只是想被爱和被接受。但他们用错了方式——试图给别人留下印象、展示地位、融入群体。", "At the end of the day, most people want to be loved and accepted. But they go about it wrong — trying to impress, signal status, fit in."],
      ["真正被爱的方式是做真实的自己。你必须选择：被所有人喜欢，还是被少数人深爱？你不可能两者兼得。", "The way to be loved is to be authentic. You must choose: liked by everyone, or loved by a few. You can't have both."],
    ],
    coreZh: "最终，你必须自己思考——包括听谁的建议。",
    coreEn: "\"Ultimately, you have to think for yourself. Be very selective about who you listen to.\"",
    footZh: "地位与真实", footEn: "Status & Authenticity", page: "10",
  },
];

const toc = [
  ["幸福是一种选择", "Happiness Is a Choice"],
  ["从零开始的勇气", "The Courage to Start from Zero"],
  ["自由、平静与内在博弈", "Freedom, Peace & the Inner Game"],
  ["地位陷阱与真实", "The Status Trap & Authenticity"],
]
  .map(
    ([zh, en]) =>
      `<div class="toc-item"><div class="toc-zh">${zh}</div><div class="toc-en">${en}</div></div>`
  )
  .join("");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>纳瓦尔·拉维坎特 — Wisdom Weekly</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>

<div class="page cover">
  <div class="series-tag">Wisdom Collection</div>
  <div class="series-tag-zh">智 者 收 藏</div>
  <div class="person-name-en">NAVAL RAVIKANT</div>
  <div class="person-name-zh">纳 瓦 尔 的 智 慧</div>
  <div class="divider"></div>
  <div class="tagline">On Happiness, Freedom, Wealth & the Art of Living</div>
  <div class="subtitle">硅谷哲人 Naval Ravikant 的智慧精华<br>关于幸福、自由、财富与人生的深度思考</div>
  <div class="week-badge">Week 01 · 第 1 期</div>
</div>

<div class="page overview">
  <div class="page-masthead">
    <div><div class="brand">Wisdom Weekly</div><div class="brand-zh">智者周刊</div></div>
    <div><div class="chapter-mini">Overview</div><div class="chapter-mini-zh">本期概览</div></div>
  </div>
  <div class="overview-hero">
    <div class="book-title-en">The Almanack of Naval Ravikant</div>
    <div class="book-title-zh">纳 瓦 尔 宝 典</div>
    <div class="book-desc-en">On happiness, freedom, wealth, and the art of living — curated insights with bilingual body text on every page.</div>
    <div class="book-desc-zh">关于幸福、自由、财富与人生的深度思考 · 正文中英对照</div>
  </div>
  <div class="toc-title"><span>Contents</span><span class="zh">本期目录</span></div>
  ${toc}
  <div class="overview-note">
    正文、核心洞察均为中英双语 · 每页完整呈现
    <div class="en">Body text and core insights in Chinese and English on every page.</div>
  </div>
  <div class="page-foot">
    <div class="foot-chapter">纳瓦尔·拉维坎特<span class="en">Naval Ravikant</span></div>
    <div class="foot-num">02</div>
  </div>
</div>

${chapters.map(chapterPage).join("\n")}

<div class="page ending">
  <div class="series-en">Wisdom Weekly</div>
  <div class="series-zh">智 者 周 刊</div>
  <div class="week-info">第 1 期 · 纳瓦尔·拉维坎特</div>
  <div class="week-info-en">Issue 01 · Naval Ravikant</div>
  <div class="next-label">下期预告</div>
  <div class="next-label-en">Coming Next</div>
  <div class="next-name">查理·芒格</div>
  <div class="next-name-en">Charlie Munger</div>
</div>

</body>
</html>`;

fs.writeFileSync(path.join(outDir, "wisdom.html"), html);
console.log("wrote wisdom.html", chapters.length + 3, "pages");

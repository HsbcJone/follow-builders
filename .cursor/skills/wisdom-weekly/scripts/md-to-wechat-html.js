/**
 * Markdown → 微信公众号兼容 HTML（简洁内联样式）
 * marked v9+：renderer 接收 token 对象，需用 parser.parseInline / parse
 */
const { marked } = require("marked");

const blockStyle =
  "margin:0 0 1em;font-size:16px;line-height:1.75;color:#3d3d3d;";
const h2Style =
  "margin:1.2em 0 0.6em;font-size:18px;font-weight:bold;color:#1a1a1a;border-left:4px solid #b8860b;padding-left:10px;";
const quoteStyle =
  "margin:1em 0;padding:12px 16px;background:#f7f3eb;border-left:3px solid #b8860b;color:#555;font-size:15px;line-height:1.7;";
const hrStyle = "border:none;border-top:1px solid #e8e0d5;margin:24px 0;";
const listStyle = "margin:0 0 1em;padding-left:1.2em;font-size:16px;line-height:1.75;color:#3d3d3d;";

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 1) return "";
      if (depth === 2) return `<h2 style="${h2Style}">${text}</h2>\n`;
      return `<h3 style="${h2Style}">${text}</h3>\n`;
    },
    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<p style="${blockStyle}">${text}</p>\n`;
    },
    blockquote({ tokens }) {
      const body = this.parser.parse(tokens);
      return `<blockquote style="${quoteStyle}">${body}</blockquote>\n`;
    },
    hr() {
      return `<hr style="${hrStyle}"/>\n`;
    },
    strong({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<strong style="color:#1a1a1a;">${text}</strong>`;
    },
    em({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<em>${text}</em>`;
    },
    codespan({ text }) {
      return `<span style="background:#f5f0e8;padding:2px 6px;border-radius:3px;font-size:14px;">${text}</span>`;
    },
    list(token) {
      const tag = token.ordered ? "ol" : "ul";
      const body = token.items.map((item) => this.listitem(item)).join("");
      return `<${tag} style="${listStyle}">${body}</${tag}>\n`;
    },
    listitem(item) {
      const text = this.parser.parse(item.tokens);
      return `<li style="margin:0.4em 0;">${text}</li>\n`;
    },
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<a href="${href}" style="color:#b8860b;">${text}</a>`;
    },
  },
});

function markdownToWechatHtml(markdown) {
  let md = markdown.replace(/\r\n/g, "\n");
  const lines = md.split("\n");
  if (lines[0]?.startsWith("# ")) {
    md = lines.slice(1).join("\n").replace(/^\n+/, "");
  }
  md = md.replace(/^---\n[\s\S]*?\n---\n/, "");

  const html = marked.parse(md);
  return `<section style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif;padding:8px 4px;">\n${html.trim()}\n</section>`;
}

function extractTitle(markdown) {
  const m = markdown.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : "智者周刊";
}

function extractDigest(markdown, maxLen = 120) {
  const plain = markdown
    .replace(/^#.+$/m, "")
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/[#>*`\[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length <= maxLen ? plain : `${plain.slice(0, maxLen - 1)}…`;
}

module.exports = { markdownToWechatHtml, extractTitle, extractDigest };

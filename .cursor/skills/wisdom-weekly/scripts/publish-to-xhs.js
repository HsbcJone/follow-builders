#!/usr/bin/env node
/**
 * 辅助脚本：列出某期可用于发布的图片绝对路径，并校验 xiaohongshu-mcp 是否在线
 * 实际发布由 Cursor Agent 调用 MCP publish_content 完成
 *
 * 用法（项目根目录）:
 *   node .cursor/skills/wisdom-weekly/scripts/publish-to-xhs.js week-01-naval-ravikant
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

const projectRoot = path.resolve(__dirname, "../../../../");
const weekDir = process.argv[2]
  ? path.join(projectRoot, "output", process.argv[2])
  : null;

if (!weekDir || !fs.existsSync(weekDir)) {
  console.error("用法: node publish-to-xhs.js <output子目录名>");
  console.error("示例: node publish-to-xhs.js week-01-naval-ravikant");
  process.exit(1);
}

const images = fs
  .readdirSync(weekDir)
  .filter((f) => /^page-\d+\.png$/i.test(f))
  .sort()
  .map((f) => path.join(weekDir, f));

const postFile = path.join(weekDir, "xiaohongshu-post.md");

console.log("产出目录:", weekDir);
console.log("图片数量:", images.length);
images.forEach((p, i) => console.log(`  [${i + 1}] ${p}`));

if (fs.existsSync(postFile)) {
  console.log("\n文案文件:", postFile);
} else {
  console.log("\n尚未生成 xiaohongshu-post.md，请先 /publish-xhs preview");
}

function checkMcp() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 18060,
        path: "/mcp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        timeout: 3000,
      },
      (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.write(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "wisdom-weekly", version: "1.0.0" },
        },
        id: 1,
      })
    );
    req.end();
  });
}

checkMcp().then((ok) => {
  console.log(
    ok
      ? "\n✓ xiaohongshu-mcp 服务可达 (localhost:18060)"
      : "\n✗ MCP 未运行 → bash tools/xiaohongshu-mcp/start.sh"
  );
});

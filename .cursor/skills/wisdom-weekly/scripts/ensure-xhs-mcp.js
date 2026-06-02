#!/usr/bin/env node
/**
 * 发布小红书前自动确保 xiaohongshu-mcp 在运行（默认非无头）
 */
const { spawnSync } = require("child_process");
const http = require("http");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../../../../");
const ensureSh = path.join(projectRoot, "tools/xiaohongshu-mcp/ensure-running.sh");
const PORT = Number(process.env.XHS_MCP_PORT || 18060);

function checkMcp() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path: "/mcp",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        timeout: 3000,
      },
      (res) => resolve(res.statusCode >= 200 && res.statusCode < 500)
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
          clientInfo: { name: "ensure-xhs-mcp", version: "1.0.0" },
        },
        id: 1,
      })
    );
    req.end();
  });
}

async function main() {
  if (await checkMcp()) {
    const mode = process.env.XHS_HEADLESS === "1" ? "无头" : "优先非无头";
    console.log(`✓ xiaohongshu-mcp 已在运行 (localhost:${PORT}, ${mode})`);
    // 仍跑 ensure-running：无头旧进程会被重启为非无头
  }

  const r = spawnSync("bash", [ensureSh], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env },
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (out) console.log(out);

  if (r.status !== 0) {
    console.error("✗ 无法启动 xiaohongshu-mcp");
    process.exit(r.status || 1);
  }

  if (!(await checkMcp())) {
    console.error("✗ MCP 启动后仍不可达");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

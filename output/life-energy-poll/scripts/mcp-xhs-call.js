#!/usr/bin/env node
/**
 * 调用本地 xiaohongshu-mcp（Streamable HTTP）
 */
const http = require("http");

const PORT = Number(process.env.XHS_MCP_PORT || 18060);
const HOST = process.env.XHS_MCP_HOST || "127.0.0.1";

function mcpRequest(body, sessionId) {
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (sessionId) headers["Mcp-Session-Id"] = sessionId;

    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path: "/mcp",
        method: "POST",
        headers,
        timeout: 120_000,
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          const sid =
            res.headers["mcp-session-id"] ||
            res.headers["Mcp-Session-Id"];
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            /* SSE 或多段响应时取最后一行 JSON */
            const lines = data.trim().split("\n");
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].replace(/^data:\s*/, "").trim();
              if (!line.startsWith("{")) continue;
              try {
                json = JSON.parse(line);
                break;
              } catch {
                /* continue */
              }
            }
          }
          if (!json) {
            if (
              (res.statusCode === 202 || res.statusCode === 204) &&
              !data.trim()
            ) {
              resolve({ json: { ok: true }, sessionId: sid || sessionId });
              return;
            }
            reject(
              new Error(
                `MCP 响应无法解析 (HTTP ${res.statusCode}): ${data.slice(0, 500)}`
              )
            );
            return;
          }
          resolve({ json, sessionId: sid || sessionId });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("MCP 请求超时"));
    });
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function createSession() {
  const init = await mcpRequest({
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "life-energy-poll", version: "1.0.0" },
    },
    id: 1,
  });
  const sessionId = init.sessionId;
  if (!sessionId) throw new Error("未获得 Mcp-Session-Id");

  await mcpRequest(
    { jsonrpc: "2.0", method: "notifications/initialized", params: {} },
    sessionId
  );
  return sessionId;
}

async function callTool(sessionId, name, args = {}) {
  const { json } = await mcpRequest(
    {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name, arguments: args },
      id: Date.now(),
    },
    sessionId
  );
  if (json.error) {
    throw new Error(json.error.message || JSON.stringify(json.error));
  }
  return json.result;
}

module.exports = { createSession, callTool };

if (require.main === module) {
  const tool = process.argv[2];
  const argsJson = process.argv[3] || "{}";
  (async () => {
    const sessionId = await createSession();
    const args = JSON.parse(argsJson);
    const result = await callTool(sessionId, tool, args);
    console.log(JSON.stringify(result, null, 2));
  })().catch((e) => {
    console.error("✗", e.message || e);
    process.exit(1);
  });
}

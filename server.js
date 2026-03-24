const http = require("node:http");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

const BASE_PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const DEFAULT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const INDEX_PATH = path.join(__dirname, "index.html");
const ENV_PATH = path.join(__dirname, ".env");
const SYSTEM_PROMPT = `You are LENS, an AI tutor. Your only job is to help the user learn and understand
whatever is on their screen right now.

When you see code: walk through what it does, line by line if needed. Explain the
logic like you are a patient senior developer talking to a junior.

When you see an error message: explain exactly why it happened, what caused it,
and what the user should do to fix it step by step.

When you see a document, article, or webpage: pull out the key ideas and explain
them clearly. Connect concepts. Ask a question at the end to check understanding.

When you see a design or UI: give honest, constructive feedback. Explain what
works and what could be clearer from a user's perspective.

Always explain your reasoning, not just the answer. Your goal is that after
talking to you, the user actually understands, not just has a solution.

Be warm, direct, and clear. Talk like a knowledgeable friend, not a textbook.
Never use markdown formatting. No hashtags, asterisks, dashes, or code fences.
Write in flowing plain prose the way a teacher speaks out loud.
Keep responses focused and appropriately concise. Do not ramble.

When describing screenshots, only use visible evidence. If anything is unclear,
say so explicitly instead of guessing.`;

loadDotEnv();

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function text(response, statusCode, payload, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

function loadDotEnv() {
  if (!fsSync.existsSync(ENV_PATH)) {
    return;
  }

  const raw = fsSync.readFileSync(ENV_PATH, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function readJson(request) {
  let raw = "";

  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 20 * 1024 * 1024) {
      throw new Error("Request body is too large.");
    }
  }

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function cloudflareUrl(accountId) {
  const model = String(process.env.CLOUDFLARE_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
}

function resolveCredentials(body) {
  const accountId = String(body.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const apiToken = String(body.apiToken || process.env.CLOUDFLARE_API_TOKEN || "").trim();

  if (!accountId || !apiToken) {
    throw new Error("Missing Cloudflare Account ID or API Token.");
  }

  return { accountId, apiToken };
}

async function callCloudflare(credentials, payload) {
  let response;
  let data;

  try {
    response = await fetch(cloudflareUrl(credentials.accountId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Could not reach Cloudflare Workers AI.");
  }

  try {
    data = await response.json();
  } catch {
    throw new Error(`Cloudflare returned status ${response.status} with an unreadable response.`);
  }

  if (!response.ok || data?.success === false) {
    const apiError =
      (Array.isArray(data?.errors) && data.errors.map((entry) => entry?.message).filter(Boolean).join(" ")) ||
      data?.message ||
      `Cloudflare returned status ${response.status}.`;
    throw new Error(apiError);
  }

  return data;
}

function shouldRetryWithLicense(error) {
  const message = error instanceof Error ? error.message : "";
  return /license|acceptable use|agree/i.test(message);
}

async function acceptMetaLicense(credentials) {
  try {
    await callCloudflare(credentials, { prompt: "agree" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/already accepted|previously accepted|already agreed|thank you for agreeing/i.test(message)) {
      return;
    }
    throw error;
  }
}

function extractReply(data) {
  const result = data?.result;

  const reply =
    (result && typeof result === "object" && (result.response || result.output_text || result.text)) ||
    (typeof result === "string" ? result : "") ||
    "";

  return String(reply || "").trim();
}

async function proxyLensTurn(body) {
  const credentials = resolveCredentials(body);
  const userMessage = String(body.userMessage || "").trim();
  const history = Array.isArray(body.history) ? body.history : [];
  const frameDataUrl = String(body.frameDataUrl || "").trim();

  if (!userMessage) {
    throw new Error("Missing user message.");
  }

  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...history];

  if (frameDataUrl) {
    messages.push({
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: frameDataUrl },
        },
        {
          type: "text",
          text: userMessage,
        },
      ],
    });
  } else {
    messages.push({
      role: "user",
      content: userMessage,
    });
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const data = await callCloudflare(credentials, {
        messages,
        max_tokens: 1500,
        temperature: 0.15,
      });
      const reply = extractReply(data);
      if (!reply) {
        throw new Error("Cloudflare returned no tutor response.");
      }
      return reply;
    } catch (error) {
      if (attempt === 0 && shouldRetryWithLicense(error)) {
        await acceptMetaLicense(credentials);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Cloudflare returned no tutor response.");
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${BASE_PORT}`}`);

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    try {
      const html = await fs.readFile(INDEX_PATH, "utf8");
      text(response, 200, html, "text/html; charset=utf-8");
    } catch {
      text(response, 500, "Could not read index.html");
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    json(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/config") {
    json(response, 200, {
      hasServerCredentials: Boolean(
        process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
      ),
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lens") {
    try {
      const body = await readJson(request);
      const reply = await proxyLensTurn(body);
      json(response, 200, { reply });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lens proxy request failed.";
      json(response, 500, { error: message });
    }
    return;
  }

  json(response, 404, { error: "Not found." });
});

function startServer(port, retriesLeft = 10) {
  const onError = (error) => {
    server.off("listening", onListening);

    if (error && error.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy, trying ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    throw error;
  };

  const onListening = () => {
    server.off("error", onError);
    console.log(`LENS running at http://${HOST}:${port}`);
  };

  server.once("error", onError);
  server.once("listening", onListening);
  server.listen(port, HOST);
}

startServer(BASE_PORT);

const http = require("node:http");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

const BASE_PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const DEFAULT_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const INDEX_PATH = path.join(__dirname, "index.html");
const ENV_PATH = path.join(__dirname, ".env");
const SYSTEM_PROMPT = `You are LENS, an expert AI tutor. Your entire purpose is to help the user LEARN.
The user is sharing their screen with you. Look at what they're working on and:
- Explain concepts clearly as if teaching a student
- If you see code, explain what it does step by step
- If you see an error, explain WHY it happened and HOW to fix it
- If you see a document or article, summarize and teach the key ideas
- If you see a design or interface, give thoughtful UX/design feedback
- Ask guiding questions to help the user think deeper
- Be encouraging, patient, and concise
- Never just give answers — explain the reasoning so the user truly learns
You are a teacher, not just an assistant.
When the screen shows a coding problem, competitive programming prompt, or LeetCode question:
- Read the visible prompt carefully before answering
- Do not invent requirements, constraints, or APIs that are not visible
- If part of the screenshot is cut off or unclear, explicitly say what is missing instead of guessing
- If the user asks for C++, answer in C++ unless they ask for another language
- Prefer this order when useful: problem understanding, approach, edge cases, complexity, then complete solution
- If you provide code, it must be complete and not truncated
- If you see existing user code, explain why it is wrong and what should change
Prefer short sections with bold labels instead of markdown bullet stars when possible.
When describing a screenshot or webpage, follow these grounding rules:
- Only describe content that is visibly present in the image
- If text is unreadable or partially cut off, explicitly say that it is unclear
- Do not infer brand names, product names, or page purpose unless clearly visible
- Include a short "Visible evidence" section with exact on-screen words you can read
- Keep summaries concise: 4-8 lines unless the user asks for more detail
If the user asks for a website or page summary, use this structure:
- Topic: what the page is mainly about
- What it offers: key actions/features visible
- Search intent: what the user likely searched for to reach this page
- Visible evidence: exact words seen on screen
- Unclear/missing: what cannot be read clearly
Never fabricate details not visible in the screenshot.`;

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

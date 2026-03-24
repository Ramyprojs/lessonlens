const DEFAULT_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.status(204).set(DEFAULT_HEADERS).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).set(DEFAULT_HEADERS).json({ error: "Method not allowed." });
    return;
  }

  response.status(200).set(DEFAULT_HEADERS).json({
    hasServerCredentials: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
    ),
  });
};

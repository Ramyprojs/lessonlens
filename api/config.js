const DEFAULT_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function applyHeaders(response) {
  Object.entries(DEFAULT_HEADERS).forEach(([key, value]) => {
    response.setHeader(key, value);
  });
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    applyHeaders(response);
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    applyHeaders(response);
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  applyHeaders(response);
  response.status(200).json({
    hasServerCredentials: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
    ),
  });
};

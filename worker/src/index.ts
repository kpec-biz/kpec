import { Env } from "./airtable";
import { handleAuthRequest, handleAuthVerify } from "./auth";
import { handleBoard } from "./board";
import { handleAnalytics } from "./analytics";

function corsHeaders(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function withCors(response: Response, env: Env): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(env))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let response: Response;

      if (path === "/api/admin-auth" && request.method === "POST") {
        response = await handleAuthRequest(request, env);
      } else if (path === "/api/admin-verify" && request.method === "POST") {
        response = await handleAuthVerify(request, env);
      } else if (path.startsWith("/api/board")) {
        response = await handleBoard(request, env);
      } else if (path === "/api/analytics") {
        response = await handleAnalytics(request, env);
      } else if (path === "/api/health") {
        response = Response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
        });
      } else {
        response = Response.json({ error: "Not found" }, { status: 404 });
      }

      return withCors(response, env);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return withCors(Response.json({ error: message }, { status: 500 }), env);
    }
  },
};

import { Env } from "./airtable";
import { handleAuthRequest, handleAuthVerify } from "./auth";
import { handleBoard } from "./board";
import { handleAnalytics } from "./analytics";
import { handleInquiry } from "./inquiry";
import { handleDailyReport, handleDailyReportHTTP } from "./daily-report";

function resolveAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  const allowed = (env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const pattern of allowed) {
    if (pattern === origin) return origin;
    // glob suffix: "*.vercel.app" → matches any subdomain
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1);
      if (origin.endsWith(suffix)) return origin;
    }
  }
  return null;
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const allowedOrigin = resolveAllowedOrigin(request, env);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }
  return headers;
}

function withCors(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request, env))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await handleDailyReport(env);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
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
      } else if (path === "/api/inquiry") {
        response = await handleInquiry(request, env);
      } else if (path === "/api/analytics") {
        response = await handleAnalytics(request, env);
      } else if (path === "/api/daily-report") {
        response = await handleDailyReportHTTP(request, env);
      } else if (path === "/api/health") {
        response = Response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
        });
      } else {
        response = Response.json({ error: "Not found" }, { status: 404 });
      }

      return withCors(response, request, env);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return withCors(
        Response.json({ error: message }, { status: 500 }),
        request,
        env,
      );
    }
  },
};

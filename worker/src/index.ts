import { Env } from "./airtable";
import { handleAuthRequest, handleAuthVerify } from "./auth";
import { handleAnalytics } from "./analytics";
import { handleInquiry } from "./inquiry";
import { handleDailyReport, handleDailyReportHTTP } from "./daily-report";
import { handleNoticesList, handleNoticeById } from "./notices";
import { handleCronAnalytics, handleCronAnalyticsHTTP } from "./cron-analytics";

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
  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    // KST 08:00 (UTC 23:00) — 일일 통계 텔레그램 리포트
    if (event.cron === "0 23 * * *") {
      await handleDailyReport(env);
      return;
    }
    // KST 08:30 (UTC 23:30) — GA4 → D1 누적 (4 period + daily snapshot)
    // Worker IP는 GA4 anti-abuse에 차단되므로 GA4 호출은 Vercel /api/analytics?mode=...
    // 로 위임. cron 스케줄과 D1 write는 Worker가 담당.
    if (event.cron === "30 23 * * *") {
      try {
        const result = await handleCronAnalytics(env);
        console.log("[cron-analytics]", JSON.stringify(result));
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error("[cron-analytics] failed:", message);
        await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: env.TELEGRAM_CHAT_ID,
              text: `⚠️ [KPEC/cron-analytics] 실패\n${message.slice(0, 200)}`,
            }),
          },
        );
      }
    }
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
      } else if (path === "/api/notices" && request.method === "GET") {
        response = await handleNoticesList(request, env);
      } else if (path.startsWith("/api/notices/") && request.method === "GET") {
        const pblancId = decodeURIComponent(path.slice("/api/notices/".length));
        response = await handleNoticeById(pblancId, env);
      } else if (path === "/api/inquiry") {
        response = await handleInquiry(request, env);
      } else if (path === "/api/analytics") {
        response = await handleAnalytics(request, env);
      } else if (path === "/api/daily-report") {
        response = await handleDailyReportHTTP(request, env);
      } else if (path === "/api/cron-analytics") {
        response = await handleCronAnalyticsHTTP(request, env);
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

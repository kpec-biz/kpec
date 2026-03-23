import { Env } from "./airtable";
import { handleAuthRequest, handleAuthVerify } from "./auth";
import { handleBoard } from "./board";
import { handleAnalytics } from "./analytics";
import { handleInquiry } from "./inquiry";
import { runPipeline } from "./pipeline";

async function sendTg(env: Env, chatId: string, text: string) {
  try {
    await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      },
    );
  } catch {
    /* ignore */
  }
}

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
  // 매일 08:00 KST (UTC 22:57) — 콘텐츠 파이프라인 직접 실행
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const chatId = "-1003423266787";
    try {
      await sendTg(env, chatId, "🚀 [Worker Cron] 파이프라인 시작");
      const results = await runPipeline(env);
      console.log("Pipeline results:", JSON.stringify(results));
    } catch (e) {
      await sendTg(
        env,
        chatId,
        `❌ [Worker Cron] 파이프라인 실패\n${String(e).slice(0, 300)}`,
      );
    }
  },

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
      } else if (path === "/api/inquiry") {
        response = await handleInquiry(request, env);
      } else if (path === "/api/analytics") {
        response = await handleAnalytics(request, env);
      } else if (path === "/api/pipeline" && request.method === "POST") {
        // 수동 파이프라인 트리거 (CRON_SECRET 인증)
        const auth = request.headers.get("authorization");
        if (auth !== `Bearer ${env.CRON_SECRET}`) {
          response = Response.json({ error: "Unauthorized" }, { status: 401 });
        } else {
          const results = await runPipeline(env);
          response = Response.json({ message: "Pipeline complete", results });
        }
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

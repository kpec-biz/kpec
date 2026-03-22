import { Env } from "./airtable";
import { handleAuthRequest, handleAuthVerify } from "./auth";
import { handleBoard } from "./board";
import { handleAnalytics } from "./analytics";
import { handleInquiry } from "./inquiry";

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
  // 매일 08:00 KST (UTC 23:00) — 콘텐츠 파이프라인 실행
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const pipelineUrl = `${env.CORS_ORIGIN}/api/cron/pipeline`;
    const chatId = "-1003423266787";

    try {
      const res = await fetch(pipelineUrl, {
        headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
      });
      const data = (await res.json()) as Record<string, unknown>;

      // 텔레그램 요약 (파이프라인 내부에서도 보내지만, Worker 레벨 확인용)
      if (!res.ok) {
        await sendTg(
          env,
          chatId,
          `❌ [Worker Cron] 파이프라인 HTTP ${res.status}\n${JSON.stringify(data).slice(0, 300)}`,
        );
      }
    } catch (e) {
      await sendTg(
        env,
        chatId,
        `❌ [Worker Cron] 파이프라인 호출 실패\n${String(e).slice(0, 300)}`,
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

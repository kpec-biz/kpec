import { Env } from "./airtable";

const API_BASE = "https://jsbizfunding.kr";

interface AnalyticsData {
  activeUsers: number;
  pageViews: number;
  avgDuration: number;
  bounceRate: number;
  topPages: { path: string; views: number }[];
  trafficSources: { name: string; sessions: number }[];
  devices: { name: string; users: number }[];
  referrers: { name: string; sessions: number }[];
  dailyTrend: { date: string; users: number; pageViews: number }[];
  regions: { name: string; users: number }[];
}

function getYesterday(): string {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() + 9); // KST
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}분 ${s}초`;
}

const SOURCE_KR: Record<string, string> = {
  Direct: "직접 방문",
  "Organic Search": "검색 유입",
  "Organic Social": "SNS",
  Referral: "추천",
  Unassigned: "기타",
};

const DEVICE_KR: Record<string, string> = {
  desktop: "PC",
  mobile: "모바일",
  tablet: "태블릿",
};

function buildMessage(date: string, data: AnalyticsData): string {
  const bouncePercent = (data.bounceRate * 100).toFixed(1);
  const totalSessions =
    data.trafficSources.reduce((s, t) => s + t.sessions, 0) || 1;
  const totalDeviceUsers = data.devices.reduce((s, d) => s + d.users, 0) || 1;

  // 디바이스
  const deviceLines = data.devices
    .map((d) => {
      const pct = Math.round((d.users / totalDeviceUsers) * 100);
      return `  \u2022 ${DEVICE_KR[d.name] || d.name}: ${pct}% (${d.users}명)`;
    })
    .join("\n");

  // 유입 경로
  const sourceLines = data.trafficSources
    .map((s) => {
      const pct = Math.round((s.sessions / totalSessions) * 100);
      return `  \u2022 ${SOURCE_KR[s.name] || s.name}: ${pct}% (${s.sessions}회)`;
    })
    .join("\n");

  // 유입 출처
  const referrerLines = data.referrers
    .slice(0, 5)
    .map((r, i) => `  ${i + 1}. ${r.name} \u2014 ${r.sessions}회`)
    .join("\n");

  // 인기 페이지 TOP 5
  const pageLines = data.topPages
    .slice(0, 5)
    .map((p, i) => {
      const label = p.path === "/" ? "/ (메인)" : p.path;
      return `  ${i + 1}. ${label} \u2014 ${p.views}회`;
    })
    .join("\n");

  // 지역 TOP 3
  const regionLines = data.regions
    .slice(0, 3)
    .map((r) => `  \u2022 ${r.name}: ${r.users}명`)
    .join("\n");

  return [
    `\ud83d\udcca [KPEC] \uc77c\uc77c \ubc29\ubb38\uc790 \ud1b5\uacc4 (${date})`,
    "",
    `\ud83d\udc65 \ubc29\ubb38\uc790: ${data.activeUsers}명`,
    `\ud83d\udc40 \ud398\uc774\uc9c0\ubdf0: ${data.pageViews}회`,
    `\u23f1 \ud3c9\uade0 \uccb4\ub958\uc2dc\uac04: ${formatDuration(data.avgDuration)}`,
    `\ud83d\udcc9 \uc774\ud0c8\ub960: ${bouncePercent}%`,
    "",
    `\ud83d\udcf1 \ub514\ubc14\uc774\uc2a4`,
    deviceLines,
    "",
    `\ud83d\udd17 \uc720\uc785 \uacbd\ub85c`,
    sourceLines,
    "",
    `\ud83d\udd0d \uc720\uc785 \ucd9c\ucc98`,
    referrerLines,
    "",
    `\ud83d\udcc4 \uc778\uae30 \ud398\uc774\uc9c0 TOP 5`,
    pageLines,
    "",
    `\ud83c\udf0f \uc9c0\uc5ed TOP 3`,
    regionLines,
  ].join("\n");
}

async function sendTelegram(env: Env, text: string): Promise<boolean> {
  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    },
  );
  return res.ok;
}

export async function handleDailyReport(env: Env): Promise<string> {
  const yesterday = getYesterday();

  const res = await fetch(
    `${API_BASE}/api/analytics?mode=custom&startDate=${yesterday}&endDate=${yesterday}`,
  );

  if (!res.ok) {
    const err = `GA4 API 실패: ${res.status}`;
    await sendTelegram(env, `\u26a0\ufe0f [KPEC] 일일 통계 수집 실패\n${err}`);
    return err;
  }

  const data: AnalyticsData = await res.json();
  const message = buildMessage(yesterday, data);
  const sent = await sendTelegram(env, message);

  return sent ? `${yesterday} 리포트 발송 완료` : "텔레그램 발송 실패";
}

export async function handleDailyReportHTTP(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (!secret || secret !== env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await handleDailyReport(env);
  return Response.json({ result });
}

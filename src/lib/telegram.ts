// 텔레그램 파이프라인 알림
const PIPELINE_CHAT_ID = "-1003423266787";

export async function sendPipelineLog(
  type: "success" | "error" | "info",
  pipeline: string,
  message: string,
  details?: string,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const emoji = { success: "✅", error: "❌", info: "ℹ️" }[type];
  const time = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  let text = `${emoji} <b>[${pipeline}]</b>\n${message}\n<code>${time}</code>`;
  if (details) {
    text += `\n\n<pre>${details.slice(0, 500)}</pre>`;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: PIPELINE_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch {
    // 텔레그램 전송 실패해도 파이프라인은 계속
  }
}

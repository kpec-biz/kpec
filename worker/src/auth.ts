import { Env } from "./airtable";

const otpStore = new Map<string, { code: string; exp: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendTelegram(env: Env, message: string) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

export async function handleAuthRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const { email } = (await request.json()) as { email: string };

  if (email !== env.ADMIN_EMAIL) {
    return Response.json(
      { error: "등록되지 않은 이메일입니다." },
      { status: 403 },
    );
  }

  const code = generateOTP();
  otpStore.set(email, { code, exp: Date.now() + 5 * 60 * 1000 }); // 5분

  await sendTelegram(
    env,
    `🔐 <b>KPEC 관리자 로그인</b>\n\n인증코드: <code>${code}</code>\n유효시간: 5분`,
  );

  return Response.json({
    success: true,
    message: "인증코드가 발송되었습니다.",
  });
}

export async function handleAuthVerify(
  request: Request,
  env: Env,
): Promise<Response> {
  const { email, code } = (await request.json()) as {
    email: string;
    code: string;
  };

  const stored = otpStore.get(email);
  if (!stored) {
    return Response.json(
      { error: "인증코드를 먼저 요청하세요." },
      { status: 400 },
    );
  }

  if (Date.now() > stored.exp) {
    otpStore.delete(email);
    return Response.json(
      { error: "인증코드가 만료되었습니다." },
      { status: 400 },
    );
  }

  if (stored.code !== code) {
    return Response.json(
      { error: "인증코드가 일치하지 않습니다." },
      { status: 400 },
    );
  }

  otpStore.delete(email);

  // 24시간 유효 토큰
  const payload = {
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const token = btoa(JSON.stringify(payload));

  return Response.json({ success: true, token });
}

export function verifyToken(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;

  try {
    const payload = JSON.parse(atob(auth.slice(7)));
    if (payload.exp < Date.now()) return false;
    if (payload.email !== env.ADMIN_EMAIL) return false;
    return true;
  } catch {
    return false;
  }
}

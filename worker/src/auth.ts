import { Env } from "./airtable";

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
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
  _request: Request,
  env: Env,
): Promise<Response> {
  if (!env.ADMIN_OTP_SECRET) {
    return Response.json({ error: "ADMIN_OTP_SECRET 미설정" }, { status: 500 });
  }

  const code = generateOTP();
  const exp = Date.now() + OTP_TTL_MS;
  const sig = await hmacSha256(env.ADMIN_OTP_SECRET, `${code}.${exp}`);
  const challenge = `${exp}.${sig}`;

  await sendTelegram(
    env,
    `🔐 <b>KPEC 관리자 로그인</b>\n\n인증코드: <code>${code}</code>\n유효시간: 5분`,
  );

  return Response.json({
    success: true,
    challenge,
    message: "인증코드가 발송되었습니다.",
  });
}

export async function handleAuthVerify(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!env.ADMIN_OTP_SECRET) {
    return Response.json({ error: "ADMIN_OTP_SECRET 미설정" }, { status: 500 });
  }

  let body: { code?: string; challenge?: string };
  try {
    body = (await request.json()) as { code?: string; challenge?: string };
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const code = (body.code ?? "").trim();
  const challenge = (body.challenge ?? "").trim();

  if (!code || !challenge) {
    return Response.json(
      { error: "인증코드를 먼저 요청하세요." },
      { status: 400 },
    );
  }

  const [expStr, providedSig] = challenge.split(".");
  const exp = Number(expStr);
  if (!exp || !providedSig) {
    return Response.json(
      { error: "인증 토큰이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (Date.now() > exp) {
    return Response.json(
      { error: "인증코드가 만료되었습니다." },
      { status: 400 },
    );
  }

  const expectedSig = await hmacSha256(env.ADMIN_OTP_SECRET, `${code}.${exp}`);
  if (!timingSafeEqual(providedSig, expectedSig)) {
    return Response.json(
      { error: "인증코드가 일치하지 않습니다." },
      { status: 400 },
    );
  }

  const sessionExp = Date.now() + SESSION_TTL_MS;
  const sessionPayload = `admin.${sessionExp}`;
  const sessionSig = await hmacSha256(env.ADMIN_OTP_SECRET, sessionPayload);
  const token = `${sessionPayload}.${sessionSig}`;

  return Response.json({ success: true, token });
}

export async function verifyToken(
  request: Request,
  env: Env,
): Promise<boolean> {
  if (!env.ADMIN_OTP_SECRET) return false;

  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;

  const token = auth.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [role, expStr, providedSig] = parts;
  const exp = Number(expStr);
  if (role !== "admin" || !exp || Date.now() > exp) return false;

  const expectedSig = await hmacSha256(env.ADMIN_OTP_SECRET, `${role}.${exp}`);
  return timingSafeEqual(providedSig, expectedSig);
}

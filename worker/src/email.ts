import { Env } from "./airtable";

// --- Gmail OAuth2 Refresh Token ---
async function getAccessToken(env: Env): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }).toString(),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`Gmail OAuth error: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// --- UTF-8 to base64url (for Gmail API raw field) ---
function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// --- RFC2047 encode for headers ---
function encodeHeader(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

// --- Gmail API Send ---
async function sendGmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const token = await getAccessToken(env);
  const from = env.GMAIL_SENDER;

  const raw = [
    `From: ${encodeHeader("KPEC 경영컨설팅")} <${from}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  const encoded = toBase64url(new TextEncoder().encode(raw));

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail send error: ${res.status} ${err}`);
  }
}

// --- KRDS Colors ---
const C = {
  primary70: "#083891",
  primary80: "#052561",
  primary60: "#0b50d0",
  primary5: "#ecf2fe",
  gray90: "#1e2124",
  gray50: "#6d7882",
  gray40: "#8a949e",
  gray30: "#b1b8be",
  gray10: "#e6e8ea",
  gray5: "#f4f5f6",
};

// --- Email Templates ---
function baseWrap(header: string, body: string, footer: string): string {
  return `<div style="max-width:460px;margin:0 auto;background:#fff;font-family:'Pretendard',-apple-system,sans-serif;">${header}${body}${footer}</div>`;
}

function customerHeader(refNum: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${C.primary70};"><tr><td style="padding:16px 24px;font-size:11px;font-weight:700;color:#fff;letter-spacing:3px;">KPEC</td><td style="padding:16px 24px;text-align:right;font-size:9px;color:rgba(255,255,255,0.4);">접수번호 ${refNum}</td></tr></table>`;
}

function adminHeader(refNum: string, timestamp: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${C.primary80};"><tr><td style="padding:12px 24px;font-size:10px;font-weight:700;color:#fff;letter-spacing:2px;">KPEC ADMIN</td><td style="padding:12px 24px;text-align:right;font-size:9px;color:rgba(255,255,255,0.4);">${refNum} · ${timestamp}</td></tr></table>`;
}

function customerFooter(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${C.gray5};"><tr><td style="padding:14px 24px;"><p style="margin:0;font-size:10px;color:${C.gray50};line-height:1.6;">후불 성공보수제 · 승인 전 비용 없음</p><p style="margin:2px 0 0;font-size:9px;color:${C.gray30};">KPEC 경영컨설팅 · jsbizfunding.kr</p></td><td style="padding:14px 24px;text-align:right;vertical-align:middle;"><a href="tel:0502-6800-4681" style="background:${C.primary60};color:#fff;text-decoration:none;font-size:11px;font-weight:600;padding:10px 18px;white-space:nowrap;border-radius:4px;">0502-6800-4681</a></td></tr></table>`;
}

function divider(): string {
  return `<div style="margin:0 24px;border-top:1px solid ${C.gray10};"></div>`;
}

function label(text: string): string {
  return `<span style="color:${C.gray40};">${text}</span>`;
}

function sectionTitle(text: string): string {
  return `<p style="margin:0 0 8px;font-size:9px;font-weight:700;color:${C.gray40};letter-spacing:2px;">${text}</p>`;
}

interface InquiryFields {
  name: string;
  phone: string;
  email: string;
  company: string;
  industry: string;
  location: string;
  operationYear: string;
  revenue: string;
  fundTypes: string;
  amount: string;
  message: string;
  type: string;
}

function matchingSection(goal: string): string {
  // Simple matching based on fund goal
  type Fund = { name: string; rate: string; limit: string; level: string };
  const funds: Fund[] = [];

  if (goal === "운전자금" || goal === "운전자금") {
    funds.push(
      { name: "혁신창업사업화자금", rate: "2.3%", limit: "5억", level: "높음" },
      { name: "신성장기반자금", rate: "2.3%", limit: "5억", level: "중간" },
    );
  } else if (goal === "시설자금") {
    funds.push(
      {
        name: "신성장기반자금(시설)",
        rate: "2.3%",
        limit: "60억",
        level: "높음",
      },
      {
        name: "신시장진출지원자금(시설)",
        rate: "2.3%",
        limit: "60억",
        level: "중간",
      },
    );
  } else if (goal === "기업인증") {
    funds.push(
      {
        name: "벤처기업 인증",
        rate: "세제감면",
        limit: "우선배정",
        level: "높음",
      },
      {
        name: "이노비즈",
        rate: "보증료우대",
        limit: "공공가점",
        level: "중간",
      },
    );
  } else if (goal === "수출지원") {
    funds.push(
      {
        name: "신시장진출지원자금",
        rate: "2.3%",
        limit: "10억",
        level: "높음",
      },
      {
        name: "내수기업 수출기업화자금",
        rate: "2.3%",
        limit: "10억",
        level: "중간",
      },
    );
  } else {
    funds.push(
      { name: "혁신창업사업화자금", rate: "2.3%", limit: "5억", level: "높음" },
      { name: "신성장기반자금", rate: "2.3%", limit: "5억", level: "중간" },
    );
  }

  const rows = funds
    .map(
      (f, i) =>
        `<tr${i > 0 ? ` style="border-top:1px solid ${C.gray5};"` : ""}><td style="padding:5px 0;font-weight:600;">${f.name}</td><td style="padding:5px 0;text-align:right;color:${C.gray40};">${f.rate} · ${f.limit} <span style="font-size:9px;background:${f.level === "높음" ? C.primary5 : C.gray5};color:${f.level === "높음" ? C.primary60 : C.gray50};padding:2px 6px;margin-left:4px;">${f.level}</span></td></tr>`,
    )
    .join("");

  return `<div style="padding:12px 24px;">${sectionTitle("간단매칭")}<table style="width:100%;border-collapse:collapse;font-size:11px;color:${C.gray90};">${rows}</table></div>`;
}

function refNumber(type: string): string {
  const d = new Date();
  const prefix = type === "diagnosis" ? "D" : "C";
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seq = String(d.getHours() * 60 + d.getMinutes()).padStart(3, "0");
  return `#${prefix}-${date}${seq}`;
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 1. 적격진단 → 고객수신
function diagnosisCustomerEmail(f: InquiryFields, ref: string): string {
  const body = `
    <div style="padding:18px 24px 14px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:${C.gray90};">접수가 완료되었습니다</p>
      <p style="margin:6px 0 0;font-size:12px;color:${C.gray50};">${f.name}님, 담당 전문가가 영업일 1~2일 내 연락드립니다.</p>
    </div>
    ${divider()}
    <div style="padding:14px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;color:${C.gray90};">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:16px;">
            ${sectionTitle("접수 정보")}
            <p style="margin:0;line-height:1.9;">${label("이름")} ${f.name}<br>${label("이메일")} ${f.email}<br>${label("상호")} ${f.company}</p>
          </td>
          <td style="vertical-align:top;width:50%;border-left:1px solid ${C.gray10};padding-left:16px;">
            ${sectionTitle("진단 결과")}
            <p style="margin:0;line-height:1.9;">${label("연락처")} ${f.phone}<br>${label("업종")} ${f.industry} &nbsp;&nbsp;${label("소재지")} ${f.location}<br>${label("업력")} ${f.operationYear} &nbsp;&nbsp;${label("매출")} ${f.revenue}</p>
          </td>
        </tr>
      </table>
    </div>
    ${divider()}
    ${matchingSection(f.fundTypes)}`;

  return baseWrap(customerHeader(ref), body, customerFooter());
}

// 2. 적격진단 → 내부수신
function diagnosisAdminEmail(
  f: InquiryFields,
  ref: string,
  ts: string,
): string {
  const body = `
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="padding:14px 24px 10px;">
        <p style="margin:0;font-size:14px;font-weight:700;color:${C.gray90};">새 자금진단 접수</p>
        <p style="margin:4px 0 0;font-size:11px;color:${C.gray40};">diagnosis-wizard · 자금적격진단</p>
      </td>
      <td style="padding:14px 24px 10px;text-align:right;vertical-align:top;">
        <span style="font-size:10px;font-weight:600;background:${C.primary60};color:#fff;padding:4px 10px;border-radius:4px;">NEW</span>
      </td>
    </tr></table>
    ${divider()}
    <div style="padding:12px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;color:${C.gray90};">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:16px;">
            ${sectionTitle("고객 정보")}
            <p style="margin:0;line-height:1.9;">${label("이름")} <strong>${f.name}</strong><br>${label("연락처")} <strong>${f.phone}</strong><br>${label("이메일")} ${f.email}<br>${label("상호")} <strong>${f.company}</strong></p>
          </td>
          <td style="vertical-align:top;width:50%;border-left:1px solid ${C.gray10};padding-left:16px;">
            ${sectionTitle("진단 데이터")}
            <p style="margin:0;line-height:1.9;">${label("업종")} ${f.industry}<br>${label("소재지")} ${f.location}<br>${label("업력")} ${f.operationYear} &nbsp;&nbsp;${label("매출")} ${f.revenue}<br>${label("자금")} <strong style="color:${C.primary60};">${f.fundTypes}</strong></p>
          </td>
        </tr>
      </table>
    </div>
    ${divider()}
    ${matchingSection(f.fundTypes)}
    ${f.message ? `<div style="background:${C.gray5};padding:10px 24px;font-size:10px;color:${C.gray50};"><span style="color:${C.gray40};">메모</span> ${f.message}</div>` : ""}`;

  return baseWrap(adminHeader(ref, ts), body, "");
}

// 3. 위자드폼 → 고객수신
function contactCustomerEmail(f: InquiryFields, ref: string): string {
  const body = `
    <div style="padding:18px 24px 14px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:${C.gray90};">상담 신청이 접수되었습니다</p>
      <p style="margin:6px 0 0;font-size:12px;color:${C.gray50};">${f.name}님, 담당 전문가가 영업일 1~2일 내 연락드립니다.</p>
    </div>
    ${divider()}
    <div style="padding:14px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;color:${C.gray90};">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:16px;">
            ${sectionTitle("접수 정보")}
            <p style="margin:0;line-height:1.9;">${label("이름")} ${f.name}<br>${label("이메일")} ${f.email}<br>${label("기업명")} ${f.company}</p>
          </td>
          <td style="vertical-align:top;width:50%;border-left:1px solid ${C.gray10};padding-left:16px;">
            ${sectionTitle("상담 내용")}
            <p style="margin:0;line-height:1.9;">${label("연락처")} ${f.phone}<br>${label("업종")} ${f.industry}<br>${label("자금")} ${f.fundTypes}</p>
          </td>
        </tr>
      </table>
    </div>`;

  return baseWrap(customerHeader(ref), body, customerFooter());
}

// 4. 위자드폼 → 내부수신
function contactAdminEmail(f: InquiryFields, ref: string, ts: string): string {
  const body = `
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="padding:14px 24px 10px;">
        <p style="margin:0;font-size:14px;font-weight:700;color:${C.gray90};">새 상담 접수</p>
        <p style="margin:4px 0 0;font-size:11px;color:${C.gray40};">contact-wizard · 일반상담</p>
      </td>
      <td style="padding:14px 24px 10px;text-align:right;vertical-align:top;">
        <span style="font-size:10px;font-weight:600;background:${C.primary60};color:#fff;padding:4px 10px;border-radius:4px;">NEW</span>
      </td>
    </tr></table>
    ${divider()}
    <div style="padding:12px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;color:${C.gray90};">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:16px;">
            ${sectionTitle("고객 정보")}
            <p style="margin:0;line-height:1.9;">${label("이름")} <strong>${f.name}</strong><br>${label("연락처")} <strong>${f.phone}</strong><br>${label("이메일")} ${f.email}<br>${label("기업명")} <strong>${f.company}</strong></p>
          </td>
          <td style="vertical-align:top;width:50%;border-left:1px solid ${C.gray10};padding-left:16px;">
            ${sectionTitle("상담 데이터")}
            <p style="margin:0;line-height:1.9;">${label("업종")} ${f.industry}<br>${label("매출")} ${f.revenue} &nbsp;&nbsp;${label("업력")} ${f.operationYear}<br>${label("소재지")} ${f.location}<br>${label("자금")} <strong style="color:${C.primary60};">${f.fundTypes}</strong></p>
          </td>
        </tr>
      </table>
    </div>
    <div style="background:${C.gray5};padding:10px 24px;font-size:10px;color:${C.gray50};">
      ${f.amount ? `${label("희망금액")} ${f.amount} &nbsp;&nbsp;` : ""}${f.message ? `${label("메모")} ${f.message}` : ""}
    </div>`;

  return baseWrap(adminHeader(ref, ts), body, "");
}

// --- Main export ---
export async function sendInquiryEmails(
  env: Env,
  fields: Record<string, unknown>,
): Promise<void> {
  const f: InquiryFields = {
    name: String(fields.name || ""),
    phone: String(fields.phone || ""),
    email: String(fields.email || ""),
    company: String(fields.company || ""),
    industry: String(fields.industry || ""),
    location: String(fields.location || ""),
    operationYear: String(fields.operationYear || ""),
    revenue: String(fields.revenue || ""),
    fundTypes: String(fields.fundTypes || ""),
    amount: String(fields.amount || ""),
    message: String(fields.message || ""),
    type: String(fields.type || "general"),
  };

  const ref = refNumber(f.type);
  const ts = timestamp();
  const isDiag = f.type === "diagnosis";
  const adminEmail = "mkt@polarad.co.kr";

  const subject = isDiag
    ? `[KPEC] 자금진단 접수완료 — ${f.company}`
    : `[KPEC] 상담 접수완료 — ${f.company}`;

  const adminSubject = isDiag
    ? `[접수] 자금진단 ${f.name} · ${f.company}`
    : `[접수] 상담 ${f.name} · ${f.company}`;

  // 고객수신 (이메일이 있을 때만)
  if (f.email) {
    const customerHtml = isDiag
      ? diagnosisCustomerEmail(f, ref)
      : contactCustomerEmail(f, ref);
    await sendGmail(env, f.email, subject, customerHtml);
  }

  // 내부수신 (관리자)
  const adminHtml = isDiag
    ? diagnosisAdminEmail(f, ref, ts)
    : contactAdminEmail(f, ref, ts);
  await sendGmail(env, adminEmail, adminSubject, adminHtml);
}

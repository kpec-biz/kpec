import { Env } from "./airtable";

/**
 * Cloudflare Workers에서 GA4 service account 인증.
 * - 로컬 변수 캐시는 isolate 라이프타임 동안만 유효 (cold start마다 새 토큰)
 * - RS256 JWT를 Web Crypto API로 서명 → OAuth2 token endpoint
 */

let cachedToken: { token: string; exp: number } | null = null;

function b64url(bytes: Uint8Array | string): string {
  const str =
    typeof bytes === "string"
      ? bytes
      : String.fromCharCode(...Array.from(bytes));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleaned = pem
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function getAccessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) return cachedToken.token;

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const key = await importPrivateKey(env.GOOGLE_PRIVATE_KEY);
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(unsigned),
    ),
  );
  const jwt = `${unsigned}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Google token: ${res.status} ${(await res.text()).slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

export interface GA4Row {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
}

export interface GA4Response {
  rows?: GA4Row[];
}

export async function ga4Report(env: Env, body: object): Promise<GA4Response> {
  const token = await getAccessToken(env);
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(
      `GA4 report: ${res.status} ${(await res.text()).slice(0, 200)}`,
    );
  }
  return res.json();
}

/**
 * batchRunReports — 한 property에 대해 최대 5개 report를 1 fetch로 묶어 호출.
 * Cloudflare Workers free tier subrequest 50 한도 대응 (단일 호출 분량 1/N로 감소).
 * 응답: { reports: GA4Response[] } — 입력 순서 그대로 유지.
 */
export async function ga4Batch(
  env: Env,
  requests: object[],
): Promise<GA4Response[]> {
  if (requests.length === 0) return [];
  if (requests.length > 5) {
    throw new Error(`ga4Batch: max 5 reports per call, got ${requests.length}`);
  }
  const token = await getAccessToken(env);
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:batchRunReports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    },
  );
  if (!res.ok) {
    throw new Error(
      `GA4 batch: ${res.status} ${(await res.text()).slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as { reports?: GA4Response[] };
  return data.reports || [];
}

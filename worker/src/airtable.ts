export interface Env {
  AIRTABLE_TOKEN: string;
  AIRTABLE_BASE_ID: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  ADMIN_EMAIL: string;
  CORS_ORIGIN: string;
}

const AIRTABLE_API = "https://api.airtable.com/v0";

export async function airtableFetch(
  env: Env,
  table: string,
  options: {
    method?: string;
    recordId?: string;
    body?: unknown;
    params?: Record<string, string>;
  } = {},
) {
  const { method = "GET", recordId, body, params } = options;
  let url = `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
  if (recordId) url += `/${recordId}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${res.status} ${error}`);
  }

  return res.json();
}

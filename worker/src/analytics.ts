import { Env, airtableFetch } from "./airtable";
import { verifyToken } from "./auth";

const TABLE = "Analytics";

export async function handleAnalytics(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!verifyToken(request, env)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "7");

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const params: Record<string, string> = {
    filterByFormula: `IS_AFTER({date}, "${sinceStr}")`,
    sort: JSON.stringify([{ field: "date", direction: "desc" }]),
  };

  const data = await airtableFetch(env, TABLE, { params });
  return Response.json(data);
}

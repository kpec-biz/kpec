import { Env, airtableFetch } from "./airtable";
import { verifyToken } from "./auth";

const TABLE = "Posts";

export async function handleBoard(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!verifyToken(request, env)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const recordId = pathParts[2]; // /api/board/:id

  switch (request.method) {
    case "GET": {
      const params: Record<string, string> = {
        sort: JSON.stringify([{ field: "createdAt", direction: "desc" }]),
      };
      const category = url.searchParams.get("category");
      if (category && category !== "전체") {
        params.filterByFormula = `{category} = "${category}"`;
      }
      const data = await airtableFetch(env, TABLE, { params });
      return Response.json(data);
    }

    case "POST": {
      const body = await request.json();
      const data = await airtableFetch(env, TABLE, {
        method: "POST",
        body: { fields: body },
      });
      return Response.json(data);
    }

    case "PUT": {
      if (!recordId) {
        return Response.json(
          { error: "레코드 ID가 필요합니다." },
          { status: 400 },
        );
      }
      const body = await request.json();
      const data = await airtableFetch(env, TABLE, {
        method: "PATCH",
        recordId,
        body: { fields: body },
      });
      return Response.json(data);
    }

    case "DELETE": {
      if (!recordId) {
        return Response.json(
          { error: "레코드 ID가 필요합니다." },
          { status: 400 },
        );
      }
      const data = await airtableFetch(env, TABLE, {
        method: "DELETE",
        recordId,
      });
      return Response.json(data);
    }

    default:
      return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
}

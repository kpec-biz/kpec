import { Env, airtableFetch } from "./airtable";
import { sendInquiryEmails } from "./email";

const TABLE = "Inquiries";

export async function handleInquiry(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method === "GET") {
    // Admin에서 목록 조회
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");

    const params: Record<string, string> = {
      pageSize: "100",
    };

    const filters: string[] = [];
    if (status && status !== "all") {
      filters.push(`{status}='${status}'`);
    }
    if (type && type !== "all") {
      filters.push(`{type}='${type}'`);
    }
    if (filters.length > 0) {
      params.filterByFormula =
        filters.length === 1 ? filters[0] : `AND(${filters.join(",")})`;
    }

    const data = await airtableFetch(env, TABLE, { params });
    const records = (data.records || []).map(
      (r: {
        id: string;
        fields: Record<string, unknown>;
        createdTime: string;
      }) => ({
        id: r.id,
        ...r.fields,
        createdAt: r.createdTime,
      }),
    );

    return Response.json({ records });
  }

  if (request.method === "POST") {
    // 폼에서 접수 생성
    const body = (await request.json()) as Record<string, unknown>;

    const fields: Record<string, unknown> = {
      company: body.company || "",
      name: body.name || "",
      phone: body.phone || "",
      email: body.email || "",
      industry: body.industry || "",
      revenue: body.revenue || "",
      operationYear: body.operationYear || "",
      location: body.location || "",
      fundTypes: Array.isArray(body.fundTypes)
        ? body.fundTypes.join(", ")
        : body.fundTypes || "",
      amount: body.amount || "",
      situations: Array.isArray(body.situations)
        ? body.situations.join(", ")
        : body.situations || "",
      message: body.message || "",
      type: body.type || "general",
      status: "new",
      creditScore: body.creditScore || "",
      source: body.source || "homepage",
    };

    // 1) D1 INSERT (Phase 2 신규 SoT)
    let d1Id: number | null = null;
    try {
      const d1Res = await env.DB.prepare(
        `INSERT INTO inquiries (
           company, name, phone, email, industry, revenue, operation_year,
           location, fund_types, amount, situations, message,
           type, status, credit_score, source
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
        .bind(
          fields.company || null,
          fields.name || null,
          fields.phone || null,
          fields.email || null,
          fields.industry || null,
          fields.revenue || null,
          fields.operationYear || null,
          fields.location || null,
          fields.fundTypes || null,
          fields.amount || null,
          fields.situations || null,
          fields.message || null,
          fields.type,
          fields.status,
          fields.creditScore || null,
          fields.source,
        )
        .run();
      d1Id = (d1Res.meta as { last_row_id?: number })?.last_row_id ?? null;
    } catch (err) {
      console.error("D1 inquiry insert failed", err);
    }

    // 2) Airtable INSERT (legacy, Phase 3에서 제거 예정)
    // operation_year/fund_types 등 Airtable 필드명은 camelCase 유지
    const result = await airtableFetch(env, TABLE, {
      method: "POST",
      body: { fields },
    });

    // 3) D1 row의 airtable_id 업데이트 (Phase 3 컷오버 매칭용)
    if (d1Id && result?.id) {
      try {
        await env.DB.prepare(
          `UPDATE inquiries SET airtable_id = ? WHERE id = ?`,
        )
          .bind(result.id, d1Id)
          .run();
      } catch (err) {
        console.error("D1 airtable_id update failed", err);
      }
    }

    // 텔레그램 알림
    try {
      const isDiagnosis = fields.type === "diagnosis";
      const tgText = [
        isDiagnosis ? `🔍 <b>자금진단 접수</b>` : `📋 <b>새 상담 접수</b>`,
        ``,
        `🏢 기업명: ${fields.company}`,
        `👤 담당자: ${fields.name}`,
        `📞 연락처: ${fields.phone}`,
        fields.email ? `✉️ 이메일: ${fields.email}` : "",
        `📌 유형: ${isDiagnosis ? "자금적격진단" : "일반접수"}`,
        fields.industry ? `🏭 업종: ${fields.industry}` : "",
        fields.location ? `📍 소재지: ${fields.location}` : "",
        fields.operationYear ? `⏳ 업력: ${fields.operationYear}` : "",
        fields.revenue ? `💰 매출: ${fields.revenue}` : "",
        fields.fundTypes ? `🎯 자금유형: ${fields.fundTypes}` : "",
        fields.amount ? `💵 희망금액: ${fields.amount}` : "",
        fields.message ? `💬 메모: ${fields.message}` : "",
        ``,
        `📎 <a href="https://admin.jsbizfunding.kr/inquiries">접수관리 바로가기</a>`,
      ]
        .filter(Boolean)
        .join("\n");

      await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: tgText,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        },
      );
    } catch {
      /* ignore telegram errors */
    }

    // 이메일 발송 (고객 + 관리자)
    try {
      await sendInquiryEmails(env, fields);
    } catch {
      /* ignore email errors */
    }

    return Response.json({ success: true, id: result.id });
  }

  if (request.method === "PATCH") {
    // 상태 변경 또는 메모 업데이트
    const body = (await request.json()) as {
      id: string;
      status?: string;
      memo?: string;
    };
    if (!body.id) {
      return Response.json({ error: "id required" }, { status: 400 });
    }

    const fields: Record<string, string> = {};
    if (body.status) fields.status = body.status;
    if (body.memo !== undefined) fields.memo = body.memo;

    await airtableFetch(env, TABLE, {
      method: "PATCH",
      recordId: body.id,
      body: { fields },
    });

    return Response.json({ success: true });
  }

  if (request.method === "DELETE") {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "id required" }, { status: 400 });
    }

    await airtableFetch(env, TABLE, {
      method: "DELETE",
      recordId: id,
    });

    return Response.json({ success: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";
const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";

// Vercel Cron에서 호출 — 매일 09:00 KST
export async function GET(req: NextRequest) {
  // Cron secret 검증
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const bizinfoKey = process.env.BIZINFO_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!pat || !baseId || !bizinfoKey || !geminiKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  try {
    // 1. 기존 pblancId 목록 가져오기
    const existingRes = await fetch(
      `${AIRTABLE_API}/${baseId}/${TABLE_ID}?fields%5B%5D=pblancId&maxRecords=100`,
      { headers: { Authorization: `Bearer ${pat}` } },
    );
    const existingData = await existingRes.json();
    const existingIds = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (existingData.records || []).map((r: any) => r.fields.pblancId),
    );

    // 2. bizinfo 최신 20건 가져오기
    const items = [];
    for (let page = 1; page <= 2; page++) {
      const res = await fetch(
        `${BIZINFO_API}?crtfcKey=${bizinfoKey}&dataType=json&pageUnit=10&pageIndex=${page}`,
      );
      const data = await res.json();
      if (data.jsonArray) items.push(...data.jsonArray);
    }

    // 3. 신규만 필터
    const newItems = items.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => !existingIds.has(item.pblancId),
    );

    if (newItems.length === 0) {
      return NextResponse.json({
        message: "신규 공고 없음",
        checked: items.length,
        existing: existingIds.size,
      });
    }

    // 4. Gemini 리라이팅 + R2 업로드 + Airtable 저장
    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const results = { success: 0, failed: 0, ids: [] as string[] };

    for (const item of newItems) {
      try {
        const rewritten = await rewriteWithGemini(item, geminiKey);

        // R2에 본문 저장
        const contentKey = `posts/${item.pblancId}.json`;
        await s3.send(
          new PutObjectCommand({
            Bucket: "kpecr2",
            Key: contentKey,
            Body: JSON.stringify(rewritten.content),
            ContentType: "application/json",
            CacheControl: "public, max-age=86400",
          }),
        );

        // Airtable에 메타 저장
        await fetch(`${AIRTABLE_API}/${baseId}/${TABLE_ID}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pat}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  pblancId: item.pblancId,
                  title: rewritten.title,
                  originalTitle: item.pblancNm,
                  summary: rewritten.summary,
                  contentUrl: `${process.env.R2_PUBLIC_URL}/${contentKey}`,
                  category: getCategory(item.pldirSportRealmLclasCodeNm),
                  source: item.jrsdInsttNm,
                  applyPeriod: item.reqstBeginEndDe,
                  originalUrl: item.pblancUrl,
                  publishDate: item.creatPnttm?.slice(0, 10),
                  status: "리라이팅완료",
                  tags: rewritten.tags,
                },
              },
            ],
          }),
        });

        results.success++;
        results.ids.push(item.pblancId);
      } catch {
        results.failed++;
      }

      // Gemini rate limit
      await new Promise((r) => setTimeout(r, 1200));
    }

    return NextResponse.json({
      message: `${results.success}건 처리 완료`,
      ...results,
      checked: items.length,
      newFound: newItems.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function stripHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/☞/g, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getCategory(code: string) {
  const c = (code || "").replace(/"/g, "").trim();
  if (c.includes("기술")) return "기술";
  if (c.includes("인력") || c.includes("고용")) return "인력";
  if (c.includes("경영")) return "경영";
  if (c.includes("금융")) return "금융";
  return "공고";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function rewriteWithGemini(item: any, apiKey: string) {
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash";
  const plainSummary = stripHtml(item.bsnsSumryCn);

  const prompt = `당신은 KPEC(기업정책자금센터)의 정책자금 전문 에디터입니다.
아래 기업마당 정책자금 공고를 중소기업 대표가 쉽게 이해할 수 있도록 리라이팅하세요.

## 원문 정보
- 공고명: ${item.pblancNm}
- 주관기관: ${item.jrsdInsttNm}
- 수행기관: ${item.excInsttNm || ""}
- 접수기간: ${item.reqstBeginEndDe}
- 분야: ${item.pldirSportRealmLclasCodeNm}
- 요약: ${plainSummary}

## 리라이팅 규칙
1. 제목: 핵심 혜택이 드러나도록 40자 이내로 (지역명 포함)
2. 요약: 2~3문장, 누가/무엇을/얼마나 받을 수 있는지 명확하게
3. 본문: JSON 배열로 아래 형식 사용
   [{"type":"h2","text":"..."},{"type":"p","text":"..."},{"type":"ul","items":["..."]},{"type":"info-box","text":"..."}]
4. 본문 구성: 사업개요 → 지원대상 → 지원내용 → 신청방법 순서
5. "기업평가" 용어 금지 → "현황분석", "적격심사" 사용
6. "서류작성대행" 금지 → "서류 준비 지원" 사용
7. 태그: 관련 키워드 5개 (쉼표 구분)

## 출력 형식 (JSON)
{"title":"...","summary":"...","content":[...],"tags":"키워드1,키워드2,..."}

JSON만 출력하세요.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return JSON.parse(text);
}

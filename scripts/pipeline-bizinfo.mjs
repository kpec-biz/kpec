/**
 * 기업마당 → Gemini 리라이팅 → Airtable 파이프라인
 *
 * Usage: node scripts/pipeline-bizinfo.mjs [--pages=3] [--dry-run]
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
config();

const BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";
const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ"; // notices

const env = {
  BIZINFO_API_KEY: process.env.BIZINFO_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash",
  AIRTABLE_PAT: process.env.AIRTABLE_PAT,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
};

// S3/R2 client
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const R2_BUCKET = "kpecr2";
const R2_PUBLIC = process.env.R2_PUBLIC_URL;

// CLI args
const args = process.argv.slice(2);
const maxPages = parseInt(args.find(a => a.startsWith("--pages="))?.split("=")[1] || "3");
const dryRun = args.includes("--dry-run");

// ── 1. Fetch bizinfo announcements ──
async function fetchBizinfo(page = 1, size = 10) {
  const url = `${BIZINFO_API}?crtfcKey=${env.BIZINFO_API_KEY}&dataType=json&pageUnit=${size}&pageIndex=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bizinfo API error: ${res.status}`);
  const data = await res.json();
  return data.jsonArray || [];
}

// ── 2. Check if already in Airtable ──
async function getExistingIds() {
  const url = `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${TABLE_ID}?fields%5B%5D=pblancId`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` },
  });
  const data = await res.json();
  return new Set((data.records || []).map(r => r.fields.pblancId));
}

// ── 3. Strip HTML tags ──
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/☞/g, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── 4. Gemini rewrite ──
async function rewriteWithGemini(item) {
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

JSON만 출력하세요. 다른 텍스트 없이.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
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
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");

  return JSON.parse(text);
}

// ── 5. Upload to Airtable ──
async function uploadToAirtable(records) {
  // Airtable accepts max 10 records per request
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  for (const batch of batches) {
    const res = await fetch(
      `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AIRTABLE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: batch.map(r => ({ fields: r })),
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Airtable upload error: ${res.status} ${err.slice(0, 200)}`);
    }

    const result = await res.json();
    console.log(`  Uploaded ${result.records.length} records`);
  }
}

// ── 6. Categorize ──
function getCategory(code) {
  const c = (code || "").replace(/"/g, "").trim();
  if (c.includes("기술")) return "기술";
  if (c.includes("인력") || c.includes("고용")) return "인력";
  if (c.includes("경영")) return "경영";
  if (c.includes("금융")) return "금융";
  return "공고";
}

// ── Main ──
async function main() {
  console.log("=== 기업마당 → Gemini → Airtable 파이프라인 ===");
  console.log(`Pages: ${maxPages}, Dry run: ${dryRun}`);

  // Get existing IDs
  const existingIds = await getExistingIds();
  console.log(`Airtable에 기존 ${existingIds.size}건 존재`);

  // Fetch all pages
  const allItems = [];
  for (let page = 1; page <= maxPages; page++) {
    const items = await fetchBizinfo(page, 10);
    console.log(`Page ${page}: ${items.length}건 가져옴`);
    allItems.push(...items);
  }

  // Filter: 3월 이후 + 미등록
  const march2026 = "2026-03";
  const newItems = allItems.filter(item => {
    const date = item.creatPnttm || "";
    const isAfterMarch = date >= march2026;
    const isNew = !existingIds.has(item.pblancId);
    return isAfterMarch && isNew;
  });

  console.log(`\n${newItems.length}건 신규 (3월 이후, 미등록)`);

  if (newItems.length === 0) {
    console.log("처리할 공고가 없습니다.");
    return;
  }

  // Process each
  const records = [];
  for (const item of newItems) {
    const shortTitle = item.pblancNm.slice(0, 50);
    process.stdout.write(`  리라이팅: ${shortTitle}...`);

    try {
      const rewritten = await rewriteWithGemini(item);

      // Upload content JSON to R2
      const contentKey = `posts/${item.pblancId}.json`;
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: contentKey,
        Body: JSON.stringify(rewritten.content),
        ContentType: "application/json",
        CacheControl: "public, max-age=86400",
      }));
      const contentUrl = `${R2_PUBLIC}/${contentKey}`;

      const record = {
        pblancId: item.pblancId,
        title: rewritten.title,
        originalTitle: item.pblancNm,
        summary: rewritten.summary,
        contentUrl: contentUrl,
        category: getCategory(item.pldirSportRealmLclasCodeNm),
        source: item.jrsdInsttNm,
        applyPeriod: item.reqstBeginEndDe,
        originalUrl: item.pblancUrl,
        publishDate: item.creatPnttm?.slice(0, 10),
        status: "리라이팅완료",
        tags: rewritten.tags,
      };

      records.push(record);
      console.log(" OK");
    } catch (e) {
      console.log(` FAIL: ${e.message.slice(0, 100)}`);
    }

    // Rate limit: 1 req/sec for Gemini
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\n리라이팅 완료: ${records.length}/${newItems.length}건`);

  if (dryRun) {
    console.log("\n[DRY RUN] 업로드 건너뜀. 샘플:");
    console.log(JSON.stringify(records[0], null, 2));
    return;
  }

  // Upload
  console.log("\nAirtable 업로드 중...");
  await uploadToAirtable(records);
  console.log(`\n완료! ${records.length}건 업로드됨`);
}

main().catch(e => {
  console.error("Pipeline error:", e);
  process.exit(1);
});

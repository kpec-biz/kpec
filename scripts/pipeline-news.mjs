/**
 * 파이프라인 2: 정책자금 뉴스
 * research_content_data.md 기반 → Gemini 1,000자 리라이팅 + 썸네일 생성 → R2 + Airtable
 *
 * Usage: node scripts/pipeline-news.mjs
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
config();

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";
const GEMINI_TEXT = process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash";
const GEMINI_IMAGE = "gemini-3-pro-image-preview";

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

// 뉴스 주제 — research_content_data.md 기반
const newsTopics = [
  {
    id: "NEWS_001",
    topic: "2026년 정책자금 4.4조원 총정리 — 기업 유형별 활용 전략",
    angle: "2026년 정책자금 총 공급규모 4조 4,313억원의 주요 변경사항과 제조업/IT/소상공인 기업 유형별 최적 활용 방법을 분석합니다. AI 기업 AX 스프린트(한도 100억, 금리 -0.1%p), DX·ESG 우대(-0.3%p), 수출기업화 자금 한도 확대(5→10억) 등 6대 핵심 변화를 다룹니다.",
    keywords: "정책자금,2026년,활용전략,AX스프린트,DX,ESG",
    source: "중소벤처기업부 보도자료 (2025.12.23)",
  },
  {
    id: "NEWS_002",
    topic: "AI 스타트업을 위한 AX 스프린트 우대트랙 완전 가이드",
    angle: "2026년 신설된 AX 스프린트 우대트랙의 선정 기준, 한도 100억원·금리 -0.1%p 혜택, 벤처인증과의 시너지 전략을 완전 정리합니다. AI 비전검사·자연어처리·로보틱스 등 분야별 신청 사례도 포함합니다.",
    keywords: "AI,AX스프린트,우대트랙,벤처기업,100억",
    source: "중소벤처기업부 정책자금 융자계획 공고",
  },
  {
    id: "NEWS_003",
    topic: "벤처·이노비즈·메인비즈 인증, 정책자금 신청 전에 반드시 받아야 하는 이유",
    angle: "벤처기업 인증(법인세 50% 감면), 이노비즈(보증료 -0.2%p), 메인비즈(융자한도 70억) 인증이 정책자금 승인율에 미치는 영향과 인증별 요건·비용·소요기간을 비교합니다. 벤처 38,598개사 현황도 분석합니다.",
    keywords: "벤처기업,이노비즈,메인비즈,기업인증,정책자금",
    source: "벤처확인시스템, 이노비즈협회, 메인비즈인증시스템",
  },
  {
    id: "NEWS_004",
    topic: "ISO 인증 비용의 70~80%를 정부가 지원한다 — 지자체별 신청 가이드",
    angle: "ISO 9001(200~500만원)·14001(250~600만원) 인증 비용과 지자체 지원 프로그램(70~80% 환급), 동시 취득 시 20~30% 절감, 수출기업 필수 인증 전략을 안내합니다.",
    keywords: "ISO인증,정부지원,품질경영,환경경영,지자체지원",
    source: "각 지자체 공고, ISO 인증기관 자료",
  },
  {
    id: "NEWS_005",
    topic: "소상공인 정책자금 2026 — 경영안정자금부터 대환대출까지 완전 정리",
    angle: "소진공 일반경영안정자금(7천만원, 연 2.96%), 신용취약소상공인자금(3천만원), 대환대출(5천만원, 연 4.5%) 등 소상공인 전용 프로그램의 자격요건과 신청 절차를 상세히 안내합니다.",
    keywords: "소상공인,경영안정자금,대환대출,소진공,2026년",
    source: "소상공인시장진흥공단 융자사업 공고",
  },
];

// ── Gemini 뉴스 콘텐츠 생성 (1,000자) ──
async function generateNewsContent(topic) {
  const prompt = `당신은 KPEC(기업정책자금센터)의 정책자금 전문 에디터입니다.
아래 주제로 중소기업 대표를 위한 정책자금 뉴스 칼럼을 작성하세요.

## 주제
${topic.topic}

## 작성 방향
${topic.angle}

## 출처
${topic.source}

## 작성 규칙
1. 총 분량: 800~1,200자 (공백 포함)
2. 제목: 핵심 혜택이 드러나는 40자 이내
3. 요약: 2~3문장으로 핵심 내용
4. 본문 구조: JSON 배열
   - h2: 섹션 제목 (3~4개)
   - p: 본문 텍스트 (각 200~300자)
   - ul: 핵심 항목 리스트 (3~5개)
   - info-box: 핵심 수치/혜택 강조 박스
5. KPEC 시각: 기업이 실제로 활용할 수 있는 구체적 행동 가이드 포함
6. "기업평가" → "현황분석", "서류작성대행" → "서류 준비 지원"
7. 출처 명시 필수 (원문 복사 X)

## 출력 형식 (JSON)
{"title":"...","summary":"...","content":[{"type":"h2","text":"..."},{"type":"p","text":"..."},{"type":"ul","items":["..."]},{"type":"info-box","text":"..."}],"tags":"키워드1,키워드2,..."}

JSON만 출력하세요.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini text error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
}

// ── Gemini 썸네일 이미지 생성 ──
async function generateThumbnail(title) {
  const prompt = `Professional editorial photograph for a Korean policy funding news article titled "${title}".
Korean business setting with Korean people in modern Seoul office or government building.
Natural lighting, Canon 5D Mark IV quality, 35mm lens, shallow depth of field.
IMPORTANT: No text, no flags, no logos, no signage, no Korean characters, no English text in the image.
No geometric patterns or graphic illustrations - realistic photography only.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
      },
    );

    if (!res.ok) {
      console.log(`  썸네일 생성 실패 (${res.status}), 기본 이미지 사용`);
      return null;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));

    if (!imagePart) {
      console.log("  이미지 파트 없음, 기본 이미지 사용");
      return null;
    }

    return Buffer.from(imagePart.inlineData.data, "base64");
  } catch (e) {
    console.log(`  썸네일 에러: ${e.message.slice(0, 100)}`);
    return null;
  }
}

// ── 기존 ID 확인 ──
async function getExistingIds() {
  const res = await fetch(
    `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}?fields%5B%5D=pblancId&maxRecords=100`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } },
  );
  const data = await res.json();
  return new Set((data.records || []).map((r) => r.fields.pblancId));
}

// ── Main ──
async function main() {
  console.log("=== 파이프라인 2: 정책자금 뉴스 ===");

  const existingIds = await getExistingIds();
  const newTopics = newsTopics.filter((t) => !existingIds.has(t.id));
  console.log(`${newTopics.length}건 신규 (기존 ${existingIds.size}건)`);

  if (newTopics.length === 0) {
    console.log("처리할 뉴스가 없습니다.");
    return;
  }

  const records = [];

  for (const topic of newTopics) {
    process.stdout.write(`  생성: ${topic.topic.slice(0, 40)}...`);

    try {
      // 1. 콘텐츠 생성
      const content = await generateNewsContent(topic);
      await new Promise((r) => setTimeout(r, 1500));

      // 2. 썸네일 생성
      const thumbnailBuffer = await generateThumbnail(content.title);
      await new Promise((r) => setTimeout(r, 1500));

      // 3. 본문 JSON → R2
      const contentKey = `posts/${topic.id}.json`;
      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: contentKey,
          Body: JSON.stringify(content.content),
          ContentType: "application/json",
          CacheControl: "public, max-age=86400",
        }),
      );

      // 4. 썸네일 → R2
      let thumbnailUrl = "";
      if (thumbnailBuffer) {
        const imgKey = `thumbnails/${topic.id}.png`;
        await s3.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: imgKey,
            Body: thumbnailBuffer,
            ContentType: "image/png",
            CacheControl: "public, max-age=604800",
          }),
        );
        thumbnailUrl = `${R2_PUBLIC}/${imgKey}`;
      }

      // 5. Airtable 레코드
      records.push({
        fields: {
          pblancId: topic.id,
          title: content.title,
          originalTitle: topic.topic,
          summary: content.summary,
          contentUrl: `${R2_PUBLIC}/${contentKey}`,
          category: "뉴스",
          source: "KPEC",
          applyPeriod: "",
          originalUrl: thumbnailUrl,
          publishDate: new Date().toISOString().slice(0, 10),
          status: "게시중",
          tags: content.tags || topic.keywords,
        },
      });

      console.log(` OK (${thumbnailBuffer ? "썸네일O" : "썸네일X"})`);
    } catch (e) {
      console.log(` FAIL: ${e.message.slice(0, 100)}`);
    }
  }

  if (records.length === 0) {
    console.log("업로드할 레코드가 없습니다.");
    return;
  }

  // Airtable 업로드
  console.log(`\nAirtable 업로드 중... (${records.length}건)`);
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const res = await fetch(
      `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: batch }),
      },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Airtable error: ${res.status} ${err.slice(0, 200)}`);
    }
    const result = await res.json();
    console.log(`  ${result.records.length}건 업로드`);
  }

  console.log(`\n완료! 뉴스 ${records.length}건 생성`);
}

main().catch((e) => {
  console.error("Pipeline error:", e);
  process.exit(1);
});

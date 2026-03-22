/**
 * 파이프라인 3: 정책자금 분석
 * 기업마당 공고 기반 → Gemini Pro 분석 2,000~3,000자 + 시각화 데이터 + 배너 이미지 → R2 + Airtable
 *
 * Usage: node scripts/pipeline-analysis.mjs
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
config();

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";
const GEMINI_PRO = process.env.GEMINI_MODEL_ANALYSIS || "gemini-2.5-pro-preview-05-06";
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

// 분석 주제 — research_content_data.md 기반 깊이 있는 분석
const analysisTopics = [
  {
    id: "ANALYSIS_001",
    topic: "2026년 정책자금 4.4조원 공급 확정 — 6대 변경사항 심층 분석",
    data: `총 공급: 4조 4,313억원 (융자 4조 643억원 + 이차보전 3,670억원)
비수도권 집중: 60% 이상
주요 프로그램: 혁신창업사업화(1.6조), 신시장진출(1.7조), 긴급경영안정(0.25조)
금리: 기본 2.5%, 소진공 2.96%, 대환 4.5%, 재해 1.9%
우대: DX·ESG -0.3%p, AI(AX) -0.1%p, 비수도권 -0.2%p
한도: 기업당 60억(AX 100억), 운전 5억(수출 10억), 소상공인 7천만
기간: 운전 5년(거치2), 시설 10년(거치3~4)
변경: AI 한도확대, 투융자결합, 수출한도확대, 지역가점, 미래기술강화`,
    visualData: {
      budgetBreakdown: [
        { name: "혁신창업사업화", value: 16000, unit: "억원" },
        { name: "신시장진출지원", value: 17000, unit: "억원" },
        { name: "신성장기반", value: 5000, unit: "억원" },
        { name: "긴급경영안정", value: 2500, unit: "억원" },
        { name: "기타", value: 3813, unit: "억원" },
      ],
      rateComparison: [
        { name: "시중은행 평균", rate: 5.2, color: "#ef4444" },
        { name: "정책자금 기본", rate: 2.5, color: "#3b82f6" },
        { name: "DX·ESG 우대", rate: 2.2, color: "#22c55e" },
        { name: "AI(AX) 최저", rate: 2.1, color: "#8b5cf6" },
      ],
      keyChanges: [
        { item: "AI 기업 한도", before: "60억원", after: "100억원", change: "+67%" },
        { item: "수출 운전자금", before: "5억원", after: "10억원", change: "+100%" },
        { item: "비수도권 비중", before: "50%", after: "60%+", change: "↑" },
      ],
    },
  },
  {
    id: "ANALYSIS_002",
    topic: "기업인증 비교 분석 — 벤처·이노비즈·메인비즈·ISO, 어떤 인증을 먼저 받아야 하나",
    data: `벤처기업: 38,598개사, 투자 5천만+, 유효 3년, 법인세 50% 감면, 기보 우대, R&D 가점
이노비즈: 3년+ 업력, 기술혁신 700점+, 보증료 -0.2%p, 공공조달 가점
메인비즈: 3년+ 업력, 경영혁신 700점+, 보증료 -0.1%p, 융자 70억 한도
ISO 9001: 200~500만원, 3~6개월, 지자체 70~80% 지원
ISO 14001: 250~600만원, 4~8개월, 동시취득 20~30% 절감
복합전략: 벤처+이노비즈 → 세제+보증+정책자금 3중 혜택`,
    visualData: {
      certComparison: [
        { cert: "벤처기업", cost: "낮음", period: "1~3개월", benefit: "★★★★★" },
        { cert: "이노비즈", cost: "중간", period: "2~4개월", benefit: "★★★★" },
        { cert: "메인비즈", cost: "중간", period: "2~4개월", benefit: "★★★" },
        { cert: "ISO 9001", cost: "높음", period: "3~6개월", benefit: "★★★" },
      ],
      benefitMatrix: {
        headers: ["인증", "세제감면", "보증우대", "정책자금", "공공조달"],
        rows: [
          ["벤처", "50%감면", "기보우대", "가점", "가점"],
          ["이노비즈", "없음", "-0.2%p", "우선배정", "가점"],
          ["메인비즈", "없음", "-0.1%p", "70억한도", "가점"],
          ["ISO", "없음", "해당없음", "일부가점", "가점"],
        ],
      },
    },
  },
  {
    id: "ANALYSIS_003",
    topic: "운전자금 vs 시설자금 — 내 기업에 최적인 정책자금 조합 전략",
    data: `운전자금: 인건비·원자재·판관비, 5년(거치2년), 기본 2.5%, 한도 5억(수출 10억)
시설자금: 설비·공장·토지, 10년(거치3~4년), 기본 2.5%, 한도 60억
합산한도: 60억(AX 100억)
프로그램: 혁신창업(7년미만), 신시장(수출), 신성장(성장기), 긴급(위기)
투융자결합: 투자조건부 융자 → 부채비율 개선
청년전용: 39세이하, 3년미만, 1~2억, 2.5%`,
    visualData: {
      fundComparison: [
        { type: "운전자금", maxAmount: 5, period: 5, rate: 2.5, grace: 2 },
        { type: "시설자금", maxAmount: 60, period: 10, rate: 2.5, grace: 4 },
        { type: "수출기업화", maxAmount: 10, period: 5, rate: 2.5, grace: 2 },
        { type: "AX스프린트", maxAmount: 100, period: 10, rate: 2.4, grace: 4 },
      ],
      scenarioMatrix: [
        { scenario: "제조업 설비투자", recommended: "시설자금 + DX우대", expected: "10년 상환, 연 2.2%" },
        { scenario: "IT 스타트업 인건비", recommended: "혁신창업 운전자금", expected: "5년 상환, 연 2.5%" },
        { scenario: "수출 준비", recommended: "수출기업화 + ISO인증", expected: "10억 한도, 연 2.3%" },
        { scenario: "소상공인 경영안정", recommended: "소진공 직접대출", expected: "7천만, 연 2.96%" },
      ],
    },
  },
  {
    id: "ANALYSIS_004",
    topic: "2026년 상반기 정책자금 신청 캘린더 — 월별 공고 일정과 전략적 신청 타이밍",
    data: `1월 5~6일: 서울·지방 접수 시작
1월 7~8일: 경기·인천 접수
매월 첫째주 4일간: 정기 접수
1~3월: 창업지원사업 집중 공고
하반기: 추가모집·지자체 수시공고
508개 사업, 총 3조 4,645억원 통합공고
60%가 상반기 공고
심사: 2~4주, 문의 1357/1811-3655`,
    visualData: {
      calendar: [
        { month: "1월", events: "서울·지방 접수 시작, 경기·인천 접수", intensity: "high" },
        { month: "2월", events: "창업지원 집중 공고, 추가 접수", intensity: "high" },
        { month: "3월", events: "창업지원 마감, 상반기 공고 피크", intensity: "high" },
        { month: "4~6월", events: "정기 접수, 일부 마감", intensity: "medium" },
        { month: "7~9월", events: "추가모집, 지자체 수시공고", intensity: "low" },
        { month: "10~12월", events: "하반기 추가, 차년도 준비", intensity: "low" },
      ],
      stats508: {
        total: 508,
        budget: "3조 4,645억원",
        firstHalf: "약 60%",
        avgReview: "2~4주",
      },
    },
  },
];

// ── Gemini Pro 분석 콘텐츠 생성 (2,000~3,000자) ──
async function generateAnalysis(topic) {
  const prompt = `당신은 KPEC(기업정책자금센터)의 수석 정책자금 분석가입니다.
아래 주제로 중소기업 대표를 위한 심층 분석 리포트를 작성하세요.

## 주제
${topic.topic}

## 분석 데이터
${topic.data}

## 시각화 데이터 (차트/테이블용)
${JSON.stringify(topic.visualData, null, 2)}

## 작성 규칙
1. 총 분량: 2,000~3,000자 (공백 포함) — 반드시 충분한 분량
2. 제목: 분석 인사이트가 드러나는 50자 이내
3. 요약: 3~4문장으로 핵심 분석 결과
4. 본문 구조: JSON 배열, 아래 타입 사용
   - h2: 대섹션 (4~5개)
   - h3: 소섹션
   - p: 본문 (각 300~500자, 구체적 수치 포함)
   - ul: 핵심 항목 (5~7개)
   - info-box: 핵심 인사이트/수치 강조
   - warn-box: 주의사항/마감 경고
   - chart-data: 시각화 데이터 (type=chart-data, chartType="bar"|"compare"|"table", data=[...])
5. chart-data 블록은 시각화 영역에 사용 — 반드시 2개 이상 포함
6. KPEC 전문가 시각: 단순 정보 나열이 아닌, 기업이 취해야 할 구체적 행동 권고
7. "기업평가" → "현황분석", "서류작성대행" → "서류 준비 지원"

## 출력 형식 (JSON)
{"title":"...","summary":"...","content":[...],"tags":"키워드1,..."}

content 배열에 chart-data 블록 예시:
{"type":"chart-data","chartType":"bar","title":"2026년 예산 배분","data":[{"name":"혁신창업","value":16000},{"name":"신시장","value":17000}]}
{"type":"chart-data","chartType":"compare","title":"금리 비교","data":[{"name":"시중은행","value":5.2},{"name":"정책자금","value":2.5}]}
{"type":"chart-data","chartType":"table","title":"인증 비교","headers":["인증","비용","기간"],"rows":[["벤처","낮음","1~3개월"]]}

JSON만 출력하세요.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_PRO}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini Pro error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
}

// ── 배너 이미지 생성 ──
async function generateBannerImage(title) {
  const prompt = `Professional editorial photograph for a Korean policy funding analysis report titled "${title}".
Korean business or government setting with Korean people. Modern Seoul office, conference room, or industrial facility.
Natural lighting, editorial photography quality, Canon 5D Mark IV, 35mm lens.
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
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const imgPart = (data.candidates?.[0]?.content?.parts || []).find(
      (p) => p.inlineData?.mimeType?.startsWith("image/"),
    );
    return imgPart ? Buffer.from(imgPart.inlineData.data, "base64") : null;
  } catch {
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
  console.log("=== 파이프라인 3: 정책자금 분석 ===");
  console.log(`Gemini Pro 모델: ${GEMINI_PRO}`);

  const existingIds = await getExistingIds();
  const newTopics = analysisTopics.filter((t) => !existingIds.has(t.id));
  console.log(`${newTopics.length}건 신규 (기존 ${existingIds.size}건)`);

  if (newTopics.length === 0) {
    console.log("처리할 분석이 없습니다.");
    return;
  }

  const records = [];

  for (const topic of newTopics) {
    process.stdout.write(`  분석: ${topic.topic.slice(0, 40)}...`);

    try {
      // 1. Gemini Pro 분석 생성
      const content = await generateAnalysis(topic);
      await new Promise((r) => setTimeout(r, 2000));

      // 2. 배너 이미지 생성
      const bannerBuffer = await generateBannerImage(content.title);
      await new Promise((r) => setTimeout(r, 1500));

      // 3. 본문 + 시각화 데이터 → R2
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

      // 4. 배너 이미지 → R2
      let bannerUrl = "";
      if (bannerBuffer) {
        const imgKey = `thumbnails/${topic.id}.png`;
        await s3.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: imgKey,
            Body: bannerBuffer,
            ContentType: "image/png",
            CacheControl: "public, max-age=604800",
          }),
        );
        bannerUrl = `${R2_PUBLIC}/${imgKey}`;
      }

      // 5. Airtable
      records.push({
        fields: {
          pblancId: topic.id,
          title: content.title,
          originalTitle: topic.topic,
          summary: content.summary,
          contentUrl: `${R2_PUBLIC}/${contentKey}`,
          category: "분석",
          source: "KPEC",
          applyPeriod: "",
          originalUrl: bannerUrl,
          publishDate: new Date().toISOString().slice(0, 10),
          status: "게시중",
          tags: content.tags || "",
        },
      });

      // 본문 길이 체크
      const textLength = content.content
        .map((b) => (b.text || "") + (b.items || []).join(""))
        .join("")
        .length;
      console.log(` OK (${textLength}자, ${content.content.length}블록, 이미지${bannerBuffer ? "O" : "X"})`);
    } catch (e) {
      console.log(` FAIL: ${e.message.slice(0, 150)}`);
    }
  }

  if (records.length === 0) return;

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
      throw new Error(`Airtable error: ${err.slice(0, 200)}`);
    }
    console.log(`  ${batch.length}건 업로드`);
  }

  console.log(`\n완료! 분석 ${records.length}건 생성`);
}

main().catch((e) => {
  console.error("Pipeline error:", e);
  process.exit(1);
});

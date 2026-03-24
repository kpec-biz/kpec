import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { sendPipelineLog } from "@/lib/telegram";

const BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";
const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// 매일 08:00 KST — 4개 파이프라인 순차 실행
export const maxDuration = 300; // 5분

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    bizinfo: { success: 0, skipped: false, error: "" },
    news: { success: 0, skipped: false, error: "" },
    analysis: { success: 0, skipped: false, error: "" },
    instagram: { success: 0, skipped: false, error: "" },
  };

  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  try {
    // ── 기존 ID 목록 ──
    const existingRes = await fetch(
      `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}?fields%5B%5D=pblancId&maxRecords=200`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } },
    );
    const existingData = await existingRes.json();
    const existingIds = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (existingData.records || []).map((r: any) => r.fields.pblancId),
    );

    // ═══ 1. 기업마당 공고 ═══
    try {
      const items = [];
      for (let page = 1; page <= 2; page++) {
        const res = await fetch(
          `${BIZINFO_API}?crtfcKey=${process.env.BIZINFO_API_KEY}&dataType=json&pageUnit=10&pageIndex=${page}`,
        );
        const data = await res.json();
        if (data.jsonArray) items.push(...data.jsonArray);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newItems = items.filter((i: any) => !existingIds.has(i.pblancId));

      if (newItems.length === 0) {
        results.bizinfo.skipped = true;
      } else {
        for (const item of newItems) {
          try {
            const rewritten = await geminiRewrite(item);
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

            // 특례보증/중저신용 키워드 매칭 → status="팝업"
            const popupStatus = isPopupKeyword(item.pblancNm)
              ? "팝업"
              : "리라이팅완료";

            await airtableCreate({
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
              status: popupStatus,
              tags: rewritten.tags,
            });
            results.bizinfo.success++;
            existingIds.add(item.pblancId);

            if (popupStatus === "팝업") {
              await sendPipelineLog(
                "success",
                "팝업",
                `특례보증 팝업 활성: "${rewritten.title}"`,
              );
            }
          } catch {
            /* skip individual failures */
          }
          await sleep(1200);
        }
        await sendPipelineLog(
          "success",
          "공고",
          `${results.bizinfo.success}건 신규 공고 등록`,
        );
      }
    } catch (e) {
      results.bizinfo.error = String(e);
      await sendPipelineLog("error", "공고", "파이프라인 실패", String(e));
    }

    // ═══ 마감 자동 OFF: status="팝업" → "만료" ═══
    try {
      const popupRes = await fetch(
        `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}?filterByFormula=${encodeURIComponent('{status}="팝업"')}&maxRecords=10`,
        { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } },
      );
      const popupData = await popupRes.json();
      for (const record of popupData.records || []) {
        const period = record.fields?.applyPeriod || "";
        const deadlineMatch =
          period.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})\s*$/) ||
          period.match(/~\s*(\d{4})[.\-/](\d{2})[.\-/](\d{2})/);
        if (deadlineMatch) {
          const deadline = new Date(
            `${deadlineMatch[1]}-${deadlineMatch[2]}-${deadlineMatch[3]}T23:59:59+09:00`,
          );
          if (deadline.getTime() < Date.now()) {
            await fetch(
              `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}/${record.id}`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ fields: { status: "만료" } }),
              },
            );
            await sendPipelineLog(
              "info",
              "팝업",
              `마감 자동 OFF: "${record.fields?.title}"`,
            );
          }
        }
      }
    } catch {
      /* 만료 처리 실패는 무시 */
    }

    // ═══ 2. 정책자금 뉴스 (자동 주제) ═══
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=일, 1=월...
    const isNewsDay = [1, 3, 5].includes(dayOfWeek); // 월수금

    if (!isNewsDay) {
      results.news.skipped = true;
    } else {
      try {
        const newsId = `NEWS_AUTO_${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
        if (!existingIds.has(newsId)) {
          const topic = await geminiGenerateTopic("뉴스");
          const content = await geminiNewsContent(topic);
          const img = await geminiRealisticImage(content.title, "news");

          const contentKey = `posts/${newsId}.json`;
          await s3.send(
            new PutObjectCommand({
              Bucket: "kpecr2",
              Key: contentKey,
              Body: JSON.stringify(content.content),
              ContentType: "application/json",
              CacheControl: "public, max-age=86400",
            }),
          );

          let imgUrl = "";
          if (img) {
            const imgKey = `thumbnails/${newsId}.png`;
            await s3.send(
              new PutObjectCommand({
                Bucket: "kpecr2",
                Key: imgKey,
                Body: img,
                ContentType: "image/png",
                CacheControl: "public, max-age=604800",
              }),
            );
            imgUrl = `${process.env.R2_PUBLIC_URL}/${imgKey}`;
          }

          await airtableCreate({
            pblancId: newsId,
            title: content.title,
            originalTitle: topic,
            summary: content.summary,
            contentUrl: `${process.env.R2_PUBLIC_URL}/${contentKey}`,
            category: "뉴스",
            source: "KPEC",
            applyPeriod: "",
            originalUrl: imgUrl,
            publishDate: today.toISOString().slice(0, 10),
            status: "게시중",
            tags: content.tags || "",
          });
          results.news.success = 1;
          await sendPipelineLog(
            "success",
            "뉴스",
            `"${content.title}" 게시 완료`,
          );
        }
      } catch (e) {
        results.news.error = String(e);
        await sendPipelineLog("error", "뉴스", "파이프라인 실패", String(e));
      }
    }

    // ═══ 3. 정책자금 분석 (매일) ═══
    try {
      const analysisId = `ANALYSIS_AUTO_${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
      if (!existingIds.has(analysisId)) {
        const topic = await geminiGenerateTopic("분석");
        const content = await geminiAnalysisContent(topic);
        const img = await geminiRealisticImage(content.title, "analysis");

        const contentKey = `posts/${analysisId}.json`;
        await s3.send(
          new PutObjectCommand({
            Bucket: "kpecr2",
            Key: contentKey,
            Body: JSON.stringify(content.content),
            ContentType: "application/json",
            CacheControl: "public, max-age=86400",
          }),
        );

        let imgUrl = "";
        if (img) {
          const imgKey = `thumbnails/${analysisId}.png`;
          await s3.send(
            new PutObjectCommand({
              Bucket: "kpecr2",
              Key: imgKey,
              Body: img,
              ContentType: "image/png",
              CacheControl: "public, max-age=604800",
            }),
          );
          imgUrl = `${process.env.R2_PUBLIC_URL}/${imgKey}`;
        }

        await airtableCreate({
          pblancId: analysisId,
          title: content.title,
          originalTitle: topic,
          summary: content.summary,
          contentUrl: `${process.env.R2_PUBLIC_URL}/${contentKey}`,
          category: "분석",
          source: "KPEC",
          applyPeriod: "",
          originalUrl: imgUrl,
          publishDate: today.toISOString().slice(0, 10),
          status: "게시중",
          tags: content.tags || "",
        });
        results.analysis.success = 1;
        await sendPipelineLog(
          "success",
          "분석",
          `"${content.title}" 게시 완료`,
        );
      }
    } catch (e) {
      results.analysis.error = String(e);
      await sendPipelineLog("error", "분석", "파이프라인 실패", String(e));
    }

    // ═══ 4. 인스타그램 배너 (매일) — Unsplash + Sharp SVG 합성 ═══
    try {
      const instaId = `INSTA_${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
      if (!existingIds.has(instaId)) {
        {
          // 독립적인 정책자금 주제 생성 (분석/뉴스에서 가져오지 않음)
          const bannerText = await geminiInstaBannerText("", "");

          // HCTI API 합성 배너 생성
          const bannerImg = await compositeInstaBanner(bannerText);

          // 캡션 생성
          const caption = await geminiInstaCaption(
            bannerText.title,
            bannerText.sub,
          );

          if (bannerImg) {
            const imgKey = `instagram/${instaId}.png`;
            await s3.send(
              new PutObjectCommand({
                Bucket: "kpecr2",
                Key: imgKey,
                Body: bannerImg,
                ContentType: "image/png",
                CacheControl: "public, max-age=604800",
              }),
            );
            const imgUrl = `${process.env.R2_PUBLIC_URL}/${imgKey}`;

            // IG 게시 생략 — 배너 생성 + R2 + Airtable만
            await airtableCreate({
              pblancId: instaId,
              title: bannerText.title.replace("\\n", " "),
              originalTitle: "Instagram Banner",
              summary: caption,
              contentUrl: imgUrl,
              category: "인스타",
              source: "KPEC",
              applyPeriod: "",
              originalUrl: imgUrl,
              publishDate: today.toISOString().slice(0, 10),
              status: "게시중",
              tags: "인스타그램,배너",
            });
            results.instagram.success = 1;
            await sendPipelineLog(
              "success",
              "인스타",
              "배너 생성 완료 (IG 게시 생략)",
              caption.slice(0, 200),
            );
          }
        }
      }
    } catch (e) {
      results.instagram.error = String(e);
      await sendPipelineLog("error", "인스타", "파이프라인 실패", String(e));
    }

    // 전체 요약 텔레그램
    const summary = [
      `공고: ${results.bizinfo.skipped ? "신규 없음" : results.bizinfo.success + "건"}`,
      `뉴스: ${results.news.skipped ? "오늘 아님(월수금)" : results.news.success + "건"}`,
      `분석: ${results.analysis.success}건`,
      `인스타: ${results.instagram.success}건`,
    ].join(" | ");
    await sendPipelineLog("info", "파이프라인 요약", summary);

    return NextResponse.json({ message: "Pipeline complete", results });
  } catch (e) {
    await sendPipelineLog("error", "파이프라인", "전체 실패", String(e));
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── Helper Functions ──

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const POPUP_KEYWORDS = [
  "특례보증",
  "중저신용",
  "정부지원금",
  "긴급보증",
  "소상공인 특별",
];

function isPopupKeyword(title: string): boolean {
  const t = (title || "").toLowerCase();
  return POPUP_KEYWORDS.some((kw) => t.includes(kw));
}

function getCategory(code: string) {
  const c = (code || "").replace(/"/g, "").trim();
  if (c.includes("기술")) return "기술";
  if (c.includes("인력") || c.includes("고용")) return "인력";
  if (c.includes("경영")) return "경영";
  if (c.includes("금융")) return "금융";
  return "공고";
}

function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/☞/g, "- ")
    .trim();
}

async function airtableCreate(fields: Record<string, string>) {
  await fetch(`${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }] }),
  });
}

async function geminiCall(model: string, prompt: string, json = true) {
  const res = await fetch(
    `${GEMINI_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 16384,
          ...(json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${model}: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return json ? JSON.parse(text) : text;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function geminiRewrite(item: any) {
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  return geminiCall(
    model,
    `당신은 KPEC 정책자금 전문 에디터입니다. 아래 기업마당 공고를 리라이팅하세요.
공고명: ${item.pblancNm}
주관: ${item.jrsdInsttNm} / 수행: ${item.excInsttNm || ""}
접수: ${item.reqstBeginEndDe} / 분야: ${item.pldirSportRealmLclasCodeNm}
요약: ${stripHtml(item.bsnsSumryCn)}

규칙: 제목 40자 이내, 요약 2~3문장, 본문 JSON(h2/p/ul/info-box), 사업개요→지원대상→지원내용→신청방법 순서.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원". 태그 5개.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiGenerateTopic(type: string) {
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  const today = new Date().toISOString().slice(0, 10);
  const result = await geminiCall(
    model,
    `오늘은 ${today}입니다.
KPEC(기업정책자금센터)의 ${type === "뉴스" ? "정책자금 뉴스 칼럼" : "정책자금 심층 분석 리포트"} 주제를 1개 제안하세요.
2026년 중소기업 정책자금(4.4조원), AI 기업 AX 스프린트, DX·ESG 우대, 수출기업화, 벤처/이노비즈/메인비즈 인증, ISO 인증, 소상공인 자금 등 관련 주제.
기존에 다뤘을 법한 일반적인 주제 말고, 오늘 날짜에 맞는 시의성 있는 구체적 주제.
출력: {"topic":"주제 제목 (50자 이내)","angle":"작성 방향 200자"}`,
  );
  return result.topic;
}

async function geminiNewsContent(topic: string) {
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  return geminiCall(
    model,
    `KPEC 정책자금 뉴스 칼럼 작성.
주제: ${topic}
분량: 800~1,200자. 구조: h2 3~4개, p(200~300자), ul(3~5개), info-box.
content 배열의 type은 반드시 "h2", "p", "ul", "info-box" 중 하나만 사용. "text" 타입 사용 금지.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원". 구체적 수치 포함.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiAnalysisContent(topic: string) {
  const model = process.env.GEMINI_MODEL_ANALYSIS || "gemini-2.5-pro";
  return geminiCall(
    model,
    `KPEC 정책자금 심층 분석 리포트 작성.
주제: ${topic}
분량: 2,000~3,000자. h2 4~5개, chart-data 블록 2개 이상(bar/compare/table).
content 배열의 type은 반드시 "h2", "p", "ul", "info-box", "chart-data" 중 하나만 사용. "text" 타입 사용 금지, 본문은 "p" 사용.
chart-data 중요: data 배열의 모든 항목에 반드시 숫자 value 값을 포함해야 함. value가 없으면 렌더링 오류 발생.
chart-data 예시: {"type":"chart-data","chartType":"bar","title":"...","data":[{"name":"...","value":1000}]}
compare 예시: {"type":"chart-data","chartType":"compare","title":"...","data":[{"name":"업무 효율","value":85},{"name":"정확도","value":92}]}
"기업평가"→"현황분석". KPEC 전문가 시각 행동 권고 포함.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiRealisticImage(title: string, context: string) {
  const sceneMap: Record<string, string> = {
    news: "Korean business professionals in a modern private office reviewing documents at a desk",
    analysis:
      "Modern corporate conference room with large monitor showing charts and graphs, business professionals seated at table",
    instagram:
      "Clean Korean business workspace with laptop and coffee, morning light, vertical 3:4 composition",
  };
  const scene = sceneMap[context] || sceneMap.news;

  try {
    const res = await fetch(
      `${GEMINI_BASE}/gemini-3-pro-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Professional editorial photograph related to "${title}". ${scene}. Natural lighting, Canon 5D quality. CRITICAL RESTRICTIONS: Absolutely NO national flags (no Korean flag, no Taegeukgi, no any country flag), NO text of any language, NO logos, NO watermarks, NO signs, NO banners, NO government podiums, NO press briefing rooms. Show only people, furniture, and neutral office interiors. Realistic photography only.`,
                },
              ],
            },
          ],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const imgPart = (data.candidates?.[0]?.content?.parts || []).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.inlineData?.mimeType?.startsWith("image/"),
    );
    return imgPart ? Buffer.from(imgPart.inlineData.data, "base64") : null;
  } catch {
    return null;
  }
}

async function geminiInstaCaption(title: string, summary: string) {
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  const result = await geminiCall(
    model,
    `Instagram 캡션 작성.
제목: ${title}
내용: ${summary}

포맷 규칙:
1. 첫 줄: 이모지 + 핵심 훅 (한 줄로 시선을 끄는 질문이나 문장)
2. 빈 줄
3. 본문 3~5줄: 각 줄 앞에 이모지(✅📌💡🔑📊 등) + 핵심 포인트 한 줄씩. 줄바꿈(\\n)으로 구분
4. 빈 줄
5. CTA: 👉 자세한 내용은 프로필 링크에서 확인하세요!
6. 빈 줄
7. 해시태그 줄: #정책자금 #중소기업 포함 5~7개

레퍼런스 예시:
"💰 은행 금리의 절반으로 자금 조달이 가능하다고?\\n\\n✅ 정책자금 기본 금리 연 2.5%~\\n📊 시중은행 대비 최대 50% 이자 절감\\n🔑 운전자금·시설자금 최대 60억 한도\\n💡 AX 스프린트 선정 시 추가 금리 우대\\n\\n👉 자세한 내용은 프로필 링크에서 확인하세요!\\n\\n#정책자금 #중소기업 #저금리 #KPEC #기업정책자금센터"

출력: {"caption":"..."}
caption 안에서 줄바꿈은 반드시 \\n으로 표현`,
    true,
  );
  return (
    result.caption ||
    `💰 ${title}\n\n${summary}\n\n👉 자세한 내용은 프로필 링크에서 확인하세요!\n\n#정책자금 #중소기업 #KPEC #기업정책자금센터 #정부지원금`
  );
}

// ── Instagram 배너 합성 (Unsplash + Sharp SVG) ──

const UNSPLASH_PHOTOS = [
  "photo-1486406146926-c627a92ad1ab", // 빌딩
  "photo-1497366216548-37526070297c", // 오피스
  "photo-1554224155-6726b3ff858f", // 금융
  "photo-1560472354-b33ff0c44a43", // 도시
  "photo-1507003211169-0a1dd7228f2d", // 비즈니스
  "photo-1573164713714-d95e436ab8d6", // 서울
  "photo-1551836022-d5d88e9218df", // 회의실
  "photo-1504384308090-c894fdcc538d", // 테크
];

// Accent keyword highlight colors (cycling per day)
const ACCENT_COLORS = [
  "#ED2939", // red
  "#4ADE80", // green
  "#FACC15", // yellow
  "#60A5FA", // blue
  "#ED2939", // red
  "#4ADE80", // green
];

interface BannerText {
  badge: string;
  title: string;
  sub: string;
  accentColor: string;
}

async function geminiInstaBannerText(
  _title: string,
  _summary: string,
): Promise<BannerText> {
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  const dayIndex = new Date().getDate() % ACCENT_COLORS.length;
  const reasonNum = String((new Date().getDate() % 12) + 1).padStart(2, "0");
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const result = await geminiCall(
      model,
      `KPEC 기업정책자금센터 인스타그램 배너용 텍스트를 생성하세요.
오늘 날짜: ${todayStr}

주제 범위 (매일 다른 주제):
운전자금, 시설자금, 벤처인증, 이노비즈, 메인비즈, ISO인증, 금리우대, 수출지원, 창업자금, 긴급자금, R&D자금, 성공보수, 자금진단, 서류지원, DX·ESG, 소상공인

레퍼런스 예시:
- title1: "최대", accent: "2년", title2: "거치", title3: "부담 없는 상환 구조"
- title1: "매출 성장의", accent: "첫 번째 발판", title2: ""
- title1: "기업 신용등급", accent: "UP", title2: "의 지름길"
- title1: "연간", accent: "10조원", title2: "놓치면 손해입니다"

규칙:
- title1: 첫 번째 줄 텍스트 (강조 단어 앞부분)
- accent: 강조 키워드 1~4자 (숫자나 핵심 단어, 다른 색으로 표시됨)
- title2: 강조 키워드 뒷부분 또는 두 번째 줄 텍스트
- sub: 정확히 2줄, 줄당 10~14자. 줄바꿈은 \\n으로 표시
출력: {"title1":"...","accent":"...","title2":"...","sub":"1줄\\n2줄"}`,
    );
    return {
      badge: `REASON ${reasonNum}`,
      title: `${result.title1 || "정부정책자금"}|||${result.accent || ""}|||${result.title2 || ""}`,
      sub: result.sub || "후불 성공보수제\\n승인 전 비용 0원",
      accentColor: ACCENT_COLORS[dayIndex],
    };
  } catch {
    return {
      badge: `REASON ${reasonNum}`,
      title: "정부정책자금|||지금|||확인하세요",
      sub: "후불 성공보수제\\n승인 전 비용 0원",
      accentColor: ACCENT_COLORS[dayIndex],
    };
  }
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function compositeInstaBanner(b: BannerText): Promise<Buffer | null> {
  try {
    const photoIdx = new Date().getDate() % UNSPLASH_PHOTOS.length;
    const photoUrl = `https://images.unsplash.com/${UNSPLASH_PHOTOS[photoIdx]}?w=1200&q=70`;

    // Parse title: "title1|||accent|||title2"
    const titleParts = b.title.split("|||");
    const title1 = escXml(titleParts[0] || "");
    const accent = escXml(titleParts[1] || "");
    const title2 = escXml(titleParts[2] || "");
    const subLines = b.sub.split("\\n").slice(0, 2);
    const accentColor = b.accentColor || "#ED2939";

    // Build title HTML with accent keyword in color
    let titleHtml = "";
    if (title1) titleHtml += title1;
    if (accent)
      titleHtml += `<br><span style="color:${accentColor};">${accent}</span>`;
    if (title2) titleHtml += title2;

    const html = `<div style="width:1080px;height:1440px;position:relative;overflow:hidden;background:#000;">
  <img src="${photoUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
  <div style="position:absolute;inset:0;background:rgba(10,15,30,0.87);"></div>
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:0 80px;z-index:1;">
    <div style="margin-top:340px;display:inline-flex;align-items:center;justify-content:center;padding:16px 42px;border-radius:50px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.25);color:#fff;font-size:34px;font-weight:700;letter-spacing:3px;">${escXml(b.badge)}</div>
    <div style="width:60px;height:4px;background:#ED2939;border-radius:2px;margin-top:36px;"></div>
    <div style="margin-top:48px;text-align:center;font-size:88px;font-weight:900;color:#fff;line-height:1.3;letter-spacing:-1px;word-break:keep-all;">${titleHtml}</div>
    <div style="margin-top:44px;text-align:center;font-size:38px;font-weight:400;color:rgba(255,255,255,0.7);line-height:1.7;">${subLines.map((l) => escXml(l)).join("<br>")}</div>
  </div>
  <div style="position:absolute;bottom:80px;left:0;right:0;text-align:center;z-index:1;">
    <span style="font-size:42px;font-weight:900;letter-spacing:2px;"><span style="color:#ED2939;">K</span><span style="color:#fff;">PEC</span></span><span style="font-size:36px;font-weight:700;color:#fff;margin-left:12px;letter-spacing:1px;">기업정책자금센터</span>
  </div>
</div>`;

    const css =
      "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap'); * { font-family: 'Noto Sans KR', sans-serif; margin:0; padding:0; box-sizing:border-box; }";

    const res = await fetch("https://hcti.io/v1/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${process.env.HCTI_API_USER_ID}:${process.env.HCTI_API_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify({
        html,
        css,
        viewport_width: 1080,
        viewport_height: 1440,
      }),
    });

    const data = (await res.json()) as { url?: string };
    if (!data.url) return null;

    const imgRes = await fetch(data.url);
    if (!imgRes.ok) return null;
    return Buffer.from(await imgRes.arrayBuffer());
  } catch {
    return null;
  }
}

async function postToInstagram(imageUrl: string, caption: string) {
  const token = process.env.THREADS_SYSTEM_USER_TOKEN;
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!token || !igUserId) return false;

  try {
    // Step 1: Create media
    const createRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: token,
        }),
      },
    );
    const createData = await createRes.json();
    if (!createData.id) return false;

    // Step 2: Publish
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: token,
        }),
      },
    );
    const publishData = await publishRes.json();
    return !!publishData.id;
  } catch {
    return false;
  }
}

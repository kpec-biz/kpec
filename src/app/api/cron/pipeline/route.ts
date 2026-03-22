import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { sendPipelineLog } from "@/lib/telegram";
import sharp from "sharp";

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
        const recentRes = await fetch(
          `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}?sort%5B0%5D%5Bfield%5D=publishDate&sort%5B0%5D%5Bdirection%5D=desc&maxRecords=1&filterByFormula=OR({category}="뉴스",{category}="분석")`,
          { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } },
        );
        const recentData = await recentRes.json();
        const recentPost = recentData.records?.[0]?.fields;

        if (recentPost) {
          // Gemini로 뱃지/타이틀/서브텍스트 생성
          const bannerText = await geminiInstaBannerText(
            recentPost.title,
            recentPost.summary,
          );

          // Sharp SVG 합성 배너 생성
          const bannerImg = await compositeInstaBanner(bannerText);

          // 캡션 생성
          const caption = await geminiInstaCaption(
            recentPost.title,
            recentPost.summary,
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

            const igPosted = await postToInstagram(imgUrl, caption);

            await airtableCreate({
              pblancId: instaId,
              title: recentPost.title,
              originalTitle: "Instagram Auto Post",
              summary: caption,
              contentUrl: imgUrl,
              category: "인스타",
              source: "KPEC",
              applyPeriod: "",
              originalUrl: imgUrl,
              publishDate: today.toISOString().slice(0, 10),
              status: igPosted ? "게시중" : "리라이팅완료",
              tags: "인스타그램,자동게시",
            });
            results.instagram.success = 1;
            await sendPipelineLog(
              igPosted ? "success" : "info",
              "인스타",
              igPosted
                ? "Instagram 게시 완료"
                : "이미지 생성 완료 (IG 게시 실패)",
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
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash";
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
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash";
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
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash";
  return geminiCall(
    model,
    `KPEC 정책자금 뉴스 칼럼 작성.
주제: ${topic}
분량: 800~1,200자. 구조: h2 3~4개, p(200~300자), ul(3~5개), info-box.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원". 구체적 수치 포함.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiAnalysisContent(topic: string) {
  const model =
    process.env.GEMINI_MODEL_ANALYSIS || "gemini-2.5-pro-preview-05-06";
  return geminiCall(
    model,
    `KPEC 정책자금 심층 분석 리포트 작성.
주제: ${topic}
분량: 2,000~3,000자. h2 4~5개, chart-data 블록 2개 이상(bar/compare/table).
chart-data 예시: {"type":"chart-data","chartType":"bar","title":"...","data":[{"name":"...","value":1000}]}
"기업평가"→"현황분석". KPEC 전문가 시각 행동 권고 포함.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiRealisticImage(title: string, context: string) {
  const sceneMap: Record<string, string> = {
    news: "Korean business professionals in modern Seoul office discussing documents",
    analysis:
      "Korean government building or modern conference room with business data presentation",
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
                  text: `Professional editorial photograph related to "${title}". ${scene}. Natural lighting, Canon 5D quality. IMPORTANT: No text, no flags, no logos, no Korean characters, no English text. Realistic photography only, no geometric patterns.`,
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
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash";
  const result = await geminiCall(
    model,
    `Instagram 캡션 작성.
제목: ${title}
내용: ${summary}
규칙: 200자 이내, 해시태그 5개, 이모지 적절히, CTA "프로필 링크에서 자세히 확인하세요"
출력: {"caption":"..."}`,
    true,
  );
  return (
    result.caption ||
    `${title}\n\n자세한 내용은 프로필 링크에서 확인하세요.\n#정책자금 #중소기업 #KPEC`
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

const OVERLAY_COLORS = [
  "#1A56A8",
  "#0e2a5c",
  "#ED2939",
  "#7c3aed",
  "#059669",
  "#d97706",
];

interface BannerText {
  badge: string;
  title: string;
  sub: string;
  accentColor: string;
}

async function geminiInstaBannerText(
  title: string,
  summary: string,
): Promise<BannerText> {
  const model = process.env.GEMINI_MODEL_TEXT || "gemini-2.0-flash";
  try {
    const result = await geminiCall(
      model,
      `인스타그램 배너용 텍스트 생성.
원본 제목: ${title}
원본 요약: ${summary}

규칙:
- badge: 1줄, 4자 이내 카테고리 (예: 정책자금, 운전자금, 벤처인증, 금리우대, 분석리포트)
- title: 최대 2줄, 줄당 10자 이내. 핵심 메시지만. 줄바꿈은 \\n으로 표시
- sub: 최대 2줄, 줄당 14자 이내. 부연 설명. 줄바꿈은 \\n으로 표시
출력: {"badge":"...","title":"...","sub":"..."}`,
    );
    const dayIndex = new Date().getDate() % OVERLAY_COLORS.length;
    return {
      badge: result.badge || "정책자금",
      title: result.title || title.slice(0, 20),
      sub: result.sub || summary.slice(0, 28),
      accentColor: OVERLAY_COLORS[dayIndex],
    };
  } catch {
    const dayIndex = new Date().getDate() % OVERLAY_COLORS.length;
    return {
      badge: "정책자금",
      title: title.length > 20 ? title.slice(0, 20) : title,
      sub: summary.slice(0, 28),
      accentColor: OVERLAY_COLORS[dayIndex],
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

function buildBannerSVG(b: BannerText): string {
  const W = 1080,
    H = 1440;
  const titleLines = b.title.split("\\n").slice(0, 2);
  const subLines = b.sub.split("\\n").slice(0, 2);

  // 뱃지
  const badgeW = b.badge.length * 32 + 64;
  const badgeX = (W - badgeW) / 2;
  const badge = `<rect x="${badgeX}" y="434" width="${badgeW}" height="44" rx="22" fill="${b.accentColor}"/>
    <text x="${W / 2}" y="463" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="28" fill="white" letter-spacing="2">${escXml(b.badge)}</text>`;

  // accent line
  const line = `<rect x="${(W - 80) / 2}" y="500" width="80" height="4" rx="2" fill="${b.accentColor}"/>`;

  // 타이틀
  let titleY = 570;
  const titleSvg = titleLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${titleY + i * 88}" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="68" fill="white">${escXml(l)}</text>`,
    )
    .join("");

  // 서브텍스트
  const subStartY = titleY + titleLines.length * 88 + 24;
  const subSvg = subLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${subStartY + i * 52}" text-anchor="middle" font-family="sans-serif" font-weight="400" font-size="32" fill="rgba(255,255,255,0.8)">${escXml(l)}</text>`,
    )
    .join("");

  // 로고: bottom 80px
  const logoY = H - 80;
  const logo = `<text x="${W / 2 - 60}" y="${logoY}" font-family="sans-serif" font-weight="900" font-size="42" fill="#ED2939">K</text>
    <text x="${W / 2 - 30}" y="${logoY}" font-family="sans-serif" font-weight="300" font-size="42" fill="white">PEC</text>
    <text x="${W / 2 + 50}" y="${logoY}" font-family="sans-serif" font-weight="700" font-size="22" fill="white">기업정책자금센터</text>`;

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${badge}${line}${titleSvg}${subSvg}${logo}
  </svg>`;
}

async function compositeInstaBanner(b: BannerText): Promise<Buffer | null> {
  try {
    // 1. Unsplash 배경
    const photoIdx = new Date().getDate() % UNSPLASH_PHOTOS.length;
    const photoUrl = `https://images.unsplash.com/${UNSPLASH_PHOTOS[photoIdx]}?w=1080&h=1440&fit=crop&q=70`;
    const bgRes = await fetch(photoUrl);
    if (!bgRes.ok) return null;
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer());

    // 2. 1080x1440 리사이즈
    const bg = await sharp(bgBuffer)
      .resize(1080, 1440, { fit: "cover" })
      .toBuffer();

    // 3. 30% 컬러 오버레이
    const hex = b.accentColor;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const bl = parseInt(hex.slice(5, 7), 16);
    const overlay = await sharp({
      create: {
        width: 1080,
        height: 1440,
        channels: 4,
        background: { r, g, b: bl, alpha: 0.3 },
      },
    })
      .png()
      .toBuffer();

    // 4. SVG 텍스트 레이어
    const svgText = buildBannerSVG(b);
    const svgBuffer = Buffer.from(svgText);

    // 5. 합성: bg → overlay → SVG text
    const result = await sharp(bg)
      .composite([
        { input: overlay, blend: "over" },
        { input: svgBuffer, blend: "over" },
      ])
      .png({ quality: 90 })
      .toBuffer();

    return result;
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

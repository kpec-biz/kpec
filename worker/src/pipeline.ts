import { Env } from "./airtable";

const BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";
const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";
// Gemini API가 한국(Worker 리전)에서 차단되므로 Vercel 프록시 경유
// Worker → Vercel /api/gemini-proxy → Gemini API (미국 리전)
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const PIPELINE_CHAT_ID = "-1003423266787";

interface PipelineResults {
  bizinfo: { success: number; skipped: boolean; error: string };
  news: { success: number; skipped: boolean; error: string };
  analysis: { success: number; skipped: boolean; error: string };
  instagram: { success: number; skipped: boolean; error: string };
}

export async function runPipeline(env: Env): Promise<PipelineResults> {
  const results: PipelineResults = {
    bizinfo: { success: 0, skipped: false, error: "" },
    news: { success: 0, skipped: false, error: "" },
    analysis: { success: 0, skipped: false, error: "" },
    instagram: { success: 0, skipped: false, error: "" },
  };

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun

  try {
    // ── 기존 ID 목록 ──
    const existingRes = await fetch(
      `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${TABLE_ID}?fields%5B%5D=pblancId&maxRecords=200`,
      { headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` } },
    );
    const existingData = (await existingRes.json()) as {
      records?: { fields: { pblancId: string } }[];
    };
    const existingIds = new Set(
      (existingData.records || []).map((r) => r.fields.pblancId),
    );

    // ═══ 1. 기업마당 공고 (매일) ═══
    // Vercel 경유로 목록만 조회 (기업마당이 CF IP 차단) → 리라이팅은 Worker에서 직접
    try {
      // 1a. Vercel에서 기업마당 목록만 가져오기
      const bizRes = await fetch(`${env.CORS_ORIGIN}/api/cron/bizinfo`, {
        headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
      });
      if (!bizRes.ok) {
        const errText = await bizRes.text().catch(() => "");
        throw new Error(
          `bizinfo list: HTTP ${bizRes.status}: ${errText.slice(0, 200)}`,
        );
      }
      const bizData = (await bizRes.json()) as {
        items?: Record<string, string>[];
        total?: number;
      };
      const allItems = bizData.items || [];

      // 1b. 기존 ID와 비교하여 신규만 필터
      const newItems = allItems.filter(
        (item) => !existingIds.has(item.pblancId),
      );

      if (newItems.length === 0) {
        results.bizinfo.skipped = true;
      } else {
        // 1c. Worker에서 직접 리라이팅 + R2 + Airtable
        for (const item of newItems) {
          try {
            const rewritten = await geminiRewrite(env, item);

            // R2에 본문 저장
            const contentKey = `posts/${item.pblancId}.json`;
            await env.R2.put(contentKey, JSON.stringify(rewritten.content), {
              httpMetadata: {
                contentType: "application/json",
                cacheControl: "public, max-age=86400",
              },
            });

            // Airtable에 메타 저장
            await airtableCreate(env, {
              pblancId: item.pblancId,
              title: rewritten.title,
              originalTitle: item.pblancNm,
              summary: rewritten.summary,
              contentUrl: `${env.R2_PUBLIC_URL}/${contentKey}`,
              category: getCategory(item.pldirSportRealmLclasCodeNm),
              source: item.jrsdInsttNm,
              applyPeriod: item.reqstBeginEndDe,
              originalUrl: item.pblancUrl,
              publishDate: item.creatPnttm?.slice(0, 10) || "",
              status: "리라이팅완료",
              tags: rewritten.tags || "",
            });

            results.bizinfo.success++;
          } catch (itemErr) {
            await sendTg(
              env,
              "error",
              "공고",
              `${item.pblancId} 리라이팅 실패`,
              String(itemErr),
            );
          }
        }
        if (results.bizinfo.success > 0) {
          await sendTg(
            env,
            "success",
            "공고",
            `${results.bizinfo.success}건 등록`,
          );
        }
      }
    } catch (e) {
      results.bizinfo.error = String(e);
      await sendTg(env, "error", "공고", "파이프라인 실패", String(e));
    }

    // ═══ 2. 정책자금 뉴스 (월수금만) ═══
    if ([1, 3, 5].includes(dayOfWeek)) {
      try {
        const newsId = `NEWS_AUTO_${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
        if (!existingIds.has(newsId)) {
          const topic = await geminiGenerateTopic(env, "뉴스");
          const content = await geminiNewsContent(env, topic);
          const img = await geminiRealisticImage(env, content.title, "news");

          const contentKey = `posts/${newsId}.json`;
          await env.R2.put(contentKey, JSON.stringify(content.content), {
            httpMetadata: {
              contentType: "application/json",
              cacheControl: "public, max-age=86400",
            },
          });

          let imgUrl = "";
          if (img) {
            const imgKey = `thumbnails/${newsId}.png`;
            await env.R2.put(imgKey, img, {
              httpMetadata: {
                contentType: "image/png",
                cacheControl: "public, max-age=604800",
              },
            });
            imgUrl = `${env.R2_PUBLIC_URL}/${imgKey}`;
          }

          await airtableCreate(env, {
            pblancId: newsId,
            title: content.title,
            originalTitle: topic,
            summary: content.summary,
            contentUrl: `${env.R2_PUBLIC_URL}/${contentKey}`,
            category: "뉴스",
            source: "KPEC",
            applyPeriod: "",
            originalUrl: imgUrl,
            publishDate: today.toISOString().slice(0, 10),
            status: "게시중",
            tags: content.tags || "",
          });
          results.news.success = 1;
          await sendTg(env, "success", "뉴스", `"${content.title}" 게시 완료`);
        }
      } catch (e) {
        results.news.error = String(e);
        await sendTg(env, "error", "뉴스", "파이프라인 실패", String(e));
      }
    } else {
      results.news.skipped = true;
    }

    // ═══ 3. 정책자금 분석 (매일) ═══
    try {
      const analysisId = `ANALYSIS_AUTO_${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
      if (!existingIds.has(analysisId)) {
        const topic = await geminiGenerateTopic(env, "분석");
        const content = await geminiAnalysisContent(env, topic);
        const img = await geminiRealisticImage(env, content.title, "analysis");

        const contentKey = `posts/${analysisId}.json`;
        await env.R2.put(contentKey, JSON.stringify(content.content), {
          httpMetadata: {
            contentType: "application/json",
            cacheControl: "public, max-age=86400",
          },
        });

        let imgUrl = "";
        if (img) {
          const imgKey = `thumbnails/${analysisId}.png`;
          await env.R2.put(imgKey, img, {
            httpMetadata: {
              contentType: "image/png",
              cacheControl: "public, max-age=604800",
            },
          });
          imgUrl = `${env.R2_PUBLIC_URL}/${imgKey}`;
        }

        await airtableCreate(env, {
          pblancId: analysisId,
          title: content.title,
          originalTitle: topic,
          summary: content.summary,
          contentUrl: `${env.R2_PUBLIC_URL}/${contentKey}`,
          category: "분석",
          source: "KPEC",
          applyPeriod: "",
          originalUrl: imgUrl,
          publishDate: today.toISOString().slice(0, 10),
          status: "게시중",
          tags: content.tags || "",
        });
        results.analysis.success = 1;
        await sendTg(env, "success", "분석", `"${content.title}" 게시 완료`);
      }
    } catch (e) {
      results.analysis.error = String(e);
      await sendTg(env, "error", "분석", "파이프라인 실패", String(e));
    }

    // ═══ 4. 인스타그램 배너 (매일) — 생성만, IG 게시 안 함 ═══
    try {
      const instaId = `INSTA_${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
      if (!existingIds.has(instaId)) {
        const bannerText = await geminiInstaBannerText(env);
        const bannerImg = await compositeInstaBanner(env, bannerText);
        const caption = await geminiInstaCaption(
          env,
          bannerText.title,
          bannerText.sub,
        );

        if (!bannerImg) {
          await sendTg(
            env,
            "error",
            "인스타",
            "HCTI 배너 이미지 생성 실패 (null 반환)",
          );
        } else {
          const imgKey = `instagram/${instaId}.png`;
          await env.R2.put(imgKey, bannerImg, {
            httpMetadata: {
              contentType: "image/png",
              cacheControl: "public, max-age=604800",
            },
          });
          const imgUrl = `${env.R2_PUBLIC_URL}/${imgKey}`;

          await airtableCreate(env, {
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
          await sendTg(
            env,
            "success",
            "인스타",
            "배너 생성 완료",
            caption.slice(0, 200),
          );
        }
      }
    } catch (e) {
      results.instagram.error = String(e);
      await sendTg(env, "error", "인스타", "파이프라인 실패", String(e));
    }

    // 전체 요약
    const summary = [
      `공고: ${results.bizinfo.skipped ? "신규 없음" : results.bizinfo.success + "건"}`,
      `뉴스: ${results.news.skipped ? "오늘 아님(월수금)" : results.news.success + "건"}`,
      `분석: ${results.analysis.success}건`,
      `인스타: ${results.instagram.success}건`,
    ].join(" | ");
    await sendTg(env, "info", "파이프라인 요약", summary);
  } catch (e) {
    await sendTg(env, "error", "파이프라인", "전체 실패", String(e));
  }

  return results;
}

// ── Helpers ──

async function sendTg(
  env: Env,
  level: string,
  section: string,
  message: string,
  detail?: string,
) {
  const icon = level === "success" ? "✅" : level === "error" ? "❌" : "ℹ️";
  let text = `${icon} [${section}] ${message}`;
  if (detail) text += `\n${detail.slice(0, 300)}`;
  try {
    await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: PIPELINE_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      },
    );
  } catch {
    /* ignore */
  }
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

async function airtableCreate(env: Env, fields: Record<string, string>) {
  await fetch(`${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${TABLE_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }] }),
  });
}

async function geminiCall(
  env: Env,
  model: string,
  prompt: string,
  json = true,
) {
  // Gemini API는 한국 리전에서 차단 → Vercel 프록시 경유
  const proxyUrl = `${env.CORS_ORIGIN}/api/gemini-proxy`;
  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CRON_SECRET}`,
    },
    body: JSON.stringify({ model, prompt, json }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(
      `Gemini proxy ${model}: ${res.status} - ${errBody.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return json ? JSON.parse(text) : text;
}

async function geminiRewrite(env: Env, item: Record<string, string>) {
  const model = env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  return geminiCall(
    env,
    model,
    `당신은 KPEC(한국기업정책자금센터, 민간 경영컨설팅 업체)의 정책자금 전문 에디터입니다. 아래 기업마당 공고를 리라이팅하세요.
공고명: ${item.pblancNm}
주관: ${item.jrsdInsttNm} / 수행: ${item.excInsttNm || ""}
접수: ${item.reqstBeginEndDe} / 분야: ${item.pldirSportRealmLclasCodeNm}
요약: ${stripHtml(item.bsnsSumryCn)}

규칙: 제목 40자 이내, 요약 2~3문장, 본문 JSON(h2/p/ul/info-box), 사업개요→지원대상→지원내용→신청방법 순서.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원". 태그 5개.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiGenerateTopic(env: Env, type: string) {
  const model = env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  const todayStr = new Date().toISOString().slice(0, 10);
  const result = await geminiCall(
    env,
    model,
    `오늘은 ${todayStr}입니다.
KPEC(한국기업정책자금센터, 민간 경영컨설팅 업체)의 ${type === "뉴스" ? "정책자금 뉴스 칼럼" : "정책자금 심층 분석 리포트"} 주제를 1개 제안하세요.
KPEC는 중소기업의 정부 정책자금 신청을 대행하고 컨설팅하는 회사입니다.
2026년 중소기업 정책자금(4.4조원), AI 기업 AX 스프린트, DX·ESG 우대, 수출기업화, 벤처/이노비즈/메인비즈 인증, ISO 인증, 소상공인 자금 등 관련 주제.
기존에 다뤘을 법한 일반적인 주제 말고, 오늘 날짜에 맞는 시의성 있는 구체적 주제.
출력: {"topic":"주제 제목 (50자 이내)","angle":"작성 방향 200자"}`,
  );
  return result.topic;
}

async function geminiNewsContent(env: Env, topic: string) {
  const model = env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  return geminiCall(
    env,
    model,
    `KPEC(한국기업정책자금센터) 정책자금 뉴스 칼럼 작성.
중요: KPEC는 공공기관이 아니라 민간 경영컨설팅 업체입니다. 중소기업의 정부 정책자금 신청을 대행하고 컨설팅하는 회사입니다.
주제: ${topic}
분량: 800~1,200자. 구조: h2 3~4개, p(200~300자), ul(3~5개), info-box.
content 배열의 type은 반드시 "h2", "p", "ul", "info-box" 중 하나만 사용. "text" 타입 사용 금지.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원". 구체적 수치 포함.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiAnalysisContent(env: Env, topic: string) {
  const model = env.GEMINI_MODEL_ANALYSIS || "gemini-2.5-pro";
  return geminiCall(
    env,
    model,
    `KPEC(한국기업정책자금센터) 정책자금 심층 분석 리포트 작성.
중요: KPEC는 공공기관이 아니라 민간 경영컨설팅 업체입니다. 중소기업의 정부 정책자금 신청을 대행하고 컨설팅하는 회사입니다. 후불 성공보수제로 운영됩니다.
주제: ${topic}
분량: 2,000~3,000자. h2 4~5개, chart-data 블록 2개 이상(bar/compare/table).
content 배열의 type은 반드시 "h2", "p", "ul", "info-box", "chart-data" 중 하나만 사용. "text" 타입 사용 금지, 본문은 "p" 사용.
chart-data 중요: data 배열의 모든 항목에 반드시 숫자 value 값을 포함해야 함. value가 없으면 렌더링 오류 발생.
chart-data 예시: {"type":"chart-data","chartType":"bar","title":"...","data":[{"name":"...","value":1000}]}
compare 예시: {"type":"chart-data","chartType":"compare","title":"...","data":[{"name":"업무 효율","value":85},{"name":"정확도","value":92}]}
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원". KPEC 컨설턴트 시각에서 중소기업 대표에게 행동 권고 포함.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiRealisticImage(
  env: Env,
  title: string,
  context: string,
): Promise<ArrayBuffer | null> {
  const sceneMap: Record<string, string> = {
    news: "East Asian Korean professionals in a modern Korean office, reviewing documents at a desk, Seoul city visible through window",
    analysis:
      "East Asian Korean professionals in a Korean corporate conference room with large monitor showing charts, Seoul skyline visible through window",
  };
  const scene = sceneMap[context] || sceneMap.news;

  try {
    const proxyUrl = `${env.CORS_ORIGIN}/api/gemini-proxy`;
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
      body: JSON.stringify({
        model: "gemini-3.1-flash-image-preview",
        prompt: `Professional editorial photograph for article: "${title}". ${scene}. CRITICAL: ALL people must be East Asian Korean ethnicity only. Korean office setting in South Korea. Natural lighting, Canon 5D quality. RESTRICTIONS: NO flags, NO text, NO logos, NO watermarks, NO signs, NO banners, NO English or Korean text anywhere in the image. Only show Korean people, furniture, and office interiors. Realistic photography only.`,
        image: true,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: {
        content?: {
          parts?: { inlineData?: { mimeType: string; data: string } }[];
        };
      }[];
    };
    const imgPart = (data.candidates?.[0]?.content?.parts || []).find((p) =>
      p.inlineData?.mimeType?.startsWith("image/"),
    );
    if (!imgPart?.inlineData?.data) return null;
    // base64 → ArrayBuffer
    const binaryStr = atob(imgPart.inlineData.data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes.buffer;
  } catch {
    return null;
  }
}

// ── Instagram Banner ──

const UNSPLASH_PHOTOS = [
  "photo-1486406146926-c627a92ad1ab",
  "photo-1497366216548-37526070297c",
  "photo-1554224155-6726b3ff858f",
  "photo-1560472354-b33ff0c44a43",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1573164713714-d95e436ab8d6",
  "photo-1551836022-d5d88e9218df",
  "photo-1504384308090-c894fdcc538d",
];

const ACCENT_COLORS = [
  "#ED2939",
  "#4ADE80",
  "#FACC15",
  "#60A5FA",
  "#ED2939",
  "#4ADE80",
];

interface BannerText {
  badge: string;
  title: string;
  sub: string;
  accentColor: string;
}

async function geminiInstaBannerText(env: Env): Promise<BannerText> {
  const model = env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  const dayIndex = new Date().getDate() % ACCENT_COLORS.length;
  const reasonNum = String((new Date().getDate() % 12) + 1).padStart(2, "0");
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const result = await geminiCall(
      env,
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
- title1: 첫 번째 줄 텍스트 (최대 8자, 강조 단어 앞부분)
- accent: 강조 키워드 1~4자 (숫자나 핵심 단어, 다른 색으로 표시됨)
- title2: 두 번째 줄 텍스트 (최대 8자)
- 중요: title1+accent+title2 합쳐서 최대 16자. 2줄 이내로 렌더링되어야 함
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

async function compositeInstaBanner(
  env: Env,
  b: BannerText,
): Promise<ArrayBuffer | null> {
  try {
    const photoIdx = new Date().getDate() % UNSPLASH_PHOTOS.length;
    const photoUrl = `https://images.unsplash.com/${UNSPLASH_PHOTOS[photoIdx]}?w=1200&q=70`;

    const titleParts = b.title.split("|||");
    const title1 = escXml(titleParts[0] || "");
    const accent = escXml(titleParts[1] || "");
    const title2 = escXml(titleParts[2] || "");
    const subLines = b.sub.split("\\n").slice(0, 2);
    const accentColor = b.accentColor || "#ED2939";

    let titleHtml = "";
    if (title1) titleHtml += title1;
    if (accent)
      titleHtml += `<br><span style="color:${accentColor};">${accent}</span>`;
    if (title2) titleHtml += title2;

    const html = `<div style="width:1080px;height:1440px;position:relative;overflow:hidden;background:#000;">
  <img src="${photoUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
  <div style="position:absolute;inset:0;background:rgba(10,15,30,0.82);"></div>
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:0 80px;z-index:1;">
    <div style="margin-top:380px;display:inline-flex;align-items:center;justify-content:center;padding:12px 32px;border-radius:8px;background:${accentColor};color:#fff;font-size:24px;font-weight:700;letter-spacing:2px;">${escXml(b.badge)}</div>
    <div style="width:50px;height:3px;background:#ED2939;border-radius:2px;margin-top:28px;"></div>
    <div style="margin-top:36px;text-align:center;font-size:58px;font-weight:900;color:#fff;line-height:1.35;letter-spacing:-1px;word-break:keep-all;">${titleHtml}</div>
    <div style="margin-top:32px;text-align:center;font-size:26px;font-weight:400;color:rgba(255,255,255,0.7);line-height:1.7;">${subLines.map((l) => escXml(l)).join("<br>")}</div>
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
        Authorization: `Basic ${btoa(`${env.HCTI_API_USER_ID}:${env.HCTI_API_KEY}`)}`,
      },
      body: JSON.stringify({
        html,
        css,
        viewport_width: 1080,
        viewport_height: 1440,
      }),
    });

    const data = (await res.json()) as { url?: string; error?: string };
    if (!data.url) {
      console.error("HCTI no URL:", JSON.stringify(data).slice(0, 300));
      return null;
    }

    const imgRes = await fetch(data.url);
    if (!imgRes.ok) {
      console.error("HCTI image fetch failed:", imgRes.status);
      return null;
    }
    return await imgRes.arrayBuffer();
  } catch (e) {
    console.error("compositeInstaBanner error:", e);
    return null;
  }
}

async function geminiInstaCaption(env: Env, title: string, summary: string) {
  const model = env.GEMINI_MODEL_TEXT || "gemini-2.5-flash";
  const result = await geminiCall(
    env,
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

출력: {"caption":"..."}
caption 안에서 줄바꿈은 반드시 \\n으로 표현`,
    true,
  );
  return (
    result.caption ||
    `💰 ${title}\n\n${summary}\n\n👉 자세한 내용은 프로필 링크에서 확인하세요!\n\n#정책자금 #중소기업 #KPEC #기업정책자금센터 #정부지원금`
  );
}

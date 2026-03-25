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
}

export async function runPipeline(env: Env): Promise<PipelineResults> {
  const results: PipelineResults = {
    bizinfo: { success: 0, skipped: false, error: "" },
    news: { success: 0, skipped: false, error: "" },
    analysis: { success: 0, skipped: false, error: "" },
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
            const ts = Date.now();
            const imgKey = `thumbnails/${newsId}_${ts}.png`;
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
          const ts = Date.now();
          const imgKey = `thumbnails/${analysisId}_${ts}.png`;
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

    // 인스타 배너는 프론트엔드 텍스트풀 렌더링으로 전환 — 파이프라인에서 제외

    // 전체 요약
    const summary = [
      `공고: ${results.bizinfo.skipped ? "신규 없음" : results.bizinfo.success + "건"}`,
      `뉴스: ${results.news.skipped ? "오늘 아님(월수금)" : results.news.success + "건"}`,
      `분석: ${results.analysis.success}건`,
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
  const model = env.GEMINI_MODEL_TEXT || "gemini-3-flash-preview";
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
금지 단어: "대행", "신청대행", "신청 대행" 절대 사용 금지. 대표자 이름(실명) 절대 포함 금지. 전화번호 포함 금지.
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiGenerateTopic(env: Env, type: string) {
  const model = env.GEMINI_MODEL_TEXT || "gemini-3-flash-preview";
  const todayStr = new Date().toISOString().slice(0, 10);
  const result = await geminiCall(
    env,
    model,
    `오늘은 ${todayStr}입니다.
${type === "뉴스" ? "정부정책·정부지원자금 관련 최신 소식" : "정책자금 업종별 활용 분석"} 주제를 1개 제안하세요.
주제 방향: 정부 정책자금 예산 변화, 신규 지원사업 출시, 금리·조건 변경, 신청 일정, 지원 대상 확대/축소 등 정부 발표 기반 소식.
시점: 최근 1개월 이내 소식만. 신청 기한이 이미 만료된 정책은 절대 다루지 마세요.
중소기업 정책자금, AI 기업 AX 스프린트, DX·ESG 우대, 수출기업화, 벤처/이노비즈/메인비즈 인증, ISO 인증, 소상공인 자금 등.
기존에 다뤘을 법한 일반적인 주제 말고, 오늘 날짜에 맞는 시의성 있는 구체적 주제.
출력: {"topic":"주제 제목 (50자 이내)","angle":"작성 방향 200자"}`,
  );
  return result.topic;
}

async function geminiNewsContent(env: Env, topic: string) {
  const model = env.GEMINI_MODEL_TEXT || "gemini-3-flash-preview";
  return geminiCall(
    env,
    model,
    `정부정책·정부지원자금 소식을 리라이팅한 뉴스 기사 작성.
목적: 정부정책·지원자금 소식을 중소기업 대표가 이해하기 쉽게 리라이팅. 출처 표기 없이 KPEC가 전하는 소식 톤으로 독자적 문장 재구성.
중요: 신청 기한이 만료된 정책은 다루지 마세요. 현재 신청 가능하거나 곧 시작되는 정책만 다루세요.
주제: ${topic}
분량: 800~1,200자. 구조: h2 3~4개, p(200~300자), ul(3~5개), info-box.
content 배열의 type은 반드시 "h2", "p", "ul", "info-box" 중 하나만 사용. "text" 타입 사용 금지.
중요 JSON 형식: h2/p/info-box는 반드시 {"type":"h2","text":"제목"} 형식 사용. children 배열 사용 금지.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원". 구체적 수치 포함.
금지: "대행", "신청대행" 사용 금지. "15년 경력", "N년 경력" 등 경력 언급 금지. 대표자 실명 금지. 전화번호 금지. KPEC 자사 홍보 문구 최소화(마지막 info-box에서만 간단히 언급 가능).
출력: {"title":"...","summary":"...","content":[...],"tags":"..."}`,
  );
}

async function geminiAnalysisContent(env: Env, topic: string) {
  const model = env.GEMINI_MODEL_ANALYSIS || "gemini-3.1-pro-preview";
  return geminiCall(
    env,
    model,
    `정책자금 심층 분석 리포트 작성.
목적: 특정 업종/분야의 중소기업이 정책자금을 활용해 어떤 실질적 도움을 받을 수 있는지 분석하는 글. KPEC 홍보글이 아님.
톤: 정책자금 전문 애널리스트 시각. 업종별 활용 사례, 자금 규모, 지원 조건 등 실질 정보 중심.
주제: ${topic}
분량: 2,000~3,000자. h2 4~5개, chart-data 블록 2개 이상(bar/compare/table).
content 배열의 type은 반드시 "h2", "p", "ul", "info-box", "chart-data" 중 하나만 사용. "text" 타입 사용 금지, 본문은 "p" 사용.
중요 JSON 형식: h2/p/info-box는 반드시 {"type":"h2","text":"제목"} 형식 사용. children 배열 사용 금지.
chart-data 중요: data 배열의 모든 항목에 반드시 숫자 value 값을 포함해야 함. value가 없으면 렌더링 오류 발생.
chart-data 예시: {"type":"chart-data","chartType":"bar","title":"...","data":[{"name":"...","value":1000}]}
compare 예시: {"type":"chart-data","chartType":"compare","title":"...","data":[{"name":"업무 효율","value":85},{"name":"정확도","value":92}]}
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원".
금지: "대행", "신청대행" 사용 금지. "15년 경력", "N년 경력" 등 경력 언급 금지. 대표자 실명 금지. 전화번호 금지. KPEC 자사 홍보 문구 최소화(마지막 info-box에서만 간단히 언급 가능).
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

// 인스타 배너: 프론트엔드 텍스트풀 렌더링으로 전환 — Worker 코드 제거됨

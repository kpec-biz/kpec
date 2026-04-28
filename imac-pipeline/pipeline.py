#!/usr/bin/env python3
"""기업정책자금센터 콘텐츠 파이프라인 (iMac 전용)
Claude CLI (Opus 기획 + Sonnet 작성) + Gemini 이미지 + R2/Airtable 저장

파이프라인 흐름:
  Stage 1: 기업마당 공고 수집 + 리라이팅 (Opus 기획 → Sonnet 작성)
  Stage 2: 정책자금 뉴스 큐레이션 (Opus 기획 → Sonnet 작성)
  Stage 3: 정책자금 분석 (Opus 기획 → Sonnet 작성)
  Stage 4: 콘텐츠 점검 (Opus 검수 → Sonnet 개선)
"""
import os, json, re, time, traceback, logging, subprocess
from datetime import datetime, timedelta
from pathlib import Path
from base64 import b64decode

import requests

# ── 설정 ──
BASE_DIR = Path(__file__).parent
CACHE_DIR = BASE_DIR / "cache"
LOG_DIR = BASE_DIR / "logs"
ANALYZED_FILE = BASE_DIR / "analyzed.json"
NEWS_USED_FILE = BASE_DIR / "news_used.json"
RETRY_QUEUE_FILE = BASE_DIR / "retry_queue.json"
CACHE_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

log_file = LOG_DIR / f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler(log_file, encoding="utf-8"), logging.StreamHandler()],
)
log = logging.getLogger("kpec")


# .env 로드
def load_env():
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

load_env()

# 환경변수
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
GEMINI_MODEL_IMAGE = os.environ.get("GEMINI_MODEL_IMAGE", "gemini-3.1-flash-image-preview")
AIRTABLE_TOKEN = os.environ["AIRTABLE_TOKEN"]
AIRTABLE_BASE_ID = os.environ["AIRTABLE_BASE_ID"]
TABLE_ID = os.environ.get("TABLE_ID", "tblqm10vZyVADXMKQ")
TG_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TG_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "-1003855194968")
BIZINFO_API_KEY = os.environ.get("BIZINFO_API_KEY", "")
CF_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
CF_EMAIL = os.environ.get("CLOUDFLARE_EMAIL", "")
CF_API_KEY = os.environ.get("CLOUDFLARE_API_KEY", "")
D1_DATABASE_ID = os.environ.get("D1_DATABASE_ID", "4163afb5-2ffd-4688-9360-d8f8e3a57748")
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY_ID", "")
R2_SECRET_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET = os.environ.get("R2_BUCKET", "kpecr2")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "")

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
AIRTABLE_API = "https://api.airtable.com/v0"
BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do"
CLAUDE_BIN = "/Users/pola/.local/bin/claude"

# Cloudflare D1 (Phase 2 듀얼라이트 — Phase 3에서 Airtable 제거 예정)
D1_API_BASE = (
    f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/d1/database/{D1_DATABASE_ID}"
    if CF_ACCOUNT_ID and D1_DATABASE_ID
    else ""
)
D1_HEADERS = {
    "X-Auth-Email": CF_EMAIL,
    "X-Auth-Key": CF_API_KEY,
    "Content-Type": "application/json",
}


# ═══════════════════════════════════════
# 텔레그램 보고
# ═══════════════════════════════════════
def send_tg(level, section, message, detail=""):
    icon = {"success": "✅", "error": "❌", "info": "ℹ️", "start": "🚀", "debug": "🔍"}.get(level, "📌")
    text = f"{icon} [KPEC/pipeline] [{section}] {message}"
    if detail:
        text += f"\n{detail[:500]}"
    try:
        requests.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={"chat_id": TG_CHAT_ID, "text": text, "parse_mode": "HTML"},
            timeout=10,
        )
    except Exception:
        pass
    log.info(f"TG: {text[:200]}")


# ═══════════════════════════════════════
# Claude CLI (Max 구독 인증)
# ═══════════════════════════════════════
def claude_call(model, prompt, json_mode=True, max_retries=2):
    """Claude CLI로 텍스트 생성. model: 'opus' 또는 'sonnet'."""
    if json_mode:
        prompt += "\n\n[출력 규칙] 반드시 유효한 JSON만 출력하세요. 마크다운 코드펜스(```)나 설명 텍스트 없이 순수 JSON만 출력."

    for attempt in range(max_retries + 1):
        try:
            result = subprocess.run(
                [CLAUDE_BIN, "--print", "--model", model, prompt],
                capture_output=True, text=True, timeout=180,
            )
            if result.returncode != 0:
                raise RuntimeError(f"Claude CLI error (rc={result.returncode}): {result.stderr[:200]}")

            raw = result.stdout.strip()
            if not json_mode:
                return raw

            # JSON 추출: 코드펜스 제거
            if "```" in raw:
                parts = raw.split("```")
                for part in parts[1:]:
                    cleaned = part.strip()
                    if cleaned.startswith("json"):
                        cleaned = cleaned[4:].strip()
                    try:
                        return json.loads(cleaned)
                    except json.JSONDecodeError:
                        continue
            return json.loads(raw)

        except subprocess.TimeoutExpired:
            log.warning(f"Claude {model} timeout (attempt {attempt+1})")
            if attempt < max_retries:
                time.sleep(5)
                continue
            raise
        except json.JSONDecodeError as e:
            log.warning(f"Claude {model} JSON parse error (attempt {attempt+1}): {e}")
            if attempt < max_retries:
                time.sleep(3)
                continue
            raise
        except Exception as e:
            if attempt < max_retries:
                time.sleep(3 * (attempt + 1))
                continue
            raise


# ═══════════════════════════════════════
# Gemini API (이미지 전용)
# ═══════════════════════════════════════
def gemini_image(title, context="news"):
    scenes = {
        "news": "Business professionals reviewing printed documents at a clean wooden desk in a bright modern office with large windows showing an urban skyline. Warm natural daylight. Shallow depth of field.",
        "analysis": "A focused business analyst working with paper charts and graphs on a minimalist white desk. Soft overhead lighting, glass partitions in background. No screens visible.",
    }
    scene = scenes.get(context, scenes["news"])
    prompt = (
        f'Professional editorial photograph for article: "{title}". '
        f"Scene: {scene}. Style: Canon EOS R5, 35mm f/1.4, natural lighting. "
        "All people must be Korean. Korean office setting in South Korea. "
        "STRICT RESTRICTIONS: NO flags. NO text/letters in any language. "
        "NO logos, watermarks, signs. NO laptop/smartphone/tablet screens visible from viewer side. "
        "NO national symbols. Focus on hands, documents, office materials. Realistic photography only."
    )
    url = f"{GEMINI_BASE}/{GEMINI_MODEL_IMAGE}:generateContent?key={GEMINI_API_KEY}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    try:
        res = requests.post(url, json=body, timeout=60)
        if not res.ok:
            log.warning(f"Image generation failed: {res.status_code}")
            return None
        data = res.json()
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        for p in parts:
            if p.get("inlineData", {}).get("mimeType", "").startswith("image/"):
                return b64decode(p["inlineData"]["data"])
    except Exception as e:
        log.warning(f"Image generation error: {e}")
    return None


# ═══════════════════════════════════════
# R2 업로드
# ═══════════════════════════════════════
def r2_upload(key, data, content_type="application/json"):
    import boto3
    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{CF_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
    )
    body = data if isinstance(data, bytes) else data.encode("utf-8")
    s3.put_object(Bucket=R2_BUCKET, Key=key, Body=body, ContentType=content_type)
    return f"{R2_PUBLIC_URL}/{key}"


# ═══════════════════════════════════════
# Cloudflare D1 (Phase 2: 신규 SoT)
# ═══════════════════════════════════════
def d1_get_existing_ids():
    """D1 notices 테이블의 pblanc_id 전체 조회."""
    if not D1_API_BASE:
        return set()
    try:
        res = requests.post(
            f"{D1_API_BASE}/query",
            headers=D1_HEADERS,
            json={"sql": "SELECT pblanc_id FROM notices"},
            timeout=30,
        )
        res.raise_for_status()
        data = res.json()
        if not data.get("success"):
            log.error(f"D1 list error: {data}")
            return set()
        rows = data.get("result", [{}])[0].get("results", [])
        return {r["pblanc_id"] for r in rows if r.get("pblanc_id")}
    except Exception as e:
        log.error(f"D1 list exception: {e}")
        return set()


def d1_create(fields):
    """notices INSERT OR IGNORE. fields는 sanitize_fields 거친 dict."""
    if not D1_API_BASE:
        return False
    pblanc_id = fields.get("pblancId")
    if not pblanc_id:
        return False

    cols = {
        "pblanc_id": pblanc_id,
        "title": fields.get("title") or fields.get("originalTitle") or pblanc_id,
        "original_title": fields.get("originalTitle"),
        "summary": fields.get("summary"),
        "content_url": fields.get("contentUrl"),
        "category": fields.get("category") or "기타",
        "source": fields.get("source"),
        "apply_period": fields.get("applyPeriod"),
        "original_url": fields.get("originalUrl"),
        "publish_date": fields.get("publishDate"),
        "status": fields.get("status") or "검토",
        "tags": fields.get("tags"),
    }
    keys = list(cols.keys())
    sql = (
        f"INSERT OR IGNORE INTO notices ({', '.join(keys)}) "
        f"VALUES ({', '.join(['?'] * len(keys))})"
    )
    params = [cols[k] for k in keys]
    try:
        res = requests.post(
            f"{D1_API_BASE}/raw",
            headers=D1_HEADERS,
            json={"sql": sql, "params": params},
            timeout=15,
        )
        if not res.ok:
            log.error(f"D1 create {res.status_code}: {res.text[:300]}")
            return False
        data = res.json()
        if not data.get("success"):
            log.error(f"D1 create error: {data}")
            return False
        return True
    except Exception as e:
        log.error(f"D1 create exception: {e}")
        return False


# ═══════════════════════════════════════
# Airtable (Phase 2 듀얼라이트, Phase 3에서 제거 예정)
# ═══════════════════════════════════════
def airtable_get_existing_ids():
    """Airtable + D1의 pblancId 합집합 (이중 안전망)."""
    all_ids = d1_get_existing_ids()
    url = f"{AIRTABLE_API}/{AIRTABLE_BASE_ID}/{TABLE_ID}"
    offset = None
    while True:
        params = {"fields[]": "pblancId", "pageSize": 100}
        if offset:
            params["offset"] = offset
        res = requests.get(url, headers={"Authorization": f"Bearer {AIRTABLE_TOKEN}"}, params=params, timeout=15)
        res.raise_for_status()
        data = res.json()
        all_ids.update(r["fields"]["pblancId"] for r in data.get("records", []) if "pblancId" in r.get("fields", {}))
        offset = data.get("offset")
        if not offset:
            break
    return all_ids


def sanitize_fields(fields):
    clean = {}
    for k, v in fields.items():
        if isinstance(v, list):
            clean[k] = ", ".join(str(x) for x in v)
        elif isinstance(v, dict):
            clean[k] = json.dumps(v, ensure_ascii=False)
        else:
            clean[k] = v
    if clean.get("title") and len(clean["title"]) > 100:
        clean["title"] = clean["title"][:97] + "..."
    return clean


def airtable_create(fields):
    """Airtable + D1 듀얼라이트. 둘 중 하나만 성공해도 통과시키지 않고
    Airtable 실패는 raise (legacy 호환), D1 실패는 로그만."""
    fields = sanitize_fields(fields)

    # 1) D1 INSERT (primary going forward) — 실패해도 Airtable 시도
    d1_ok = d1_create(fields)
    if not d1_ok:
        log.warning(f"D1 insert skipped/failed for {fields.get('pblancId')}")

    # 2) Airtable INSERT (legacy, Phase 3에서 제거)
    url = f"{AIRTABLE_API}/{AIRTABLE_BASE_ID}/{TABLE_ID}"
    res = requests.post(
        url,
        headers={"Authorization": f"Bearer {AIRTABLE_TOKEN}", "Content-Type": "application/json"},
        json={"records": [{"fields": fields}]},
        timeout=15,
    )
    if not res.ok:
        detail = res.text[:300]
        log.error(f"Airtable {res.status_code}: {detail}")
        raise requests.HTTPError(f"Airtable {res.status_code}: {detail}", response=res)


# ═══════════════════════════════════════
# RAG 캐시 + 분석 이력
# ═══════════════════════════════════════
def cache_announcement(pblanc_id, data):
    path = CACHE_DIR / f"{pblanc_id}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def load_recent_cache(max_items=20, max_days=30, announcements_only=True):
    cutoff = datetime.now() - timedelta(days=max_days)
    skip_prefixes = ("NEWS_", "ANALYSIS_", "INSTA_")
    items = []
    for p in sorted(CACHE_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
        if datetime.fromtimestamp(p.stat().st_mtime) < cutoff:
            continue
        if announcements_only and any(p.stem.startswith(px) for px in skip_prefixes):
            continue
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            if not data.get("title") and not data.get("originalTitle"):
                continue
            items.append(data)
        except Exception:
            continue
        if len(items) >= max_items:
            break
    return items


def build_rag_context(items, max_items=5):
    today = datetime.now().strftime("%Y-%m-%d")
    lines = []
    for item in items[:max_items]:
        record = {
            "id": item.get("pblancId", ""),
            "n": item.get("title", item.get("originalTitle", ""))[:60],
            "i": item.get("source", "")[:30],
            "p": item.get("applyPeriod", "")[:30],
            "c": item.get("category", ""),
            "s": item.get("summary", "")[:120],
        }
        amt = re.search(r"최대\s*[\d,]+\s*[만억천]?\s*원", item.get("summary", ""))
        if amt:
            record["a"] = amt.group()
        lines.append(json.dumps(record, ensure_ascii=False))
    return f'<data date="{today}">\n' + "\n".join(lines) + "\n</data>"


def build_analysis_rag(item):
    today = datetime.now().strftime("%Y-%m-%d")
    content_text = ""
    for block in item.get("content", []):
        if isinstance(block, dict):
            txt = block.get("text", "")
            if block.get("type") in ("p", "h2", "info-box") and txt:
                content_text += txt + " "
            elif block.get("type") == "ul":
                for it in block.get("items", []):
                    content_text += it + " "
    content_text = content_text[:800]
    record = {
        "title": item.get("title", ""),
        "originalTitle": item.get("originalTitle", ""),
        "source": item.get("source", ""),
        "applyPeriod": item.get("applyPeriod", ""),
        "category": item.get("category", ""),
        "summary": item.get("summary", ""),
        "detail": content_text,
    }
    return f'<data date="{today}">\n{json.dumps(record, ensure_ascii=False)}\n</data>'


def load_analyzed_ids():
    if ANALYZED_FILE.exists():
        try:
            return set(json.loads(ANALYZED_FILE.read_text(encoding="utf-8")))
        except Exception:
            pass
    return set()


def save_analyzed_id(pblanc_id):
    ids = load_analyzed_ids()
    ids.add(pblanc_id)
    id_list = sorted(ids)[-100:]
    ANALYZED_FILE.write_text(json.dumps(id_list, ensure_ascii=False), encoding="utf-8")


def load_news_used_ids():
    if NEWS_USED_FILE.exists():
        try:
            return set(json.loads(NEWS_USED_FILE.read_text(encoding="utf-8")))
        except Exception:
            pass
    return set()


def save_news_used_ids(pblanc_ids):
    existing = load_news_used_ids()
    existing.update(pblanc_ids)
    id_list = sorted(existing)[-200:]
    NEWS_USED_FILE.write_text(json.dumps(id_list, ensure_ascii=False), encoding="utf-8")


def load_retry_queue():
    if RETRY_QUEUE_FILE.exists():
        try:
            return json.loads(RETRY_QUEUE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def save_retry_queue(queue):
    RETRY_QUEUE_FILE.write_text(json.dumps(queue[-50:], ensure_ascii=False, indent=2), encoding="utf-8")


def add_to_retry_queue(pid, fields, error_msg):
    queue = load_retry_queue()
    existing = {item["pid"] for item in queue}
    if pid not in existing:
        queue.append({"pid": pid, "fields": fields, "attempts": 1, "lastError": str(error_msg)[:200]})
    else:
        for item in queue:
            if item["pid"] == pid:
                item["attempts"] += 1
                item["lastError"] = str(error_msg)[:200]
    save_retry_queue(queue)


def process_retry_queue(existing_ids):
    queue = load_retry_queue()
    if not queue:
        return 0
    remaining = []
    retried = 0
    for item in queue:
        pid = item["pid"]
        if pid in existing_ids:
            continue
        if item["attempts"] >= 3:
            log.warning(f"재시도 포기 (3회 초과): {pid}")
            continue
        try:
            airtable_create(item["fields"])
            retried += 1
            log.info(f"재시도 성공: {pid}")
            send_tg("success", "재시도", f"{pid} 성공 (시도 {item['attempts']+1}회)")
        except Exception as e:
            item["attempts"] += 1
            item["lastError"] = str(e)[:200]
            remaining.append(item)
            log.warning(f"재시도 실패: {pid} ({e})")
    save_retry_queue(remaining)
    return retried


def select_analysis_target(cached_items, analyzed_ids):
    candidates = [it for it in cached_items if it.get("pblancId", "") not in analyzed_ids]
    if not candidates:
        return None
    metro_kw = ["서울", "경기", "인천", "수도권"]
    for item in candidates:
        text = json.dumps(item, ensure_ascii=False)
        if any(kw in text for kw in metro_kw):
            return item
    city_kw = ["부산", "대구", "광주", "대전", "울산", "세종"]
    for item in candidates:
        text = json.dumps(item, ensure_ascii=False)
        if any(kw in text for kw in city_kw):
            return item
    startup_kw = ["창업", "소상공인", "예비창업", "초기창업"]
    for item in candidates:
        text = json.dumps(item, ensure_ascii=False)
        if any(kw in text for kw in startup_kw):
            return item
    return candidates[0]


# ═══════════════════════════════════════
# 헬퍼
# ═══════════════════════════════════════
def strip_html(html):
    return re.sub(r"<[^>]+>", "", (html or "")).replace("&nbsp;", " ").replace("☞", "- ").strip()


def get_category(code):
    c = (code or "").replace('"', "").strip()
    if "기술" in c: return "기술"
    if "인력" in c or "고용" in c: return "인력"
    if "경영" in c: return "경영"
    if "금융" in c: return "금융"
    return "공고"


def fetch_bizinfo():
    items = []
    for page in range(1, 3):
        try:
            res = requests.get(
                BIZINFO_API,
                params={"crtfcKey": BIZINFO_API_KEY, "dataType": "json", "pageUnit": 10, "pageIndex": page},
                timeout=15,
            )
            if res.ok:
                data = res.json()
                items.extend(data.get("jsonArray", []))
        except Exception as e:
            log.warning(f"Bizinfo page {page} error: {e}")
    return items


# ═══════════════════════════════════════
# 콘텐츠 생성 (Opus 기획 → Sonnet 작성)
# ═══════════════════════════════════════
def rewrite_announcement(item):
    """공고 리라이팅: Opus 기획 → Sonnet 작성."""
    raw_data = f"""공고명: {item.get('pblancNm','')}
주관: {item.get('jrsdInsttNm','')} / 수행: {item.get('excInsttNm','')}
접수: {item.get('reqstBeginEndDe','')} / 분야: {item.get('pldirSportRealmLclasCodeNm','')}
요약: {strip_html(item.get('bsnsSumryCn',''))}"""

    # Step 1: Opus 기획
    plan = claude_call("opus", f"""정책자금 공고 리라이팅 기획. 아래 공고의 핵심을 분석하세요.

{raw_data}

JSON 출력: {{"target":"핵심 지원대상(30자)","amount":"지원금액/한도","period":"신청기간","key_points":["핵심포인트1","핵심포인트2","핵심포인트3"],"title_suggestion":"제안 제목(40자 이내, '정책자금/지원금/융자/저금리' 등 검색 키워드 1~2개 자연 포함)","tags":"태그 5개(쉼표 구분)"}}""")

    # Step 2: Sonnet 작성
    plan_str = json.dumps(plan, ensure_ascii=False) if isinstance(plan, dict) else str(plan)
    content = claude_call("sonnet", f"""기업정책자금센터 정책자금 에디터. Opus가 기획한 방향에 따라 리라이팅하세요.

■ 원본 공고
{raw_data}

■ Opus 기획
{plan_str}

■ 작성 규칙
- 제목 40자 이내, "정책자금/지원금/융자/저금리" 중 1~2개 자연 포함
- 요약 120~150자 (검색 스니펫용 — 지원대상·금액·기간 핵심 3요소 압축, "중소기업 정책자금" 등 검색어 자연 포함)
- 본문 JSON: h2/p/ul/info-box 블록
- 순서: 사업개요→지원대상→지원내용→신청방법
- "기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원"
- 금지: "대행","신청대행","KPEC", 대표자 실명·전화번호

■ 출력 JSON (이것만 출력)
{{"title":"(40자 이내, 검색 키워드 포함)","summary":"(120~150자, 검색 스니펫용)","content":[{{"type":"h2","text":"..."}},{{"type":"p","text":"..."}},{{"type":"ul","items":["..."]}},...{{"type":"info-box","text":"..."}}],"tags":"..."}}

content에 최소 h2 2개, p 2개, info-box 1개 포함. 최소 6블록.""")

    return content


def create_news(rag_context, new_count):
    """뉴스 큐레이션: Opus 기획 → Sonnet 작성."""
    today = datetime.now().strftime("%Y-%m-%d")

    # Step 1: Opus 기획
    plan = claude_call("opus", f"""[{today}] 정책자금 뉴스 큐레이션 기획.

아래 공고 데이터에서 카드형 큐레이션 방향을 기획하세요.
{rag_context}

JSON 출력: {{"theme":"큐레이션 테마(20자)","title_suggestion":"제안 제목(40자, '정책자금/중소기업/지원사업' 등 검색 키워드 1~2개 포함)","selected_ids":["선택 공고 ID 3~5개"],"angle":"큐레이션 관점","category_mix":"카테고리 구성"}}""")

    # Step 2: Sonnet 작성
    plan_str = json.dumps(plan, ensure_ascii=False) if isinstance(plan, dict) else str(plan)
    content = claude_call("sonnet", f"""[현재 날짜: {today}] 정책자금 공고 카드형 큐레이션 작성.

■ 역할: 기업정책자금센터 소속 정책자금 큐레이터.

■ Opus 기획
{plan_str}

■ 핵심 원칙
1. 아래 <data>의 실제 공고 데이터만 사용. 데이터에 없는 공고명·날짜·금액 절대 생성 금지.
2. 불확실한 수치는 "(확인 필요)" 표기.
3. 기준연도: 2026년.

■ 실제 공고 데이터
{rag_context}

■ 큐레이션 방향
- 오늘 신규 {new_count}건 포함 최근 공고를 큐레이션
- 각 공고별 수혜 업종 및 대상을 명시
- "이런 기업이라면 챙겨보세요" 관점

■ 출력 JSON
{{"title":"(40자, 검색 키워드 '정책자금/중소기업/지원사업' 중 1~2개 포함)","summary":"(120~150자, 검색 스니펫용. '정책자금 공고·큐레이션' 등 검색어 자연 포함, 이번 달 핵심 2~3개 사업 압축 소개)","content":[
  {{"type":"h2","text":"섹션 제목"}},
  {{"type":"p","text":"도입부"}},
  {{"type":"card","id":"data의 id필드 그대로(PBLN_...)","title":"사업명(data의 n필드 그대로)","category":"(창업|혁신|수출|녹색|디지털|고용|지역|금융|기타)","target":"지원대상(30자)","amount":"지원금액","deadline":"접수기간(data의 p필드)","summary":"핵심 2~3문장 + 수혜업종/대상 명시(80~150자)","tags":"태그"}},
  {{"type":"info-box","text":"각 공고의 세부 요건은 기업정책자금센터 공고 페이지에서 확인하세요."}}
],"tags":"전체태그"}}

card 3~5개, category 2종류 이상. 1 card = 1 사업.
금지: 대행, 신청대행, 원스톱, 무료상담, 실명, 전화번호, URL, KPEC.""")

    return content


def create_analysis(rag_data, target_title):
    """분석 리포트: Opus 기획 → Sonnet 작성."""
    today = datetime.now().strftime("%Y-%m-%d")

    # Step 1: Opus 기획
    plan = claude_call("opus", f"""[{today}] 정책자금 분석 리포트 기획.

아래 공고를 심층 분석 리포트로 작성하기 위한 기획을 수립하세요.
{rag_data}

JSON 출력: {{"key_insight":"핵심 인사이트(50자)","kpi_metrics":["KPI 지표 5개"],"comparison_axes":["비교축 3개"],"target_industries":["적합 업종 3~5개"],"risk_points":["주의사항 2~3개"],"title_suggestion":"리포트 제목(50자, '정책자금 분석/전망/비교/신청전략' 등 검색 키워드 1~2개 자연 포함)"}}""")

    # Step 2: Sonnet 작성
    plan_str = json.dumps(plan, ensure_ascii=False) if isinstance(plan, dict) else str(plan)
    content = claude_call("sonnet", f"""[현재 날짜: {today}] [기준연도: 2026]

■ 역할: 기업정책자금센터 수석 정책자금 애널리스트. 객관적 분석 보고서 톤.

■ Opus 기획
{plan_str}

■ 분석 대상 (실제 공고 데이터)
{rag_data}

위 데이터의 사실만 사용. 확인 불가 수치는 "(추정)" 또는 "(공고 원문 확인 필요)" 표기.

■ 분석 포인트
1. 핵심 — 무엇을, 누구에게, 얼마를 지원하는가
2. 수혜 대상 — 업종·규모·업력 3축 분석
3. 지원 조건 비교 — 트랙별 금액, 금리, 보증비율
4. 신청 전략 — 서류 준비, 가점 항목, 흔한 실수
5. 종합 판단 — 강점/약점, 맞지 않는 기업

■ 리포트 구조
섹션1: h2(공고명 포함) + chart-data(chartType:"table", KPI 5개, 비수치는 value:0+name에 텍스트)
섹션2: h2 + p(업종/규모/업력 3축 분석) + chart-data(chartType:"compare", 적합도 0~100)
섹션3: h2 + chart-data(chartType:"bar", 지원한도 비교) + info-box("이런 기업에 유리")
섹션4: h2 + ul(items 배열, 체크리스트 5~7개) + info-box(신청 전략 팁)
섹션5: h2 + p(강점약점) + p(맞지 않는 기업)

■ JSON: {{"title":"(50자, 검색 키워드 '정책자금 분석/전망/비교/신청전략' 중 1~2개 포함)","summary":"(120~150자, 검색 스니펫용. 핵심 인사이트 + 지원대상 + 시사점을 압축. '정책자금 분석/리포트' 등 검색어 자연 포함)","content":[...],"tags":"(5개)"}}
content 5종만: h2{{type,text}}, p{{type,text}}, ul{{type,items:[string]}}, info-box{{type,text}}, chart-data{{type,chartType,title,data:[{{name,value:number}}]}}
chart-data value는 반드시 숫자. null/문자열 금지.
h2 4~5개, chart-data 최소 3개. 분량 2000~3000자.
금지: 대행, 신청대행, 15년 경력, 실명, 전화번호, URL, KPEC.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원".""")

    return content


# ═══════════════════════════════════════
# 메인 파이프라인
# ═══════════════════════════════════════
def run_pipeline():
    start_time = time.time()
    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")

    results = {"bizinfo": 0, "news": 0, "analysis": 0, "retried": 0, "errors": []}

    send_tg("start", "iMac Pipeline", f"시작 ({today_str} {today.strftime('%H:%M:%S')})")

    try:
        existing_ids = airtable_get_existing_ids()
        log.info(f"Existing IDs: {len(existing_ids)}")

        # ═══ Stage 0: 재시도 큐 처리 ═══
        retry_count = process_retry_queue(existing_ids)
        if retry_count:
            existing_ids = airtable_get_existing_ids()
            results["retried"] = retry_count

        # ═══ Stage 1: 기업마당 공고 수집 + 리라이팅 (Opus→Sonnet) ═══
        new_items = []
        try:
            log.info("Stage 1: Bizinfo fetch + Claude rewrite (Opus→Sonnet)")
            all_items = fetch_bizinfo()
            log.info(f"Bizinfo: {len(all_items)} items fetched")

            new_items = [it for it in all_items if it.get("pblancId") not in existing_ids]
            log.info(f"New items: {len(new_items)}")

            for item in new_items:
                pid = item.get("pblancId", "unknown")
                try:
                    t0 = time.time()
                    rewritten = rewrite_announcement(item)

                    content_blocks = rewritten.get("content", [])
                    valid_blocks = [b for b in content_blocks if isinstance(b, dict) and b.get("type")]
                    if len(valid_blocks) < 4:
                        raise ValueError(f"콘텐츠 부실: {len(valid_blocks)} blocks")

                    elapsed = time.time() - t0

                    content_key = f"posts/{pid}.json"
                    content_url = r2_upload(content_key, json.dumps(content_blocks, ensure_ascii=False))

                    cache_announcement(pid, {
                        **rewritten,
                        "pblancId": pid,
                        "source": item.get("jrsdInsttNm", ""),
                        "applyPeriod": item.get("reqstBeginEndDe", ""),
                        "originalTitle": item.get("pblancNm", ""),
                        "category": get_category(item.get("pldirSportRealmLclasCodeNm", "")),
                    })

                    at_fields = {
                        "pblancId": pid,
                        "title": rewritten.get("title", ""),
                        "originalTitle": item.get("pblancNm", ""),
                        "summary": rewritten.get("summary", ""),
                        "contentUrl": content_url,
                        "category": get_category(item.get("pldirSportRealmLclasCodeNm", "")),
                        "source": item.get("jrsdInsttNm", ""),
                        "applyPeriod": item.get("reqstBeginEndDe", ""),
                        "originalUrl": item.get("pblancUrl", ""),
                        "publishDate": item.get("creatPnttm", "")[:10],
                        "status": "리라이팅완료",
                        "tags": rewritten.get("tags", ""),
                    }
                    try:
                        airtable_create(at_fields)
                    except Exception as ate:
                        add_to_retry_queue(pid, at_fields, ate)
                        raise

                    results["bizinfo"] += 1
                    send_tg("success", "공고", f"{pid} 완료 ({elapsed:.1f}s)")
                except Exception as e:
                    results["errors"].append(f"{pid}: {e}")
                    send_tg("error", "공고", f"{pid} 실패", str(e))

            if not new_items:
                send_tg("info", "공고", "신규 공고 없음")

        except Exception as e:
            results["errors"].append(f"Stage1: {e}")
            send_tg("error", "공고", "수집 실패", str(e))

        # ── RAG 캐시 로드 ──
        cached = load_recent_cache(max_items=20)
        log.info(f"RAG cache: {len(cached)} items")

        # ═══ Stage 2: 뉴스 큐레이션 (Opus→Sonnet) ═══
        news_used_ids = load_news_used_ids()
        unused_cached = [it for it in cached if it.get("pblancId", "") not in news_used_ids]
        log.info(f"Unused for news: {len(unused_cached)} / {len(cached)}")

        if len(unused_cached) >= 3:
            try:
                news_id = f"NEWS_AUTO_{today.strftime('%Y%m%d')}"
                if news_id not in existing_ids:
                    log.info("Stage 2: News curation (Opus→Sonnet)")
                    t0 = time.time()

                    rag_context = build_rag_context(unused_cached, max_items=5)
                    content = create_news(rag_context, len(new_items))

                    img = gemini_image(content.get("title", "정책자금 뉴스"), "news")

                    content_key = f"posts/{news_id}.json"
                    content_url = r2_upload(content_key, json.dumps(content.get("content", []), ensure_ascii=False))

                    img_url = ""
                    if img:
                        img_key = f"thumbnails/{news_id}_{int(time.time())}.png"
                        img_url = r2_upload(img_key, img, "image/png")

                    airtable_create({
                        "pblancId": news_id,
                        "title": content.get("title", ""),
                        "originalTitle": "정책자금 뉴스 큐레이션",
                        "summary": content.get("summary", ""),
                        "contentUrl": content_url,
                        "category": "뉴스",
                        "source": "기업정책자금센터",
                        "applyPeriod": "",
                        "originalUrl": img_url,
                        "publishDate": today_str,
                        "status": "게시중",
                        "tags": content.get("tags", ""),
                    })

                    used_pids = [it.get("pblancId") for it in unused_cached[:5] if it.get("pblancId")]
                    save_news_used_ids(used_pids)

                    elapsed = time.time() - t0
                    results["news"] = 1
                    send_tg("success", "뉴스", f'"{content.get("title","")}" 게시 ({elapsed:.1f}s)\n사용 공고: {len(used_pids)}건')
            except Exception as e:
                results["errors"].append(f"Stage2: {e}")
                send_tg("error", "뉴스", "생성 실패", traceback.format_exc()[:500])
        else:
            send_tg("info", "뉴스", f"미사용 공고 {len(unused_cached)}건 (최소 3건 필요) → 패스")

        # ═══ Stage 3: 분석 리포트 (Opus→Sonnet) ═══
        try:
            analysis_id = f"ANALYSIS_AUTO_{today.strftime('%Y%m%d')}"
            if analysis_id not in existing_ids and len(cached) > 0:
                log.info("Stage 3: Analysis report (Opus→Sonnet)")
                t0 = time.time()

                analyzed_ids = load_analyzed_ids()
                target = select_analysis_target(cached, analyzed_ids)

                if target:
                    target_pid = target.get("pblancId", "unknown")
                    target_title = target.get("title", target.get("originalTitle", ""))
                    log.info(f"Analysis target: {target_pid} - {target_title}")

                    rag_data = build_analysis_rag(target)
                    content = create_analysis(rag_data, target_title)

                    img = gemini_image(content.get("title", target_title), "analysis")

                    content_key = f"posts/{analysis_id}.json"
                    content_url = r2_upload(content_key, json.dumps(content.get("content", []), ensure_ascii=False))

                    img_url = ""
                    if img:
                        img_key = f"thumbnails/{analysis_id}_{int(time.time())}.png"
                        img_url = r2_upload(img_key, img, "image/png")

                    airtable_create({
                        "pblancId": analysis_id,
                        "title": content.get("title", ""),
                        "originalTitle": target_title,
                        "summary": content.get("summary", ""),
                        "contentUrl": content_url,
                        "category": "분석",
                        "source": "기업정책자금센터",
                        "applyPeriod": target.get("applyPeriod", ""),
                        "originalUrl": img_url,
                        "publishDate": today_str,
                        "status": "게시중",
                        "tags": content.get("tags", ""),
                    })

                    save_analyzed_id(target_pid)
                    elapsed = time.time() - t0
                    results["analysis"] = 1
                    send_tg("success", "분석", f'"{content.get("title","")}" 게시 ({elapsed:.1f}s)\n대상: {target_pid}')
                else:
                    send_tg("info", "분석", "분석 가능한 미분석 공고 없음")
            elif len(cached) == 0:
                send_tg("info", "분석", "RAG 캐시 없음 → 패스")
        except Exception as e:
            results["errors"].append(f"Stage3: {e}")
            send_tg("error", "분석", "생성 실패", traceback.format_exc()[:500])

        # ── 요약 ──
        total_time = time.time() - start_time
        parts = [
            f"공고: {results['bizinfo']}건" if results['bizinfo'] else "공고: 신규없음",
            f"뉴스: {results['news']}건",
            f"분석: {results['analysis']}건",
            f"RAG캐시: {len(cached)}건",
            f"소요: {total_time:.0f}초",
        ]
        if results["retried"]:
            parts.append(f"재시도성공: {results['retried']}건")
        if results["errors"]:
            parts.append(f"오류: {len(results['errors'])}건")
        send_tg("info", "파이프라인 요약", " | ".join(parts))

        if results["errors"]:
            err_detail = "\n".join(f"  - {e[:100]}" for e in results["errors"][:5])
            send_tg("error", "오류 상세", err_detail)

    except Exception as e:
        send_tg("error", "파이프라인", "전체 실패", traceback.format_exc()[:500])
        raise

    log.info(f"=== Pipeline DONE ({time.time()-start_time:.0f}s) ===")

    # Stage 4: 콘텐츠 품질 점검 (Opus 검수 → Sonnet 개선)
    try:
        from audit_content import run_audit
        log.info("Stage 4: Content audit (Opus review → Sonnet fix)")
        run_audit()
    except Exception as e:
        log.warning(f"Audit error: {e}")
        send_tg("error", "콘텐츠 점검", f"실패: {e}")

    return results


if __name__ == "__main__":
    run_pipeline()

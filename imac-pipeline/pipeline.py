#!/usr/bin/env python3
"""기업정책자금센터 콘텐츠 파이프라인 (iMac 전용)
Codex CLI (GPT-5.5, reasoning effort high=기획/검수, low=작성/개선) + Codex Images 2.0 (gpt-image-2) + R2/D1 저장

파이프라인 흐름:
  Stage 1: 기업마당 공고 수집 + 리라이팅 (high 기획 → low 작성)
  Stage 2: 정책자금 뉴스 큐레이션 (high 기획 → low 작성)
  Stage 3: 정책자금 분석 (high 기획 → low 작성)
  Stage 4: 콘텐츠 점검 (high 검수 → low 개선)
"""
import os, json, re, time, traceback, logging, subprocess
from base64 import b64decode
from datetime import datetime, timedelta
from pathlib import Path

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

# Gemini 이미지 회귀 (Codex image_generation server-side 차단 대응, 2026-05-02~)
USE_GEMINI = os.environ.get("USE_GEMINI", "false").lower() in ("true", "1", "yes")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL_IMAGE = os.environ.get("GEMINI_MODEL_IMAGE", "gemini-3.1-flash-image-preview")
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do"
CODEX_BIN = "/usr/local/bin/codex"
CODEX_ENV_OVERRIDES = {
    "PATH": "/usr/local/bin:/usr/bin:/bin",
    "HOME": os.environ.get("HOME", "/Users/pola"),
}

# Cloudflare D1 (단일 SoT, Airtable 제거 완료)
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
# Codex CLI (ChatGPT Plus/Pro 인증, GPT-5.5)
# ═══════════════════════════════════════
def codex_call(effort, prompt, json_mode=True, max_retries=2):
    """Codex CLI로 텍스트 생성. effort: 'high'(기획/검수, 깊은 추론) 또는 'low'(작성/개선, 빠른 응답)."""
    if json_mode:
        prompt += "\n\n[출력 규칙] 반드시 유효한 JSON만 출력하세요. 마크다운 코드펜스(```)나 설명 텍스트 없이 순수 JSON만 출력."

    env = {**os.environ, **CODEX_ENV_OVERRIDES}

    for attempt in range(max_retries + 1):
        out_file = f"/tmp/codex_{os.getpid()}_{attempt}_{int(time.time()*1000)}.txt"
        try:
            result = subprocess.run(
                [
                    CODEX_BIN, "exec",
                    "--skip-git-repo-check",
                    "--ephemeral",
                    "-c", f"reasoning.effort={effort}",
                    "-o", out_file,
                    prompt,
                ],
                capture_output=True, text=True, timeout=420, env=env,
            )
            if result.returncode != 0:
                raise RuntimeError(f"Codex CLI error (rc={result.returncode}): {result.stderr[:200]}")

            try:
                with open(out_file, "r", encoding="utf-8") as f:
                    raw = f.read().strip()
            finally:
                try:
                    os.remove(out_file)
                except OSError:
                    pass

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
            log.warning(f"Codex {effort} timeout (attempt {attempt+1})")
            if attempt < max_retries:
                time.sleep(5)
                continue
            raise
        except json.JSONDecodeError as e:
            log.warning(f"Codex {effort} JSON parse error (attempt {attempt+1}): {e}")
            if attempt < max_retries:
                time.sleep(3)
                continue
            raise
        except Exception:
            if attempt < max_retries:
                time.sleep(3 * (attempt + 1))
                continue
            raise


# ═══════════════════════════════════════
# Gemini Nano Banana 2 (gemini-3.1-flash-image-preview, 썸네일 전용)
# Codex image_generation이 server-side 차단(2026-05-02~)되어 회귀.
# 롤백: USE_GEMINI=false → codex_image 분기로 복귀.
# ═══════════════════════════════════════
def gemini_image(title, context="news"):
    """Gemini API로 썸네일 생성. PNG bytes 반환 또는 실패 시 None."""
    scenes = {
        "news": "Korean business professionals in their 30s-40s reviewing printed documents at a clean wooden desk in a bright modern Seoul office. Warm natural daylight from large windows. Shallow depth of field.",
        "analysis": "A focused Korean business analyst in their 30s-40s working with paper charts and graphs on a minimalist white desk in a Seoul office. Soft overhead lighting, glass partitions in background. No screens visible.",
    }
    scene = scenes.get(context, scenes["news"])
    prompt = (
        f'Photorealistic editorial photograph for article: "{title}". '
        f"Scene: {scene}. Style: 35mm lens, natural lighting, editorial lifestyle photography, high detail, natural skin tones. "
        "16:9 landscape composition. All people must be Korean adults. Korean office setting in South Korea. "
        "STRICT RESTRICTIONS: NO flags. NO text/letters in any language. NO logos, watermarks, signs. "
        "NO laptop/smartphone/tablet screens visible from viewer side. NO national symbols. "
        "Focus on hands, documents, office materials. Realistic photography only."
    )
    if not GEMINI_API_KEY:
        log.error("GEMINI_API_KEY not configured")
        send_tg("error", "이미지", f"{context} 썸네일 생성 실패", "GEMINI_API_KEY 없음")
        return None
    url = f"{GEMINI_BASE}/{GEMINI_MODEL_IMAGE}:generateContent?key={GEMINI_API_KEY}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    last_reason = "unknown"
    for attempt in range(2):
        try:
            res = requests.post(url, json=body, timeout=90)
            if not res.ok:
                last_reason = f"HTTP {res.status_code}: {res.text[:200]}"
                log.warning(f"Gemini image attempt {attempt+1}: {last_reason}")
                time.sleep(3)
                continue
            data = res.json()
            parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            for p in parts:
                inline = p.get("inlineData") or p.get("inline_data")
                if inline and inline.get("mimeType", inline.get("mime_type", "")).startswith("image/"):
                    img_bytes = b64decode(inline["data"])
                    if len(img_bytes) >= 10240:
                        return img_bytes
                    last_reason = f"too small ({len(img_bytes)} bytes)"
            last_reason = "no inlineData in response"
            log.warning(f"Gemini image attempt {attempt+1}: {last_reason}")
        except Exception as e:
            last_reason = f"exception: {e}"
            log.warning(f"Gemini image attempt {attempt+1}: {last_reason}")
        time.sleep(3)

    send_tg("error", "이미지", f"{context} 썸네일 생성 실패", f"제목: {title}\n원인: {last_reason}\n모델: {GEMINI_MODEL_IMAGE}")
    return None


# ═══════════════════════════════════════
# Codex Images 2.0 (gpt-image-2, 썸네일 전용)
# 2026-05-02~ server-side 차단 — USE_GEMINI=true 시 gemini_image()로 위임.
# ═══════════════════════════════════════
def codex_image(title, context="news", max_retries=1):
    """Codex CLI image_generation으로 썸네일 생성. PNG bytes 반환 또는 실패 시 None.
    실패 시 최대 max_retries회 재시도하고, 최종 실패하면 텔레그램 경고 발송."""
    if USE_GEMINI:
        return gemini_image(title, context)
    scenes = {
        "news": "Korean business professionals in their 30s-40s reviewing printed documents at a clean wooden desk in a bright modern Seoul office. Warm natural daylight from large windows. Shallow depth of field.",
        "analysis": "A focused Korean business analyst in their 30s-40s working with paper charts and graphs on a minimalist white desk in a Seoul office. Soft overhead lighting, glass partitions in background. No screens visible.",
    }
    scene = scenes.get(context, scenes["news"])

    env = {**os.environ, **CODEX_ENV_OVERRIDES}
    last_reason = "unknown"
    generated_dir = Path.home() / ".codex" / "generated_images"

    def _list_pngs():
        if not generated_dir.exists():
            return set()
        return {p for p in generated_dir.rglob("*.png")}

    for attempt in range(max_retries + 1):
        out_path = f"/tmp/codex_img_{os.getpid()}_{attempt}_{int(time.time()*1000)}.png"
        before = _list_pngs()

        image_prompt = (
            f"Photorealistic editorial photograph for the article titled \"{title}\". "
            f"{scene} "
            "Style: 35mm lens, natural lighting, editorial lifestyle photography, high detail, natural skin tones. "
            "16:9 landscape composition. All people must be Korean adults. Korean office setting in South Korea. "
            "No text, no logos, no signage, no Korean letters, no English letters, no flags, "
            "no national symbols, no laptop/smartphone/tablet screens visible from viewer side. "
            "Focus on hands, documents, office materials. Realistic photography only."
        )
        # Codex 0.125+ code_mode_only: 모든 tool 호출은 js_repl 내부 codex.tool()로만 가능.
        # image_generation 결과는 result.path 등에 저장된 임시 PNG 경로를 반환하므로 fs.copyFileSync로 옮긴다.
        js_safe_prompt = image_prompt.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$")
        prompt = (
            "Use js_repl to run this code:\n\n"
            "```js\n"
            "const result = await codex.tool('image_generation', {\n"
            f"  prompt: `{js_safe_prompt}`,\n"
            "  size: '1536x1024',\n"
            "});\n"
            "console.log('image_generation result:', JSON.stringify(result));\n"
            "const fs = require('fs');\n"
            "const path = require('path');\n"
            f"const dest = '{out_path}';\n"
            "// result may contain {path} or {file_path} or {image_path} or array of those\n"
            "function pickPath(r) {\n"
            "  if (!r) return null;\n"
            "  if (typeof r === 'string') return r;\n"
            "  if (r.path) return r.path;\n"
            "  if (r.file_path) return r.file_path;\n"
            "  if (r.image_path) return r.image_path;\n"
            "  if (Array.isArray(r) && r.length) return pickPath(r[0]);\n"
            "  if (r.images && r.images.length) return pickPath(r.images[0]);\n"
            "  if (r.output && r.output.length) return pickPath(r.output[0]);\n"
            "  return null;\n"
            "}\n"
            "const src = pickPath(result);\n"
            "if (!src) { console.log('NO_PATH_FOUND'); }\n"
            "else if (!fs.existsSync(src)) { console.log('SRC_MISSING:' + src); }\n"
            "else {\n"
            "  fs.copyFileSync(src, dest);\n"
            "  console.log('SAVED:' + dest + ':' + fs.statSync(dest).size);\n"
            "}\n"
            "```\n"
        )

        try:
            result = subprocess.run(
                [
                    CODEX_BIN, "exec",
                    "--sandbox", "danger-full-access",
                    "--skip-git-repo-check",
                    "--ephemeral",
                    "--model", "gpt-5.5",
                    prompt,
                ],
                capture_output=True, text=True, timeout=300, env=env,
            )
            if result.returncode != 0:
                last_reason = f"rc={result.returncode}: {result.stderr[:200]}"
                log.warning(f"Codex image attempt {attempt+1} {last_reason}")
                continue

            # 1) 우선 우리가 요청한 경로 시도
            candidate = None
            if os.path.exists(out_path):
                candidate = Path(out_path)
            else:
                # 2) Codex generated_images에서 새 PNG 찾기 (Codex 0.125+ 표준 경로)
                after = _list_pngs()
                new_files = after - before
                if new_files:
                    candidate = max(new_files, key=lambda p: p.stat().st_mtime)
                    log.info(f"Codex image found in generated_images: {candidate}")

            if not candidate:
                last_reason = f"no PNG found (tried {out_path} and {generated_dir})"
                log.warning(f"Codex image attempt {attempt+1}: {last_reason}")
                continue

            size = candidate.stat().st_size
            if size < 10240:
                last_reason = f"too small ({size} bytes) at {candidate}"
                log.warning(f"Codex image attempt {attempt+1}: {last_reason}")
                continue

            with open(candidate, "rb") as f:
                data = f.read()
            # 우리가 만든 임시 파일이면 삭제. generated_images의 파일은 보존.
            if str(candidate) == out_path:
                try: candidate.unlink()
                except OSError: pass
            return data
        except subprocess.TimeoutExpired:
            last_reason = "timeout (300s)"
            log.warning(f"Codex image attempt {attempt+1}: {last_reason}")
            continue
        except Exception as e:
            last_reason = f"exception: {e}"
            log.warning(f"Codex image attempt {attempt+1}: {last_reason}")
            continue

    send_tg("error", "이미지", f"{context} 썸네일 생성 실패", f"제목: {title}\n원인: {last_reason}\n재시도: {max_retries+1}회 모두 실패")
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


# ═══════════════════════════════════════
# 콘텐츠 검증·정제 (할루시네이션 방지)
# ═══════════════════════════════════════
CHART_BAD_PATTERNS = ("해당 없음", "확인 필요", "미정", "정보 없음", "N/A", "공고 원문", "별도 확인")


def classify_funding_type(rag_text, original_title=""):
    """공고 텍스트에서 자금 성격 분류.
    반환: 'loan' | 'guarantee' | 'rnd' | 'grant' | 'cert' | 'mixed'
    R&D 보조금에 융자 차트를 강제하던 할루시네이션을 막기 위해 사용.
    """
    text = (rag_text or "") + " " + (original_title or "")

    rnd_kw = ("기술개발", "연구개발", "R&D", "과제당", "출연금", "기술혁신", "사업화", "기술료")
    loan_kw = ("융자", "대출", "여신", "이자율", "금리", "상환기간", "거치기간", "운전자금", "시설자금")
    guarantee_kw = ("신용보증", "기술보증", "보증료", "보증비율", "보증한도", "특례보증")
    grant_kw = ("보조금", "지원율", "매칭", "수수료 지원", "바우처", "참가비 지원")
    cert_kw = ("벤처기업", "이노비즈", "메인비즈", "ISO 인증", "지정 절차", "확인서 발급")

    counts = {
        "rnd": sum(1 for k in rnd_kw if k in text),
        "loan": sum(1 for k in loan_kw if k in text),
        "guarantee": sum(1 for k in guarantee_kw if k in text),
        "grant": sum(1 for k in grant_kw if k in text),
        "cert": sum(1 for k in cert_kw if k in text),
    }

    if counts["rnd"] >= 2:
        return "rnd"
    if counts["guarantee"] >= 2:
        return "guarantee"
    if counts["loan"] >= 2:
        return "loan"

    top = max(counts, key=counts.get)
    if counts[top] == 0:
        return "mixed"
    return top


FUNDING_TYPE_AXES = {
    "loan": "트랙별 한도(억원), 적용 금리(%), 보증비율(%), 거치/상환기간(개월)",
    "guarantee": "보증한도(억원), 보증비율(%), 보증료율(%), 운용기간(개월)",
    "rnd": "과제당 지원금(만원), 총사업비(억원), 정부지원율(%), 연구개발기간(개월)",
    "grant": "지원금(만원), 정부지원율(%), 자부담율(%), 집행기간(개월)",
    "cert": "유효기간(년), 신청수수료(만원), 갱신주기(년), 평균 심사기간(일)",
    "mixed": "공고에서 비교 가능한 핵심 정량지표 3~5개 (단위 통일 필수)",
}


def sanitize_chart_data(blocks):
    """차트 데이터에서 할루시네이션 항목 제거.

    - value=0 + name에 부정 키워드("해당 없음" 등) 포함 → 항목 제거
    - bar 차트 정리 후 데이터 2개 미만이면 차트 블록 자체 제거
    - table/compare는 1개 이상 남으면 유지(설명 정보로 의미 있을 수 있음)
    - 차트 제거된 자리에는 정보 손실을 알리는 info-box로 대체하지 않음(잡음 방지)
    """
    if not isinstance(blocks, list):
        return blocks

    out = []
    for b in blocks:
        if not isinstance(b, dict):
            out.append(b)
            continue

        if b.get("type") != "chart-data" or not isinstance(b.get("data"), list):
            out.append(b)
            continue

        cleaned = []
        for d in b["data"]:
            if not isinstance(d, dict):
                continue
            name = str(d.get("name", ""))
            try:
                value = float(d.get("value", 0))
            except (TypeError, ValueError):
                value = 0
            if value == 0 and any(p in name for p in CHART_BAD_PATTERNS):
                continue
            cleaned.append(d)

        chart_type = b.get("chartType", "bar")
        min_required = 2 if chart_type == "bar" else 1
        if len(cleaned) < min_required:
            log.info(f"[sanitize] chart-data 제거 (chartType={chart_type}, 유효 {len(cleaned)}개)")
            continue

        new_block = dict(b)
        new_block["data"] = cleaned
        out.append(new_block)

    return out


def d1_create(fields):
    """notices INSERT OR IGNORE. fields는 dict (camelCase 키)."""
    if not D1_API_BASE:
        log.error("D1 API base not configured")
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


def d1_update_image(pblanc_id, original_url):
    """notices UPDATE original_url WHERE pblanc_id."""
    if not D1_API_BASE or not pblanc_id:
        return False
    try:
        res = requests.post(
            f"{D1_API_BASE}/raw",
            headers=D1_HEADERS,
            json={
                "sql": "UPDATE notices SET original_url = ? WHERE pblanc_id = ?",
                "params": [original_url, pblanc_id],
            },
            timeout=15,
        )
        if not res.ok:
            log.error(f"D1 update_image {res.status_code}: {res.text[:300]}")
            return False
        data = res.json()
        if not data.get("success"):
            log.error(f"D1 update_image error: {data}")
            return False
        return True
    except Exception as e:
        log.error(f"D1 update_image exception: {e}")
        return False


def notice_create(fields):
    """notices INSERT (D1 단독). 실패 시 RuntimeError raise (호출부가 retry queue로 보냄)."""
    fields = sanitize_fields(fields)
    if not d1_create(fields):
        raise RuntimeError(f"D1 insert failed for {fields.get('pblancId')}")


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
            notice_create(item["fields"])
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
# 콘텐츠 생성 (high 기획 → low 작성)
# ═══════════════════════════════════════
def rewrite_announcement(item):
    """공고 리라이팅: Codex high 기획 → low 작성."""
    raw_data = f"""공고명: {item.get('pblancNm','')}
주관: {item.get('jrsdInsttNm','')} / 수행: {item.get('excInsttNm','')}
접수: {item.get('reqstBeginEndDe','')} / 분야: {item.get('pldirSportRealmLclasCodeNm','')}
요약: {strip_html(item.get('bsnsSumryCn',''))}"""

    # Step 1: high 기획
    plan = codex_call("high", f"""정책자금 공고 리라이팅 기획. 아래 공고의 핵심을 분석하세요.

{raw_data}

JSON 출력: {{"target":"핵심 지원대상(30자)","amount":"지원금액/한도","period":"신청기간","key_points":["핵심포인트1","핵심포인트2","핵심포인트3"],"title_suggestion":"제안 제목(40자 이내, '정책자금/지원금/융자/저금리' 등 검색 키워드 1~2개 자연 포함)","tags":"태그 5개(쉼표 구분)"}}""")

    # Step 2: low 작성
    plan_str = json.dumps(plan, ensure_ascii=False) if isinstance(plan, dict) else str(plan)
    content = codex_call("low", f"""기업정책자금센터 정책자금 에디터. 기획한 방향에 따라 리라이팅하세요.

■ 원본 공고
{raw_data}

■ 기획
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
    """뉴스 큐레이션: Codex high 기획 → low 작성."""
    today = datetime.now().strftime("%Y-%m-%d")

    # Step 1: high 기획
    plan = codex_call("high", f"""[{today}] 정책자금 뉴스 큐레이션 기획.

아래 공고 데이터에서 카드형 큐레이션 방향을 기획하세요.
{rag_context}

JSON 출력: {{"theme":"큐레이션 테마(20자)","title_suggestion":"제안 제목(40자, '정책자금/중소기업/지원사업' 등 검색 키워드 1~2개 포함)","selected_ids":["선택 공고 ID 3~5개"],"angle":"큐레이션 관점","category_mix":"카테고리 구성"}}""")

    # Step 2: low 작성
    plan_str = json.dumps(plan, ensure_ascii=False) if isinstance(plan, dict) else str(plan)
    content = codex_call("low", f"""[현재 날짜: {today}] 정책자금 공고 카드형 큐레이션 작성.

■ 역할: 기업정책자금센터 소속 정책자금 큐레이터.

■ 기획
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
    """분석 리포트: Codex high 기획 → low 작성. 사업 유형별 차트 축 분기."""
    today = datetime.now().strftime("%Y-%m-%d")

    # Step 0: 사업 유형 분류 (할루시네이션 방지)
    funding_type = classify_funding_type(rag_data, target_title)
    section3_axes = FUNDING_TYPE_AXES.get(funding_type, FUNDING_TYPE_AXES["mixed"])
    log.info(f"[analysis] funding_type={funding_type}")

    # Step 1: high 기획
    plan = codex_call("high", f"""[{today}] 정책자금 분석 리포트 기획.

아래 공고를 심층 분석 리포트로 작성하기 위한 기획을 수립하세요.
판정된 자금 성격: {funding_type} (비교축은 이 성격에 맞춰 선정)
{rag_data}

JSON 출력: {{"key_insight":"핵심 인사이트(50자)","kpi_metrics":["KPI 지표 5개"],"comparison_axes":["비교축 3개"],"target_industries":["적합 업종 3~5개"],"risk_points":["주의사항 2~3개"],"title_suggestion":"리포트 제목(50자, '정책자금 분석/전망/비교/신청전략' 등 검색 키워드 1~2개 자연 포함)"}}""")

    # Step 2: low 작성
    plan_str = json.dumps(plan, ensure_ascii=False) if isinstance(plan, dict) else str(plan)
    content = codex_call("low", f"""[현재 날짜: {today}] [기준연도: 2026]

■ 역할: 기업정책자금센터 수석 정책자금 애널리스트. 객관적 분석 보고서 톤.

■ 자금 성격 (자동 판정)
funding_type = {funding_type}
→ 융자/보증/R&D/보조금/인증 중 어느 성격인가에 따라 비교축이 달라짐. 성격에 맞지 않는 항목(예: R&D 사업에 금리/보증비율)은 절대 차트에 포함하지 말 것.

■ 기획
{plan_str}

■ 분석 대상 (실제 공고 데이터)
{rag_data}

위 데이터의 사실만 사용. 확인 불가 수치는 본문 p 또는 ul에서 "공고 원문 확인 필요"로 언급. 차트에는 절대 넣지 말 것.

■ 분석 포인트
1. 핵심 — 무엇을, 누구에게, 얼마를 지원하는가
2. 수혜 대상 — 업종·규모·업력 3축 분석
3. 지원 조건 비교 — funding_type에 맞는 정량 비교
4. 신청 전략 — 서류 준비, 가점 항목, 흔한 실수
5. 종합 판단 — 강점/약점, 맞지 않는 기업

■ 리포트 구조
섹션1: h2(공고명 포함) + chart-data(chartType:"table", KPI 4~5개. 정량 수치만. 정성 항목은 본문 p로)
섹션2: h2 + p(업종/규모/업력 3축 분석) + chart-data(chartType:"compare", 적합도 0~100)
섹션3: h2 + chart-data(chartType:"bar", 비교축: {section3_axes}) + info-box("이런 기업에 유리")
   ※ 위 비교축 중 공고에서 확인 불가능한 항목은 차트에서 제외하고, 남은 것만으로 차트 구성
   ※ 유효 항목이 2개 미만이면 차트 대신 ul로 작성
섹션4: h2 + ul(items 배열, 체크리스트 5~7개) + info-box(신청 전략 팁)
섹션5: h2 + p(강점약점) + p(맞지 않는 기업)

■ 차트 데이터 룰 (엄수)
- data 배열은 검증된 정량 수치만 포함. 단위는 title 또는 name 끝에 표기 (예: "한도(억원)", "지원율(%)")
- 값을 모르는 항목은 차트에 넣지 말고 본문 p/ul에서 "공고 원문 확인 필요"로 언급
- name에 "해당 없음", "확인 필요", "미정", "별도 확인" 등 부정 표현 금지
- 비수치를 value:0으로 채우는 패턴 금지 (할루시네이션 패턴)
- bar/compare 차트는 최소 3개 유효 수치. 그보다 적으면 ul로 대체
- value는 비교 가능한 동일 단위 사용

■ JSON: {{"title":"(50자, 검색 키워드 '정책자금 분석/전망/비교/신청전략' 중 1~2개 포함)","summary":"(120~150자, 검색 스니펫용. 핵심 인사이트 + 지원대상 + 시사점을 압축. '정책자금 분석/리포트' 등 검색어 자연 포함)","content":[...],"tags":"(5개)"}}
content 5종만: h2{{type,text}}, p{{type,text}}, ul{{type,items:[string]}}, info-box{{type,text}}, chart-data{{type,chartType,title,data:[{{name,value:number}}]}}
chart-data value는 반드시 숫자. null/문자열 금지.
h2 4~5개, chart-data 2~3개(데이터 부족 시 ul로 대체 가능). 분량 2000~3000자.
금지: 대행, 신청대행, 15년 경력, 실명, 전화번호, URL, KPEC.
"기업평가"→"현황분석", "서류작성대행"→"서류 준비 지원".""")

    # Step 3: 차트 데이터 검증·정제 (할루시네이션 차단)
    if isinstance(content, dict) and isinstance(content.get("content"), list):
        before = len(content["content"])
        content["content"] = sanitize_chart_data(content["content"])
        after = len(content["content"])
        if before != after:
            log.info(f"[analysis] sanitize 후 블록 {before}→{after}")

    return content


# ═══════════════════════════════════════
# 메인 파이프라인
# ═══════════════════════════════════════
def run_pipeline():
    start_time = time.time()
    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")

    results = {"bizinfo": 0, "news": 0, "analysis": 0, "retried": 0, "images_ok": 0, "images_fail": 0, "errors": []}

    send_tg("start", "iMac Pipeline", f"시작 ({today_str} {today.strftime('%H:%M:%S')})")

    try:
        existing_ids = d1_get_existing_ids()
        log.info(f"Existing IDs: {len(existing_ids)}")

        # ═══ Stage 0: 재시도 큐 처리 ═══
        retry_count = process_retry_queue(existing_ids)
        if retry_count:
            existing_ids = d1_get_existing_ids()
            results["retried"] = retry_count

        # ═══ Stage 1: 기업마당 공고 수집 + 리라이팅 (high→low) ═══
        new_items = []
        try:
            log.info("Stage 1: Bizinfo fetch + Codex rewrite (high→low)")
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
                        notice_create(at_fields)
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

        # ═══ Stage 2: 뉴스 큐레이션 (high→low) ═══
        news_used_ids = load_news_used_ids()
        unused_cached = [it for it in cached if it.get("pblancId", "") not in news_used_ids]
        log.info(f"Unused for news: {len(unused_cached)} / {len(cached)}")

        if len(unused_cached) >= 3:
            try:
                news_id = f"NEWS_AUTO_{today.strftime('%Y%m%d')}"
                if news_id not in existing_ids:
                    log.info("Stage 2: News curation (high→low)")
                    t0 = time.time()

                    rag_context = build_rag_context(unused_cached, max_items=5)
                    content = create_news(rag_context, len(new_items))

                    img = codex_image(content.get("title", "정책자금 뉴스"), "news")

                    content_key = f"posts/{news_id}.json"
                    content_url = r2_upload(content_key, json.dumps(content.get("content", []), ensure_ascii=False))

                    img_url = ""
                    if img:
                        img_key = f"thumbnails/{news_id}_{int(time.time())}.png"
                        img_url = r2_upload(img_key, img, "image/png")
                        results["images_ok"] += 1
                    else:
                        results["images_fail"] += 1

                    notice_create({
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

        # ═══ Stage 3: 분석 리포트 (high→low) ═══
        try:
            analysis_id = f"ANALYSIS_AUTO_{today.strftime('%Y%m%d')}"
            if analysis_id not in existing_ids and len(cached) > 0:
                log.info("Stage 3: Analysis report (high→low)")
                t0 = time.time()

                analyzed_ids = load_analyzed_ids()
                target = select_analysis_target(cached, analyzed_ids)

                if target:
                    target_pid = target.get("pblancId", "unknown")
                    target_title = target.get("title", target.get("originalTitle", ""))
                    log.info(f"Analysis target: {target_pid} - {target_title}")

                    rag_data = build_analysis_rag(target)
                    content = create_analysis(rag_data, target_title)

                    img = codex_image(content.get("title", target_title), "analysis")

                    content_key = f"posts/{analysis_id}.json"
                    content_url = r2_upload(content_key, json.dumps(content.get("content", []), ensure_ascii=False))

                    img_url = ""
                    if img:
                        img_key = f"thumbnails/{analysis_id}_{int(time.time())}.png"
                        img_url = r2_upload(img_key, img, "image/png")
                        results["images_ok"] += 1
                    else:
                        results["images_fail"] += 1

                    notice_create({
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
        img_total = results["images_ok"] + results["images_fail"]
        parts = [
            f"공고: {results['bizinfo']}건" if results['bizinfo'] else "공고: 신규없음",
            f"뉴스: {results['news']}건",
            f"분석: {results['analysis']}건",
            f"이미지: {results['images_ok']}/{img_total}" if img_total else "이미지: 0건",
            f"RAG캐시: {len(cached)}건",
            f"소요: {total_time:.0f}초",
        ]
        if results["retried"]:
            parts.append(f"재시도성공: {results['retried']}건")
        if results["images_fail"]:
            parts.append(f"이미지실패: {results['images_fail']}건")
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

    # Stage 4: 콘텐츠 품질 점검 (high 검수 → low 개선)
    try:
        from audit_content import run_audit
        log.info("Stage 4: Content audit (high review → low fix)")
        run_audit()
    except Exception as e:
        log.warning(f"Audit error: {e}")
        send_tg("error", "콘텐츠 점검", f"실패: {e}")

    return results


if __name__ == "__main__":
    run_pipeline()

#!/usr/bin/env python3
"""오늘 발행된 분석 글의 R2 JSON에서 할루시네이션 차트 항목 제거.

- value=0 + name에 부정 키워드 포함 → 항목 제거
- 정제 후 데이터가 너무 적은 차트 블록은 통째 제거
- 백업본은 posts/_backup/<id>_pre-sanitize_<ts>.json 으로 저장
- 사용: python sanitize_today_post.py [POST_ID]
"""
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import requests

# .env 로드: imac-pipeline/.env 우선, 없으면 프로젝트 루트 .env
HERE = Path(__file__).resolve().parent
for env_path in (HERE / ".env", HERE.parent / ".env"):
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())
        break

sys.path.insert(0, str(HERE))
from pipeline import sanitize_chart_data  # noqa: E402

import boto3  # noqa: E402

R2_ACCESS_KEY = os.environ["R2_ACCESS_KEY_ID"]
R2_SECRET_KEY = os.environ["R2_SECRET_ACCESS_KEY"]
R2_BUCKET = os.environ.get("R2_BUCKET", "kpecr2")
# 콘텐츠 fetch용 public URL: 환경변수와 실제 발행 URL이 다를 수 있어 override 허용
R2_PUBLIC_FETCH = os.environ.get(
    "R2_PUBLIC_FETCH_URL",
    "https://pub-d5cd496aa0ad4d72b720f78967753f9f.r2.dev",
)
CF_ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]

POST_ID = sys.argv[1] if len(sys.argv) > 1 else f"ANALYSIS_AUTO_{datetime.now().strftime('%Y%m%d')}"
KEY = f"posts/{POST_ID}.json"

# 1. 현재 콘텐츠 가져오기
ts_q = int(datetime.now().timestamp())
url = f"{R2_PUBLIC_FETCH}/{KEY}?t={ts_q}"
print(f"[1/4] GET {url}")
resp = requests.get(url, timeout=15)
resp.raise_for_status()
blocks = resp.json()
print(f"    → {len(blocks)} blocks")

# 2. sanitize
print("[2/4] sanitize_chart_data 적용")
cleaned = sanitize_chart_data(blocks)
print(f"    → {len(cleaned)} blocks 남음")

# 변경 사항 진단
old_charts = [b for b in blocks if isinstance(b, dict) and b.get("type") == "chart-data"]
new_charts = [b for b in cleaned if isinstance(b, dict) and b.get("type") == "chart-data"]
print(f"    chart-data: {len(old_charts)}→{len(new_charts)}")
for nc in new_charts:
    title = nc.get("title", "(no title)")
    n = len(nc.get("data") or [])
    print(f"    · {title} → {n} items")

if blocks == cleaned:
    print("⚠ 변경 없음. 종료")
    sys.exit(0)

# 3. boto3 R2 client
s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{CF_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
)

# 3a. 백업
ts = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_key = f"posts/_backup/{POST_ID}_pre-sanitize_{ts}.json"
print(f"[3/4] 백업: {backup_key}")
s3.put_object(
    Bucket=R2_BUCKET,
    Key=backup_key,
    Body=json.dumps(blocks, ensure_ascii=False).encode("utf-8"),
    ContentType="application/json",
)

# 4. 정제본 덮어쓰기
print(f"[4/4] 덮어쓰기: {KEY}")
s3.put_object(
    Bucket=R2_BUCKET,
    Key=KEY,
    Body=json.dumps(cleaned, ensure_ascii=False).encode("utf-8"),
    ContentType="application/json",
)
print("✅ 완료")

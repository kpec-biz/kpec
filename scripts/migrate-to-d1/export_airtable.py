#!/usr/bin/env python3
"""KPEC Airtable → JSON 덤프 (Phase 0)

대상 테이블:
  - notices (tblqm10vZyVADXMKQ)         ~608건
  - GA4 Analytics (tbl5tWcWKXFuOhQmB)   ~5건
  - Inquiries (tblyLgaV9P5ztO8Tv)       ~1건

산출물: scripts/migrate-to-d1/dump/{table}.json
사용법:  python export_airtable.py
환경변수: AIRTABLE_PAT, AIRTABLE_BASE_ID (프로젝트 .env에서 읽음)
"""
from __future__ import annotations
import json
import os
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]   # 프로젝트 루트
DUMP_DIR = Path(__file__).resolve().parent / "dump"
DUMP_DIR.mkdir(exist_ok=True)

# .env 로드
def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"'))

load_env(ROOT / ".env")

PAT = os.environ.get("AIRTABLE_PAT") or os.environ.get("AIRTABLE_TOKEN")
BASE_ID = os.environ.get("AIRTABLE_BASE_ID")
if not PAT or not BASE_ID:
    sys.exit("[export] AIRTABLE_PAT/BASE_ID 누락")

TABLES = [
    ("notices",         "tblqm10vZyVADXMKQ"),
    ("analytics_daily", "tbl5tWcWKXFuOhQmB"),
    ("inquiries",       "tblyLgaV9P5ztO8Tv"),
]

API = "https://api.airtable.com/v0"
H = {"Authorization": f"Bearer {PAT}"}


def fetch_all(table_id: str) -> list[dict]:
    records: list[dict] = []
    offset: str | None = None
    while True:
        params = {"pageSize": "100"}
        if offset:
            params["offset"] = offset
        r = requests.get(f"{API}/{BASE_ID}/{table_id}", headers=H, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        records.extend(data.get("records", []))
        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.2)  # rate limit 여유
    return records


def main() -> None:
    for label, tid in TABLES:
        print(f"[export] fetching {label} ({tid}) ...", flush=True)
        rows = fetch_all(tid)
        out = DUMP_DIR / f"{label}.json"
        out.write_text(
            json.dumps(rows, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"[export]   → {out} ({len(rows)} records)", flush=True)


if __name__ == "__main__":
    main()

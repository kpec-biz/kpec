#!/usr/bin/env python3
"""SQL 파일을 D1에 적용 (CF REST API 사용, wrangler 미인증 환경 대응)

사용법:
  python apply_to_d1.py schema   # worker/schema/0001_init.sql 적용
  python apply_to_d1.py seed     # seed/*.sql 모두 적용
  python apply_to_d1.py verify   # 테이블별 카운트 출력
  python apply_to_d1.py all      # schema + seed + verify
"""
from __future__ import annotations
import json
import os
import re
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
SEED_DIR = Path(__file__).resolve().parent / "seed"
SCHEMA_FILE = ROOT / "worker" / "schema" / "0001_init.sql"

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

ACCT = os.environ["CLOUDFLARE_ACCOUNT_ID"]
EMAIL = os.environ["CLOUDFLARE_EMAIL"]
KEY = os.environ["CLOUDFLARE_API_KEY"]
DB_NAME = "kpec"
DB_UUID = "4163afb5-2ffd-4688-9360-d8f8e3a57748"

API = f"https://api.cloudflare.com/client/v4/accounts/{ACCT}/d1/database/{DB_UUID}"
H = {"X-Auth-Email": EMAIL, "X-Auth-Key": KEY, "Content-Type": "application/json"}


def split_statements(sql: str) -> list[str]:
    """주석 제거 후 ; 단위로 statement 분리. BEGIN/COMMIT은 별도 statement로 보존."""
    # 라인 주석 제거
    sql = re.sub(r"--[^\n]*", "", sql)
    # 단순 ; split (트리거 BEGIN..END 블록 처리 위해 BEGIN..END는 한 덩어리로)
    out: list[str] = []
    buf: list[str] = []
    in_block = False
    for line in sql.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        upper = stripped.upper()
        if not in_block and re.search(r"\bBEGIN\b", upper) and "TRANSACTION" not in upper:
            in_block = True
        buf.append(line)
        if in_block:
            if upper.startswith("END;") or upper == "END":
                in_block = False
                out.append("\n".join(buf).rstrip().rstrip(";"))
                buf = []
            continue
        if stripped.endswith(";"):
            stmt = "\n".join(buf).rstrip().rstrip(";").strip()
            if stmt:
                out.append(stmt)
            buf = []
    if buf:
        leftover = "\n".join(buf).rstrip().rstrip(";").strip()
        if leftover:
            out.append(leftover)
    return [s for s in out if s]


def execute_batch(statements: list[str], chunk: int = 50) -> None:
    """statements 리스트를 chunk 단위로 D1 /query 에 보냄.
    트랜잭션 내부의 BEGIN/COMMIT은 D1이 거부하므로 제거 (D1은 자동 트랜잭션)."""
    cleaned = [s for s in statements if s.upper() not in ("BEGIN TRANSACTION", "COMMIT")]
    total = len(cleaned)
    sent = 0
    for i in range(0, total, chunk):
        batch = cleaned[i:i + chunk]
        # D1 query는 한 번에 여러 SQL을 받지 않음 → multi-statement는 ;로 결합 + raw endpoint 사용
        # raw endpoint: sql 단일 문자열 + multi statement 가능
        body = {"sql": ";\n".join(batch) + ";"}
        r = requests.post(f"{API}/raw", headers=H, json=body, timeout=120)
        try:
            data = r.json()
        except Exception:
            print(f"[error] non-JSON response: {r.status_code} {r.text[:300]}")
            sys.exit(1)
        if not data.get("success"):
            print(f"[error] chunk {i}-{i+len(batch)}:")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:1500])
            sys.exit(1)
        sent += len(batch)
        print(f"  ... {sent}/{total} statements ok")
        time.sleep(0.1)


def cmd_schema() -> None:
    print(f"[schema] applying {SCHEMA_FILE}")
    sql = SCHEMA_FILE.read_text(encoding="utf-8")
    stmts = split_statements(sql)
    print(f"[schema] {len(stmts)} statements")
    execute_batch(stmts, chunk=20)


def cmd_seed() -> None:
    for fname in ["notices.sql", "analytics_daily.sql", "inquiries.sql"]:
        path = SEED_DIR / fname
        if not path.exists():
            print(f"[seed] skip {fname} (missing)")
            continue
        print(f"[seed] applying {path}")
        stmts = split_statements(path.read_text(encoding="utf-8"))
        print(f"[seed] {len(stmts)} statements")
        execute_batch(stmts, chunk=80)


def cmd_verify() -> None:
    sql = (
        "SELECT 'notices' AS t, COUNT(*) AS n FROM notices "
        "UNION ALL SELECT 'analytics_daily', COUNT(*) FROM analytics_daily "
        "UNION ALL SELECT 'inquiries', COUNT(*) FROM inquiries;"
    )
    r = requests.post(f"{API}/query", headers=H, json={"sql": sql}, timeout=60).json()
    if not r.get("success"):
        print(json.dumps(r, indent=2, ensure_ascii=False))
        sys.exit(1)
    rows = r["result"][0]["results"]
    print("[verify] D1 카운트:")
    for row in rows:
        print(f"  {row['t']:20s} {row['n']}")


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    if cmd in ("schema", "all"):
        cmd_schema()
    if cmd in ("seed", "all"):
        cmd_seed()
    if cmd in ("verify", "all"):
        cmd_verify()


if __name__ == "__main__":
    main()

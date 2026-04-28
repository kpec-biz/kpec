#!/usr/bin/env python3
"""덤프 JSON → D1 INSERT SQL 변환 (Phase 0)

scripts/migrate-to-d1/dump/{table}.json → scripts/migrate-to-d1/seed/{table}.sql

D1 import는 wrangler 명령으로:
  wrangler d1 execute kpec --remote --file=./scripts/migrate-to-d1/seed/notices.sql
  wrangler d1 execute kpec --remote --file=./scripts/migrate-to-d1/seed/analytics_daily.sql
  wrangler d1 execute kpec --remote --file=./scripts/migrate-to-d1/seed/inquiries.sql

사용법: python build_seed_sql.py
"""
from __future__ import annotations
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DUMP = HERE / "dump"
SEED = HERE / "seed"
SEED.mkdir(exist_ok=True)


def sql_str(v) -> str:
    """SQLite 안전 리터럴. None → NULL, 그 외 → 'escaped'."""
    if v is None or v == "":
        return "NULL"
    if isinstance(v, (list, dict)):
        v = json.dumps(v, ensure_ascii=False)
    s = str(v).replace("'", "''")
    return f"'{s}'"


def sql_int(v) -> str:
    if v is None or v == "":
        return "NULL"
    try:
        return str(int(v))
    except (TypeError, ValueError):
        return "NULL"


def sql_float(v) -> str:
    if v is None or v == "":
        return "NULL"
    try:
        return str(float(v))
    except (TypeError, ValueError):
        return "NULL"


# ─────────────────────────────────────────────
# notices
# ─────────────────────────────────────────────
def build_notices() -> str:
    rows = json.loads((DUMP / "notices.json").read_text(encoding="utf-8"))
    cols = [
        "pblanc_id", "airtable_id", "title", "original_title", "summary",
        "content_url", "category", "source", "apply_period",
        "original_url", "publish_date", "status", "tags",
    ]
    out = ["-- notices seed", "BEGIN TRANSACTION;"]
    for r in rows:
        f = r.get("fields", {})
        if not f.get("pblancId"):
            continue
        vals = [
            sql_str(f.get("pblancId")),
            sql_str(r.get("id")),
            sql_str(f.get("title") or f.get("originalTitle") or f.get("pblancId")),
            sql_str(f.get("originalTitle")),
            sql_str(f.get("summary")),
            sql_str(f.get("contentUrl")),
            sql_str(f.get("category") or "기타"),
            sql_str(f.get("source")),
            sql_str(f.get("applyPeriod")),
            sql_str(f.get("originalUrl")),
            sql_str(f.get("publishDate")),
            sql_str(f.get("status") or "검토"),
            sql_str(f.get("tags")),
        ]
        out.append(
            f"INSERT OR IGNORE INTO notices ({', '.join(cols)}) VALUES ({', '.join(vals)});"
        )
    out.append("COMMIT;")
    return "\n".join(out) + "\n"


# ─────────────────────────────────────────────
# analytics_daily
# ─────────────────────────────────────────────
def build_analytics() -> str:
    rows = json.loads((DUMP / "analytics_daily.json").read_text(encoding="utf-8"))
    cols = [
        "date", "period", "active_users", "page_views", "avg_duration",
        "bounce_rate", "top_pages", "traffic_sources", "devices",
        "referrers", "daily_trend", "regions",
    ]
    out = ["-- analytics_daily seed", "BEGIN TRANSACTION;"]
    for r in rows:
        f = r.get("fields", {})
        if not f.get("date"):
            continue
        vals = [
            sql_str(f.get("date")),
            sql_str(f.get("period") or "daily"),
            sql_int(f.get("activeUsers")),
            sql_int(f.get("pageViews")),
            sql_float(f.get("avgDuration")),
            sql_float(f.get("bounceRate")),
            sql_str(f.get("topPages")),
            sql_str(f.get("trafficSources")),
            sql_str(f.get("devices")),
            sql_str(f.get("referrers")),
            sql_str(f.get("dailyTrend")),
            sql_str(f.get("regions")),
        ]
        out.append(
            f"INSERT OR REPLACE INTO analytics_daily ({', '.join(cols)}) VALUES ({', '.join(vals)});"
        )
    out.append("COMMIT;")
    return "\n".join(out) + "\n"


# ─────────────────────────────────────────────
# inquiries
# ─────────────────────────────────────────────
def build_inquiries() -> str:
    rows = json.loads((DUMP / "inquiries.json").read_text(encoding="utf-8"))
    cols = [
        "airtable_id", "company", "name", "phone", "email",
        "industry", "revenue", "operation_year", "location",
        "fund_types", "amount", "situations", "message",
        "type", "status", "credit_score", "source", "memo",
        "created_at",
    ]
    out = ["-- inquiries seed", "BEGIN TRANSACTION;"]
    for r in rows:
        f = r.get("fields", {})
        vals = [
            sql_str(r.get("id")),
            sql_str(f.get("company")),
            sql_str(f.get("name")),
            sql_str(f.get("phone")),
            sql_str(f.get("email")),
            sql_str(f.get("industry")),
            sql_str(f.get("revenue")),
            sql_str(f.get("operationYear")),
            sql_str(f.get("location")),
            sql_str(f.get("fundTypes")),
            sql_str(f.get("amount")),
            sql_str(f.get("situations")),
            sql_str(f.get("message")),
            sql_str(f.get("type") or "general"),
            sql_str(f.get("status") or "new"),
            sql_str(f.get("creditScore")),
            sql_str(f.get("source") or "homepage"),
            sql_str(f.get("memo")),
            sql_str(r.get("createdTime")),
        ]
        out.append(
            f"INSERT OR IGNORE INTO inquiries ({', '.join(cols)}) VALUES ({', '.join(vals)});"
        )
    out.append("COMMIT;")
    return "\n".join(out) + "\n"


def main() -> None:
    targets = [
        ("notices.sql",         build_notices),
        ("analytics_daily.sql", build_analytics),
        ("inquiries.sql",       build_inquiries),
    ]
    for fname, fn in targets:
        sql = fn()
        out = SEED / fname
        out.write_text(sql, encoding="utf-8")
        n = sql.count("INSERT")
        print(f"[seed] {out}  ({n} inserts)")


if __name__ == "__main__":
    main()

-- KPEC D1 초기 스키마 (Phase 0)
-- 마이그 대상: notices(608) + analytics_daily(5) + inquiries(1) = 614건
-- 제외: 정책자금공고(0건, 미사용), Posts/board(테이블 없음, dead code)

-- ─────────────────────────────────────────────
-- 1. notices: 정책자금 콘텐츠 통합 (공고/뉴스/분석/인스타)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  pblanc_id       TEXT NOT NULL UNIQUE,           -- 비즈니스 키 (PBLN_xxx, NEWS_AUTO_xxx, ...)
  airtable_id     TEXT UNIQUE,                    -- 마이그 매핑용 (rec...)
  title           TEXT NOT NULL,
  original_title  TEXT,
  summary         TEXT,
  content_url     TEXT,                           -- R2 발행본 JSON URL
  category        TEXT NOT NULL DEFAULT '기타',    -- 시설/경영/인력/판매/기타/뉴스/분석/인스타
  source          TEXT,
  apply_period    TEXT,
  original_url    TEXT,
  publish_date    TEXT,                           -- YYYY-MM-DD (Airtable publishDate)
  status          TEXT NOT NULL DEFAULT '검토',    -- 검토/리라이팅완료/게시중/숨김
  tags            TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_notices_status_publish ON notices(status, publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category_status ON notices(category, status, publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_publish ON notices(publish_date DESC);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER IF NOT EXISTS trg_notices_updated_at
AFTER UPDATE ON notices
FOR EACH ROW
BEGIN
  UPDATE notices SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- ─────────────────────────────────────────────
-- 2. analytics_daily: GA4 일일 통계 누적
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_daily (
  date             TEXT NOT NULL,                 -- YYYY-MM-DD
  period           TEXT NOT NULL DEFAULT 'daily', -- daily/7d/14d/30d/90d
  active_users     INTEGER NOT NULL DEFAULT 0,
  page_views       INTEGER NOT NULL DEFAULT 0,
  avg_duration     REAL,
  bounce_rate      REAL,
  top_pages        TEXT,                          -- JSON
  traffic_sources  TEXT,                          -- JSON
  devices          TEXT,                          -- JSON
  referrers        TEXT,                          -- JSON
  daily_trend      TEXT,                          -- JSON
  regions          TEXT,                          -- JSON
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (date, period)
);

-- ─────────────────────────────────────────────
-- 3. inquiries: 상담/자금진단 접수
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  airtable_id     TEXT UNIQUE,                    -- 듀얼라이트 매핑용
  company         TEXT,
  name            TEXT,
  phone           TEXT,
  email           TEXT,
  industry        TEXT,
  revenue         TEXT,
  operation_year  TEXT,
  location        TEXT,
  fund_types      TEXT,
  amount          TEXT,
  situations      TEXT,
  message         TEXT,
  type            TEXT NOT NULL DEFAULT 'general',  -- general/diagnosis
  status          TEXT NOT NULL DEFAULT 'new',      -- new/progress/complete
  credit_score    TEXT,
  source          TEXT NOT NULL DEFAULT 'homepage',
  memo            TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_type_status   ON inquiries(type, status);

CREATE TRIGGER IF NOT EXISTS trg_inquiries_updated_at
AFTER UPDATE ON inquiries
FOR EACH ROW
BEGIN
  UPDATE inquiries SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

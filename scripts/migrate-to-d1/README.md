# KPEC Airtable → D1 마이그레이션

Phase 0 산출물. 사용 순서:

```bash
# 1) Airtable 전건 덤프 (프로젝트 .env 자동 로드)
python scripts/migrate-to-d1/export_airtable.py
#  → dump/notices.json, dump/analytics_daily.json, dump/inquiries.json

# 2) 덤프 → D1 INSERT SQL 변환
python scripts/migrate-to-d1/build_seed_sql.py
#  → seed/notices.sql, seed/analytics_daily.sql, seed/inquiries.sql

# 3) D1 DB 생성 (최초 1회) — 출력된 database_id를 worker/wrangler.toml에 입력
cd worker
npx wrangler d1 create kpec

# 4) 스키마 적용
npx wrangler d1 execute kpec --remote --file=./schema/0001_init.sql

# 5) 시드 import
npx wrangler d1 execute kpec --remote --file=../scripts/migrate-to-d1/seed/notices.sql
npx wrangler d1 execute kpec --remote --file=../scripts/migrate-to-d1/seed/analytics_daily.sql
npx wrangler d1 execute kpec --remote --file=../scripts/migrate-to-d1/seed/inquiries.sql

# 6) 카운트 검증
npx wrangler d1 execute kpec --remote --command="SELECT 'notices' t, COUNT(*) n FROM notices UNION ALL SELECT 'analytics_daily', COUNT(*) FROM analytics_daily UNION ALL SELECT 'inquiries', COUNT(*) FROM inquiries;"
```

## 마이그 매핑

| Airtable 테이블                       | 카운트 | D1 테이블         | 비고                          |
| ------------------------------------- | ------ | ----------------- | ----------------------------- |
| `notices` (`tblqm10vZyVADXMKQ`)       | 608    | `notices`         | pblanc_id UNIQUE              |
| `GA4 Analytics` (`tbl5tWcWKXFuOhQmB`) | 5      | `analytics_daily` | date PK                       |
| `Inquiries` (`tblyLgaV9P5ztO8Tv`)     | 1      | `inquiries`       | airtable_id 매핑 보존         |
| `정책자금공고` (`tblWouy3TNdywzkpw`)  | 0      | —                 | 미사용, 마이그 제외           |
| `Posts`                               | (없음) | —                 | board.ts dead code, 별도 삭제 |

## 다음 단계 (Phase 1+)

- Worker `notices.ts` 신규 (D1 SELECT 응답)
- Frontend `lib/notices.ts` → Worker fetch 교체
- iMac `pipeline.py` → CF D1 REST API 듀얼라이트
- Worker `inquiry.ts` 듀얼라이트
- 정합성 1주 검증 후 Airtable 호출/시크릿 제거

# KPEC 기업정책자금센터 - 세부 기획서

> 작성일: 2026-03-21
> 디자인 기반: KRDS (정부 디자인 시스템)
> 와이어프레임: wireframe_final.html 확정

---

## 1. 페이지별 콘텐츠 기획

### 1-1. 홈 페이지 (/)

| 순서 | 섹션         | 콘텐츠                                    | 이미지/모션                      |
| ---- | ------------ | ----------------------------------------- | -------------------------------- |
| 1    | 히어로       | 메인카피 + CTA 2개 + 우측 통계카드 3개    | **배경영상** (루프, 뮤트)        |
| 2    | 퀵서비스     | 자금진단/운전자금/시설자금/기업인증 4카드 | SVG 아이콘 (호버 모션)           |
| 3    | 자금진단 CTA | "우리 기업도 받을 수 있을까?" + 3단계     | 블루 그라데이션 배경             |
| 4    | 서비스 3종   | 운전/시설/인증 상세카드 + 특징 리스트     | **각 카드 상단 일러스트 이미지** |
| 5    | 신뢰지표     | 2,850건+ / 94% / 87% / 15년+              | 카운트업 모션                    |
| 6    | 알림·공고    | 탭형 게시판 (공고/공지/뉴스)              | -                                |
| 7    | 성공사례     | 카드 3열 (0건이면 숨김)                   | -                                |
| 8    | 진행절차     | 8단계 그리드                              | 순차 등장 모션                   |
| 9    | 상담 CTA     | 자격체크 6개 + 이중버튼                   | **배경 이미지** (상담 장면)      |

### 1-2. 정책자금 페이지 (/services)

| 순서 | 섹션           | 콘텐츠                                                    |
| ---- | -------------- | --------------------------------------------------------- |
| 1    | 페이지 헤더    | "정책자금 안내" 타이틀 + 서브카피                         |
| 2    | 자금진단 배너  | 상단 강조 배너 "맞춤 자금 찾기"                           |
| 3    | 운전자금 상세  | 대상/용도/금리/한도/기간 표 + 신청절차 + **이미지**       |
| 4    | 시설자금 상세  | 대상/용도/금리/한도/기간 표 + 신청절차 + **이미지**       |
| 5    | 기업인증 상세  | 인증종류별 카드 (벤처/이노비즈/메인비즈/ISO) + **이미지** |
| 6    | 자주 묻는 질문 | 아코디언 FAQ 5개                                          |
| 7    | 상담 CTA       | 하단 CTA 배너                                             |

**운전자금 콘텐츠:**

- 대상: 중소기업, 소상공인 (업력 1년 이상)
- 용도: 원자재, 인건비, 임대료, 운영비
- 금리: 연 2~4% (정책자금 기준)
- 한도: 최대 10억원
- 기간: 1~5년

**시설자금 콘텐츠:**

- 대상: 공장/설비 투자 예정 기업
- 용도: 공장신축, 설비구입, 사업장 확장
- 금리: 연 2~3.5% (장기 저금리)
- 한도: 최대 100억원
- 기간: 5~10년 (거치기간 포함)

**기업인증 콘텐츠:**

- 벤처기업: 기술성 평가 → 벤처확인서 발급 → 세제혜택+자금우대
- 이노비즈: 기술혁신형 중소기업 인증 → R&D 지원
- 메인비즈: 경영혁신형 중소기업 인증 → 판로지원
- ISO 9001/14001: 국제표준 품질/환경 인증 → 수출기업 필수

### 1-3. 성공사례 페이지 (/cases)

| 순서 | 섹션             | 콘텐츠                         |
| ---- | ---------------- | ------------------------------ |
| 1    | 페이지 헤더      | "성공사례" + 전체 건수 표시    |
| 2    | 필터 바          | 업종별/자금종류별 필터 탭      |
| 3    | 사례 카드 그리드 | 3열 카드 (업종/금액/결과/상세) |
| 4    | 상담 CTA         | 하단 배너                      |

_성공사례 0건이면 페이지 자체에 "아직 등록된 사례가 없습니다" 안내_

### 1-4. 진행절차 페이지 (/process)

| 순서 | 섹션           | 콘텐츠                                                |
| ---- | -------------- | ----------------------------------------------------- |
| 1    | 페이지 헤더    | "진행절차"                                            |
| 2    | 8단계 타임라인 | 세로 타임라인 (각 단계 상세 설명 + **아이콘 이미지**) |
| 3    | 자격요건       | 체크리스트 카드                                       |
| 4    | 비용 안내      | "100% 후불 성공보수제" 강조 배너 + **이미지**         |
| 5    | 상담 CTA       | 하단 배너                                             |

**8단계 상세:**

1. 무료상담 - 온라인 폼 또는 전화로 1차 접수
2. 전화상담 - 전문 컨설턴트가 기업 상황 파악
3. 맞춤제안 - 기업 분석 후 최적 정책자금 추천
4. 계약체결 - 100% 후불 성공보수제 계약
5. 담당자배정 - 전담 컨설턴트 1:1 배정
6. 서류진행 - 필요 서류 준비 및 기관 접수 대행
7. 승인완료 - 정책자금 승인 확정 및 실행
8. 사후관리 - 추가 자금 조달 및 지속 관리

### 1-5. 알림·자료 페이지 (/notice)

| 순서 | 섹션          | 콘텐츠                                     |
| ---- | ------------- | ------------------------------------------ |
| 1    | 페이지 헤더   | "알림·자료"                                |
| 2    | 탭 네비게이션 | 정책자금 공고 / 공지사항 / 뉴스·칼럼 / FAQ |
| 3    | 게시판 리스트 | 날짜/카테고리태그/제목 + 페이지네이션      |
| 4    | FAQ 탭        | 아코디언 형식                              |

### 1-6. 상담신청 페이지 (/contact)

| 순서 | 섹션           | 콘텐츠                                            |
| ---- | -------------- | ------------------------------------------------- |
| 1    | 페이지 헤더    | "무료상담 신청" + **배경 이미지**                 |
| 2    | 상담 폼        | 필수(회사명/업종/대표자/연락처) + 선택 + 상황태그 |
| 3    | 연락 정보      | 전화/카카오톡/운영시간 카드                       |
| 4    | 자주 묻는 질문 | FAQ 아코디언 3개                                  |

---

## 2. 이미지/배너 기획 (Gemini 생성 목록)

### 2-1. 서비스 카드 일러스트 (3종)

| ID         | 용도          | Gemini 프롬프트                                                                                                                                                                  | 사이즈  |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| img-svc-01 | 운전자금 카드 | "Flat illustration of a business person reviewing financial documents at a desk with charts and coins, blue corporate color scheme, clean minimal style, white background, 16:9" | 800x450 |
| img-svc-02 | 시설자금 카드 | "Flat illustration of a modern factory building with construction crane and growing arrow, blue corporate style, clean minimal, white background, 16:9"                          | 800x450 |
| img-svc-03 | 기업인증 카드 | "Flat illustration of a certificate document with a shield checkmark badge and stars, blue corporate style, clean minimal, white background, 16:9"                               | 800x450 |

### 2-2. 상담 CTA 배경 이미지

| ID         | 용도               | Gemini 프롬프트                                                                                                                                                                          | 사이즈   |
| ---------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| img-cta-01 | 상담 CTA 섹션 배경 | "Professional business consultation scene, two people discussing over documents at a modern office table, warm lighting, shallow depth of field, corporate blue tint overlay, 21:9 wide" | 1920x640 |

### 2-3. 페이지 헤더 배경 (서브페이지용)

| ID            | 용도             | Gemini 프롬프트                                                                                                                          | 사이즈   |
| ------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| img-header-01 | 정책자금 페이지  | "Abstract geometric pattern with blue gradient, subtle grid lines and financial graph elements, modern corporate background, ultra wide" | 1920x400 |
| img-header-02 | 성공사례 페이지  | "Abstract success concept with upward arrows and light streaks on blue gradient background, corporate minimal style, ultra wide"         | 1920x400 |
| img-header-03 | 진행절차 페이지  | "Abstract process flow concept with connected nodes and pathways on blue gradient, modern corporate, ultra wide"                         | 1920x400 |
| img-header-04 | 알림·자료 페이지 | "Abstract information and documents concept with floating papers and data visualization on blue gradient, ultra wide"                    | 1920x400 |
| img-header-05 | 상담신청 페이지  | "Professional handshake concept with warm light and blue corporate overlay, trust and partnership, ultra wide"                           | 1920x400 |

### 2-4. 진행절차 아이콘 일러스트 (8종)

| ID          | 단계       | Gemini 프롬프트                                                                |
| ----------- | ---------- | ------------------------------------------------------------------------------ |
| img-proc-01 | 무료상담   | "Simple flat icon of a chat bubble with question mark, blue on white, 256x256" |
| img-proc-02 | 전화상담   | "Simple flat icon of a phone with headset, blue on white, 256x256"             |
| img-proc-03 | 맞춤제안   | "Simple flat icon of a clipboard with lightbulb, blue on white, 256x256"       |
| img-proc-04 | 계약체결   | "Simple flat icon of a handshake, blue on white, 256x256"                      |
| img-proc-05 | 담당자배정 | "Simple flat icon of a person with ID badge, blue on white, 256x256"           |
| img-proc-06 | 서류진행   | "Simple flat icon of documents with progress bar, blue on white, 256x256"      |
| img-proc-07 | 승인완료   | "Simple flat icon of a certificate with checkmark, blue on white, 256x256"     |
| img-proc-08 | 사후관리   | "Simple flat icon of a shield with gear, blue on white, 256x256"               |

### 2-5. 자금진단 배너

| ID          | 용도              | Gemini 프롬프트                                                                                                                      |
| ----------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| img-diag-01 | 자금진단 CTA 배경 | "Abstract financial analysis concept with magnifying glass over business charts, blue gradient background, clean modern style, 21:9" |

---

## 3. 모션/애니메이션 기획 (Lottie/Framer Motion)

### 3-1. 로딩 애니메이션

| 항목     | 상세                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 타입     | Lottie JSON                                                                  |
| 시각화   | KPEC 로고의 K가 회전하며 나타남 → PEC가 슬라이드인 → 전체 완성 후 페이드아웃 |
| 지속시간 | 1.5초                                                                        |
| 트리거   | 페이지 최초 로드 시 (세션당 1회)                                             |
| 배경     | 흰색 → 콘텐츠 페이드인                                                       |

### 3-2. 히어로 배경 모션

| 항목 | 상세                                |
| ---- | ----------------------------------- |
| 타입 | MP4 영상 (뮤트, 루프, autoplay)     |
| 대안 | Lottie 추상 모션 (네트워크 부담 시) |
| 상세 | 아래 영상 기획 섹션 참조            |

### 3-3. 스크롤 트리거 애니메이션

| 요소             | 모션                               | 라이브러리              |
| ---------------- | ---------------------------------- | ----------------------- |
| 모든 섹션 타이틀 | fade-in-up (Y:30→0, opacity:0→1)   | Framer Motion           |
| 서비스 카드 3개  | stagger fade-in-up (0.15s 간격)    | Framer Motion           |
| 퀵서비스 카드    | stagger scale-in (0.1s 간격)       | Framer Motion           |
| 통계 숫자        | 카운트업 (0→최종값, 2초)           | Framer Motion useInView |
| 프로세스 8단계   | stagger fade-in (0.08s 간격)       | Framer Motion           |
| 자격 체크리스트  | stagger slide-in-left/right (교차) | Framer Motion           |

### 3-4. 인터랙션 모션

| 요소               | 모션                                               | 상세                 |
| ------------------ | -------------------------------------------------- | -------------------- |
| 서비스 카드 호버   | border-color 전환 + shadow 확대 + translateY(-4px) | CSS transition 0.25s |
| 퀵서비스 카드 호버 | translateY(-2px) + shadow                          | CSS transition 0.2s  |
| CTA 버튼 호버      | shadow 확대 + 미세 scale(1.02)                     | CSS transition       |
| GNB 활성 탭        | 하단 블루 바 width 확장                            | CSS transition       |
| 플로팅 버튼 호버   | scale(1.1)                                         | CSS transition       |
| 게시판 항목 호버   | 배경색 변경 (→ Gray-5)                             | CSS transition       |
| 프로세스 카드 호버 | border-color → Primary-50                          | CSS transition       |

### 3-5. 자금진단 인터랙션 (별도 페이지 or 모달)

| 단계              | UI                              | 모션                         |
| ----------------- | ------------------------------- | ---------------------------- |
| Step 1: 업종 선택 | 6개 아이콘 카드 그리드          | 선택 시 체크 + scale 바운스  |
| Step 2: 기업 규모 | 슬라이더 or 3개 버튼            | slide-in-right 전환          |
| Step 3: 자금 용도 | 4개 옵션 카드                   | slide-in-right 전환          |
| 결과              | 매칭된 정책자금 카드 + 상담 CTA | fade-in-up + confetti Lottie |

### 3-6. 페이지 전환

| 항목   | 상세                                 |
| ------ | ------------------------------------ |
| 타입   | Next.js App Router layout transition |
| 모션   | 콘텐츠 fade-in (opacity 0→1, 0.3s)   |
| 스크롤 | 페이지 전환 시 scrollTo(0)           |

---

## 4. 히어로 영상 기획

### 4-1. 영상 컨셉

| 항목     | 상세                                    |
| -------- | --------------------------------------- |
| 분위기   | 신뢰감, 전문성, 성장, 파트너십          |
| 톤       | 블루 색조 오버레이 (Primary-80 톤)      |
| 길이     | 15~20초 루프                            |
| 포맷     | MP4, 1080p, 무음                        |
| 재생     | autoplay, muted, loop, playsinline      |
| 오버레이 | 좌측 어둡게 (텍스트 가독성) → 우측 밝게 |

### 4-2. 영상 제작 프롬프트 (AI 영상 생성용)

**프롬프트 Option A (비즈니스 미팅):**

```
Cinematic slow-motion footage of a professional business meeting in a modern Korean office.
Two business people reviewing financial documents and charts on a large screen.
Warm golden sunlight streaming through floor-to-ceiling windows.
Shallow depth of field, focus shifts from documents to handshake.
Blue color grading overlay. Corporate, trustworthy, professional atmosphere.
4K, 15 seconds loop, no audio. Smooth camera dolly movement left to right.
```

**프롬프트 Option B (도시 + 성장):**

```
Aerial cinematic footage of Seoul cityscape at golden hour transitioning to night.
Modern skyscrapers with lights turning on. Smooth drone movement forward.
Overlay of subtle financial data visualizations (transparent graphs, upward arrows).
Blue-toned color grading. Conveying growth, opportunity, and Korean business environment.
4K, 20 seconds seamless loop, no audio.
```

**프롬프트 Option C (추상 데이터):**

```
Abstract motion graphics of financial data flowing through a network of connected nodes.
Blue gradient background (#083891 to #0B50D0). Glowing particles moving along pathways.
Subtle grid lines in the background. Numbers and percentage symbols floating gently.
Clean, modern, corporate feel. Representing financial analysis and fund matching.
4K, 15 seconds seamless loop, no audio. Slow, calming movement.
```

### 4-3. 영상 없을 때 대안

Lottie 추상 모션 배경:

- 파란색 그라데이션 위에 떠다니는 원형/선형 파티클
- 느린 흐름, 금융 데이터 시각화 느낌
- 파일 크기 < 200KB (Lottie JSON)

---

## 5. 이미지 생성 계획

### Gemini API 사용 (모델: gemini-2.0-flash-exp 또는 imagen-3.0)

**생성 순서:**

1. 서비스 카드 일러스트 3종 (img-svc-01~03)
2. 상담 CTA 배경 (img-cta-01)
3. 서브페이지 헤더 배경 5종 (img-header-01~05)
4. 자금진단 배너 (img-diag-01)

**프로세스 아이콘 8종은 SVG로 직접 제작** (Gemini 생성 불필요)

### 저장 경로

```
public/images/
├── services/
│   ├── operating-fund.webp
│   ├── facility-fund.webp
│   └── certification.webp
├── banners/
│   ├── cta-consultation.webp
│   └── fund-diagnosis.webp
├── headers/
│   ├── services.webp
│   ├── cases.webp
│   ├── process.webp
│   ├── notice.webp
│   └── contact.webp
└── hero/
    └── hero-video.mp4 (또는 hero-lottie.json)
```

---

## 6. 구현 우선순위

| Phase   | 작업                                      | 담당        |
| ------- | ----------------------------------------- | ----------- |
| Phase 1 | Gemini로 이미지 생성 + 저장               | 메인 Claude |
| Phase 2 | Next.js KRDS 기반 전면 재구축 (홈 + 공통) | 에이전트 팀 |
| Phase 3 | 서브페이지 5개 구현                       | 에이전트 팀 |
| Phase 4 | Lottie 로딩 + 모션 구현                   | 서브 Claude |
| Phase 5 | 자금진단 인터랙티브 페이지                | 메인 Claude |
| Phase 6 | 히어로 영상 적용 + 최종 QA                | 메인 Claude |

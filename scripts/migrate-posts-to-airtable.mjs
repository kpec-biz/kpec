/**
 * posts.ts의 뉴스/분석 데이터를 Airtable + R2에 업로드
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
config();

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET = "kpecr2";
const R2_PUBLIC = process.env.R2_PUBLIC_URL;

// posts.ts 데이터를 여기에 직접 정의 (ESM에서 ts import 불가)
const posts = [
  {
    id: 1, category: "분석", tag: "정책 분석",
    title: "2026년 중소기업 정책자금 4조 4,313억원 공급 확정",
    date: "2025.12.23", author: "KPEC 정책자금팀", source: "중소벤처기업부",
    summary: "중기부가 2026년 정책자금 융자계획을 공고했습니다. 총 공급 규모 4조 4,313억원으로, AI 기업 우대·DX/ESG 금리 인하·수출기업 한도 확대 등 6가지 핵심 변경사항을 정리합니다.",
    content: [
      { type: "h2", text: "2026년 정책자금 주요 변경사항" },
      { type: "p", text: "중소벤처기업부는 2025년 12월 23일 2026년도 중소기업 정책자금 융자계획을 공고했습니다. 총 공급 규모는 4조 4,313억원으로, 융자 4조 643억원과 이차보전 3,670억원으로 구성됩니다." },
      { type: "info-box", text: "2026년 정책자금 총 공급규모: 4조 4,313억원 (융자 4조 643억원 + 이차보전 3,670억원)" },
      { type: "h2", text: "6대 핵심 변경사항" },
      { type: "ul", items: ["AI 기업 우대 (AX 스프린트): 한도 60억 → 100억원, 금리 -0.1%p", "DX·ESG 우대: 디지털전환·탄소중립 기업 금리 인하 집중", "투융자 결합: 투자조건부 융자 도입으로 부채비율 개선 지원", "내수→수출 전환 지원: 운전자금 한도 5억 → 10억원 확대", "지역·신산업 가점: 지방 주력산업, 뿌리기술(SW 포함) 우대", "미래 유망기술 강화: AI, 로봇, 글로벌 진출 기업 대폭 혜택"] },
      { type: "h3", text: "금리 현황" },
      { type: "p", text: "2026년 기준 정책자금 기본 금리는 연 2.5% 수준입니다. 비수도권 사업자(-0.2%p), DX·ESG 도입 기업(최대 -0.3%p), AI 기업(-0.1%p) 등 우대금리가 추가 적용됩니다." },
    ],
    tags: "정책자금,중진공,2026년,운전자금,시설자금",
  },
  {
    id: 2, category: "분석", tag: "정책 분석",
    title: "소상공인 정책자금 융자사업 신청 접수 시작",
    date: "2026.01.02", author: "KPEC 정책자금팀", source: "소상공인진흥공단",
    summary: "2026년 소상공인 정책자금 융자사업이 1월부터 본격 시작됩니다. 일반경영안정자금, 신용취약소상공인자금, 대환대출 등 주요 프로그램별 금리·한도·자격요건을 정리합니다.",
    content: [
      { type: "h2", text: "2026년 소상공인 정책자금 개요" },
      { type: "p", text: "소상공인시장진흥공단(소진공)이 2026년 소상공인 정책자금 융자사업 접수를 시작했습니다." },
      { type: "ul", items: ["일반경영안정자금: 연간 7천만원 한도, 약 연 2.96%", "신용취약소상공인자금: 최대 3천만원", "대환대출: 최대 5천만원, 연 4.5% 고정"] },
    ],
    tags: "소상공인,경영안정자금,소진공,2026년",
  },
  {
    id: 3, category: "분석", tag: "정책 분석",
    title: "AI 기업 정책자금 한도 100억 확대, AX 스프린트",
    date: "2026.01.15", author: "KPEC 정책자금팀", source: "중소벤처기업부",
    summary: "2026년 신설된 AX 스프린트 우대트랙은 AI 기업의 정책자금 한도를 기존 60억에서 100억원으로 대폭 확대합니다.",
    content: [
      { type: "h2", text: "AX 스프린트 우대트랙이란?" },
      { type: "p", text: "2026년부터 새롭게 도입된 AX 스프린트 우대트랙은 AI 관련 중소기업의 성장을 집중 지원합니다. 한도 100억원, 금리 -0.1%p." },
      { type: "info-box", text: "AX 스프린트 우대트랙: 한도 100억원, 금리 기본 대비 -0.1%p 추가 인하" },
    ],
    tags: "AI,AX스프린트,정책자금,벤처기업,우대금리",
  },
  {
    id: 4, category: "분석", tag: "정책 분석",
    title: "수출기업화 운전자금 한도 5억→10억 확대 시행",
    date: "2026.02.01", author: "KPEC 정책자금팀", source: "중진공",
    summary: "내수기업의 수출 전환을 지원하기 위해 운전자금 한도가 기존 5억에서 10억원으로 확대됩니다.",
    content: [
      { type: "h2", text: "수출기업화 자금 한도 확대" },
      { type: "p", text: "2026년부터 내수기업 수출기업화 자금의 운전자금 한도가 최대 10억원으로 확대되었습니다." },
      { type: "info-box", text: "내수기업 수출기업화 자금: 운전자금 최대 10억원 (기존 5억원에서 상향)" },
    ],
    tags: "수출,운전자금,한도확대,비수도권,중진공",
  },
  {
    id: 5, category: "뉴스", tag: "정책 분석",
    title: "2026년 정책자금 4.4조원, 달라진 점과 활용 전략",
    date: "2026.01.15", author: "KPEC 정책자금팀", source: "KPEC",
    summary: "2026년 정책자금의 총 예산, 주요 변경사항, 기업 유형별 최적 활용 전략을 정리합니다.",
    content: [
      { type: "h2", text: "2026년 정책자금, 무엇이 달라졌나" },
      { type: "p", text: "2026년 중소기업 정책자금 총 공급규모는 4조 4,313억원입니다. AI 기업 우대와 수출기업 지원 강화가 가장 큰 변화입니다." },
      { type: "h3", text: "제조업 기업" },
      { type: "p", text: "스마트팩토리 전환 시 DX 우대금리(-0.3%p)를 적극 활용하세요. 시설자금은 10년 상환으로 장기 투자에 유리합니다." },
      { type: "h3", text: "IT/AI 기업" },
      { type: "p", text: "AX 스프린트 우대트랙 선정을 목표로 하세요. 한도 100억원에 금리 인하까지 받을 수 있습니다." },
    ],
    tags: "정책자금,활용전략,2026년,기업유형별",
  },
  {
    id: 6, category: "뉴스", tag: "자금 가이드",
    title: "AI 기업을 위한 AX 스프린트 우대트랙 완전 정리",
    date: "2026.01.20", author: "KPEC 정책자금팀", source: "KPEC",
    summary: "2026년 신설된 AX 스프린트 우대트랙의 선정 기준, 지원 혜택, 신청 절차를 완전 정리합니다.",
    content: [
      { type: "h2", text: "AX 스프린트, 왜 주목해야 하나" },
      { type: "p", text: "정부가 AI 산업 육성을 위해 2026년 새롭게 도입한 AX 스프린트 우대트랙은 파격적인 혜택을 제공합니다." },
      { type: "ul", items: ["융자한도: 일반 60억원 → AX 스프린트 100억원", "금리: 기본 연 2.5% → AX 스프린트 연 2.4%", "DX 우대 병행 시: 최대 연 2.1%까지 가능"] },
    ],
    tags: "AI,AX스프린트,우대트랙,벤처기업",
  },
  {
    id: 7, category: "뉴스", tag: "인증 안내",
    title: "벤처기업 인증, 정책자금 신청 전에 받아야 하는 이유",
    date: "2026.02.05", author: "KPEC 정책자금팀", source: "KPEC",
    summary: "벤처기업·이노비즈·메인비즈 인증이 정책자금 신청에 주는 구체적인 혜택과 인증별 요건을 비교합니다.",
    content: [
      { type: "h2", text: "기업인증이 정책자금에 미치는 영향" },
      { type: "p", text: "벤처기업·이노비즈·메인비즈 인증 기업은 정책자금 신청 시 우선 배정 및 가점을 받습니다." },
      { type: "h3", text: "벤처기업 인증" },
      { type: "ul", items: ["법인세·소득세 50% 감면 (최초 5년)", "기술보증기금 보증 우대", "정부 R&D 과제 가점", "정책자금 신청 시 가점"] },
    ],
    tags: "벤처기업,이노비즈,메인비즈,기업인증,정책자금",
  },
  {
    id: 9, category: "뉴스", tag: "자금 가이드",
    title: "ISO 인증 비용, 정부가 70~80% 지원한다는 사실",
    date: "2026.02.10", author: "KPEC 정책자금팀", source: "KPEC",
    summary: "ISO 9001·14001 인증 비용과 정부 지원 프로그램, 복합인증 절감 방법을 정리합니다.",
    content: [
      { type: "h2", text: "ISO 인증 비용 현황" },
      { type: "p", text: "ISO 9001 인증 비용은 약 200~500만원, 컨설팅 비용은 별도 300~800만원 수준입니다." },
      { type: "ul", items: ["지자체별 ISO 인증 비용의 70~80% 지원", "ISO 9001 + 14001 동시 취득 시 약 20~30% 비용 절감"] },
    ],
    tags: "ISO,인증비용,정부지원,품질경영,환경경영",
  },
  {
    id: 10, category: "뉴스", tag: "FAQ",
    title: "정책자금 신청 전 반드시 확인할 10가지 FAQ",
    date: "2026.02.15", author: "KPEC 정책자금팀", source: "KPEC",
    summary: "정책자금 신청 자격, 금리, 한도, 중복 수혜 가능 여부 등 가장 많이 묻는 질문에 답합니다.",
    content: [
      { type: "h2", text: "정책자금 FAQ Top 10" },
      { type: "h3", text: "Q1. 누가 신청할 수 있나요?" },
      { type: "p", text: "중소기업기본법 제2조에 따른 중소기업이면 신청 가능합니다." },
      { type: "h3", text: "Q2. 금리는 얼마인가요?" },
      { type: "p", text: "기본 금리 연 2.5% 수준이며, 자금 유형에 따라 연 1.9%~4.5%까지 차등 적용됩니다." },
    ],
    tags: "FAQ,정책자금,신청자격,금리,한도",
  },
];

async function main() {
  console.log("=== posts.ts → R2 + Airtable 마이그레이션 ===");

  const records = [];
  for (const post of posts) {
    // R2에 content 업로드
    const key = `posts/kpec-${post.id}.json`;
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: JSON.stringify(post.content),
      ContentType: "application/json",
      CacheControl: "public, max-age=86400",
    }));
    const contentUrl = `${R2_PUBLIC}/${key}`;
    console.log(`R2: ${key}`);

    records.push({
      fields: {
        pblancId: `KPEC_${String(post.id).padStart(3, "0")}`,
        title: post.title,
        originalTitle: post.title,
        summary: post.summary,
        contentUrl,
        category: post.category,
        source: post.source,
        applyPeriod: "",
        publishDate: post.date.replace(/\./g, "-"),
        status: "게시중",
        tags: post.tags,
      },
    });
  }

  // Airtable 업로드 (10개씩)
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const res = await fetch(`${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: batch }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Airtable error: ${res.status} ${err.slice(0, 300)}`);
    }
    const result = await res.json();
    console.log(`Airtable: ${result.records.length}건 업로드`);
  }

  console.log(`완료! ${records.length}건`);
}

main().catch(e => { console.error(e); process.exit(1); });

// 인스타 배너 17개 생성 → public/images/instagram/ 저장 → R2 업로드
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images", "instagram");
mkdirSync(OUT_DIR, { recursive: true });

const R2_PUBLIC_URL = "https://pub-d5cd496aa0ad4d72b720f78967753f9f.r2.dev";
const s3 = new S3Client({
  region: "auto",
  endpoint: "https://331cfffb15a9dbc55a5cdb1f1534d8b5.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "4f3b5f8911fc15417c9d275d0937d59d",
    secretAccessKey: "415e167e043e99f25667e4df18088febf687475d0aeb6d5657716bc41b98adfa",
  },
});

const banners = [
  { id: "01", badge: "정책자금", title: "수출기업 금리 추가 우대", sub: "최대 0.5%p 추가 인하", color: "#1A56A8" },
  { id: "02", badge: "서류 지원", title: "복잡한 서류, 전문가가 지원", sub: "신청부터 실행까지", color: "#0e2a5c" },
  { id: "03", badge: "신규 자금", title: "2026년 신규 정책자금", sub: "지금 확인하세요", color: "#ED2939" },
  { id: "04", badge: "운전자금", title: "기업 운영자금 최대 5억", sub: "연 2.5% 정책금리", color: "#1A56A8" },
  { id: "05", badge: "시설자금", title: "설비투자 최대 60억 지원", sub: "10년 장기 상환", color: "#0e2a5c" },
  { id: "06", badge: "벤처인증", title: "벤처기업 인증 취득 지원", sub: "법인세 50% 감면", color: "#7c3aed" },
  { id: "07", badge: "긴급자금", title: "소상공인 긴급경영자금", sub: "최대 5천만원", color: "#ED2939" },
  { id: "08", badge: "창업자금", title: "청년 창업기업 특례보증", sub: "최대 3억원 지원", color: "#059669" },
  { id: "09", badge: "R&D자금", title: "정부 R&D 자금 가이드", sub: "혁신성장 기업 대상", color: "#d97706" },
  { id: "10", badge: "보증제도", title: "기술보증기금 한도 확대", sub: "50% 한도 증액", color: "#1A56A8" },
  { id: "11", badge: "자금진단", title: "무료 자금적격 진단", sub: "1분이면 충분합니다", color: "#0e2a5c" },
  { id: "12", badge: "성공보수", title: "승인 전 비용 0원", sub: "성공보수 후불제", color: "#ED2939" },
  { id: "13", badge: "이노비즈", title: "이노비즈 인증 취득", sub: "보증료 0.2%p 차감", color: "#7c3aed" },
  { id: "14", badge: "ISO인증", title: "ISO 9001/14001 취득", sub: "정책자금 연계 전략", color: "#059669" },
  { id: "15", badge: "금리우대", title: "DX·ESG 기업 금리우대", sub: "디지털·친환경 전환", color: "#1A56A8" },
  { id: "16", badge: "무료상담", title: "전문가 1:1 무료상담", sub: "지금 바로 신청하세요", color: "#0e2a5c" },
  { id: "17", badge: "정책뉴스", title: "2026 정책자금 총 4.4조", sub: "전년 대비 15% 증액", color: "#ED2939" },
];

function createSVG(b) {
  return `<svg width="540" height="540" xmlns="http://www.w3.org/2000/svg">
    <rect width="540" height="540" fill="${b.color}"/>
    <rect x="0" y="0" width="540" height="540" fill="url(#grad)" opacity="0.3"/>
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="white" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.3"/>
      </linearGradient>
    </defs>
    <rect x="30" y="30" width="100" height="30" rx="15" fill="white" opacity="0.25"/>
    <text x="80" y="50" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="13" fill="white">${b.badge}</text>
    <text x="40" y="280" font-family="Arial,sans-serif" font-weight="900" font-size="38" fill="white">${b.title.length > 12 ? b.title.substring(0, 12) : b.title}</text>
    ${b.title.length > 12 ? `<text x="40" y="325" font-family="Arial,sans-serif" font-weight="900" font-size="38" fill="white">${b.title.substring(12)}</text>` : ""}
    <text x="40" y="${b.title.length > 12 ? 365 : 320}" font-family="Arial,sans-serif" font-weight="400" font-size="20" fill="white" opacity="0.7">${b.sub}</text>
    <rect x="30" y="460" width="90" height="50" rx="12" fill="white" opacity="0.15"/>
    <text x="75" y="491" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="22" fill="white">K</text>
    <text x="140" y="495" font-family="Arial,sans-serif" font-weight="400" font-size="14" fill="white" opacity="0.5">KPEC 정책자금</text>
  </svg>`;
}

async function main() {
  console.log(`\n배너 ${banners.length}개 생성 시작\n`);

  for (const b of banners) {
    const svg = Buffer.from(createSVG(b));
    const png = await sharp(svg).resize(540, 540).png({ quality: 90 }).toBuffer();
    const webp = await sharp(svg).resize(540, 540).webp({ quality: 82 }).toBuffer();

    const pngName = `insta-${b.id}.png`;
    const webpName = `insta-${b.id}.webp`;

    writeFileSync(join(OUT_DIR, pngName), png);

    await s3.send(new PutObjectCommand({
      Bucket: "kpecr2",
      Key: `images/instagram/${webpName}`,
      Body: webp,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }));

    console.log(`  ${b.id}. ${b.title} → ${(webp.length/1024).toFixed(0)}KB`);
  }

  console.log(`\n${banners.length}개 배너 생성 + R2 업로드 완료\n`);

  // 매니페스트 출력
  const manifest = banners.map(b => ({
    id: b.id,
    image: `${R2_PUBLIC_URL}/images/instagram/insta-${b.id}.webp`,
    badge: b.badge,
    title: b.title,
    sub: b.sub,
  }));
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch(console.error);

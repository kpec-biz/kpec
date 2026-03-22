import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://jsbizfunding.kr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KPEC 기업정책자금센터 | 중소기업 정책자금 전문 컨설팅",
    template: "%s | KPEC 기업정책자금센터",
  },
  description:
    "중소기업 정책자금 전문 컨설팅. 운전자금·시설자금·기업인증. 맞춤 자금설계, 후불 성공보수제. 무료상담 010-2020-5312",
  keywords: [
    "정책자금",
    "중소기업 정책자금",
    "운전자금",
    "시설자금",
    "기업인증",
    "정부지원금",
    "중소기업 대출",
    "정책자금 컨설팅",
    "특례보증",
    "소상공인 지원금",
    "벤처인증",
    "이노비즈",
    "메인비즈",
  ],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "KPEC 기업정책자금센터",
    title: "KPEC 기업정책자금센터 | 중소기업 정책자금 전문 컨설팅",
    description:
      "중소기업 정책자금 전문 컨설팅. 운전자금·시설자금·기업인증. 후불 성공보수제. 무료상담 010-2020-5312",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KPEC 기업정책자금센터",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KPEC 기업정책자금센터 | 중소기업 정책자금 전문 컨설팅",
    description:
      "중소기업 정책자금 전문 컨설팅. 운전자금·시설자금·기업인증. 후불 성공보수제.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 인증 후 여기에 추가
    // google: "인증코드",
    other: {
      "naver-site-verification": "8dbf78d9acd7fa98e9ea3fe8fa5a691f2a3f4021",
    },
  },
};

const GA_ID = "G-V36SQT1VPD";

// JSON-LD 구조화된 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // 1. Organization — 회사 정보
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "KPEC 기업정책자금센터",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+82-10-2020-5312",
        contactType: "customer service",
        availableLanguage: "Korean",
        areaServed: "KR",
      },
      sameAs: ["https://www.instagram.com/kpec77/"],
      description:
        "중소기업 정책자금 전문 컨설팅 기업. 운전자금, 시설자금, 기업인증 컨설팅 서비스 제공.",
    },
    // 2. WebSite — 사이트 검색 기능 (GEO/AEO)
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "KPEC 기업정책자금센터",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "ko-KR",
    },
    // 3. ProfessionalService — 지역 비즈니스 (GEO)
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: "KPEC 기업정책자금센터",
      url: SITE_URL,
      telephone: "+82-10-2020-5312",
      priceRange: "후불 성공보수제",
      areaServed: {
        "@type": "Country",
        name: "대한민국",
      },
      serviceType: "정책자금 컨설팅",
      description:
        "중소기업·소상공인 대상 정부 정책자금 신청 대행 및 컨설팅. 운전자금, 시설자금, 특례보증, 기업인증(벤처·이노비즈·메인비즈) 전문.",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "정책자금 서비스",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "운전자금 컨설팅",
              description:
                "중소기업 운전자금 정책자금 신청 지원. 최대 10억원 저금리 융자.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "시설자금 컨설팅",
              description:
                "시설 투자·설비 도입을 위한 정책자금 신청 지원. 최대 100억원.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "기업인증 컨설팅",
              description:
                "벤처기업, 이노비즈, 메인비즈, ISO 인증 취득 지원 컨설팅.",
            },
          },
        ],
      },
    },
    // 4. FAQPage — AEO (AI 검색 최적화)
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "정책자금은 누가 신청할 수 있나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "중소기업기본법 제2조에 따른 중소기업이면 신청 가능합니다. 상장사, 자본금 200억원 초과 기업, 세금 체납 기업, 휴·폐업 기업 등은 제외됩니다.",
          },
        },
        {
          "@type": "Question",
          name: "정책자금 신청에서 자금 실행까지 얼마나 걸리나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "일반적으로 신청 후 2~4주 내 심사 결과가 통보되며, 승인 후 약정·실행까지 3~5 영업일이 소요됩니다.",
          },
        },
        {
          "@type": "Question",
          name: "정책자금 컨설팅 비용은 얼마인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "KPEC는 후불 성공보수제로 운영됩니다. 자금 승인 전까지 비용이 없으며, 자금 실행 이후에만 수수료가 발생합니다.",
          },
        },
        {
          "@type": "Question",
          name: "운전자금과 시설자금을 동시에 신청할 수 있나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "가능합니다. 기업당 운전+시설자금 합산 융자한도는 60억원 이내입니다. AI 기업(AX 스프린트) 선정 시 100억원까지 확대됩니다.",
          },
        },
        {
          "@type": "Question",
          name: "특례보증이란 무엇인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "특례보증은 신용등급이 낮은 중소기업·소상공인도 정부 보증을 통해 저금리로 자금을 조달할 수 있는 제도입니다. 중저신용자 지원을 위해 운영됩니다.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 구조화된 데이터 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

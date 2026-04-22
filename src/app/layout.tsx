import type { Metadata } from "next";
import Script from "next/script";
import { homeFaqs } from "@/data/faq";
import "./globals.css";

const SITE_URL = "https://jsbizfunding.kr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "기업정책자금센터 | 중소기업 정책자금 전문 컨설팅",
    template: "%s | 기업정책자금센터",
  },
  description:
    "중소기업 정책자금 전문 컨설팅. 업종·재무 분석 기반 맞춤 자금설계. 운전자금·시설자금·벤처·이노비즈·메인비즈 인증 통합 지원. 무료 초기상담 010-2466-4800",
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
    siteName: "기업정책자금센터",
    title: "기업정책자금센터 | 중소기업 정책자금 전문 컨설팅",
    description:
      "업종·재무 분석 기반 정책자금 맞춤 설계. 운전자금·시설자금·기업인증 통합 컨설팅. 무료 초기상담 010-2466-4800",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "기업정책자금센터",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "기업정책자금센터 | 중소기업 정책자금 전문 컨설팅",
    description:
      "업종·재무 분석 기반 정책자금 맞춤 설계. 운전자금·시설자금·기업인증 통합 컨설팅.",
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
      name: "기업정책자금센터",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+82-10-2466-4800",
        contactType: "customer service",
        availableLanguage: "Korean",
        areaServed: "KR",
      },
      sameAs: ["https://www.instagram.com/kpec77/"],
      description:
        "중소기업 정책자금 전문 컨설팅 기업. 운전자금, 시설자금, 기업인증 컨설팅 서비스 제공.",
      knowsAbout: [
        "중소기업 정책자금",
        "운전자금",
        "시설자금",
        "기업인증",
        "벤처인증",
        "이노비즈",
        "메인비즈",
        "특례보증",
        "정부지원금",
        "중소기업 대출",
      ],
    },
    // 2. WebSite — 사이트 검색 기능 (GEO/AEO)
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "기업정책자금센터",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "ko-KR",
    },
    // 3. ProfessionalService — 지역 비즈니스 (GEO)
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: "기업정책자금센터",
      url: SITE_URL,
      telephone: "+82-10-2466-4800",
      priceRange: "초기상담 무료",
      areaServed: {
        "@type": "Country",
        name: "대한민국",
      },
      serviceType: "정책자금 컨설팅",
      description:
        "중소기업·소상공인 대상 정부 정책자금 신청 지원 및 컨설팅. 운전자금, 시설자금, 특례보증, 기업인증(벤처·이노비즈·메인비즈) 전문.",
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
      mainEntity: homeFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
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

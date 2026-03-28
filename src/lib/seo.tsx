const SITE_URL = "https://jsbizfunding.kr";
const SITE_NAME = "기업정책자금센터";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  const list = [
    { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
    ...items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: item.name,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list,
  };
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbJsonLd(items)),
      }}
    />
  );
}

export function articleJsonLd({
  headline,
  description,
  datePublished,
  image,
}: {
  headline: string;
  description: string;
  datePublished: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified: datePublished,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
    },
    mainEntityOfPage: { "@type": "WebPage" },
    ...(image ? { image } : {}),
  };
}

export function ArticleJsonLd(props: Parameters<typeof articleJsonLd>[0]) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(props)) }}
    />
  );
}

export { SITE_URL, SITE_NAME };

// Генераторы JSON-LD для Schema.org разметки
// Все выводы — plain-объекты, сериализуются в Schema.astro через JSON.stringify

export const SITE_URL = "https://imten.ru";
export const ORG_NAME = "IMTEN";
export const ORG_LEGAL_NAME = "ИП Ларшин И. (IMTEN Digital Agency)";
export const ORG_PHONE = "+7 905 625 26 08";
export const ORG_EMAIL = "i@imten.ru";
export const ORG_TG = "https://t.me/ilyalar";
export const ORG_WA = "https://wa.me/79056252608";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/icons/logo.svg`,
    email: ORG_EMAIL,
    telephone: ORG_PHONE,
    sameAs: [ORG_TG, ORG_WA],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: ORG_PHONE,
        email: ORG_EMAIL,
        availableLanguage: ["Russian", "English"],
      },
    ],
  };
}

export function webSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORG_NAME,
    inLanguage: "ru",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
}

export function serviceLd(p: {
  name: string;
  description: string;
  url: string;
  priceFrom?: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.name,
    description: p.description,
    url: p.url.startsWith("http") ? p.url : `${SITE_URL}${p.url}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    ...(p.priceFrom && {
      offers: {
        "@type": "Offer",
        priceCurrency: "RUB",
        price: p.priceFrom,
        availability: "https://schema.org/InStock",
      },
    }),
    ...(p.areaServed && { areaServed: p.areaServed }),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#localbusiness`,
    name: ORG_NAME,
    image: `${SITE_URL}/assets/icons/logo.svg`,
    url: SITE_URL,
    telephone: ORG_PHONE,
    email: ORG_EMAIL,
    priceRange: "₽₽₽",
    areaServed: ["RU", "NL", "IL"],
  };
}

export function articleLd(p: {
  title: string;
  description: string;
  url: string;
  datePublished: string | Date;
  dateModified?: string | Date;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": p.url },
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished: new Date(p.datePublished).toISOString(),
    dateModified: new Date(p.dateModified || p.datePublished).toISOString(),
    ...(p.image && { image: p.image }),
  };
}

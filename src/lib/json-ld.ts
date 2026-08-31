import { CONTACT_EMAIL, PUBLISHER_NAME, publisherLogoUrl } from "@/lib/publisher";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/site";

export function organizationJsonLd(opts: {
  name: string;
  origin: string;
  logoUrl: string;
  description?: string;
  sameAs?: string[];
}) {
  const origin = opts.origin || SITE_ORIGIN;
  const logo = publisherLogoUrl(origin);
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: opts.name || SITE_NAME,
    url: origin,
    logo: { "@type": "ImageObject", url: logo, width: 600, height: 160 },
    image: logo,
    email: CONTACT_EMAIL,
    founder: { "@type": "Person", name: PUBLISHER_NAME },
    description: opts.description,
    sameAs: opts.sameAs?.filter(Boolean).length ? opts.sameAs.filter(Boolean) : undefined,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial",
      email: CONTACT_EMAIL,
      availableLanguage: "Turkish",
    },
    address: { "@type": "PostalAddress", addressCountry: "TR" },
    areaServed: { "@type": "Country", name: "TR" },
    publishingPrinciples: `${origin}/yayin-ilkeleri`,
    ethicsPolicy: `${origin}/yayin-ilkeleri`,
    correctionsPolicy: `${origin}/duzeltme`,
    ownershipFundingInfo: `${origin}/reklam`,
    actionableFeedbackPolicy: `${origin}/duzeltme`,
  };
}

export function websiteJsonLd(opts: { name: string; origin: string; description?: string }) {
  const origin = opts.origin || SITE_ORIGIN;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opts.name || SITE_NAME,
    url: origin,
    description: opts.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/ara?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  origin: string,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function itemListJsonLd(
  origin: string,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${origin}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
      name: item.name,
    })),
  };
}

export function collectionPageJsonLd(opts: {
  name: string;
  origin: string;
  path: string;
  description?: string;
}) {
  const url = `${opts.origin}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    url,
    description: opts.description,
    isPartOf: { "@type": "WebSite", url: opts.origin },
    inLanguage: "tr-TR",
  };
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

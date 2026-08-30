import { CONTACT_EMAIL, PUBLISHER_NAME } from "@/lib/publisher";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/site";

export function organizationJsonLd(opts: {
  name: string;
  origin: string;
  logoUrl: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: opts.name || SITE_NAME,
    url: opts.origin || SITE_ORIGIN,
    logo: { "@type": "ImageObject", url: opts.logoUrl },
    email: CONTACT_EMAIL,
    founder: { "@type": "Person", name: PUBLISHER_NAME },
    description: opts.description,
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

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

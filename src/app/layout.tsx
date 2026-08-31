import type { Metadata } from "next";
import { figtree } from "@/lib/fonts";
import { INDEX_ROBOTS, OG_LOCALE, rssAlternate } from "@/lib/seo";
import { BRAND_LOGO, HOME_TITLE, SITE_ORIGIN, SITE_TAGLINE, TITLE_SUFFIX } from "@/lib/site";
import { supabaseOrigin } from "@/lib/supabase-origin";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: `${HOME_TITLE} | ${TITLE_SUFFIX}`,
  description: SITE_TAGLINE,
  robots: INDEX_ROBOTS,
  alternates: { types: rssAlternate() },
  icons: {
    icon: [{ url: BRAND_LOGO.favicon, type: "image/svg+xml" }],
    shortcut: BRAND_LOGO.favicon,
    apple: BRAND_LOGO.favicon,
  },
  openGraph: { locale: OG_LOCALE, siteName: TITLE_SUFFIX, type: "website" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storage = supabaseOrigin();
  return (
    <html lang="tr" className={figtree.variable} suppressHydrationWarning>
      <head>
        {storage ? (
          <>
            <link rel="preconnect" href={storage} />
            <link rel="dns-prefetch" href={storage} />
          </>
        ) : null}
      </head>
      <body
        className="min-h-screen bg-white font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

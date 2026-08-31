import type { NextConfig } from "next";

function supabaseImageHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseImageHost();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["sharp"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-Robots-Tag",
            value: "max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon.svg",
        permanent: true,
      },
      {
        source: "/haber/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/emekli-maasi-hesaplama",
        destination: "/arac/emekli-maasi-hesaplama",
        permanent: true,
      },
      {
        source: "/gizlilik",
        destination: "/yasal/gizlilik",
        permanent: true,
      },
      {
        source: "/cerez-politikasi",
        destination: "/yasal/cerez-politikasi",
        permanent: true,
      },
      {
        source: "/kvkk-saklama-imha",
        destination: "/yasal/kvkk-saklama-imha",
        permanent: true,
      },
      {
        source: "/kvkk-basvuru-formu",
        destination: "/yasal/kvkk-basvuru-formu",
        permanent: true,
      },
      {
        source: "/hakkimizda",
        destination: "/",
        permanent: true,
      },
      {
        source:
          "/:category((?!kategori|admin|api|blog|haber|arac|araclar|yazar|ara|arsiv|yasal|fonts|images|t)[^/]+)/:slug([^/.]+)",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 144, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "emekliler.org" },
      { protocol: "https", hostname: "www.emekliler.org" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

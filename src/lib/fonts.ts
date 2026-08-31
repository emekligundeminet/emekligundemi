import localFont from "next/font/local";

/** Yalnızca roman preload: italic LCP kapağıyla bant yarışıyordu. */
export const figtree = localFont({
  src: [
    {
      path: "../../public/fonts/Figtree-VariableFont_wght.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-figtree",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});

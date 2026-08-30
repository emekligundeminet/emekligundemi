import localFont from "next/font/local";

export const figtree = localFont({
  src: [
    {
      path: "../../public/fonts/Figtree-VariableFont_wght.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Figtree-Italic-VariableFont_wght.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-figtree",
  display: "swap",
  preload: true,
});

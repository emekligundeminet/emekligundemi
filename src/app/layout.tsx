import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Haberbot",
    template: "Haberbot | %s",
  },
  description: "Yerel haber sitesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme/ThemeScript";

export const metadata: Metadata = {
  title: "AEM - Saha İş Takip ve Depo Yönetim Sistemi",
  description: "Saha iş takip ve depo/envanter yönetim sistemi",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}


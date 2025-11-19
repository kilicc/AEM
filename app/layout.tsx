import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme/ThemeScript";

export const metadata: Metadata = {
  title: "AEM - Saha İş Takip ve Depo Yönetim Sistemi",
  description: "Saha iş takip ve depo/envanter yönetim sistemi",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

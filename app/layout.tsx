import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEM - Saha İş Takip ve Depo Yönetim Sistemi",
  description: "Saha iş takip ve depo/envanter yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}


import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KelontongSync - Manajemen Warung Modern",
  description: "Solusi kasir (POS), inventaris, dan laporan keuangan cerdas untuk warung dan UMKM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

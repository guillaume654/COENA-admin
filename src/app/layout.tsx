import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

// Placeholder typography — replace with COENA brand fonts (see globals.css tokens).
const sans = Inter({ variable: "--font-sans-brand", subsets: ["latin"] });
const serif = Playfair_Display({ variable: "--font-serif-brand", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COENA Cave",
  description: "Gestion de stock et de cave pour sommeliers, F&B managers et responsables de cave.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

// COENA brand typography: Cormorant Garamond (headlines, 600/700), Inter (body, 300/400/500).
const sans = Inter({ variable: "--font-sans-brand", subsets: ["latin"], weight: ["300", "400", "500"] });
const serif = Cormorant_Garamond({ variable: "--font-serif-brand", subsets: ["latin"], weight: ["600", "700"] });

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

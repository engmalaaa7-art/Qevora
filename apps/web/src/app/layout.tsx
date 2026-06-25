import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { DEFAULT_LIGHT_THEME, generateCSSVariables } from "@qevora/design-system";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qevora — From Words to Website",
  description: "AI-powered bilingual website generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cssVariables = generateCSSVariables(DEFAULT_LIGHT_THEME);

  return (
    <html lang="en" className={`${inter.variable} ${cairo.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body className="antialiased font-primary">
        {children}
      </body>
    </html>
  );
}

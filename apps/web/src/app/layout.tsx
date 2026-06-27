import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const rubik = Rubik({
  subsets: ["latin", "arabic"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qevora — From Words to Website",
  description:
    "AI-powered bilingual website generation platform. Transform your vision into a professional-grade digital experience in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`dark ${rubik.variable}`}>
      <body className="font-rubik antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

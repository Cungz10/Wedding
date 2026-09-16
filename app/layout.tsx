import type { Metadata } from "next";
import { Cormorant_Garamond, Karla } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Nol ke Nikah",
  description: "Perencana pernikahan mobile-first untuk pasangan Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ivory font-body text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

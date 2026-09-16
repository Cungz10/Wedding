import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import "./globals.css";

const display = localFont({
  src: [
    {
      path: "../public/fonts/CormorantGaramond-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/CormorantGaramond-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
});

const body = localFont({
  src: [
    {
      path: "../public/fonts/Karla-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Karla-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
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

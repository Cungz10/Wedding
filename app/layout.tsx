import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

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
    <html lang="id">
      <body className="bg-ivory text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

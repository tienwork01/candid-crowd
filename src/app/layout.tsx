import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import { QueryProvider } from "@/components/providers";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CandidCrowd — Every guest. Every perspective.",
  description:
    "Get the photos your guests already take. One QR code, one shared event gallery. No app. No guest account.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${serif.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

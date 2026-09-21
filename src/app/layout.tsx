import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { QueryProvider } from "@/components/providers";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Playfair_Display({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://candidcrowd.com"),
  title: {
    default: "CandidCrowd",
    template: "%s | CandidCrowd",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable}`}>
        <QueryProvider>{children}</QueryProvider>
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics gaId="G-REK9J5QXX2" />
        )}
      </body>
    </html>
  );
}

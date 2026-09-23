import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { QueryProvider } from "@/components/providers";
import { PWAProvider } from "@/features/pwa/components";
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
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CandidCrowd",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#46533a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable}`}>
        <QueryProvider>
          <PWAProvider>{children}</PWAProvider>
        </QueryProvider>
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics gaId="G-REK9J5QXX2" />
        )}
      </body>
    </html>
  );
}

import { AppLocaleProvider } from "@/components/providers";

export default function GuestRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLocaleProvider>{children}</AppLocaleProvider>;
}

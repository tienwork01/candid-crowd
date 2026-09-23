import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { OfflineView } from "./offline-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Offline | CandidCrowd",
    description:
      "You are currently offline. CandidCrowd preserves your uploads and will sync when you are back online.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OfflinePage() {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OfflineView />
    </NextIntlClientProvider>
  );
}

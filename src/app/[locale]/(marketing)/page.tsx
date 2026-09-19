import { setRequestLocale } from "next-intl/server";
import { MotionProvider } from "@/components/shared";
import { isAppLocale, type AppLocale } from "@/i18n/locales";
import {
  Header,
  Hero,
  TrustStrip,
  HowItWorks,
  ProblemSection,
  GuestDemo,
  ParticipationPreview,
  EventLifecycle,
  PrivacySection,
  EventTypes,
  EarlyAccess,
  FinalCta,
  Footer,
  StructuredData,
} from "@/features/marketing/components";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const marketingLocale = isAppLocale(locale) ? (locale as AppLocale) : "en";

  return (
    <MotionProvider>
      <Header locale={marketingLocale} />
      <main id="main">
        <Hero locale={marketingLocale} />
        <TrustStrip />
        <HowItWorks />
        <ProblemSection />
        <GuestDemo />
        <ParticipationPreview />
        <EventLifecycle />
        <PrivacySection />
        <EventTypes />
        <EarlyAccess />
        <FinalCta />
      </main>
      <Footer />
      {isAppLocale(locale) && <StructuredData locale={locale as AppLocale} />}
    </MotionProvider>
  );
}

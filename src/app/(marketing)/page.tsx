import { MotionProvider } from "@/components/shared";
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
} from "@/features/marketing/components";

export default function HomePage() {
  return (
    <MotionProvider>
      <Header />
      <main id="main">
        <Hero />
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
    </MotionProvider>
  );
}

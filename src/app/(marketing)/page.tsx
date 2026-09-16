import { MotionProvider } from "@/components/shared";
import {
  Header,
  Hero,
  GuestDemo,
  ProblemSection,
  HowItWorks,
  ParticipationPreview,
  EventLifecycle,
  PrivacySection,
  EventTypes,
  Pricing,
  FinalCta,
  Footer,
} from "@/features/marketing/components";

export default function HomePage() {
  return (
    <MotionProvider>
      <Header />
      <main id="main">
        <Hero />
        <GuestDemo />
        <ProblemSection />
        <HowItWorks />
        <ParticipationPreview />
        <EventLifecycle />
        <PrivacySection />
        <EventTypes />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </MotionProvider>
  );
}

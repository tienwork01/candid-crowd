import { MotionProvider } from "@/components/shared/motion-provider";
import { Header } from "@/features/marketing/components/header";
import { Hero } from "@/features/marketing/components/hero";
import { GuestDemo } from "@/features/marketing/components/guest-demo";
import { ProblemSection } from "@/features/marketing/components/problem-section";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { ParticipationPreview } from "@/features/marketing/components/participation-preview";
import { EventLifecycle } from "@/features/marketing/components/event-lifecycle";
import { PrivacySection } from "@/features/marketing/components/privacy-section";
import { EventTypes } from "@/features/marketing/components/event-types";
import { Pricing } from "@/features/marketing/components/pricing";
import { FinalCta } from "@/features/marketing/components/final-cta";
import { Footer } from "@/features/marketing/components/footer";

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

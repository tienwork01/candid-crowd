import Link from "next/link";
import { Aperture, ArrowUpRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-title">
      <Aperture size={39} strokeWidth={1.1} aria-hidden="true" />
      <span className="eyebrow">EVERY GUEST. EVERY PERSPECTIVE.</span>
      <h2 id="final-title">
        Your guests are already
        <br />
        taking the photos.
        <br />
        <em>Bring them together.</em>
      </h2>
      <Link href="/events/new" className="button">
        Create your event free <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <p>No app. No guest account. All the good stuff.</p>
    </section>
  );
}

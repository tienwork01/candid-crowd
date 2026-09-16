import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { HeroScene } from "./hero-scene";

export function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero__copy">
        <span className="eyebrow">
          <span className="status-dot" /> LITTLE MOMENTS. ALL TOGETHER.
        </span>
        <h1 id="hero-title">
          Get the photos
          <br />
          your guests
          <br />
          <em>already take.</em>
        </h1>
        <p className="hero__description">
          One QR code gives everyone at your event a simple place to share their
          photos and videos. <strong>No app. No account.</strong>
        </p>
        <div className="hero__actions">
          <Link href="/events/new" className="button">
            Create your event free <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <a href="#how-it-works" className="inline-action">
            See how it works <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="hero__trust">
          <span>
            <Check aria-hidden="true" /> No app
          </span>
          <span>
            <LockKeyhole aria-hidden="true" /> Private
          </span>
          <span>
            <Sparkles aria-hidden="true" /> Original quality
          </span>
        </div>
      </div>
      <HeroScene />
    </section>
  );
}

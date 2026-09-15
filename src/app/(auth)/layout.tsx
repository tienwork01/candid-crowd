import Image from "next/image";
import { Sparkles } from "lucide-react";
import "@/features/auth/components/auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <main id="main" className="auth-page__main">
        <div className="auth-page__content">{children}</div>
        <div className="auth-page__visual" aria-hidden="true">
          {/* Main cinematic photo frame */}
          <figure className="auth-page__hero-frame">
            <Image
              src="/images/countryside.jpg"
              alt="Couple holding hands while walking through the countryside in golden hour"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              quality={90}
              priority
              className="auth-page__hero-img"
            />
            <figcaption className="auth-page__hero-quote">
              <span className="auth-page__hero-tag">
                THE MOMENTS IN BETWEEN
              </span>
              <p className="auth-page__hero-text">
                Every guest.
                <br />
                <em>A different perspective.</em>
              </p>
              <span className="auth-page__hero-sub">
                The memories you almost missed.
              </span>
            </figcaption>
          </figure>

          {/* Overlapping candid polaroid card */}
          <div className="auth-page__polaroid">
            <div className="auth-page__polaroid-media">
              <Image
                src="/images/wedding-sunset.webp"
                alt="A bride and groom smiling at each other in warm sunset light"
                fill
                sizes="240px"
                quality={85}
              />
            </div>
            <div className="auth-page__polaroid-caption">
              <span>Golden hour · Table 04</span>
            </div>
          </div>

          {/* Floating live participation badge */}
          <div className="auth-page__badge">
            <Sparkles size={13} className="auth-page__badge-icon" />
            <span>184 candid moments captured</span>
          </div>
        </div>
      </main>
    </div>
  );
}

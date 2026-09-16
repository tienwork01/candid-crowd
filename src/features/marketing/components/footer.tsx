import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { navigation } from "../data/marketing";

export function Footer() {
  return (
    <footer className="site-footer container">
      <div className="site-footer__brand">
        <Brand />
        <p>Shared memories for every event.</p>
        <span>Made for the moments in between.</span>
      </div>
      <nav aria-label="Footer product links">
        <h2>Product</h2>
        {navigation.map((item) => (
          <Link className="site-footer__link" key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <nav aria-label="Footer event links">
        <h2>Events</h2>
        {[
          { label: "Weddings", href: "/#weddings" },
          { label: "Birthdays", href: "/#birthdays" },
          { label: "Graduations", href: "/#graduations" },
          { label: "Corporate Events", href: "/#company-events" },
        ].map((item) => (
          <Link className="site-footer__link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <nav aria-label="Legal policies">
        <h2>The essentials</h2>
        <Link className="site-footer__link" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="site-footer__link" href="/terms">
          Terms of Service
        </Link>
        <span className="site-footer__preview-label">Official policies</span>
      </nav>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} CandidCrowd</span>
        <span>First chapter · Product preview</span>
      </div>
    </footer>
  );
}

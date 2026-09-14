import { Brand } from "@/components/shared/brand";
import { navigation } from "../data/marketing";
import { PreviewNotice } from "./preview-notice";

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
          <a className="site-footer__link" key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <nav aria-label="Footer event links">
        <h2>Events</h2>
        {[
          { label: "Weddings", href: "weddings" },
          { label: "Birthdays", href: "birthdays" },
          { label: "Graduations", href: "graduations" },
          { label: "Corporate Events", href: "company-events" },
        ].map((item) => (
          <a
            className="site-footer__link"
            href={`#${item.href}`}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <nav aria-label="Legal preview notices">
        <h2>The essentials</h2>
        <PreviewNotice kind="privacy">Privacy</PreviewNotice>
        <PreviewNotice kind="terms">Terms</PreviewNotice>
        <span className="site-footer__preview-label">
          Policies in preparation
        </span>
      </nav>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} CandidCrowd</span>
        <span>First chapter · Product preview</span>
      </div>
    </footer>
  );
}

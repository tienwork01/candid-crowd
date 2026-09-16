import Link from "next/link";
import { Aperture, Plus } from "lucide-react";
import { HostAccountMenu } from "@/features/host/components/host-account-menu";
import { siteConfig } from "@/lib/config";

type HostShellProps = {
  active: "events" | "new" | "profile" | "billing";
  children: React.ReactNode;
};

const navigation = [
  { href: "/events", key: "events", label: "Events" },
] as const;

export function HostShell({ active, children }: HostShellProps) {
  const privacyHref = siteConfig.marketingUrl
    ? `${siteConfig.marketingUrl}/privacy`
    : "/privacy";
  const termsHref = siteConfig.marketingUrl
    ? `${siteConfig.marketingUrl}/terms`
    : "/terms";

  return (
    <div className="host-shell">
      <header className="host-shell__header">
        <div className="host-shell__header-inner">
          <Link
            className="host-shell__brand"
            href="/events"
            aria-label="CandidCrowd host workspace"
          >
            <Aperture size={21} aria-hidden="true" />
            <span>CandidCrowd</span>
          </Link>
          <nav className="host-shell__nav" aria-label="Host workspace">
            {navigation.map((item) => (
              <Link
                aria-current={active === item.key ? "page" : undefined}
                className="host-shell__nav-link"
                href={item.href}
                key={item.key}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="host-shell__account">
            <Link
              aria-current={active === "new" ? "page" : undefined}
              aria-label="Create a new event"
              className="host-shell__create"
              href="/events/new"
            >
              <Plus size={16} aria-hidden="true" />
              <span>New event</span>
            </Link>
            <HostAccountMenu
              active={
                active === "profile" || active === "billing"
                  ? active
                  : undefined
              }
            />
          </div>
        </div>
      </header>
      <main id="main" className="host-shell__main">
        {children}
      </main>
      <footer className="host-shell__footer">
        <div className="host-shell__footer-inner">
          <p>© {new Date().getFullYear()} CandidCrowd</p>
          <nav aria-label="Workspace footer">
            <a href={`mailto:${siteConfig.supportEmail}`}>Help</a>
            <Link href={privacyHref}>Privacy</Link>
            <Link href={termsHref}>Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

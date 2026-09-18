import Link from "next/link";
import { Aperture } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { HostAccountMenu, type UserPlan } from "./host-account-menu";
import { siteConfig } from "@/lib/config";

type HostShellProps = {
  active: "events" | "new" | "profile" | "billing";
  plan?: UserPlan;
  children: React.ReactNode;
};

export async function HostShell({ active, plan, children }: HostShellProps) {
  const t = await getTranslations("host.shell");
  const privacyHref = siteConfig.marketingUrl
    ? `${siteConfig.marketingUrl}/privacy`
    : "/privacy";
  const termsHref = siteConfig.marketingUrl
    ? `${siteConfig.marketingUrl}/terms`
    : "/terms";

  const navigation = [
    { href: "/events", key: "events", label: t("events") },
  ] as const;

  return (
    <div className="host-shell">
      <header className="host-shell__header">
        <div className="host-shell__header-inner">
          <Link
            className="host-shell__brand"
            href="/events"
            aria-label={t("brandAria")}
          >
            <Aperture size={21} aria-hidden="true" />
            <span>CandidCrowd</span>
          </Link>
          <nav className="host-shell__nav" aria-label={t("navAria")}>
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
            <HostAccountMenu
              active={
                active === "profile" || active === "billing" || active === "new"
                  ? active
                  : undefined
              }
              plan={plan}
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
          <nav aria-label={t("footerAria")}>
            <a href={`mailto:${siteConfig.supportEmail}`}>{t("help")}</a>
            <Link href={privacyHref}>{t("privacy")}</Link>
            <Link href={termsHref}>{t("terms")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

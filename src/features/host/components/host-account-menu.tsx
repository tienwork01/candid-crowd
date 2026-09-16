"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretDown, CreditCard, SignOut, User } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function HostAccountMenu({
  active,
}: {
  active?: "profile" | "billing";
}) {
  const t = useTranslations("host.accountMenu");
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const name = session?.user.name || t("yourAccount");
  const email = session?.user.email || t("signInToManage");
  const avatarStyle = session?.user.image
    ? { backgroundImage: `url("${session.user.image}")` }
    : undefined;
  const avatarClassName = `host-account-menu__avatar${session?.user.image ? " host-account-menu__avatar--image" : ""}`;

  return (
    <details className="host-account-menu">
      <summary aria-label={t("openMenuAria")}>
        <span
          className={avatarClassName}
          style={avatarStyle}
          aria-hidden="true"
        >
          {initials(name) || "CC"}
        </span>
        <span className="host-account-menu__summary-copy">
          <strong>{name}</strong>
          <small>{t("freePlan")}</small>
        </span>
        <CaretDown
          className="host-account-menu__chevron"
          size={16}
          aria-hidden="true"
        />
      </summary>
      <div className="host-account-menu__panel">
        <div className="host-account-menu__identity">
          <span
            className={avatarClassName}
            style={avatarStyle}
            aria-hidden="true"
          >
            {initials(name) || "CC"}
          </span>
          <span>
            <strong>{name}</strong>
            <small>{email}</small>
          </span>
        </div>
        <div className="host-account-menu__plan">
          <span>{t("currentPlan")}</span>
          <strong>{t("planFree")}</strong>
        </div>
        <nav aria-label={t("menuAria")}>
          <Link
            aria-current={active === "profile" ? "page" : undefined}
            href="/profile"
          >
            <User size={16} aria-hidden="true" /> {t("profile")}
          </Link>
          <Link
            aria-current={active === "billing" ? "page" : undefined}
            href="/billing"
          >
            <CreditCard size={16} aria-hidden="true" /> {t("planAndBilling")}
          </Link>
        </nav>
        <button
          className="host-account-menu__sign-out"
          type="button"
          onClick={async () => {
            await authClient.signOut();
            router.replace("/login");
            router.refresh();
          }}
        >
          <SignOut size={16} aria-hidden="true" />
          {t("logOut")}
        </button>
      </div>
    </details>
  );
}

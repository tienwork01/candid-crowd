"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretDown, CreditCard, SignOut, User } from "@phosphor-icons/react";
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
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const name = session?.user.name || "Your account";
  const email = session?.user.email || "Sign in to manage your account";
  const avatarStyle = session?.user.image
    ? { backgroundImage: `url("${session.user.image}")` }
    : undefined;
  const avatarClassName = `host-account-menu__avatar${session?.user.image ? " host-account-menu__avatar--image" : ""}`;

  return (
    <details className="host-account-menu">
      <summary aria-label="Open account menu">
        <span
          className={avatarClassName}
          style={avatarStyle}
          aria-hidden="true"
        >
          {initials(name) || "CC"}
        </span>
        <span className="host-account-menu__summary-copy">
          <strong>{name}</strong>
          <small>Free plan</small>
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
          <span>Current plan</span>
          <strong>Free</strong>
        </div>
        <nav aria-label="Account menu">
          <Link
            aria-current={active === "profile" ? "page" : undefined}
            href="/profile"
          >
            <User size={16} aria-hidden="true" /> Profile
          </Link>
          <Link
            aria-current={active === "billing" ? "page" : undefined}
            href="/billing"
          >
            <CreditCard size={16} aria-hidden="true" /> Plan &amp; billing
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
          Log out
        </button>
      </div>
    </details>
  );
}

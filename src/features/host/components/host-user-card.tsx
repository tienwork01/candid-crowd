"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  CreditCard,
  Images,
  Lightbulb,
  User,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useHostProfile } from "../hooks";

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getPlanBadgeStyle(plan: string) {
  switch (plan) {
    case "plus":
      return "border-0 bg-amber-500/15 text-amber-900";
    case "essential":
      return "border-0 bg-primary text-primary-foreground";
    case "free":
    default:
      return "border-0 bg-sage text-primary";
  }
}

function formatDate(dateStr: string | Date | undefined, locale: string) {
  if (!dateStr) return "";

  try {
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "";
  }
}

export type HostUserCardProps = {
  showChangeAvatar?: boolean;
  className?: string;
  extraSlot?: React.ReactNode;
};

export function HostUserCard({
  showChangeAvatar = false,
  className,
  extraSlot,
}: HostUserCardProps) {
  const t = useTranslations("host.pages");
  const tShell = useTranslations("host.shell");
  const tMenu = useTranslations("host.accountMenu");
  const locale = useLocale();
  const pathname = usePathname();
  const { user, isPending: sessionLoading } = useHostProfile();

  const userPlan = (
    (user as { plan?: string } | undefined)?.plan || "free"
  ).toLowerCase();

  const planLabels: Record<string, string> = {
    free: tMenu("planFree"),
    essential: tMenu("planEssential"),
    plus: tMenu("planPlus"),
  };

  const planLabel = planLabels[userPlan] || tMenu("planFree");

  if (sessionLoading && !user) {
    return (
      <aside
        className={cn("host-user-card host-user-card--loading", className)}
        aria-label={t("profileTitle")}
      >
        <div className="profile-page__sidebar-card animate-pulse">
          <div className="flex flex-col items-center">
            <div className="size-20 rounded-full bg-muted/20 mb-4" />
            <div className="h-5 w-32 bg-muted/25 rounded mb-2" />
            <div className="h-3.5 w-44 bg-muted/15 rounded mb-3" />
            <div className="h-5 w-20 bg-muted/20 rounded-full" />
          </div>
        </div>
      </aside>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.name || tMenu("yourAccount");
  const memberSince = formatDate(user.createdAt, locale);

  const navigation = [
    { href: "/events", label: tShell("events"), icon: Images },
    { href: "/profile", label: tMenu("profile"), icon: User },
    { href: "/billing", label: tMenu("planAndBilling"), icon: CreditCard },
  ];

  return (
    <aside
      className={cn("host-user-card profile-page__sidebar", className)}
      aria-label={t("profileTitle")}
    >
      <div className="profile-page__sidebar-card">
        <div className="profile-page__header">
          <div className="profile-page__avatar">
            <Avatar size="default" className="profile-page__avatar-img">
              {user.image ? (
                <AvatarImage src={user.image} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-sage text-primary font-bold text-xl">
                {initials(displayName) || "CC"}
              </AvatarFallback>
            </Avatar>
            {showChangeAvatar && (
              <button
                type="button"
                className="profile-page__avatar-btn"
                aria-label={t("changeAvatar")}
              >
                <Camera size={16} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
          <h2 className="profile-page__name">{displayName}</h2>
          <p className="profile-page__email">{user.email}</p>
          <div className="profile-page__meta">
            <Badge
              variant="secondary"
              className={cn(
                "h-5 rounded-full px-2.5 py-0 text-[10px] font-bold uppercase tracking-wider border-0",
                getPlanBadgeStyle(userPlan),
              )}
            >
              {planLabel}
            </Badge>
            {memberSince && (
              <span className="profile-page__since">
                {t("memberSince", { date: memberSince })}
              </span>
            )}
          </div>
        </div>

        {/* Quick navigation */}
        <nav
          className="profile-page__sidebar-nav"
          aria-label={tShell("navAria")}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "profile-page__sidebar-link",
                  isActive && "profile-page__sidebar-link--active",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {extraSlot}
    </aside>
  );
}

export function HostTipCard({ className }: { className?: string }) {
  const t = useTranslations("host.pages");

  return (
    <div className={cn("host-events__tip-card", className)}>
      <div className="host-events__tip-icon">
        <Lightbulb size={18} weight="bold" aria-hidden="true" />
      </div>
      <div className="host-events__tip-content">
        <h4>{t("tipTitle")}</h4>
        <p>{t("tipDescription")}</p>
      </div>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CaretDown,
  Check,
  CircleNotch,
  CreditCard,
  DeviceMobile,
  Globe,
  Images,
  Question,
  SignOut,
  User,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui";
import { localeLabels, locales } from "@/i18n/locales";
import { useLocaleSwitcher } from "@/i18n/use-locale-switcher";
import { usePWA } from "@/features/pwa/components";
import { authClient } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api-client";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useHostProfile } from "../hooks";

export type UserPlan = "free" | "essential" | "plus";

function getPlanBadgeStyle(plan: string) {
  switch (plan) {
    case "plus":
      return "border-0 bg-amber-500/15 text-amber-900 dark:text-amber-200";
    case "essential":
      return "border-0 bg-primary text-primary-foreground";
    case "free":
    default:
      return "border-0 bg-sage text-primary";
  }
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export type HostAccountMenuProps = {
  active?: "events" | "profile" | "billing" | "new";
  plan?: UserPlan;
};

const emptySubscribe = () => () => {};

export function HostAccountMenu({ active, plan }: HostAccountMenuProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const pathname = usePathname();

  const {
    currentLocale,
    switchLocale,
    isPending: isLocalePending,
    pendingLocale,
  } = useLocaleSwitcher();
  const t = useTranslations("host.accountMenu");
  const { user, isPending, clear: clearHostCache } = useHostProfile();
  const { canInstall, openInstallPrompt } = usePWA();
  const router = useRouter();

  const currentActive =
    active ||
    (pathname.startsWith("/profile")
      ? "profile"
      : pathname.startsWith("/events/new") || pathname.startsWith("/create")
        ? "new"
        : pathname.startsWith("/billing")
          ? "billing"
          : pathname.startsWith("/events")
            ? "events"
            : undefined);

  const userPlan = (
    plan ||
    (user as { plan?: string } | undefined)?.plan ||
    "free"
  ).toLowerCase();

  const planLabels: Record<string, string> = {
    free: t("planFree"),
    essential: t("planEssential"),
    plus: t("planPlus"),
  };

  const planLabel = planLabels[userPlan] || t("planFree");

  if (!mounted || (isPending && !user)) {
    return (
      <div
        className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl px-2.5 py-1.5 select-none animate-pulse"
        aria-hidden="true"
      >
        <div className="size-8 rounded-full bg-muted/20 shrink-0" />
        <div className="flex flex-col gap-1 text-left min-w-[76px]">
          <div className="h-3 w-16 rounded bg-muted/25" />
          <div className="h-2.5 w-10 rounded bg-muted/15" />
        </div>
        <div className="size-3 rounded-full bg-muted/20 shrink-0 ml-1" />
      </div>
    );
  }

  const name = user?.name || t("yourAccount");
  const email = user?.email || t("signInToManage");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("openMenuAria")}
        className="group inline-flex min-h-[44px] items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-foreground transition-colors duration-150 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer select-none"
      >
        {/* Column 1: Avatar */}
        <Avatar size="default" className="size-8 text-xs font-bold shrink-0">
          {user?.image ? <AvatarImage src={user.image} alt={name} /> : null}
          <AvatarFallback className="bg-sage text-primary font-bold">
            {initials(name) || "CC"}
          </AvatarFallback>
        </Avatar>

        {/* Column 2: User Name (top) and Plan Badge (bottom) */}
        <div className="flex min-w-0 flex-col items-start leading-tight text-left">
          <span className="max-w-[140px] truncate text-xs font-semibold text-foreground">
            {name}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "mt-0.5 h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider shrink-0 rounded-full border-0",
              getPlanBadgeStyle(userPlan),
            )}
          >
            {planLabel}
          </Badge>
        </div>

        {/* Trailing chevron */}
        <CaretDown
          size={12}
          weight="bold"
          className="text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180 group-hover:text-foreground shrink-0 ml-0.5"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        aria-label={t("menuAria")}
        className="w-72 p-1.5 bg-card border border-border shadow-xl rounded-2xl ring-1 ring-foreground/5"
      >
        {/* User Identity Header */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar size="default" className="size-10 text-xs font-bold shrink-0">
            {user?.image ? <AvatarImage src={user.image} alt={name} /> : null}
            <AvatarFallback className="bg-sage text-primary font-bold text-sm">
              {initials(name) || "CC"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <strong className="truncate text-sm font-semibold text-foreground">
                {name}
              </strong>
              <Badge
                variant="secondary"
                className={cn(
                  "h-4.5 px-1.5 text-[9px] font-bold uppercase tracking-wider shrink-0 rounded-full border-0",
                  getPlanBadgeStyle(userPlan),
                )}
              >
                {planLabel}
              </Badge>
            </div>
            <span className="truncate text-xs text-muted-foreground mt-0.5">
              {email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 mx-1" />

        {/* Primary Destinations Group */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href="/events" />}
            nativeButton={false}
            className={cn(
              "min-h-[38px] px-2.5 py-2 gap-3 text-[13px] font-medium cursor-pointer rounded-lg",
              currentActive === "events" &&
                "bg-accent text-accent-foreground font-semibold",
            )}
          >
            <Images size={16} className="text-muted-foreground shrink-0" />
            <span>{t("events")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/profile" />}
            nativeButton={false}
            className={cn(
              "min-h-[38px] px-2.5 py-2 gap-3 text-[13px] font-medium cursor-pointer rounded-lg",
              currentActive === "profile" &&
                "bg-accent text-accent-foreground font-semibold",
            )}
          >
            <User size={16} className="text-muted-foreground shrink-0" />
            <span>{t("profile")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/billing" />}
            nativeButton={false}
            className={cn(
              "min-h-[38px] px-2.5 py-2 gap-3 text-[13px] font-medium cursor-pointer rounded-lg",
              currentActive === "billing" &&
                "bg-accent text-accent-foreground font-semibold",
            )}
          >
            <CreditCard size={16} className="text-muted-foreground shrink-0" />
            <span>{t("planAndBilling")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 mx-1" />

        {/* Preferences & Support */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={isLocalePending}
              className="min-h-[38px] px-2.5 py-2 gap-3 text-[13px] font-medium cursor-pointer rounded-lg"
            >
              {isLocalePending ? (
                <CircleNotch
                  size={16}
                  className="animate-spin text-primary shrink-0"
                />
              ) : (
                <Globe size={16} className="text-muted-foreground shrink-0" />
              )}
              <span>{t("language")}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {localeLabels[currentLocale]}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-38 rounded-xl p-1 shadow-lg border border-border">
              {locales.map((loc) => {
                const isSelected = loc === currentLocale;
                const isTargetPending =
                  isLocalePending && pendingLocale === loc;

                return (
                  <DropdownMenuItem
                    key={loc}
                    disabled={isLocalePending}
                    onClick={() => switchLocale(loc)}
                    className="flex min-h-[34px] items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer rounded-md"
                  >
                    <span
                      className={isSelected ? "font-semibold text-primary" : ""}
                    >
                      {localeLabels[loc]}
                    </span>
                    {isTargetPending ? (
                      <CircleNotch
                        size={13}
                        className="animate-spin text-primary"
                      />
                    ) : isSelected ? (
                      <Check size={13} weight="bold" className="text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {canInstall && (
            <DropdownMenuItem
              onClick={openInstallPrompt}
              className="min-h-[38px] px-2.5 py-2 gap-3 text-[13px] font-medium cursor-pointer rounded-lg text-primary"
            >
              <DeviceMobile size={16} className="text-primary shrink-0" />
              <span>{t("installApp")}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            render={<a href={`mailto:${siteConfig.supportEmail}`} />}
            nativeButton={false}
            className="min-h-[38px] px-2.5 py-2 gap-3 text-[13px] font-medium cursor-pointer rounded-lg"
          >
            <Question size={16} className="text-muted-foreground shrink-0" />
            <span>{t("helpSupport")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 mx-1" />

        {/* Sign Out */}
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            clearHostCache();
            clearAuthTokenCache();
            await authClient.signOut();
            router.replace("/login");
            router.refresh();
          }}
          className="min-h-[38px] px-2.5 py-2 gap-3 text-[13px] font-medium cursor-pointer rounded-lg"
        >
          <SignOut size={16} className="shrink-0" />
          <span>{t("logOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

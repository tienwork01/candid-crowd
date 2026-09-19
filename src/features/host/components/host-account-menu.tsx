"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CaretDown,
  Check,
  CircleNotch,
  CreditCard,
  Globe,
  Plus,
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
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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

export function HostAccountMenu({
  active,
  plan,
}: {
  active?: "profile" | "billing" | "new";
  plan?: UserPlan;
}) {
  const {
    currentLocale,
    switchLocale,
    isPending: isLocalePending,
    pendingLocale,
  } = useLocaleSwitcher();
  const t = useTranslations("host.accountMenu");
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const userPlan = (
    plan ||
    (session?.user as { plan?: string } | undefined)?.plan ||
    "free"
  ).toLowerCase();

  const planLabels: Record<string, string> = {
    free: t("planFree"),
    essential: t("planEssential"),
    plus: t("planPlus"),
  };

  const planLabel = planLabels[userPlan] || t("planFree");

  if (isPending) {
    return (
      <div
        className="inline-flex items-center gap-2.5 bg-transparent p-1 select-none animate-pulse"
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

  const name = session?.user.name || t("yourAccount");
  const email = session?.user.email || t("signInToManage");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("openMenuAria")}
        className="group inline-flex items-center gap-2.5 bg-transparent p-1 text-foreground transition-opacity duration-150 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg cursor-pointer select-none"
      >
        {/* Column 1: Avatar */}
        <Avatar size="default" className="size-8 text-xs font-bold shrink-0">
          {session?.user.image ? (
            <AvatarImage src={session.user.image} alt={name} />
          ) : null}
          <AvatarFallback className="bg-sage text-primary font-bold">
            {initials(name) || "CC"}
          </AvatarFallback>
        </Avatar>

        {/* Column 2: User Name (top) and Plan Badge (bottom) */}
        <div className="flex min-w-0 flex-col items-start leading-tight text-left">
          <span className="max-w-[120px] truncate text-xs font-semibold text-foreground">
            {name}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "mt-0.5 h-3.5 px-1.5 text-[9px] font-bold uppercase tracking-wider shrink-0 rounded-full border-0",
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
        className="w-70 p-1.5 bg-card border border-border shadow-xl rounded-xl"
      >
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <Avatar size="default" className="size-9 text-xs font-bold shrink-0">
            {session?.user.image ? (
              <AvatarImage src={session.user.image} alt={name} />
            ) : null}
            <AvatarFallback className="bg-sage text-primary font-bold">
              {initials(name) || "CC"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <strong className="truncate text-xs font-semibold text-foreground">
              {name}
            </strong>
            <span className="truncate text-[11px] text-muted-foreground mt-0.5">
              {email}
            </span>
          </div>
        </div>

        <div className="my-1 mx-1 flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-2 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground">
            {t("currentPlan")}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider border-0",
              getPlanBadgeStyle(userPlan),
            )}
          >
            {planLabel}
          </Badge>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href="/events/new" />}
            nativeButton={false}
            className={
              active === "new"
                ? "bg-accent text-accent-foreground font-medium"
                : ""
            }
          >
            <Plus size={16} />
            <span>{t("newEvent")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/profile" />}
            nativeButton={false}
            className={
              active === "profile"
                ? "bg-accent text-accent-foreground font-medium"
                : ""
            }
          >
            <User size={16} />
            <span>{t("profile")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/billing" />}
            nativeButton={false}
            className={
              active === "billing"
                ? "bg-accent text-accent-foreground font-medium"
                : ""
            }
          >
            <CreditCard size={16} />
            <span>{t("planAndBilling")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isLocalePending}>
            {isLocalePending ? (
              <CircleNotch size={16} className="animate-spin text-primary" />
            ) : (
              <Globe size={16} />
            )}
            <span>{t("language")}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {localeLabels[currentLocale]}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-36">
            {locales.map((loc) => {
              const isSelected = loc === currentLocale;
              const isTargetPending = isLocalePending && pendingLocale === loc;

              return (
                <DropdownMenuItem
                  key={loc}
                  disabled={isLocalePending}
                  onClick={() => switchLocale(loc)}
                  className="flex items-center justify-between cursor-pointer"
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

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await authClient.signOut();
            router.replace("/login");
            router.refresh();
          }}
        >
          <SignOut size={16} />
          <span>{t("logOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

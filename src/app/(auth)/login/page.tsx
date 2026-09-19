import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/features/auth/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.pages");

  return { title: t("loginMetaTitle") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const target =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/profile";

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true, disableRefresh: true },
    });

    if (session?.session && session.user) {
      redirect(target);
    }
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err; // Next.js redirect throws a digest error that must be rethrown
    }
  }

  return (
    <AuthForm
      mode="login"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}

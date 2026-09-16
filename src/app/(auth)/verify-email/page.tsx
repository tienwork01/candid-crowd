import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountRecovery } from "@/features/auth/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.pages");

  return { title: t("verifyEmailMetaTitle") };
}

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const { email, next } = await searchParams;

  return (
    <AccountRecovery
      mode="verify-email"
      email={typeof email === "string" ? email : undefined}
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountRecovery } from "@/features/auth/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.pages");

  return { title: t("forgotPasswordMetaTitle") };
}

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  const { next } = await searchParams;

  return (
    <AccountRecovery
      mode="forgot-password"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}

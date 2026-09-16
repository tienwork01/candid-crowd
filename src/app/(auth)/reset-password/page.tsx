import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountRecovery } from "@/features/auth/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.pages");

  return { title: t("resetPasswordMetaTitle") };
}

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token, next } = await searchParams;

  return (
    <AccountRecovery
      mode="reset-password"
      token={typeof token === "string" ? token : undefined}
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}

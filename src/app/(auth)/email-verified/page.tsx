import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EmailVerificationSuccess } from "@/features/auth/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.pages");

  return { title: t("emailVerifiedMetaTitle") };
}

export default async function EmailVerifiedPage({
  searchParams,
}: PageProps<"/email-verified">) {
  const { error, next } = await searchParams;

  return (
    <EmailVerificationSuccess
      error={typeof error === "string" ? error : undefined}
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}

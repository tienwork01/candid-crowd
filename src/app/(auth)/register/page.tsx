import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/features/auth/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.pages");

  return { title: t("registerMetaTitle") };
}

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { next } = await searchParams;

  return (
    <AuthForm
      mode="register"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}

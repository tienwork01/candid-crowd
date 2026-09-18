import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GuestPageClient } from "@/features/event/components";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

export default async function GuestEventPage({ params }: Props) {
  const { slug } = await params;

  return <GuestPageClient slug={slug} />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/features/marketing/components";
import { NotFoundView } from "@/features/not-found/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LocalizedNotFound() {
  return (
    <div className="not-found-page">
      <Header />
      <NotFoundView />
    </div>
  );
}

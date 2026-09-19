import { getTranslations } from "next-intl/server";
import { AppLocaleProvider } from "@/components/providers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("common");

  return (
    <AppLocaleProvider>
      <a className="skip-link" href="#main">
        {t("skipToContent")}
      </a>
      {children}
    </AppLocaleProvider>
  );
}

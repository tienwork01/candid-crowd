"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const t = useTranslations("auth.ui");
  const router = useRouter();

  return (
    <button
      className="text-button"
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      {t("logOut")}
    </button>
  );
}

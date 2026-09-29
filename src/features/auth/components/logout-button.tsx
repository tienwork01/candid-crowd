"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api-client";

export function LogoutButton() {
  const t = useTranslations("auth.ui");
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <button
      className="text-button"
      type="button"
      onClick={async () => {
        queryClient.clear();
        clearAuthTokenCache();
        await authClient.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      {t("logOut")}
    </button>
  );
}

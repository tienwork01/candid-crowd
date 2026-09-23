"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { appFetch, clearAuthTokenCache } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/errors";

export type DeleteAccountResponse = {
  success: boolean;
};

/**
 * Clean Architecture Mutation Hook for soft-deleting the authenticated host account.
 * Encapsulates network transport, Better Auth cache invalidation, and UI redirect.
 */
export function useDeleteAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const tPages = useTranslations("host.pages");
  const tErrors = useTranslations("common.errors");

  return useMutation<DeleteAccountResponse, Error>({
    mutationFn: async () => {
      return appFetch<DeleteAccountResponse>("/api/v1/account/delete", {
        method: "POST",
      });
    },
    onSuccess: async () => {
      queryClient.clear();
      clearAuthTokenCache();
      await authClient.signOut();
      toast.success(tPages("deleteAccount"));
      router.replace("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, undefined, tErrors));
    },
  });
}

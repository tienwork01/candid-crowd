"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";

export interface UserAccountItem {
  id: string;
  providerId: string;
  accountId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function useUserAccounts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.host.accounts,
    queryFn: async () => {
      const response = await authClient.listAccounts();

      if (response.error) {
        throw response.error;
      }

      return (response.data ?? []) as UserAccountItem[];
    },
    staleTime: CACHE_TIMES.STATIC.staleTime,
    gcTime: CACHE_TIMES.STATIC.gcTime,
    refetchOnWindowFocus: false,
  });

  const accounts = query.data ?? [];
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  );
  const isSocialOnly = accounts.length > 0 && !hasPassword;

  return {
    ...query,
    accounts,
    hasPassword,
    isSocialOnly,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.host.accounts }),
  };
}

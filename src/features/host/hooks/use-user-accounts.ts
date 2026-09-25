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

const ACCOUNTS_CACHE_KEY = "candidcrowd_host_accounts_cache";

function getCachedAccounts(): UserAccountItem[] | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = sessionStorage.getItem(ACCOUNTS_CACHE_KEY);

    return raw ? (JSON.parse(raw) as UserAccountItem[]) : undefined;
  } catch {
    return undefined;
  }
}

function setCachedAccounts(data: UserAccountItem[] | null) {
  if (typeof window === "undefined") return;

  try {
    if (data) {
      sessionStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(ACCOUNTS_CACHE_KEY);
    }
  } catch {}
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

      const items = (response.data ?? []) as UserAccountItem[];

      setCachedAccounts(items);

      return items;
    },
    initialData: () => getCachedAccounts(),
    initialDataUpdatedAt: () => 0,
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

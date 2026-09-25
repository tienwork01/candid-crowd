"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";

const PROFILE_CACHE_KEY = "candidcrowd_host_profile_cache";

function getCachedProfile() {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);

    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function setCachedProfile(data: unknown) {
  if (typeof window === "undefined") return;

  try {
    if (data) {
      sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch {}
}

export function useHostProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.host.profile,
    queryFn: async () => {
      const response = await authClient.getSession();

      if (response.error) {
        throw response.error;
      }

      const result = response.data ?? null;

      if (result) {
        setCachedProfile(result);
      }

      return result;
    },
    initialData: () => getCachedProfile(),
    initialDataUpdatedAt: () => 0,
    staleTime: CACHE_TIMES.STATIC.staleTime,
    gcTime: CACHE_TIMES.STATIC.gcTime,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    session: query.data?.session ?? null,
    user: query.data?.user ?? null,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.host.profile }),
    clear: () => {
      setCachedProfile(null);

      return queryClient.removeQueries({ queryKey: ["host"] });
    },
  };
}

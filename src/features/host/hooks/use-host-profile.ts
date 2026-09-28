"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";

const PROFILE_CACHE_KEY = "candidcrowd_host_profile_cache";

type HostProfile = Awaited<
  ReturnType<typeof authClient.getSession>
>["data"] extends infer Data
  ? Exclude<Data, undefined> | null
  : never;

function getCachedProfile(): HostProfile | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);

    return raw ? (JSON.parse(raw) as HostProfile) : undefined;
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

      const result = (response.data ?? null) as HostProfile;

      if (result) {
        setCachedProfile(result);
      }

      return result;
    },
    staleTime: CACHE_TIMES.STATIC.staleTime,
    gcTime: CACHE_TIMES.STATIC.gcTime,
    refetchOnWindowFocus: false,
  });

  // The sessionStorage snapshot is only readable in the browser, so seeding it
  // during render would make the first client render disagree with the server
  // HTML. Restore it after hydration instead; the query cache keeps it for the
  // rest of the session, so client-side navigations still skip the skeleton.
  useEffect(() => {
    if (queryClient.getQueryData(QUERY_KEYS.host.profile) !== undefined) return;

    const cached = getCachedProfile();

    if (cached) {
      queryClient.setQueryData(QUERY_KEYS.host.profile, cached, {
        updatedAt: 0,
      });
    }
  }, [queryClient]);

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

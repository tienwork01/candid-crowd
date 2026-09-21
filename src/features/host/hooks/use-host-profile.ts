"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";

export function useHostProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.host.profile,
    queryFn: async () => {
      const response = await authClient.getSession();

      if (response.error) {
        throw response.error;
      }

      return response.data ?? null;
    },
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
    clear: () => queryClient.removeQueries({ queryKey: ["host"] }),
  };
}

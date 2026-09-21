/**
 * Centralized cache time policies and query keys for TanStack Query.
 */

export const CACHE_TIMES = {
  /**
   * Ultra-static data: templates, print presets, immutable definitions.
   * Stays fresh indefinitely; garbage collected after 24 hours.
   */
  IMMUTABLE: {
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  },

  /**
   * Rarely-changing data: host user profile/session, public guest event metadata.
   * Stays fresh for 15 minutes; kept in memory for 60 minutes.
   */
  STATIC: {
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  },

  /**
   * Standard application resources: host events list, single event configuration/overview.
   * Stays fresh for 5 minutes; kept in memory for 30 minutes.
   */
  STANDARD: {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },

  /**
   * Moderately-changing data: gallery media items, overview counters.
   * Stays fresh for 1 minute; kept in memory for 10 minutes.
   */
  FREQUENT: {
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },

  /**
   * Realtime feeds: live wall active stream, live reactions.
   * Stays fresh for 15 seconds; kept in memory for 5 minutes.
   */
  REALTIME: {
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  },
} as const;

export const QUERY_KEYS = {
  host: {
    profile: ["host", "profile"] as const,
  },
  event: {
    all: ["events"] as const,
    list: (params?: unknown) => ["events", params] as const,
    detail: (idOrSlug: string) => ["event", idOrSlug] as const,
    public: (slug: string) => ["public-event", slug] as const,
  },
} as const;

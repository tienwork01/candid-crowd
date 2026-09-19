"use client";

import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { EventListParams, EventSortOption } from "../types/event-list";
import type { EventType } from "../types/event";
import { DEFAULT_PER_PAGE } from "../types/event-list";

/**
 * Synchronizes event-list query parameters with URL search params.
 *
 * - Changing `q` or `type` auto-resets `page` to 1.
 * - Uses `router.replace()` to avoid cluttering browser history.
 * - Search input is debounced (300 ms) before updating the URL.
 */
export function useEventListParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local input state (uncontrolled by URL until debounce fires)
  const urlQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(urlQuery);

  // Sync local input when URL changes externally (back/forward navigation)
  const prevUrlQuery = useRef(urlQuery);

  useEffect(() => {
    if (urlQuery !== prevUrlQuery.current) {
      setInputValue(urlQuery);
      prevUrlQuery.current = urlQuery;
    }
  }, [urlQuery]);

  // Parsed params from URL
  const params: Required<EventListParams> = useMemo(() => {
    const page = Number(searchParams.get("page")) || 1;
    const q = searchParams.get("q") || "";
    const type = (searchParams.get("type") as EventType) || undefined;
    const sort = (searchParams.get("sort") as EventSortOption) || "newest";

    return {
      page,
      per_page: DEFAULT_PER_PAGE,
      q,
      type: type as EventType,
      sort,
    };
  }, [searchParams]);

  // Build & push URL with updated params
  const pushParams = useCallback(
    (updates: Partial<EventListParams>) => {
      const next = new URLSearchParams(searchParams.toString());

      // When search or type changes, reset to page 1
      const resetsPage = "q" in updates || "type" in updates;

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "" || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      if (resetsPage) {
        next.delete("page");
      }

      // Clean up defaults
      if (next.get("page") === "1") next.delete("page");
      if (next.get("sort") === "newest") next.delete("sort");

      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;

      router.replace(url, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Debounced search update
  const setSearch = useCallback(
    (value: string) => {
      setInputValue(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        pushParams({ q: value || undefined });
      }, 300);
    },
    [pushParams],
  );

  // Immediate param setters (no debounce)
  const setPage = useCallback(
    (page: number) => pushParams({ page }),
    [pushParams],
  );

  const setType = useCallback(
    (type: EventType | undefined) => pushParams({ type }),
    [pushParams],
  );

  const setSort = useCallback(
    (sort: EventSortOption) => pushParams({ sort }),
    [pushParams],
  );

  const clearSearch = useCallback(() => {
    setInputValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushParams({ q: undefined });
  }, [pushParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    params,
    inputValue,
    setSearch,
    setPage,
    setType,
    setSort,
    clearSearch,
  };
}

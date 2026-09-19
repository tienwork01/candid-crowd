"use client";

import { useTranslations } from "next-intl";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { PaginationMeta } from "../types/event-list";

type PaginationBarProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

/**
 * Page-based pagination bar with truncated page numbers.
 *
 * Layout:
 *   « Prev  1 2 3 … 8 9 10  Next »
 *
 * Mobile: shows compact (prev/next + "Page X of Y")
 * Desktop: shows full page numbers
 */
export function PaginationBar({
  pagination,
  onPageChange,
}: PaginationBarProps) {
  const t = useTranslations("host.pages");

  const { page, total, total_pages, has_prev, has_next, per_page } = pagination;

  // Don't render if there's only one page
  if (total_pages <= 1) return null;

  const from = (page - 1) * per_page + 1;
  const to = Math.min(page * per_page, total);

  const pages = getVisiblePages(page, total_pages);

  return (
    <nav className="host-events__pagination" aria-label={t("paginationLabel")}>
      <span className="host-events__pagination-info">
        {t("paginationShowing", { from, to, total })}
      </span>

      <div className="host-events__pagination-controls">
        {/* Previous */}
        <button
          type="button"
          className="host-events__pagination-btn"
          disabled={!has_prev}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("paginationPrev")}
        >
          <CaretLeft size={14} weight="bold" aria-hidden="true" />
          <span className="host-events__pagination-btn-text">
            {t("paginationPrev")}
          </span>
        </button>

        {/* Page numbers (desktop) */}
        <div className="host-events__pagination-pages">
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="host-events__pagination-ellipsis"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`host-events__pagination-btn host-events__pagination-btn--page${
                  p === page ? " host-events__pagination-btn--active" : ""
                }`}
                onClick={() => onPageChange(p)}
                aria-label={t("paginationPage", { page: p })}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}
        </div>

        {/* Mobile page indicator */}
        <span className="host-events__pagination-mobile-info">
          {t("paginationPage", { page })} / {total_pages}
        </span>

        {/* Next */}
        <button
          type="button"
          className="host-events__pagination-btn"
          disabled={!has_next}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("paginationNext")}
        >
          <span className="host-events__pagination-btn-text">
            {t("paginationNext")}
          </span>
          <CaretRight size={14} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

/**
 * Computes which page numbers to display, with ellipsis for truncation.
 *
 * Examples:
 *   page=1, total=5   → [1, 2, 3, 4, 5]
 *   page=1, total=10  → [1, 2, 3, "ellipsis", 9, 10]
 *   page=5, total=10  → [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 *   page=10, total=10 → [1, 2, "ellipsis", 8, 9, 10]
 */
function getVisiblePages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  // Always show first page
  pages.push(1);

  if (current <= 3) {
    // Near start: 1 2 3 4 … last
    pages.push(2, 3, 4, "ellipsis", total);
  } else if (current >= total - 2) {
    // Near end: 1 … n-3 n-2 n-1 n
    pages.push("ellipsis", total - 3, total - 2, total - 1, total);
  } else {
    // Middle: 1 … c-1 c c+1 … n
    pages.push(
      "ellipsis",
      current - 1,
      current,
      current + 1,
      "ellipsis",
      total,
    );
  }

  return pages;
}

"use client";

import {
  MagnifyingGlass,
  X,
  Funnel,
  SortAscending,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { eventTypes } from "../types/event";
import type { EventType } from "../types/event";
import type { EventSortOption } from "../types/event-list";
import { eventSortOptions } from "../types/event-list";

type EventsToolbarProps = {
  inputValue: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  selectedType: EventType | undefined;
  onTypeChange: (type: EventType | undefined) => void;
  selectedSort: EventSortOption;
  onSortChange: (sort: EventSortOption) => void;
  resultCount: number;
  hasActiveSearch: boolean;
};

const sortLabelKeys: Record<EventSortOption, string> = {
  newest: "sortNewest",
  oldest: "sortOldest",
  name: "sortName",
  upcoming: "sortUpcoming",
};

export function EventsToolbar({
  inputValue,
  onSearchChange,
  onSearchClear,
  selectedType,
  onTypeChange,
  selectedSort,
  onSortChange,
  resultCount,
  hasActiveSearch,
}: EventsToolbarProps) {
  const t = useTranslations("host.pages");
  const tEvent = useTranslations("event");

  return (
    <div className="host-events__toolbar">
      {/* Search bar */}
      <div className="host-events__search-bar">
        <MagnifyingGlass
          size={16}
          className="host-events__search-icon"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={inputValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="host-events__search-input"
        />
        {inputValue && (
          <button
            type="button"
            onClick={onSearchClear}
            className="host-events__search-clear"
            aria-label={t("clearSearch")}
          >
            <X size={13} weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="host-events__toolbar-filters">
        {/* Type filter */}
        <Select
          value={selectedType ?? ""}
          onValueChange={(val) =>
            onTypeChange(!val ? undefined : (val as EventType))
          }
        >
          <SelectTrigger
            size="sm"
            className="host-events__type-filter"
            aria-label={t("filterByType")}
          >
            <Funnel
              size={14}
              className="text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <SelectValue placeholder={t("filterAllTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("filterAllTypes")}</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {tEvent(`types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={selectedSort}
          onValueChange={(val) => {
            if (val) onSortChange(val as EventSortOption);
          }}
        >
          <SelectTrigger
            size="sm"
            className="host-events__sort-select"
            aria-label={t("sortBy")}
          >
            <SortAscending
              size={14}
              className="text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventSortOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {t(sortLabelKeys[opt])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {hasActiveSearch && (
        <div className="host-events__toolbar-meta">
          <span className="host-events__results-count">
            {resultCount === 1
              ? t("searchResultSingle")
              : t("searchResultsMultiple", { count: resultCount })}
          </span>
        </div>
      )}
    </div>
  );
}

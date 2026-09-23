"use client";

import { useState } from "react";
import { ArrowsClockwise, Funnel } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { EventMediaItem, EventMediaStatus } from "../types/event";
import {
  EventBatchActionBar,
  EventGalleryEmptyState,
  EventGalleryToolbar,
  EventMediaCard,
} from "./gallery";
import { EventMediaLightbox } from "./event-media-lightbox";
import { useEventMediaGallery } from "../hooks/use-event-media-gallery";
import { Button } from "@/components/ui";

type EventGalleryViewProps = {
  items: EventMediaItem[];
  onOpenLightbox?: (item: EventMediaItem) => void;
  onToggleStatus: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onBatchStatusChange?: (ids: string[], status: EventMediaStatus) => void;
  onBatchDelete?: (ids: string[]) => void;
  onDeleteMedia: (id: string) => void;
  guestUrl?: string;
  onOpenShare?: () => void;
  onOpenPrint?: () => void;
  eventName?: string;
  publicCode?: string;
};

export function EventGalleryView({
  items,
  onOpenLightbox,
  onToggleStatus,
  onToggleFavorite,
  onBatchStatusChange,
  onBatchDelete,
  onDeleteMedia,
  guestUrl,
  onOpenShare,
  onOpenPrint,
  eventName,
  publicCode,
}: EventGalleryViewProps) {
  const t = useTranslations("event");

  // Domain Hook orchestrating filters, sorts, layout mode, selection & lightbox
  const {
    filter,
    setFilter,
    sort,
    setSort,
    layoutMode,
    setLayoutMode,
    counts,
    filteredItems,
    selectedIds,
    isSelectMode,
    setIsSelectMode,
    toggleSelect,
    clearSelection,
    activeLightboxItem,
    lightboxIndex,
    hasPrev,
    hasNext,
    openLightbox,
    closeLightbox,
    handlePrevLightbox,
    handleNextLightbox,
    selectLightboxIndex,
  } = useEventMediaGallery(items);

  const [isInternalLightboxOpen, setIsInternalLightboxOpen] = useState(false);

  const handleItemClick = (item: EventMediaItem) => {
    openLightbox(item);
    setIsInternalLightboxOpen(true);

    if (onOpenLightbox) {
      onOpenLightbox(item);
    }
  };

  const handleCloseLightbox = () => {
    closeLightbox();
    setIsInternalLightboxOpen(false);
  };

  const handleDownloadAll = () => {
    if (items.length === 0) return;
    toast.success(t("gallery.downloadAll", { count: items.length }));
  };

  // ─── Batch Operations ───
  const selectedList = filteredItems.filter((i) => selectedIds.has(i.id));

  const handleBatchFavorite = () => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    if (onBatchStatusChange) {
      onBatchStatusChange(ids, "featured");
    } else if (onToggleFavorite) {
      ids.forEach((id) => onToggleFavorite(id));
    }

    toast.success(t("gallery.mediaFavorited"));
    clearSelection();
  };

  const handleBatchHide = () => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    if (onBatchStatusChange) {
      onBatchStatusChange(ids, "hidden");
    } else {
      ids.forEach((id) => onToggleStatus(id));
    }

    toast.info(t("gallery.mediaHidden"));
    clearSelection();
  };

  const handleBatchShow = () => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    if (onBatchStatusChange) {
      onBatchStatusChange(ids, "ready");
    } else {
      ids.forEach((id) => onToggleStatus(id));
    }

    toast.success(t("gallery.mediaVisible"));
    clearSelection();
  };

  const handleBatchDownload = () => {
    if (selectedList.length === 0) return;

    selectedList.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement("a");

        link.href = item.url;
        link.download = `candid-memory-${item.id}.${item.is_video ? "mp4" : "jpg"}`;
        link.click();
      }, index * 200);
    });

    toast.success(t("gallery.batchDownload", { count: selectedList.length }));
    clearSelection();
  };

  const handleBatchDelete = () => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    if (
      window.confirm(t("gallery.batchDeleteConfirm", { count: ids.length }))
    ) {
      if (onBatchDelete) {
        onBatchDelete(ids);
      } else {
        ids.forEach((id) => onDeleteMedia(id));
      }

      toast.success(t("gallery.mediaDeleted"));
      clearSelection();
    }
  };

  return (
    <section className="event-gallery" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="sr-only">
        {t("hub.tabMemories")}
      </h2>

      {/* Gallery Filter, Layout & Batch Toolbar */}
      <EventGalleryToolbar
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        sort={sort}
        onSortChange={setSort}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        isSelectMode={isSelectMode}
        onToggleSelectMode={() => setIsSelectMode(!isSelectMode)}
        totalItems={filteredItems.length}
        onDownloadAll={handleDownloadAll}
      />

      {/* Media Grid or Empty State */}
      {items.length === 0 ? (
        <EventGalleryEmptyState
          eventName={eventName}
          publicCode={publicCode}
          guestUrl={guestUrl}
          onOpenShare={onOpenShare}
          onOpenPrint={onOpenPrint}
        />
      ) : filteredItems.length === 0 ? (
        <div className="event-gallery__filter-empty">
          <div className="event-gallery__filter-empty-icon" aria-hidden="true">
            <Funnel size={26} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading text-base text-ink font-medium mt-2">
            {t("gallery.filterEmptyTitle")}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFilter("all")}
            className="mt-3 gap-1.5"
          >
            <ArrowsClockwise size={14} aria-hidden="true" />
            <span>{t("gallery.filterEmptyReset")}</span>
          </Button>
        </div>
      ) : (
        <div
          className={
            layoutMode === "masonry"
              ? "event-gallery__masonry"
              : "event-gallery__grid event-gallery__grid--square"
          }
        >
          {filteredItems.map((item) => (
            <EventMediaCard
              key={item.id}
              item={item}
              layoutMode={layoutMode}
              isSelected={selectedIds.has(item.id)}
              isSelectMode={isSelectMode}
              onToggleSelect={toggleSelect}
              onOpenLightbox={handleItemClick}
              onToggleStatus={onToggleStatus}
              onToggleFavorite={onToggleFavorite}
              onDeleteMedia={onDeleteMedia}
            />
          ))}
        </div>
      )}

      {/* Floating Batch Action Bar */}
      <EventBatchActionBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onBatchFavorite={onToggleFavorite ? handleBatchFavorite : undefined}
        onBatchHide={handleBatchHide}
        onBatchShow={handleBatchShow}
        onBatchDownload={handleBatchDownload}
        onBatchDelete={handleBatchDelete}
      />

      {/* Synchronized Immersive Lightbox Theater */}
      {isInternalLightboxOpen && activeLightboxItem && (
        <EventMediaLightbox
          item={activeLightboxItem}
          isOpen={isInternalLightboxOpen}
          onClose={handleCloseLightbox}
          onNext={handleNextLightbox}
          onPrev={handlePrevLightbox}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onToggleStatus={onToggleStatus}
          onToggleFavorite={onToggleFavorite}
          currentIndex={lightboxIndex}
          totalItems={filteredItems.length}
          items={filteredItems}
          onSelectItem={selectLightboxIndex}
        />
      )}
    </section>
  );
}

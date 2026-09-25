"use client";

import type { GalleryLayoutMode } from "../../types/event-media";

/**
 * Natural photo aspect ratios commonly found in candid event photography:
 * mix of vertical portraits (guests, couples), squares (details), and landscapes (ceremonies, groups).
 */
const MASONRY_ASPECT_RATIOS = [
  "aspect-[4/5]", // portrait photo
  "aspect-[1/1]", // square photo
  "aspect-[3/2]", // landscape photo
  "aspect-[3/4]", // tall portrait
  "aspect-[16/9]", // wide panorama
  "aspect-[4/5]", // portrait
  "aspect-[1/1]", // square
  "aspect-[3/2]", // landscape
];

export type EventMediaSkeletonProps = {
  aspectRatio?: string;
  layoutMode?: GalleryLayoutMode;
  hasBadge?: boolean;
  isVideo?: boolean;
};

/**
 * Individual skeleton placeholder representing a single photo or video media card.
 * Designed to strictly match the visual dimensions, border radius, and overlays of EventMediaCard.
 */
export function EventMediaSkeleton({
  aspectRatio = "aspect-[4/5]",
  layoutMode = "masonry",
  hasBadge = false,
  isVideo = false,
}: EventMediaSkeletonProps) {
  const isSquare = layoutMode === "grid";

  return (
    <article
      className="event-media-card overflow-hidden rounded-2xl border border-line bg-surface relative break-inside-avoid select-none"
      aria-hidden="true"
    >
      <div
        className={`w-full relative overflow-hidden bg-muted/20 ${
          isSquare ? "aspect-square" : aspectRatio
        }`}
      >
        {/* Shimmer sweep animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full animate-[skeleton-shimmer_1.8s_ease-in-out_infinite]" />

        {/* Top-left video / status badge ghost */}
        {isVideo ? (
          <div className="absolute top-2.5 left-2.5 h-5 w-14 rounded-full bg-foreground/10" />
        ) : hasBadge ? (
          <div className="absolute top-2.5 left-2.5 h-5 w-16 rounded-full bg-foreground/10" />
        ) : null}

        {/* Top-right favorite button ghost */}
        {hasBadge && (
          <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-foreground/10" />
        )}

        {/* Bottom subtle metadata ghost */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="h-4 w-20 rounded-full bg-foreground/10" />
          <div className="h-6 w-16 rounded-full bg-foreground/10" />
        </div>
      </div>
    </article>
  );
}

export type EventMediaSkeletonGridProps = {
  count?: number;
  layoutMode?: GalleryLayoutMode;
};

/**
 * Responsive skeleton grid simulating an incoming media gallery.
 * Mirrors the exact column-count and gaps of either Masonry or Square Grid.
 */
export function EventMediaSkeletonGrid({
  count = 8,
  layoutMode = "masonry",
}: EventMediaSkeletonGridProps) {
  return (
    <div
      className={
        layoutMode === "masonry"
          ? "event-gallery__masonry"
          : "event-gallery__grid event-gallery__grid--square"
      }
      role="status"
      aria-busy="true"
      aria-label="Loading photos and videos"
    >
      <span className="sr-only">Loading photos and videos...</span>
      {Array.from({ length: count }, (_, idx) => (
        <EventMediaSkeleton
          key={idx}
          layoutMode={layoutMode}
          aspectRatio={
            MASONRY_ASPECT_RATIOS[idx % MASONRY_ASPECT_RATIOS.length]
          }
          hasBadge={idx % 3 === 0}
          isVideo={idx % 4 === 1}
        />
      ))}
    </div>
  );
}

// Imported by path rather than through the gallery barrel so this skeleton can
// be reused from a route `loading.tsx` without dragging in the whole gallery.
import { EventMediaSkeletonGrid } from "./gallery/event-media-skeleton";

export function EventHubSkeleton() {
  return (
    <div className="event-hub animate-pulse" aria-busy="true">
      <header className="event-hub__header">
        <div className="event-hub__headline">
          {/* Top Context Bar Skeleton */}
          <div className="event-hub__context-bar">
            <div className="h-4 w-28 rounded bg-muted/20" />
            <span className="event-hub__badge-sep" aria-hidden="true">
              •
            </span>
            <div className="h-6 w-20 rounded-full bg-muted/20" />
            <div className="h-4 w-28 rounded bg-muted/15" />
            <div className="h-5 w-16 rounded-full bg-muted/15" />
          </div>

          {/* Title Skeleton — Compact */}
          <div className="h-8 w-64 max-w-[80%] rounded bg-muted/25" />
        </div>

        {/* Actions Skeleton — Compact */}
        <div className="event-hub__actions">
          <div className="h-9 w-20 rounded-md bg-muted/20" />
          <div className="h-9 w-9 rounded-md bg-muted/20" />
          <div className="h-9 w-9 rounded-md bg-muted/20" />
          <div className="size-9 rounded-md bg-muted/20" />
        </div>
      </header>

      {/* Tabs Skeleton — 4 tabs */}
      <div className="event-hub__tabs">
        <div className="h-9 w-24 rounded-lg bg-muted/20" />
        <div className="h-9 w-28 rounded-lg bg-muted/15" />
        <div className="h-9 w-20 rounded-lg bg-muted/15" />
        <div className="h-9 w-22 rounded-lg bg-muted/15" />
      </div>

      {/* Gallery Skeleton */}
      <div className="mt-4">
        <EventMediaSkeletonGrid count={8} layoutMode="masonry" />
      </div>
    </div>
  );
}

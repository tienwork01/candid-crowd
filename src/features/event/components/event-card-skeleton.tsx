"use client";

/**
 * Skeleton placeholder that matches the visual dimensions of an EventCard.
 * Renders a shimmer animation while event data is loading.
 */
export function EventCardSkeleton() {
  return (
    <div className="host-events__skeleton-card" aria-hidden="true">
      {/* Badge row */}
      <div className="host-events__skeleton-row">
        <div className="host-events__skeleton-badge" />
        <div className="host-events__skeleton-date" />
      </div>

      {/* Title */}
      <div className="host-events__skeleton-title" />

      {/* Meta row */}
      <div className="host-events__skeleton-row">
        <div className="host-events__skeleton-meta" />
        <div className="host-events__skeleton-meta host-events__skeleton-meta--short" />
      </div>

      {/* Progress bar */}
      <div className="host-events__skeleton-progress">
        <div className="host-events__skeleton-bar" />
      </div>

      {/* Footer */}
      <div className="host-events__skeleton-footer">
        <div className="host-events__skeleton-link" />
        <div className="host-events__skeleton-link" />
      </div>
    </div>
  );
}

export function EventCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="host-events__grid grid grid-cols-1 sm:grid-cols-2 gap-5">
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

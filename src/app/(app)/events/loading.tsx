// Imported by path rather than through the barrel so the loading chunk stays
// small enough to be worth prefetching.
import { EventCardSkeletonGrid } from "@/features/event/components/event-card-skeleton";

/**
 * Streamed instantly on navigation (and served from the prefetched router
 * cache), so switching into /events never leaves the shell blank while the
 * dynamic segment renders on the server.
 */
export default function EventsLoading() {
  return (
    <section className="host-events" aria-busy="true">
      <header className="host-events__header animate-pulse" aria-hidden="true">
        <div className="host-events__context-bar">
          <div className="h-5 w-28 rounded-full bg-muted/20" />
          <span className="host-events__badge-sep">•</span>
          <div className="h-4 w-24 rounded bg-muted/15" />
        </div>

        <div className="host-events__heading">
          <div className="host-events__title-group space-y-2">
            <div className="h-8 w-56 max-w-[70%] rounded bg-muted/25" />
            <div className="h-4 w-80 max-w-full rounded bg-muted/15" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted/20" />
        </div>
      </header>

      <div className="host-events__layout">
        <div className="host-events__main">
          <EventCardSkeletonGrid count={6} />
        </div>

        <div className="host-events__sidebar" aria-hidden="true">
          <div className="profile-page__card animate-pulse space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-full bg-muted/20" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-muted/25" />
                <div className="h-3 w-36 rounded bg-muted/15" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-muted/15" />
            <div className="h-3 w-2/3 rounded bg-muted/15" />
          </div>
        </div>
      </div>
    </section>
  );
}

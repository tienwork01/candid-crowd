import { EventHubSkeleton } from "@/features/event/components/event-hub-skeleton";

export default function EventOverviewLoading() {
  return (
    <div className="host-shell__content host-shell__content--event-overview">
      <EventHubSkeleton />
    </div>
  );
}

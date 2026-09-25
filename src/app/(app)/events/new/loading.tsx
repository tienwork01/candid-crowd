export default function NewEventLoading() {
  return (
    <div
      className="host-shell__content host-shell__content--event-create max-w-lg mx-auto py-8 sm:py-12"
      aria-busy="true"
    >
      <div className="space-y-6 animate-pulse" aria-hidden="true">
        <div className="space-y-2">
          <div className="h-8 w-56 max-w-[80%] rounded bg-muted/25" />
          <div className="h-4 w-72 max-w-full rounded bg-muted/15" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full rounded-md bg-muted/15" />
          <div className="h-10 w-full rounded-md bg-muted/15" />
          <div className="h-24 w-full rounded-md bg-muted/15" />
        </div>
        <div className="h-11 w-full rounded-md bg-muted/20" />
      </div>
    </div>
  );
}

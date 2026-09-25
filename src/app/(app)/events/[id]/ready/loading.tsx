export default function EventReadyLoading() {
  return (
    <div
      className="host-shell__content host-shell__content--event-ready"
      aria-busy="true"
    >
      <div
        className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 animate-pulse"
        aria-hidden="true"
      >
        <div className="size-16 rounded-2xl bg-muted/20" />
        <div className="h-7 w-56 max-w-full rounded bg-muted/25" />
        <div className="h-4 w-72 max-w-full rounded bg-muted/15" />
        <div className="mt-4 aspect-square w-52 rounded-2xl bg-muted/15" />
        <div className="mt-2 h-11 w-44 rounded-md bg-muted/20" />
      </div>
    </div>
  );
}

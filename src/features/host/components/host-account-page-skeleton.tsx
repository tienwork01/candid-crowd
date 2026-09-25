/**
 * Shared placeholder for the account-shaped host pages (/profile, /billing).
 * Purely decorative: it carries no translated copy so it stays part of the
 * static shell that the router can prefetch ahead of the click.
 */
export function HostAccountPageSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <section className="profile-page" aria-busy="true">
      <header className="profile-page__intro animate-pulse" aria-hidden="true">
        <div className="profile-page__context-bar">
          <div className="h-5 w-24 rounded-full bg-muted/20" />
        </div>
        <div className="profile-page__heading">
          <div className="profile-page__title-group space-y-2">
            <div className="h-8 w-48 max-w-[70%] rounded bg-muted/25" />
            <div className="h-4 w-72 max-w-full rounded bg-muted/15" />
          </div>
        </div>
      </header>

      <div className="profile-page__grid" aria-hidden="true">
        <div className="profile-page__main space-y-6">
          {Array.from({ length: cards }, (_, index) => (
            <div key={index} className="profile-page__card animate-pulse">
              <div className="mb-6 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-muted/20" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-muted/25" />
                  <div className="h-3 w-48 rounded bg-muted/15" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-full rounded-md bg-muted/15" />
                <div className="h-10 w-full rounded-md bg-muted/15" />
              </div>
            </div>
          ))}
        </div>

        <div className="profile-page__sidebar">
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

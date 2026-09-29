import { createParser, type EventSourceMessage } from "eventsource-parser";
import { clearAuthTokenCache, getAuthToken } from "@/lib/api-client";

/**
 * Server-sent events transport.
 *
 * Two modes exist because the two endpoints authenticate differently. The
 * guest stream is public, so the browser's own `EventSource` is used and gets
 * reconnection for free. The host stream sits behind a bearer token, which
 * `EventSource` cannot send, so that mode reads a `fetch` body and parses the
 * frames — reconnection is handled here instead.
 */
export type EventStreamMode = "public" | "authenticated";

export type EventStreamHandlers = {
  onMessage: (event: { id: string; kind: string; data: string }) => void;
  /** The server cut this connection loose; whatever is cached may be stale. */
  onResync?: () => void;
  /** Fires on every successful (re)connect, including the first. */
  onOpen?: () => void;
  onClose?: () => void;
};

export type EventStreamOptions = EventStreamHandlers & {
  url: string;
  mode: EventStreamMode;
  signal: AbortSignal;
};

/** Matches the server's `retry:` hint; also the floor for backoff. */
const BASE_RETRY_MS = 3_000;
const MAX_RETRY_MS = 60_000;
// A stream that is cut off almost immediately is usually a proxy/backend
// configuration issue, not a healthy server rotation. Do not retry those at
// the rapid cadence reserved for long-lived connections.
const STABLE_CONNECTION_MS = 30_000;

/**
 * Full jitter. A venue-wide Wi-Fi blip drops every guest at once, and without
 * jitter they would all reconnect in the same instant and do it again.
 */
function backoffDelay(attempt: number): number {
  const ceiling = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** attempt);

  return Math.random() * ceiling;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

function dispatch(handlers: EventStreamHandlers, event: EventSourceMessage) {
  const kind = event.event || "message";

  if (kind === "resync") {
    handlers.onResync?.();

    return;
  }

  handlers.onMessage({ id: event.id || "", kind, data: event.data });
}

/**
 * Opens the stream and keeps it open until the signal aborts. Resolves only
 * once the caller has aborted, so callers should not await it.
 */
export async function connectEventStream(
  options: EventStreamOptions,
): Promise<void> {
  if (options.mode === "public") {
    return connectWithEventSource(options);
  }

  return connectWithFetch(options);
}

function connectWithEventSource(options: EventStreamOptions): Promise<void> {
  return new Promise((resolve) => {
    // EventSource reconnects on its own and honours the server's `retry:`,
    // so this mode only has to wire the handlers up.
    const source = new EventSource(options.url);

    const close = () => {
      source.close();
      options.onClose?.();
      resolve();
    };

    if (options.signal.aborted) {
      close();

      return;
    }

    options.signal.addEventListener("abort", close, { once: true });

    source.onopen = () => options.onOpen?.();

    source.onerror = () => {
      // A transport blip leaves readyState at CONNECTING and the browser
      // retries by itself. A refused connection — the host switched the
      // gallery off, or the event is gone — closes it for good, and without
      // this the caller would wait on a stream that will never open.
      if (source.readyState === EventSource.CLOSED) {
        close();

        return;
      }

      options.onClose?.();
    };

    source.onmessage = (event) =>
      dispatch(options, {
        event: "message",
        data: event.data,
        id: event.lastEventId,
      });

    for (const kind of [
      "media.created",
      "media.thumbnail.ready",
      "media.updated",
      "media.deleted",
      "event.updated",
      "live_wall.presentation",
      "resync",
    ]) {
      source.addEventListener(kind, (event) => {
        const payload = event as MessageEvent<string>;

        dispatch(options, {
          event: kind,
          data: payload.data,
          id: payload.lastEventId,
        });
      });
    }
  });
}

async function connectWithFetch(options: EventStreamOptions): Promise<void> {
  let attempt = 0;
  let shouldRefreshToken = false;

  while (!options.signal.aborted) {
    let opened = false;
    let openedAt = 0;

    try {
      const token = await getAuthToken(shouldRefreshToken);

      shouldRefreshToken = false;

      if (!token) {
        // Not signed in. Retrying cannot fix that, so stop rather than spin.
        break;
      }

      const response = await fetch(options.url, {
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        signal: options.signal,
        cache: "no-store",
      });

      if (response.status === 401) {
        // A reconnect does not imply an expired token. Refresh only after the
        // API explicitly rejects it, otherwise every short-lived SSE stream
        // needlessly calls Better Auth's `/token` endpoint.
        if (attempt > 0) break;
        clearAuthTokenCache();
        shouldRefreshToken = true;
        attempt += 1;
        continue;
      }

      if (!response.ok || !response.body) {
        throw new Error(`stream failed with status ${response.status}`);
      }

      opened = true;
      openedAt = Date.now();
      attempt = 0;
      options.onOpen?.();

      const parser = createParser({
        onEvent: (event) => dispatch(options, event),
      });
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      try {
        for (;;) {
          const { done, value } = await reader.read();

          if (done) break;
          if (value) parser.feed(value);
        }
      } finally {
        reader.cancel().catch(() => {});
      }
    } catch (error) {
      if (options.signal.aborted) break;

      if (process.env.NODE_ENV === "development") {
        console.warn("[realtime] stream interrupted", error);
      }
    } finally {
      if (opened) options.onClose?.();
    }

    if (options.signal.aborted) break;

    // The server may close a long-lived stream intentionally once it reaches
    // its maximum age. A response that dies immediately, however, must use
    // exponential backoff too; otherwise each quick 200 response becomes a
    // new fetch within a few seconds forever.
    const wasStable = opened && Date.now() - openedAt >= STABLE_CONNECTION_MS;

    attempt = wasStable ? 0 : Math.min(attempt + 1, 6);
    await sleep(backoffDelay(attempt), options.signal);
  }
}

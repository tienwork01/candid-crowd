import { expect, test, type Page } from "@playwright/test";

const TEST_SLUG = "live-wall-e2e";
const TEST_TOKEN = "live-wall-e2e-token";
const MEDIA_URL = "https://media.live-wall.test/new-memory.svg";

type MockMedia = {
  id: string;
  url: string;
  status: "ready";
};

function liveWallPayload(media: MockMedia[]) {
  return {
    event: { name: "Live Wall E2E", slug: TEST_SLUG },
    data: media,
    page: { has_more: false },
    presentation: {
      status: "live",
      is_playing: true,
      show_cta: false,
      is_blackout: false,
      revision: 1,
      layout_mode: "spotlight",
      slide_duration_seconds: 5,
      qr_strategy: "hidden",
      arrival_behavior: "next",
    },
  };
}

async function installMockEventSource(page: Page) {
  await page.addInitScript(() => {
    const sources = new Set<{
      emit: (kind: string, data: string) => void;
      disconnect: () => void;
      reconnect: () => void;
    }>();

    class MockEventSource {
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSED = 2;
      readonly listeners = new Map<
        string,
        Set<(event: MessageEvent) => void>
      >();
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readyState = MockEventSource.OPEN;

      constructor() {
        sources.add(this);
        window.setTimeout(() => this.onopen?.(), 0);
      }

      addEventListener(kind: string, callback: (event: MessageEvent) => void) {
        const callbacks = this.listeners.get(kind) ?? new Set();

        callbacks.add(callback);
        this.listeners.set(kind, callbacks);
      }

      close() {
        this.readyState = MockEventSource.CLOSED;
        sources.delete(this);
      }

      emit(kind: string, data: string) {
        const event = new MessageEvent(kind, { data });

        this.listeners.get(kind)?.forEach((callback) => callback(event));
      }

      disconnect() {
        this.readyState = MockEventSource.CONNECTING;
        this.onerror?.();
      }

      reconnect() {
        this.readyState = MockEventSource.OPEN;
        this.onopen?.();
      }
    }

    Object.defineProperty(window, "EventSource", {
      configurable: true,
      value: MockEventSource,
    });
    Object.assign(window, {
      __emitLiveWallTestEvent(kind: string, data = "{}") {
        sources.forEach((source) => source.emit(kind, data));
      },
      __disconnectLiveWallTestStream() {
        sources.forEach((source) => source.disconnect());
      },
      __reconnectLiveWallTestStream() {
        sources.forEach((source) => source.reconnect());
      },
    });
  });
}

test.describe("Live Wall guest contribution", () => {
  test("shows a completed guest upload after a media.created stream event", async ({
    browser,
    baseURL,
  }) => {
    let uploadCompleted = false;
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const guest = await context.newPage();
    const player = await context.newPage();
    const uploadedMedia: MockMedia = {
      id: "guest-uploaded-memory",
      url: MEDIA_URL,
      status: "ready",
    };

    await context.route(`**/api/v1/public/events/${TEST_SLUG}`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          id: "event-live-wall-e2e",
          name: "Live Wall E2E",
          event_type: "Wedding",
          slug: TEST_SLUG,
          gallery_enabled: true,
          candid_camera_enabled: false,
          event_mode: "party",
        }),
      }),
    );
    await context.route(
      `**/api/v1/public/events/${TEST_SLUG}/sessions`,
      (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({ guest_session_token: "live-wall-e2e-guest" }),
        }),
    );
    await context.route(`**/api/v1/public/events/${TEST_SLUG}/media`, (route) =>
      route.fulfill({ contentType: "application/json", body: "[]" }),
    );
    await context.route(
      `**/api/v1/public/events/${TEST_SLUG}/uploads`,
      (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            media_id: uploadedMedia.id,
            upload_url: "https://r2.live-wall.test/upload",
            expires_at: "2027-01-01T00:00:00Z",
            required_headers: {},
          }),
        }),
    );
    await context.route("https://r2.live-wall.test/**", (route) =>
      route.fulfill({ status: 200 }),
    );
    await context.route(
      `**/api/v1/public/events/${TEST_SLUG}/uploads/${uploadedMedia.id}/complete`,
      (route) => {
        uploadCompleted = true;

        return route.fulfill({ status: 200 });
      },
    );
    await context.route(
      `**/api/v1/public/live-wall-sessions/${TEST_TOKEN}?**`,
      (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(
            liveWallPayload(uploadCompleted ? [uploadedMedia] : []),
          ),
        }),
    );
    await context.route("https://media.live-wall.test/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#6b4f32" /></svg>',
      }),
    );
    await installMockEventSource(player);

    await player.goto(`${baseURL}/live-wall/${TEST_TOKEN}`);
    await expect(player.locator(".live-wall-player__invitation")).toBeVisible();

    await guest.goto(`${baseURL}/e/${TEST_SLUG}`);
    await guest.locator('input[type="file"][multiple]').setInputFiles({
      name: "guest-memory.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    await guest.locator(".guest-upload__submit-btn").click();
    await expect(guest.locator(".guest-upload__success-card")).toBeVisible();
    expect(uploadCompleted).toBe(true);

    await player.evaluate(() => {
      (
        window as unknown as {
          __emitLiveWallTestEvent: (kind: string) => void;
        }
      ).__emitLiveWallTestEvent("media.created");
    });

    await expect(
      player.locator(`.live-wall-player__media[src="${MEDIA_URL}"]`),
    ).toBeVisible();
    await context.close();
  });

  test("keeps the visible frame while the player reconnects", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const player = await context.newPage();
    const existingMedia: MockMedia = {
      id: "existing-memory",
      url: "https://media.live-wall.test/existing-memory.svg",
      status: "ready",
    };

    await context.route(
      `**/api/v1/public/live-wall-sessions/${TEST_TOKEN}?**`,
      (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(liveWallPayload([existingMedia])),
        }),
    );
    await context.route("https://media.live-wall.test/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#365f50" /></svg>',
      }),
    );
    await installMockEventSource(player);

    await player.goto(`${baseURL}/live-wall/${TEST_TOKEN}`);

    const visibleFrame = player.locator(
      `.live-wall-player__media[src="${existingMedia.url}"]`,
    );
    const status = player.locator(".live-wall-player__status");

    await expect(visibleFrame).toBeVisible();
    await player.evaluate(() => {
      (
        window as unknown as {
          __disconnectLiveWallTestStream: () => void;
        }
      ).__disconnectLiveWallTestStream();
    });
    await expect(status).toHaveAttribute("data-state", "reconnecting");
    await expect(visibleFrame).toBeVisible();

    await player.evaluate(() => {
      (
        window as unknown as {
          __reconnectLiveWallTestStream: () => void;
        }
      ).__reconnectLiveWallTestStream();
    });
    await expect(status).toHaveAttribute("data-state", "live");
    await expect(visibleFrame).toBeVisible();
    await context.close();
  });
});

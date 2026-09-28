import { expect, test } from "@playwright/test";
import { QueryClient } from "@tanstack/react-query";
import {
  applyGuestRealtimeMessage,
  applyHostRealtimeMessage,
  guestMediaUrl,
  matchesFilter,
} from "@/features/event/lib/realtime-cache";
import type { EventMediaItem } from "@/features/event/types/event";
import {
  parseRealtimeMessage,
  type RealtimeMessage,
} from "@/features/event/types/event-realtime";

const EVENT_ID = "b3b0f6c8-0000-4000-8000-000000000001";
const SLUG = "evt_test";

function item(
  id: string,
  overrides: Partial<EventMediaItem> = {},
): EventMediaItem {
  return {
    id,
    url: `https://signed.example/${id}`,
    created_at: "2026-09-26T10:00:00Z",
    status: "ready",
    is_video: false,
    has_event_frame: false,
    ...overrides,
  };
}

function hostCache(
  items: EventMediaItem[],
  counts: Partial<Record<string, number>> = {},
  filter = "all",
) {
  const client = new QueryClient();

  client.setQueryData(
    ["event", EVENT_ID, "media", { filter, sort: "newest", per_page: 24 }],
    {
      pages: [
        {
          data: items,
          counts: {
            all:
              counts.all ?? items.filter((i) => i.status !== "hidden").length,
            photos:
              counts.photos ??
              items.filter((i) => !i.is_video && i.status !== "hidden").length,
            videos:
              counts.videos ??
              items.filter((i) => i.is_video && i.status !== "hidden").length,
            favorites:
              counts.favorites ??
              items.filter((i) => i.status === "featured").length,
            hidden:
              counts.hidden ??
              items.filter((i) => i.status === "hidden").length,
          },
        },
      ],
      pageParams: [""],
    },
  );

  return client;
}

function readHost(client: QueryClient, filter = "all") {
  return client.getQueryData([
    "event",
    EVENT_ID,
    "media",
    { filter, sort: "newest", per_page: 24 },
  ]) as {
    pages: Array<{ data: EventMediaItem[]; counts: Record<string, number> }>;
  };
}

function message(
  kind: RealtimeMessage["kind"],
  data: unknown,
): RealtimeMessage {
  return { kind, id: "msg-1", data } as RealtimeMessage;
}

test.describe("realtime gallery filters", () => {
  test("mirror the backend filter rules", () => {
    expect(matchesFilter({ status: "ready", is_video: false }, "all")).toBe(
      true,
    );
    expect(matchesFilter({ status: "hidden", is_video: false }, "all")).toBe(
      false,
    );
    expect(matchesFilter({ status: "ready", is_video: true }, "photos")).toBe(
      false,
    );
    expect(matchesFilter({ status: "ready", is_video: true }, "videos")).toBe(
      true,
    );
    expect(
      matchesFilter({ status: "featured", is_video: false }, "favorites"),
    ).toBe(true);
    expect(
      matchesFilter({ status: "ready", is_video: false }, "favorites"),
    ).toBe(false);
    expect(matchesFilter({ status: "hidden", is_video: false }, "hidden")).toBe(
      true,
    );
  });
});

test.describe("host realtime cache", () => {
  test("removes deleted media without a refetch", () => {
    const client = hostCache([
      item("a"),
      item("b"),
      item("c", { is_video: true }),
    ]);

    const result = applyHostRealtimeMessage(
      client,
      EVENT_ID,
      message("media.deleted", { ids: ["a", "c"] }),
    );

    // Instant removal is the point: a host deleting a photo must not wait on
    // a round trip to see it go.
    expect(result.needsRefetch).toBe(false);

    const cached = readHost(client);

    expect(cached.pages[0].data.map((i) => i.id)).toEqual(["b"]);
    expect(cached.pages[0].counts.all).toBe(1);
    expect(cached.pages[0].counts.photos).toBe(1);
    expect(cached.pages[0].counts.videos).toBe(0);
  });

  test("drops hidden media out of the all filter and moves the counters", () => {
    const client = hostCache([item("a"), item("b")]);

    const result = applyHostRealtimeMessage(
      client,
      EVENT_ID,
      message("media.updated", { ids: ["a"], status: "hidden" }),
    );

    expect(result.needsRefetch).toBe(false);

    const cached = readHost(client);

    expect(cached.pages[0].data.map((i) => i.id)).toEqual(["b"]);
    expect(cached.pages[0].counts.all).toBe(1);
    expect(cached.pages[0].counts.hidden).toBe(1);
  });

  test("keeps featured media visible and counts it as a favourite", () => {
    const client = hostCache([item("a"), item("b")]);

    applyHostRealtimeMessage(
      client,
      EVENT_ID,
      message("media.updated", { ids: ["a"], status: "featured" }),
    );

    const cached = readHost(client);

    expect(cached.pages[0].data.find((i) => i.id === "a")?.status).toBe(
      "featured",
    );
    expect(cached.pages[0].counts.all).toBe(2);
    expect(cached.pages[0].counts.favorites).toBe(1);
  });

  test("updates every open filter variant at once", () => {
    const client = hostCache([item("a"), item("b")]);

    client.setQueryData(
      [
        "event",
        EVENT_ID,
        "media",
        { filter: "photos", sort: "newest", per_page: 24 },
      ],
      {
        pages: [
          {
            data: [item("a"), item("b")],
            counts: { all: 2, photos: 2, videos: 0, favorites: 0, hidden: 0 },
          },
        ],
        pageParams: [""],
      },
    );

    applyHostRealtimeMessage(
      client,
      EVENT_ID,
      message("media.deleted", { ids: ["a"] }),
    );

    // A host with the gallery and a filtered tab open must not see the photo
    // survive in one of them.
    expect(readHost(client).pages[0].data.map((i) => i.id)).toEqual(["b"]);
    expect(readHost(client, "photos").pages[0].data.map((i) => i.id)).toEqual([
      "b",
    ]);
  });

  test("asks for a refetch when an item is not cached", () => {
    const client = hostCache([item("a")]);

    const result = applyHostRealtimeMessage(
      client,
      EVENT_ID,
      message("media.updated", { ids: ["unknown"], status: "featured" }),
    );

    expect(result.needsRefetch).toBe(true);
  });

  test("asks for a refetch on new media because host URLs are presigned", () => {
    const client = hostCache([item("a")]);

    expect(
      applyHostRealtimeMessage(
        client,
        EVENT_ID,
        message("media.created", { ids: ["new"], item: { id: "new" } }),
      ).needsRefetch,
    ).toBe(true);
    expect(
      applyHostRealtimeMessage(
        client,
        EVENT_ID,
        message("media.thumbnail.ready", { ids: ["a"] }),
      ).needsRefetch,
    ).toBe(true);
  });

  test("never drives a counter below zero", () => {
    const client = hostCache([item("a")], { all: 0, photos: 0 });

    applyHostRealtimeMessage(
      client,
      EVENT_ID,
      message("media.deleted", { ids: ["a"] }),
    );

    const counts = readHost(client).pages[0].counts;

    expect(counts.all).toBeGreaterThanOrEqual(0);
    expect(counts.photos).toBeGreaterThanOrEqual(0);
  });
});

test.describe("guest realtime cache", () => {
  test("inserts new media directly using the stable public route", () => {
    const client = new QueryClient();

    client.setQueryData(["public-event-media", SLUG], [item("old")]);

    const result = applyGuestRealtimeMessage(
      client,
      SLUG,
      message("media.created", {
        ids: ["fresh"],
        item: {
          id: "fresh",
          mime_type: "image/jpeg",
          created_at: "2026-09-26T11:00:00Z",
          is_video: false,
          has_event_frame: true,
          thumbnail_ready: false,
          status: "ready",
        },
      }),
      (id) => guestMediaUrl(SLUG, id),
    );

    // A guest URL is a stable route, so no refetch is needed to show it.
    expect(result.needsRefetch).toBe(false);

    const cached = client.getQueryData([
      "public-event-media",
      SLUG,
    ]) as EventMediaItem[];

    expect(cached.map((i) => i.id)).toEqual(["fresh", "old"]);
    expect(cached[0].url).toBe(
      `/api/v1/public/events/${SLUG}/media/fresh/content`,
    );
    expect(cached[0].has_event_frame).toBe(true);
  });

  test("ignores a photo it already has", () => {
    const client = new QueryClient();

    client.setQueryData(["public-event-media", SLUG], [item("dup")]);

    applyGuestRealtimeMessage(
      client,
      SLUG,
      message("media.created", {
        ids: ["dup"],
        item: {
          id: "dup",
          mime_type: "image/jpeg",
          created_at: "2026-09-26T11:00:00Z",
          is_video: false,
          has_event_frame: false,
          thumbnail_ready: false,
          status: "ready",
        },
      }),
      (id) => guestMediaUrl(SLUG, id),
    );

    const cached = client.getQueryData([
      "public-event-media",
      SLUG,
    ]) as EventMediaItem[];

    expect(cached).toHaveLength(1);
  });

  test("removes moderated media at once", () => {
    const client = new QueryClient();

    client.setQueryData(["public-event-media", SLUG], [item("a"), item("b")]);

    // Hiding reaches guests as a deletion, which is what keeps a moderated
    // photo off a guest screen immediately.
    const result = applyGuestRealtimeMessage(
      client,
      SLUG,
      message("media.deleted", { ids: ["a"] }),
      (id) => guestMediaUrl(SLUG, id),
    );

    expect(result.needsRefetch).toBe(false);

    const cached = client.getQueryData([
      "public-event-media",
      SLUG,
    ]) as EventMediaItem[];

    expect(cached.map((i) => i.id)).toEqual(["b"]);
  });

  test("refetches when an unknown photo becomes visible", () => {
    const client = new QueryClient();

    client.setQueryData(["public-event-media", SLUG], [item("a")]);

    const result = applyGuestRealtimeMessage(
      client,
      SLUG,
      message("media.updated", { ids: ["unhidden"], status: "ready" }),
      (id) => guestMediaUrl(SLUG, id),
    );

    expect(result.needsRefetch).toBe(true);
  });

  test("does nothing for a thumbnail, whose guest URL is unchanged", () => {
    const client = new QueryClient();

    client.setQueryData(["public-event-media", SLUG], [item("a")]);

    const result = applyGuestRealtimeMessage(
      client,
      SLUG,
      message("media.thumbnail.ready", { ids: ["a"] }),
      (id) => guestMediaUrl(SLUG, id),
    );

    expect(result.needsRefetch).toBe(false);
  });
});

test.describe("realtime frame parsing", () => {
  test("rejects malformed and unknown frames instead of throwing", () => {
    expect(
      parseRealtimeMessage({ id: "1", kind: "media.deleted", data: "{oops" }),
    ).toBeNull();
    // A client that predates a new server kind must ignore it quietly rather
    // than tear the stream down.
    expect(
      parseRealtimeMessage({ id: "1", kind: "media.exploded", data: "{}" }),
    ).toBeNull();
    expect(
      parseRealtimeMessage({ id: "1", kind: "media.deleted", data: "null" }),
    ).toBeNull();
  });

  test("parses a well-formed frame", () => {
    const parsed = parseRealtimeMessage({
      id: "msg-9",
      kind: "media.deleted",
      data: '{"ids":["a","b"]}',
    });

    expect(parsed?.kind).toBe("media.deleted");
    expect(parsed?.id).toBe("msg-9");
    expect(parsed?.data).toEqual({ ids: ["a", "b"] });
  });
});

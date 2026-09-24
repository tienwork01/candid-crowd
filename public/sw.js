/**
 * CandidCrowd Progressive Web App Service Worker
 *
 * Implements resilient caching for event venues with spotty Wi-Fi:
 * - App shell & static assets precaching (Stale-While-Revalidate)
 * - Navigation handling with offline fallback page
 * - Strict Network-Only bypass for API routes & Cloudflare R2 presigned uploads
 */

const SW_VERSION = "candidcrowd-sw-v1";
const STATIC_CACHE = `${SW_VERSION}-static`;
const PAGE_CACHE = `${SW_VERSION}-pages`;
const IMAGE_CACHE = `${SW_VERSION}-images`;

const PRECACHE_URLS = [
  "/offline",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// Maximum cached images to conserve venue mobile data & device storage
const MAX_IMAGE_CACHE_ENTRIES = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !name.startsWith(SW_VERSION))
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function limitCacheEntries(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
    await limitCacheEntries(cacheName, maxEntries);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never intercept non-GET requests (e.g. presigned R2 PUTs or API POSTs)
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Bypass API routes, Auth endpoints, development HMR, and external storage/upload endpoints
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("webpack-hmr") ||
    url.pathname.includes(".hot-update.") ||
    url.hostname.includes("r2.cloudflarestorage.com") ||
    url.searchParams.has("X-Amz-Signature") ||
    url.searchParams.has("upload_token")
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();

            caches.open(PAGE_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }

          return response;
        })
        .catch(async () => {
          // If network failed, check cached page
          const cachedResponse = await caches.match(request);

          if (cachedResponse) {
            return cachedResponse;
          }

          // Fallback to offline page
          const offlinePage = await caches.match("/offline");

          if (offlinePage) {
            return offlinePage;
          }

          return new Response(
            "Offline. Please check your connection and reload.",
            {
              headers: { "Content-Type": "text/plain" },
            },
          );
        }),
    );

    return;
  }

  // 2. Static Next.js chunks, fonts, and SVG icons (Stale-While-Revalidate)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.pathname.endsWith(".svg") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();

              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, clone));
            }

            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      }),
    );

    return;
  }

  // 3. Images (Cache-First with LRU limit)
  if (
    request.destination === "image" ||
    /\.(png|jpg|jpeg|webp|gif|avif)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);

          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            const cache = await caches.open(IMAGE_CACHE);

            await cache.put(request, clone);
            limitCacheEntries(IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES);
          }

          return networkResponse;
        } catch {
          // If offline and image not in cache, fallback gracefully
          return new Response("", {
            status: 408,
            statusText: "Offline Image Unavailable",
          });
        }
      }),
    );
  }
});

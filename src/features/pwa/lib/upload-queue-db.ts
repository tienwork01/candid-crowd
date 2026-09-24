/**
 * IndexedDB helper for resilient offline uploads at event venues with spotty Wi-Fi.
 * Persists pending photos/videos so they survive tab reloads and network dropouts.
 */

export type PendingUploadItem = {
  id: string;
  slug: string;
  fileBlob: Blob;
  fileName: string;
  mimeType: string;
  size: number;
  guestName?: string;
  guestNote?: string;
  /** Anonymous token is event-scoped and needed to finish an already reserved upload after reload. */
  guestSessionToken?: string;
  /** Stable server media ID once the upload target has been authorized. */
  mediaId?: string;
  lastError?: string;
  createdAt: number;
  status: "queued" | "uploading" | "failed";
  retryCount: number;
};

const DB_NAME = "candidcrowd_pwa_db";
const DB_VERSION = 2;
const STORE_NAME = "pending_uploads";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(
        new Error("IndexedDB is not available in this environment."),
      );
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });

        store.createIndex("slug", "slug", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePendingUpload(
  item: Omit<PendingUploadItem, "createdAt" | "retryCount" | "status">,
): Promise<PendingUploadItem> {
  const db = await openDatabase();
  const fullItem: PendingUploadItem = {
    ...item,
    createdAt: Date.now(),
    status: "queued",
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(fullItem);

    request.onsuccess = () => resolve(fullItem);
    request.onerror = () => reject(request.error);
  });
}

export async function updatePendingUpload(
  id: string,
  patch: Partial<Omit<PendingUploadItem, "id" | "createdAt" | "retryCount">>,
): Promise<void> {
  try {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: PendingUploadItem | undefined = getReq.result;

        if (!item) return resolve();

        const putReq = store.put({ ...item, ...patch });

        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    // IndexedDB can be unavailable in private/embedded browsers. Upload still
    // works in the open tab, but cannot promise recovery after it is closed.
  }
}

export async function getPendingUploads(
  slug?: string,
): Promise<PendingUploadItem[]> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      if (slug) {
        const index = store.index("slug");
        const request = index.getAll(slug);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      } else {
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      }
    });
  } catch {
    return [];
  }
}

export async function removePendingUpload(id: string): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Gracefully ignore deletion failures
  }
}

export async function clearPendingUploads(slug: string): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("slug");
      const request = index.getAllKeys(slug);

      request.onsuccess = () => {
        const keys = request.result;

        keys.forEach((key) => store.delete(key));
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  } catch {
    // Gracefully ignore deletion failures
  }
}

export async function updatePendingUploadStatus(
  id: string,
  status: PendingUploadItem["status"],
): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: PendingUploadItem | undefined = getReq.result;

        if (!item) {
          return resolve();
        }

        item.status = status;

        if (status === "failed") {
          item.retryCount += 1;
        }

        const putReq = store.put(item);

        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    // Ignore update failures
  }
}

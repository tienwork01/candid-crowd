"use client";

import { useCallback, useState } from "react";
import { privateClient } from "@/lib/api-client";

type ExportJob = {
  id: string;
  status: "queued" | "processing" | "ready" | "failed";
  error_message?: string | null;
  download_url?: string;
};

const POLL_INTERVAL_MS = 5_000;
const MAX_POLLS = 180;

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function useEventExport(eventId?: string) {
  const [isExporting, setIsExporting] = useState(false);

  const createExport = useCallback(async () => {
    if (!eventId) throw new Error("event_id_required");

    setIsExporting(true);

    try {
      const created = await privateClient.post<ExportJob>(
        `/api/v1/events/${encodeURIComponent(eventId)}/exports`,
      );

      for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
        await wait(POLL_INTERVAL_MS);

        const result = await privateClient.get<ExportJob>(
          `/api/v1/events/${encodeURIComponent(eventId)}/exports/${encodeURIComponent(created.data.id)}`,
        );

        if (result.data.status === "ready" && result.data.download_url) {
          return result.data.download_url;
        }

        if (result.data.status === "failed") {
          throw new Error(result.data.error_message || "event_export_failed");
        }
      }

      throw new Error("event_export_timed_out");
    } finally {
      setIsExporting(false);
    }
  }, [eventId]);

  return { createExport, isExporting };
}

import { eventTypes, type EventDraft } from "../types/event";

export const EVENT_DRAFT_KEY = "candidcrowd.event-draft.v1";

export function isEventDraft(value: unknown): value is EventDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.id === "string" &&
    typeof draft.name === "string" &&
    draft.name.trim().length > 0 &&
    draft.name.length <= 100 &&
    typeof draft.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.date) &&
    !Number.isNaN(Date.parse(draft.date)) &&
    eventTypes.includes(draft.type as EventDraft["type"]) &&
    typeof draft.expectedGuests === "number" &&
    Number.isInteger(draft.expectedGuests) &&
    draft.expectedGuests > 0 &&
    draft.expectedGuests <= 10000 &&
    typeof draft.createdAt === "string"
  );
}

export const eventTypes = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Reunion",
  "Trip",
  "Team celebration",
  "Other",
] as const;

export type EventType = (typeof eventTypes)[number];

export type EventDraft = {
  id: string;
  name: string;
  date: string;
  type: EventType;
  expectedGuests: number;
  createdAt: string;
};

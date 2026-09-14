"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { EVENT_DRAFT_KEY, isEventDraft } from "@/features/event/lib/validation";
import { eventTypes, type EventDraft } from "@/features/event/types/event";

export function EventDraftForm() {
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Browser storage is unavailable during SSR; restore once after hydration.
    try {
      const raw = localStorage.getItem(EVENT_DRAFT_KEY);

      if (raw) {
        const value: unknown = JSON.parse(raw);

        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser-only storage
        if (isEventDraft(value)) setDraft(value);
      }
    } catch {
      /* Form remains usable if storage is unavailable. */
    }
  }, []);
  useEffect(() => {
    if (saved) resultHeading.current?.focus();
  }, [saved]);

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();

    if (!name) {
      setError("Please enter an event name, not just spaces.");
      event.currentTarget
        .querySelector<HTMLInputElement>("#event-name")
        ?.focus();

      return;
    }

    const next: EventDraft = {
      id: draft?.id ?? crypto.randomUUID(),
      name,
      date: String(form.get("date")),
      type: String(form.get("type")) as EventDraft["type"],
      expectedGuests: Number(form.get("guests")),
      createdAt: draft?.createdAt ?? new Date().toISOString(),
    };

    if (!isEventDraft(next)) {
      setError("Please check your event details and try again.");

      return;
    }

    try {
      localStorage.setItem(EVENT_DRAFT_KEY, JSON.stringify(next));
      setDraft(next);
      setError("");
      setSaved(true);
    } catch {
      setError(
        "Your browser couldn’t save this draft. Allow site storage, then try again. Your details are still here.",
      );
    }
  }

  if (saved && draft)
    return (
      <section className="draft-result">
        <span className="draft-result__icon">
          <Check aria-hidden="true" />
        </span>
        <h2 ref={resultHeading} tabIndex={-1}>
          A little beginning for
          <br />
          <em>{draft.name}.</em>
        </h2>
        <p>Your event draft is saved on this device.</p>
        <dl>
          <dt>Event type</dt>
          <dd>{draft.type}</dd>
          <dt>Date</dt>
          <dd>
            {new Date(`${draft.date}T12:00:00`).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </dd>
          <dt>Expected guests</dt>
          <dd>{draft.expectedGuests}</dd>
        </dl>
        <p>
          This draft isn’t a live event yet. Guest links, QR codes, cloud
          uploads, and host accounts will be available in a future release.
        </p>
        <Link href="/#demo" className="button">
          Try the guest experience <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <button className="text-button" onClick={() => setSaved(false)}>
          Edit your draft
        </button>
      </section>
    );

  return (
    <form className="event-form" onSubmit={save} key={draft?.id ?? "new"}>
      <div className="event-form__field">
        <label htmlFor="event-name">Event name</label>
        <input
          id="event-name"
          name="name"
          placeholder="e.g. Emma & James"
          defaultValue={draft?.name}
          maxLength={100}
          required
          aria-describedby={error ? "form-error" : undefined}
        />
      </div>
      <div className="event-form__row">
        <div className="event-form__field">
          <label htmlFor="event-date">Event date</label>
          <input
            id="event-date"
            name="date"
            type="date"
            defaultValue={draft?.date}
            required
          />
        </div>
        <div className="event-form__field">
          <label htmlFor="event-type">What are we celebrating?</label>
          <select
            id="event-type"
            name="type"
            defaultValue={draft?.type ?? "Wedding"}
          >
            {eventTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="event-form__field">
        <label htmlFor="event-guests">Expected guests</label>
        <input
          id="event-guests"
          name="guests"
          type="number"
          min={1}
          max={10000}
          step={1}
          defaultValue={draft?.expectedGuests ?? 50}
          required
        />
      </div>
      {error && (
        <p id="form-error" role="alert" className="event-form__error">
          {error}
        </p>
      )}
      <button className="button" type="submit">
        Save my event draft <ArrowRight size={17} aria-hidden="true" />
      </button>
      <p className="event-form__note">
        Free preview · Stored only in this browser · No account required
      </p>
    </form>
  );
}

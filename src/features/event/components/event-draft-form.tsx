"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { eventTypes, type EventDraft } from "@/features/event/types/event";
import { APIError, apiFetch } from "@/lib/api-client";

export function EventDraftForm() {
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (saved) resultHeading.current?.focus();
  }, [saved]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
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

    try {
      const response = await apiFetch("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          event_date: `${String(form.get("date"))}T00:00:00Z`,
          event_type: String(form.get("type")),
          expected_guest_count: Number(form.get("guests")),
        }),
      });
      const created = (await response.json()) as {
        id: string;
        created_at: string;
      };
      const next: EventDraft = {
        id: created.id,
        name,
        date: String(form.get("date")),
        type: String(form.get("type")) as EventDraft["type"],
        expectedGuests: Number(form.get("guests")),
        createdAt: created.created_at,
      };

      setDraft(next);
      setError("");
      setSaved(true);
    } catch (caught) {
      if (caught instanceof APIError && caught.status === 401) {
        router.push("/login?next=/create");

        return;
      }

      if (caught instanceof APIError && caught.code === "email_unverified") {
        router.push("/verify-email");

        return;
      }

      if (caught instanceof APIError && caught.code === "consent_required") {
        setError(
          "Please accept the current Terms and Privacy Policy before creating an event.",
        );

        return;
      }

      setError(
        caught instanceof APIError
          ? caught.message
          : "We couldn’t create your event. Please try again.",
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
        <p>Your event is live and ready for guests.</p>
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
          Your event is securely stored in CandidCrowd. Guest links and uploads
          are now tied to your host account.
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
      <p className="event-form__note">Private event · Secure host account</p>
    </form>
  );
}

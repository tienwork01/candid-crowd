"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageSquare,
  QrCode,
} from "@phosphor-icons/react";
import { eventTypes, type EventDraft } from "@/features/event/types/event";
import { useCreateEvent } from "@/features/event/hooks";
import { APIError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";

type Basics = { name: string; date: string; type: EventDraft["type"] };

const themes = ["Olive", "Rose", "Midnight"] as const;
const previewMode = process.env.NODE_ENV === "development";

export function EventDraftForm() {
  const [step, setStep] = useState<1 | 2>(1),
    [basics, setBasics] = useState<Basics>({
      name: "",
      date: "",
      type: "Wedding",
    }),
    [theme, setTheme] = useState<(typeof themes)[number]>("Olive"),
    [qr, setQr] = useState("Classic"),
    [cover, setCover] = useState(""),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false),
    [preview, setPreview] = useState(false),
    [qrImage, setQrImage] = useState(""),
    [guestUrl, setGuestUrl] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const update = (key: keyof Basics, value: string) =>
    setBasics({ ...basics, [key]: value });

  useEffect(() => {
    if (!saved) return;

    let active = true;
    const link = guestUrl;

    if (!link) return;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(link, {
          width: 280,
          margin: 1,
          errorCorrectionLevel: "M",
        }),
      )
      .then((image) => active && setQrImage(image));

    return () => {
      active = false;
    };
  }, [guestUrl, saved]);

  const next = () => {
    if (!basics.name.trim() || !basics.date) {
      setError(
        !basics.name.trim()
          ? "Give your event a name to continue."
          : "Choose an event date to continue.",
      );
      nameInput.current?.focus();

      return;
    }

    setError("");
    void create();
  };

  const create = async () => {
    if (step === 2) {
      setSaved(true);

      return;
    }

    try {
      const created = await createEvent({
        name: basics.name.trim(),
        event_date: `${basics.date}T00:00:00Z`,
        event_type: basics.type,
        expected_guest_count: 50,
      });
      const publicPath =
        created.public_url ||
        created.guest_url ||
        `/e/${encodeURIComponent(created.slug || created.id)}`;

      setGuestUrl(new URL(publicPath, location.origin).toString());
      setPreview(false);
      setSaved(true);
    } catch (caught) {
      if (caught instanceof APIError && caught.status === 401) {
        if (previewMode) {
          setGuestUrl(new URL("/e/event-preview", location.origin).toString());
          setPreview(true);
          setSaved(true);

          return;
        }

        setError("Please sign in to create and save your event.");

        return;
      }

      setError(
        getErrorMessage(
          caught,
          "We couldn’t create your event. Please try again.",
        ),
      );
    }
  };

  if (saved)
    return (
      <section
        className="event-setup__success"
        aria-labelledby="event-ready-title"
      >
        <span>
          <Check aria-hidden="true" />
        </span>
        <p className="eyebrow">
          {preview ? "EVENT PREVIEW" : "YOUR EVENT IS READY"}
        </p>
        <h1 id="event-ready-title">{basics.name} is ready.</h1>
        <p>
          {preview
            ? "This is a local preview. Sign in when you are ready to save and share a real event."
            : "Share this QR code and guests can start adding their perspective."}
        </p>
        <div className="event-setup__qr">
          {qrImage ? (
            <Image
              src={qrImage}
              alt={`QR code for ${basics.name}`}
              width={280}
              height={280}
              unoptimized
            />
          ) : (
            <QrCode size={72} aria-hidden="true" />
          )}
        </div>
        {guestUrl && !preview && (
          <a className="event-setup__guest-link" href={guestUrl}>
            {guestUrl.replace(/^https?:\/\//, "")}
          </a>
        )}
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setSaved(false);
            setStep(2);
          }}
        >
          Want to make it yours? <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    );

  return (
    <section className="event-setup" aria-labelledby="event-setup-title">
      <div className="event-setup__intro">
        <p className="eyebrow">CREATE AN EVENT</p>
        <h1 id="event-setup-title">
          Make a home for
          <br />
          <em>the moments.</em>
        </h1>
        <p>Start simple. You can refine every detail later.</p>
      </div>
      <ol className="event-setup__steps" aria-label="Event setup progress">
        <li aria-current={step === 1 ? "step" : undefined}>
          <span>1</span>Event basics
        </li>
        <li>
          <span>2</span>Your event is ready
        </li>
      </ol>
      <div className="event-setup__grid">
        <div className="event-setup__panel">
          {step === 1 ? (
            <div className="event-form">
              <div className="event-form__heading">
                <span>START HERE</span>
                <h2>Event basics</h2>
                <p>The essentials your guests will see.</p>
              </div>
              <div className="event-form__field">
                <label htmlFor="event-name">Event name</label>
                <input
                  ref={nameInput}
                  id="event-name"
                  value={basics.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Emma & James"
                />
              </div>
              <div className="event-form__row">
                <div className="event-form__field">
                  <label htmlFor="event-type">Event type</label>
                  <select
                    id="event-type"
                    value={basics.type}
                    onChange={(e) => update("type", e.target.value)}
                  >
                    {eventTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="event-form__field">
                  <label htmlFor="event-date">When is it?</label>
                  <input
                    id="event-date"
                    type="date"
                    value={basics.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <p role="alert" className="event-form__error">
                  {error}
                </p>
              )}
              <button
                className="button"
                type="button"
                onClick={next}
                disabled={isCreating}
              >
                {isCreating ? "Creating event..." : "Create event"}{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="event-form">
              <div className="event-form__heading">
                <span>STEP 2 OF 2</span>
                <h2>Make it yours</h2>
                <p>Optional touches for your guest experience.</p>
              </div>
              <div className="event-form__field">
                <label htmlFor="qr-style">QR style</label>
                <select
                  id="qr-style"
                  value={qr}
                  onChange={(e) => setQr(e.target.value)}
                >
                  <option>Classic</option>
                  <option>Modern frame</option>
                  <option>Editorial</option>
                </select>
              </div>
              <fieldset className="event-form__field">
                <legend>Event color</legend>
                <div className="event-form__themes">
                  {themes.map((item) => (
                    <button
                      className={`event-form__theme event-form__theme--${item.toLowerCase()}${theme === item ? " event-form__theme--selected" : ""}`}
                      type="button"
                      key={item}
                      aria-pressed={theme === item}
                      onClick={() => setTheme(item)}
                    >
                      <span aria-hidden="true" />
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="event-form__field">
                <label htmlFor="event-cover">Optional cover photo</label>
                <label className="event-form__cover" htmlFor="event-cover">
                  <ImageSquare aria-hidden="true" />
                  <span>{cover || "Choose a photo"}</span>
                  <small>JPG, PNG or WebP</small>
                </label>
                <input
                  id="event-cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => setCover(e.target.files?.[0]?.name || "")}
                />
              </div>
              {error && (
                <p role="alert" className="event-form__error">
                  {error}
                </p>
              )}
              <div className="event-form__actions">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} aria-hidden="true" /> Back
                </button>
                <button className="button" type="button" onClick={create}>
                  Continue <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
              <button
                className="event-form__skip"
                type="button"
                onClick={create}
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
        <aside
          className={`event-overview event-overview--${theme.toLowerCase()}`}
          aria-label="Event overview"
        >
          <div className="event-overview__top">
            <span>EVENT OVERVIEW</span>
            <QrCode size={19} aria-hidden="true" />
          </div>
          <div className="event-overview__cover">
            {cover ? (
              <ImageSquare aria-hidden="true" />
            ) : (
              <span>YOUR COVER PHOTO</span>
            )}
          </div>
          <p>{basics.type}</p>
          <h2>{basics.name || "Your event name"}</h2>
          <time>
            {basics.date
              ? new Date(`${basics.date}T12:00:00`).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" },
                )
              : "Choose a date"}
          </time>
          <div className="event-overview__footer">
            <span>{qr} QR</span>
            <span>Private event</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

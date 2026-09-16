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
import { useLocale, useTranslations } from "next-intl";
import { eventTypes, type EventDraft } from "@/features/event/types/event";
import { useCreateEvent } from "@/features/event/hooks";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { APIError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";

type Basics = { name: string; date: string; type: EventDraft["type"] };

const themes = ["Olive", "Rose", "Midnight"] as const;
const qrStyles = ["Classic", "Modern frame", "Editorial"] as const;
const previewMode = process.env.NODE_ENV === "development";

export function EventDraftForm() {
  const t = useTranslations("event");
  const tErrors = useTranslations("common.errors");
  const locale = useLocale() as AppLocale;

  const [step, setStep] = useState<1 | 2>(1);
  const [basics, setBasics] = useState<Basics>({
    name: "",
    date: "",
    type: "Wedding",
  });
  const [theme, setTheme] = useState<(typeof themes)[number]>("Olive");
  const [qr, setQr] = useState<(typeof qrStyles)[number]>("Classic");
  const [cover, setCover] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [guestUrl, setGuestUrl] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const update = (key: keyof Basics, value: string) =>
    setBasics({ ...basics, [key]: value });

  const themeLabels: Record<(typeof themes)[number], string> = {
    Olive: t("setup.themeOlive"),
    Rose: t("setup.themeRose"),
    Midnight: t("setup.themeMidnight"),
  };

  const qrLabels: Record<(typeof qrStyles)[number], string> = {
    Classic: t("setup.qrClassic"),
    "Modern frame": t("setup.qrModernFrame"),
    Editorial: t("setup.qrEditorial"),
  };

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
        !basics.name.trim() ? t("setup.nameRequired") : t("setup.dateRequired"),
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

        setError(t("setup.signInRequired"));

        return;
      }

      setError(getErrorMessage(caught, undefined, tErrors));
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
          {preview ? t("setup.previewEyebrow") : t("setup.readyEyebrow")}
        </p>
        <h1 id="event-ready-title">
          {basics.name} {t("setup.readyTitleSuffix")}
        </h1>
        <p>
          {preview
            ? t("setup.previewDescription")
            : t("setup.readyDescription")}
        </p>
        <div className="event-setup__qr">
          {qrImage ? (
            <Image
              src={qrImage}
              alt={`${t("setup.qrAltPrefix")} ${basics.name}`}
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
          {t("setup.makeItYoursCta")}{" "}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    );

  return (
    <section className="event-setup" aria-labelledby="event-setup-title">
      <div className="event-setup__intro">
        <p className="eyebrow">{t("setup.introEyebrow")}</p>
        <h1 id="event-setup-title">
          {t("setup.introTitleLine1")}
          <br />
          <em>{t("setup.introTitleLine2")}</em>
        </h1>
        <p>{t("setup.introDescription")}</p>
      </div>
      <ol className="event-setup__steps" aria-label={t("setup.progressAria")}>
        <li aria-current={step === 1 ? "step" : undefined}>
          <span>1</span>
          {t("setup.step1")}
        </li>
        <li>
          <span>2</span>
          {t("setup.step2")}
        </li>
      </ol>
      <div className="event-setup__grid">
        <div className="event-setup__panel">
          {step === 1 ? (
            <div className="event-form">
              <div className="event-form__heading">
                <span>{t("setup.startHere")}</span>
                <h2>{t("setup.step1")}</h2>
                <p>{t("setup.step1Sub")}</p>
              </div>
              <div className="event-form__field">
                <label htmlFor="event-name">{t("setup.nameLabel")}</label>
                <input
                  ref={nameInput}
                  id="event-name"
                  value={basics.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("setup.namePlaceholder")}
                />
              </div>
              <div className="event-form__row">
                <div className="event-form__field">
                  <label htmlFor="event-type">{t("setup.typeLabel")}</label>
                  <select
                    id="event-type"
                    value={basics.type}
                    onChange={(e) => update("type", e.target.value)}
                  >
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {t(`types.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="event-form__field">
                  <label htmlFor="event-date">{t("setup.dateLabel")}</label>
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
                {isCreating ? t("setup.creating") : t("setup.create")}{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="event-form">
              <div className="event-form__heading">
                <span>{t("setup.step2Eyebrow")}</span>
                <h2>{t("setup.step2Heading")}</h2>
                <p>{t("setup.step2Sub")}</p>
              </div>
              <div className="event-form__field">
                <label htmlFor="qr-style">{t("setup.qrStyleLabel")}</label>
                <select
                  id="qr-style"
                  value={qr}
                  onChange={(e) =>
                    setQr(e.target.value as (typeof qrStyles)[number])
                  }
                >
                  {qrStyles.map((style) => (
                    <option key={style} value={style}>
                      {qrLabels[style]}
                    </option>
                  ))}
                </select>
              </div>
              <fieldset className="event-form__field">
                <legend>{t("setup.colorLegend")}</legend>
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
                      {themeLabels[item]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="event-form__field">
                <label htmlFor="event-cover">{t("setup.coverLabel")}</label>
                <label className="event-form__cover" htmlFor="event-cover">
                  <ImageSquare aria-hidden="true" />
                  <span>{cover || t("setup.choosePhoto")}</span>
                  <small>{t("setup.coverFormatHint")}</small>
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
                  <ArrowLeft size={16} aria-hidden="true" /> {t("setup.back")}
                </button>
                <button className="button" type="button" onClick={create}>
                  {t("setup.continue")}{" "}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
              <button
                className="event-form__skip"
                type="button"
                onClick={create}
              >
                {t("setup.skipForNow")}
              </button>
            </div>
          )}
        </div>
        <aside
          className={`event-overview event-overview--${theme.toLowerCase()}`}
          aria-label={t("setup.overviewAria")}
        >
          <div className="event-overview__top">
            <span>{t("setup.overviewTitle")}</span>
            <QrCode size={19} aria-hidden="true" />
          </div>
          <div className="event-overview__cover">
            {cover ? (
              <ImageSquare aria-hidden="true" />
            ) : (
              <span>{t("setup.coverPlaceholder")}</span>
            )}
          </div>
          <p>{t(`types.${basics.type}`)}</p>
          <h2>{basics.name || t("setup.nameFallback")}</h2>
          <time>
            {basics.date
              ? formatDate(`${basics.date}T12:00:00`, locale, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : t("setup.dateFallback")}
          </time>
          <div className="event-overview__footer">
            <span>
              {qrLabels[qr]} {t("setup.qrSuffix")}
            </span>
            <span>{t("setup.privateEvent")}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

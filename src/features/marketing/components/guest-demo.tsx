"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { m, useInView } from "motion/react";
import {
  ArrowRight,
  Check,
  ImageSquare,
  LockKey,
  ArrowCounterClockwise,
  X,
} from "@phosphor-icons/react";
import { Button, Progress } from "@/components/ui";
import { useTranslations } from "next-intl";
import {
  guestDemo,
  sampleEvent,
  photos as staticPhotos,
  type MarketingPhoto,
} from "../data/marketing";
import { useUploadPreview } from "../hooks/use-upload-preview";
import { DemoQr } from "./demo-qr";
import { DemoGallery } from "./demo-gallery";

export function GuestDemo() {
  const t = useTranslations("marketing.guestDemo");
  const tSampleEvent = useTranslations("marketing.sampleEvent");
  const tPhotos = useTranslations("marketing.photos");
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<MarketingPhoto[]>([]);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const readingRef = useRef(false);
  const generation = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLElement>(null);
  const urls = useRef<string[]>([]);
  const inView = useInView(section, { amount: 0.15 });
  const upload = useUploadPreview(inView);
  const busy = upload.phase === "uploading";
  const complete = upload.phase === "success";

  type StaticPhotoKey = keyof typeof staticPhotos;

  function getPhotoAlt(photo: MarketingPhoto) {
    if (photo.id in staticPhotos) {
      return tPhotos(photo.id as StaticPhotoKey);
    }

    return photo.alt;
  }

  useEffect(
    () => () => {
      generation.current++;
      urls.current.forEach(URL.revokeObjectURL);
    },
    [],
  );
  useEffect(() => {
    if (new URLSearchParams(location.search).get("demo") === "open") {
      // QR links enter the guest experience after hydration; no server access needed.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpened(true);
    }
  }, []);
  useEffect(() => {
    if (opened) addButton.current?.focus();
  }, [opened]);

  function reset() {
    generation.current++;
    readingRef.current = false;
    setReading(false);
    upload.reset();
    setSelected([]);
    setError("");
    setOpened(false);
    urls.current.forEach(URL.revokeObjectURL);
    urls.current = [];
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length || busy || complete || readingRef.current) return;

    const currentGeneration = ++generation.current;

    readingRef.current = true;
    setReading(true);

    const accepted: MarketingPhoto[] = [];
    let rejected = 0;

    for (const file of Array.from(files)) {
      if (
        !guestDemo.acceptedTypes.includes(file.type) ||
        file.size > guestDemo.maxFileBytes ||
        selected.length + accepted.length >= guestDemo.maxPhotos
      ) {
        rejected++;
        continue;
      }

      const src = URL.createObjectURL(file);
      // Validate decodability as well as MIME; no upload request is made.
      const valid = await new Promise<boolean>((resolve) => {
        const image = new window.Image();
        const timeout = window.setTimeout(() => resolve(false), 5000);

        image.onload = () => {
          window.clearTimeout(timeout);
          resolve(true);
        };

        image.onerror = () => {
          window.clearTimeout(timeout);
          resolve(false);
        };

        image.src = src;
      });

      if (currentGeneration !== generation.current) {
        URL.revokeObjectURL(src);

        return;
      }

      if (!valid) {
        URL.revokeObjectURL(src);
        rejected++;
        continue;
      }

      urls.current.push(src);
      accepted.push({ id: crypto.randomUUID(), src, alt: file.name });
    }

    setSelected((current) =>
      [...current, ...accepted].slice(0, guestDemo.maxPhotos),
    );
    setError(rejected ? t("errorInvalidFiles") : "");
    if (input.current) input.current.value = "";
    readingRef.current = false;
    setReading(false);
  }

  const galleryPhotos = complete
    ? [...selected, ...guestDemo.initialPhotos]
    : guestDemo.initialPhotos;
  const status = reading
    ? t("statusPreparing")
    : complete
      ? t("statusSuccess", { count: selected.length })
      : upload.phase === "error"
        ? t("statusError")
        : busy
          ? t("statusBusy")
          : selected.length
            ? t("statusReady", { count: selected.length })
            : t("statusEmpty");

  return (
    <section
      id="demo"
      ref={section}
      className="guest-demo section-pad"
      aria-labelledby="demo-title"
    >
      <div className="container">
        <div className="center-heading">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 id="demo-title">
            {t("titleLine1")}
            <br />
            <em>{t("titleLine2")}</em>
          </h2>
          <p>{t("subhead")}</p>
        </div>
        <div className="guest-demo__layout">
          <div className="guest-demo__invitation">
            <DemoQr />
            <Button
              variant="outline"
              onClick={() => {
                setOpened(true);
                addButton.current?.focus();
              }}
            >
              {t("tryWithoutScanning")} <ArrowRight aria-hidden="true" />
            </Button>
            <span className="guest-demo__caption">{t("caption")}</span>
          </div>
          <div className="guest-phone">
            <div className="guest-phone__speaker" aria-hidden="true" />
            <div className="guest-phone__intro">
              <span className="eyebrow">{t("invitedTo")}</span>
              <h3>{sampleEvent.name}</h3>
              <p>{tSampleEvent("disclosure")}</p>
            </div>
            <ol className="guest-phone__steps" aria-label={t("progressAria")}>
              {[t("steps.open"), t("steps.choose"), t("steps.share")].map(
                (step, index) => (
                  <li
                    key={index}
                    className={
                      (opened ? (selected.length ? 2 : 1) : 0) >= index
                        ? "is-current"
                        : ""
                    }
                    aria-current={
                      (!opened ? 0 : selected.length ? 2 : 1) === index
                        ? "step"
                        : undefined
                    }
                  >
                    <span>{index + 1}</span>
                    {step}
                  </li>
                ),
              )}
            </ol>
            <div className="guest-phone__body">
              {!opened ? (
                <>
                  <div className="guest-phone__welcome-photo">
                    <Image
                      src="/images/wedding-meadow.webp"
                      alt={t("welcomeAlt")}
                      fill
                      sizes="260px"
                    />
                  </div>
                  <h4>
                    {t("welcomeTitleLine1")}
                    <br />
                    {t("welcomeTitleLine2")}
                  </h4>
                  <Button onClick={() => setOpened(true)}>
                    {t("openEvent")} <ArrowRight aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="guest-phone__photo-grid">
                    {selected.length ? (
                      selected.map((photo) => {
                        const alt = getPhotoAlt(photo);

                        return (
                          <div key={photo.id} className="guest-phone__photo">
                            <Image
                              src={photo.src}
                              alt={alt}
                              fill
                              sizes="120px"
                              unoptimized={photo.src.startsWith("blob:")}
                            />
                            {!busy && !complete && (
                              <button
                                className="guest-phone__remove-photo"
                                disabled={reading}
                                aria-label={t("removePhoto", { alt })}
                                onClick={() =>
                                  setSelected((current) =>
                                    current.filter(
                                      (item) => item.id !== photo.id,
                                    ),
                                  )
                                }
                              >
                                <X size={14} aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="guest-phone__placeholder">
                        <ImageSquare size={30} aria-hidden="true" />
                        <span>{t("placeholder")}</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="demo-files"
                    ref={input}
                    type="file"
                    hidden
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    aria-label={t("fileInputAria")}
                    onChange={(event) => void addFiles(event.target.files)}
                  />
                  {!busy && !complete && (
                    <>
                      <Button
                        ref={addButton}
                        variant="outline"
                        onClick={() => input.current?.click()}
                        disabled={
                          reading || selected.length >= guestDemo.maxPhotos
                        }
                      >
                        <ImageSquare aria-hidden="true" /> {t("addPhotos")}
                      </Button>
                      <button
                        className="text-button"
                        disabled={
                          reading || selected.length >= guestDemo.maxPhotos
                        }
                        onClick={() => {
                          setError("");
                          setSelected((current) =>
                            [
                              ...current,
                              ...guestDemo.samplePhotos.map((photo) => ({
                                ...photo,
                                id: crypto.randomUUID(),
                              })),
                            ].slice(0, guestDemo.maxPhotos),
                          );
                        }}
                      >
                        {t("useSamplePhotos")}{" "}
                        <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    </>
                  )}
                  {selected.length > 0 && !busy && !complete && (
                    <m.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="w-full"
                    >
                      <Button
                        disabled={reading}
                        className="guest-phone__upload-cta w-full"
                        onClick={() => {
                          setError("");
                          upload.start();
                        }}
                      >
                        {upload.phase === "error"
                          ? t("retryUpload")
                          : t("uploadCount", { count: selected.length })}{" "}
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </m.div>
                  )}
                  {busy && (
                    <div className="guest-phone__upload-feedback">
                      <div className="guest-phone__progress-label">
                        <span>{t("sharingMoments")}</span>
                        <span>{upload.progress}%</span>
                      </div>
                      <Progress
                        value={upload.progress}
                        aria-label={t("progressBarAria")}
                        className="my-2"
                      />
                      <button
                        className="text-button"
                        onClick={upload.interrupt}
                      >
                        {t("simulateInterruption")}
                      </button>
                    </div>
                  )}
                  {complete && (
                    <m.div
                      className="guest-phone__upload-success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Check aria-hidden="true" />
                      <h4>
                        {t("successTitleLine1")}
                        <br />
                        {t("successTitleLine2")}
                      </h4>
                      <a href="#demo-gallery" className="inline-action">
                        {t("seeYourPhotos")}{" "}
                        <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </m.div>
                  )}
                  {error && (
                    <p role="alert" className="guest-phone__error form-error">
                      {error}
                    </p>
                  )}
                  <p className="guest-phone__status" role="status">
                    {status}
                  </p>
                </>
              )}
            </div>
            <button className="text-button guest-phone__reset" onClick={reset}>
              <ArrowCounterClockwise size={14} aria-hidden="true" />{" "}
              {t("resetDemo")}
            </button>
          </div>
          <div id="demo-gallery" className="guest-demo__gallery-wrap">
            <DemoGallery photos={galleryPhotos} />
            <div className="guest-demo__gallery-note">
              <ArrowRight size={20} aria-hidden="true" />
              <span>
                {t("galleryNoteLine1")}
                <br />
                <em>{t("galleryNoteLine2")}</em>
              </span>
            </div>
          </div>
        </div>
        <p className="guest-demo__disclosure">
          <LockKey size={14} aria-hidden="true" /> {t("disclosure")}
        </p>
      </div>
    </section>
  );
}

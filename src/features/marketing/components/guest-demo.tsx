"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { m, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  ImageSquare,
  LockKey,
  ArrowCounterClockwise,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui";
import { guestDemo, sampleEvent, type MarketingPhoto } from "../data/marketing";
import { useUploadPreview } from "../hooks/use-upload-preview";
import { DemoQr } from "./demo-qr";
import { DemoGallery } from "./demo-gallery";

export function GuestDemo() {
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
  const reduced = useReducedMotion();
  const inView = useInView(section, { amount: 0.15 });
  const upload = useUploadPreview(inView);
  const busy = upload.phase === "uploading";
  const complete = upload.phase === "success";

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
    setError(
      rejected
        ? "Some files couldn’t be added. Choose JPG, PNG or WebP under 10 MB. This demo accepts up to 6 photos."
        : "",
    );
    if (input.current) input.current.value = "";
    readingRef.current = false;
    setReading(false);
  }

  const galleryPhotos = complete
    ? [...selected, ...guestDemo.initialPhotos]
    : guestDemo.initialPhotos;
  const status = reading
    ? "Preparing your local photos…"
    : complete
      ? `${selected.length} photo${selected.length === 1 ? "" : "s"} added to the demo gallery. Your files stayed on this device.`
      : upload.phase === "error"
        ? "Demo upload interrupted. Your photos are still selected. Retry when you’re ready."
        : busy
          ? "Simulating upload. Watch your photos join the gallery."
          : selected.length
            ? `${selected.length} photo${selected.length === 1 ? "" : "s"} ready to share.`
            : "Choose your photos or use our sample moments.";

  return (
    <section
      id="demo"
      ref={section}
      className="guest-demo section-pad"
      aria-labelledby="demo-title"
    >
      <div className="container">
        <div className="center-heading">
          <span className="eyebrow">NO INSTRUCTIONS NEEDED</span>
          <h2 id="demo-title">
            See how easy it is
            <br />
            <em>for your guests.</em>
          </h2>
          <p>You’re the guest. Try it yourself.</p>
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
              Try without scanning <ArrowRight aria-hidden="true" />
            </Button>
            <span className="guest-demo__caption">
              No sign-up. Just jump in.
            </span>
          </div>
          <div className="guest-phone">
            <div className="guest-phone__speaker" aria-hidden="true" />
            <div className="guest-phone__intro">
              <span className="eyebrow">YOU’RE INVITED TO</span>
              <h3>{sampleEvent.name}</h3>
              <p>{sampleEvent.disclosure}</p>
            </div>
            <ol className="guest-phone__steps" aria-label="Demo progress">
              {["Open", "Choose", "Share"].map((step, index) => (
                <li
                  key={step}
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
              ))}
            </ol>
            <div className="guest-phone__body">
              {!opened ? (
                <>
                  <div className="guest-phone__welcome-photo">
                    <Image
                      src="/images/wedding-meadow.webp"
                      alt="A fictional wedding demo gallery"
                      fill
                      sizes="260px"
                    />
                  </div>
                  <h4>
                    A little moment.
                    <br />A memory for everyone.
                  </h4>
                  <Button onClick={() => setOpened(true)}>
                    Open event <ArrowRight aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="guest-phone__photo-grid">
                    {selected.length ? (
                      selected.map((photo) => (
                        <div key={photo.id} className="guest-phone__photo">
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            sizes="120px"
                            unoptimized={photo.src.startsWith("blob:")}
                          />
                          {!busy && !complete && (
                            <button
                              className="guest-phone__remove-photo"
                              disabled={reading}
                              aria-label={`Remove ${photo.alt}`}
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
                      ))
                    ) : (
                      <div className="guest-phone__placeholder">
                        <ImageSquare size={30} aria-hidden="true" />
                        <span>Your perspective belongs here.</span>
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
                    aria-label="Choose photos for the local demo"
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
                        <ImageSquare aria-hidden="true" /> Add photos
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
                        Use sample photos{" "}
                        <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    </>
                  )}
                  {selected.length > 0 && !busy && !complete && (
                    <Button
                      disabled={reading}
                      onClick={() => {
                        setError("");
                        upload.start();
                      }}
                    >
                      {upload.phase === "error"
                        ? "Retry upload"
                        : `Upload ${selected.length} photo${selected.length === 1 ? "" : "s"}`}{" "}
                      <ArrowRight aria-hidden="true" />
                    </Button>
                  )}
                  {busy && (
                    <div className="guest-phone__upload-feedback">
                      <div className="guest-phone__progress-label">
                        <span>Sharing your moments</span>
                        <span>{upload.progress}%</span>
                      </div>
                      <div
                        className="guest-phone__upload-track"
                        role="progressbar"
                        aria-label="Simulated photo upload"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={upload.progress}
                      >
                        <m.div
                          style={{ transformOrigin: "left" }}
                          initial={false}
                          animate={{ scaleX: upload.progress / 100 }}
                          transition={{ duration: reduced ? 0 : 0.2 }}
                        />
                      </div>
                      <button
                        className="text-button"
                        onClick={upload.interrupt}
                      >
                        Simulate an interruption
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
                        You made the gallery
                        <br />a little more you.
                      </h4>
                      <a href="#demo-gallery" className="inline-action">
                        See your photos{" "}
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
              <ArrowCounterClockwise size={14} aria-hidden="true" /> Reset demo
            </button>
          </div>
          <div id="demo-gallery" className="guest-demo__gallery-wrap">
            <DemoGallery photos={galleryPhotos} />
            <div className="guest-demo__gallery-note">
              <ArrowRight size={20} aria-hidden="true" />
              <span>
                From their phone.
                <br />
                <em>Into your story.</em>
              </span>
            </div>
          </div>
        </div>
        <p className="guest-demo__disclosure">
          <LockKey size={14} aria-hidden="true" /> Simulated experience · No
          photos are uploaded · Reloading clears the demo
        </p>
      </div>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { m, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  ImageSquare,
  LockKey,
  ArrowCounterClockwise,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { photos, sampleEvent } from "../data/marketing";
import { useUploadPreview } from "../hooks/use-upload-preview";
import { HeroThree } from "./hero-three";

export function HeroScene() {
  const t = useTranslations("marketing.heroScene");
  const tPhotos = useTranslations("marketing.photos");
  const ref = useRef<HTMLDivElement>(null);
  const [threeReady, setThreeReady] = useState(false);
  const [threeFallbackReason, setThreeFallbackReason] = useState<string | null>(
    null,
  );
  const [angle, setAngle] = useState(0);
  const inView = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotion();
  const upload = useUploadPreview(inView);
  const done = upload.phase === "success";

  return (
    <div
      ref={ref}
      className={`hero-scene${threeReady ? " hero-scene--3d" : ""}`}
      data-renderer={threeReady ? "webgl" : "fallback"}
      data-fallback-reason={
        threeReady ? undefined : (threeFallbackReason ?? undefined)
      }
      aria-label={t("ariaLabel")}
    >
      <div className="hero-scene__orbit" aria-hidden="true" />
      <HeroThree
        progress={upload.progress}
        active={inView}
        angle={angle}
        onReady={setThreeReady}
        onFallback={setThreeFallbackReason}
      />
      {threeReady && (
        <div
          className="hero-scene__view-controls"
          role="group"
          aria-label={t("galleryView")}
        >
          <Button
            variant="outline"
            size="icon"
            aria-label={t("rotateLeft")}
            title={t("rotateLeft")}
            disabled={angle <= -0.4}
            onClick={() => setAngle((value) => Math.max(-0.4, value - 0.4))}
          >
            <ArrowCounterClockwise aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("rotateRight")}
            title={t("rotateRight")}
            disabled={angle >= 0.4}
            onClick={() => setAngle((value) => Math.min(0.4, value + 0.4))}
          >
            <ArrowClockwise aria-hidden="true" />
          </Button>
        </div>
      )}
      <div className="hero-scene__gallery">
        <div className="hero-scene__gallery-top">
          <div>
            <span className="eyebrow">{t("sharedGallery")}</span>
            <h2>{sampleEvent.name}</h2>
          </div>
          <LockKey size={14} aria-hidden="true" />
        </div>
        <div className="hero-scene__gallery-photos">
          <div className="hero-scene__cover">
            <Image
              src={photos.couple.src}
              alt={tPhotos("couple")}
              fill
              sizes="(max-width: 600px) 230px, 310px"
              priority
            />
          </div>
          <div className="hero-scene__tile">
            <Image
              src={photos.table.src}
              alt={tPhotos("table")}
              fill
              sizes="160px"
            />
          </div>
          <div className="hero-scene__tile hero-scene__tile--new scene-new">
            {done ? (
              <m.div
                className="image-fill"
                initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
                animate={{ opacity: 1, scale: reduced ? 1 : [0.92, 1.05, 1] }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={photos.celebration.src}
                  alt={t("phoneAlt")}
                  fill
                  sizes="160px"
                />
              </m.div>
            ) : (
              <>
                <ImageSquare size={22} aria-hidden="true" />
                <span>{t("nextMemory")}</span>
              </>
            )}
          </div>
        </div>
        <span className="hero-scene__caption">{t("caption")}</span>
      </div>
      <div className="hero-scene__phone">
        <div className="hero-scene__speaker" aria-hidden="true" />
        <div className="hero-scene__topline">
          9:41 <span aria-hidden="true">•••</span>
        </div>
        <span className="eyebrow">{t("guestPhone")}</span>
        <div className="hero-scene__phone-photo">
          <Image
            src={photos.celebration.src}
            alt={tPhotos("celebration")}
            fill
            sizes="(max-width: 600px) 150px, 185px"
            priority
          />
        </div>
        <div className="hero-scene__phone-action">
          <ImageSquare size={16} aria-hidden="true" />
          <span>{t("oneLittleMoment")}</span>
        </div>
        <Button
          className="hero-scene__share"
          size="sm"
          disabled={upload.phase === "uploading"}
          aria-busy={upload.phase === "uploading"}
          onClick={
            upload.phase === "uploading"
              ? undefined
              : done
                ? upload.reset
                : upload.start
          }
        >
          {done ? (
            <>
              <ArrowCounterClockwise aria-hidden="true" /> {t("tryAgain")}
            </>
          ) : upload.phase === "uploading" ? (
            t("sharing", { progress: upload.progress })
          ) : (
            <>
              {t("shareMemory")} <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
        <span className="hero-scene__phone-footnote">{t("footnote")}</span>
      </div>
      <div className="hero-scene__connection" aria-hidden="true">
        <ArrowRight size={25} />
      </div>
      <m.div
        className="hero-scene__status"
        initial={false}
        animate={{ scale: !reduced && done ? 1.02 : 1 }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="hero-scene__notification-icon">
          {done ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <ImageSquare size={18} aria-hidden="true" />
          )}
        </span>
        <div>
          <strong>
            {done
              ? t("statusNewMemory")
              : upload.phase === "uploading"
                ? t("statusUploading")
                : t("statusIdle")}
          </strong>
          <span>{done ? t("statusNewMemorySub") : t("statusIdleSub")}</span>
        </div>
      </m.div>
      <div className="hero-scene__legend">
        <span>{t("legendGuestPhone")}</span>
        <ArrowRight aria-hidden="true" />
        <span>{t("legendShare")}</span>
        <ArrowRight aria-hidden="true" />
        <span>{t("legendYourGallery")}</span>
      </div>
    </div>
  );
}

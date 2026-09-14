"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { m, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  ImagePlus,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { photos, sampleEvent } from "../data/marketing";
import { useUploadPreview } from "../hooks/use-upload-preview";
import { HeroThree } from "./hero-three";

export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [threeReady, setThreeReady] = useState(false);
  const inView = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotion();
  const upload = useUploadPreview(inView);
  const done = upload.phase === "success";
  return (
    <div
      ref={ref}
      className={`hero-scene${threeReady ? " hero-scene--3d" : ""}`}
      data-renderer={threeReady ? "webgl" : "fallback"}
      aria-label="Interactive preview: a guest phone shares a photo into an event gallery"
    >
      <div className="scene-orbit" aria-hidden="true" />
      <HeroThree
        progress={upload.progress}
        active={inView}
        onReady={setThreeReady}
      />
      {threeReady && (
        <span className="hero-three-label">
          LIVE 3D PREVIEW · MOVE TO EXPLORE
        </span>
      )}
      <div className="scene-gallery">
        <div className="scene-gallery-top">
          <div>
            <span className="eyebrow">THE SHARED GALLERY</span>
            <h2>{sampleEvent.name}</h2>
          </div>
          <LockKeyhole size={14} aria-hidden="true" />
        </div>
        <div className="scene-gallery-photos">
          <div className="scene-cover">
            <Image
              src={photos.couple.src}
              alt={photos.couple.alt}
              fill
              sizes="(max-width: 600px) 230px, 310px"
              priority
            />
          </div>
          <div className="scene-tile">
            <Image
              src={photos.table.src}
              alt={photos.table.alt}
              fill
              sizes="160px"
            />
          </div>
          <div className="scene-tile scene-new">
            {done ? (
              <m.div
                className="image-fill"
                initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Image
                  src={photos.celebration.src}
                  alt="The photo from the guest phone, now in the shared gallery"
                  fill
                  sizes="160px"
                />
              </m.div>
            ) : (
              <>
                <ImagePlus size={22} strokeWidth={1.3} aria-hidden="true" />
                <span>Your next memory</span>
              </>
            )}
          </div>
        </div>
        <span className="scene-caption">
          Every guest. A different perspective.
        </span>
      </div>
      <div className="scene-phone">
        <div className="phone-speaker" aria-hidden="true" />
        <div className="phone-topline">
          9:41 <span aria-hidden="true">•••</span>
        </div>
        <span className="eyebrow">YOUR GUEST’S PHONE</span>
        <div className="phone-photo">
          <Image
            src={photos.celebration.src}
            alt={photos.celebration.alt}
            fill
            sizes="(max-width: 600px) 150px, 185px"
            priority
          />
        </div>
        <div className="phone-action">
          <ImagePlus size={16} aria-hidden="true" />
          <span>One little moment.</span>
        </div>
        <Button
          className="scene-share"
          size="sm"
          disabled={upload.phase === "uploading"}
          onClick={done ? upload.reset : upload.start}
        >
          {done ? (
            <>
              <RotateCcw aria-hidden="true" /> Try again
            </>
          ) : upload.phase === "uploading" ? (
            `Sharing… ${upload.progress}%`
          ) : (
            <>
              Share a memory <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
        <span className="phone-footnote">Interactive preview</span>
      </div>
      <div className="scene-connection" aria-hidden="true">
        <ArrowRight size={25} strokeWidth={1.3} />
      </div>
      <m.div
        className="scene-status"
        initial={false}
        animate={{ scale: !reduced && done ? 1.02 : 1 }}
        role="status"
      >
        <span className="notification-icon">
          {done ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <ImagePlus size={18} aria-hidden="true" />
          )}
        </span>
        <div>
          <strong>
            {done
              ? "A new memory, together."
              : upload.phase === "uploading"
                ? "From their phone to your gallery…"
                : "Their camera roll. Your memories."}
          </strong>
          <span>
            {done
              ? "Photo added to the sample gallery."
              : "Try “Share a memory” below."}
          </span>
        </div>
      </m.div>
      <div className="scene-legend">
        <span>Guest phone</span>
        <ArrowRight aria-hidden="true" />
        <span>Share</span>
        <ArrowRight aria-hidden="true" />
        <span>Your gallery</span>
      </div>
    </div>
  );
}

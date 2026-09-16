"use client";

import { useState } from "react";
import Image from "next/image";
import { m, useReducedMotion } from "motion/react";
import { LockKey, Plus } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui";
import {
  type MarketingPhoto,
  sampleEvent,
  guestDemo,
  photos as staticPhotos,
} from "../data/marketing";

export function DemoGallery({ photos }: { photos: MarketingPhoto[] }) {
  const t = useTranslations("marketing.demoGallery");
  const tPhotos = useTranslations("marketing.photos");
  const [selected, setSelected] = useState<MarketingPhoto | null>(null);
  const reduced = useReducedMotion();

  type StaticPhotoKey = keyof typeof staticPhotos;

  function getPhotoAlt(photo: MarketingPhoto) {
    if (photo.id in staticPhotos) {
      return tPhotos(photo.id as StaticPhotoKey);
    }

    return photo.alt;
  }

  return (
    <div className="demo-gallery">
      <div className="demo-gallery__top">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h3>{sampleEvent.name}</h3>
        </div>
        <LockKey size={17} aria-hidden="true" />
      </div>
      <div className="demo-gallery__label">
        <span>{t("memories")}</span>
        <span>{t("photosCount", { count: photos.length })}</span>
      </div>
      <div className="demo-gallery__grid">
        {photos.map((photo) => {
          const alt = getPhotoAlt(photo);

          return (
            <m.button
              key={photo.id}
              className="demo-gallery__photo demo-photo"
              initial={
                guestDemo.initialPhotos.some((item) => item.id === photo.id)
                  ? false
                  : { opacity: 0, scale: reduced ? 1 : 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              aria-label={t("viewPhoto", { alt })}
              onClick={() => setSelected(photo)}
            >
              <Image
                src={photo.src}
                alt={alt}
                fill
                sizes="(max-width: 600px) 40vw, 180px"
                unoptimized={photo.src.startsWith("blob:")}
              />
              <span className="demo-gallery__expand">
                <Plus size={16} aria-hidden="true" />
              </span>
            </m.button>
          );
        })}
      </div>
      <p className="demo-gallery__caption">{t("caption")}</p>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="photo-viewer">
          <DialogTitle className="sr-only">{t("previewTitle")}</DialogTitle>
          {selected && (
            <>
              <div className="photo-viewer__image">
                <Image
                  src={selected.src}
                  alt={getPhotoAlt(selected)}
                  fill
                  sizes="90vw"
                  unoptimized={selected.src.startsWith("blob:")}
                />
              </div>
              <p className="mt-3 text-center text-sm break-words">
                {getPhotoAlt(selected)}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

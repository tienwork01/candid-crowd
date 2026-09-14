"use client";

import { useState } from "react";
import Image from "next/image";
import { m, useReducedMotion } from "motion/react";
import { LockKeyhole, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { type MarketingPhoto, sampleEvent, guestDemo } from "../data/marketing";

export function DemoGallery({ photos }: { photos: MarketingPhoto[] }) {
  const [selected, setSelected] = useState<MarketingPhoto | null>(null);
  const reduced = useReducedMotion();

  return (
    <div className="demo-gallery">
      <div className="demo-gallery__top">
        <div>
          <span className="eyebrow">THE SHARED GALLERY</span>
          <h3>{sampleEvent.name}</h3>
        </div>
        <LockKeyhole size={17} aria-hidden="true" />
      </div>
      <div className="demo-gallery__label">
        <span>Our memories</span>
        <span>{photos.length} photos · Demo</span>
      </div>
      <div className="demo-gallery__grid">
        {photos.map((photo) => (
          <m.button
            key={photo.id}
            className="demo-gallery__photo demo-photo"
            initial={
              guestDemo.initialPhotos.some((item) => item.id === photo.id)
                ? false
                : { opacity: 0, scale: reduced ? 1 : 0.96 }
            }
            animate={{ opacity: 1, scale: 1 }}
            aria-label={`View photo: ${photo.alt}`}
            onClick={() => setSelected(photo)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 600px) 40vw, 180px"
              unoptimized={photo.src.startsWith("blob:")}
            />
            <span className="demo-gallery__expand">
              <Plus size={16} aria-hidden="true" />
            </span>
          </m.button>
        ))}
      </div>
      <p className="demo-gallery__caption">
        A whole day, seen through their eyes.
      </p>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="photo-viewer">
          <DialogTitle className="sr-only">Photo preview</DialogTitle>
          {selected && (
            <>
              <div className="photo-viewer__image">
                <Image
                  src={selected.src}
                  alt={selected.alt}
                  fill
                  sizes="90vw"
                  unoptimized={selected.src.startsWith("blob:")}
                />
              </div>
              <p className="mt-3 text-center text-sm break-words">
                {selected.alt}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

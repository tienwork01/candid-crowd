"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { eventTypes } from "../data/marketing";

export function EventTypes() {
  const t = useTranslations("marketing.eventTypesSection");
  const tPhotos = useTranslations("marketing.photos");
  const [active, setActive] = useState<string>(eventTypes[0].id);

  const localizedTypes = eventTypes.map((item) => ({
    id: item.id,
    label: t(`items.${item.id}.label`),
    line: t(`items.${item.id}.line`),
    description: t(`items.${item.id}.description`),
  }));

  const selected =
    localizedTypes.find((item) => item.id === active) ?? localizedTypes[0];

  return (
    <section
      className="event-types section-pad"
      id="events"
      aria-labelledby="events-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 id="events-title">
              {t("titleLine1")}
              <br />
              <em>{t("titleLine2")}</em>
            </h2>
          </div>
        </div>
        <div className="event-types__layout">
          <div className="event-types__photo">
            <Image
              src="/images/wedding-sunset.webp"
              alt={tPhotos("celebration")}
              fill
              sizes="(max-width: 768px) 90vw, 580px"
            />
            <span>
              {t("photoNoteLine1")}
              <br />
              <em>{t("photoNoteLine2")}</em>
            </span>
          </div>
          <div className="event-types__options">
            <span className="eyebrow">{t("optionsEyebrow")}</span>
            <div className="event-types__buttons" aria-label={t("exploreAria")}>
              {localizedTypes.map((item) => (
                <button
                  key={item.id}
                  id={item.id}
                  aria-pressed={active === item.id}
                  aria-controls="event-description"
                  onClick={() => setActive(item.id)}
                >
                  {item.label}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div id="event-description" aria-live="polite" aria-atomic="true">
              <m.div key={selected.id} initial={false} animate={{ opacity: 1 }}>
                <h3>{selected.line}</h3>
                <p>{selected.description}</p>
              </m.div>
            </div>
            <Link href="/events/new" className="inline-action">
              {t("startDraft")} <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { eventTypes } from "../data/marketing";

export function EventTypes() {
  const [active, setActive] = useState<string>(eventTypes[0].id);
  const selected =
    eventTypes.find((item) => item.id === active) ?? eventTypes[0];
  return (
    <section
      className="event-types-section section-pad"
      id="events"
      aria-labelledby="events-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              STARTING WITH “I DO.” MADE FOR SO MUCH MORE.
            </span>
            <h2 id="events-title">
              Life gives you the occasion.
              <br />
              <em>We bring the memories together.</em>
            </h2>
          </div>
        </div>
        <div className="event-types-layout">
          <div className="event-wedding-photo">
            <Image
              src="/images/couple.jpg"
              alt="A wedding celebration with the couple surrounded by their guests"
              fill
              sizes="(max-width: 768px) 90vw, 580px"
            />
            <span>
              For the big day.
              <br />
              <em>And all the days worth keeping.</em>
            </span>
          </div>
          <div className="event-type-options">
            <span className="eyebrow">WHAT ARE YOU CELEBRATING?</span>
            <div
              className="event-type-buttons"
              aria-label="Explore event types"
            >
              {eventTypes.map((item) => (
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
            <Link href="/create" className="inline-action">
              Start your event draft{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

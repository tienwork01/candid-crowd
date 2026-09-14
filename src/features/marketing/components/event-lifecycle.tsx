import Image from "next/image";
import { ArrowRight, QrCode, Heart, Send } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

export function EventLifecycle() {
  return (
    <section
      className="lifecycle-section section-pad"
      id="event-lifecycle"
      aria-labelledby="lifecycle-title"
    >
      <div className="container">
        <div className="center-heading">
          <span className="eyebrow">IT’S MORE THAN ONE DAY</span>
          <h2 id="lifecycle-title">
            Before the first hello.
            <br />
            <em>After the last goodbye.</em>
          </h2>
          <p>A place for your memories, whenever they’re ready to be shared.</p>
        </div>
        <Reveal className="lifecycle-grid">
          <article>
            <div className="lifecycle-art before-art">
              <div className="mini-invitation">
                <span>WITH OUR FAVORITE PEOPLE</span>
                <strong>
                  Let’s make
                  <br />
                  <em>memories.</em>
                </strong>
                <QrCode size={56} strokeWidth={1.1} aria-hidden="true" />
                <small>Scan. Share. Celebrate.</small>
              </div>
              <span className="placement-tag">
                Invitations · Tables · Welcome signs
              </span>
            </div>
            <span className="eyebrow">01 — BEFORE</span>
            <h3>Place the QR anywhere.</h3>
            <p>
              On the invitation, your event website, a welcome sign, or every
              table. Make it easy to find.
            </p>
          </article>
          <article>
            <div className="lifecycle-art during-art">
              <div className="live-wall-label">
                <span className="status-dot" /> LIVE WALL CONCEPT
              </div>
              <div className="mini-wall">
                {["couple", "table", "celebration", "flowers"].map((name) => (
                  <div key={name}>
                    <Image
                      src={`/images/${name}.jpg`}
                      alt="An illustrative photo in a sample event wall"
                      fill
                      sizes="160px"
                    />
                  </div>
                ))}
              </div>
              <span className="wall-notice">
                <Heart size={14} aria-hidden="true" /> A new perspective just
                arrived.
              </span>
            </div>
            <span className="eyebrow">02 — DURING</span>
            <h3>Watch your story grow.</h3>
            <p>
              Photos find their way into your shared gallery. A future Live Wall
              brings them into the room.
            </p>
          </article>
          <article>
            <div className="lifecycle-art after-art">
              <span className="reminder-day">THE MORNING AFTER</span>
              <div className="reminder-message">
                <span>One more thing…</span>
                <p>
                  Got photos from last night?
                  <br />
                  Share them here.
                </p>
                <span className="reminder-link">
                  Your event link <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
              <span className="reminder-icon">
                <Send size={20} strokeWidth={1.3} aria-hidden="true" />
              </span>
            </div>
            <span className="eyebrow">03 — AFTER</span>
            <h3>The memories keep coming.</h3>
            <p>
              Share the link once more. Collect the moments your guests were too
              busy enjoying to upload.
            </p>
          </article>
        </Reveal>
        <p className="section-disclosure">
          Illustrations of the planned experience. Live Wall and reminders are
          coming later.
        </p>
      </div>
    </section>
  );
}

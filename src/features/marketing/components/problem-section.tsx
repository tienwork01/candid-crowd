import Image from "next/image";
import { ArrowDown, Aperture } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/shared";
import { photos } from "../data/marketing";

export function ProblemSection() {
  return (
    <section
      className="problem-section container section-pad"
      aria-labelledby="problem-title"
    >
      <div className="center-heading">
        <span className="eyebrow">THE MOMENTS BETWEEN THE BIG MOMENTS</span>
        <h2 id="problem-title">
          Your photographer can’t be everywhere.
          <br />
          <em>Your guests already are.</em>
        </h2>
        <p>At every table. In every hug. On every corner of the dance floor.</p>
      </div>
      <Reveal>
        <div className="problem-section__grid">
          {[
            {
              photo: photos.table,
              caption: "The table stories.",
              extra: "A place for everyone",
            },
            {
              photo: photos.couple,
              caption: "The happy faces.",
              extra: "Celebrating together",
            },
            {
              photo: photos.countryside,
              caption: "The in-between.",
              extra: "A quiet walk together",
            },
            {
              photo: photos.venue,
              caption: "The details you missed.",
              extra: "Before everyone arrives",
            },
          ].map(({ photo, caption, extra }) => (
            <figure key={photo.id}>
              <div>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 600px) 45vw, 300px"
                />
                <span>{caption}</span>
              </div>
              <figcaption>{extra}</figcaption>
            </figure>
          ))}
        </div>
        <div className="problem-section__tags">
          <span>Dance-floor videos</span>
          <span>Group selfies</span>
          <span>One more unforgettable moment</span>
        </div>
        <div className="problem-section__summary">
          <ArrowDown size={30} aria-hidden="true" />
          <span>
            <Aperture size={23} aria-hidden="true" /> All those perspectives.
            One CandidCrowd gallery.
          </span>
        </div>
      </Reveal>
    </section>
  );
}

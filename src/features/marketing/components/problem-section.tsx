import Image from "next/image";
import { ArrowDown, Aperture } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/shared";
import { photos } from "../data/marketing";

export async function ProblemSection() {
  const [tProblem, tPhotos] = await Promise.all([
    getTranslations("marketing.problem"),
    getTranslations("marketing.photos"),
  ]);

  const items = [
    {
      photo: photos.table,
      alt: tPhotos("table"),
      caption: tProblem("tableCaption"),
      extra: tProblem("tableExtra"),
    },
    {
      photo: photos.couple,
      alt: tPhotos("couple"),
      caption: tProblem("coupleCaption"),
      extra: tProblem("coupleExtra"),
    },
    {
      photo: photos.countryside,
      alt: tPhotos("countryside"),
      caption: tProblem("countrysideCaption"),
      extra: tProblem("countrysideExtra"),
    },
    {
      photo: photos.venue,
      alt: tPhotos("venue"),
      caption: tProblem("venueCaption"),
      extra: tProblem("venueExtra"),
    },
  ];

  return (
    <section
      className="problem-section container section-pad"
      aria-labelledby="problem-title"
    >
      <div className="center-heading">
        <span className="eyebrow">{tProblem("eyebrow")}</span>
        <h2 id="problem-title">
          {tProblem("titleLine1")}
          <br />
          <em>{tProblem("titleLine2")}</em>
        </h2>
        <p>{tProblem("subhead")}</p>
      </div>
      <Reveal>
        <div className="problem-section__grid">
          {items.map(({ photo, alt, caption, extra }) => (
            <figure key={photo.id}>
              <div>
                <Image
                  src={photo.src}
                  alt={alt}
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
          <span>{tProblem("tagDanceVideos")}</span>
          <span>{tProblem("tagGroupSelfies")}</span>
          <span>{tProblem("tagUnforgettable")}</span>
        </div>
        <div className="problem-section__summary">
          <ArrowDown size={30} aria-hidden="true" />
          <span>
            <Aperture size={23} aria-hidden="true" /> {tProblem("summaryText")}
          </span>
        </div>
      </Reveal>
    </section>
  );
}

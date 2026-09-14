import { ArrowUpRight, Users } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { participation, sampleEvent } from "../data/marketing";

export function ParticipationPreview() {
  const rate = Math.round(
    (participation.contributors / participation.guests) * 100,
  );

  return (
    <section
      id="why-candidcrowd"
      className="participation container section-pad"
      aria-labelledby="participation-title"
    >
      <div className="participation__copy">
        <span className="eyebrow">BUILT AROUND PARTICIPATION</span>
        <h2 id="participation-title">
          Don’t just create an album.
          <br />
          <em>Get people to contribute.</em>
        </h2>
        <p>
          A shared gallery is only the beginning. We’re designing CandidCrowd to
          help you see what gets your guests sharing.
        </p>
        <div className="participation__point">
          <span>01</span>
          <div>
            <h3>Know what brings people in.</h3>
            <p>
              See which QR placements make sharing a natural part of your event.
            </p>
          </div>
        </div>
        <div className="participation__point">
          <span>02</span>
          <div>
            <h3>Make room for every perspective.</h3>
            <p>
              Understand participation, then give guests a gentle nudge when the
              time is right.
            </p>
          </div>
        </div>
        <p className="participation__note">
          Product concept · Analytics and QR source tracking are not live yet.
        </p>
      </div>
      <Reveal className="participation-dashboard">
        <div className="participation-dashboard__heading">
          <div>
            <span className="eyebrow">YOUR EVENT, AT A GLANCE</span>
            <h3>{sampleEvent.name}</h3>
          </div>
          <span className="pill">Concept preview</span>
        </div>
        <div className="participation-dashboard__stat-head">
          <span>
            <Users size={15} aria-hidden="true" /> {participation.guests}{" "}
            expected guests
          </span>
          <span>Illustrative data</span>
        </div>
        <div className="participation-dashboard__primary">
          <div>
            <strong>{participation.contributors}</strong>
            <span>guests sharing memories</span>
          </div>
          <div
            className="participation-dashboard__ring"
            style={{
              background: `conic-gradient(var(--primary) ${rate}%, var(--sage) 0)`,
            }}
          >
            <span>
              <strong>{rate}%</strong>
              <small>participation</small>
            </span>
          </div>
        </div>
        <div className="participation-dashboard__media-stats">
          <span>
            <strong>{participation.photos}</strong> photos
          </span>
          <span>
            <strong>{participation.videos}</strong> videos
          </span>
          <span>Every perspective counts.</span>
        </div>
        <div className="participation-dashboard__source-heading">
          <h4>Where the memories begin</h4>
          <span>Contributors</span>
        </div>
        <table className="participation-dashboard__source-table">
          <caption className="sr-only">
            Illustrative contributors by QR source
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Contributors</th>
            </tr>
          </thead>
          <tbody>
            {participation.sources.map((source) => (
              <tr key={source.label}>
                <th scope="row">
                  <span>{source.label}</span>
                  <span
                    className="participation-dashboard__source-track"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width: `${(source.contributors / participation.contributors) * 100}%`,
                      }}
                    />
                  </span>
                </th>
                <td>
                  {source.contributors}{" "}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}

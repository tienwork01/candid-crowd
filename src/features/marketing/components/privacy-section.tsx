import { Check, LockKey } from "@phosphor-icons/react/dist/ssr";

const assurances = [
  "No guest account",
  "No app installation",
  "Private event gallery",
  "Original-quality files",
  "Host controls the event",
  "Modern iPhone & Android browsers",
];

export function PrivacySection() {
  return (
    <section
      id="privacy"
      className="privacy-section container section-pad"
      aria-labelledby="privacy-title"
    >
      <div className="privacy-section__intro">
        <LockKey size={30} aria-hidden="true" />
        <div>
          <span className="eyebrow">YOUR PEOPLE. YOUR MOMENTS.</span>
          <h2 id="privacy-title">
            Big memories.
            <br />
            <em>Beautifully simple.</em>
          </h2>
          <p>
            Designed to feel effortless for your guests,
            <br />
            and reassuringly yours.
          </p>
        </div>
      </div>
      <div>
        <ul className="privacy-section__list">
          {assurances.map((item) => (
            <li key={item}>
              <Check size={16} aria-hidden="true" /> {item}
            </li>
          ))}
        </ul>
        <p className="section-disclosure">
          Our product principles. Live event sharing is not available in this
          preview.
        </p>
      </div>
    </section>
  );
}

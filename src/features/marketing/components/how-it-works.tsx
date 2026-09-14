import { QrCode, Smartphone, Heart } from "lucide-react";

const steps = [
  {
    title: "Create your event",
    description: "Set up an event in under a minute.",
    detail: "A name, a date, and something to celebrate.",
    Icon: Heart,
  },
  {
    title: "Share your QR",
    description: "Place it on invitations, tables, signs or screens.",
    detail: "One simple invitation to share their perspective.",
    Icon: QrCode,
  },
  {
    title: "Everyone contributes",
    description: "Guests upload from their phones without installing anything.",
    detail: "During the fun, or when they get home.",
    Icon: Smartphone,
  },
];

export function HowItWorks() {
  return (
    <section
      className="how-section section-pad"
      id="how-it-works"
      aria-labelledby="how-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A LITTLE SETUP. A LOT OF MEMORIES.</span>
            <h2 id="how-title">
              Three simple steps.
              <br />
              <em>Then, be in the moment.</em>
            </h2>
          </div>
          <p>
            The experience we’re building,
            <br />
            from first scan to last dance.
          </p>
        </div>
        <div className="how-grid">
          {steps.map(({ title, description, detail, Icon }, index) => (
            <article className="how-step" key={title}>
              <div className="step-top">
                <span>0{index + 1}</span>
                <Icon size={29} strokeWidth={1.2} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="step-detail">{detail}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

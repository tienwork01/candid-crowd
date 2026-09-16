import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Header, Footer } from "@/features/marketing/components";
import {
  TableOfContents,
  BackToTop,
  type TocItem,
} from "@/features/legal/components";
import { siteConfig } from "@/lib/config";
import "@/features/legal/components/legal.css";

export const metadata: Metadata = {
  title: "Terms of Service | CandidCrowd",
  description:
    "Review the terms and conditions governing your use of CandidCrowd, including host responsibilities, guest uploads, storage periods, and refund policies.",
};

const termsToc: TocItem[] = [
  { id: "about", number: "1", title: "About CandidCrowd" },
  { id: "eligibility", number: "2", title: "Eligibility" },
  { id: "accounts", number: "3", title: "Accounts" },
  { id: "events-and-guests", number: "4", title: "Events and Guest Access" },
  { id: "user-content", number: "5", title: "User Content" },
  { id: "responsibility", number: "6", title: "Responsibility for Content" },
  { id: "host-responsibilities", number: "7", title: "Host Responsibilities" },
  { id: "moderation", number: "8", title: "Content Moderation" },
  { id: "storage", number: "9", title: "Storage Periods" },
  { id: "availability", number: "10", title: "Availability and Backups" },
  { id: "payments", number: "11", title: "Payments" },
  { id: "refund-policy", number: "12", title: "Refund Policy" },
  { id: "free-services", number: "13", title: "Free Services" },
  { id: "service-changes", number: "14", title: "Service Changes" },
  { id: "intellectual-property", number: "15", title: "Intellectual Property" },
  { id: "prohibited-use", number: "16", title: "Prohibited Use" },
  { id: "third-party", number: "17", title: "Third-Party Services" },
  { id: "suspension", number: "18", title: "Suspension and Termination" },
  { id: "deletion", number: "19", title: "Account Deletion" },
  { id: "disclaimer", number: "20", title: "Disclaimer" },
  { id: "liability", number: "21", title: "Limitation of Liability" },
  { id: "indemnity", number: "22", title: "Indemnity" },
  { id: "governing-law", number: "23", title: "Governing Law" },
  { id: "changes", number: "24", title: "Changes to These Terms" },
  { id: "contact", number: "25", title: "Contact" },
];

export default function TermsPage() {
  return (
    <div className="legal-page">
      <Header />

      <header className="legal-page__hero">
        <div className="legal-page__container legal-page__hero-inner">
          <div className="legal-page__badge">
            <span className="legal-page__badge-dot" aria-hidden="true" />
            <span>Official Terms</span>
          </div>
          <h1 className="legal-page__title">Terms of Service</h1>
          <div className="legal-page__meta">
            <span>Last updated: September 14, 2026</span>
            <span className="legal-page__meta-divider" aria-hidden="true" />
            <span>Hanoi, Vietnam</span>
            <span className="legal-page__meta-divider" aria-hidden="true" />
            <span>Effective immediately</span>
          </div>
          <p className="legal-page__lead">
            These Terms govern your access to and use of CandidCrowd, including
            our event galleries, photo and video upload tools, live features,
            and related services.
          </p>
        </div>
      </header>

      <div className="legal-page__container">
        <div className="legal-page__layout">
          {/* Desktop Sticky Sidebar */}
          <aside
            className="legal-page__sidebar"
            aria-label="Sidebar navigation"
          >
            <TableOfContents items={termsToc} title="Terms Contents" />
          </aside>

          {/* Main Document Content */}
          <main className="legal-page__content" id="terms-content">
            {/* Quick Summary Card */}
            <div className="legal-callout">
              <div className="legal-callout__header">
                <ShieldCheck
                  className="legal-callout__icon"
                  aria-hidden="true"
                />
                <h2 className="legal-callout__title">
                  Key Highlights for Hosts & Guests
                </h2>
              </div>
              <div className="legal-callout__body">
                <p>
                  We believe legal terms should be straightforward. Here are the
                  most critical terms that apply to your use of CandidCrowd:
                </p>
              </div>
              <div className="legal-callout__grid">
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">Ownership</span>
                  <span className="legal-callout__item-value">
                    You keep 100% of your copyright
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Guest Friction
                  </span>
                  <span className="legal-callout__item-value">
                    No account or app needed for guests
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Free Storage
                  </span>
                  <span className="legal-callout__item-value">
                    30 days after event date
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Paid Storage
                  </span>
                  <span className="legal-callout__item-value">
                    12 months after event date
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Refund Policy
                  </span>
                  <span className="legal-callout__item-value">
                    14-day window before uploads/start
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Governing Law
                  </span>
                  <span className="legal-callout__item-value">
                    Hanoi, Vietnam jurisdiction
                  </span>
                </div>
              </div>
            </div>

            {/* Introductory text */}
            <div
              className="legal-section__body"
              style={{ marginBottom: "32px" }}
            >
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access
                to and use of CandidCrowd, including our website, event
                galleries, photo and video upload tools, live event features,
                and related services (collectively, the &ldquo;Service&rdquo;).
              </p>
              <p>
                By creating an account, purchasing a plan, uploading content, or
                otherwise using CandidCrowd, you agree to these Terms.
              </p>
            </div>

            {/* Section 1 */}
            <section id="about" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">01</span>
                <h2 className="legal-section__title">About CandidCrowd</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd is an online event photo and video sharing service
                  operated from Hanoi, Vietnam.
                </p>
                <p>
                  CandidCrowd allows event hosts to create private event spaces
                  where guests can contribute photos and videos through a link
                  or QR code without being required to create an account or
                  install an application.
                </p>
                <div className="legal-contact-card">
                  <div className="legal-contact-card__name">CandidCrowd</div>
                  <div className="legal-contact-card__location">
                    Hanoi, Vietnam
                  </div>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="legal-contact-card__email"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">02</span>
                <h2 className="legal-section__title">Eligibility</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  You must be at least 18 years old, or have reached the legal
                  age of majority where you live, to create a CandidCrowd
                  account or purchase a paid plan.
                </p>
                <p>Guests may access an event without creating an account.</p>
                <p>
                  If a minor uses CandidCrowd, their parent or legal guardian is
                  responsible for ensuring that the use of the Service is lawful
                  and appropriate.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="accounts" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">03</span>
                <h2 className="legal-section__title">Accounts</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  Event hosts may need to create an account to create and manage
                  events.
                </p>
                <p>You are responsible for:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    providing accurate account information;
                  </li>
                  <li className="legal-section__item">
                    maintaining the security of your account;
                  </li>
                  <li className="legal-section__item">
                    keeping your login credentials confidential;
                  </li>
                  <li className="legal-section__item">
                    all activity performed through your account.
                  </li>
                </ul>
                <p>
                  Authentication may be provided through third-party identity
                  providers such as Google, Apple, or Clerk.
                </p>
                <p>
                  You must contact us promptly at{" "}
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="legal-section__link"
                  >
                    {siteConfig.supportEmail}
                  </a>{" "}
                  if you believe your account has been compromised.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="events-and-guests" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">04</span>
                <h2 className="legal-section__title">
                  Events and Guest Access
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  Hosts can create an event and distribute a guest link or QR
                  code.
                </p>
                <p>
                  Guests may use that link to upload photos and videos without
                  creating an account.
                </p>
                <p>Hosts are responsible for deciding:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    who receives the event link or QR code;
                  </li>
                  <li className="legal-section__item">
                    whether guests can view uploaded content;
                  </li>
                  <li className="legal-section__item">
                    whether a Live Wall is enabled;
                  </li>
                  <li className="legal-section__item">
                    whether guests may download content;
                  </li>
                  <li className="legal-section__item">
                    how the event link is distributed.
                  </li>
                </ul>
                <p>
                  An event link should be treated as private when the host has
                  configured the event as private.
                </p>
                <p>
                  CandidCrowd cannot guarantee confidentiality if a host or
                  guest intentionally shares an event link with another person.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="user-content" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">05</span>
                <h2 className="legal-section__title">User Content</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  &ldquo;User Content&rdquo; includes photos, videos, captions,
                  messages, event information, event branding, and other
                  material uploaded or submitted through CandidCrowd.
                </p>
                <p>
                  <strong>You retain ownership of your User Content.</strong>{" "}
                  CandidCrowd does not claim ownership of photos or videos
                  uploaded by users.
                </p>
                <p>
                  By uploading User Content, you grant CandidCrowd a limited,
                  non-exclusive, worldwide license to host, store, process,
                  resize, transcode, reproduce, display, and deliver the content
                  only as necessary to:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">provide the Service;</li>
                  <li className="legal-section__item">
                    display the content within the applicable event;
                  </li>
                  <li className="legal-section__item">
                    generate thumbnails or optimized media;
                  </li>
                  <li className="legal-section__item">enable downloads;</li>
                  <li className="legal-section__item">maintain security;</li>
                  <li className="legal-section__item">perform backups;</li>
                  <li className="legal-section__item">
                    provide technical support;
                  </li>
                  <li className="legal-section__item">
                    operate features requested by users.
                  </li>
                </ul>
                <p>
                  This license ends when the content is permanently deleted from
                  our systems, subject to temporary backup, fraud-prevention,
                  security, and legal retention requirements.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="responsibility" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">06</span>
                <h2 className="legal-section__title">
                  Responsibility for Uploaded Content
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  You may only upload content that you have the legal right to
                  upload and share.
                </p>
                <p>You must not upload content that:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    infringes copyright, privacy, publicity, or other legal
                    rights;
                  </li>
                  <li className="legal-section__item">is unlawful;</li>
                  <li className="legal-section__item">
                    contains malware or malicious code;
                  </li>
                  <li className="legal-section__item">
                    contains child sexual abuse or exploitation material;
                  </li>
                  <li className="legal-section__item">
                    promotes illegal activity;
                  </li>
                  <li className="legal-section__item">
                    is intended to threaten, harass, abuse, or exploit another
                    person;
                  </li>
                  <li className="legal-section__item">
                    contains content prohibited by applicable law.
                  </li>
                </ul>
                <p>
                  If a photo or video contains another person, the uploader and
                  event host are responsible for ensuring that the content is
                  collected, displayed, and shared appropriately.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="host-responsibilities" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">07</span>
                <h2 className="legal-section__title">Host Responsibilities</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  Hosts are responsible for the way they operate their event.
                </p>
                <p>
                  Where appropriate, hosts should inform guests if uploaded
                  media may:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    be visible to other guests;
                  </li>
                  <li className="legal-section__item">
                    appear on a Live Wall;
                  </li>
                  <li className="legal-section__item">
                    be downloaded by the host;
                  </li>
                  <li className="legal-section__item">
                    be displayed at the event;
                  </li>
                  <li className="legal-section__item">
                    be used outside CandidCrowd.
                  </li>
                </ul>
                <p>
                  A host does not automatically acquire copyright ownership of
                  media uploaded by guests.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="moderation" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">08</span>
                <h2 className="legal-section__title">Content Moderation</h2>
              </div>
              <div className="legal-section__body">
                <p>Hosts may moderate or remove content from their events.</p>
                <p>
                  CandidCrowd may remove, disable, or restrict access to content
                  where we reasonably believe that the content:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">violates these Terms;</li>
                  <li className="legal-section__item">
                    violates applicable law;
                  </li>
                  <li className="legal-section__item">
                    presents a security risk;
                  </li>
                  <li className="legal-section__item">
                    facilitates fraud or abuse;
                  </li>
                  <li className="legal-section__item">
                    infringes another person&apos;s rights.
                  </li>
                </ul>
                <p>
                  We may suspend or terminate accounts or events involved in
                  serious or repeated violations.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="storage" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">09</span>
                <h2 className="legal-section__title">Storage Periods</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd is not intended to be permanent archival storage.
                  Unless a plan states otherwise:
                </p>
                <h3 className="legal-section__subtitle">Free events</h3>
                <p>
                  Uploaded media is retained for up to{" "}
                  <strong>30 days after the event date</strong>.
                </p>
                <h3 className="legal-section__subtitle">Paid events</h3>
                <p>
                  Uploaded media is retained for up to{" "}
                  <strong>12 months after the event date</strong>.
                </p>
                <p>
                  Hosts should download important photos and videos before the
                  applicable storage period ends.
                </p>
                <p>
                  After an event expires, content may enter a deletion queue for
                  up to <strong>30 days</strong> before being permanently
                  removed from active storage.
                </p>
                <p>
                  Residual encrypted backup copies may remain for up to an
                  additional <strong>60 days</strong> before being overwritten
                  or permanently deleted.
                </p>
                <p>We may offer paid storage extensions in the future.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="availability" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">10</span>
                <h2 className="legal-section__title">
                  Availability and Backups
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  We take reasonable steps to operate a reliable Service but do
                  not guarantee permanent or uninterrupted storage.
                </p>
                <p>
                  Hosts are responsible for maintaining independent backups of
                  important media.
                </p>
                <p>
                  CandidCrowd should not be used as the only permanent copy of
                  irreplaceable photographs or videos.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="payments" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">11</span>
                <h2 className="legal-section__title">Payments</h2>
              </div>
              <div className="legal-section__body">
                <p>Certain features require payment.</p>
                <p>
                  Prices, features, storage duration, and applicable limits are
                  displayed before purchase.
                </p>
                <p>
                  A consumer event plan is normally purchased for a single event
                  unless otherwise stated.
                </p>
                <p>
                  Professional or business plans may be offered as recurring
                  subscriptions.
                </p>
                <p>
                  Payment processing may be handled by a third-party payment
                  provider. CandidCrowd does not directly store complete credit
                  or debit card numbers.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="refund-policy" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">12</span>
                <h2 className="legal-section__title">Refund Policy</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  For consumer event purchases, you may request a full refund
                  within <strong>14 days of purchase</strong> if:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    the scheduled event has not started; and
                  </li>
                  <li className="legal-section__item">
                    no guest photo or video has been uploaded to the paid event.
                  </li>
                </ul>
                <p>
                  Once an event has started or guest media has been uploaded,
                  the purchase is generally non-refundable.
                </p>
                <p>
                  If CandidCrowd experiences a material technical failure that
                  prevents the purchased Service from being reasonably used
                  during the event, we may provide:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">a full refund;</li>
                  <li className="legal-section__item">a partial refund; or</li>
                  <li className="legal-section__item">account credit,</li>
                </ul>
                <p>depending on the circumstances.</p>
                <p>
                  Nothing in this refund policy limits any mandatory consumer
                  rights available under applicable law.
                </p>
                <p>
                  Refund requests can be sent to:{" "}
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="legal-section__link"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section id="free-services" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">13</span>
                <h2 className="legal-section__title">Free Services</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  We may provide free plans, trials, demo events, storage
                  allowances, or promotional features. Free offerings may have
                  limits on:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">storage;</li>
                  <li className="legal-section__item">media count;</li>
                  <li className="legal-section__item">video;</li>
                  <li className="legal-section__item">retention period;</li>
                  <li className="legal-section__item">event duration;</li>
                  <li className="legal-section__item">customization.</li>
                </ul>
                <p>We may modify or discontinue free features at any time.</p>
              </div>
            </section>

            {/* Section 14 */}
            <section id="service-changes" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">14</span>
                <h2 className="legal-section__title">Service Changes</h2>
              </div>
              <div className="legal-section__body">
                <p>CandidCrowd is an evolving product.</p>
                <p>
                  We may add, modify, replace, or remove features over time.
                </p>
                <p>
                  Where a material change substantially reduces the
                  functionality of a paid service that has already been
                  purchased, we will take reasonable steps to provide notice or
                  an appropriate remedy.
                </p>
              </div>
            </section>

            {/* Section 15 */}
            <section id="intellectual-property" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">15</span>
                <h2 className="legal-section__title">Intellectual Property</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd&apos;s software, interface, branding, logos,
                  website design, documentation, and original content are owned
                  by or licensed to CandidCrowd.
                </p>
                <p>
                  These Terms do not transfer ownership of CandidCrowd
                  intellectual property to users.
                </p>
                <p>You may not:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    copy or resell the Service;
                  </li>
                  <li className="legal-section__item">
                    attempt to reverse engineer restricted portions of the
                    Service;
                  </li>
                  <li className="legal-section__item">
                    bypass technical security measures;
                  </li>
                  <li className="legal-section__item">
                    misuse CandidCrowd branding;
                  </li>
                  <li className="legal-section__item">
                    commercially reproduce our website or software without
                    permission,
                  </li>
                </ul>
                <p>
                  except where applicable law expressly permits such activity.
                </p>
              </div>
            </section>

            {/* Section 16 */}
            <section id="prohibited-use" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">16</span>
                <h2 className="legal-section__title">Prohibited Use</h2>
              </div>
              <div className="legal-section__body">
                <p>You must not:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    attempt unauthorized access to another account or event;
                  </li>
                  <li className="legal-section__item">
                    interfere with the operation of the Service;
                  </li>
                  <li className="legal-section__item">
                    bypass upload, storage, payment, or security restrictions;
                  </li>
                  <li className="legal-section__item">
                    perform automated scraping without authorization;
                  </li>
                  <li className="legal-section__item">
                    abuse upload infrastructure;
                  </li>
                  <li className="legal-section__item">
                    upload malicious files;
                  </li>
                  <li className="legal-section__item">
                    use CandidCrowd for unlawful surveillance;
                  </li>
                  <li className="legal-section__item">
                    use the Service to distribute illegal content;
                  </li>
                  <li className="legal-section__item">
                    impersonate another person;
                  </li>
                  <li className="legal-section__item">
                    use the Service in violation of applicable law.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 17 */}
            <section id="third-party" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">17</span>
                <h2 className="legal-section__title">Third-Party Services</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd relies on third-party services for parts of its
                  infrastructure. These may include providers for
                  authentication, cloud infrastructure, object storage, email
                  delivery, analytics, monitoring, and payments.
                </p>
                <p>
                  Current infrastructure may include <strong>Clerk</strong> for
                  authentication and <strong>Cloudflare</strong> for
                  infrastructure and object storage.
                </p>
                <p>
                  Third-party providers operate under their own terms and
                  privacy policies.
                </p>
              </div>
            </section>

            {/* Section 18 */}
            <section id="suspension" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">18</span>
                <h2 className="legal-section__title">
                  Account Suspension and Termination
                </h2>
              </div>
              <div className="legal-section__body">
                <p>You may stop using CandidCrowd at any time.</p>
                <p>
                  We may temporarily or permanently suspend an account or event
                  where reasonably necessary because of:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    violation of these Terms;
                  </li>
                  <li className="legal-section__item">fraud;</li>
                  <li className="legal-section__item">abuse;</li>
                  <li className="legal-section__item">security threats;</li>
                  <li className="legal-section__item">payment failure;</li>
                  <li className="legal-section__item">legal requirements;</li>
                  <li className="legal-section__item">
                    repeated infringement of third-party rights.
                  </li>
                </ul>
                <p>
                  Where reasonably possible, we will provide notice before
                  terminating a paid account unless immediate action is
                  necessary for security, legal, or serious abuse reasons.
                </p>
              </div>
            </section>

            {/* Section 19 */}
            <section id="deletion" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">19</span>
                <h2 className="legal-section__title">Account Deletion</h2>
              </div>
              <div className="legal-section__body">
                <p>Hosts may request account deletion.</p>
                <p>
                  When an account is deleted, associated events and media may
                  also become unavailable unless the host transfers ownership or
                  downloads them first.
                </p>
                <p>
                  Account data normally enters a deletion process within{" "}
                  <strong>30 days</strong> of a valid deletion request.
                </p>
                <p>
                  Certain records may be retained longer where necessary for
                  security, fraud prevention, dispute resolution, accounting,
                  taxation, or legal obligations.
                </p>
              </div>
            </section>

            {/* Section 20 */}
            <section id="disclaimer" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">20</span>
                <h2 className="legal-section__title">Disclaimer</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd is provided on an &ldquo;as available&rdquo;
                  basis.
                </p>
                <p>
                  We work to make the Service reliable, secure, and accessible,
                  but we cannot guarantee:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    uninterrupted availability;
                  </li>
                  <li className="legal-section__item">error-free operation;</li>
                  <li className="legal-section__item">permanent storage;</li>
                  <li className="legal-section__item">
                    compatibility with every device or network;
                  </li>
                  <li className="legal-section__item">
                    successful upload where the user&apos;s internet connection
                    fails.
                  </li>
                </ul>
                <p>
                  Nothing in these Terms excludes warranties or consumer rights
                  that cannot legally be excluded.
                </p>
              </div>
            </section>

            {/* Section 21 */}
            <section id="liability" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">21</span>
                <h2 className="legal-section__title">
                  Limitation of Liability
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  To the maximum extent permitted by applicable law, CandidCrowd
                  will not be responsible for indirect, incidental, special,
                  punitive, or consequential damages arising from use of the
                  Service.
                </p>
                <p>
                  For claims relating to a paid CandidCrowd service, our total
                  aggregate liability will not exceed the greater of:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    the amount you paid to CandidCrowd during the 12 months
                    before the event giving rise to the claim; or
                  </li>
                  <li className="legal-section__item">USD 100.</li>
                </ul>
                <p>
                  This limitation does not apply where applicable law prohibits
                  such a limitation.
                </p>
              </div>
            </section>

            {/* Section 22 */}
            <section id="indemnity" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">22</span>
                <h2 className="legal-section__title">Indemnity</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  To the extent permitted by applicable law, you agree to be
                  responsible for losses, claims, or costs resulting from:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    content you unlawfully upload;
                  </li>
                  <li className="legal-section__item">
                    infringement of another person&apos;s rights;
                  </li>
                  <li className="legal-section__item">
                    unlawful use of CandidCrowd;
                  </li>
                  <li className="legal-section__item">
                    material violation of these Terms.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 23 */}
            <section id="governing-law" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">23</span>
                <h2 className="legal-section__title">Governing Law</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  These Terms are governed by the laws of the{" "}
                  <strong>Socialist Republic of Vietnam</strong>.
                </p>
                <p>
                  Disputes that cannot be resolved informally will be subject to
                  the competent courts of Vietnam, unless mandatory consumer
                  protection law gives you the right to bring a claim in another
                  jurisdiction.
                </p>
                <p>
                  Mandatory consumer rights in your country of residence remain
                  unaffected.
                </p>
              </div>
            </section>

            {/* Section 24 */}
            <section id="changes" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">24</span>
                <h2 className="legal-section__title">Changes to These Terms</h2>
              </div>
              <div className="legal-section__body">
                <p>We may update these Terms as CandidCrowd develops.</p>
                <p>
                  For material changes, we will provide reasonable notice where
                  appropriate.
                </p>
                <p>
                  Continued use of the Service after an updated Terms version
                  becomes effective constitutes acceptance of the updated Terms
                  where permitted by law.
                </p>
              </div>
            </section>

            {/* Section 25 */}
            <section id="contact" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">25</span>
                <h2 className="legal-section__title">Contact</h2>
              </div>
              <div className="legal-section__body">
                <p>Questions about these Terms can be sent to:</p>
                <div className="legal-contact-card">
                  <div className="legal-contact-card__name">
                    CandidCrowd Support
                  </div>
                  <div className="legal-contact-card__location">
                    Hanoi, Vietnam
                  </div>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="legal-contact-card__email"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </div>
              </div>
            </section>

            {/* Footer Navigation within Document */}
            <div className="legal-page__footer-nav">
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <Link href="/privacy" className="legal-section__link">
                  View Privacy Policy &rarr;
                </Link>
              </div>
              <BackToTop />
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

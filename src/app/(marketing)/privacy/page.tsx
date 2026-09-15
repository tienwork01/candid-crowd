import type { Metadata } from "next";
import Link from "next/link";
import {
  Lock,
  EyeOff,
  ShieldCheck,
  Mail,
  Database,
  Server,
} from "lucide-react";
import { Header } from "@/features/marketing/components/header";
import { Footer } from "@/features/marketing/components/footer";
import {
  TableOfContents,
  BackToTop,
  type TocItem,
} from "@/features/legal/components/table-of-contents";
import { siteConfig } from "@/lib/config";
import "@/features/legal/components/legal.css";

export const metadata: Metadata = {
  title: "Privacy Policy | CandidCrowd",
  description:
    "Learn how CandidCrowd protects your privacy, handles event photos and videos, and guarantees no biometric facial scanning by default.",
};

const privacyToc: TocItem[] = [
  { id: "who-we-are", number: "1", title: "Who We Are" },
  { id: "information-collected", number: "2", title: "Information We Collect" },
  { id: "how-we-use", number: "3", title: "How We Use Information" },
  { id: "legal-bases", number: "4", title: "Legal Bases for Processing" },
  { id: "other-people", number: "5", title: "Photos of Other People" },
  {
    id: "facial-recognition",
    number: "6",
    title: "Facial Recognition & Biometrics",
  },
  { id: "how-we-share", number: "7", title: "How We Share Information" },
  { id: "hosts-and-guests", number: "8", title: "Event Hosts and Guests" },
  { id: "international", number: "9", title: "International Processing" },
  { id: "retention", number: "10", title: "Data Retention" },
  { id: "security", number: "11", title: "Security" },
  { id: "cookies", number: "12", title: "Cookies" },
  { id: "analytics", number: "13", title: "Analytics" },
  { id: "ai-processing", number: "14", title: "AI and Uploaded Media" },
  { id: "privacy-rights", number: "15", title: "Your Privacy Rights" },
  { id: "removing-media", number: "16", title: "Removing Event Media" },
  { id: "california-rights", number: "17", title: "California Privacy Rights" },
  { id: "children", number: "18", title: "Children" },
  { id: "deletion", number: "19", title: "Account and Event Deletion" },
  { id: "breaches", number: "20", title: "Data Breaches" },
  { id: "third-party-links", number: "21", title: "Third-Party Links" },
  { id: "changes", number: "22", title: "Changes to This Privacy Policy" },
  { id: "complaints", number: "23", title: "Complaints" },
  { id: "contact", number: "24", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <Header />

      <header className="legal-page__hero">
        <div className="legal-page__container legal-page__hero-inner">
          <div className="legal-page__badge">
            <span className="legal-page__badge-dot" aria-hidden="true" />
            <span>Privacy &amp; Data Trust</span>
          </div>
          <h1 className="legal-page__title">Privacy Policy</h1>
          <div className="legal-page__meta">
            <span>Last updated: September 14, 2026</span>
            <span className="legal-page__meta-divider" aria-hidden="true" />
            <span>Hanoi, Vietnam</span>
            <span className="legal-page__meta-divider" aria-hidden="true" />
            <span>GDPR &amp; CCPA compliant</span>
          </div>
          <p className="legal-page__lead">
            This Privacy Policy explains how CandidCrowd collects, uses, stores,
            shares, and protects personal information when you use CandidCrowd.
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
            <TableOfContents items={privacyToc} title="Privacy Contents" />
          </aside>

          {/* Main Document Content */}
          <main className="legal-page__content" id="privacy-content">
            {/* Quick Summary Card */}
            <div className="legal-callout">
              <div className="legal-callout__header">
                <Lock className="legal-callout__icon" aria-hidden="true" />
                <h2 className="legal-callout__title">
                  Key Privacy Commitments
                </h2>
              </div>
              <div className="legal-callout__body">
                <p>
                  At CandidCrowd, personal event memories deserve respectful,
                  private, and controlled handling:
                </p>
              </div>
              <div className="legal-callout__grid">
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">Biometrics</span>
                  <span className="legal-callout__item-value">
                    Zero facial recognition profiling
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Guest Privacy
                  </span>
                  <span className="legal-callout__item-value">
                    No account or email required to upload
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Storage Security
                  </span>
                  <span className="legal-callout__item-value">
                    Cloudflare R2 private bucket storage
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">AI Training</span>
                  <span className="legal-callout__item-value">
                    We never train public AI on your photos
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">Data Sales</span>
                  <span className="legal-callout__item-value">
                    We do not sell personal data for money
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    Privacy Contact
                  </span>
                  <span className="legal-callout__item-value">
                    {siteConfig.privacyEmail}
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
                This Privacy Policy explains how CandidCrowd collects, uses,
                stores, shares, and protects personal information when you use
                CandidCrowd.
              </p>
            </div>

            {/* Section 1 */}
            <section id="who-we-are" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">01</span>
                <h2 className="legal-section__title">Who We Are</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd is an online event photo and video sharing service
                  operated from Hanoi, Vietnam.
                </p>
                <p>For privacy-related questions or requests, contact:</p>
                <div className="legal-contact-card">
                  <div className="legal-contact-card__name">
                    CandidCrowd Privacy Team
                  </div>
                  <div className="legal-contact-card__location">
                    Hanoi, Vietnam
                  </div>
                  <a
                    href={`mailto:${siteConfig.privacyEmail}`}
                    className="legal-contact-card__email"
                  >
                    {siteConfig.privacyEmail}
                  </a>
                </div>
                <p style={{ marginTop: "16px" }}>
                  Where applicable, CandidCrowd acts as the controller of
                  personal information collected directly through the Service.
                </p>
                <p>
                  In some situations, an event host determines how guest content
                  is collected or subsequently used.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="information-collected" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">02</span>
                <h2 className="legal-section__title">Information We Collect</h2>
              </div>
              <div className="legal-section__body">
                <h3 className="legal-section__subtitle">
                  Host account information
                </h3>
                <p>When you create a CandidCrowd account, we may collect:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">name;</li>
                  <li className="legal-section__item">email address;</li>
                  <li className="legal-section__item">profile image;</li>
                  <li className="legal-section__item">account identifiers;</li>
                  <li className="legal-section__item">
                    authentication provider;
                  </li>
                  <li className="legal-section__item">
                    account creation date;
                  </li>
                  <li className="legal-section__item">
                    login and security information.
                  </li>
                </ul>
                <p>
                  Authentication may be provided by Clerk and identity providers
                  such as Google or Apple.
                </p>

                <h3 className="legal-section__subtitle">Event information</h3>
                <p>When a host creates or manages an event, we may collect:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">event name;</li>
                  <li className="legal-section__item">event date;</li>
                  <li className="legal-section__item">event type;</li>
                  <li className="legal-section__item">expected guest count;</li>
                  <li className="legal-section__item">event settings;</li>
                  <li className="legal-section__item">event theme;</li>
                  <li className="legal-section__item">
                    QR source information;
                  </li>
                  <li className="legal-section__item">event configuration.</li>
                </ul>

                <h3 className="legal-section__subtitle">Guest information</h3>
                <p>
                  <strong>Guests do not need to create an account.</strong>
                </p>
                <p>
                  When a guest opens or contributes to an event, we may process:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    anonymous guest/session identifier;
                  </li>
                  <li className="legal-section__item">IP address;</li>
                  <li className="legal-section__item">browser type;</li>
                  <li className="legal-section__item">device type;</li>
                  <li className="legal-section__item">operating system;</li>
                  <li className="legal-section__item">
                    approximate network information;
                  </li>
                  <li className="legal-section__item">access timestamps;</li>
                  <li className="legal-section__item">upload timestamps;</li>
                  <li className="legal-section__item">
                    QR source or referral source;
                  </li>
                  <li className="legal-section__item">
                    security and abuse-prevention information.
                  </li>
                </ul>
                <p>
                  We do not require guests to provide their real name or email
                  address merely to upload event media.
                </p>

                <h3 className="legal-section__subtitle">Photos and videos</h3>
                <p>
                  We process photos and videos uploaded to events. This may
                  include:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">the media itself;</li>
                  <li className="legal-section__item">file name;</li>
                  <li className="legal-section__item">file type;</li>
                  <li className="legal-section__item">file size;</li>
                  <li className="legal-section__item">image dimensions;</li>
                  <li className="legal-section__item">video duration;</li>
                  <li className="legal-section__item">
                    technical metadata required to process and deliver the file.
                  </li>
                </ul>
                <p>
                  Uploaded files may contain metadata generated by the camera or
                  device used to create them. Where practical, CandidCrowd may
                  remove unnecessary metadata from optimized media versions.
                </p>

                <h3 className="legal-section__subtitle">Usage information</h3>
                <p>We may collect product usage information including:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">pages visited;</li>
                  <li className="legal-section__item">event opens;</li>
                  <li className="legal-section__item">QR scans;</li>
                  <li className="legal-section__item">upload attempts;</li>
                  <li className="legal-section__item">completed uploads;</li>
                  <li className="legal-section__item">failed uploads;</li>
                  <li className="legal-section__item">gallery interactions;</li>
                  <li className="legal-section__item">feature usage;</li>
                  <li className="legal-section__item">error information;</li>
                  <li className="legal-section__item">security logs.</li>
                </ul>

                <h3 className="legal-section__subtitle">Payment information</h3>
                <p>
                  If you purchase a paid plan, payment and billing information
                  may be handled by a third-party payment processor.
                </p>
                <p>
                  CandidCrowd does not intend to store complete payment card
                  numbers. We may retain:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    transaction identifier;
                  </li>
                  <li className="legal-section__item">plan purchased;</li>
                  <li className="legal-section__item">transaction amount;</li>
                  <li className="legal-section__item">transaction date;</li>
                  <li className="legal-section__item">billing status;</li>
                  <li className="legal-section__item">invoice information.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="how-we-use" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">03</span>
                <h2 className="legal-section__title">
                  How We Use Personal Information
                </h2>
              </div>
              <div className="legal-section__body">
                <p>We use information to:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    create and manage host accounts;
                  </li>
                  <li className="legal-section__item">authenticate users;</li>
                  <li className="legal-section__item">
                    create and operate events;
                  </li>
                  <li className="legal-section__item">
                    receive guest uploads;
                  </li>
                  <li className="legal-section__item">
                    store and display photos and videos;
                  </li>
                  <li className="legal-section__item">
                    generate guest links and QR codes;
                  </li>
                  <li className="legal-section__item">
                    operate event galleries;
                  </li>
                  <li className="legal-section__item">
                    provide Live Wall functionality;
                  </li>
                  <li className="legal-section__item">
                    calculate event participation metrics;
                  </li>
                  <li className="legal-section__item">
                    provide upload status and reliability features;
                  </li>
                  <li className="legal-section__item">process payments;</li>
                  <li className="legal-section__item">provide support;</li>
                  <li className="legal-section__item">
                    prevent fraud and abuse;
                  </li>
                  <li className="legal-section__item">maintain security;</li>
                  <li className="legal-section__item">diagnose errors;</li>
                  <li className="legal-section__item">
                    improve product reliability;
                  </li>
                  <li className="legal-section__item">
                    send important service communications;
                  </li>
                  <li className="legal-section__item">
                    comply with applicable law.
                  </li>
                </ul>
                <p>
                  Where permitted by law, we may also send marketing
                  communications to account holders. Marketing emails will
                  include an unsubscribe mechanism.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="legal-bases" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">04</span>
                <h2 className="legal-section__title">
                  Legal Bases for Processing
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  Where GDPR, UK GDPR, or similar privacy laws apply, we may
                  rely on the following legal bases:
                </p>
                <h3 className="legal-section__subtitle">Contract</h3>
                <p>
                  We process information where necessary to provide CandidCrowd
                  to account holders and customers.
                </p>
                <h3 className="legal-section__subtitle">
                  Legitimate interests
                </h3>
                <p>
                  We may process limited information where reasonably necessary
                  for securing the Service, preventing fraud, preventing abuse,
                  diagnosing technical failures, improving reliability, and
                  understanding aggregate product usage.
                </p>
                <h3 className="legal-section__subtitle">Consent</h3>
                <p>
                  We rely on consent when required, including for optional
                  marketing, optional analytics cookies, future biometric
                  features, or other processing where applicable law requires
                  consent.
                </p>
                <h3 className="legal-section__subtitle">Legal obligations</h3>
                <p>
                  We may process or retain information where required by law.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="other-people" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">05</span>
                <h2 className="legal-section__title">
                  Photos and Videos of Other People
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  Event media frequently contains people other than the person
                  uploading it.
                </p>
                <p>
                  Hosts and uploaders are responsible for ensuring that their
                  collection and use of event media is lawful and appropriate.
                </p>
                <p>
                  If you appear in content stored on CandidCrowd and believe
                  that the content violates your privacy or other rights,
                  contact:
                </p>
                <p>
                  <a
                    href={`mailto:${siteConfig.privacyEmail}`}
                    className="legal-section__link"
                  >
                    {siteConfig.privacyEmail}
                  </a>
                </p>
                <p>
                  Please provide enough information for us to locate the
                  relevant event or media.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="facial-recognition" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">06</span>
                <h2 className="legal-section__title">
                  Facial Recognition and Biometric Data
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  <strong>
                    CandidCrowd does not currently use facial recognition to
                    identify guests.
                  </strong>
                </p>
                <p>
                  CandidCrowd does not intentionally create biometric identity
                  profiles from event photos as part of the current product.
                </p>
                <p>
                  If facial-search or biometric functionality is introduced in
                  the future, we will update this Privacy Policy and implement
                  additional notices, controls, and consent mechanisms where
                  required.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="how-we-share" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">07</span>
                <h2 className="legal-section__title">
                  How We Share Information
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  <strong>
                    CandidCrowd does not sell personal information for money.
                  </strong>
                </p>
                <p>
                  We may share information with service providers necessary to
                  operate the Service, including providers for authentication,
                  infrastructure, cloud storage, media processing, email
                  delivery, error monitoring, analytics, payment processing, and
                  customer support.
                </p>
                <p>Current infrastructure may include:</p>
                <h3 className="legal-section__subtitle">Clerk</h3>
                <p>Used for host authentication and account management.</p>
                <h3 className="legal-section__subtitle">Cloudflare</h3>
                <p>
                  Used for infrastructure, security, content delivery, and
                  Cloudflare R2 object storage.
                </p>
                <h3 className="legal-section__subtitle">Google and Apple</h3>
                <p>Used when users choose Google or Apple authentication.</p>
                <p>
                  Service providers receive only the information reasonably
                  necessary for the applicable service.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="hosts-and-guests" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">08</span>
                <h2 className="legal-section__title">Event Hosts and Guests</h2>
              </div>
              <div className="legal-section__body">
                <p>Depending on an event&apos;s settings:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    the host may view uploaded media;
                  </li>
                  <li className="legal-section__item">
                    the host may download uploaded media;
                  </li>
                  <li className="legal-section__item">
                    the host may see contribution statistics;
                  </li>
                  <li className="legal-section__item">
                    other invited guests may view media;
                  </li>
                  <li className="legal-section__item">
                    uploaded media may appear on a Live Wall.
                  </li>
                </ul>
                <p>
                  CandidCrowd does not make private event media publicly
                  searchable by default.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="international" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">09</span>
                <h2 className="legal-section__title">
                  International Processing
                </h2>
              </div>
              <div className="legal-section__body">
                <p>CandidCrowd serves users internationally.</p>
                <p>
                  Some of our service providers may process information outside
                  Vietnam or outside the country in which a user lives.
                </p>
                <p>
                  Where required by applicable privacy law, appropriate
                  safeguards will be used for international transfers.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="retention" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">10</span>
                <h2 className="legal-section__title">Data Retention</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  We do not keep personal information longer than reasonably
                  necessary.
                </p>
                <h3 className="legal-section__subtitle">Free event media</h3>
                <p>
                  Media associated with free events is normally retained for up
                  to <strong>30 days after the event date</strong>.
                </p>
                <h3 className="legal-section__subtitle">Paid event media</h3>
                <p>
                  Media associated with paid consumer events is normally
                  retained for up to{" "}
                  <strong>12 months after the event date</strong>.
                </p>
                <h3 className="legal-section__subtitle">
                  Deleted or expired events
                </h3>
                <p>
                  When an event is deleted or expires, active media may remain
                  in a deletion queue for up to <strong>30 days</strong>.
                </p>
                <p>
                  Encrypted backup copies may remain for up to an additional{" "}
                  <strong>60 days</strong> before being overwritten or
                  permanently deleted.
                </p>
                <h3 className="legal-section__subtitle">Account information</h3>
                <p>
                  Account information is normally retained while the account
                  remains active. Following a valid account deletion request,
                  account data normally enters a deletion process within{" "}
                  <strong>30 days</strong>.
                </p>
                <h3 className="legal-section__subtitle">Security logs</h3>
                <p>
                  Security, fraud-prevention, authentication, and
                  abuse-prevention logs may be retained for up to{" "}
                  <strong>24 months</strong>.
                </p>
                <h3 className="legal-section__subtitle">
                  Support communications
                </h3>
                <p>
                  Customer support communications may be retained for up to{" "}
                  <strong>3 years</strong> after the issue is resolved where
                  reasonably necessary for support history or dispute
                  resolution.
                </p>
                <h3 className="legal-section__subtitle">
                  Transaction and accounting records
                </h3>
                <p>
                  Transaction, invoice, tax, and accounting records may be
                  retained for up to <strong>10 years</strong> where required
                  for accounting, taxation, audit, or legal obligations.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="security" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">11</span>
                <h2 className="legal-section__title">Security</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  We use technical and organizational measures intended to
                  protect personal information. Measures may include:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">HTTPS encryption;</li>
                  <li className="legal-section__item">
                    private object storage;
                  </li>
                  <li className="legal-section__item">access controls;</li>
                  <li className="legal-section__item">authentication;</li>
                  <li className="legal-section__item">
                    short-lived signed media upload URLs;
                  </li>
                  <li className="legal-section__item">
                    secure session management;
                  </li>
                  <li className="legal-section__item">logging;</li>
                  <li className="legal-section__item">rate limiting;</li>
                  <li className="legal-section__item">abuse prevention;</li>
                  <li className="legal-section__item">
                    restricted administrative access.
                  </li>
                </ul>
                <p>
                  Event media stored using Cloudflare R2 is kept in private
                  storage unless specific delivery access is granted.
                </p>
                <p>No online service can guarantee absolute security.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="cookies" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">12</span>
                <h2 className="legal-section__title">Cookies</h2>
              </div>
              <div className="legal-section__body">
                <p>CandidCrowd may use cookies and similar technologies.</p>
                <h3 className="legal-section__subtitle">Essential cookies</h3>
                <p>
                  Essential cookies may be used for authentication, session
                  management, fraud prevention, security, and core product
                  functionality. These are necessary for the Service to operate.
                </p>
                <h3 className="legal-section__subtitle">Optional cookies</h3>
                <p>
                  CandidCrowd may later use optional analytics or marketing
                  tools. Where applicable law requires consent, optional cookies
                  will not be activated until the user has provided the required
                  consent. Users will be able to change applicable cookie
                  preferences.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section id="analytics" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">13</span>
                <h2 className="legal-section__title">Analytics</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd may collect privacy-conscious product analytics to
                  understand page usage, event creation, upload success,
                  conversion funnels, and technical failures.
                </p>
                <p>
                  <strong>
                    We will not intentionally use event photos themselves for
                    advertising profiling.
                  </strong>
                </p>
                <p>
                  If third-party advertising or behavioral analytics tools are
                  introduced, this Privacy Policy and relevant consent controls
                  will be updated.
                </p>
              </div>
            </section>

            {/* Section 14 */}
            <section id="ai-processing" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">14</span>
                <h2 className="legal-section__title">AI and Uploaded Media</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd may introduce optional automated features such as:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">duplicate detection;</li>
                  <li className="legal-section__item">blur detection;</li>
                  <li className="legal-section__item">
                    image quality ranking;
                  </li>
                  <li className="legal-section__item">event categorization;</li>
                  <li className="legal-section__item">highlight selection.</li>
                </ul>
                <p>
                  Where these features process event media, the processing will
                  be limited to providing requested CandidCrowd functionality.
                </p>
                <p>
                  <strong>
                    CandidCrowd does not currently use customer event photos to
                    train a general-purpose public AI model.
                  </strong>
                </p>
                <p>
                  If this practice changes, we will provide appropriate notice
                  before doing so.
                </p>
              </div>
            </section>

            {/* Section 15 */}
            <section id="privacy-rights" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">15</span>
                <h2 className="legal-section__title">Your Privacy Rights</h2>
              </div>
              <div className="legal-section__body">
                <p>Depending on where you live, you may have rights to:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    access personal information;
                  </li>
                  <li className="legal-section__item">
                    obtain information about processing;
                  </li>
                  <li className="legal-section__item">
                    correct inaccurate information;
                  </li>
                  <li className="legal-section__item">request deletion;</li>
                  <li className="legal-section__item">
                    restrict certain processing;
                  </li>
                  <li className="legal-section__item">
                    object to certain processing;
                  </li>
                  <li className="legal-section__item">
                    request data portability;
                  </li>
                  <li className="legal-section__item">withdraw consent;</li>
                  <li className="legal-section__item">opt out of marketing.</li>
                </ul>
                <p>
                  To exercise a privacy right, contact:{" "}
                  <a
                    href={`mailto:${siteConfig.privacyEmail}`}
                    className="legal-section__link"
                  >
                    {siteConfig.privacyEmail}
                  </a>
                </p>
                <p>
                  We may need to verify your identity before completing a
                  request. We aim to respond within the timeframe required by
                  applicable law.
                </p>
              </div>
            </section>

            {/* Section 16 */}
            <section id="removing-media" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">16</span>
                <h2 className="legal-section__title">Removing Event Media</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  If you uploaded media as a guest and want it removed, you may:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">
                    use an available guest deletion function;
                  </li>
                  <li className="legal-section__item">
                    contact the event host; or
                  </li>
                  <li className="legal-section__item">
                    contact{" "}
                    <a
                      href={`mailto:${siteConfig.privacyEmail}`}
                      className="legal-section__link"
                    >
                      {siteConfig.privacyEmail}
                    </a>
                    .
                  </li>
                </ul>
                <p>
                  If you appear in media uploaded by someone else and believe
                  that it should be removed, contact{" "}
                  <a
                    href={`mailto:${siteConfig.privacyEmail}`}
                    className="legal-section__link"
                  >
                    {siteConfig.privacyEmail}
                  </a>
                  . We may request information necessary to identify the
                  relevant event and content.
                </p>
              </div>
            </section>

            {/* Section 17 */}
            <section id="california-rights" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">17</span>
                <h2 className="legal-section__title">
                  California Privacy Rights
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  Where applicable California privacy law applies, eligible
                  users may have rights including:
                </p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">the right to know;</li>
                  <li className="legal-section__item">the right to access;</li>
                  <li className="legal-section__item">the right to correct;</li>
                  <li className="legal-section__item">the right to delete;</li>
                  <li className="legal-section__item">
                    the right to opt out of certain sales or sharing;
                  </li>
                  <li className="legal-section__item">
                    the right not to be discriminated against for exercising
                    privacy rights.
                  </li>
                </ul>
                <p>
                  CandidCrowd does not currently sell personal information for
                  money. CandidCrowd does not currently share personal
                  information for cross-context behavioral advertising.
                </p>
                <p>
                  If these practices change, this Policy and applicable controls
                  will be updated.
                </p>
              </div>
            </section>

            {/* Section 18 */}
            <section id="children" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">18</span>
                <h2 className="legal-section__title">Children</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd is not designed as a service directed specifically
                  to children.
                </p>
                <p>
                  Account holders must be at least 18 years old or the age of
                  legal majority where they live.
                </p>
                <p>
                  Photos and videos uploaded to events may contain children
                  because children may attend real-world events. Hosts and
                  uploaders are responsible for ensuring that content involving
                  minors is collected and shared appropriately.
                </p>
              </div>
            </section>

            {/* Section 19 */}
            <section id="deletion" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">19</span>
                <h2 className="legal-section__title">
                  Account and Event Deletion
                </h2>
              </div>
              <div className="legal-section__body">
                <p>Hosts may request deletion of:</p>
                <ul className="legal-section__list">
                  <li className="legal-section__item">their account;</li>
                  <li className="legal-section__item">individual events;</li>
                  <li className="legal-section__item">
                    associated event media.
                  </li>
                </ul>
                <p>
                  Deleting an event may permanently remove guest media
                  associated with that event after the deletion period. Before
                  deleting an event, hosts should download any media they wish
                  to keep.
                </p>
                <p>
                  Certain limited records may remain where necessary for fraud
                  prevention, security, dispute resolution, accounting,
                  taxation, or compliance with law.
                </p>
              </div>
            </section>

            {/* Section 20 */}
            <section id="breaches" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">20</span>
                <h2 className="legal-section__title">Data Breaches</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  If we become aware of a personal-data breach, we will
                  investigate and take reasonable steps to contain and remediate
                  the issue.
                </p>
                <p>
                  Where applicable law requires notification to affected
                  individuals or regulatory authorities, we will provide the
                  required notification.
                </p>
              </div>
            </section>

            {/* Section 21 */}
            <section id="third-party-links" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">21</span>
                <h2 className="legal-section__title">Third-Party Links</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  CandidCrowd may contain links to external websites or
                  services. CandidCrowd is not responsible for the privacy
                  practices of external services. Their use is governed by their
                  own privacy policies.
                </p>
              </div>
            </section>

            {/* Section 22 */}
            <section id="changes" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">22</span>
                <h2 className="legal-section__title">
                  Changes to This Privacy Policy
                </h2>
              </div>
              <div className="legal-section__body">
                <p>
                  We may update this Privacy Policy as CandidCrowd develops.
                </p>
                <p>Material changes will be communicated where appropriate.</p>
                <p>The latest revision date appears at the top of this page.</p>
              </div>
            </section>

            {/* Section 23 */}
            <section id="complaints" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">23</span>
                <h2 className="legal-section__title">Complaints</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  If you have concerns about how CandidCrowd handles personal
                  information, contact:
                </p>
                <p>
                  <a
                    href={`mailto:${siteConfig.privacyEmail}`}
                    className="legal-section__link"
                  >
                    {siteConfig.privacyEmail}
                  </a>
                </p>
                <p>
                  Depending on where you live, you may also have the right to
                  submit a complaint to an applicable data protection or
                  consumer protection authority.
                </p>
              </div>
            </section>

            {/* Section 24 */}
            <section id="contact" className="legal-section">
              <div className="legal-section__header">
                <span className="legal-section__number">24</span>
                <h2 className="legal-section__title">Contact</h2>
              </div>
              <div className="legal-section__body">
                <p>
                  For privacy questions, deletion requests, data-access
                  requests, or other privacy matters:
                </p>
                <div className="legal-contact-card">
                  <div className="legal-contact-card__name">
                    CandidCrowd Privacy
                  </div>
                  <div className="legal-contact-card__location">
                    Hanoi, Vietnam
                  </div>
                  <a
                    href={`mailto:${siteConfig.privacyEmail}`}
                    className="legal-contact-card__email"
                  >
                    {siteConfig.privacyEmail}
                  </a>
                </div>
                <p style={{ marginTop: "20px" }}>
                  For general product and billing support:
                </p>
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
                <Link href="/terms" className="legal-section__link">
                  View Terms of Service &rarr;
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

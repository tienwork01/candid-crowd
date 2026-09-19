export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "CandidCrowd",
  tagline:
    process.env.NEXT_PUBLIC_APP_TAGLINE || "Shared memories for every event",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Shared memories for every event. Get the photos your guests already take.",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@candidcrowd.com",
  privacyEmail:
    process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@candidcrowd.com",
  marketingUrl:
    process.env.NEXT_PUBLIC_MARKETING_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_MARKETING_URL ||
    "http://localhost:3000",
} as const;

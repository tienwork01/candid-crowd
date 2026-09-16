export const siteConfig = {
  name: "CandidCrowd",
  description:
    "Shared memories for every event. Get the photos your guests already take.",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@candidcrowd.com",
  privacyEmail:
    process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@candidcrowd.com",
  marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL || "",
} as const;

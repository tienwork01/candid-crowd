export const navigation = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
] as const;

export type MarketingPhoto = { id: string; src: string; alt: string };
export const photos = {
  countryside: {
    id: "countryside",
    src: "/images/countryside.jpg",
    alt: "A couple holding hands while walking through the countryside",
  },
  venue: {
    id: "venue",
    src: "/images/venue.jpg",
    alt: "A garden ceremony gazebo decorated with flowers",
  },
  celebration: {
    id: "celebration",
    src: "/images/wedding-sunset.webp",
    alt: "A bride and groom smiling at each other in warm sunset light",
  },
  couple: {
    id: "couple",
    src: "/images/wedding-meadow.webp",
    alt: "A bride and groom in ivory wedding attire in a sunlit meadow",
  },
  table: {
    id: "table",
    src: "/images/table.jpg",
    alt: "A celebration table filled with flowers and glasses",
  },
  details: {
    id: "details",
    src: "/images/moment.jpg",
    alt: "Wedding rings resting on a pink bouquet",
  },
  flowers: {
    id: "flowers",
    src: "/images/flowers.jpg",
    alt: "Flowers arranged along a wedding reception table",
  },
} satisfies Record<string, MarketingPhoto>;
export const sampleEvent = {
  name: "Emma & James",
  dateLabel: "September 21 · A day to remember",
  disclosure: "Fictional demo event",
};
export const guestDemo = {
  maxPhotos: 6,
  maxFileBytes: 10 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  initialPhotos: [photos.couple, photos.table, photos.flowers],
  samplePhotos: [photos.celebration, photos.details],
};

// Illustrative product concept, NOT production analytics or social proof.
export const participation = {
  guests: 157,
  contributors: 93,
  photos: 824,
  videos: 72,
  sources: [
    { label: "Entrance QR", contributors: 21 },
    { label: "Table QR", contributors: 46 },
    { label: "Bar QR", contributors: 18 },
    { label: "Shared link", contributors: 8 },
  ],
};

type PricingPlan = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  billing: string;
  features: string[];
  featured: boolean;
  available: boolean;
  cta: string;
};

// Placeholder configuration: no commercial prices, quotas, or paid offers have been approved.
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "For trying CandidCrowd.",
    priceLabel: "Free",
    billing: "Explore the preview",
    features: [
      "Interactive guest experience",
      "Try your own photos locally",
      "Save an event draft",
    ],
    featured: false,
    available: true,
    cta: "Try it free",
  },
  {
    id: "essential",
    name: "Essential",
    description: "One celebration. Every perspective.",
    priceLabel: "Coming soon",
    billing: "Pay once per event · Price to be announced",
    features: [
      "Your private event gallery",
      "A guest link & printable QR",
      "Original-quality photo downloads",
    ],
    featured: true,
    available: false,
    cta: "Explore the demo",
  },
  {
    id: "plus",
    name: "Plus",
    description: "For the moments that need more room.",
    priceLabel: "Coming soon",
    billing: "Pay once per event · Price to be announced",
    features: [
      "Everything planned for Essential",
      "More space for your memories",
      "Video sharing & more event features",
    ],
    featured: false,
    available: false,
    cta: "Explore the demo",
  },
];

export const eventTypes = [
  {
    id: "weddings",
    label: "Weddings",
    line: "The big day. Every little moment.",
    description:
      "From happy tears to the last dance, bring every guest’s perspective into your story.",
  },
  {
    id: "birthdays",
    label: "Birthdays",
    line: "Another year. A hundred new memories.",
    description:
      "The candles, the surprises, and the people who make it your day.",
  },
  {
    id: "graduations",
    label: "Graduations",
    line: "One chapter closes. A new story begins.",
    description:
      "Keep the proud faces, flying caps, and celebrations with your favorite people.",
  },
  {
    id: "reunions",
    label: "Reunions",
    line: "Together again. Just like old times.",
    description:
      "A home for every familiar smile, shared story, and long-overdue group photo.",
  },
  {
    id: "company-events",
    label: "Company events",
    line: "Good people. Shared moments.",
    description:
      "Collect the human side of team offsites, milestones, and company celebrations.",
  },
] as const;

export const previewNotices = {
  login: {
    title: "Your host space is on its way.",
    body: "Host accounts aren’t available in this preview yet. You can try the guest experience or create an event draft on this device. No credentials are collected.",
  },
  privacy: {
    title: "Privacy · preview notice",
    body: "Photos selected in this demo stay in this browser session and are not uploaded. An event draft is stored on this device if you save one. The full privacy policy will be published before live accounts and cloud uploads launch. This notice is a placeholder, not the final policy.",
  },
  terms: {
    title: "Terms · preview notice",
    body: "This is an interactive product preview, not a live event-sharing service. Paid plans, host accounts, and cloud uploads are not available. Full terms will be published before the service launches. This notice is a placeholder, not the final terms.",
  },
} as const;

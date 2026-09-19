export const navigation = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Demo", href: "/#demo" },
  { label: "Pricing", href: "/#pricing" },
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
  slug: "8K2M",
  fullUrl: "candidcrowd.life/e/8K2M",
};

export const guestDemo = {
  maxPhotos: 6,
  maxFileBytes: 10 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  initialPhotos: [photos.couple, photos.table, photos.flowers],
  samplePhotos: [photos.celebration, photos.details],
};

export const participation = {
  guests: 120,
  contributors: 54,
  photos: 617,
  videos: 0,
  rate: 0.45,
  funnel: [
    { key: "scans", count: 154, percentage: 100 },
    { key: "visits", count: 117, percentage: 76 },
    { key: "opened", count: 73, percentage: 47 },
    { key: "contributed", count: 54, percentage: 35 },
  ],
} as const;

export const earlyAccessFeatures = [
  "oneQr",
  "noGuestApp",
  "realtimeGallery",
  "originalQuality",
] as const;

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
    id: "anniversaries",
    label: "Anniversaries",
    line: "Celebrating love. Honoring the journey.",
    description:
      "Gather every generation, toast to the years passed, and collect every heartfelt toast.",
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
    id: "parties",
    label: "Parties & Celebrations",
    line: "Good music. Great friends. Spontaneous shots.",
    description:
      "Capture the laughter, the dance moves, and all the moments in between.",
  },
  {
    id: "company-events",
    label: "Company events",
    line: "Good people. Shared moments.",
    description:
      "Collect the human side of team offsites, milestones, and company celebrations.",
  },
] as const;

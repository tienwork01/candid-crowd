export type GuestThemePresetId =
  | "editorial"
  | "minimal"
  | "romantic"
  | "botanical"
  | "film"
  | "vintage"
  | "modern"
  | "luxury";

export type GuestThemeFont = "serif" | "sans" | "classic" | "mono";

export type GuestHeroStyle = "banner" | "avatar" | "monogram";

export type GuestGalleryLayout = "masonry" | "grid";

export type GuestCameraFrame = "35mm" | "polaroid" | "minimal" | "gold";

export interface GuestThemeConfig {
  presetId: GuestThemePresetId;
  heroStyle: GuestHeroStyle;
  coverUrl: string | null;
  monogram: string;
  eventTitleOverride: string;
  primaryColor: string;
  bgColor: string;
  surfaceColor: string;
  fontHeading: GuestThemeFont;
  fontBody: GuestThemeFont;
  welcomeMessage: string;
  ctaText: string;
  photoPrompts?: string[];
  galleryLayout: GuestGalleryLayout;
  cameraFrame: GuestCameraFrame;
}

export interface GuestThemePreset {
  id: GuestThemePresetId;
  nameKey: string;
  descriptionKey: string;
  primaryColor: string;
  bgColor: string;
  surfaceColor: string;
  fontHeading: GuestThemeFont;
  fontBody: GuestThemeFont;
  heroStyle: GuestHeroStyle;
  galleryLayout: GuestGalleryLayout;
  cameraFrame: GuestCameraFrame;
  defaultCtaKey: string;
  badge: string;
  sampleCoverUrl?: string;
}

export const GUEST_THEME_PRESETS: GuestThemePreset[] = [
  {
    id: "editorial",
    nameKey: "presetEditorial",
    descriptionKey: "presetEditorialDesc",
    primaryColor: "#181e17",
    bgColor: "#fdfbf7",
    surfaceColor: "#ffffff",
    fontHeading: "serif",
    fontBody: "sans",
    heroStyle: "banner",
    galleryLayout: "masonry",
    cameraFrame: "minimal",
    defaultCtaKey: "ctaShareMemories",
    badge: "Vogue / Kinfolk",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "minimal",
    nameKey: "presetMinimal",
    descriptionKey: "presetMinimalDesc",
    primaryColor: "#0f172a",
    bgColor: "#ffffff",
    surfaceColor: "#f8fafc",
    fontHeading: "sans",
    fontBody: "sans",
    heroStyle: "monogram",
    galleryLayout: "grid",
    cameraFrame: "minimal",
    defaultCtaKey: "ctaUploadPhotos",
    badge: "Nordic Clean",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "romantic",
    nameKey: "presetRomantic",
    descriptionKey: "presetRomanticDesc",
    primaryColor: "#881337",
    bgColor: "#fff1f2",
    surfaceColor: "#ffffff",
    fontHeading: "serif",
    fontBody: "serif",
    heroStyle: "avatar",
    galleryLayout: "masonry",
    cameraFrame: "polaroid",
    defaultCtaKey: "ctaSendToCouple",
    badge: "Blush & Candlelight",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "botanical",
    nameKey: "presetBotanical",
    descriptionKey: "presetBotanicalDesc",
    primaryColor: "#2d4a3e",
    bgColor: "#f4f6f0",
    surfaceColor: "#ffffff",
    fontHeading: "serif",
    fontBody: "sans",
    heroStyle: "banner",
    galleryLayout: "masonry",
    cameraFrame: "minimal",
    defaultCtaKey: "ctaShareMoments",
    badge: "Sage & Garden",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "film",
    nameKey: "presetFilm",
    descriptionKey: "presetFilmDesc",
    primaryColor: "#c2410c",
    bgColor: "#faf6ee",
    surfaceColor: "#fffdf8",
    fontHeading: "mono",
    fontBody: "sans",
    heroStyle: "banner",
    galleryLayout: "masonry",
    cameraFrame: "35mm",
    defaultCtaKey: "ctaSnapAndShare",
    badge: "35mm Nostalgia",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "vintage",
    nameKey: "presetVintage",
    descriptionKey: "presetVintageDesc",
    primaryColor: "#3f2b1d",
    bgColor: "#f7f4ea",
    surfaceColor: "#ffffff",
    fontHeading: "classic",
    fontBody: "classic",
    heroStyle: "monogram",
    galleryLayout: "masonry",
    cameraFrame: "polaroid",
    defaultCtaKey: "ctaAddMemories",
    badge: "Heritage Parchment",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "modern",
    nameKey: "presetModern",
    descriptionKey: "presetModernDesc",
    primaryColor: "#312e81",
    bgColor: "#f8fafc",
    surfaceColor: "#ffffff",
    fontHeading: "sans",
    fontBody: "sans",
    heroStyle: "banner",
    galleryLayout: "grid",
    cameraFrame: "minimal",
    defaultCtaKey: "ctaJoinParty",
    badge: "Electric & Bold",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "luxury",
    nameKey: "presetLuxury",
    descriptionKey: "presetLuxuryDesc",
    primaryColor: "#d4af37",
    bgColor: "#09090b",
    surfaceColor: "#18181b",
    fontHeading: "serif",
    fontBody: "sans",
    heroStyle: "avatar",
    galleryLayout: "masonry",
    cameraFrame: "gold",
    defaultCtaKey: "ctaContributeMoments",
    badge: "Obsidian & Gold",
    sampleCoverUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  },
];

export const DEFAULT_GUEST_THEME_CONFIG: GuestThemeConfig = {
  presetId: "editorial",
  heroStyle: "banner",
  coverUrl: null,
  monogram: "",
  eventTitleOverride: "",
  primaryColor: "#181e17",
  bgColor: "#fdfbf7",
  surfaceColor: "#ffffff",
  fontHeading: "serif",
  fontBody: "sans",
  welcomeMessage: "",
  ctaText: "",
  photoPrompts: [],
  galleryLayout: "masonry",
  cameraFrame: "minimal",
};

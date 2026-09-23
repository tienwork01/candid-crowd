export type QRDotType =
  "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";

export type QRCornerSquareType = "square" | "dot" | "extra-rounded";
export type QRCornerDotType = "square" | "dot";

export interface QRCustomizeState {
  // Colors
  fgColor: string;
  bgColor: string;

  // Dot style
  dotType: QRDotType;

  // Corner styles
  cornerSquareType: QRCornerSquareType;
  cornerDotType: QRCornerDotType;

  // Logo (required for full completion)
  logoDataUrl: string | null;
  logoSize: number; // 0.15 - 0.30

  // Frame & CTA (legacy / optional)
  showFrame?: boolean;
  frameColor?: string;
  ctaText?: string;

  // Card background
  cardBgColor: string;
}

export type PresetNameKey =
  | "colorClassic"
  | "colorMoss"
  | "colorNavy"
  | "colorForest"
  | "colorWine"
  | "colorMidnight"
  | "colorOcean"
  | "colorSunset";

export interface QRColorPreset {
  id: string;
  nameKey: PresetNameKey;
  fg: string;
  bg: string;
  cardBg: string;
}

export const QR_COLOR_PRESETS: QRColorPreset[] = [
  {
    id: "classic",
    nameKey: "colorClassic",
    fg: "#181e17",
    bg: "#ffffff",
    cardBg: "#ffffff",
  },
  {
    id: "moss",
    nameKey: "colorMoss",
    fg: "#46533a",
    bg: "#fffefa",
    cardBg: "#f8f7f2",
  },
  {
    id: "navy",
    nameKey: "colorNavy",
    fg: "#1e3a5f",
    bg: "#ffffff",
    cardBg: "#f8fafc",
  },
  {
    id: "forest",
    nameKey: "colorForest",
    fg: "#1a472a",
    bg: "#f0faf0",
    cardBg: "#f5faf5",
  },
  {
    id: "wine",
    nameKey: "colorWine",
    fg: "#722f37",
    bg: "#fff8f0",
    cardBg: "#fdf6f0",
  },
  {
    id: "midnight",
    nameKey: "colorMidnight",
    fg: "#e8e8e8",
    bg: "#1a1a2e",
    cardBg: "#1a1a2e",
  },
  {
    id: "ocean",
    nameKey: "colorOcean",
    fg: "#0077b6",
    bg: "#f0f8ff",
    cardBg: "#f0f8ff",
  },
  {
    id: "sunset",
    nameKey: "colorSunset",
    fg: "#c1440e",
    bg: "#fff5eb",
    cardBg: "#fff5eb",
  },
];

export const DEFAULT_QR_CUSTOMIZE_STATE: QRCustomizeState = {
  fgColor: "#181e17",
  bgColor: "#ffffff",
  dotType: "rounded",
  cornerSquareType: "extra-rounded",
  cornerDotType: "dot",
  logoDataUrl: null,
  logoSize: 0.25,
  showFrame: true,
  frameColor: "#dcded2",
  ctaText: "",
  cardBgColor: "#ffffff",
};

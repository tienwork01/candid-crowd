export type PrintTheme =
  "wedding" | "editorial" | "minimal" | "romantic" | "botanical" | "modern";

export type PrintSize = "5x7" | "a5" | "a4";

export type PrintFormat = "pdf" | "png";

export type PrintDimensionSpec = {
  widthMm: number;
  heightMm: number;
  widthPx: number; // 300 DPI
  heightPx: number; // 300 DPI
  aspectRatio: number;
};

export const PRINT_DIMENSIONS: Record<PrintSize, PrintDimensionSpec> = {
  "5x7": {
    widthMm: 127,
    heightMm: 177.8,
    widthPx: 1500,
    heightPx: 2100,
    aspectRatio: 127 / 177.8,
  },
  a5: {
    widthMm: 148,
    heightMm: 210,
    widthPx: 1748,
    heightPx: 2480,
    aspectRatio: 148 / 210,
  },
  a4: {
    widthMm: 210,
    heightMm: 297,
    widthPx: 2480,
    heightPx: 3508,
    aspectRatio: 210 / 297,
  },
};

export interface PrintSignConfig {
  eventName: string;
  eventDate?: string | null;
  formattedDate?: string | null;
  theme: PrintTheme;
  size: PrintSize;
  format: PrintFormat;
  qrDataUrl: string;
  shortUrl: string;
  headlineText: string;
  eyebrowText?: string;
  instructionText: string;
  reassuranceText: string;
  poweredByText: string;
  showBranding?: boolean;
}

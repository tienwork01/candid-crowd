import type { CSSProperties } from "react";
import type { GuestThemeConfig } from "./guest-theme-types";

function getRelativeLuminance(hex: string): number | null {
  const normalized = hex.replace("#", "");

  if (!/^[\da-f]{6}$/i.test(normalized)) return null;

  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  );

  const linearize = (channel: number) => {
    const value = channel / 255;

    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue)
  );
}

function getReadableForeground(hex: string): string {
  const luminance = getRelativeLuminance(hex);

  if (luminance === null) return "#ffffff";

  const whiteContrast = 1.05 / (luminance + 0.05);
  const inkContrast = (luminance + 0.05) / 0.061;

  return whiteContrast >= inkContrast ? "#ffffff" : "#181e17";
}

export function isGuestThemeDark(config: GuestThemeConfig | null | undefined) {
  const luminance = config ? getRelativeLuminance(config.bgColor) : null;

  return luminance !== null && luminance < 0.18;
}

export function getGuestThemeStyles(
  config: GuestThemeConfig | null | undefined,
): CSSProperties | undefined {
  if (!config) return undefined;

  const isDark = isGuestThemeDark(config);
  const fontHeading =
    config.fontHeading === "serif"
      ? "var(--font-serif), Georgia, serif"
      : config.fontHeading === "classic"
        ? "Georgia, 'Times New Roman', serif"
        : config.fontHeading === "mono"
          ? "ui-monospace, SFMono-Regular, monospace"
          : "var(--font-sans), sans-serif";
  const fontBody =
    config.fontBody === "serif"
      ? "var(--font-serif), Georgia, serif"
      : config.fontBody === "classic"
        ? "Georgia, 'Times New Roman', serif"
        : "var(--font-sans), sans-serif";

  return {
    ["--background" as string]: config.bgColor,
    ["--surface" as string]: config.surfaceColor,
    ["--surface-raised" as string]: config.surfaceColor,
    ["--primary" as string]: config.primaryColor,
    ["--primary-foreground" as string]: getReadableForeground(
      config.primaryColor,
    ),
    ["--on-primary" as string]: getReadableForeground(config.primaryColor),
    ["--primary-hover" as string]: `color-mix(in srgb, ${config.primaryColor} 90%, ${isDark ? "#ffffff" : "#000000"})`,
    ["--primary-active" as string]: `color-mix(in srgb, ${config.primaryColor} 80%, ${isDark ? "#ffffff" : "#000000"})`,
    ["--font-heading" as string]: fontHeading,
    ["--font-body" as string]: fontBody,
    ["--ink" as string]: isDark ? "#f4f4f5" : "#181e17",
    ["--foreground" as string]: isDark ? "#f4f4f5" : "#181e17",
    ["--muted" as string]: isDark ? "#a1a1aa" : "#606458",
    ["--subtle" as string]: isDark ? "#71717a" : "#8a8d84",
    ["--line" as string]: isDark ? "#27272a" : "rgba(24, 30, 23, 0.1)",
    ["--line-hover" as string]: isDark ? "#3f3f46" : "rgba(24, 30, 23, 0.2)",
    ["--soft" as string]: isDark
      ? "#18181b"
      : `color-mix(in srgb, ${config.surfaceColor} 78%, ${config.bgColor})`,
  };
}

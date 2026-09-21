import {
  PRINT_DIMENSIONS,
  type PrintSignConfig,
  type PrintSize,
} from "./print-template-types";
import {
  applyLuxuryPaperTexture,
  drawArchitecturalCrosshairs,
  drawArtDecoCorners,
  drawBannerRibbon,
  drawBotanicalSprig,
  drawBotanicalWatermark,
  drawBridalRoseCorners,
  drawEditorialCornerAccents,
  drawEditorialCrestDivider,
  drawLushCornerGarland,
  drawMonogramCrestWreath,
  drawOrnateQrPlaque,
  drawVintageBaroqueCorners,
  drawWeddingArchFrame,
  drawWeddingDivider,
  drawWeddingFloralArbor,
  drawWeddingHeartCrest,
  drawWeddingLoveDoves,
  drawWeddingWatermark,
  getEventMonogramInitials,
} from "./print-ornaments";

/** Helper to wrap text into multiple lines within a maximum pixel width */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];

  if (words.length === 0) return lines;

  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  lines.push(currentLine);

  return lines;
}

/** Size-specific layout profile for proportional vertical rhythm & typography */
interface SizeProfile {
  outerMargin: number;
  innerBorderInset: number;
  wreathCenterY: number;
  wreathRadius: number;
  contentTop: number;
  titleFontSize: number;
  dateSpacing: number;
  dateFontSize: number;
  dividerSpacing: number;
  supportingSpacing: number;
  supportingFontSize: number;
  sprigScale: number;
  qrPanelWidthRatio: number;
  qrTargetTopRatio: number;
  qrRadius: number;
  qrQuietZone: number;
  qrBottomSpacing: number;
  instructionFontSize: number;
  urlSpacing: number;
  urlFontSize: number;
  reassuranceSpacing: number;
  reassuranceFontSize: number;
  footerBottomOffset: number;
  footerFontSize: number;
}

const SIZE_PROFILES: Record<PrintSize, SizeProfile> = {
  // 5 × 7 inch: Compact, intimate table sign
  "5x7": {
    outerMargin: 64,
    innerBorderInset: 16,
    wreathCenterY: 175,
    wreathRadius: 48,
    contentTop: 290,
    titleFontSize: 66,
    dateSpacing: 14,
    dateFontSize: 22,
    dividerSpacing: 22,
    supportingSpacing: 20,
    supportingFontSize: 28,
    sprigScale: 1.0,
    qrPanelWidthRatio: 0.52, // 780px wide
    qrTargetTopRatio: 0.32,
    qrRadius: 24,
    qrQuietZone: 44,
    qrBottomSpacing: 46,
    instructionFontSize: 32,
    urlSpacing: 22,
    urlFontSize: 30,
    reassuranceSpacing: 18,
    reassuranceFontSize: 24,
    footerBottomOffset: 52,
    footerFontSize: 20,
  },
  // A5: Standard tabletop / guest booklet
  a5: {
    outerMargin: 78,
    innerBorderInset: 20,
    wreathCenterY: 215,
    wreathRadius: 58,
    contentTop: 355,
    titleFontSize: 76,
    dateSpacing: 16,
    dateFontSize: 24,
    dividerSpacing: 24,
    supportingSpacing: 22,
    supportingFontSize: 30,
    sprigScale: 1.15,
    qrPanelWidthRatio: 0.52, // 908px wide
    qrTargetTopRatio: 0.32,
    qrRadius: 26,
    qrQuietZone: 52,
    qrBottomSpacing: 52,
    instructionFontSize: 36,
    urlSpacing: 24,
    urlFontSize: 34,
    reassuranceSpacing: 20,
    reassuranceFontSize: 26,
    footerBottomOffset: 60,
    footerFontSize: 22,
  },
  // A4: Large easel sign — optical center rebalanced to fill vertical span intentionally
  a4: {
    outerMargin: 120,
    innerBorderInset: 28,
    wreathCenterY: 330,
    wreathRadius: 84,
    contentTop: 540,
    titleFontSize: 104, // Prominent, luxury editorial serif
    dateSpacing: 26,
    dateFontSize: 34,
    dividerSpacing: 38,
    supportingSpacing: 32,
    supportingFontSize: 40,
    sprigScale: 1.6,
    qrPanelWidthRatio: 0.54, // 1340px wide on 2480px canvas
    qrTargetTopRatio: 0.32, // Positions QR dead-center around 1750px (optical center)
    qrRadius: 36,
    qrQuietZone: 76,
    qrBottomSpacing: 72,
    instructionFontSize: 50, // High legibility from 2-3 meters
    urlSpacing: 38,
    urlFontSize: 44,
    reassuranceSpacing: 30,
    reassuranceFontSize: 36,
    footerBottomOffset: 84, // Balanced breathing room inside bottom border
    footerFontSize: 28,
  },
};

/**
 * Renders a print-ready event QR sign to an HTMLCanvasElement at 300 DPI.
 */
export async function renderPrintTemplateCanvas(
  config: PrintSignConfig,
): Promise<HTMLCanvasElement> {
  const spec = PRINT_DIMENSIONS[config.size] || PRINT_DIMENSIONS["5x7"];
  const profile = SIZE_PROFILES[config.size] || SIZE_PROFILES["5x7"];
  const canvas = document.createElement("canvas");

  canvas.width = spec.widthPx;
  canvas.height = spec.heightPx;

  const ctx = canvas.getContext("2d", { alpha: false });

  if (!ctx) {
    throw new Error("Unable to create canvas 2D context");
  }

  // Ensure web fonts are ready before rendering
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Graceful fallback
    }
  }

  const { widthPx: W, heightPx: H } = spec;
  const scale = W / 1500;
  const theme = config.theme;

  // 1. Background fill
  let bgColor = "#fbfaf6"; // Editorial warm ivory

  if (theme === "minimal" || theme === "modern") {
    bgColor = "#ffffff";
  } else if (theme === "wedding") {
    bgColor = "#fcfbf7"; // Champagne Ivory Silk
  } else if (theme === "romantic") {
    bgColor = "#fdfbf7";
  } else if (theme === "botanical") {
    bgColor = "#f7f7f0";
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // 1.5. Luxury tactile paper grain texture (removes flat digital look)
  applyLuxuryPaperTexture(ctx, W, H, scale, theme === "minimal" ? 0.02 : 0.038);

  // 1.6. Subtle layered background watermark for depth
  if (theme === "wedding") {
    // Interlocked double hearts and wedding rings watermark
    drawWeddingWatermark(
      ctx,
      W / 2,
      H * 0.44,
      scale,
      "rgba(184, 147, 88, 0.048)",
    );
  } else if (theme === "romantic") {
    drawBotanicalWatermark(
      ctx,
      W / 2,
      H * 0.44,
      scale,
      "rgba(168, 141, 125, 0.04)",
    );
  } else if (theme === "botanical") {
    drawBotanicalWatermark(
      ctx,
      W / 2,
      H * 0.44,
      scale,
      "rgba(70, 83, 58, 0.035)",
    );
  }

  // 2. Borders & Framing (Size-specific proportional margins & Theme Ornaments)
  const outerMargin = profile.outerMargin;
  const innerMargin = outerMargin + profile.innerBorderInset;

  if (theme === "wedding") {
    // 1. Signature Royal Wedding Arch Frame with double perimeter in Champagne Gold
    drawWeddingArchFrame(
      ctx,
      W,
      H,
      outerMargin,
      profile.innerBorderInset,
      scale,
      "rgba(184, 147, 88, 0.65)",
      "rgba(184, 147, 88, 0.3)",
    );

    // 2. Love Doves crowning the apex of the Wedding Arch
    drawWeddingLoveDoves(
      ctx,
      W / 2,
      outerMargin + 14 * scale,
      scale,
      "rgba(184, 147, 88, 0.95)",
      "rgba(156, 124, 73, 0.85)",
    );

    // 3. Climbing Rose Floral Arbor winding up both pillars
    drawWeddingFloralArbor(
      ctx,
      W,
      H,
      outerMargin,
      profile.innerBorderInset,
      scale,
      "rgba(184, 147, 88, 0.75)",
      "rgba(156, 124, 73, 0.65)",
    );

    // 4. Romantic Bridal Rose Bouquets with English roses and love hearts in all 4 corners
    drawBridalRoseCorners(
      ctx,
      W,
      H,
      innerMargin,
      scale,
      "rgba(184, 147, 88, 0.85)",
      "rgba(156, 124, 73, 0.65)",
    );
  } else if (theme === "editorial") {
    // Outer border
    ctx.strokeStyle = "rgba(70, 83, 58, 0.26)";
    ctx.lineWidth = 2.4 * scale;
    ctx.strokeRect(
      outerMargin,
      outerMargin,
      W - outerMargin * 2,
      H - outerMargin * 2,
    );

    // Inner fine border
    ctx.strokeStyle = "rgba(70, 83, 58, 0.16)";
    ctx.lineWidth = 1.2 * scale;
    ctx.strokeRect(
      innerMargin,
      innerMargin,
      W - innerMargin * 2,
      H - innerMargin * 2,
    );

    // Corner rosette diamond accents
    drawEditorialCornerAccents(
      ctx,
      W,
      H,
      innerMargin,
      scale,
      "rgba(70, 83, 58, 0.45)",
    );
  } else if (theme === "minimal") {
    // Thin architectural perimeter
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1.4 * scale;
    ctx.strokeRect(
      outerMargin,
      outerMargin,
      W - outerMargin * 2,
      H - outerMargin * 2,
    );

    // Swiss precision crosshairs at corner boundaries
    drawArchitecturalCrosshairs(ctx, W, H, outerMargin, scale, "#9ca3af");
  } else if (theme === "romantic") {
    // Signature Wedding Arch Frame with double perimeter and apex keystone
    drawWeddingArchFrame(
      ctx,
      W,
      H,
      outerMargin,
      profile.innerBorderInset,
      scale,
      "rgba(168, 141, 125, 0.48)",
      "rgba(168, 141, 125, 0.24)",
    );

    // Vintage baroque scrollwork flourishes in all 4 corners
    drawVintageBaroqueCorners(
      ctx,
      W,
      H,
      innerMargin,
      scale,
      "rgba(148, 120, 100, 0.65)",
    );
  } else if (theme === "botanical") {
    // Earthy sage double frame with rounded corners
    ctx.strokeStyle = "rgba(70, 83, 58, 0.34)";
    ctx.lineWidth = 2.2 * scale;
    ctx.beginPath();
    ctx.roundRect(
      outerMargin,
      outerMargin,
      W - outerMargin * 2,
      H - outerMargin * 2,
      28 * scale,
    );
    ctx.stroke();

    ctx.strokeStyle = "rgba(70, 83, 58, 0.16)";
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.roundRect(
      innerMargin,
      innerMargin,
      W - innerMargin * 2,
      H - innerMargin * 2,
      20 * scale,
    );
    ctx.stroke();

    // Lush cascading eucalyptus and olive foliage in all 4 corners
    drawLushCornerGarland(ctx, W, H, outerMargin, scale, "#46533a", "#788f6a");
  } else if (theme === "modern") {
    // Strong architectural perimeter framing
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.8 * scale;
    ctx.strokeRect(
      outerMargin,
      outerMargin,
      W - outerMargin * 2,
      H - outerMargin * 2,
    );

    // Art Deco stepped geometric corners (Great Gatsby style)
    drawArtDecoCorners(ctx, W, H, outerMargin, scale, "#111827");
  }

  // 2.5. BOTANICAL MONOGRAM CREST WREATH
  const centerX = W / 2;
  const monogram = getEventMonogramInitials(config.eventName);

  if (theme === "wedding") {
    // Royal Wedding Heart Floral Crest crowned with Entwined Diamond Wedding Rings
    drawWeddingHeartCrest(
      ctx,
      centerX,
      profile.wreathCenterY,
      profile.wreathRadius,
      scale,
      "#b89358",
      "#8c6a34",
      monogram,
    );
  } else if (theme === "botanical") {
    drawMonogramCrestWreath(
      ctx,
      centerX,
      profile.wreathCenterY,
      profile.wreathRadius,
      scale,
      "#46533a",
      "#6b8259",
      monogram,
    );
  } else if (theme === "romantic") {
    drawMonogramCrestWreath(
      ctx,
      centerX,
      profile.wreathCenterY,
      profile.wreathRadius,
      scale,
      "#8c6f56",
      "#b89b88",
      monogram,
    );
  } else if (theme === "editorial") {
    drawMonogramCrestWreath(
      ctx,
      centerX,
      profile.wreathCenterY,
      profile.wreathRadius,
      scale,
      "#46533a",
      "#6b8259",
      monogram,
    );
  }

  // 3. EVENT NAME (Hero Typography & Primary Identity Focus)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let eventTitleColor = "#181e17";
  let titleFontFamily = "Georgia, 'Times New Roman', serif";
  let titleWeight = "600"; // Refined prominence

  if (theme === "wedding") {
    eventTitleColor = "#1a1917";
    titleFontFamily = "Georgia, 'Times New Roman', serif";
    titleWeight = "600";
  } else if (theme === "minimal") {
    eventTitleColor = "#0f172a";
    titleFontFamily = "system-ui, -apple-system, sans-serif";
    titleWeight = "700";
  } else if (theme === "romantic") {
    eventTitleColor = "#2b2420";
    titleFontFamily = "Georgia, 'Times New Roman', serif";
    titleWeight = "500";
  } else if (theme === "botanical") {
    eventTitleColor = "#1a2517";
    titleFontFamily = "Georgia, 'Times New Roman', serif";
    titleWeight = "600";
  } else if (theme === "modern") {
    eventTitleColor = "#111827";
    titleFontFamily = "system-ui, -apple-system, sans-serif";
    titleWeight = "700";
  }

  // Auto-fit Event Name: compute lines and smoothly step down if long
  const maxTitleWidth = W - outerMargin * 2 - 140 * scale;
  let titleFontSize = profile.titleFontSize;

  ctx.font = `${titleWeight} ${titleFontSize}px ${titleFontFamily}`;

  let titleLines = wrapText(ctx, config.eventName, maxTitleWidth);

  // If long title, step down font size smoothly to prevent layout collapse
  if (titleLines.length > 2) {
    titleFontSize = Math.round(profile.titleFontSize * 0.8);
    ctx.font = `${titleWeight} ${titleFontSize}px ${titleFontFamily}`;
    titleLines = wrapText(ctx, config.eventName, maxTitleWidth);
  }

  if (titleLines.length > 3) {
    titleFontSize = Math.round(profile.titleFontSize * 0.68);
    ctx.font = `${titleWeight} ${titleFontSize}px ${titleFontFamily}`;
    titleLines = wrapText(ctx, config.eventName, maxTitleWidth);
  }

  const titleLineHeight = titleFontSize * 1.25;

  // Bottom of top crest / wreath to prevent any overlap
  const crestBottom =
    profile.wreathCenterY +
    (theme === "wedding"
      ? profile.wreathRadius * 0.95 + 24 * scale
      : profile.wreathRadius + 24 * scale);

  let cursorY = Math.max(profile.contentTop, crestBottom + 22 * scale);

  if (config.eyebrowText) {
    const eyebrowFontSize = Math.round(profile.dateFontSize * 0.88);
    const eyebrowText =
      theme === "wedding"
        ? `✦  ${config.eyebrowText.toUpperCase()}  ✦`
        : config.eyebrowText.toUpperCase();

    ctx.fillStyle = theme === "wedding" ? "#9c7c49" : "#606458";
    ctx.font = `600 ${eyebrowFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.letterSpacing = "2.5px";
    ctx.fillText(eyebrowText, centerX, cursorY);
    ctx.letterSpacing = "0px";

    // Advance to center of title line 0 with guaranteed breathing gap
    cursorY += eyebrowFontSize * 0.5 + 24 * scale + titleFontSize * 0.5;
  } else {
    cursorY += titleFontSize * 0.5;
  }

  ctx.fillStyle = eventTitleColor;
  ctx.font = `${titleWeight} ${titleFontSize}px ${titleFontFamily}`;

  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], centerX, cursorY);

    if (i < titleLines.length - 1) {
      cursorY += titleLineHeight;
    }
  }

  // Advance from center of last title line
  cursorY += titleFontSize * 0.5;

  // 4. EVENT DATE (Secondary)
  if (config.formattedDate) {
    const dateGap = (theme === "wedding" ? 22 : profile.dateSpacing) * scale;

    cursorY += dateGap + profile.dateFontSize * 0.5;

    let dateColor = "#606458";
    let dateFont = `400 ${profile.dateFontSize}px system-ui, sans-serif`;

    if (theme === "wedding") {
      dateColor = "#9c7c49";
      dateFont = `500 ${profile.dateFontSize}px Georgia, serif`;
    } else if (theme === "romantic") {
      dateColor = "#8c6f56";
      dateFont = `400 ${profile.dateFontSize}px Georgia, serif`;
    } else if (theme === "modern") {
      dateColor = "#374151";
      dateFont = `600 ${profile.dateFontSize * 0.9}px system-ui, sans-serif`;
    }

    ctx.fillStyle = dateColor;
    ctx.font = dateFont;

    const dateText =
      theme === "wedding"
        ? `✦ · ${config.formattedDate.toUpperCase()} · ✦`
        : config.formattedDate.toUpperCase();

    ctx.fillText(dateText, centerX, cursorY);
    cursorY += profile.dateFontSize * 0.5;
  }

  // 5. EMOTIONAL SUPPORTING LINE & DIVIDER
  const dividerGap =
    (theme === "wedding" ? 38 : profile.dividerSpacing) * scale;

  cursorY += dividerGap;

  if (theme === "wedding") {
    // Entwined diamond wedding rings & olive sprig divider
    drawWeddingDivider(ctx, centerX, cursorY, scale, "#b89358", "#9c7c49");
    cursorY += 28 * scale + profile.supportingSpacing;
  } else if (theme === "botanical") {
    drawBotanicalSprig(ctx, centerX, cursorY, profile.sprigScale, "#586c4f");
    cursorY += 30 * profile.sprigScale + profile.supportingSpacing;
  } else if (theme === "editorial") {
    drawEditorialCrestDivider(ctx, centerX, cursorY, scale, "#46533a");
    cursorY += 28 * scale + profile.supportingSpacing;
  } else if (theme === "romantic") {
    drawEditorialCrestDivider(ctx, centerX, cursorY, scale, "#8c6f56");
    cursorY += 28 * scale + profile.supportingSpacing;
  } else if (theme === "modern") {
    // Modern geometric dash divider with central square
    const divW = 70 * scale;

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.8 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX - divW, cursorY);
    ctx.lineTo(centerX - 10 * scale, cursorY);
    ctx.moveTo(centerX + 10 * scale, cursorY);
    ctx.lineTo(centerX + divW, cursorY);
    ctx.stroke();

    ctx.fillStyle = "#111827";

    const sq = 3 * scale;

    ctx.fillRect(centerX - sq, cursorY - sq, sq * 2, sq * 2);
    cursorY += 24 * scale + profile.supportingSpacing;
  } else {
    cursorY += profile.supportingSpacing;
  }

  // Supporting Text: Wrapped gracefully to 1–2 lines
  let headlineColor = "#46533a";
  let headlineFont = `italic ${profile.supportingFontSize}px Georgia, serif`;

  if (theme === "wedding") {
    headlineColor = "#4a4237";
    headlineFont = `italic ${profile.supportingFontSize}px Georgia, serif`;
  } else if (theme === "minimal") {
    headlineColor = "#374151";
    headlineFont = `400 ${profile.supportingFontSize * 0.92}px system-ui, sans-serif`;
  } else if (theme === "romantic") {
    headlineColor = "#785b46";
    headlineFont = `italic ${profile.supportingFontSize}px Georgia, serif`;
  } else if (theme === "botanical") {
    headlineColor = "#384732";
    headlineFont = `italic ${profile.supportingFontSize}px Georgia, serif`;
  } else if (theme === "modern") {
    headlineColor = "#1f2937";
    headlineFont = `500 ${profile.supportingFontSize * 0.92}px system-ui, sans-serif`;
  }

  ctx.fillStyle = headlineColor;
  ctx.font = headlineFont;

  const maxSupportingWidth = W - outerMargin * 2 - 160 * scale;
  const supportingLines = wrapText(
    ctx,
    config.headlineText,
    maxSupportingWidth,
  );
  const supportingLineHeight = profile.supportingFontSize * 1.35;

  for (let i = 0; i < supportingLines.length; i++) {
    ctx.fillText(supportingLines[i], centerX, cursorY);
    cursorY += supportingLineHeight;
  }

  // 6. QR CODE CONTAINER (Optical-Center Anchored, 100% Scan-Safe)
  const qrBoxSize = Math.round(W * profile.qrPanelWidthRatio);
  const qrBoxX = Math.round((W - qrBoxSize) / 2);

  // Position QR at optical center: minimum clearance from supporting copy, anchored proportionally
  const minClearance = 44 * scale;
  const targetTop = Math.round(H * profile.qrTargetTopRatio);
  const qrBoxY = Math.max(cursorY + minClearance, targetTop);
  const qrRadius = profile.qrRadius;

  let plaqueBorder = "#dcded2";
  let plaqueAccent = "#eef0e5";

  if (theme === "wedding") {
    plaqueBorder = "rgba(184, 147, 88, 0.85)";
    plaqueAccent = "rgba(184, 147, 88, 0.25)";
  } else if (theme === "modern") {
    plaqueBorder = "#111827";
    plaqueAccent = "#e5e7eb";
  } else if (theme === "romantic") {
    plaqueBorder = "rgba(168, 141, 125, 0.75)";
    plaqueAccent = "rgba(168, 141, 125, 0.25)";
  } else if (theme === "botanical") {
    plaqueBorder = "#46533a";
    plaqueAccent = "rgba(70, 83, 58, 0.25)";
  } else if (theme === "editorial") {
    plaqueBorder = "rgba(70, 83, 58, 0.5)";
    plaqueAccent = "rgba(70, 83, 58, 0.2)";
  }

  drawOrnateQrPlaque(
    ctx,
    qrBoxX,
    qrBoxY,
    qrBoxSize,
    qrRadius,
    scale,
    theme,
    plaqueBorder,
    plaqueAccent,
  );

  // Draw QR Image with guaranteed quiet zone padding
  const qrPadding = profile.qrQuietZone;
  const qrImg = new Image();

  qrImg.crossOrigin = "anonymous";
  qrImg.src = config.qrDataUrl;

  await new Promise<void>((resolve, reject) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = () => reject(new Error("Failed to load QR image"));
  });

  ctx.drawImage(
    qrImg,
    qrBoxX + qrPadding,
    qrBoxY + qrPadding,
    qrBoxSize - qrPadding * 2,
    qrBoxSize - qrPadding * 2,
  );

  cursorY = qrBoxY + qrBoxSize + profile.qrBottomSpacing;

  // 7. FUNCTIONAL SCAN INSTRUCTION (Prominent, Celebratory & Legible from Distance)
  if (theme === "modern") {
    // Modern high-contrast pill badge
    const badgeW = Math.min(W * 0.58, 520 * scale);
    const badgeH = profile.instructionFontSize * 1.8;
    const badgeX = centerX - badgeW / 2;
    const badgeY = cursorY - badgeH / 2;

    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9999);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${profile.instructionFontSize * 0.88}px system-ui, sans-serif`;
    ctx.fillText(config.instructionText, centerX, cursorY);
  } else if (theme === "minimal") {
    ctx.fillStyle = "#111827";
    ctx.font = `700 ${profile.instructionFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(config.instructionText, centerX, cursorY);
  } else {
    // Celebratory banner ribbon with swallowtail notched ends
    const ribbonW = Math.min(W * 0.68, 620 * scale);
    const ribbonH = profile.instructionFontSize * 1.85;

    let ribbonBg = "#ffffff";
    let textColor = "#181e17";
    let ribbonBorder = "rgba(70, 83, 58, 0.5)";

    if (theme === "wedding") {
      ribbonBg = "#ffffff";
      textColor = "#1a1917";
      ribbonBorder = "rgba(184, 147, 88, 0.85)";
    } else if (theme === "romantic") {
      ribbonBg = "#fdfbf7";
      textColor = "#241d18";
      ribbonBorder = "rgba(168, 141, 125, 0.75)";
    } else if (theme === "botanical") {
      ribbonBg = "#f7f7f0";
      textColor = "#1b2518";
      ribbonBorder = "rgba(70, 83, 58, 0.6)";
    }

    const ribbonText =
      theme === "wedding"
        ? `♡  ${config.instructionText}  ♡`
        : config.instructionText;

    drawBannerRibbon(
      ctx,
      centerX,
      cursorY,
      ribbonW,
      ribbonH,
      scale,
      ribbonText,
      ribbonBg,
      textColor,
      ribbonBorder,
    );
  }

  // 8. SHORT PUBLIC URL (Fallback for manual entry)
  cursorY +=
    profile.urlSpacing +
    profile.instructionFontSize * 0.5 +
    profile.urlFontSize * 0.5;

  ctx.fillStyle = "#2d352b";
  ctx.font = `600 ${profile.urlFontSize}px 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace`;
  ctx.letterSpacing = "0.5px";
  ctx.fillText(config.shortUrl, centerX, cursorY);

  // 9. REASSURANCE ("No app needed · No sign-up")
  cursorY +=
    profile.reassuranceSpacing +
    profile.urlFontSize * 0.5 +
    profile.reassuranceFontSize * 0.5;

  ctx.fillStyle = "#555b4e";
  ctx.font = `500 ${profile.reassuranceFontSize}px system-ui, -apple-system, sans-serif`;
  ctx.letterSpacing = "0px";
  ctx.fillText(config.reassuranceText, centerX, cursorY);

  // 10. SUBTLE BRANDING (Footer)
  if (config.showBranding !== false) {
    const footerY = H - outerMargin - profile.footerBottomOffset;

    ctx.fillStyle =
      theme === "modern"
        ? "#6b7280"
        : theme === "wedding"
          ? "#9c7c49"
          : theme === "romantic"
            ? "#9e9186"
            : "#888f82";
    ctx.font = `400 ${profile.footerFontSize}px system-ui, sans-serif`;
    ctx.letterSpacing = "0.8px";
    ctx.fillText(config.poweredByText, centerX, footerY);
  }

  return canvas;
}

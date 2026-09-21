export type CameraFrameId = "none" | "event";

export type CameraFrame = {
  id: CameraFrameId;
  labelKey: string;
};

export const cameraFrames: Record<CameraFrameId, CameraFrame> = {
  none: {
    id: "none",
    labelKey: "camera.frameNone",
  },
  event: {
    id: "event",
    labelKey: "camera.frameEvent",
  },
};

export type EventFrameOptions = {
  eventName: string;
  eventDate?: string | null;
  eventType?: string;
};

/**
 * Helper to draw a rounded rectangle path on Canvas 2D.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Composites the Editorial Photobooth Event Frame onto a Canvas 2D context.
 * Creates an elegant keepsake with an inset rounded border, photobooth L-bracket
 * corner accents, top commemorative badge, and bottom keepsake plaque.
 */
export function applyEventFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: EventFrameOptions,
) {
  const { eventName, eventDate } = options;

  if (!eventName) return;

  const minDim = Math.min(width, height);
  const margin = Math.round(minDim * 0.038);
  const frameW = width - 2 * margin;
  const frameH = height - 2 * margin;
  const cornerRadius = Math.round(minDim * 0.025);

  // 1. Subtle Inset Rounded Border
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = Math.max(1, Math.round(minDim * 0.002));
  drawRoundedRect(ctx, margin, margin, frameW, frameH, cornerRadius);
  ctx.stroke();
  ctx.restore();

  // 2. Bottom Frosted-Glass Plaque
  ctx.save();

  const titleFontSize = Math.max(16, Math.round(minDim * 0.038));
  const dateFontSize = Math.max(11, Math.round(minDim * 0.018));
  const padX = Math.round(titleFontSize * 1.4);
  const padY = Math.round(titleFontSize * 0.6);
  const plaqueRadius = Math.round(minDim * 0.025);
  const plaqueGap = Math.round(dateFontSize * 0.4);

  // Measure text widths to size the plaque dynamically
  ctx.font = `600 ${titleFontSize}px "Playfair Display", Georgia, "Times New Roman", serif`;

  const titleMetrics = ctx.measureText(eventName);
  let textBlockWidth = titleMetrics.width;
  let textBlockHeight = titleFontSize;

  if (eventDate) {
    ctx.font = `500 ${dateFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    const dateMetrics = ctx.measureText(eventDate.toUpperCase());

    textBlockWidth = Math.max(textBlockWidth, dateMetrics.width);
    textBlockHeight += plaqueGap + dateFontSize;
  }

  const plaqueW = Math.min(
    textBlockWidth + padX * 2,
    frameW - Math.round(minDim * 0.06),
  );
  const plaqueH = textBlockHeight + padY * 2;
  const plaqueX = Math.round((width - plaqueW) / 2);
  const plaqueY = margin + frameH - Math.round(minDim * 0.04) - plaqueH;

  // Frosted-glass background
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  drawRoundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, plaqueRadius);
  ctx.fill();

  // Plaque border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Event Name
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const textCenterX = plaqueX + plaqueW / 2;

  if (eventDate) {
    const titleY = plaqueY + padY + titleFontSize;

    ctx.font = `600 ${titleFontSize}px "Playfair Display", Georgia, "Times New Roman", serif`;
    ctx.fillText(eventName, textCenterX, titleY, plaqueW - padX * 2);

    // Event Date
    ctx.font = `500 ${dateFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.shadowBlur = 3;
    ctx.fillText(
      eventDate.toUpperCase(),
      textCenterX,
      titleY + plaqueGap + dateFontSize,
      plaqueW - padX * 2,
    );
  } else {
    const titleY = plaqueY + plaqueH / 2 + titleFontSize * 0.35;

    ctx.font = `600 ${titleFontSize}px "Playfair Display", Georgia, "Times New Roman", serif`;
    ctx.fillText(eventName, textCenterX, titleY, plaqueW - padX * 2);
  }

  ctx.restore();
}

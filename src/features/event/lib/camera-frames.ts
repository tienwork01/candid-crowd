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

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius * 0.42, y - radius * 0.42);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x + radius * 0.42, y + radius * 0.42);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius * 0.42, y + radius * 0.42);
  ctx.lineTo(x - radius, y);
  ctx.lineTo(x - radius * 0.42, y - radius * 0.42);
  ctx.closePath();
  ctx.stroke();
}

/**
 * Composites the Editorial Photobooth Event Frame onto a Canvas 2D context.
 * Creates an elegant keepsake with an inset rounded border, photobooth L-bracket
 * corner accents, and a small top ornament without placing text over the memory.
 */
export function applyEventFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const minDim = Math.min(width, height);
  const paper = "rgba(250, 246, 235, 0.96)";
  const gold = "#c7a96a";
  const outerInset = Math.round(minDim * 0.024);
  const innerInset = Math.round(minDim * 0.052);
  const borderRadius = Math.round(minDim * 0.018);
  const lowerMarkY = height - innerInset - Math.round(minDim * 0.015);

  ctx.save();

  // A warm paper border makes the mark readable on both bright and dark photos.
  ctx.strokeStyle = paper;
  ctx.lineWidth = Math.max(2, Math.round(minDim * 0.006));
  drawRoundedRect(
    ctx,
    outerInset,
    outerInset,
    width - outerInset * 2,
    height - outerInset * 2,
    borderRadius,
  );
  ctx.stroke();

  // A fine inner rule gives the frame the feel of an editorial print.
  ctx.strokeStyle = "rgba(45, 53, 43, 0.72)";
  ctx.lineWidth = Math.max(1, Math.round(minDim * 0.0025));
  drawRoundedRect(
    ctx,
    innerInset,
    innerInset,
    width - innerInset * 2,
    height - innerInset * 2,
    Math.round(borderRadius * 0.7),
  );
  ctx.stroke();

  const centerX = width / 2;
  // Four restrained gold corner marks make the frame recognizable at a glance.
  const markLength = Math.round(minDim * 0.035);
  const markInset = innerInset + Math.round(minDim * 0.015);

  ctx.strokeStyle = gold;
  ctx.lineWidth = Math.max(2, Math.round(minDim * 0.004));

  const corners = [
    [markInset, markInset, 1, 1],
    [width - markInset, markInset, -1, 1],
    [markInset, lowerMarkY, 1, -1],
    [width - markInset, lowerMarkY, -1, -1],
  ] as const;

  corners.forEach(([x, y, horizontal, vertical]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + markLength * vertical);
    ctx.lineTo(x, y);
    ctx.lineTo(x + markLength * horizontal, y);
    ctx.stroke();
  });

  const ornamentY = innerInset + Math.round(minDim * 0.028);
  const sparkleRadius = Math.max(4, Math.round(minDim * 0.014));
  const ornamentGap = Math.round(minDim * 0.038);

  ctx.strokeStyle = "rgba(199, 169, 106, 0.9)";
  ctx.lineWidth = Math.max(1, Math.round(minDim * 0.0022));
  ctx.beginPath();
  ctx.moveTo(centerX - ornamentGap * 1.75, ornamentY);
  ctx.lineTo(centerX - ornamentGap * 0.75, ornamentY);
  ctx.moveTo(centerX + ornamentGap * 0.75, ornamentY);
  ctx.lineTo(centerX + ornamentGap * 1.75, ornamentY);
  ctx.stroke();
  drawSparkle(ctx, centerX, ornamentY, sparkleRadius);
  drawSparkle(
    ctx,
    centerX - ornamentGap * 0.52,
    ornamentY,
    sparkleRadius * 0.48,
  );
  drawSparkle(
    ctx,
    centerX + ornamentGap * 0.52,
    ornamentY,
    sparkleRadius * 0.48,
  );

  ctx.fillStyle = gold;
  [centerX - ornamentGap * 2.05, centerX + ornamentGap * 2.05].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, ornamentY, Math.max(1.5, minDim * 0.003), 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

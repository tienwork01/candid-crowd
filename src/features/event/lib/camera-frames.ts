export type CameraFrameId = "none" | "event";
export type CameraFrameStyle = "35mm" | "polaroid" | "minimal" | "gold";

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
 * Minimalist viewfinder corner marks.
 */
function applyMinimalFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const minDim = Math.min(width, height);
  const markLength = Math.round(minDim * 0.04);
  const markInset = Math.round(minDim * 0.04);

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = Math.max(2, Math.round(minDim * 0.004));

  const corners = [
    [markInset, markInset, 1, 1],
    [width - markInset, markInset, -1, 1],
    [markInset, height - markInset, 1, -1],
    [width - markInset, height - markInset, -1, -1],
  ] as const;

  corners.forEach(([x, y, horizontal, vertical]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + markLength * vertical);
    ctx.lineTo(x, y);
    ctx.lineTo(x + markLength * horizontal, y);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Gold leaf luxury editorial frame with corner accents and sparkles.
 */
function applyGoldFrame(
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

/**
 * 35mm Analog Film Frame with sprocket holes and film labels.
 */
function apply35mmFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const stripHeight = Math.round(height * 0.065);
  const holeWidth = Math.round(stripHeight * 0.45);
  const holeHeight = Math.round(stripHeight * 0.65);
  const holeRadius = 2;
  const holeSpacing = Math.round(holeWidth * 1.8);

  ctx.save();

  // Top and bottom black film strips
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, width, stripHeight);
  ctx.fillRect(0, height - stripHeight, width, stripHeight);

  // Sprocket holes
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";

  const numHoles = Math.floor(width / holeSpacing);
  const startX = Math.round((width - numHoles * holeSpacing) / 2);

  for (let i = 0; i < numHoles; i++) {
    const x = startX + i * holeSpacing;
    const topY = Math.round((stripHeight - holeHeight) / 2);
    const botY = height - stripHeight + topY;

    drawRoundedRect(ctx, x, topY, holeWidth, holeHeight, holeRadius);
    ctx.fill();
    drawRoundedRect(ctx, x, botY, holeWidth, holeHeight, holeRadius);
    ctx.fill();
  }

  // Vintage amber film imprint
  ctx.fillStyle = "#f59e0b";
  ctx.font = `600 ${Math.max(9, Math.round(stripHeight * 0.35))}px monospace`;
  ctx.fillText("35mm FILM", 12, height - Math.round(stripHeight * 0.35));
  ctx.fillText("ISO 400", width - 70, height - Math.round(stripHeight * 0.35));

  ctx.restore();
}

/**
 * Classic Instant Polaroid Frame.
 */
function applyPolaroidFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const minDim = Math.min(width, height);
  const sideBorder = Math.round(minDim * 0.035);
  const bottomBorder = Math.round(minDim * 0.12);

  ctx.save();
  ctx.fillStyle = "#faf7f2";

  // Top, Left, Right, Bottom border fills
  ctx.fillRect(0, 0, width, sideBorder);
  ctx.fillRect(0, 0, sideBorder, height);
  ctx.fillRect(width - sideBorder, 0, sideBorder, height);
  ctx.fillRect(0, height - bottomBorder, width, bottomBorder);

  // Subtle separator line above the bottom margin
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sideBorder, height - bottomBorder);
  ctx.lineTo(width - sideBorder, height - bottomBorder);
  ctx.stroke();

  ctx.restore();
}

/**
 * Composites the selected Event Frame onto a Canvas 2D context.
 */
export function applyEventFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: CameraFrameStyle = "minimal",
) {
  switch (style) {
    case "35mm":
      apply35mmFrame(ctx, width, height);
      break;
    case "polaroid":
      applyPolaroidFrame(ctx, width, height);
      break;
    case "gold":
      applyGoldFrame(ctx, width, height);
      break;
    case "minimal":
    default:
      applyMinimalFrame(ctx, width, height);
      break;
  }
}

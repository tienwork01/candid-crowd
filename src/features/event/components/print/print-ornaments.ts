/**
 * Vector Canvas Ornaments & Decorative Motifs for Event Print Signage.
 * 100% Mathematical Canvas 2D operations for infinite 300 DPI sharpness.
 */

/**
 * Extracts a refined monogram or initial string from an event name.
 * e.g., "Emma & James" -> "E & J", "Nam & Trang" -> "N & T", "Annual Gala" -> "A · G".
 */
export function getEventMonogramInitials(name: string): string {
  const clean = name.trim();

  // Pattern: "X & Y" or "X and Y"
  const andMatch = clean.match(
    /^([A-Za-zÀ-ỹ0-9]+)\s+(?:&|and|và|\+)\s+([A-Za-zÀ-ỹ0-9]+)/i,
  );

  if (andMatch) {
    const init1 = andMatch[1].charAt(0).toUpperCase();
    const init2 = andMatch[2].charAt(0).toUpperCase();

    return `${init1} & ${init2}`;
  }

  // Two or more words: take first two initials
  const words = clean.split(/\s+/).filter((w) => w.length > 0);

  if (words.length >= 2) {
    const w1 = words[0].charAt(0).toUpperCase();
    const w2 = words[1].charAt(0).toUpperCase();

    return `${w1} · ${w2}`;
  }

  // Single word: take first initial or return classic star
  if (words.length === 1 && words[0].length >= 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return "✦";
}

/**
 * Draws an organic leaf using two smooth quadratic Bézier curves.
 */
export function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  width: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.45, -width, length, 0);
  ctx.quadraticCurveTo(length * 0.45, width, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a 5-petal floral blossom with central stamen.
 */
export function draw5PetalFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  petalColor: string,
  centerColor: string,
) {
  ctx.save();
  ctx.translate(x, y);

  const petalCount = 5;
  const petalLen = radius;
  const petalW = radius * 0.55;

  ctx.fillStyle = petalColor;

  for (let i = 0; i < petalCount; i++) {
    const angle = (i * Math.PI * 2) / petalCount - Math.PI / 2;

    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(petalW, -petalLen * 0.55, 0, -petalLen);
    ctx.quadraticCurveTo(-petalW, -petalLen * 0.55, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Center stamen
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a 4-pointed sparkle / starburst.
 */
export function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();

  const arm = size;
  const waist = size * 0.22;

  ctx.moveTo(x, y - arm);
  ctx.quadraticCurveTo(x, y, x + waist, y);
  ctx.lineTo(x + arm, y);
  ctx.quadraticCurveTo(x, y, x, y + waist);
  ctx.lineTo(x, y + arm);
  ctx.quadraticCurveTo(x, y, x - waist, y);
  ctx.lineTo(x - arm, y);
  ctx.quadraticCurveTo(x, y, x, y - waist);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * 1. MONOGRAM CREST WREATH (Vòng nguyệt quế / vòng hoa huy hiệu đỉnh đầu)
 * Circular wreath with delicate ribbon bow and event initials.
 */
export function drawMonogramCrestWreath(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  scale: number,
  color: string,
  accentColor: string,
  monogramText: string,
) {
  ctx.save();

  // Wreath arc branch (left and right)
  const drawWreathHalf = (flip: boolean) => {
    ctx.save();
    ctx.translate(centerX, centerY);

    if (flip) ctx.scale(-1, 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8 * scale;
    ctx.lineCap = "round";

    // Curved stem sweeping from bottom (π/2) up towards top (open crown at -π/2.3)
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI * 0.48, -Math.PI * 0.38, true);
    ctx.stroke();

    // Foliage leaves along wreath
    const steps = 9;

    for (let i = 1; i <= steps; i++) {
      const theta = Math.PI * 0.48 - (i / steps) * (Math.PI * 0.82);
      const lx = Math.cos(theta) * radius;
      const ly = Math.sin(theta) * radius;
      const tangentAngle = theta - Math.PI / 2;

      // Outer leaf
      drawLeaf(
        ctx,
        lx,
        ly,
        tangentAngle - 0.45,
        15 * scale,
        5.2 * scale,
        color,
      );

      // Inner leaf
      drawLeaf(ctx, lx, ly, tangentAngle + 0.4, 12 * scale, 4.2 * scale, color);

      // Seed berries on alternating nodes
      if (i % 2 === 0) {
        ctx.fillStyle = accentColor;
        ctx.beginPath();

        const bx = Math.cos(theta) * (radius + 10 * scale);
        const by = Math.sin(theta) * (radius + 10 * scale);

        ctx.arc(bx, by, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  drawWreathHalf(false);
  drawWreathHalf(true);

  // Bottom ribbon bow with flowing tails
  const bowY = centerY + radius;

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6 * scale;

  // Bow loops
  const bW = 16 * scale;
  const bH = 10 * scale;

  ctx.beginPath();
  ctx.moveTo(centerX, bowY);
  ctx.bezierCurveTo(
    centerX - bW * 1.2,
    bowY - bH,
    centerX - bW * 1.2,
    bowY + bH * 0.8,
    centerX,
    bowY,
  );
  ctx.bezierCurveTo(
    centerX + bW * 1.2,
    bowY - bH,
    centerX + bW * 1.2,
    bowY + bH * 0.8,
    centerX,
    bowY,
  );
  ctx.stroke();

  // Bow center knot
  ctx.beginPath();
  ctx.arc(centerX, bowY, 3.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Ribbon tails
  ctx.beginPath();
  ctx.moveTo(centerX - 2 * scale, bowY + 2 * scale);
  ctx.quadraticCurveTo(
    centerX - 16 * scale,
    bowY + 20 * scale,
    centerX - 22 * scale,
    bowY + 28 * scale,
  );
  ctx.moveTo(centerX + 2 * scale, bowY + 2 * scale);
  ctx.quadraticCurveTo(
    centerX + 16 * scale,
    bowY + 20 * scale,
    centerX + 22 * scale,
    bowY + 28 * scale,
  );
  ctx.stroke();

  // Monogram Initial Text in Center
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = Math.round(radius * 0.44);

  ctx.font = `italic 600 ${fontSize}px Georgia, 'Times New Roman', serif`;
  ctx.letterSpacing = "1.5px";
  ctx.fillText(monogramText, centerX, centerY - 2 * scale);

  ctx.restore();
}

/**
 * 2. LUSH CASCADING CORNER GARLAND (Cụm cành lá và hoa sum sê ở 4 góc)
 * Botanical branches with cascading eucalyptus, olive leaves, seed pods, and blossoms.
 */
export function drawLushCornerGarland(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  scale: number,
  color: string,
  accentColor: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8 * scale;
  ctx.lineCap = "round";

  // Top Corner Cascading Foliage
  const drawTopCorner = (originX: number, originY: number, flipX: boolean) => {
    ctx.save();
    ctx.translate(originX, originY);

    if (flipX) ctx.scale(-1, 1);

    // Primary horizontal branch arching inward
    const hLen = 220 * scale;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      hLen * 0.35,
      -8 * scale,
      hLen * 0.65,
      12 * scale,
      hLen,
      32 * scale,
    );
    ctx.stroke();

    // Secondary vertical trailing branch draping down
    const vLen = 170 * scale;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -6 * scale,
      vLen * 0.35,
      12 * scale,
      vLen * 0.65,
      30 * scale,
      vLen,
    );
    ctx.stroke();

    // Diagonal central filler branch
    ctx.beginPath();
    ctx.moveTo(12 * scale, 12 * scale);
    ctx.quadraticCurveTo(55 * scale, 55 * scale, 110 * scale, 95 * scale);
    ctx.stroke();

    // Eucalyptus & Olive leaves on horizontal branch
    drawLeaf(ctx, 35 * scale, 0, -0.4, 22 * scale, 8 * scale, color);
    drawLeaf(ctx, 42 * scale, 8 * scale, 0.45, 18 * scale, 6.5 * scale, color);
    drawLeaf(ctx, 85 * scale, 5 * scale, -0.25, 24 * scale, 8.5 * scale, color);
    drawLeaf(ctx, 95 * scale, 14 * scale, 0.5, 20 * scale, 7 * scale, color);
    drawLeaf(
      ctx,
      145 * scale,
      18 * scale,
      -0.15,
      22 * scale,
      7.5 * scale,
      color,
    );
    drawLeaf(ctx, 155 * scale, 26 * scale, 0.55, 18 * scale, 6 * scale, color);
    drawLeaf(ctx, hLen, 32 * scale, 0.25, 16 * scale, 5.5 * scale, color);

    // Leaves on vertical draping branch
    drawLeaf(
      ctx,
      0,
      35 * scale,
      Math.PI / 2 + 0.4,
      20 * scale,
      7 * scale,
      color,
    );
    drawLeaf(
      ctx,
      8 * scale,
      42 * scale,
      Math.PI / 2 - 0.45,
      18 * scale,
      6.5 * scale,
      color,
    );
    drawLeaf(
      ctx,
      5 * scale,
      85 * scale,
      Math.PI / 2 + 0.3,
      22 * scale,
      7.5 * scale,
      color,
    );
    drawLeaf(
      ctx,
      14 * scale,
      95 * scale,
      Math.PI / 2 - 0.5,
      18 * scale,
      6 * scale,
      color,
    );
    drawLeaf(
      ctx,
      20 * scale,
      135 * scale,
      Math.PI / 2 + 0.2,
      20 * scale,
      7 * scale,
      color,
    );
    drawLeaf(
      ctx,
      30 * scale,
      vLen,
      Math.PI / 2 - 0.2,
      16 * scale,
      5.5 * scale,
      color,
    );

    // Leaves on diagonal branch
    drawLeaf(ctx, 50 * scale, 45 * scale, 0.8, 20 * scale, 7 * scale, color);
    drawLeaf(ctx, 85 * scale, 75 * scale, 0.75, 18 * scale, 6.5 * scale, color);

    // 5-Petal delicate corner blossom flowers
    draw5PetalFlower(
      ctx,
      14 * scale,
      14 * scale,
      14 * scale,
      accentColor,
      color,
    );
    draw5PetalFlower(
      ctx,
      75 * scale,
      10 * scale,
      9 * scale,
      accentColor,
      color,
    );
    draw5PetalFlower(
      ctx,
      10 * scale,
      70 * scale,
      9 * scale,
      accentColor,
      color,
    );

    // Clustered seed berries
    ctx.fillStyle = accentColor;

    const berries = [
      [65 * scale, -2 * scale],
      [125 * scale, 12 * scale],
      [-2 * scale, 60 * scale],
      [12 * scale, 115 * scale],
      [70 * scale, 60 * scale],
    ];

    for (const [bx, by] of berries) {
      ctx.beginPath();
      ctx.arc(bx, by, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const topCornerOffset = outerMargin + 14 * scale;

  drawTopCorner(topCornerOffset, topCornerOffset + 8 * scale, false);
  drawTopCorner(width - topCornerOffset, topCornerOffset + 8 * scale, true);

  // Bottom Corner Framing Foliage (Upward delicate curving sprigs)
  const drawBottomCorner = (
    originX: number,
    originY: number,
    flipX: boolean,
  ) => {
    ctx.save();
    ctx.translate(originX, originY);

    if (flipX) ctx.scale(-1, 1);

    const bLen = 140 * scale;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(bLen * 0.45, 6 * scale, bLen, -24 * scale);
    ctx.stroke();

    drawLeaf(ctx, 35 * scale, 0, 0.35, 18 * scale, 6 * scale, color);
    drawLeaf(
      ctx,
      42 * scale,
      -4 * scale,
      -0.45,
      16 * scale,
      5.5 * scale,
      color,
    );
    drawLeaf(ctx, 85 * scale, -8 * scale, 0.3, 18 * scale, 6 * scale, color);
    drawLeaf(ctx, 95 * scale, -14 * scale, -0.4, 16 * scale, 5 * scale, color);
    drawLeaf(ctx, bLen, -24 * scale, -0.2, 14 * scale, 4.5 * scale, color);

    draw5PetalFlower(
      ctx,
      8 * scale,
      -8 * scale,
      10 * scale,
      accentColor,
      color,
    );

    ctx.restore();
  };

  const btmCornerOffset = outerMargin + 16 * scale;

  drawBottomCorner(btmCornerOffset, height - btmCornerOffset, false);
  drawBottomCorner(width - btmCornerOffset, height - btmCornerOffset, true);

  ctx.restore();
}

/**
 * 3. WEDDING ARCH FRAME (Khung vòm hoàng gia đỉnh trên)
 */
export function drawWeddingArchFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerInset: number,
  scale: number,
  outerColor: string,
  innerColor: string,
) {
  ctx.save();

  const drawSingleArch = (
    inset: number,
    strokeColor: string,
    lineWidth: number,
  ) => {
    const left = outerMargin + inset;
    const right = width - outerMargin - inset;
    const bottom = height - outerMargin - inset;
    const archTop = outerMargin + inset;
    const frameW = right - left;
    const shoulderY = archTop + frameW * 0.44;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    ctx.moveTo(left, bottom);
    ctx.lineTo(left, shoulderY);
    ctx.bezierCurveTo(left, archTop, right, archTop, right, shoulderY);
    ctx.lineTo(right, bottom);
    ctx.closePath();
    ctx.stroke();
  };

  drawSingleArch(0, outerColor, 2.4 * scale);
  drawSingleArch(innerInset, innerColor, 1.2 * scale);

  // Decorative arch keystone at apex
  const centerX = width / 2;
  const apexY = outerMargin;

  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.arc(centerX, apexY, 4.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = innerColor;
  ctx.beginPath();
  ctx.arc(centerX - 16 * scale, apexY, 2.4 * scale, 0, Math.PI * 2);
  ctx.arc(centerX + 16 * scale, apexY, 2.4 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 4. VINTAGE BAROQUE SCROLLWORK CORNERS (Hoa văn góc uốn lượn cổ điển Pháp)
 */
export function drawVintageBaroqueCorners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inset: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6 * scale;
  ctx.lineCap = "round";

  const drawCorner = (cx: number, cy: number, dirX: number, dirY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dirX, dirY);

    // Large main spiral C-scroll
    ctx.beginPath();
    ctx.moveTo(0, 68 * scale);
    ctx.bezierCurveTo(
      10 * scale,
      32 * scale,
      32 * scale,
      10 * scale,
      68 * scale,
      0,
    );
    ctx.stroke();

    // Inner reverse S-scroll flourish
    ctx.beginPath();
    ctx.moveTo(10 * scale, 50 * scale);
    ctx.bezierCurveTo(
      16 * scale,
      24 * scale,
      24 * scale,
      16 * scale,
      50 * scale,
      10 * scale,
    );
    ctx.stroke();

    // Acanthus leaf finials
    drawLeaf(ctx, 45 * scale, 4 * scale, 0.4, 20 * scale, 7 * scale, color);
    drawLeaf(
      ctx,
      4 * scale,
      45 * scale,
      Math.PI / 2 - 0.4,
      20 * scale,
      7 * scale,
      color,
    );

    // Corner pearls & satellite jewels
    ctx.beginPath();
    ctx.arc(20 * scale, 20 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.arc(6 * scale, 6 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.arc(38 * scale, 12 * scale, 2.4 * scale, 0, Math.PI * 2);
    ctx.arc(12 * scale, 38 * scale, 2.4 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawCorner(inset, inset, 1, 1);
  drawCorner(width - inset, inset, -1, 1);
  drawCorner(inset, height - inset, 1, -1);
  drawCorner(width - inset, height - inset, -1, -1);

  ctx.restore();
}

/**
 * 5. ART DECO STEPPED GEOMETRIC CORNERS (Góc kỷ hà Great Gatsby)
 */
export function drawArtDecoCorners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inset: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2 * scale;
  ctx.lineCap = "square";

  const drawCorner = (cx: number, cy: number, dirX: number, dirY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dirX, dirY);

    const s1 = 56 * scale;
    const s2 = 38 * scale;
    const s3 = 20 * scale;
    const step = 10 * scale;

    // 3-tiered stepped outer border cut
    ctx.beginPath();
    ctx.moveTo(s1, 0);
    ctx.lineTo(s1, step);
    ctx.lineTo(s2, step);
    ctx.lineTo(s2, step * 2);
    ctx.lineTo(s3, step * 2);
    ctx.lineTo(s3, s1);
    ctx.lineTo(0, s1);
    ctx.stroke();

    // Central 45-degree chevron accent
    ctx.beginPath();
    ctx.moveTo(s2 * 0.75, step * 0.6);
    ctx.lineTo(step * 0.6, s2 * 0.75);
    ctx.stroke();

    // Radiating sunburst ray lines
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(s1 * 0.4, 0);
    ctx.lineTo(s1 * 0.85, s1 * 0.45);
    ctx.moveTo(0, s1 * 0.4);
    ctx.lineTo(s1 * 0.45, s1 * 0.85);
    ctx.stroke();

    // Geometric corner solid diamond
    ctx.beginPath();

    const dCenter = 10 * scale;
    const dR = 4.2 * scale;

    ctx.moveTo(dCenter, dCenter - dR);
    ctx.lineTo(dCenter + dR, dCenter);
    ctx.lineTo(dCenter, dCenter + dR);
    ctx.lineTo(dCenter - dR, dCenter);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  drawCorner(inset, inset, 1, 1);
  drawCorner(width - inset, inset, -1, 1);
  drawCorner(inset, height - inset, 1, -1);
  drawCorner(width - inset, height - inset, -1, -1);

  ctx.restore();
}

/**
 * 6. EDITORIAL CORNER ROSETTE BRACKETS
 */
export function drawEditorialCornerAccents(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inset: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4 * scale;

  const drawAccent = (x: number, y: number) => {
    // Center diamond
    ctx.beginPath();

    const r = 4.5 * scale;

    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();

    // Corner bracket with satellite dots
    const bLen = 20 * scale;

    ctx.beginPath();
    ctx.moveTo(x - bLen, y);
    ctx.lineTo(x - r - 3 * scale, y);
    ctx.moveTo(x + r + 3 * scale, y);
    ctx.lineTo(x + bLen, y);
    ctx.moveTo(x, y - bLen);
    ctx.lineTo(x, y - r - 3 * scale);
    ctx.moveTo(x, y + r + 3 * scale);
    ctx.lineTo(x, y + bLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - bLen - 4 * scale, y, 1.8 * scale, 0, Math.PI * 2);
    ctx.arc(x + bLen + 4 * scale, y, 1.8 * scale, 0, Math.PI * 2);
    ctx.arc(x, y - bLen - 4 * scale, 1.8 * scale, 0, Math.PI * 2);
    ctx.arc(x, y + bLen + 4 * scale, 1.8 * scale, 0, Math.PI * 2);
    ctx.fill();
  };

  drawAccent(inset, inset);
  drawAccent(width - inset, inset);
  drawAccent(inset, height - inset);
  drawAccent(width - inset, height - inset);

  ctx.restore();
}

/**
 * 7. SWISS ARCHITECTURAL PRECISION CROSSHAIRS
 */
export function drawArchitecturalCrosshairs(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inset: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2 * scale;

  const drawCross = (x: number, y: number) => {
    const arm = 16 * scale;

    ctx.beginPath();
    ctx.moveTo(x - arm, y);
    ctx.lineTo(x + arm, y);
    ctx.moveTo(x, y - arm);
    ctx.lineTo(x, y + arm);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
    ctx.stroke();
  };

  drawCross(inset, inset);
  drawCross(width - inset, inset);
  drawCross(inset, height - inset);
  drawCross(width - inset, height - inset);

  ctx.restore();
}

/**
 * 8. GRADUATED CREST DIVIDER WITH DIAMOND STAR
 */
export function drawEditorialCrestDivider(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  const wingLength = 170 * scale;

  // Left wing
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  ctx.moveTo(centerX - wingLength, centerY);
  ctx.lineTo(centerX - 28 * scale, centerY);
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(centerX + 28 * scale, centerY);
  ctx.lineTo(centerX + wingLength, centerY);
  ctx.stroke();

  // Center star
  drawSparkle(ctx, centerX, centerY, 9 * scale, color);

  // Satellite dots
  ctx.beginPath();
  ctx.arc(centerX - 16 * scale, centerY, 2.4 * scale, 0, Math.PI * 2);
  ctx.arc(centerX + 16 * scale, centerY, 2.4 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 9. BOTANICAL SPRIG DIVIDER
 */
export function drawBotanicalSprig(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.8 * scale;
  ctx.lineCap = "round";

  const stemHalfLen = 95 * scale;

  ctx.beginPath();
  ctx.moveTo(centerX - stemHalfLen, centerY);
  ctx.quadraticCurveTo(
    centerX,
    centerY - 9 * scale,
    centerX + stemHalfLen,
    centerY,
  );
  ctx.stroke();

  const leafLen = 17 * scale;
  const leafW = 6.2 * scale;

  // Symmetrical leaves
  drawLeaf(
    ctx,
    centerX - 65 * scale,
    centerY - 2 * scale,
    -0.5,
    leafLen * 0.9,
    leafW * 0.9,
    color,
  );
  drawLeaf(
    ctx,
    centerX - 65 * scale,
    centerY + 2 * scale,
    0.5,
    leafLen * 0.9,
    leafW * 0.9,
    color,
  );
  drawLeaf(
    ctx,
    centerX - 32 * scale,
    centerY - 5 * scale,
    -0.6,
    leafLen,
    leafW,
    color,
  );
  drawLeaf(ctx, centerX - 32 * scale, centerY, 0.6, leafLen, leafW, color);

  // Center leaf & berries
  drawLeaf(
    ctx,
    centerX,
    centerY - 9 * scale,
    -Math.PI / 2,
    leafLen * 1.15,
    leafW,
    color,
  );
  ctx.beginPath();
  ctx.arc(
    centerX - 12 * scale,
    centerY - 2 * scale,
    2.4 * scale,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    centerX + 12 * scale,
    centerY - 2 * scale,
    2.4 * scale,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  drawLeaf(
    ctx,
    centerX + 32 * scale,
    centerY - 5 * scale,
    -Math.PI + 0.6,
    leafLen,
    leafW,
    color,
  );
  drawLeaf(
    ctx,
    centerX + 32 * scale,
    centerY,
    Math.PI - 0.6,
    leafLen,
    leafW,
    color,
  );
  drawLeaf(
    ctx,
    centerX + 65 * scale,
    centerY - 2 * scale,
    -Math.PI + 0.5,
    leafLen * 0.9,
    leafW * 0.9,
    color,
  );
  drawLeaf(
    ctx,
    centerX + 65 * scale,
    centerY + 2 * scale,
    Math.PI - 0.5,
    leafLen * 0.9,
    leafW * 0.9,
    color,
  );

  ctx.restore();
}

/**
 * 10. ORNATE QR PLAQUE (Thẻ huy hiệu viền đôi bọc mã QR)
 * Solid white scannable core with luxury layered framing.
 */
export function drawOrnateQrPlaque(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
  scale: number,
  theme: string,
  borderColor: string,
  accentColor: string,
) {
  ctx.save();

  // 1. Subtle drop glow / card lift
  ctx.shadowColor = "rgba(24, 30, 23, 0.07)";
  ctx.shadowBlur = 24 * scale;
  ctx.shadowOffsetY = 8 * scale;

  // 2. Solid pristine white card (guarantees 100% quiet zone scanability!)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, radius);
  ctx.fill();

  ctx.shadowColor = "transparent";

  // 3. Primary outer border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = (theme === "modern" ? 2.8 : 1.6) * scale;
  ctx.stroke();

  // 4. Secondary fine inner rim
  const rimInset = 8 * scale;

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(
    x + rimInset,
    y + rimInset,
    size - rimInset * 2,
    size - rimInset * 2,
    Math.max(radius - rimInset * 0.6, 6),
  );
  ctx.stroke();

  // 5. Delicate decorative corner florets on the plaque
  const drawCornerFloret = (fx: number, fy: number) => {
    if (theme === "wedding") {
      drawHeart(ctx, fx, fy - 1 * scale, 5.5 * scale, borderColor);

      return;
    }

    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.arc(fx, fy, 2.4 * scale, 0, Math.PI * 2);
    ctx.fill();
  };

  const cOffset = 18 * scale;

  drawCornerFloret(x + cOffset, y + cOffset);
  drawCornerFloret(x + size - cOffset, y + cOffset);
  drawCornerFloret(x + cOffset, y + size - cOffset);
  drawCornerFloret(x + size - cOffset, y + size - cOffset);

  ctx.restore();
}

/**
 * 11. CELEBRATORY BANNER RIBBON (Dải ruy băng uốn lượn phong cách thiệp cưới)
 * Encapsulates the scan CTA into a luxurious placard ribbon.
 */
export function drawBannerRibbon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  scale: number,
  text: string,
  bgColor: string,
  textColor: string,
  borderColor: string,
) {
  ctx.save();

  const halfW = width / 2;
  const halfH = height / 2;
  const tailWidth = 28 * scale;
  const notchDepth = 12 * scale;

  // Left ribbon tail with swallowtail notch
  ctx.fillStyle = borderColor;
  ctx.beginPath();
  ctx.moveTo(centerX - halfW + 6 * scale, centerY - halfH + 4 * scale);
  ctx.lineTo(centerX - halfW - tailWidth, centerY - halfH + 4 * scale);
  ctx.lineTo(centerX - halfW - tailWidth + notchDepth, centerY);
  ctx.lineTo(centerX - halfW - tailWidth, centerY + halfH - 4 * scale);
  ctx.lineTo(centerX - halfW + 6 * scale, centerY + halfH - 4 * scale);
  ctx.closePath();
  ctx.fill();

  // Right ribbon tail with swallowtail notch
  ctx.beginPath();
  ctx.moveTo(centerX + halfW - 6 * scale, centerY - halfH + 4 * scale);
  ctx.lineTo(centerX + halfW + tailWidth, centerY - halfH + 4 * scale);
  ctx.lineTo(centerX + halfW + tailWidth - notchDepth, centerY);
  ctx.lineTo(centerX + halfW + tailWidth, centerY + halfH - 4 * scale);
  ctx.lineTo(centerX + halfW - 6 * scale, centerY + halfH - 4 * scale);
  ctx.closePath();
  ctx.fill();

  // Central main banner plate
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(centerX - halfW, centerY - halfH, width, height, height * 0.4);
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.4 * scale;
  ctx.stroke();

  // Text inside banner
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(height * 0.46)}px system-ui, -apple-system, sans-serif`;
  ctx.letterSpacing = "0.5px";
  ctx.fillText(text, centerX, centerY);

  ctx.restore();
}

/**
 * 12. LUXURY HANDMADE PAPER GRAIN (Vân giấy mỹ thuật thủ công)
 * Algorithmic micro-stippling applied at 3% alpha for organic tactile warmth.
 */
export function applyLuxuryPaperTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  opacity: number = 0.035,
) {
  ctx.save();
  ctx.fillStyle = `rgba(24, 30, 23, ${opacity})`;

  // Deterministic pseudo-random seed generator
  let seed = 1234567;

  const rnd = () => {
    seed = (seed * 16807) % 2147483647;

    return (seed - 1) / 2147483646;
  };

  const pointCount = Math.round((width * height) / (280 * scale));
  const dotSize = Math.max(1, 1.2 * scale);

  for (let i = 0; i < pointCount; i++) {
    const px = rnd() * width;
    const py = rnd() * height;

    ctx.fillRect(px, py, dotSize, dotSize);
  }

  ctx.restore();
}

/**
 * 13. BOTANICAL WATERMARK IN BACKGROUND (Họa tiết hoa lá in chìm)
 * Soft, low-opacity floral radiance adding multi-dimensional depth.
 */
export function drawBotanicalWatermark(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.2 * scale;

  const rays = 12;
  const innerR = 120 * scale;
  const outerR = 260 * scale;

  for (let i = 0; i < rays; i++) {
    const angle = (i * Math.PI * 2) / rays;
    const x1 = centerX + Math.cos(angle) * innerR;
    const y1 = centerY + Math.sin(angle) * innerR;
    const x2 = centerX + Math.cos(angle) * outerR;
    const y2 = centerY + Math.sin(angle) * outerR;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    drawLeaf(ctx, x2, y2, angle, 32 * scale, 12 * scale, color);
  }

  ctx.restore();
}

/**
 * 14. VECTOR LOVE HEART (Biểu tượng trái tim tình yêu kinh điển)
 */
export function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillColor?: string,
  strokeColor?: string,
  lineWidth: number = 1.5,
) {
  ctx.save();
  ctx.translate(x, y);

  const s = size * 0.5;

  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.9, -s * 0.7, -s * 1.3, s * 0.4, 0, s * 1.3);
  ctx.bezierCurveTo(s * 1.3, s * 0.4, s * 0.9, -s * 0.7, 0, s * 0.3);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 15. ENGLISH BRIDAL ROSE BLOSSOM (Bông hoa hồng cưới hoàng gia)
 */
export function drawRoseBlossom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  petalColor: string,
  accentColor: string,
) {
  ctx.save();
  ctx.translate(x, y);

  // Outer petals (6 petals)
  ctx.fillStyle = petalColor;

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const px = Math.cos(angle) * (radius * 0.45);
    const py = Math.sin(angle) * (radius * 0.45);

    ctx.beginPath();
    ctx.arc(px, py, radius * 0.54, 0, Math.PI * 2);
    ctx.fill();
  }

  // Middle layer petals (5 petals)
  ctx.fillStyle = accentColor;

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 + 0.35;
    const px = Math.cos(angle) * (radius * 0.26);
    const py = Math.sin(angle) * (radius * 0.26);

    ctx.beginPath();
    ctx.arc(px, py, radius * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central rosebud core
  ctx.fillStyle = petalColor;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Spiral swirl detail line
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = Math.max(1, radius * 0.08);
  ctx.lineCap = "round";
  ctx.beginPath();

  for (let a = 0; a < Math.PI * 3.5; a += 0.2) {
    const r = (a / (Math.PI * 3.5)) * (radius * 0.28);
    const sx = Math.cos(a) * r;
    const sy = Math.sin(a) * r;

    if (a === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * 16. BRIDAL ROSEBUD (Nụ hoa hồng chớm nở)
 */
export function drawRoseBud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  petalColor: string,
  sepalColor: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Teardrop petal bud
  ctx.fillStyle = petalColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    length * 0.35,
    -length * 0.32,
    length * 0.85,
    -length * 0.2,
    length,
    0,
  );
  ctx.bezierCurveTo(
    length * 0.85,
    length * 0.2,
    length * 0.35,
    length * 0.32,
    0,
    0,
  );
  ctx.fill();

  // Clasping golden sepals
  drawLeaf(ctx, 0, 0, -0.22, length * 0.68, length * 0.16, sepalColor);
  drawLeaf(ctx, 0, 0, 0.22, length * 0.68, length * 0.16, sepalColor);

  ctx.restore();
}

/**
 * 17. SATIN RIBBON BOW WITH FLOWING TAILS (Nơ ruy băng lụa cao cấp)
 */
export function drawRibbonBow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  scale: number,
  color: string,
  accentColor: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6 * scale;

  const bW = width * 0.55;
  const bH = width * 0.35;

  // Bow loops
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.bezierCurveTo(
    centerX - bW * 1.2,
    centerY - bH,
    centerX - bW * 1.2,
    centerY + bH * 0.8,
    centerX,
    centerY,
  );
  ctx.bezierCurveTo(
    centerX + bW * 1.2,
    centerY - bH,
    centerX + bW * 1.2,
    centerY + bH * 0.8,
    centerX,
    centerY,
  );
  ctx.stroke();

  // Center knot
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Trailing tails with swallowtail notches
  const tailDrop = width * 0.85;

  ctx.beginPath();
  ctx.moveTo(centerX - 2 * scale, centerY + 2 * scale);
  ctx.quadraticCurveTo(
    centerX - bW * 0.8,
    centerY + tailDrop * 0.6,
    centerX - bW * 1.1,
    centerY + tailDrop,
  );
  ctx.moveTo(centerX + 2 * scale, centerY + 2 * scale);
  ctx.quadraticCurveTo(
    centerX + bW * 0.8,
    centerY + tailDrop * 0.6,
    centerX + bW * 1.1,
    centerY + tailDrop,
  );
  ctx.stroke();

  ctx.restore();
}

/**
 * 18. ENTWINED WEDDING RINGS WITH SOLITAIRE DIAMOND
 * (Cặp nhẫn cưới lồng vào nhau đính kim cương giác cắt lấp lánh)
 */
export function drawEntwinedWeddingRings(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  goldColor: string = "#b89358",
  highlightColor: string = "#fae8c8",
  sparkleColor: string = "#b89358",
) {
  ctx.save();

  const ringRadius = 24 * scale;
  const bandThickness = 4.2 * scale;
  const separation = 17 * scale;

  const leftRingX = centerX - separation;
  const rightRingX = centerX + separation;
  const ringY = centerY;

  // Soft metallic glow
  ctx.shadowColor = "rgba(184, 147, 88, 0.22)";
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 3 * scale;

  const drawBand = (rx: number, ry: number, tilt: number) => {
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(tilt);

    // Primary gold band
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = bandThickness;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringRadius, ringRadius * 0.82, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Metallic specular highlight arc
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      ringRadius - bandThickness * 0.2,
      (ringRadius - bandThickness * 0.2) * 0.82,
      0,
      Math.PI * 0.8,
      Math.PI * 1.65,
    );
    ctx.stroke();

    ctx.restore();
  };

  // 1. Groom's band (Left, slightly tilted)
  drawBand(leftRingX, ringY, -0.16);

  // 2. Bride's band (Right, slightly tilted)
  drawBand(rightRingX, ringY, 0.16);

  // 3. Interlocking weave: redraw top-left arc of bride's ring over groom's ring
  ctx.save();
  ctx.translate(rightRingX, ringY);
  ctx.rotate(0.16);
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = bandThickness;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    ringRadius,
    ringRadius * 0.82,
    0,
    Math.PI * 0.84,
    Math.PI * 1.34,
  );
  ctx.stroke();
  ctx.restore();

  ctx.shadowColor = "transparent";

  // 4. SOLITAIRE DIAMOND MOUNT ON TOP APEX OF BRIDE'S RING
  const diamondApexX = rightRingX + Math.sin(0.16) * ringRadius;
  const diamondApexY = ringY - Math.cos(0.16) * (ringRadius * 0.82);

  ctx.save();
  ctx.translate(diamondApexX, diamondApexY);

  // 4 gold prongs
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 1.6 * scale;
  ctx.beginPath();
  ctx.moveTo(-6 * scale, 0);
  ctx.lineTo(-4 * scale, -5 * scale);
  ctx.moveTo(6 * scale, 0);
  ctx.lineTo(4 * scale, -5 * scale);
  ctx.stroke();

  // Faceted Solitaire Diamond
  const dw = 16 * scale;
  const dTable = 9 * scale;
  const dh = 15 * scale;
  const dCrownH = 5 * scale;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 1.2 * scale;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-dTable / 2, -dh);
  ctx.lineTo(dTable / 2, -dh);
  ctx.lineTo(dw / 2, -dh + dCrownH);
  ctx.lineTo(0, -1 * scale);
  ctx.lineTo(-dw / 2, -dh + dCrownH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Brilliant cut interior facet lines
  ctx.strokeStyle = "rgba(184, 147, 88, 0.65)";
  ctx.lineWidth = 0.9 * scale;
  ctx.beginPath();
  ctx.moveTo(-dTable / 2, -dh);
  ctx.lineTo(0, -1 * scale);
  ctx.moveTo(dTable / 2, -dh);
  ctx.lineTo(0, -1 * scale);
  ctx.moveTo(-dw / 2, -dh + dCrownH);
  ctx.lineTo(dw / 2, -dh + dCrownH);
  ctx.moveTo(0, -dh);
  ctx.lineTo(0, -dh + dCrownH);
  ctx.stroke();

  // Radiant Diamond Sparkle Glints (✦ ✨)
  drawSparkle(ctx, dw * 0.62, -dh - 4 * scale, 9 * scale, sparkleColor);
  drawSparkle(ctx, -dw * 0.62, -dh + 2 * scale, 6 * scale, sparkleColor);
  drawSparkle(
    ctx,
    dw * 0.78,
    -dh + dCrownH + 4 * scale,
    4.5 * scale,
    sparkleColor,
  );

  ctx.restore();

  // Specular glint on groom's band
  drawSparkle(
    ctx,
    leftRingX - ringRadius * 0.72,
    ringY + ringRadius * 0.42,
    5 * scale,
    sparkleColor,
  );

  ctx.restore();
}

/**
 * 19. WEDDING HEART FLORAL CREST (Huy hiệu Trái tim Hoa hồng Hoàng gia & Cặp Nhẫn Kim Cương)
 * Heart-shaped laurel adorned with English roses, topped with entwined diamond rings,
 * with the couple's monogram inside.
 */
export function drawWeddingHeartCrest(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  scale: number,
  color: string,
  accentColor: string,
  monogramText: string,
) {
  ctx.save();

  const heartW = radius * 2.35;
  const heartH = radius * 2.15;

  // 1. Crowned with Entwined Diamond Wedding Rings right above the top cleft
  drawEntwinedWeddingRings(
    ctx,
    centerX,
    centerY - heartH * 0.48,
    scale * 0.82,
    color,
    "#fae8c8",
    color,
  );

  // 2. Twin curved botanical rose branches forming the heart silhouette
  const drawHeartBranch = (flip: boolean) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    if (flip) ctx.scale(-1, 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8 * scale;
    ctx.lineCap = "round";

    // Curve sweeping from bottom tip up to lobe and down to cleft
    ctx.beginPath();
    ctx.moveTo(0, heartH * 0.42);
    ctx.bezierCurveTo(
      -heartW * 0.54,
      heartH * 0.16,
      -heartW * 0.54,
      -heartH * 0.3,
      -heartW * 0.24,
      -heartH * 0.44,
    );
    ctx.bezierCurveTo(
      -heartW * 0.1,
      -heartH * 0.5,
      -heartW * 0.04,
      -heartH * 0.4,
      0,
      -heartH * 0.26,
    );
    ctx.stroke();

    // Laurel foliage along the heart branch
    const steps = 6;

    for (let i = 1; i <= steps; i++) {
      const t = i / (steps + 1);
      const bx = -Math.sin(t * Math.PI) * (heartW * 0.46);
      const by = heartH * 0.42 - t * (heartH * 0.72);
      const angle = -Math.PI * 0.35 + t * Math.PI * 0.7;

      drawLeaf(ctx, bx, by, angle - 0.4, 16 * scale, 6.5 * scale, color);
      drawLeaf(ctx, bx, by, angle + 0.3, 13 * scale, 5 * scale, accentColor);
    }

    // Blooming English Garden Roses along the heart perimeter
    drawRoseBlossom(
      ctx,
      -heartW * 0.42,
      heartH * 0.04,
      12 * scale,
      color,
      accentColor,
    );
    drawRoseBlossom(
      ctx,
      -heartW * 0.26,
      -heartH * 0.4,
      9.5 * scale,
      color,
      accentColor,
    );
    drawRoseBud(
      ctx,
      -heartW * 0.46,
      -heartH * 0.16,
      -Math.PI * 0.38,
      13 * scale,
      color,
      accentColor,
    );

    // Clustered seed pearls
    ctx.fillStyle = accentColor;

    const pearls = [
      [-heartW * 0.36, heartH * 0.2],
      [-heartW * 0.5, -heartH * 0.04],
      [-heartW * 0.14, -heartH * 0.46],
    ];

    for (const [px, py] of pearls) {
      ctx.beginPath();
      ctx.arc(px, py, 2.4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  drawHeartBranch(false);
  drawHeartBranch(true);

  // 3. Satin Ribbon Bow at bottom tip of heart
  drawRibbonBow(
    ctx,
    centerX,
    centerY + heartH * 0.42,
    28 * scale,
    scale,
    color,
    accentColor,
  );

  // 4. Couple Monogram with Romance Heart inside the Crest
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1a1917";
  ctx.font = `italic 600 ${Math.round(40 * scale)}px Georgia, 'Times New Roman', serif`;

  const weddingMonogram = monogramText.includes("&")
    ? monogramText.replace("&", "♡")
    : monogramText.includes("·")
      ? monogramText.replace("·", "♡")
      : monogramText;

  ctx.fillText(weddingMonogram, centerX, centerY);

  ctx.restore();
}

/**
 * 20. BRIDAL ROSE CORNERS (Góc hoa hồng cưới lãng mạn & tình yêu)
 * Features English rose blooms, delicate rosebuds, eucalyptus leaves,
 * and miniature floating love hearts.
 */
export function drawBridalRoseCorners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  inset: number,
  scale: number,
  color: string,
  accentColor: string,
) {
  ctx.save();

  const drawCorner = (
    cx: number,
    cy: number,
    flipX: boolean,
    flipY: boolean,
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    if (flipX) ctx.scale(-1, 1);
    if (flipY) ctx.scale(1, -1);

    // Arching stems hugging the perimeter
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6 * scale;
    ctx.lineCap = "round";

    // Horizontal stem
    ctx.beginPath();
    ctx.moveTo(10 * scale, 10 * scale);
    ctx.quadraticCurveTo(55 * scale, 4 * scale, 110 * scale, 8 * scale);
    ctx.stroke();

    // Vertical stem
    ctx.beginPath();
    ctx.moveTo(10 * scale, 10 * scale);
    ctx.quadraticCurveTo(4 * scale, 55 * scale, 8 * scale, 110 * scale);
    ctx.stroke();

    // Blooming English Rose right in the corner
    drawRoseBlossom(
      ctx,
      16 * scale,
      16 * scale,
      13.5 * scale,
      color,
      accentColor,
    );

    // Extending rosebuds
    drawRoseBud(
      ctx,
      65 * scale,
      5 * scale,
      0.1,
      14 * scale,
      color,
      accentColor,
    );
    drawRoseBud(
      ctx,
      5 * scale,
      65 * scale,
      Math.PI / 2 - 0.1,
      14 * scale,
      color,
      accentColor,
    );

    // Foliage leaves
    drawLeaf(ctx, 36 * scale, 7 * scale, -0.3, 19 * scale, 7 * scale, color);
    drawLeaf(
      ctx,
      7 * scale,
      36 * scale,
      Math.PI / 2 + 0.3,
      19 * scale,
      7 * scale,
      color,
    );
    drawLeaf(
      ctx,
      94 * scale,
      8 * scale,
      0.1,
      15 * scale,
      5.5 * scale,
      accentColor,
    );
    drawLeaf(
      ctx,
      8 * scale,
      94 * scale,
      Math.PI / 2 - 0.1,
      15 * scale,
      5.5 * scale,
      accentColor,
    );

    // Baby's breath pearls
    ctx.fillStyle = accentColor;

    const pearls = [
      [28 * scale, 28 * scale],
      [46 * scale, 17 * scale],
      [17 * scale, 46 * scale],
      [80 * scale, 13 * scale],
      [13 * scale, 80 * scale],
    ];

    for (const [px, py] of pearls) {
      ctx.beginPath();
      ctx.arc(px, py, 2.3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Miniature Love Heart floating near the corner bouquet
    drawHeart(
      ctx,
      34 * scale,
      34 * scale,
      7.5 * scale,
      color,
      accentColor,
      1 * scale,
    );

    ctx.restore();
  };

  drawCorner(inset, inset, false, false); // Top-left
  drawCorner(width - inset, inset, true, false); // Top-right
  drawCorner(inset, height - inset, false, true); // Bottom-left
  drawCorner(width - inset, height - inset, true, true); // Bottom-right

  ctx.restore();
}

/**
 * 21. WEDDING DIVIDER (Vạch phân cách Cặp Nhẫn Cưới & Cành Ô liu)
 * Centers miniature entwined wedding rings with diamond sparkle,
 * flanked by twin olive sprigs and floating love hearts.
 */
export function drawWeddingDivider(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  goldColor: string,
  accentColor: string,
) {
  ctx.save();

  // Center miniature entwined wedding rings
  drawEntwinedWeddingRings(
    ctx,
    centerX,
    centerY,
    scale * 0.54,
    goldColor,
    "#fae8c8",
    goldColor,
  );

  const ringClearance = 32 * scale;
  const lineLength = 110 * scale;

  // Left olive sprig & hairline rule
  ctx.save();
  ctx.translate(centerX - ringClearance, centerY);
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 1.4 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-lineLength, 0);
  ctx.stroke();

  drawLeaf(
    ctx,
    -20 * scale,
    0,
    -Math.PI * 0.85,
    13 * scale,
    4.8 * scale,
    goldColor,
  );
  drawLeaf(
    ctx,
    -45 * scale,
    0,
    Math.PI * 0.85,
    11 * scale,
    4.2 * scale,
    accentColor,
  );
  drawLeaf(
    ctx,
    -70 * scale,
    0,
    -Math.PI * 0.85,
    10 * scale,
    3.8 * scale,
    goldColor,
  );

  drawHeart(ctx, -32 * scale, -8 * scale, 5.5 * scale, goldColor);
  drawSparkle(ctx, -lineLength - 6 * scale, 0, 4.5 * scale, goldColor);
  ctx.restore();

  // Right olive sprig & hairline rule
  ctx.save();
  ctx.translate(centerX + ringClearance, centerY);
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 1.4 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(lineLength, 0);
  ctx.stroke();

  drawLeaf(
    ctx,
    20 * scale,
    0,
    -Math.PI * 0.15,
    13 * scale,
    4.8 * scale,
    goldColor,
  );
  drawLeaf(
    ctx,
    45 * scale,
    0,
    Math.PI * 0.15,
    11 * scale,
    4.2 * scale,
    accentColor,
  );
  drawLeaf(
    ctx,
    70 * scale,
    0,
    -Math.PI * 0.15,
    10 * scale,
    3.8 * scale,
    goldColor,
  );

  drawHeart(ctx, 32 * scale, -8 * scale, 5.5 * scale, goldColor);
  drawSparkle(ctx, lineLength + 6 * scale, 0, 4.5 * scale, goldColor);
  ctx.restore();

  ctx.restore();
}

/**
 * 22. WEDDING WATERMARK (Hình chìm Trái tim đôi lồng nhau & Cặp nhẫn cưới)
 * Ultra-delicate background watermark of entwined double hearts
 * with wedding rings and radiant starburst sparkles.
 */
export function drawWeddingWatermark(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.4 * scale;

  // Interlinked double hearts
  drawHeart(
    ctx,
    centerX - 38 * scale,
    centerY - 18 * scale,
    115 * scale,
    undefined,
    color,
    1.6 * scale,
  );
  drawHeart(
    ctx,
    centerX + 38 * scale,
    centerY + 10 * scale,
    105 * scale,
    undefined,
    color,
    1.4 * scale,
  );

  // Entwined wedding rings in center
  drawEntwinedWeddingRings(
    ctx,
    centerX,
    centerY,
    scale * 1.2,
    color,
    color,
    color,
  );

  // Surrounding sparkles
  const sparkles = [
    [-135 * scale, -95 * scale, 15 * scale],
    [140 * scale, -105 * scale, 16 * scale],
    [-150 * scale, 85 * scale, 13 * scale],
    [135 * scale, 105 * scale, 14 * scale],
    [0, -150 * scale, 18 * scale],
    [0, 150 * scale, 15 * scale],
  ];

  for (let i = 0; i < sparkles.length; i++) {
    const [sx, sy, sz] = sparkles[i];

    drawSparkle(ctx, centerX + sx, centerY + sy, sz, color);
  }

  ctx.restore();
}

/**
 * 23. LOVE DOVES IN FLIGHT (Đôi chim bồ câu tình yêu ngậm dải ruy băng)
 * Two heraldic doves in flight facing each other, carrying an olive twig and ribbon heart.
 */
export function drawWeddingLoveDoves(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string,
  accentColor: string,
) {
  ctx.save();

  const separation = 44 * scale;

  const drawDove = (flip: boolean) => {
    ctx.save();
    ctx.translate(centerX + (flip ? separation : -separation), centerY);

    if (flip) ctx.scale(-1, 1);

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4 * scale;
    ctx.lineJoin = "round";

    // 1. Dove body, tail, and head
    ctx.beginPath();
    ctx.moveTo(18 * scale, -2 * scale); // Beak tip
    ctx.quadraticCurveTo(14 * scale, -10 * scale, 6 * scale, -8 * scale);
    ctx.quadraticCurveTo(-10 * scale, -6 * scale, -22 * scale, 2 * scale);
    ctx.lineTo(-26 * scale, 0);
    ctx.lineTo(-24 * scale, 4 * scale);
    ctx.lineTo(-28 * scale, 4 * scale);
    ctx.lineTo(-22 * scale, 8 * scale);
    ctx.quadraticCurveTo(-6 * scale, 12 * scale, 6 * scale, 8 * scale);
    ctx.quadraticCurveTo(18 * scale, 6 * scale, 18 * scale, -2 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Raised wings with flight feathers
    ctx.beginPath();
    ctx.moveTo(2 * scale, -6 * scale);
    ctx.bezierCurveTo(
      4 * scale,
      -18 * scale,
      -4 * scale,
      -24 * scale,
      -12 * scale,
      -28 * scale,
    );
    ctx.lineTo(-8 * scale, -22 * scale);
    ctx.lineTo(-14 * scale, -22 * scale);
    ctx.lineTo(-10 * scale, -16 * scale);
    ctx.lineTo(-14 * scale, -15 * scale);
    ctx.lineTo(-6 * scale, -8 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Eye dot & golden beak
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(12 * scale, -4 * scale, 1.2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 4. Olive sprig in beak
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(18 * scale, -2 * scale);
    ctx.lineTo(26 * scale, 2 * scale);
    ctx.stroke();

    drawLeaf(ctx, 24 * scale, 0, 0.4, 7 * scale, 3 * scale, color);
    drawLeaf(
      ctx,
      27 * scale,
      3 * scale,
      -0.4,
      6 * scale,
      2.5 * scale,
      accentColor,
    );

    ctx.restore();
  };

  drawDove(false); // Left dove
  drawDove(true); // Right dove

  // Center connection: fluttering ribbon holding a golden love heart
  drawHeart(
    ctx,
    centerX,
    centerY - 2 * scale,
    10 * scale,
    color,
    accentColor,
    1.2 * scale,
  );
  drawSparkle(ctx, centerX, centerY - 14 * scale, 6 * scale, color);

  ctx.restore();
}

/**
 * 24. CLIMBING ROSE FLORAL ARBOR (Cổng vòm hoa cưới leo hai bên cột)
 * Lush climbing English garden roses, rosebuds, and eucalyptus foliage winding up
 * the upright pillars of the wedding arch.
 */
export function drawWeddingFloralArbor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outerMargin: number,
  innerInset: number,
  scale: number,
  color: string,
  accentColor: string,
) {
  ctx.save();

  const left = outerMargin + innerInset;
  const right = width - outerMargin - innerInset;
  const bottom = height - outerMargin - innerInset - 60 * scale;
  const top = outerMargin + innerInset + (right - left) * 0.44; // Arch shoulder
  const pillarHeight = bottom - top;

  const drawPillarVines = (pillarX: number, flip: boolean) => {
    ctx.save();
    ctx.translate(pillarX, 0);

    if (flip) ctx.scale(-1, 1);

    const clusters = 5;

    for (let i = 0; i < clusters; i++) {
      const cy = bottom - (i / (clusters - 1)) * pillarHeight;
      const wave = Math.sin(i * 1.5) * 12 * scale;

      // Sinusoidal winding vine
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.moveTo(-4 * scale, cy + (pillarHeight / clusters) * 0.5);
      ctx.quadraticCurveTo(
        wave * 1.5,
        cy,
        4 * scale,
        cy - (pillarHeight / clusters) * 0.5,
      );
      ctx.stroke();

      // Alternating roses and rosebuds
      if (i % 2 === 0) {
        drawRoseBlossom(
          ctx,
          wave,
          cy,
          (11 + (i === 2 ? 3 : 0)) * scale,
          color,
          accentColor,
        );
      } else {
        drawRoseBud(ctx, wave, cy, -0.4, 13 * scale, color, accentColor);
      }

      // Leaves reaching out
      drawLeaf(
        ctx,
        wave + 8 * scale,
        cy - 6 * scale,
        0.4,
        16 * scale,
        6 * scale,
        color,
      );
      drawLeaf(
        ctx,
        wave - 8 * scale,
        cy + 6 * scale,
        -Math.PI * 0.7,
        14 * scale,
        5 * scale,
        accentColor,
      );

      // Pearl berries
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(wave + 14 * scale, cy + 2 * scale, 2.2 * scale, 0, Math.PI * 2);
      ctx.arc(wave - 12 * scale, cy - 4 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  drawPillarVines(left, false);
  drawPillarVines(right, true);

  ctx.restore();
}

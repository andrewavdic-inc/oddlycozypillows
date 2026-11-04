// Deterministic pseudo-random generator so 'Chaotic' mode stays consistent until re-shuffled
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Renders the live Printify Pillow or Blanket preview onto an HTML5 Canvas
 */
export function renderProductPreview({
  ctx,
  canvasWidth,
  canvasHeight,
  productType = 'pillow', // 'pillow' | 'blanket'
  sizeSpec,
  bgColor = '#FFFFFF',
  mode = 'centered',      // 'centered' | 'stretched' | 'checkered' | 'chaotic' | 'custom'
  imageElement,
  chaosSeed = 42,
  customConfig = { x: 0.5, y: 0.5, scale: 1, gridCount: 1 },
  side = 'front',         // 'front' | 'back'
  backMode = 'match',     // 'match' | 'blank'
}) {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calculate product shape dimensions inside canvas
  const wRatio = sizeSpec?.widthRatio || 1;
  const hRatio = sizeSpec?.heightRatio || 1;
  const maxDim = Math.min(canvasWidth, canvasHeight) * 0.82;
  const prodW = maxDim * (wRatio / Math.max(wRatio, hRatio));
  const prodH = maxDim * (hRatio / Math.max(wRatio, hRatio));
  const startX = (canvasWidth - prodW) / 2;
  const startY = (canvasHeight - prodH) / 2;
  const cornerRadius = productType === 'pillow' ? 34 : 18;

  ctx.save();

  // Drop shadow for 3D pillow/blanket depth
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;

  // Draw rounded pillow/blanket silhouette path
  drawRoundedShape(ctx, startX, startY, prodW, prodH, cornerRadius, productType);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // Reset shadow and clip to the pillow/blanket silhouette
  ctx.shadowColor = 'transparent';
  ctx.clip();

  // Draw print if side is front, or if side is back and backMode === 'match'
  const shouldDrawGraphic = imageElement && (side === 'front' || backMode === 'match');

  if (shouldDrawGraphic) {
    const imgAspect = (imageElement.width || 200) / (imageElement.height || 200);

    if (mode === 'centered') {
      const targetSize = Math.min(prodW, prodH) * 0.58;
      const drawW = imgAspect >= 1 ? targetSize : targetSize * imgAspect;
      const drawH = imgAspect >= 1 ? targetSize / imgAspect : targetSize;
      ctx.drawImage(
        imageElement,
        startX + (prodW - drawW) / 2,
        startY + (prodH - drawH) / 2,
        drawW,
        drawH
      );
    } else if (mode === 'stretched') {
      const pad = prodW * 0.04;
      ctx.drawImage(
        imageElement,
        startX + pad,
        startY + pad,
        prodW - pad * 2,
        prodH - pad * 2
      );
    } else if (mode === 'checkered') {
      const cols = 4;
      const rows = Math.max(4, Math.round(cols * (prodH / prodW)));
      const cellW = prodW / cols;
      const cellH = prodH / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Checkered alternating tile background tint
          if ((r + c) % 2 === 1) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.045)';
            ctx.fillRect(startX + c * cellW, startY + r * cellH, cellW, cellH);
          }
          // Draw PNG in checkered cells
          if ((r + c) % 2 === 0) {
            const iconSize = Math.min(cellW, cellH) * 0.76;
            const dW = imgAspect >= 1 ? iconSize : iconSize * imgAspect;
            const dH = imgAspect >= 1 ? iconSize / imgAspect : iconSize;
            const cx = startX + c * cellW + (cellW - dW) / 2;
            const cy = startY + r * cellH + (cellH - dH) / 2;
            ctx.drawImage(imageElement, cx, cy, dW, dH);
          }
        }
      }
    } else if (mode === 'chaotic') {
      const count = 22;
      for (let i = 0; i < count; i++) {
        const rx = seededRandom(chaosSeed + i * 13.7);
        const ry = seededRandom(chaosSeed + i * 29.3);
        const rScale = 0.2 + seededRandom(chaosSeed + i * 41.1) * 0.25;
        const rAngle = (seededRandom(chaosSeed + i * 67.9) - 0.5) * Math.PI * 1.4;

        const baseSize = Math.min(prodW, prodH) * rScale;
        const dW = imgAspect >= 1 ? baseSize : baseSize * imgAspect;
        const dH = imgAspect >= 1 ? baseSize / imgAspect : baseSize;

        const centerX = startX + rx * prodW;
        const centerY = startY + ry * prodH;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rAngle);
        ctx.drawImage(imageElement, -dW / 2, -dH / 2, dW, dH);
        ctx.restore();
      }
    } else if (mode === 'custom') {
      const { x = 0.5, y = 0.5, scale = 1, gridCount = 1, rotation = 0 } = customConfig;
      if (gridCount > 1) {
        const cellW = prodW / gridCount;
        const cellH = prodH / gridCount;
        for (let r = 0; r < gridCount; r++) {
          for (let c = 0; c < gridCount; c++) {
            const size = Math.min(cellW, cellH) * 0.65 * scale;
            const dW = imgAspect >= 1 ? size : size * imgAspect;
            const dH = imgAspect >= 1 ? size / imgAspect : size;
            const cx = startX + c * cellW + cellW * x;
            const cy = startY + r * cellH + cellH * y;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(imageElement, -dW / 2, -dH / 2, dW, dH);
            ctx.restore();
          }
        }
      } else {
        const size = Math.min(prodW, prodH) * 0.5 * scale;
        const dW = imgAspect >= 1 ? size : size * imgAspect;
        const dH = imgAspect >= 1 ? size / imgAspect : size;
        const cx = startX + prodW * x;
        const cy = startY + prodH * y;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(imageElement, -dW / 2, -dH / 2, dW, dH);
        ctx.restore();
      }
    }
  }

  // Realistic pillow/blanket 3D fabric shading & seam overlay
  const grad = ctx.createRadialGradient(
    startX + prodW * 0.35,
    startY + prodH * 0.3,
    prodW * 0.1,
    startX + prodW * 0.5,
    startY + prodH * 0.5,
    prodW * 0.78
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.14)');
  ctx.fillStyle = grad;
  ctx.fillRect(startX, startY, prodW, prodH);

  // Stitched seam border
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(startX + 8, startY + 8, prodW - 16, prodH - 16);
  ctx.setLineDash([]);

  ctx.restore();
}

function drawRoundedShape(ctx, x, y, w, h, r, productType) {
  ctx.beginPath();
  if (productType === 'pillow') {
    // Slightly pinched corners for a plump pillow silhouette
    const curve = 8;
    ctx.moveTo(x + r, y);
    ctx.quadraticCurveTo(x + w / 2, y + curve, x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.quadraticCurveTo(x + w - curve, y + h / 2, x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.quadraticCurveTo(x + w / 2, y + h - curve, x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.quadraticCurveTo(x + curve, y + h / 2, x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  } else {
    ctx.roundRect(x, y, w, h, r);
  }
  ctx.closePath();
}

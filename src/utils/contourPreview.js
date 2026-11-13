/**
 * Renders a contour-cut (custom-shaped) pillow preview on an HTML5 Canvas.
 * Works with both transparent PNGs and rectangular uploaded photos.
 */
export function renderContourPillow({
  canvas,
  image,
  bgColor = '#FFFFFF',
  side = 'front',
  backMode = 'match',
  scale = 1,
  rotation = 0,
  simulateCutout = false,
  sizeLabel = '18" Custom Shape',
}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // 1. Studio Backdrop Grid so white contour borders stand out clearly
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, W * 0.65);
  bgGrad.addColorStop(0, '#F8FAFC');
  bgGrad.addColorStop(1, '#E2E8F0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 1;
  const gridStep = 24;
  for (let x = 0; x < W; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  if (!image) return;

  // 2. Prepare the graphic on an offscreen buffer (apply organic cutout mask if requested)
  const artCanvas = document.createElement('canvas');
  artCanvas.width = W;
  artCanvas.height = H;
  const artCtx = artCanvas.getContext('2d');

  const maxDim = Math.min(W, H) * 0.64 * Math.max(0.5, Math.min(1.35, scale));
  const imgRatio = image.width / (image.height || 1);
  let drawW = maxDim;
  let drawH = maxDim;
  if (imgRatio > 1) {
    drawH = maxDim / imgRatio;
  } else {
    drawW = maxDim * imgRatio;
  }

  artCtx.save();
  artCtx.translate(W / 2, H / 2);
  artCtx.rotate((rotation * Math.PI) / 180);

  if (simulateCutout) {
    // Organic wavy cushion mask for rectangular phone photos (pets/people/objects)
    artCtx.beginPath();
    const rx = drawW * 0.46;
    const ry = drawH * 0.46;
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const wobble = 1 + 0.035 * Math.sin(theta * 5) + 0.02 * Math.cos(theta * 3);
      const px = Math.cos(theta) * rx * wobble;
      const py = Math.sin(theta) * ry * wobble;
      if (i === 0) artCtx.moveTo(px, py);
      else artCtx.lineTo(px, py);
    }
    artCtx.closePath();
    artCtx.clip();
  }

  artCtx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  artCtx.restore();

  // 3. Create solid silhouette in the chosen fabric/seam color for the die-cut plush border
  const silCanvas = document.createElement('canvas');
  silCanvas.width = W;
  silCanvas.height = H;
  const silCtx = silCanvas.getContext('2d');
  silCtx.drawImage(artCanvas, 0, 0);
  silCtx.globalCompositeOperation = 'source-in';
  silCtx.fillStyle = bgColor || '#FFFFFF';
  silCtx.fillRect(0, 0, W, H);

  // Create dark outer outline silhouette
  const rimCanvas = document.createElement('canvas');
  rimCanvas.width = W;
  rimCanvas.height = H;
  const rimCtx = rimCanvas.getContext('2d');
  rimCtx.drawImage(artCanvas, 0, 0);
  rimCtx.globalCompositeOperation = 'source-in';
  rimCtx.fillStyle = '#1E1E24';
  rimCtx.fillRect(0, 0, W, H);

  const seamThickness = 18;
  const outlineThickness = seamThickness + 3;
  const angles = 20;

  // 4. Draw 3D Pillow Drop Shadow + Dark Outer Rim
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.32)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 12;
  for (let i = 0; i < angles; i++) {
    const a = (i / angles) * Math.PI * 2;
    ctx.drawImage(
      rimCanvas,
      Math.cos(a) * outlineThickness,
      Math.sin(a) * outlineThickness
    );
  }
  ctx.restore();

  // 5. Draw Plush Die-Cut Fabric Border around the graphic's exact contour
  ctx.save();
  for (let i = 0; i < angles; i++) {
    const a = (i / angles) * Math.PI * 2;
    ctx.drawImage(
      silCanvas,
      Math.cos(a) * seamThickness,
      Math.sin(a) * seamThickness
    );
  }
  ctx.drawImage(silCanvas, 0, 0);
  ctx.restore();

  // 6. Draw Front/Back Artwork inside the Die-Cut Pillow
  if (side === 'front' || backMode === 'match') {
    ctx.save();
    if (side === 'back' && backMode === 'match') {
      // Mirror horizontally on backside so it matches the front contour
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(artCanvas, 0, 0);
    ctx.restore();
  }

  // 7. Top-Left "Contour Cutout Preview" Badge on Canvas
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.beginPath();
  ctx.roundRect(14, 14, 195, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`✂️ ${sizeLabel.split('(')[0].trim()}`, 26, 32);
  ctx.restore();
}

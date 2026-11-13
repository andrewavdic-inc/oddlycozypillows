export function renderCustomProduct({
  canvas,
  image,
  mode = 'centered',
  bgColor = '#FFFFFF',
  productType = 'pillow',
  widthIn = 16,
  heightIn = 16,
  chaosSeed = 42,
  customConfig = { x: 0.5, y: 0.5, scale: 1, gridCount: 1, rotation: 0 },
}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // 1. Fabric Background Color
  ctx.fillStyle = bgColor || '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Draw product pillow/blanket mock contour shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.beginPath();
  ctx.roundRect(16, 16, W - 32, H - 32, 36);
  ctx.fill();
  ctx.restore();

  if (!image) return;

  ctx.save();
  const scale = customConfig.scale || 1;
  const rot = (customConfig.rotation || 0) * (Math.PI / 180);

  if (mode === 'centered') {
    const sz = W * 0.52 * scale;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(rot);
    ctx.drawImage(image, -sz / 2, -sz / 2, sz, sz);
  } else if (mode === 'stretched') {
    ctx.drawImage(image, 16, 16, W - 32, H - 32);
  } else if (mode === 'checkered' || mode === 'chaotic' || mode === 'custom') {
    const grid = customConfig.gridCount || 3;
    const cellW = W / grid;
    const cellH = H / grid;
    for (let gx = 0; gx < grid; gx++) {
      for (let gy = 0; gy < grid; gy++) {
        ctx.save();
        ctx.translate(gx * cellW + cellW / 2, gy * cellH + cellH / 2);
        ctx.rotate(rot);
        const pSz = cellW * 0.82 * scale;
        ctx.drawImage(image, -pSz / 2, -pSz / 2, pSz, pSz);
        ctx.restore();
      }
    }
  } else {
    const sz = W * 0.5 * scale;
    ctx.drawImage(image, W / 2 - sz / 2, H / 2 - sz / 2, sz, sz);
  }
  ctx.restore();
}
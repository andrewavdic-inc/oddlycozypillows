import React, { useEffect, useState } from 'react';
import { RotateCcw, Shuffle, Move } from 'lucide-react';
import { renderProductPreview } from '../../utils/patternRenderer';
import { soundFX } from '../../utils/soundEffects';

export default function LivePreviewCanvas({
  canvasRef,
  productType,
  sizeSpec,
  bgColor,
  mode,
  printSourceUrl,
  fallbackUrl,
  chaosSeed,
  onReshuffleChaos,
  customConfig,
  setCustomConfig,
  side,
  setSide,
  backMode,
}) {
  const [loadedImg, setLoadedImg] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load selected transparent PNG (or user-uploaded image) into an HTMLImageElement
  useEffect(() => {
    if (!printSourceUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedImg(img);
    img.onerror = () => {
      if (fallbackUrl && fallbackUrl !== printSourceUrl) {
        const fb = new Image();
        fb.crossOrigin = 'anonymous';
        fb.onload = () => setLoadedImg(fb);
        fb.src = fallbackUrl;
      }
    };
    img.src = printSourceUrl;
  }, [printSourceUrl, fallbackUrl]);

  // Redraw canvas whenever any customization parameter changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    renderProductPreview({
      ctx,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      productType,
      sizeSpec,
      bgColor,
      mode,
      imageElement: loadedImg,
      chaosSeed,
      customConfig,
      side,
      backMode,
    });
  }, [
    canvasRef,
    productType,
    sizeSpec,
    bgColor,
    mode,
    loadedImg,
    chaosSeed,
    customConfig,
    side,
    backMode,
  ]);

  const handlePointerMove = (e) => {
    if (!isDragging || mode !== 'custom' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const normX = Math.max(0.1, Math.min(0.9, (clientX - rect.left) / rect.width));
    const normY = Math.max(0.1, Math.min(0.9, (clientY - rect.top) / rect.height));
    setCustomConfig((prev) => ({ ...prev, x: normX, y: normY }));
  };

  return (
    <div className="flex flex-col items-center">
      {/* Front / Back Side Switcher */}
      <div className="flex items-center gap-2 mb-3">
        {['front', 'back'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              soundFX.playPop();
              setSide(s);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border-2 border-slate-900 transition-all ${
              side === s
                ? 'bg-slate-900 text-amber-300 shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {s} Side Preview
          </button>
        ))}

        {mode === 'chaotic' && (
          <button
            type="button"
            onClick={() => {
              soundFX.playBoing();
              onReshuffleChaos();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-pink-500 text-white text-xs font-extrabold border-2 border-slate-900 shadow"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle Chaos
          </button>
        )}
      </div>

      {/* Interactive HTML5 Canvas */}
      <div className="relative bg-slate-100 rounded-3xl border-4 border-slate-900 shadow-inner p-2">
        <canvas
          ref={canvasRef}
          width={420}
          height={420}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handlePointerMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handlePointerMove}
          className={`w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] ${
            mode === 'custom' ? 'cursor-move' : 'cursor-default'
          }`}
        />

        {mode === 'custom' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/85 text-white text-[11px] font-bold flex items-center gap-1 pointer-events-none">
            <Move className="w-3 h-3 text-amber-300" />
            Drag directly on the {productType} to position print!
          </div>
        )}
      </div>

      {/* Custom Mode Sliders */}
      {mode === 'custom' && (
        <div className="mt-3 w-full bg-amber-50 p-3.5 rounded-2xl border-2 border-slate-900 grid grid-cols-3 gap-3 text-xs font-bold">
          <div>
            <label className="block text-slate-600 mb-1">Scale ({customConfig.scale.toFixed(1)}x)</label>
            <input
              type="range"
              min="0.3"
              max="2.2"
              step="0.1"
              value={customConfig.scale}
              onChange={(e) =>
                setCustomConfig((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
              }
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Repeat ({customConfig.gridCount}×{customConfig.gridCount})</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={customConfig.gridCount}
              onChange={(e) =>
                setCustomConfig((prev) => ({ ...prev, gridCount: parseInt(e.target.value, 10) }))
              }
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Rotate ({customConfig.rotation}°)</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={customConfig.rotation}
              onChange={(e) =>
                setCustomConfig((prev) => ({ ...prev, rotation: parseInt(e.target.value, 10) }))
              }
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

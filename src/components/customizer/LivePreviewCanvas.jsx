import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, RotateCw, ZoomIn, Grid, Sparkles } from 'lucide-react';
import { renderCustomProduct } from '../../utils/patternRenderer';
import { renderContourPillow } from '../../utils/contourPreview';

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
  simulateCutout = false,
}) {
  const [loadedImg, setLoadedImg] = useState(null);
  const isDraggingRef = useRef(false);

  const isCustomShape = productType === 'custom-shape';

  // Load selected transparent PNG or user uploaded image
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (active) setLoadedImg(img);
    };
    img.onerror = () => {
      if (fallbackUrl && img.src !== window.location.origin + fallbackUrl) {
        const fb = new Image();
        fb.crossOrigin = 'anonymous';
        fb.onload = () => {
          if (active) setLoadedImg(fb);
        };
        fb.src = fallbackUrl;
      }
    };
    img.src = printSourceUrl || fallbackUrl;
    return () => {
      active = false;
    };
  }, [printSourceUrl, fallbackUrl]);

  // Redraw canvas whenever any parameter changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isCustomShape) {
      renderContourPillow({
        canvas,
        image: loadedImg,
        bgColor,
        side,
        backMode,
        scale: customConfig?.scale || 1,
        rotation: customConfig?.rotation || 0,
        simulateCutout,
        sizeLabel: sizeSpec?.label || '18" Custom Shape',
      });
    } else {
      const effectiveMode = side === 'back' && backMode === 'blank' ? 'blank' : mode;
      renderCustomProduct({
        canvas,
        image: effectiveMode === 'blank' ? null : loadedImg,
        mode: effectiveMode === 'blank' ? 'centered' : effectiveMode,
        bgColor,
        productType,
        widthIn: sizeSpec?.widthIn || 16,
        heightIn: sizeSpec?.heightIn || 16,
        chaosSeed,
        customConfig,
      });
    }
  }, [
    canvasRef,
    loadedImg,
    mode,
    bgColor,
    productType,
    isCustomShape,
    sizeSpec,
    chaosSeed,
    customConfig,
    side,
    backMode,
    simulateCutout,
  ]);

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || isCustomShape || mode !== 'custom') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const normX = Math.max(0.1, Math.min(0.9, (clientX - rect.left) / rect.width));
    const normY = Math.max(0.1, Math.min(0.9, (clientY - rect.top) / rect.height));
    setCustomConfig((prev) => ({ ...prev, x: normX, y: normY }));
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Front / Back Toggle Pills */}
      <div className="flex items-center gap-2 mb-3">
        {['front', 'back'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border-2 border-slate-900 transition-all ${
              side === s
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {s} Side Preview
          </button>
        ))}
      </div>

      {/* Interactive Canvas Frame */}
      <div className="relative bg-white p-3 rounded-3xl border-4 border-slate-900 shadow-[0_8px_0_#1E1E24]">
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          onMouseDown={() => {
            isDraggingRef.current = true;
          }}
          onMouseUp={() => {
            isDraggingRef.current = false;
          }}
          onMouseLeave={() => {
            isDraggingRef.current = false;
          }}
          onMouseMove={handlePointerMove}
          onTouchStart={() => {
            isDraggingRef.current = true;
          }}
          onTouchEnd={() => {
            isDraggingRef.current = false;
          }}
          onTouchMove={handlePointerMove}
          className={`w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-2xl ${
            !isCustomShape && mode === 'custom' ? 'cursor-move' : 'cursor-default'
          }`}
        />

        {!isCustomShape && mode === 'chaotic' && (
          <button
            type="button"
            onClick={onReshuffleChaos}
            className="absolute bottom-5 right-5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Shuffle Chaos
          </button>
        )}
      </div>

      {/* Scale & Rotation Controls for Custom-Shaped Pillows OR Custom Mode */}
      {(isCustomShape || mode === 'custom') && (
        <div className="mt-4 w-full bg-amber-50 p-3.5 rounded-2xl border-2 border-slate-900 space-y-2.5 text-xs">
          <div className="font-extrabold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FF595E]" />
              {isCustomShape
                ? 'Adjust Cutout Zoom & Tilt Angle'
                : 'Drag Graphic on Pillow to Position!'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5" /> Zoom ({customConfig.scale.toFixed(1)}x)
              </span>
              <input
                type="range"
                min="0.6"
                max="1.35"
                step="0.05"
                value={customConfig.scale}
                onChange={(e) =>
                  setCustomConfig((p) => ({ ...p, scale: parseFloat(e.target.value) }))
                }
                className="accent-rose-500"
              />
            </label>

            <label className="flex flex-col gap-1 font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Tilt ({customConfig.rotation}°)
              </span>
              <input
                type="range"
                min="-45"
                max="45"
                step="5"
                value={customConfig.rotation}
                onChange={(e) =>
                  setCustomConfig((p) => ({ ...p, rotation: parseInt(e.target.value, 10) }))
                }
                className="accent-rose-500"
              />
            </label>

            {!isCustomShape && (
              <label className="col-span-2 flex flex-col gap-1 font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5" /> Repeat Grid ({customConfig.gridCount}×{customConfig.gridCount})
                </span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={customConfig.gridCount}
                  onChange={(e) =>
                    setCustomConfig((p) => ({
                      ...p,
                      gridCount: parseInt(e.target.value, 10),
                    }))
                  }
                  className="accent-rose-500"
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

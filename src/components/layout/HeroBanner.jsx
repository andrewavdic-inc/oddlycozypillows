import React, { useState, useRef } from 'react';
import { Lightbulb, Flashlight, Wand2, Eye, EyeOff } from 'lucide-react';
import StuffingMascot from '../interactive/StuffingMascot';
import { resolveBannerImage, resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function HeroBanner({ onOpenCustomizer }) {
  const [isFullyLit, setIsFullyLit] = useState(false);
  const [hideOverlayText, setHideOverlayText] = useState(false);
  const [beamRadius, setBeamRadius] = useState(190);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50, isPixels: false });
  const containerRef = useRef(null);

  const bannerSrc = resolveBannerImage();
  const whiteLogoUrl = resolveLogoVariant({ theme: 'white', blink: false, withUrl: true });

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setCursorPos({
      x: clientX - rect.left,
      y: clientY - rect.top,
      isPixels: true,
    });
  };

  const toggleFullLight = () => {
    soundFX.playSparkleChime();
    setIsFullyLit((prev) => !prev);
  };

  const xCoord = cursorPos.isPixels ? `${cursorPos.x}px` : `${cursorPos.x}%`;
  const yCoord = cursorPos.isPixels ? `${cursorPos.y}px` : `${cursorPos.y}%`;

  return (
    <section id="top" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        className="relative rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-[0_12px_0_#1E1E24] bg-slate-950 cursor-crosshair select-none"
      >
        {/* Full Un-Zoomed Room Banner Image so every pillow & toy is discoverable */}
        <img
          src={bannerSrc}
          onError={(e) => {
            e.currentTarget.src = '/website-banner.png';
          }}
          alt="Oddly Cozy Pillows Room Full of Pillows and Toys"
          className="w-full h-auto max-h-[760px] object-contain mx-auto block select-none pointer-events-none"
        />

        {/* Interactive Darkness + Flashlight Illumination Mask */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isFullyLit ? 0.05 : 1,
            background: `radial-gradient(circle ${beamRadius}px at ${xCoord} ${yCoord}, rgba(255, 250, 220, 0.02) 0%, rgba(15, 23, 42, 0.55) 58%, rgba(8, 10, 18, 0.94) 100%)`,
          }}
        />

        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-amber-300 border-2 border-amber-400 text-xs font-bold shadow-lg backdrop-blur-md">
            <Flashlight className="w-4 h-4 animate-pulse" />
            <span>
              {isFullyLit
                ? 'Room Lights On! Dim lights to hunt for pillows & toys with your flashlight.'
                : 'Shine your flashlight around the room to spot all the pillows & toys!'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isFullyLit && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 text-white border border-white/20 text-xs font-bold">
                <span>Flashlight Size:</span>
                <input
                  type="range"
                  min="110"
                  max="380"
                  value={beamRadius}
                  onChange={(e) => setBeamRadius(Number(e.target.value))}
                  className="w-20 accent-amber-400 cursor-pointer"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setHideOverlayText((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white border-2 border-white/40 text-xs font-extrabold hover:bg-slate-800 transition-all"
            >
              {hideOverlayText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {hideOverlayText ? 'Show Banner Info' : 'Hide Text to Explore Room'}
            </button>

            <button
              type="button"
              onClick={toggleFullLight}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] transition-all ${
                isFullyLit
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-white text-slate-900 hover:bg-amber-300'
              }`}
            >
              <Lightbulb className={`w-4 h-4 ${isFullyLit ? 'fill-slate-900' : ''}`} />
              {isFullyLit ? 'Dim Room Lights' : 'Turn On Room Lights'}
            </button>
          </div>
        </div>

        {/* Compact Bottom Overlay so the room stays wide open for the flashlight game */}
        {!hideOverlayText && (
          <div className="relative sm:absolute sm:bottom-4 sm:left-4 sm:right-4 z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 p-4 sm:p-0 pointer-events-none">
            <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md p-5 rounded-3xl border-2 border-white/25 text-white shadow-2xl max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={whiteLogoUrl}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  alt="Oddly Cozy Pillows White Logo"
                  className="h-8 object-contain"
                />
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF595E] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  Oddly Themed & Oddly Shaped
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-bold leading-tight">
                Pillows That Make Your Room{' '}
                <span className="text-[#FFCA3A] underline decoration-wavy decoration-[#FF595E]">
                  Way More Fun.
                </span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                Buy our signature graphic pillows & blankets in 1 click, customize sizes and patterns in real time, or snuggle up with giant 3D plushies!
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <a
                  href="#printed-pillows"
                  onClick={() => soundFX.playPop()}
                  className="px-5 py-2.5 rounded-full bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] transition-transform hover:-translate-y-0.5"
                >
                  Shop Printed Pillows
                </a>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playBoing();
                    onOpenCustomizer();
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FFCA3A] hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] transition-transform hover:-translate-y-0.5"
                >
                  <Wand2 className="w-4 h-4" />
                  Interactive Pillow Customizer
                </button>
              </div>
            </div>

            <div className="pointer-events-auto">
              <StuffingMascot
                theme="color"
                size="md"
                customQuote="Shine your light around the room! How many pillows & squishies can you spot?"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function StuffingMascot({
  theme = 'color', // 'color' | 'black' | 'white'
  size = 'md',
  showControls = true,
  customQuote = 'Welcome to Oddly Cozy! Click me for a squeak!',
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [useFallbackBlink, setUseFallbackBlink] = useState(false);

  const openLogoSrc = resolveLogoVariant({ theme, blink: false, withUrl: false });
  const blinkLogoSrc = resolveLogoVariant({ theme, blink: true, withUrl: false });

  // Automatic natural blinking loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3000 + Math.random() * 1800);

    return () => clearInterval(interval);
  }, []);

  const handleMascotClick = () => {
    soundFX.playMascotSqueak();
    setIsBlinking(true);
    setIsJumping(true);
    setTimeout(() => setIsBlinking(false), 260);
    setTimeout(() => setIsJumping(false), 480);
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className="relative inline-flex flex-col items-center group select-none">
      {/* Speech Bubble */}
      <div className="mb-2.5 px-3.5 py-2 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-lg border-2 border-slate-900 max-w-[230px] text-center relative animate-float">
        <span>{customQuote}</span>
        <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-slate-900 rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2" />
      </div>

      {/* Mascot Body (Swaps between Open Eyes & Blink Logo Variant) */}
      <div
        onClick={handleMascotClick}
        onMouseEnter={() => {
          setIsBlinking(true);
          soundFX.playMascotBlink();
          setTimeout(() => setIsBlinking(false), 200);
        }}
        role="button"
        tabIndex={0}
        title="Click me to squeak & blink!"
        className={`relative ${sizeClasses[size] || sizeClasses.md} rounded-full bg-white/95 border-4 border-slate-900 shadow-[0_6px_0_#1E1E24] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 ${
          isJumping ? '-translate-y-4 rotate-6' : ''
        }`}
      >
        <img
          src={isBlinking && !useFallbackBlink ? blinkLogoSrc : openLogoSrc}
          onError={(e) => {
            if (isBlinking && !useFallbackBlink) {
              setUseFallbackBlink(true);
            } else {
              e.currentTarget.src = '/logo-full-color.svg';
            }
          }}
          alt="Puff the Pillow Stuffing Mascot"
          className={`w-4/5 h-4/5 object-contain transition-transform duration-150 ${
            isBlinking ? 'scale-y-95' : 'scale-y-100'
          }`}
        />

        {/* Sound Indicator Badge */}
        <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-1 rounded-full border-2 border-slate-900 shadow">
          <Volume2 className="w-3 h-3" />
        </span>
      </div>

      {/* Single Squeak Button (Pose Cycle Button Removed) */}
      {showControls && (
        <div className="mt-2">
          <button
            type="button"
            onClick={handleMascotClick}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-300 text-slate-900 border-2 border-slate-900 text-xs font-extrabold hover:bg-amber-400 transition-colors shadow-[0_2px_0_#1E1E24]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Squeak!
          </button>
        </div>
      )}
    </div>
  );
}

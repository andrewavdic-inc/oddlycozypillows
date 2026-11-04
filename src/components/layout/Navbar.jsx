import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  CloudRain,
  CloudSnow,
  Sun,
  Bird,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

const WEATHER_BUTTONS = [
  { id: 'confetti', label: 'Confetti', icon: Sparkles, color: 'bg-pink-500 text-white' },
  { id: 'sunshine', label: 'Sunshine', icon: Sun, color: 'bg-amber-400 text-slate-900' },
  { id: 'rain', label: 'Rain', icon: CloudRain, color: 'bg-sky-500 text-white' },
  { id: 'snow', label: 'Snow', icon: CloudSnow, color: 'bg-indigo-500 text-white' },
  { id: 'birds', label: 'Birds', icon: Bird, color: 'bg-lime-500 text-slate-900' },
];

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenBlankCustomizer,
  activeWeather,
  setActiveWeather,
  isMuted,
  onToggleMute,
}) {
  const [navBlink, setNavBlink] = useState(false);

  const openColorLogo = resolveLogoVariant({ theme: 'color', blink: false, withUrl: false });
  const blinkColorLogo = resolveLogoVariant({ theme: 'color', blink: true, withUrl: false });

  useEffect(() => {
    const timer = setInterval(() => {
      setNavBlink(true);
      setTimeout(() => setNavBlink(false), 220);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handleWeatherClick = (id) => {
    soundFX.playPop();
    setActiveWeather(activeWeather === id ? 'none' : id);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo: Large Mascot Without Any Box Around Him */}
        <a
          href="#top"
          onClick={() => {
            soundFX.playMascotSqueak();
            setNavBlink(true);
            setTimeout(() => setNavBlink(false), 250);
          }}
          className="flex items-center gap-3 group"
        >
          <img
            src={navBlink ? blinkColorLogo : openColorLogo}
            onError={(e) => {
              e.currentTarget.src = '/logo-full-color.svg';
            }}
            alt="Oddly Cozy Pillows Mascot"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform"
          />
          <div>
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              Oddly Cozy
              <span className="text-[#FF595E]">Pillows</span>
            </span>
            <span className="block text-xs font-bold text-slate-500 -mt-1">
              Custom Pillow Studio & Giant Plushies
            </span>
          </div>
        </a>

        {/* Interactive Weather & Atmosphere Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border-2 border-slate-900 overflow-x-auto max-w-full">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 text-slate-600 hidden md:inline">
            Vibe FX:
          </span>
          {WEATHER_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeWeather === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleWeatherClick(btn.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? `${btn.color} border-2 border-slate-900 shadow-[0_2px_0_#1E1E24] scale-105`
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions: Custom Studio, Sound Mute, Cart */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFX.playBoing();
              onOpenBlankCustomizer();
            }}
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFCA3A] text-slate-900 font-bold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] hover:-translate-y-0.5 transition-transform"
          >
            <Wand2 className="w-4 h-4" />
            Create Your Own Pillow
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Mascot Sounds' : 'Mute Mascot Sounds'}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-slate-900 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              onOpenCart();
            }}
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF595E] text-white font-bold text-sm border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] hover:bg-[#e0484d] transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-white text-slate-900 font-extrabold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

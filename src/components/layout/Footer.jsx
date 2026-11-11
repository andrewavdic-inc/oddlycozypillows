import React, { useState, useEffect } from 'react';
import {
  Lock,
  Sparkles,
  Sun,
  CloudRain,
  CloudSnow,
  Bird,
  Ban,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

const WEATHER_BUTTONS = [
  { id: 'none', label: 'FX Off', icon: Ban, color: 'bg-slate-800 text-white' },
  { id: 'snow', label: 'Winter Snow', icon: CloudSnow, color: 'bg-indigo-500 text-white' },
  { id: 'confetti', label: 'Confetti', icon: Sparkles, color: 'bg-pink-500 text-white' },
  { id: 'sunshine', label: 'Sunshine', icon: Sun, color: 'bg-amber-400 text-slate-900' },
  { id: 'rain', label: 'Cozy Rain', icon: CloudRain, color: 'bg-sky-500 text-white' },
  { id: 'birds', label: 'Birds', icon: Bird, color: 'bg-lime-500 text-slate-900' },
];

export default function Footer({
  onTriggerAdminPin,
  activeWeather,
  setActiveWeather,
  onSelectCategory,
}) {
  const { categories } = useStore();
  const [isBlinking, setIsBlinking] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const colorUrlOpen = resolveLogoVariant({ theme: 'color', blink: false, withUrl: true });
  const colorUrlBlink = resolveLogoVariant({ theme: 'color', blink: true, withUrl: true });
  const blackUrlOpen = resolveLogoVariant({ theme: 'black', blink: false, withUrl: true });
  const blackUrlBlink = resolveLogoVariant({ theme: 'black', blink: true, withUrl: true });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3400);
    return () => clearInterval(interval);
  }, []);

  const handleSecretLogoClick = () => {
    soundFX.playMascotSqueak();
    const next = clickCount + 1;
    if (next >= 3) {
      setClickCount(0);
      onTriggerAdminPin();
    } else {
      setClickCount(next);
      setTimeout(() => setClickCount(0), 1200);
    }
  };

  return (
    <footer className="bg-[#FFF8EC] border-t-4 border-slate-900 py-12 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Vibe FX Atmosphere Controls Bar in Footer */}
        <div className="p-4 rounded-3xl bg-white border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-display text-lg font-bold text-slate-900 block">
              Page Vibe & Weather FX
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Add a little winter snow, confetti, or sunshine while you browse!
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {WEATHER_BUTTONS.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeWeather === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setActiveWeather(btn.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all ${
                    isActive
                      ? `${btn.color} border-2 border-slate-900 shadow-[0_2px_0_#1E1E24] scale-105`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Logos & Category Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap items-center gap-6">
            <img
              src={isBlinking ? colorUrlBlink : colorUrlOpen}
              onClick={handleSecretLogoClick}
              onError={(e) => {
                e.currentTarget.src = '/logo-full-color.svg';
              }}
              title="Triple-click me for Operator Vault"
              alt="oddlycozypillows.com Full Color Logo"
              className="h-20 w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
            />

            <img
              src={isBlinking ? blackUrlBlink : blackUrlOpen}
              onClick={() => soundFX.playMascotSqueak()}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              alt="oddlycozypillows.com Simplified Black Logo"
              className="h-16 w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
            />

            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-2xl font-bold">oddlycozypillows.com</p>
                <button
                  type="button"
                  onClick={onTriggerAdminPin}
                  title="Operator Access"
                  className="opacity-20 hover:opacity-100 p-1 rounded-full text-slate-500 hover:text-slate-900 transition-opacity"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Custom Graphic Pillows, Blankets, Rugs & Giant Plushies • Credit, GPay, PayPal & e-Transfer Accepted.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  onSelectCategory(c);
                }}
                style={{ backgroundColor: c.color, color: c.textColor }}
                className="px-3.5 py-1.5 rounded-full text-xs font-extrabold border-2 border-slate-900 shadow-[0_2px_0_#1E1E24] hover:-translate-y-0.5 transition-transform"
              >
                {c.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

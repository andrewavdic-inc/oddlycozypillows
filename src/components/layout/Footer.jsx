import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function Footer({ onTriggerAdminPin }) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
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
              {/* Hidden Stealth Access Dot for the Store Operator */}
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
            <a
              key={c.id}
              href={`#${c.id}`}
              onClick={() => soundFX.playPop()}
              style={{ backgroundColor: c.color, color: c.textColor }}
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold border-2 border-slate-900 shadow-[0_2px_0_#1E1E24] hover:-translate-y-0.5 transition-transform"
            >
              {c.shortName}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

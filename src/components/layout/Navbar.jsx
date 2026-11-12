import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Wand2,
  Snowflake,
  Flame,
  LayoutGrid,
} from 'lucide-react';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function Navbar({
  cartCount,
  onOpenCart,
  currentPage,
  onNavigateHomeSection,
  onOpenFullCatalog,
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => {
            soundFX.playMascotSqueak();
            setNavBlink(true);
            setTimeout(() => setNavBlink(false), 250);
            onNavigateHomeSection('top');
          }}
          className="flex items-center gap-2.5 group text-left shrink-0"
        >
          <img
            src={navBlink ? blinkColorLogo : openColorLogo}
            onError={(e) => {
              e.currentTarget.src = '/logo-full-color.svg';
            }}
            alt="Oddly Cozy Pillows Mascot"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform"
          />
          <div>
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              Oddly Cozy
              <span className="text-[#FF595E]">Pillows</span>
            </span>
            <span className="hidden sm:block text-[11px] font-bold text-slate-500 -mt-1">
              Custom Pillow Studio & Giant Plushies
            </span>
          </div>
        </button>

        {/* Clean Single-Row Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-full border-2 border-slate-900">
          <button
            type="button"
            onClick={() => onNavigateHomeSection('winter-collection')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-800 hover:bg-sky-500 hover:text-white transition-colors"
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-500" />
            Winter Collection
          </button>

          <button
            type="button"
            onClick={() => onNavigateHomeSection('most-popular')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-800 hover:bg-amber-400 hover:text-slate-900 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Most Popular
          </button>

          <button
            type="button"
            onClick={() => onNavigateHomeSection('customizer-section')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-800 hover:bg-[#FF595E] hover:text-white transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            Custom Pillow Studio
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              onOpenFullCatalog('all');
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
              currentPage === 'catalog'
                ? 'bg-slate-900 text-amber-300 shadow'
                : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Shop All Categories
          </button>
        </nav>

        {/* Compact Cart Button on Far Right (Never Wraps Under Logo) */}
        <button
          type="button"
          onClick={() => {
            soundFX.playPop();
            onOpenCart();
          }}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF595E] text-white font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] hover:bg-[#e0484d] transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-white text-slate-900 font-extrabold">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}

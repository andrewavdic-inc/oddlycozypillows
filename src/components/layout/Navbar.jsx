import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Volume2,
  VolumeX,
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
  onOpenBlankCustomizer,
  currentPage,
  onNavigateHomeSection,
  onOpenFullCatalog,
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => {
            soundFX.playMascotSqueak();
            setNavBlink(true);
            setTimeout(() => setNavBlink(false), 250);
            onNavigateHomeSection('top');
          }}
          className="flex items-center gap-3 group text-left"
        >
          <img
            src={navBlink ? blinkColorLogo : openColorLogo}
            onError={(e) => {
              e.currentTarget.src = '/logo-full-color.svg';
            }}
            alt="Oddly Cozy Pillows Mascot"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform"
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
        </button>

        {/* Standard E-Commerce Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border-2 border-slate-900">
          <button
            type="button"
            onClick={() => onNavigateHomeSection('winter-collection')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-800 hover:bg-sky-500 hover:text-white transition-colors"
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-500 group-hover:text-white" />
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
            onClick={() => onNavigateHomeSection('printed-pillows')}
            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-800 hover:bg-[#FF595E] hover:text-white transition-colors"
          >
            Printed Pillows
          </button>

          <button
            type="button"
            onClick={() => onNavigateHomeSection('oddly-cozy-pillows')}
            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-800 hover:bg-[#FF924C] hover:text-white transition-colors"
          >
            Oddly Cozy Pillows
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
            All 7 Categories
          </button>
        </nav>

        {/* Right Actions: Custom Studio, Sound Mute, Cart */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFX.playBoing();
              onOpenBlankCustomizer();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFCA3A] text-slate-900 font-bold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] hover:-translate-y-0.5 transition-transform"
          >
            <Wand2 className="w-4 h-4" />
            Customize a Pillow
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

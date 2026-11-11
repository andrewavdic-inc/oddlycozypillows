import React, { useState } from 'react';
import { Flashlight, X } from 'lucide-react';
import HeroBanner from '../layout/HeroBanner';
import { soundFX } from '../../utils/soundEffects';

export default function FlashlightGameModal({ onOpenCustomizer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Flashlight Icon Button at the Bottom of the Screen */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => {
            soundFX.playSparkleChime();
            setIsOpen(true);
          }}
          title="Play the Cozy Room Flashlight Game!"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 border-3 border-amber-400 shadow-[0_6px_0_#1E1E24] transition-all hover:-translate-y-1"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Flashlight className="w-4 h-4 fill-slate-900" />
          </div>
          <span className="font-display font-bold text-xs sm:text-sm text-white pr-1">
            Flashlight Game
          </span>
        </button>
      </div>

      {/* Modal Housing the Interactive Flashlight Room */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative max-w-6xl w-full my-auto">
            <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-3 rounded-t-3xl border-x-4 border-t-4 border-amber-400">
              <div className="flex items-center gap-2">
                <Flashlight className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="font-display font-bold text-lg">
                  Secret Cozy Room Flashlight Hunt
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Close Game
              </button>
            </div>

            <div className="bg-slate-950 rounded-b-3xl border-x-4 border-b-4 border-amber-400 p-2">
              <HeroBanner
                onOpenCustomizer={() => {
                  setIsOpen(false);
                  onOpenCustomizer();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
import { CATEGORIES } from '../../config/themeColors';
import { soundFX } from '../../utils/soundEffects';

export default function CategoryBubbles() {
  const handleJump = (id) => {
    soundFX.playPop();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="text-center mb-5">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
          7 Color-Coded Cozy Worlds
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Pick a Category to Jump Straight In
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleJump(cat.id)}
            style={{ backgroundColor: cat.color, color: cat.textColor }}
            className="group relative flex flex-col items-center justify-between p-4 rounded-3xl border-4 border-slate-900 shadow-[0_6px_0_#1E1E24] hover:-translate-y-1.5 active:translate-y-0 transition-all cursor-pointer"
          >
            {/* Big Icon Directly on Button (No Inner Circle or Square) */}
            <img
              src={cat.textColor === '#FFFFFF' ? cat.iconWhite : cat.iconColor}
              onError={(e) => {
                e.currentTarget.src = cat.iconColor;
              }}
              alt={cat.name}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain my-1 group-hover:scale-110 group-hover:rotate-6 transition-transform drop-shadow-md"
            />

            <div className="flex flex-col items-center mt-2">
              <span className="font-display font-bold text-sm sm:text-base text-center leading-tight">
                {cat.shortName}
              </span>

              <span className="mt-1.5 text-[10px] font-extrabold uppercase tracking-wider opacity-90 px-2.5 py-0.5 rounded-full bg-black/15">
                {cat.customizable ? '1-Click + Custom' : '1-Click Buy'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

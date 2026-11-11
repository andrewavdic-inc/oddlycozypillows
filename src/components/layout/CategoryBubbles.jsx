import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { resolveButtonImage } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

function CategoryPngButton({ category, index, onSelect }) {
  const resolvedPrimary = resolveButtonImage(category.buttonBaseName, category.buttonPng);
  const [imgSrc, setImgSrc] = useState(resolvedPrimary);
  const [fallbackStage, setFallbackStage] = useState(0);

  const handleImgError = () => {
    if (fallbackStage === 0) {
      setFallbackStage(1);
      setImgSrc(category.buttonFallback || `/${category.buttonBaseName}.jpg`);
    } else if (fallbackStage === 1) {
      setFallbackStage(2);
      setImgSrc(category.iconColor);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        soundFX.playPop();
        onSelect(category);
      }}
      className="group flex flex-col items-center justify-center p-2 bg-transparent border-0 outline-none focus:outline-none cursor-pointer select-none transition-transform duration-300 hover:scale-110"
    >
      <div
        style={{ animationDelay: `${index * 0.22}s` }}
        className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center animate-rock-slow group-hover:animate-wiggle"
      >
        <img
          src={imgSrc}
          onError={handleImgError}
          alt={category.name}
          className="w-full h-full object-contain drop-shadow-[0_10px_12px_rgba(15,23,42,0.22)] transition-transform duration-300"
        />
      </div>

      <span className="mt-2 font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#FF595E] transition-colors text-center leading-tight">
        {category.shortName}
      </span>
    </button>
  );
}

export default function CategoryBubbles({ onSelectCategory }) {
  const { categories } = useStore();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      <div className="text-center mb-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Shop By Category
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 items-center justify-items-center">
        {categories.map((cat, idx) => (
          <CategoryPngButton
            key={cat.id}
            category={cat}
            index={idx}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { resolveButtonImage } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

const SHOP_ALL_BUTTON = {
  id: 'all',
  name: 'Shop All Categories',
  shortName: 'Shop All Categories',
  buttonBaseName: 'allcategories_button',
  buttonPng: '/allcategories_button.png',
  buttonFallback: '/allcategories_button.jpg',
  iconColor: '/icons/pillows-sparkle.svg',
  isAllButton: true,
};

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
      className="group flex flex-col items-center justify-center p-1 bg-transparent border-0 outline-none focus:outline-none cursor-pointer select-none transition-transform duration-300 hover:scale-105"
    >
      <div
        style={{ animationDelay: `${index * 0.2}s` }}
        className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center animate-rock-slow group-hover:animate-wiggle -my-1"
      >
        <img
          src={imgSrc}
          onError={handleImgError}
          alt={category.name}
          className="w-full h-full object-contain drop-shadow-[0_8px_10px_rgba(15,23,42,0.22)] transition-transform duration-300"
        />
      </div>

      <span className="mt-0.5 font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#FF595E] transition-colors text-center leading-tight">
        {category.shortName}
      </span>
    </button>
  );
}

export default function CategoryBubbles({ onSelectCategory }) {
  const { categories } = useStore();
  const allButtons = [...categories, SHOP_ALL_BUTTON];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 items-center justify-items-center">
        {allButtons.map((cat, idx) => (
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

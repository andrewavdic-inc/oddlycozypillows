import React, { useState, useEffect } from 'react';
import { ShoppingBag, Wand2, Maximize2 } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function ProductCard({
  product,
  categoryColor,
  onBuyAsShown,
  onCustomizeProduct,
  onInspectProduct,
}) {
  const [imgSrc, setImgSrc] = useState(product.image);

  useEffect(() => {
    setImgSrc(product.image);
  }, [product.image]);

  const handleOneClickBuy = (e) => {
    e.stopPropagation();
    soundFX.playSparkleChime();
    onBuyAsShown(product);
  };

  const handleCustomizeClick = (e) => {
    e.stopPropagation();
    soundFX.playBoing();
    onCustomizeProduct(product);
  };

  return (
    <div className="bg-white text-slate-900 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
      {/* Clickable Product Image -> Opens Frameless Lightbox */}
      <div
        onClick={() => {
          soundFX.playPop();
          onInspectProduct?.(product);
        }}
        role="button"
        tabIndex={0}
        title="Click to view full photo & details"
        className="relative h-64 bg-slate-100 overflow-hidden group cursor-zoom-in"
      >
        <img
          src={imgSrc}
          onError={() => {
            if (product.fallbackImage && imgSrc !== product.fallbackImage) {
              setImgSrc(product.fallbackImage);
            }
          }}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top-Left Badge */}
        {product.badge && (
          <span
            style={{ backgroundColor: categoryColor || '#FF595E' }}
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold text-white shadow-md"
          >
            {product.badge}
          </span>
        )}

        {/* Subtle Expand Photo Cue on Hover */}
        <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/65 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
          <Maximize2 className="w-4 h-4" />
        </span>

        {/* Price Pill */}
        <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-sm text-amber-300 font-display text-base font-bold shadow-md">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>

      {/* Compact Title & Small Round Buttons (No Description Clutter) */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
            {product.subtitle}
          </p>
          <h3
            onClick={() => onInspectProduct?.(product)}
            className="font-display text-lg font-bold text-slate-900 leading-snug line-clamp-1 cursor-pointer hover:text-[#FF595E] transition-colors"
          >
            {product.name}
          </h3>
        </div>

        {/* Small Round Pill Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleOneClickBuy}
            className="px-4 py-2 rounded-full bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] inline-flex items-center justify-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buy</span>
          </button>

          {product.customizable && (
            <button
              type="button"
              onClick={handleCustomizeClick}
              className="px-3.5 py-2 rounded-full bg-[#FFCA3A] hover:bg-amber-300 text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] inline-flex items-center justify-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Customize this</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

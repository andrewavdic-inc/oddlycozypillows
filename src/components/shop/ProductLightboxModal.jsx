import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Wand2 } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function ProductLightboxModal({
  product,
  onClose,
  onBuyAsShown,
  onCustomizeProduct,
}) {
  const [imgSrc, setImgSrc] = useState(product?.image || '');

  useEffect(() => {
    if (product) {
      setImgSrc(product.image || product.fallbackImage);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      {/* Frameless Photo Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full rounded-[2rem] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.75)] bg-slate-950 select-none"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundFX.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/35 hover:bg-rose-500 text-white flex items-center justify-center transition-colors"
          title="Close photo (Esc)"
        >
          <X className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
        </button>

        {/* Floating Text-Only Price (No Black Rectangle) */}
        <div className="absolute top-4 left-5 z-20 pointer-events-none text-amber-300 font-display text-2xl sm:text-3xl font-bold [text-shadow:_0_2px_8px_rgba(0,0,0,0.95),_0_1px_3px_rgba(0,0,0,1)]">
          ${Number(product.price).toFixed(2)}
        </div>

        {/* Large Frameless Product Image */}
        <img
          src={imgSrc}
          onError={() => {
            if (product.fallbackImage && imgSrc !== product.fallbackImage) {
              setImgSrc(product.fallbackImage);
            }
          }}
          alt={product.name}
          className="w-full max-h-[84vh] object-contain mx-auto block"
        />

        {/* Floating Text-Only Description & Compact Action Buttons (No Black Box) */}
        <div className="absolute inset-x-4 bottom-3 sm:inset-x-6 sm:bottom-5 z-20 pointer-events-none flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div className="space-y-0.5 max-w-lg text-white [text-shadow:_0_2px_10px_rgba(0,0,0,0.95),_0_1px_3px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 block">
              {product.subtitle}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs sm:text-sm text-white font-semibold leading-snug pt-0.5">
                {product.description}
              </p>
            )}
          </div>

          {/* Compact Round Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-2 shrink-0 self-end">
            {product.customizable && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playBoing();
                  onClose();
                  onCustomizeProduct(product);
                }}
                className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Customize this</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundFX.playSparkleChime();
                onClose();
                onBuyAsShown(product);
              }}
              className="px-5 py-2 rounded-full bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ShoppingBag, Wand2, Check, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function ProductCard({
  product,
  categoryColor,
  onBuyAsShown,
  onCustomizeProduct,
}) {
  const [imgSrc, setImgSrc] = useState(product.image);
  const [justAdded, setJustAdded] = useState(false);

  const handleOneClickBuy = () => {
    soundFX.playSparkleChime();
    onBuyAsShown(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="bg-white text-slate-900 rounded-3xl border-4 border-slate-900 shadow-[0_8px_0_#1E1E24] overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1.5">
      <div>
        {/* Product Image Container */}
        <div className="relative h-60 bg-slate-100 border-b-4 border-slate-900 overflow-hidden group">
          <img
            src={imgSrc}
            onError={() => {
              if (imgSrc !== product.fallbackImage) {
                setImgSrc(product.fallbackImage);
              }
            }}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 p-2 rounded-2xl"
          />

          {/* Top-Left Badge */}
          {product.badge && (
            <span
              style={{ backgroundColor: categoryColor }}
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold text-white border-2 border-slate-900 shadow"
            >
              {product.badge}
            </span>
          )}

          {/* Price Pill */}
          <span className="absolute bottom-3 right-3 px-3.5 py-1 rounded-full bg-slate-900 text-amber-300 font-display text-lg font-bold border-2 border-white shadow-md">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Product Details */}
        <div className="p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            {product.subtitle}
          </p>
          <h3 className="font-display text-xl font-bold text-slate-900 mt-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Action Buttons: 1-Click Buy As Shown + Conditional Customize */}
      <div className="px-5 pb-5 pt-2 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleOneClickBuy}
          className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] flex items-center justify-center gap-2 transition-all ${
            justAdded
              ? 'bg-emerald-500 text-white'
              : 'bg-[#FF595E] hover:bg-[#e0484d] text-white active:translate-y-0.5'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added As Shown!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              1-Click Buy As Shown (${product.price.toFixed(2)})
            </>
          )}
        </button>

        {product.customizable && (
          <button
            type="button"
            onClick={() => {
              soundFX.playBoing();
              onCustomizeProduct(product);
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#FFCA3A] hover:bg-amber-300 text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] flex items-center justify-center gap-1.5 transition-all"
          >
            <Wand2 className="w-4 h-4" />
            Customize Size, Layout or Upload PNG
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

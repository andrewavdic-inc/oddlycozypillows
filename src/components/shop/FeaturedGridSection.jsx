import React from 'react';
import { Snowflake, Flame, Wand2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { soundFX } from '../../utils/soundEffects';

export default function FeaturedGridSection({
  id,
  theme = 'winter',
  title,
  subtitle,
  products,
  onBuyAsShown,
  onCustomizeProduct,
  onInspectProduct,
  onOpenCustomizer,
}) {
  const isWinter = theme === 'winter';

  return (
    <section
      id={id}
      className={`py-14 sm:py-16 border-t-4 border-slate-900 ${
        isWinter
          ? 'bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#FFFDF9] text-slate-900'
          : 'bg-[#FFF8EC] text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider mb-3 shadow">
            {isWinter ? (
              <>
                <Snowflake className="w-4 h-4 text-sky-300" />
                <span>Holiday & Winter Gift Guide • 8 Featured Picks</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Customer Bestsellers • Top 8 Favorites</span>
              </>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl font-medium">
            {subtitle}
          </p>

          {isWinter && onOpenCustomizer && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  soundFX.playBoing();
                  onOpenCustomizer();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] transition-transform hover:-translate-y-0.5"
              >
                <Wand2 className="w-4 h-4" />
                Design a Custom Holiday Pillow or Blanket
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryColor={isWinter ? '#0284C7' : '#FF595E'}
              onBuyAsShown={onBuyAsShown}
              onCustomizeProduct={onCustomizeProduct}
              onInspectProduct={onInspectProduct}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

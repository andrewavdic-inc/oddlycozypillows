import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import CategoryBubbles from '../layout/CategoryBubbles';
import CategorySection from './CategorySection';
import CustomOrderSection from './CustomOrderSection';
import { soundFX } from '../../utils/soundEffects';

export default function FullCatalogPage({
  initialCategoryId = 'all',
  onBackToHome,
  onBuyAsShown,
  onCustomizeProduct,
  onOpenUploadCustomizer,
  onAddCustomRequestToCart,
}) {
  const { categories, products } = useStore();

  useEffect(() => {
    if (initialCategoryId && initialCategoryId !== 'all') {
      setTimeout(() => {
        const el = document.getElementById(initialCategoryId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialCategoryId]);

  const handleJumpInCatalog = (cat) => {
    const el = document.getElementById(cat.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* Top Sub-Header Banner */}
      <div className="bg-slate-900 text-white py-8 border-b-4 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                onBackToHome();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#FF595E] hover:bg-amber-300 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Main Winter Showcase
            </button>
            <h1 className="font-display text-3xl sm:text-5xl font-bold flex items-center gap-2">
              All 7 Oddly Cozy Categories
              <Sparkles className="w-7 h-7 text-amber-300" />
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Browse our complete collection of Printed Pillows, Giant Plushies, Blankets, Matching Sets, Rugs, Squishies & Custom Orders.
            </p>
          </div>
        </div>
      </div>

      {/* Rotating PNG Category Jump Buttons */}
      <CategoryBubbles onSelectCategory={handleJumpInCatalog} />

      {/* All 7 Category Sections */}
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.categoryId === category.id && p.inStock !== false
        );
        return (
          <CategorySection
            key={category.id}
            category={category}
            products={categoryProducts}
            onBuyAsShown={onBuyAsShown}
            onCustomizeProduct={onCustomizeProduct}
            onOpenUploadCustomizer={onOpenUploadCustomizer}
          />
        );
      })}

      {/* Totally Custom Orders Concierge Form */}
      <CustomOrderSection onAddCustomRequestToCart={onAddCustomRequestToCart} />
    </div>
  );
}

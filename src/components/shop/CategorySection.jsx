import React, { useState } from 'react';
import { Upload, Wand2, Scissors } from 'lucide-react';
import ProductCard from './ProductCard';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function CategorySection({
  category,
  products,
  onBuyAsShown,
  onCustomizeProduct,
  onInspectProduct,
  onOpenUploadCustomizer,
}) {
  // Filter for 'printed-pillows': 'all' | 'square' | 'custom-shape'
  const [shapeFilter, setShapeFilter] = useState('all');

  const simplifiedLogoWithUrl = resolveLogoVariant({
    theme: category.logoTheme,
    blink: false,
    withUrl: true,
  });

  const isPillowCat = category.id === 'printed-pillows';
  const customShapeCount = isPillowCat
    ? products.filter((p) => p.isCustomShape || p.productType === 'custom-shape').length
    : 0;

  const filteredProducts = isPillowCat
    ? products.filter((p) => {
        const isShape = Boolean(p.isCustomShape || p.productType === 'custom-shape');
        if (shapeFilter === 'custom-shape') return isShape;
        if (shapeFilter === 'square') return !isShape;
        return true;
      })
    : products;

  return (
    <section
      id={category.id}
      style={{ backgroundColor: category.sectionBg, color: category.textColor }}
      className="relative py-16 sm:py-20 border-t-4 border-slate-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={category.textColor === '#FFFFFF' ? category.iconWhite : category.iconColor}
              onError={(e) => {
                e.currentTarget.src = category.iconColor;
              }}
              alt={category.name}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain shrink-0 drop-shadow-md hover:scale-110 transition-transform"
            />

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                  {category.badge}
                </span>

                <img
                  src={simplifiedLogoWithUrl}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  alt="Oddly Cozy Simplified Logo"
                  className="h-7 object-contain opacity-90"
                />
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
                {category.name}
              </h2>
              <p className="mt-2 text-sm sm:text-base opacity-95 max-w-2xl font-medium">
                {category.description}
              </p>
            </div>
          </div>

          {/* Sub-Filter Pills for Printed Pillows (Square vs Custom-Shaped Cutouts) */}
          {isPillowCat && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/20 p-1.5 rounded-full">
              {[
                { id: 'all', label: `All (${products.length})` },
                { id: 'square', label: `⬜ Classic Square (${products.length - customShapeCount})` },
                { id: 'custom-shape', label: `✂️ Custom-Shaped (${customShapeCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setShapeFilter(tab.id);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                    shapeFilter === tab.id
                      ? 'bg-slate-900 text-amber-300 shadow'
                      : 'bg-white/90 text-slate-900 hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {category.customizable && (
          <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-white text-slate-900 border-4 border-slate-900 shadow-[0_8px_0_#1E1E24] flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: category.color }}
                className="w-14 h-14 rounded-2xl border-2 border-slate-900 flex items-center justify-center text-white shrink-0"
              >
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">
                  {isPillowCat
                    ? 'Want a Custom-Shaped Cutout Pillow or Custom Square Pillow?'
                    : 'Have Your Own Image or Pet Photo? Put It on a Blanket!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  {isPillowCat
                    ? 'Upload any photo of your pet, snack, or artwork! Choose a Classic Square layout OR a ✂️ Custom-Shaped Contour Cutout!'
                    : 'Upload any PNG or JPG in our interactive studio and preview Centered, Checkered, or Chaotic layouts live!'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {isPillowCat && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playBoing();
                    onOpenUploadCustomizer('custom-shape');
                  }}
                  className="px-5 py-3 rounded-full bg-[#FFCA3A] hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <Scissors className="w-4 h-4" />
                  Order Custom-Shaped Pillow
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundFX.playBoing();
                  onOpenUploadCustomizer(category.productType);
                }}
                className="px-5 py-3 rounded-full bg-slate-900 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#FFCA3A] flex items-center gap-2 transition-colors"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                {isPillowCat ? 'Customize Square Pillow' : 'Upload & Customize Blanket'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryColor={category.cardAccent}
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

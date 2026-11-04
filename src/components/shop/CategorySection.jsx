import React from 'react';
import { Upload, Wand2 } from 'lucide-react';
import ProductCard from './ProductCard';
import StuffingMascot from '../interactive/StuffingMascot';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function CategorySection({
  category,
  products,
  onBuyAsShown,
  onCustomizeProduct,
  onOpenUploadCustomizer,
}) {
  const simplifiedLogoWithUrl = resolveLogoVariant({
    theme: category.logoTheme, // 'white' on dark sections, 'black' on yellow/green sections
    blink: false,
    withUrl: true,
  });

  return (
    <section
      id={category.id}
      style={{ backgroundColor: category.sectionBg, color: category.textColor }}
      className="relative py-16 sm:py-20 border-t-4 border-slate-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header + Big Unboxed Icon + Floating Mascot */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Large Unboxed Category Icon */}
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

                {/* Simplified Black/White Logo + URL Badge */}
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

          {/* Floating Puff Mascot (Uses Real Blinking Mascot Logo) */}
          <div className="self-center lg:self-auto">
            <StuffingMascot
              theme={category.logoTheme === 'black' ? 'black' : 'color'}
              size="md"
              showControls={true}
              customQuote={category.quote}
            />
          </div>
        </div>

        {/* Upload Your Own PNG Banner for Printed Pillows & Printed Blankets */}
        {category.customizable && (
          <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-white text-slate-900 border-4 border-slate-900 shadow-[0_8px_0_#1E1E24] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: category.color }}
                className="w-14 h-14 rounded-2xl border-2 border-slate-900 flex items-center justify-center text-white shrink-0"
              >
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">
                  Have Your Own Image or Pet Photo? Put It on a {category.productType === 'pillow' ? 'Pillow' : 'Blanket'}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Upload any PNG or JPG in our interactive studio, preview Centered, Checkered, or Chaotic layouts live, and we’ll custom print it for you!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playBoing();
                onOpenUploadCustomizer(category.productType);
              }}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-rose-600 text-white font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#FFCA3A] flex items-center gap-2 shrink-0 transition-colors"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              Upload & Customize Your Own
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryColor={category.cardAccent}
              onBuyAsShown={onBuyAsShown}
              onCustomizeProduct={onCustomizeProduct}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

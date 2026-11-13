import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Upload,
  Palette,
  Tag,
  DollarSign,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadImageFile } from '../../../services/firebaseClient';

export default function FrontPageCmsTab() {
  const {
    cms,
    updateCms,
    categories,
    updateCategory,
    pillowSizes,
    blanketSizes,
    saveSizePricing,
    promoCodes,
    savePromoCodes,
    resetToFactoryDefaults,
  } = useStore();

  const [newCode, setNewCode] = useState('');
  const [newDiscountVal, setNewDiscountVal] = useState(15);
  const [newDiscountType, setNewDiscountType] = useState('percent');
  const [uploadingCatId, setUploadingCatId] = useState(null);

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newCode) return;
    savePromoCodes([
      ...promoCodes,
      {
        id: `promo-${Date.now()}`,
        code: newCode.toUpperCase().trim(),
        discountType: newDiscountType,
        value: Number(newDiscountVal),
        active: true,
      },
    ]);
    setNewCode('');
  };

  const handleUploadCategoryButtonPng = async (catId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatId(catId);
    try {
      const url = await uploadImageFile(file, 'buttons');
      updateCategory(catId, { buttonPng: url, buttonFallback: url });
    } catch (err) {
      alert('Failed to upload category button PNG.');
    } finally {
      setUploadingCatId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="font-display text-3xl font-bold">
          Front-Page Headlines, Category Buttons & Store Pricing
        </h2>
        <p className="text-sm text-slate-600">
          Every change below automatically syncs to your live storefront and Firebase Cloud.
        </p>
      </div>

      {/* 1. ANNOUNCEMENT BAR & DEFAULT WEATHER VIBE FX */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
        <h3 className="font-display text-xl font-bold">
          1. Announcement Banner & Default Page Weather FX
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={cms.announcementEnabled}
              onChange={(e) => updateCms({ announcementEnabled: e.target.checked })}
              className="w-5 h-5 accent-emerald-600"
            />
            <span className="text-sm font-bold">Show Top Announcement Bar</span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Announcement Bar Text
            </label>
            <input
              type="text"
              value={cms.announcementText || ''}
              onChange={(e) => updateCms({ announcementText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Default Weather FX When Customers Arrive
            </label>
            <select
              value={cms.defaultWeather || 'none'}
              onChange={(e) => updateCms({ defaultWeather: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
            >
              <option value="none">FX Off (Clean Default)</option>
              <option value="snow">❄️ Winter Snow</option>
              <option value="confetti">🎉 Party Confetti</option>
              <option value="sunshine">☀️ Warm Sunshine</option>
              <option value="rain">🌧️ Cozy Rain</option>
              <option value="birds">🐦 Floating Birds</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Announcement Background Color
            </label>
            <input
              type="color"
              value={cms.announcementBg || '#1E1E24'}
              onChange={(e) => updateCms({ announcementBg: e.target.value })}
              className="w-full h-11 rounded-xl border-2 border-slate-900 cursor-pointer p-1 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 2. HOME PAGE SHOWCASE HEADLINES (WINTER & MOST POPULAR) */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
        <h3 className="font-display text-xl font-bold">
          2. Home Page Showcase Headlines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-sky-700 mb-1">
              ❄️ Winter Collection Headline
            </label>
            <input
              type="text"
              value={cms.winterTitle || ''}
              onChange={(e) => updateCms({ winterTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-sky-700 mb-1">
              ❄️ Winter Collection Subtitle
            </label>
            <input
              type="text"
              value={cms.winterSubtitle || ''}
              onChange={(e) => updateCms({ winterSubtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-rose-700 mb-1">
              🔥 Most Popular Headline
            </label>
            <input
              type="text"
              value={cms.popularTitle || ''}
              onChange={(e) => updateCms({ popularTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-rose-700 mb-1">
              🔥 Most Popular Subtitle
            </label>
            <input
              type="text"
              value={cms.popularSubtitle || ''}
              onChange={(e) => updateCms({ popularSubtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. CATEGORY & FLOATING BUTTON PNG MANAGER */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#FF595E]" />
          <div>
            <h3 className="font-display text-xl font-bold">
              3. Category Sections & Floating Button PNGs
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Customize the 7 category labels, background colors, descriptions, or upload a new rotating button PNG.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-900 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={cat.buttonPng}
                    onError={(e) => {
                      e.currentTarget.src = cat.iconColor;
                    }}
                    alt={cat.name}
                    className="w-14 h-14 object-contain drop-shadow bg-white rounded-xl p-1 border border-slate-300"
                  />
                  <div>
                    <input
                      type="text"
                      value={cat.shortName}
                      onChange={(e) =>
                        updateCategory(cat.id, {
                          shortName: e.target.value,
                          name: e.target.value,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-400 font-display font-bold text-sm bg-white"
                    />
                    <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                      ID: {cat.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    title="Section Background Color"
                    value={cat.sectionBg}
                    onChange={(e) =>
                      updateCategory(cat.id, {
                        color: e.target.value,
                        sectionBg: e.target.value,
                      })
                    }
                    className="w-9 h-9 rounded-lg border border-slate-900 cursor-pointer"
                  />

                  <label className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-extrabold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingCatId === cat.id ? '...' : 'PNG'}</span>
                    <input
                      type="file"
                      accept="image/png,image/webp"
                      onChange={(e) => handleUploadCategoryButtonPng(cat.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                rows={2}
                value={cat.description}
                onChange={(e) =>
                  updateCategory(cat.id, { description: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. CUSTOMIZER PILLOW & BLANKET SIZE PRICING MATRIX */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h3 className="font-display text-xl font-bold">
            4. Customizer Pillow & Blanket Size Pricing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-slate-600">
              Printed Pillow Sizes (6 Sizes)
            </h4>
            {pillowSizes.map((sz, idx) => (
              <div
                key={sz.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-300"
              >
                <span className="text-xs font-bold">{sz.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={sz.price}
                    onChange={(e) => {
                      const next = [...pillowSizes];
                      next[idx] = { ...sz, price: Number(e.target.value) };
                      saveSizePricing('pillow', next);
                    }}
                    className="w-20 px-2 py-1 rounded-lg border border-slate-900 text-xs font-extrabold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-slate-600">
              Printed Blanket Sizes (3 Sizes)
            </h4>
            {blanketSizes.map((sz, idx) => (
              <div
                key={sz.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-300"
              >
                <span className="text-xs font-bold">{sz.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={sz.price}
                    onChange={(e) => {
                      const next = [...blanketSizes];
                      next[idx] = { ...sz, price: Number(e.target.value) };
                      saveSizePricing('blanket', next);
                    }}
                    className="w-20 px-2 py-1 rounded-lg border border-slate-900 text-xs font-extrabold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. PROMO CODES & DISCOUNT MANAGER */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-600" />
          <h3 className="font-display text-xl font-bold">5. Promo & Discount Codes</h3>
        </div>

        <form onSubmit={handleAddPromo} className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="CODE (e.g. HOLIDAY20)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="px-3.5 py-2 rounded-xl border-2 border-slate-900 text-xs font-extrabold uppercase"
          />
          <input
            type="number"
            value={newDiscountVal}
            onChange={(e) => setNewDiscountVal(e.target.value)}
            className="w-24 px-3.5 py-2 rounded-xl border-2 border-slate-900 text-xs font-extrabold"
          />
          <select
            value={newDiscountType}
            onChange={(e) => setNewDiscountType(e.target.value)}
            className="px-3.5 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold"
          >
            <option value="percent">% Percent Off</option>
            <option value="fixed">$ Fixed Off</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#8AC926] text-slate-900 font-extrabold text-xs border-2 border-slate-900 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Code
          </button>
        </form>

        <div className="flex flex-wrap gap-2.5">
          {promoCodes.map((p) => (
            <div
              key={p.id}
              className="px-3.5 py-2 rounded-2xl bg-amber-100 border-2 border-slate-900 flex items-center gap-3 text-xs font-extrabold"
            >
              <span>
                {p.code} (
                {p.discountType === 'percent' ? `${p.value}% OFF` : `$${p.value} OFF`})
              </span>
              <button
                type="button"
                onClick={() =>
                  savePromoCodes(promoCodes.filter((c) => c.id !== p.id))
                }
                className="text-rose-600 hover:text-rose-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. SECURITY PIN, E-TRANSFER EMAIL & FACTORY RESET */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Operator Vault PIN
            </label>
            <input
              type="text"
              value={cms.adminPin}
              onChange={(e) => updateCms({ adminPin: e.target.value })}
              className="px-3.5 py-2 rounded-xl border-2 border-slate-900 font-extrabold text-sm w-32"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Interac e-Transfer Destination Email
            </label>
            <input
              type="email"
              value={cms.etransferEmail}
              onChange={(e) => updateCms({ etransferEmail: e.target.value })}
              className="px-3.5 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm w-64"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={resetToFactoryDefaults}
          className="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs border-2 border-rose-800 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Store Data to Factory Defaults
        </button>
      </div>
    </div>
  );
}

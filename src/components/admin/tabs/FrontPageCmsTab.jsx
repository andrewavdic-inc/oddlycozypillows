import React, { useState } from 'react';
import {
  Sparkles,
  Tag,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  Upload,
  LayoutGrid,
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
    customShapeSizes,
    blanketSizes,
    saveSizePricing,
    promoCodes,
    savePromoCodes,
    resetToFactoryDefaults,
  } = useStore();

  const [newCode, setNewCode] = useState('');
  const [newVal, setNewVal] = useState(15);
  const [newType, setNewType] = useState('percent');
  const [uploadingCatId, setUploadingCatId] = useState(null);

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newCode) return;
    savePromoCodes([
      ...promoCodes,
      {
        id: `promo-${Date.now()}`,
        code: newCode.toUpperCase().trim(),
        discountType: newType,
        value: Number(newVal),
        active: true,
      },
    ]);
    setNewCode('');
  };

  const handleSizePriceChange = (type, id, nextPrice) => {
    const list =
      type === 'pillow'
        ? pillowSizes
        : type === 'custom-shape'
        ? customShapeSizes
        : blanketSizes;
    const updated = list.map((s) =>
      s.id === id ? { ...s, price: Number(nextPrice) } : s
    );
    saveSizePricing(type, updated);
  };

  const handleCategoryButtonUpload = async (catId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatId(catId);
    try {
      const url = await uploadImageFile(file, 'buttons');
      updateCategory(catId, { buttonPng: url, buttonFallback: url });
    } catch (err) {
      alert('Could not upload category button PNG.');
    } finally {
      setUploadingCatId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">
            Front-Page CMS, Categories, Pricing & Promo Codes
          </h2>
          <p className="text-sm text-slate-600">
            Customize your Winter & Popular headers, 7 floating category buttons, customizer size pricing, and discount codes!
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all local & cloud customizations back to factory defaults?')) {
              resetToFactoryDefaults();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs border-2 border-rose-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Store to Factory Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Home Page Headlines & Default Vibe FX
          </h3>

          <label className="flex items-center gap-2 text-xs font-extrabold cursor-pointer">
            <input
              type="checkbox"
              checked={cms.announcementEnabled}
              onChange={(e) => updateCms({ announcementEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-600"
            />
            <span>Show Top Announcement Banner</span>
          </label>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
              Top Announcement Text
            </label>
            <input
              type="text"
              value={cms.announcementText || ''}
              onChange={(e) => updateCms({ announcementText: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-900 text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-extrabold uppercase text-sky-700 mb-1">
                ❄️ Winter Section Headline
              </label>
              <input
                type="text"
                value={cms.winterTitle || ''}
                onChange={(e) => updateCms({ winterTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-rose-600 mb-1">
                🔥 Most Popular Headline
              </label>
              <input
                type="text"
                value={cms.popularTitle || ''}
                onChange={(e) => updateCms({ popularTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-sm font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold uppercase text-sky-700 mb-1">
                Winter Section Subtitle
              </label>
              <input
                type="text"
                value={cms.winterSubtitle || ''}
                onChange={(e) => updateCms({ winterSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold uppercase text-rose-600 mb-1">
                Most Popular Subtitle
              </label>
              <input
                type="text"
                value={cms.popularSubtitle || ''}
                onChange={(e) => updateCms({ popularSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                Default Weather FX
              </label>
              <select
                value={cms.defaultWeather || 'none'}
                onChange={(e) => updateCms({ defaultWeather: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold"
              >
                <option value="none">FX Off (Clean)</option>
                <option value="snow">Winter Snow</option>
                <option value="confetti">Party Confetti</option>
                <option value="sunshine">Warm Sunshine</option>
                <option value="rain">Cozy Rain</option>
                <option value="birds">Bluebirds</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                e-Transfer Email
              </label>
              <input
                type="text"
                value={cms.etransferEmail || ''}
                onChange={(e) => updateCms({ etransferEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                Operator PIN
              </label>
              <input
                type="text"
                value={cms.adminPin || '2026'}
                onChange={(e) => updateCms({ adminPin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-extrabold text-rose-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FF595E]" />
            Active Promo & Discount Codes
          </h3>

          <form onSubmit={handleAddPromo} className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="CODE (e.g. HOLIDAY20)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border-2 border-slate-900 text-xs font-extrabold uppercase"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold"
            >
              <option value="percent">% Off</option>
              <option value="fixed">$ Off</option>
            </select>
            <input
              type="number"
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              className="w-20 px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#8AC926] text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_2px_0_#1E1E24] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>

          <div className="space-y-2">
            {promoCodes.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-900 flex items-center justify-between"
              >
                <div>
                  <span className="font-display font-bold text-base text-slate-900">
                    {p.code}
                  </span>
                  <span className="ml-2 px-2.5 py-0.5 rounded-full bg-amber-200 text-slate-900 text-xs font-extrabold">
                    {p.discountType === 'percent' ? `${p.value}% OFF` : `$${p.value} OFF`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    savePromoCodes(promoCodes.filter((item) => item.id !== p.id))
                  }
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category & Floating Button PNG Manager */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-purple-600" />
            7 Categories & Floating Button PNG Manager
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Edit category titles, section background colors, descriptions, or upload a new transparent PNG for any floating category button.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-900 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={cat.buttonPng}
                  onError={(e) => {
                    e.currentTarget.src = cat.iconColor;
                  }}
                  alt={cat.name}
                  className="w-16 h-16 object-contain bg-white rounded-xl border border-slate-300 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cat.shortName}
                      onChange={(e) =>
                        updateCategory(cat.id, {
                          shortName: e.target.value,
                          name: e.target.value,
                        })
                      }
                      className="flex-1 px-2.5 py-1 rounded-lg border border-slate-900 font-bold text-xs"
                    />
                    <input
                      type="color"
                      value={cat.sectionBg || cat.color}
                      onChange={(e) =>
                        updateCategory(cat.id, {
                          color: e.target.value,
                          sectionBg: e.target.value,
                        })
                      }
                      title="Section Background Color"
                      className="w-8 h-7 rounded cursor-pointer border border-slate-900"
                    />
                  </div>

                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-extrabold cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>
                      {uploadingCatId === cat.id
                        ? 'Uploading...'
                        : 'Replace Floating Button PNG'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/webp"
                      onChange={(e) => handleCategoryButtonUpload(cat.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <input
                type="text"
                value={cat.description || ''}
                onChange={(e) =>
                  updateCategory(cat.id, { description: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Customizer Size Pricing Matrix (Square, Custom-Shaped & Blankets) */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
        <h3 className="font-display text-xl font-bold flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#1982C4]" />
          Interactive Customizer Size Pricing Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              ⬜ Square Pillow Sizes (6)
            </h4>
            <div className="space-y-2">
              {pillowSizes.map((sz) => (
                <div
                  key={sz.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-300"
                >
                  <span className="text-xs font-bold">{sz.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={sz.price}
                      onChange={(e) =>
                        handleSizePriceChange('pillow', sz.id, e.target.value)
                      }
                      className="w-20 px-2 py-1 rounded-lg border-2 border-slate-900 text-xs font-extrabold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 mb-2">
              ✂️ Custom-Shaped Sizes (4)
            </h4>
            <div className="space-y-2">
              {customShapeSizes.map((sz) => (
                <div
                  key={sz.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-300"
                >
                  <span className="text-xs font-bold">{sz.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={sz.price}
                      onChange={(e) =>
                        handleSizePriceChange('custom-shape', sz.id, e.target.value)
                      }
                      className="w-20 px-2 py-1 rounded-lg border-2 border-slate-900 text-xs font-extrabold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              🧣 Printed Blanket Sizes (3)
            </h4>
            <div className="space-y-2">
              {blanketSizes.map((sz) => (
                <div
                  key={sz.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-300"
                >
                  <span className="text-xs font-bold">{sz.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={sz.price}
                      onChange={(e) =>
                        handleSizePriceChange('blanket', sz.id, e.target.value)
                      }
                      className="w-20 px-2 py-1 rounded-lg border-2 border-slate-900 text-xs font-extrabold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

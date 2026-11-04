import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export default function FrontPageCmsTab() {
  const {
    cms,
    updateCms,
    categories,
    updateCategory,
    resetToFactoryDefaults,
  } = useStore();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Front-Page Controller & Store Settings</h2>
          <p className="text-sm text-slate-600">
            Every change made here updates your live oddlycozypillows.com front page immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={resetToFactoryDefaults}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-800 text-xs font-extrabold border-2 border-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* Top Announcement Banner & Hero Banner Controls */}
      <div className="bg-white p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex items-center justify-between border-b pb-3">
          <h3 className="font-display text-xl font-bold">Hero Banner & Top Promo Bar</h3>
          <label className="inline-flex items-center gap-2 text-xs font-extrabold cursor-pointer">
            <input
              type="checkbox"
              checked={cms.announcementEnabled}
              onChange={(e) => updateCms({ announcementEnabled: e.target.checked })}
              className="w-4 h-4 accent-rose-500"
            />
            <span>Show Top Promo Bar</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
            Top Promo Bar Text
          </label>
          <input
            type="text"
            value={cms.announcementText}
            onChange={(e) => updateCms({ announcementText: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
            Hero Main Headline
          </label>
          <input
            type="text"
            value={cms.heroHeadline}
            onChange={(e) => updateCms({ heroHeadline: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
            Hero Highlighted Phrase
          </label>
          <input
            type="text"
            value={cms.heroHighlight}
            onChange={(e) => updateCms({ heroHighlight: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
            Default Weather Vibe FX on Load
          </label>
          <select
            value={cms.defaultWeather}
            onChange={(e) => updateCms({ defaultWeather: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
          >
            <option value="confetti">Confetti</option>
            <option value="sunshine">Sunshine</option>
            <option value="rain">Rain</option>
            <option value="snow">Snow</option>
            <option value="birds">Flying Birds</option>
            <option value="none">None (Off)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
            Operator 4-Digit Admin PIN
          </label>
          <input
            type="text"
            maxLength={4}
            value={cms.adminPin}
            onChange={(e) => updateCms({ adminPin: e.target.value.replace(/\D/g, '') })}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-extrabold tracking-widest"
          />
        </div>
      </div>

      {/* 7 Section Color & Copy Customizer */}
      <div className="bg-white p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] space-y-4">
        <h3 className="font-display text-xl font-bold">7 Merchandise Sections (Colors & Titles)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl border-2 border-slate-900 space-y-2.5"
              style={{ backgroundColor: `${cat.sectionBg}18` }}
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-900 font-display font-bold text-sm flex-1 bg-white"
                />
                <input
                  type="color"
                  value={cat.sectionBg}
                  onChange={(e) =>
                    updateCategory(cat.id, {
                      sectionBg: e.target.value,
                      color: e.target.value,
                    })
                  }
                  className="w-10 h-9 rounded-lg border-2 border-slate-900 cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={cat.quote}
                onChange={(e) => updateCategory(cat.id, { quote: e.target.value })}
                placeholder="Section Mascot Speech Bubble..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

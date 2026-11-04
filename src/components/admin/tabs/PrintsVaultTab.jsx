import React, { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadImageFile } from '../../../services/firebaseClient';

export default function PrintsVaultTab() {
  const { prints, savePrintsList, pillowSizes, blanketSizes, saveSizePricing } = useStore();
  const [newPrintName, setNewPrintName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadPngButton = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const pngUrl = await uploadImageFile(file, 'prints');
      const cleanName =
        newPrintName.trim() ||
        file.name.replace(/\.(png|webp|jpg|svg)$/i, '').replace(/[-_]/g, ' ');
      const newEntry = {
        id: `print-${Date.now()}`,
        name: cleanName,
        pngPath: pngUrl,
        fallbackPath: pngUrl,
        emoji: '✨',
      };
      savePrintsList([newEntry, ...prints]);
      setNewPrintName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePrint = (id) => {
    savePrintsList(prints.filter((p) => p.id !== id));
  };

  const handlePriceChange = (type, sizeId, newPrice) => {
    const list = type === 'pillow' ? pillowSizes : blanketSizes;
    const updated = list.map((s) =>
      s.id === sizeId ? { ...s, price: Number(newPrice) } : s
    );
    saveSizePricing(type, updated);
  };

  return (
    <div className="space-y-8">
      {/* Transparent PNG Upload Box */}
      <div className="bg-white p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Interactive Customizer PNG Vault ({prints.length})
            </h2>
            <p className="text-xs text-slate-600">
              Upload transparent PNG graphics here so customers can preview them in Centered, Checkered, or Chaotic mode.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newPrintName}
              onChange={(e) => setNewPrintName(e.target.value)}
              placeholder="Optional Title (e.g. Taco Cat)"
              className="px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-xs font-bold"
            />
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading PNG...' : 'Upload Transparent PNG'}</span>
              <input
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={handleUploadPngButton}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-3 pt-2">
          {prints.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-900 flex flex-col items-center justify-between relative group"
            >
              <button
                type="button"
                onClick={() => handleRemovePrint(p.id)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-300"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <img
                src={p.pngPath}
                onError={(e) => {
                  e.currentTarget.src = p.fallbackPath;
                }}
                alt={p.name}
                className="w-14 h-14 object-contain"
              />
              <span className="text-[11px] font-extrabold text-center truncate w-full mt-2">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Customizer Size Pricing Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] space-y-3">
          <h3 className="font-display text-xl font-bold">Pillow Sizes & Retail Pricing</h3>
          {pillowSizes.map((sz) => (
            <div key={sz.id} className="flex items-center justify-between gap-3 text-xs font-bold">
              <span>{sz.label}</span>
              <div className="flex items-center gap-1">
                <span>$</span>
                <input
                  type="number"
                  step="0.50"
                  value={sz.price}
                  onChange={(e) => handlePriceChange('pillow', sz.id, e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-xl border-2 border-slate-900 font-extrabold text-right"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] space-y-3">
          <h3 className="font-display text-xl font-bold">Blanket Sizes & Retail Pricing</h3>
          {blanketSizes.map((sz) => (
            <div key={sz.id} className="flex items-center justify-between gap-3 text-xs font-bold">
              <span>{sz.label}</span>
              <div className="flex items-center gap-1">
                <span>$</span>
                <input
                  type="number"
                  step="0.50"
                  value={sz.price}
                  onChange={(e) => handlePriceChange('blanket', sz.id, e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-xl border-2 border-slate-900 font-extrabold text-right"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

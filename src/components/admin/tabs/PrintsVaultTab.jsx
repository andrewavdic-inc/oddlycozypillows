import React, { useState } from 'react';
import { Upload, Trash2, Wand2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadImageFile } from '../../../services/firebaseClient';
import { getPublicPrintFiles, getThumbnailUrl } from '../../../utils/publicManifest';

export default function PrintsVaultTab() {
  const { prints, savePrintsList } = useStore();
  const [newPrintName, setNewPrintName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const publicPrints = getPublicPrintFiles();

  const handleUploadPrint = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await uploadImageFile(file, 'prints');
      const cleanTitle =
        newPrintName.trim() ||
        file.name.replace(/\.(png|jpg|jpeg|svg|webp)$/i, '').replace(/[-_]/g, ' ');

      const newEntry = {
        id: `print-${Date.now()}`,
        name: cleanTitle,
        pngPath: dataUrl,
        fallbackPath: dataUrl,
      };
      savePrintsList([newEntry, ...prints]);
      setNewPrintName('');
    } catch (err) {
      alert('Failed to upload print graphic.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSyncPublicFolderPrints = () => {
    const existingPaths = new Set(prints.map((p) => p.pngPath));
    const additions = [];
    publicPrints.forEach((fileUrl) => {
      if (!existingPaths.has(fileUrl)) {
        const rawName = fileUrl
          .split('/')
          .pop()
          .replace(/\.(png|webp|svg)$/i, '')
          .replace(/[-_]/g, ' ');
        additions.push({
          id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: rawName.charAt(0).toUpperCase() + rawName.slice(1),
          pngPath: fileUrl,
          fallbackPath: fileUrl,
        });
      }
    });
    if (additions.length > 0) {
      savePrintsList([...additions, ...prints]);
    } else {
      alert('All files in public/prints/ are already synced!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">
            Interactive Customizer PNG Vault
          </h2>
          <p className="text-sm text-slate-600">
            Upload transparent PNG graphics here and they immediately become selectable inside the customer Pillow & Blanket Customizer!
          </p>
        </div>

        {publicPrints.length > 0 && (
          <button
            type="button"
            onClick={handleSyncPublicFolderPrints}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Sync {publicPrints.length} Files from public/prints/
          </button>
        )}
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
            1. Optional Graphic Name (e.g. "Spicy Taco" or "Boston Terrier")
          </label>
          <input
            type="text"
            placeholder="Leave blank to use file name automatically..."
            value={newPrintName}
            onChange={(e) => setNewPrintName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 text-sm font-bold"
          />
        </div>

        <div className="w-full sm:w-auto sm:pt-5">
          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading PNG...' : 'Upload Transparent PNG'}</span>
            <input
              type="file"
              accept="image/png,image/webp,image/svg+xml"
              onChange={handleUploadPrint}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Prints Grid (Thumbnails + Lazy Loaded) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {prints.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border-3 border-slate-900 p-4 shadow-[0_5px_0_#1E1E24] flex flex-col items-center justify-between gap-3 relative group"
          >
            <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
              <img
                src={getThumbnailUrl(p.pngPath)}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.currentTarget.src !== p.pngPath) {
                    e.currentTarget.src = p.pngPath;
                  } else if (p.fallbackPath) {
                    e.currentTarget.src = p.fallbackPath;
                  }
                }}
                alt={p.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center w-full">
              <p className="font-display font-bold text-sm truncate">{p.name}</p>
            </div>

            <button
              type="button"
              onClick={() => savePrintsList(prints.filter((item) => item.id !== p.id))}
              className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white transition-colors"
              title="Remove Print"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

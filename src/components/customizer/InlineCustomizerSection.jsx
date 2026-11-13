import React, { useState, useRef, useMemo } from 'react';
import { Upload, ShoppingBag, Sparkles, Check, LayoutGrid, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  DISPLAY_MODES,
  FABRIC_BG_COLORS,
} from '../../config/printifySpecs';
import { getPublicPrintFiles } from '../../utils/publicManifest';
import LivePreviewCanvas from './LivePreviewCanvas';
import { soundFX } from '../../utils/soundEffects';

export default function InlineCustomizerSection({
  onAddToCart,
  onExploreAllCategories,
}) {
  const { prints, pillowSizes, blanketSizes } = useStore();
  const canvasRef = useRef(null);

  const allPrints = useMemo(() => {
    const list = [...prints];
    const rawFiles = getPublicPrintFiles();
    rawFiles.forEach((url) => {
      if (!list.some((p) => p.pngPath === url)) {
        const fileName = url.split('/').pop().replace(/\.(png|webp|jpg)$/i, '');
        list.push({
          id: fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: fileName,
          pngPath: url,
          fallbackPath: url,
        });
      }
    });
    return list;
  }, [prints]);

  const [productType, setProductType] = useState('pillow');
  const [selectedSizeId, setSelectedSizeId] = useState('16x16');
  const [selectedMode, setSelectedMode] = useState('centered');
  const [selectedPrint, setSelectedPrint] = useState(allPrints[0]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] =State('');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [backMode, setBackMode] = useState('match');
  const [side, setSide] = useState('front');
  const [chaosSeed, setChaosSeed] = useState(42);
  const [customConfig, setCustomConfig] = useState({
    x: 0.5,
    y: 0.5,
    scale: 1,
    gridCount: 1,
    rotation: 0,
  });

  const sizeOptions = productType === 'pillow' ? pillowSizes : blanketSizes;
  const currentSize =
    sizeOptions.find((s) => s.id === selectedSizeId) || sizeOptions[0];
  const activePrint = selectedPrint || allPrints[0];

  const handleUserUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundFX.playSparkleChime();
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setUploadedImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddCustomToCart = () => {
    soundFX.playSparkleChime();
    let previewDataUrl = activePrint?.fallbackPath || activePrint?.pngPath;
    if (canvasRef.current) {
      try {
        previewDataUrl = canvasRef.current.toDataURL('image/png');
      } catch {
        previewDataUrl = uploadedImageUrl || activePrint?.pngPath;
      }
    }

    const modeObj = DISPLAY_MODES.find((m) => m.id === selectedMode);
    const printTitle = uploadedImageUrl
      ? `Custom Upload (${uploadedFileName})`
      : activePrint?.name;

    onAddToCart({
      id: `custom-${productType}-${Date.now()}`,
      name: `Custom ${productType === 'pillow' ? 'Pillow' : 'Blanket'} — ${printTitle}`,
      sizeLabel: currentSize.label,
      modeLabel: `${modeObj?.name} Layout (${backMode === 'match' ? 'Double-Sided' : 'Front Only'})`,
      price: currentSize.price,
      quantity: 1,
      image: previewDataUrl,
      sku: currentSize.sku,
    });
  };

  return (
    <section
      id="customizer-section"
      className="py-14 sm:py-16 bg-[#FF595E] text-white border-t-4 border-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Design Studio
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Customize Your Own Pillow or Blanket
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/95 font-medium">
            Pick one of our signature designs or upload your own photo, test 5 fun layouts (Centered, Stretched, Checkered, Chaotic, or Custom drag), and see a live preview!
          </p>
        </div>

        <div className="bg-[#FFFDF9] text-slate-900 rounded-[2rem] border-4 border-slate-900 shadow-[0_10px_0_#1E1E24] p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <LivePreviewCanvas
              canvasRef={canvasRef}
              productType={productType}
              sizeSpec={currentSize}
              bgColor={bgColor}
              mode={selectedMode}
              printSourceUrl={uploadedImageUrl || activePrint?.pngPath}
              fallbackUrl={activePrint?.fallbackPath || activePrint?.pngPath}
              chaosSeed={chaosSeed}
              onReshuffleChaos={() => setChaosSeed(Math.random() * 1000)}
              customConfig={customConfig}
              setCustomConfig={setCustomConfig}
              side={side}
              setSide={setSide}
              backMode={backMode}
            />
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              {['pillow', 'blanket'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setProductType(t);
                    setSelectedSizeId(t === 'pillow' ? '16x16' : '50x60');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider border-2 border-slate-900 transition-all ${
                    productType === t
                      ? 'bg-[#FFCA3A] text-slate-900 shadow-[0_3px_0_#1E1E24]'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  Customize Printed {t}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                1. Select Size ({sizeOptions.length} Sizes Available)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => {
                      soundFX.playPop();
                      setSelectedSizeId(sz.id);
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-left transition-all ${
                      selectedSizeId === sz.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow'
                        : 'bg-white text-slate-800 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    <div className="font-bold text-xs">{sz.id}</div>
                    <div className="text-[11px] opacity-80 truncate">
                      {sz.label.split('(')[1]?.replace(')', '')}
                    </div>
                    <div className="text-xs font-extrabold text-amber-400 mt-0.5">
                      ${sz.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                2. Choose Graphic Display Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DISPLAY_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      soundFX.playBoing();
                      setSelectedMode(m.id);
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                      selectedMode === m.id
                        ? 'bg-[#FF595E] text-white border-slate-900 shadow-[0_3px_0_#1E1E24]'
                        : 'bg-white text-slate-800 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{m.name}</div>
                    <div className="text-[10px] opacity-85 mt-0.5">{m.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  3. Pick a Design or Upload Your Own Image
                </label>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Your Own PNG/JPG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUserUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                {allPrints.map((p) => {
                  const isSelected =
                    !uploadedImageUrl &&
                    (activePrint?.pngPath === p.pngPath || activePrint?.id === p.id);
                  return (
                    <button
                      key={p.id + p.pngPath}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        setUploadedImageUrl(null);
                        setSelectedPrint(p);
                      }}
                      title={p.name}
                      className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-200 border-slate-900 scale-105 shadow'
                          : 'bg-white border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      <img
                        src={p.pngPath}
                        onError={(e) => {
                          if (p.fallbackPath) e.currentTarget.src = p.fallbackPath;
                        }}
                        alt={p.name}
                        className="w-10 h-10 object-contain"
                      />
                      <span className="text-[10px] font-bold truncate w-full text-center mt-1">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                  4. Fabric Background Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {FABRIC_BG_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setBgColor(col.hex)}
                      title={col.name}
                      style={{ backgroundColor: col.hex }}
                      className={`w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                        bgColor === col.hex
                          ? 'ring-2 ring-offset-2 ring-rose-500 scale-110'
                          : ''
                      }`}
                    >
                      {bgColor === col.hex && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            col.hex === '#22222B' ? 'text-white' : 'text-slate-900'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                  5. Back Side Printing
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'match', label: 'Both Sides Match' },
                    { id: 'blank', label: 'Solid Color Back' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBackMode(opt.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border-2 ${
                        backMode === opt.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCustomToCart}
              className="w-full py-4 px-6 rounded-2xl bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-base border-2 border-slate-900 shadow-[0_5px_0_#1E1E24] flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              Add Custom {productType === 'pillow' ? 'Pillow' : 'Blanket'} to Cart — $
              {currentSize.price.toFixed(2)}
            </button>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              soundFX.playSparkleChime();
              onExploreAllCategories();
            }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-display text-xl font-bold border-3 border-white shadow-[0_6px_0_#1E1E24] transition-transform hover:-translate-y-1"
          >
            <LayoutGrid className="w-6 h-6" />
            <span>Explore All 7 Categories & Full Catalog</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Upload, ShoppingBag, Sparkles, Check, Scissors, Mail } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DISPLAY_MODES, FABRIC_BG_COLORS } from '../../config/printifySpecs';
import { resolveLogoVariant, getPublicPrintFiles } from '../../utils/publicManifest';
import LivePreviewCanvas from './LivePreviewCanvas';
import { soundFX } from '../../utils/soundEffects';

export default function CustomizerModal({
  isOpen,
  onClose,
  initialProduct,
  initialType = 'pillow',
  onAddToCart,
}) {
  const {
    prints,
    pillowSizes,
    customShapeSizes,
    blanketSizes,
    addCustomProof,
  } = useStore();
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
  const [uploadedFileName, setUploadedFileName] = useState('');
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

  // Custom-Shaped Specific States
  const [simulateCutout, setSimulateCutout] = useState(false);
  const [cutoutNotes, setCutoutNotes] = useState('');
  const [requestCutlineProof, setRequestCutlineProof] = useState(true);
  const [proofEmail, setProofEmail] = useState('');

  const whiteLogo = resolveLogoVariant({ theme: 'white', blink: false, withUrl: false });

  useEffect(() => {
    if (!isOpen) return;
    const isShapeProd = Boolean(
      initialProduct?.isCustomShape ||
        initialProduct?.productType === 'custom-shape' ||
        initialType === 'custom-shape'
    );
    const type = isShapeProd
      ? 'custom-shape'
      : initialProduct?.productType ||
        (initialProduct?.categoryId === 'printed-blankets' ? 'blanket' : initialType) ||
        'pillow';

    setProductType(type);
    setSelectedSizeId(
      initialProduct?.defaultSizeId ||
        (type === 'custom-shape' ? 'shape-18' : type === 'pillow' ? '16x16' : '50x60')
    );
    setSelectedMode(initialProduct?.defaultMode || 'centered');
    setSide('front');
    setUploadedImageUrl(null);
    setUploadedFileName('');
    setSimulateCutout(false);

    if (initialProduct && allPrints.length > 0) {
      let matchedPrint = null;

      if (initialProduct.assignedPrintUrl) {
        matchedPrint = allPrints.find(
          (p) => p.pngPath === initialProduct.assignedPrintUrl
        ) || {
          id: initialProduct.printId || 'assigned-print',
          name: initialProduct.name,
          pngPath: initialProduct.assignedPrintUrl,
          fallbackPath: initialProduct.assignedPrintUrl,
        };
      }

      if (!matchedPrint && initialProduct.printId) {
        const targetId = initialProduct.printId.toLowerCase();
        matchedPrint = allPrints.find(
          (p) =>
            p.id.toLowerCase() === targetId ||
            p.name.toLowerCase() === targetId ||
            p.pngPath.toLowerCase().includes(targetId)
        );
      }

      if (!matchedPrint) {
        const titleLower = (initialProduct.name || '').toLowerCase();
        const aliasChecks = [
          { test: /\bdc\b|diet|cola|coke/, match: /coke|diet|cola/i },
          { test: /fries|fry/, match: /fries|fry/i },
          { test: /cookiemon|monster/, match: /monster|cookiemon|blue.*cookie|cookie/i },
          { test: /choco|chip/, match: /cho.*chip|cookie/i },
          { test: /gummy|bear/, match: /gummy|bear/i },
          { test: /reese|puff/, match: /reese|puff|cereal/i },
          { test: /donut|doughnut/, match: /donut|doughnut/i },
          { test: /pizza/, match: /pizza/i },
          { test: /flamin|cheeto|hot/, match: /flamin|cheeto|hot/i },
          { test: /croissant/, match: /croissant/i },
          { test: /burger/, match: /burger/i },
          { test: /boba|tea/, match: /boba|tea/i },
          { test: /sushi/, match: /sushi/i },
          { test: /nugget/, match: /nugget/i },
          { test: /cat|kitty/, match: /cat/i },
          { test: /baguette/, match: /baguette/i },
          { test: /drumstick|chicken/, match: /drumstick|chicken/i },
        ];

        for (const rule of aliasChecks) {
          if (rule.test.test(titleLower)) {
            matchedPrint = allPrints.find(
              (p) => rule.match.test(p.name) || rule.match.test(p.pngPath)
            );
            if (matchedPrint) break;
          }
        }

        if (!matchedPrint) {
          matchedPrint = allPrints.find((p) => {
            const words = p.name.toLowerCase().split(/[^a-z0-9]+/);
            return words.some((w) => w.length >= 3 && titleLower.includes(w));
          });
        }
      }

      setSelectedPrint(matchedPrint || allPrints[0]);
    } else {
      setSelectedPrint(allPrints[0]);
    }
  }, [isOpen, initialProduct, initialType, allPrints]);

  if (!isOpen) return null;

  const isCustomShape = productType === 'custom-shape';
  const sizeOptions =
    productType === 'pillow'
      ? pillowSizes
      : productType === 'custom-shape'
      ? customShapeSizes
      : blanketSizes;

  const currentSize =
    sizeOptions.find((s) => s.id === selectedSizeId) || sizeOptions[0];
  const activePrint = selectedPrint || allPrints[0];

  const handleUserUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundFX.playSparkleChime();
    setUploadedFileName(file.name);
    if (isCustomShape && /\.(jpg|jpeg)$/i.test(file.name)) {
      setSimulateCutout(true);
    }
    const reader = new FileReader();
    reader.onload = () => setUploadedImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddCustomizedToCart = () => {
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
      ? `${uploadedFileName}`
      : activePrint?.name;

    const itemName = isCustomShape
      ? `Custom-Shaped Cutout Pillow — ${printTitle}`
      : `Custom ${productType === 'pillow' ? 'Pillow' : 'Blanket'} — ${printTitle}`;

    const modeDescription = isCustomShape
      ? `Contour Cutout (${backMode === 'match' ? 'Double-Sided' : 'Solid Back'})${
          cutoutNotes ? ` • Note: ${cutoutNotes}` : ''
        }`
      : `${modeObj?.name} Layout (${backMode === 'match' ? 'Double-Sided' : 'Front Only'})`;

    if (isCustomShape && (uploadedImageUrl || requestCutlineProof || cutoutNotes)) {
      addCustomProof({
        id: `PRF-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toLocaleString(),
        customerEmail: proofEmail || 'Provided at Checkout',
        itemType: 'custom-shaped-pillow',
        sizeLabel: currentSize.label,
        price: currentSize.price,
        description: `Custom-Shaped Pillow (${printTitle}). ${
          cutoutNotes || 'Trace subject outline & remove background.'
        }`,
        referenceImage: uploadedImageUrl || previewDataUrl,
        mockupProofImage: '',
        status: 'Needs Mockup',
      });
    }

    onAddToCart({
      id: `custom-${productType}-${Date.now()}`,
      name: itemName,
      sizeLabel: currentSize.label,
      modeLabel: modeDescription,
      price: currentSize.price,
      fulfillmentRoute: isCustomShape ? 'Custom Die-Cut POD' : 'Printify POD',
      quantity: 1,
      image: previewDataUrl,
      sku: currentSize.sku,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFDF9] text-slate-900 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.65)] max-w-5xl w-full overflow-hidden my-auto"
      >
        <div className="bg-[#FF595E] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={whiteLogo}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              alt="Oddly Cozy Studio"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
                {initialProduct
                  ? `Customizing: ${initialProduct.name}`
                  : 'Interactive Customizer Studio'}
                <Sparkles className="w-5 h-5 text-amber-300" />
              </h2>
              <p className="text-xs text-white/90 font-semibold">
                Choose Square, ✂️ Custom-Shaped Cutout, or Blanket — or upload your own photo!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[82vh] overflow-y-auto">
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
              simulateCutout={simulateCutout}
            />
          </div>

          <div className="lg:col-span-7 space-y-5">
            {/* 3-Tab Product Type Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'pillow', label: '⬜ Square Pillow' },
                { id: 'custom-shape', label: '✂️ Custom-Shaped' },
                { id: 'blanket', label: '🧣 Printed Blanket' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setProductType(tab.id);
                    setSelectedSizeId(
                      tab.id === 'pillow'
                        ? '16x16'
                        : tab.id === 'custom-shape'
                        ? 'shape-18'
                        : '50x60'
                    );
                  }}
                  className={`py-2.5 px-3 rounded-full font-extrabold text-xs uppercase tracking-wider border-2 border-slate-900 transition-all ${
                    productType === tab.id
                      ? 'bg-[#FFCA3A] text-slate-900 shadow-[0_3px_0_#1E1E24]'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                1. Select {isCustomShape ? 'Cutout Size (Longest Side)' : 'Size'}
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
                    <div className="font-bold text-xs">
                      {sz.widthIn}" {isCustomShape ? 'Cutout' : `× ${sz.heightIn}"`}
                    </div>
                    <div className="text-[11px] opacity-80 truncate">
                      {sz.label.split('(')[1]?.replace(')', '') || sz.label}
                    </div>
                    <div className="text-xs font-extrabold text-amber-400 mt-0.5">
                      ${sz.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {!isCustomShape ? (
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
            ) : (
              <div className="p-3.5 rounded-2xl bg-indigo-50 border-2 border-slate-900 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase text-indigo-950 flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-[#FF595E]" />
                    2. Custom Cutout & Proof Options
                  </span>
                  {uploadedImageUrl && (
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-800 bg-white px-2.5 py-0.5 rounded-full border border-indigo-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateCutout}
                        onChange={(e) => setSimulateCutout(e.target.checked)}
                        className="accent-indigo-600"
                      />
                      <span>Simulate Cutout Shape</span>
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={cutoutNotes}
                  onChange={(e) => setCutoutNotes(e.target.value)}
                  placeholder="Optional cutout notes (e.g. 'Cut out my cat and remove the couch background')"
                  className="w-full px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-semibold bg-white"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestCutlineProof}
                      onChange={(e) => setRequestCutlineProof(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-600"
                    />
                    <span>Send me a cut-line proof before printing</span>
                  </label>

                  {requestCutlineProof && (
                    <div className="flex items-center gap-1 flex-1 max-w-xs">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="email"
                        value={proofEmail}
                        onChange={(e) => setProofEmail(e.target.value)}
                        placeholder="Email for cut-line proof"
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  3. Switch Design or Upload Your Own Photo
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow">
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
                        setSimulateCutout(false);
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
                  4. {isCustomShape ? 'Contour Seam Color' : 'Fabric Background Color'}
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
                      className={`flex-1 py-2 px-3 rounded-full text-xs font-bold border-2 ${
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
              onClick={handleAddCustomizedToCart}
              className="w-full py-3.5 px-6 rounded-full bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              Add {isCustomShape ? 'Custom-Shaped Pillow' : `Custom ${productType === 'pillow' ? 'Pillow' : 'Blanket'}`} to Cart — $
              {currentSize.price.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

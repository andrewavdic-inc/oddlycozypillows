import React, { useState } from 'react';
import { Upload, Sparkles, CheckCircle2, Send } from 'lucide-react';
import StuffingMascot from '../interactive/StuffingMascot';
import { PILLOW_SIZES, BLANKET_SIZES } from '../../config/printifySpecs';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function CustomOrderSection({ onAddCustomRequestToCart }) {
  const [itemType, setItemType] = useState('pillow');
  const [selectedSize, setSelectedSize] = useState('16x16');
  const [customerEmail, setCustomerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const sizeList = itemType === 'pillow' ? PILLOW_SIZES : BLANKET_SIZES;
  const currentSizeObj = sizeList.find((s) => s.id === selectedSize) || sizeList[0];
  const whiteSimplifiedLogo = resolveLogoVariant({ theme: 'white', blink: false, withUrl: true });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setUploadedPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    soundFX.playSparkleChime();

    onAddCustomRequestToCart({
      id: `bespoke-${Date.now()}`,
      name: `Totally Custom ${itemType === 'pillow' ? 'Pillow' : 'Blanket'} (Mockup Approval Included)`,
      sizeLabel: currentSizeObj.label,
      modeLabel: 'Bespoke Artist Mockup',
      price: currentSizeObj.price + 10,
      quantity: 1,
      image: uploadedPreview || '/icons/pillows-sparkle.svg',
      notes: `${description} (Mockup proof to: ${customerEmail})`,
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section
      id="custom-orders"
      className="py-16 sm:py-20 bg-[#1E1E24] text-white border-t-4 border-slate-900"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-[#6A4C93] via-[#1982C4] to-[#8AC926] p-1.5 rounded-[2.2rem] shadow-[0_10px_0_#000]">
          <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bespoke Concierge Service
                  </span>
                  <img
                    src={whiteSimplifiedLogo}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    alt="Oddly Cozy White Logo"
                    className="h-8 object-contain"
                  />
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
                  Totally Custom Orders (We Mock It Up For Your Approval!)
                </h2>
                <p className="text-slate-300 text-sm mt-2 max-w-xl">
                  Want background removal, pet caricatures, or a wild idea you want our design team to put together? Describe it or upload a photo—we’ll email you a custom preview for your approval before shipping it out!
                </p>
              </div>
              <StuffingMascot
                theme="white"
                size="md"
                customQuote="We'll email your custom mockup proof for your approval before we ship!"
              />
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2">
                    1. Choose Merchandise Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['pillow', 'blanket'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setItemType(type);
                          setSelectedSize(type === 'pillow' ? '16x16' : '50x60');
                        }}
                        className={`py-3 px-4 rounded-2xl font-bold text-sm border-2 capitalize transition-all ${
                          itemType === type
                            ? 'bg-[#FF595E] text-white border-white shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        Custom {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2">
                    2. Select Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-bold text-sm focus:border-amber-400 outline-none"
                  >
                    {sizeList.map((sz) => (
                      <option key={sz.id} value={sz.id}>
                        {sz.label} — ${(sz.price + 10).toFixed(2)} (Includes Design Proof)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2">
                    3. Email for Mockup Approval
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2">
                    4. Describe Your Idea & Upload Reference (Optional)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g., Put my golden retriever wearing a chef hat surrounded by floating French fries on a sky blue background..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                  />

                  <label className="mt-3 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-600 hover:border-amber-400 bg-slate-800/60 cursor-pointer text-xs font-bold text-slate-300 transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{fileName ? `Uploaded: ${fileName}` : 'Upload Photo / Sketch (PNG, JPG)'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-sm border-2 border-white shadow-[0_4px_0_#000] flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Added Custom Order to Cart!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Add Custom Order (${(currentSizeObj.price + 10).toFixed(2)}) — Proof Before Shipping
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

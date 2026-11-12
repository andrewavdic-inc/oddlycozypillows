import React, { useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) {
  const colorLogo = resolveLogoVariant({ theme: 'color', blink: false, withUrl: false });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((a, b) => a + b.quantity, 0);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
    >
      {/* Frameless Floating Cart Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col max-h-[85vh] border-0"
      >
        {/* Frameless Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#FF595E] to-[#FF924C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={colorLogo}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              alt="Oddly Cozy"
              className="w-10 h-10 object-contain drop-shadow"
            />
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                Your Cozy Cart ({totalCount})
              </h2>
              <p className="text-xs text-white/90 font-semibold">
                Free tracked shipping included on every order!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3.5">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-display text-xl font-bold text-slate-700">
                Your cart is empty!
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Click Buy on any pillow, plushie, or blanket to add it here.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/80 shadow-sm flex gap-4 items-center transition-colors"
              >
                <img
                  src={item.image}
                  onError={(e) => {
                    e.currentTarget.src = '/icons/printed-pillow.svg';
                  }}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-white shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 truncate">
                    {item.sizeLabel}
                  </p>
                  {item.modeLabel && (
                    <p className="text-[11px] font-extrabold text-[#FF595E]">
                      {item.modeLabel}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-display font-bold text-base text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white shadow hover:bg-slate-200 font-extrabold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold px-1">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white shadow hover:bg-slate-200 font-extrabold text-xs"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Frameless Footer & Checkout Action */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-slate-50/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Subtotal (Free Shipping)</span>
              <span className="font-display text-2xl font-bold text-slate-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-colors"
              >
                Keep Shopping
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playSparkleChime();
                  onProceedToCheckout();
                }}
                className="w-full flex-1 py-3.5 px-6 rounded-full bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to Checkout (${subtotal.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

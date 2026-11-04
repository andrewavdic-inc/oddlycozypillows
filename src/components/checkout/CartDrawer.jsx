import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { resolveLogoVariant } from '../../utils/publicManifest';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const blackLogo = resolveLogoVariant({ theme: 'black', blink: false, withUrl: false });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="bg-[#FFFDF9] w-full max-w-md h-full border-l-4 border-slate-900 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-[#FFCA3A] border-b-4 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={blackLogo}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              alt="Oddly Cozy"
              className="w-9 h-9 object-contain"
            />
            <ShoppingBag className="w-6 h-6 text-slate-900" />
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Your Cozy Cart ({cartItems.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white border-2 border-slate-900 hover:bg-rose-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <img
                src="/icons/pillow-squished.svg"
                alt="Empty Cart"
                className="w-20 h-20 mx-auto opacity-50 mb-3"
              />
              <p className="font-display text-xl font-bold text-slate-700">
                Your couch is looking a little bare!
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Add a 1-click pillow or customize your own creation.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] flex gap-3.5 items-center"
              >
                <img
                  src={item.image}
                  onError={(e) => {
                    e.currentTarget.src = '/icons/printed-pillow.svg';
                  }}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-300 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-slate-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500">{item.sizeLabel}</p>
                  {item.modeLabel && (
                    <p className="text-[11px] font-extrabold text-rose-600">{item.modeLabel}</p>
                  )}
                  {item.notes && (
                    <p className="text-[10px] text-slate-500 italic truncate">{item.notes}</p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display font-bold text-base text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-slate-100 border border-slate-900 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold px-1">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-slate-100 border border-slate-900 font-bold text-xs"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
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

        {/* Footer & Checkout Trigger */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-white border-t-4 border-slate-900 space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-slate-600">
              <span>Standard Tracked Shipping</span>
              <span className="text-emerald-600 font-extrabold">FREE</span>
            </div>
            <div className="flex items-center justify-between font-display text-2xl font-bold text-slate-900">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-4 px-6 rounded-2xl bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-base border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] flex items-center justify-center gap-2"
            >
              <span>Secure Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

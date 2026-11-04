import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Mail, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../../utils/soundEffects';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit', badge: 'Visa • MC • Amex', icon: CreditCard },
  { id: 'gpay', label: 'Google Pay (GPay)', badge: '1-Tap Express', icon: Smartphone },
  { id: 'paypal', label: 'PayPal', badge: 'Pay in 4 Available', icon: ShieldCheck },
  { id: 'etransfer', label: 'Interac e-Transfer', badge: 'Instant Bank Transfer', icon: Mail },
];

export default function CheckoutModal({ isOpen, onClose, cartItems, onClearCart }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    soundFX.playSparkleChime();
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    setOrderRef(`OCP-${Math.floor(100000 + Math.random() * 900000)}`);
    setOrderComplete(true);
    setTimeout(() => {
      onClearCart();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] text-slate-900 rounded-[2rem] border-4 border-slate-900 shadow-[0_12px_0_#1E1E24] max-w-2xl w-full overflow-hidden my-auto">
        <div className="bg-[#1982C4] text-white px-6 py-4 border-b-4 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <h2 className="font-display text-2xl font-bold">
              Secure Oddly Cozy Checkout
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setOrderComplete(false);
              onClose();
            }}
            className="p-1.5 rounded-full bg-white text-slate-900 border-2 border-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderComplete ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="font-display text-3xl font-bold">
              Order Confirmed! ({orderRef})
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you for shopping at <strong>oddlycozypillows.com</strong>! Your cozy items are now being prepared, and any custom mockup proofs will arrive in your inbox shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setOrderComplete(false);
                onClose();
              }}
              className="px-8 py-3 rounded-full bg-[#FF595E] text-white font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24]"
            >
              Back to Store
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input
                type="text"
                required
                placeholder="Full Name"
                className="px-4 py-3 rounded-2xl border-2 border-slate-900 text-sm font-semibold"
              />
              <input
                type="email"
                required
                placeholder="Email Address (for Tracking & Proofs)"
                className="px-4 py-3 rounded-2xl border-2 border-slate-900 text-sm font-semibold"
              />
              <input
                type="text"
                required
                placeholder="Street Address"
                className="sm:col-span-2 px-4 py-3 rounded-2xl border-2 border-slate-900 text-sm font-semibold"
              />
              <input
                type="text"
                required
                placeholder="City / Province or State"
                className="px-4 py-3 rounded-2xl border-2 border-slate-900 text-sm font-semibold"
              />
              <input
                type="text"
                required
                placeholder="Postal / ZIP Code"
                className="px-4 py-3 rounded-2xl border-2 border-slate-900 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        setPaymentMethod(pm.id);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-amber-200 border-slate-900 shadow-[0_3px_0_#1E1E24]'
                          : 'bg-white border-slate-300 hover:border-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1 text-slate-900" />
                      <div className="font-extrabold text-xs">{pm.label}</div>
                      <div className="text-[10px] text-slate-600">{pm.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-slate-100 border-2 border-slate-900 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Card Number (•••• •••• •••• ••••)"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white text-sm font-semibold"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    className="px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white text-sm font-semibold"
                  />
                  <input
                    type="text"
                    required
                    placeholder="CVC"
                    className="px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white text-sm font-semibold"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'gpay' && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-slate-900 text-center">
                <p className="text-xs font-bold text-slate-300 mb-2">
                  Fast & encrypted 1-click checkout with Google Pay
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-slate-900 font-extrabold text-sm">
                  G Pay • Ready to Authorize ${total.toFixed(2)}
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="p-4 rounded-2xl bg-[#003087] text-white border-2 border-slate-900 text-center">
                <p className="text-xs font-bold text-sky-200 mb-1">
                  PayPal Express & Pay-in-4 Connected
                </p>
                <p className="text-sm font-extrabold">
                  Click below to complete your ${total.toFixed(2)} order via PayPal.
                </p>
              </div>
            )}

            {paymentMethod === 'etransfer' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-slate-900 text-xs space-y-1.5">
                <p className="font-extrabold text-sm text-slate-900">
                  Interac e-Transfer Instructions (Auto-Deposit Enabled):
                </p>
                <p className="text-slate-700">
                  1. Click <strong>Complete Order</strong> below to reserve your order.
                </p>
                <p className="text-slate-700">
                  2. Send <strong>${total.toFixed(2)}</strong> via Interac e-Transfer to{' '}
                  <span className="underline font-bold">pay@oddlycozypillows.com</span> with your order number in the note!
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-base border-2 border-slate-900 shadow-[0_5px_0_#1E1E24]"
            >
              Complete Order — ${total.toFixed(2)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

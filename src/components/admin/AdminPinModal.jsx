import React, { useState, useEffect } from 'react';
import { Lock, X, Delete, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

export default function AdminPinModal({ isOpen, onClose, onSuccess }) {
  const { cms } = useStore();
  const [enteredPin, setEnteredPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const blinkLogo = resolveLogoVariant({ theme: 'color', blink: true, withUrl: false });

  useEffect(() => {
    if (isOpen) {
      setEnteredPin('');
      setErrorShake(false);
    }
  }, [isOpen]);

  const handleDigit = (digit) => {
    if (enteredPin.length >= 4) return;
    soundFX.playPop();
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === (cms.adminPin || '2026')) {
        soundFX.playSparkleChime();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 180);
      } else {
        soundFX.playBoing();
        setErrorShake(true);
        setTimeout(() => {
          setEnteredPin('');
          setErrorShake(false);
        }, 550);
      }
    }
  };

  const handleBackspace = () => {
    soundFX.playPop();
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`bg-[#FFFDF9] text-slate-900 rounded-[2rem] border-4 border-slate-900 shadow-[0_12px_0_#1E1E24] max-w-sm w-full p-6 text-center relative transition-transform ${
          errorShake ? 'translate-x-2 bg-rose-50' : ''
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot with Eyes Closed While Entering Secret PIN */}
        <img
          src={blinkLogo}
          onError={(e) => {
            e.currentTarget.src = '/logo-full-color.svg';
          }}
          alt="Puff Eyes Closed"
          className="w-20 h-20 mx-auto object-contain mb-2"
        />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          Operator Vault Lock
        </div>

        <h3 className="font-display text-2xl font-bold mt-2">Enter 4-Digit Admin PIN</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Puff has his eyes closed! (Default PIN: <strong>2026</strong>)
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 my-5">
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < enteredPin.length;
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-2xl border-3 border-slate-900 flex items-center justify-center font-display text-2xl font-bold transition-all ${
                  filled
                    ? 'bg-[#FF595E] text-white shadow-[0_3px_0_#1E1E24] -translate-y-0.5'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {filled ? '●' : ''}
              </div>
            );
          })}
        </div>

        {errorShake && (
          <p className="text-xs font-extrabold text-rose-600 flex items-center justify-center gap-1 mb-3">
            <ShieldAlert className="w-4 h-4" />
            Incorrect PIN! Try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="py-3.5 rounded-2xl bg-white hover:bg-amber-200 active:translate-y-0.5 border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] font-display text-xl font-bold transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEnteredPin('')}
            className="py-3.5 rounded-2xl bg-slate-100 hover:bg-rose-100 border-2 border-slate-900 text-xs font-extrabold uppercase"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3.5 rounded-2xl bg-white hover:bg-amber-200 border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] font-display text-xl font-bold"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

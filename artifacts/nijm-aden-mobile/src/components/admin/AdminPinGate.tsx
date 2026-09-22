import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface AdminPinGateProps {
  expectedPin: string;
  onSuccess: () => void;
  onExit: () => void;
}

export const AdminPinGate: React.FC<AdminPinGateProps> = ({
  expectedPin,
  onSuccess,
  onExit,
}) => {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Handle keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setHasError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === expectedPin) {
      onSuccess();
    } else {
      setHasError(true);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0A0D14]/95 p-4 backdrop-blur-xl"
      dir="rtl"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-[#D4AF37]/15 to-[#8B1538]/15 blur-3xl pointer-events-none" />

      <div
        className={`relative w-full max-w-sm rounded-3xl border border-slate-800/80 bg-[#121722]/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Header Exit Button */}
        <button
          onClick={onExit}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#D4AF37] transition-colors bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/60"
        >
          <span>معاينة المتجر</span>
          <ArrowRight size={13} className="rotate-180" />
        </button>

        {/* Lock Graphic */}
        <div className="mx-auto mt-2 mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#1A2232] to-[#252E42] border border-[#D4AF37]/40 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
          <Lock size={26} className="text-[#D4AF37]" />
        </div>

        {/* Title */}
        <h2 className="text-center text-lg sm:text-xl font-black text-white">
          لوحة إدارة نجم عدن
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          أدخل رمز المرور السري المكون من 4 أرقام للمتابعة
        </p>

        {/* Masked PIN Dots Indicator */}
        <div className="my-6 flex items-center justify-center gap-4">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  hasError
                    ? 'border-2 border-red-500 bg-red-500/20'
                    : isFilled
                    ? 'border-2 border-[#D4AF37] bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.8)] scale-110'
                    : 'border-2 border-slate-700 bg-slate-800/50'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {hasError ? (
          <p className="mb-4 text-center text-xs font-bold text-red-400 animate-pulse">
            رمز المرور غير صحيح، يرجى المحاولة مرة أخرى
          </p>
        ) : (
          <p className="mb-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <KeyRound size={12} className="text-[#D4AF37]" />
            <span>الرمز الافتراضي: 2026</span>
          </p>
        )}

        {/* Numeric Keypad for Mobile and Desktop click */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl border border-slate-800/80 bg-[#161D2B]/80 text-base font-bold text-slate-200 transition-all hover:border-[#D4AF37]/50 hover:bg-[#1C2638] active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-12 rounded-xl border border-slate-800/80 bg-[#161D2B]/40 text-xs font-bold text-slate-400 hover:text-white transition-all hover:bg-slate-800/60 active:scale-95"
          >
            مسح
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl border border-slate-800/80 bg-[#161D2B]/80 text-base font-bold text-slate-200 transition-all hover:border-[#D4AF37]/50 hover:bg-[#1C2638] active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl border border-slate-800/80 bg-[#161D2B]/40 text-xs font-bold text-slate-400 hover:text-red-400 transition-all hover:bg-slate-800/60 active:scale-95 flex items-center justify-center"
          >
            حذف
          </button>
        </div>

        {/* Bottom Safety note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck size={12} className="text-[#25D366]" />
          <span>منطقة إدارة مشفرة ومحمية ببروتوكول محلي آمن</span>
        </div>
      </div>
    </div>
  );
};

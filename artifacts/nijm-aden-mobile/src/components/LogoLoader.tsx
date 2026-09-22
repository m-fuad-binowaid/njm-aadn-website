import React from 'react';

interface LogoLoaderProps {
  fullscreen?: boolean;
  text?: string;
  className?: string;
}

export function LogoLoader({
  fullscreen = false,
  text = 'جاري تجهيز أحدث الأجهزة...',
  className = '',
}: LogoLoaderProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 select-none ${className}`}>
      {/* Ambient Gold Aura Glow */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D4AF37]/20 via-[#F5D061]/10 to-transparent blur-2xl transform scale-150 pointer-events-none" />

        {/* Branded Logo with Breathing Scale and Ambient Glow */}
        <div className="relative animate-logo-breath">
          <img
            src="/assets/logo.png"
            alt="نجم عدن موبايل"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.35)]"
          />
        </div>
      </div>

      {/* Ultra-thin Minimalist Gold Shimmer Progress Bar */}
      <div className="mt-5 w-44 sm:w-56 h-[2px] bg-slate-800/80 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-gold-progress" />
      </div>

      {/* Sleek Arabic Loading Indicator */}
      <p className="mt-3 text-xs font-bold text-slate-300 tracking-wide flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-ping" />
        <span>{text}</span>
      </p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0A0D14]/95 backdrop-blur-md transition-opacity duration-300">
        {content}
      </div>
    );
  }

  return content;
}

export default LogoLoader;

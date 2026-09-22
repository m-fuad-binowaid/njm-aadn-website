import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-slate-800/60 bg-[#121722]/90 p-3 shadow-lg overflow-hidden select-none">
      <div>
        {/* Top Badge Placeholder */}
        <div className="flex items-center justify-start mb-2">
          <div className="bg-slate-800/80 h-5 w-16 rounded-full animate-pulse" />
        </div>

        {/* Image Area Placeholder with Ghost Star Watermark & Shimmer Sweep */}
        <div className="bg-[#181F2E]/60 h-36 w-full rounded-xl relative overflow-hidden flex items-center justify-center mb-2.5 border border-slate-800/40">
          {/* Faint watermark silhouette/ghost of the Najm Aden star icon */}
          <div className="opacity-20 animate-pulse flex items-center justify-center">
            <svg
              className="w-14 h-14 text-[#D4AF37]"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>

          {/* Modern Linear Shimmer Sweep Effect across the dark surface */}
          <div className="shimmer-sweep" />
        </div>

        {/* Title & Specs Placeholders */}
        <div className="space-y-1.5">
          <div className="bg-slate-800/70 h-4 w-3/4 rounded animate-pulse" />
          <div className="bg-slate-800/50 h-3 w-1/2 rounded mt-2 animate-pulse" />
        </div>

        {/* Storage Indicator Placeholder */}
        <div className="mt-2 flex gap-1.5">
          <div className="bg-slate-800/40 h-2.5 w-12 rounded animate-pulse" />
          <div className="bg-slate-800/40 h-2.5 w-12 rounded animate-pulse" />
        </div>
      </div>

      {/* Bottom Actions Placeholder: Matching dual-action layout */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
        {/* WhatsApp Mock Pill */}
        <div className="bg-slate-800/80 h-8 flex-1 rounded-xl animate-pulse" />
        {/* Cart Mock Square */}
        <div className="bg-slate-800/80 h-8 w-8 shrink-0 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;

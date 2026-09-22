import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 44,
  showSubtitle = true,
}) => {
  return (
    <div
      className={`group/logo relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform duration-300 hover:scale-[1.03] ${className}`}
      style={{ width: size, height: size }}
      title="نجم عدن موبايل - الشعار الأصلي المعتمد"
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(212,175,55,0.2)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Glow behind Star */}
          <radialGradient id="starHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2D1" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#E5B869" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#D4AF37" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0A0D14" stopOpacity="0" />
          </radialGradient>

          {/* Brushed Titanium Silver Metallic Gradient */}
          <linearGradient id="titaniumSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="80%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Brushed Champagne Gold Metallic Gradient */}
          <linearGradient id="champagneGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9E6" />
            <stop offset="25%" stopColor="#E5B869" />
            <stop offset="65%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#997A18" />
          </linearGradient>

          {/* Subtle Outer Drop Shadow */}
          <filter id="metallicShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Glowing 4-Point Gold Star with Hover Pulse (Top Right) */}
        <g
          className="transition-transform duration-500 origin-center group-hover/logo:scale-125 group-hover/logo:rotate-12"
          transform="translate(422, 130)"
        >
          {/* Pulsing Star Burst Halo */}
          <circle cx="0" cy="0" r="65" fill="url(#starHalo)" className="animate-pulse" />
          
          {/* Main 4-point Diamond Star (Gold Metallic) */}
          <path
            d="M 0 -55 Q 2.5 -12 40 0 Q 2.5 12 0 55 Q -2.5 12 -40 0 Q -2.5 -12 0 -55 Z"
            fill="url(#champagneGoldGrad)"
          />
          {/* Bright White Center Glint */}
          <path
            d="M 0 -38 Q 2 -8 26 0 Q 2 8 0 38 Q -2 8 -26 0 Q -2 -8 0 -38 Z"
            fill="#FFFFFF"
            opacity="0.92"
          />
          <circle cx="0" cy="0" r="5" fill="#FFFBEB" />
        </g>

        {/* 2. Primary Arabic Calligraphy: "نجم" (Titanium Silver & Gold Bevel) */}
        <g id="brand-najm" filter="url(#metallicShadow)">
          {/* Main Upper Crossbar in Titanium Silver */}
          <path
            d="M 125 158 
               L 375 158 
               A 22 22 0 0 1 397 180 
               L 397 220 
               A 22 22 0 0 1 375 242 
               L 105 242 
               A 18 18 0 0 1 89 217 
               L 115 174 
               A 22 22 0 0 1 125 158 Z"
            fill="url(#titaniumSilverGrad)"
          />

          {/* Connected Titanium Base Sweep */}
          <path
            d="M 98 185 
               L 48 250 
               A 20 20 0 0 0 42 264 
               L 42 266 
               A 18 18 0 0 0 57 282 
               L 448 282 
               A 16 16 0 0 0 464 266 
               L 464 212 
               A 14 14 0 0 0 450 198 
               L 428 198 
               L 428 248 
               L 94 248 
               L 128 202 Z"
            fill="url(#titaniumSilverGrad)"
          />

          {/* Signature Champagne Gold Corner Bevel / Slice (From Brand Attachment 1) */}
          <polygon
            points="68,256 106,202 118,210 82,264"
            fill="url(#champagneGoldGrad)"
          />
        </g>

        {/* 3. Secondary Arabic Calligraphy: "عدن" (Champagne Gold) */}
        <g id="brand-adan" filter="url(#metallicShadow)">
          {/* Flowing Gold Letterforms */}
          <path
            d="M 140 315 
               C 150 290, 180 283, 198 297 
               C 212 308, 216 327, 202 343 
               C 188 359, 155 361, 136 359 
               L 120 359 
               C 108 359, 100 349, 100 337 
               C 100 325, 110 315, 122 315 
               L 140 315 Z"
            fill="url(#champagneGoldGrad)"
          />
          <path
            d="M 128 357 
               L 360 357 
               C 378 357, 390 345, 390 327 
               L 390 321 
               C 390 307, 378 297, 364 297 
               C 350 297, 338 307, 338 321 
               L 338 331 
               C 338 339, 332 345, 324 345 
               L 205 345 
               C 198 345, 192 339, 192 331 
               C 192 317, 206 307, 220 307 
               L 255 307 
               C 265 307, 272 299, 272 290 
               C 272 281, 265 275, 255 275 
               L 210 275 
               C 175 275, 148 299, 148 331 
               L 148 343 
               Z"
            fill="url(#champagneGoldGrad)"
          />

          {/* Silver Dot under first segment */}
          <circle cx="302" cy="293" r="10" fill="url(#titaniumSilverGrad)" />

          {/* Champagne Gold Dot for "ن" */}
          <circle cx="134" cy="299" r="8" fill="url(#champagneGoldGrad)" />
        </g>

        {/* 4. Bottom Subtitle: "— مـبـايـل —" in Titanium Silver */}
        {showSubtitle && (
          <g id="brand-mobile-subtitle">
            {/* Right Silver Line */}
            <line
              x1="90"
              y1="418"
              x2="170"
              y2="418"
              stroke="url(#titaniumSilverGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Arabic Text "مـبـايـل" */}
            <text
              x="250"
              y="426"
              textAnchor="middle"
              fontFamily="'Cairo', 'Tajawal', sans-serif"
              fontSize="32"
              fontWeight="900"
              letterSpacing="6"
              fill="url(#titaniumSilverGrad)"
            >
              مـبـايـل
            </text>

            {/* Left Silver Line */}
            <line
              x1="330"
              y1="418"
              x2="410"
              y2="418"
              stroke="url(#titaniumSilverGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

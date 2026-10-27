import React from 'react';

/**
 * HouseTrustBadge Component
 * Modern, architectural house silhouette badge frame for KAPEE trust signals.
 * Symbolizes "A Cleaner, Healthier Home" with charming gable roof, chimney,
 * metallic emerald gradient fill, gold accents, and fluid hover glow.
 */
export const HouseTrustBadge = ({ icon: Icon, idx }) => {
  const gradientId = `house-bg-${idx}`;
  const goldId = `gold-grad-${idx}`;

  return (
    <div className="relative w-16 h-18 sm:w-18 sm:h-20 flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-500 group-hover:-translate-y-2 select-none">
      <svg
        viewBox="0 0 84 94"
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:drop-shadow-[0_8px_20px_rgba(200,150,46,0.4)]"
        fill="none"
      >
        <defs>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8962E" />
            <stop offset="50%" stopColor="#EBCB6B" />
            <stop offset="100%" stopColor="#8F6414" />
          </linearGradient>

          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f6a61" />
            <stop offset="50%" stopColor="#06423d" />
            <stop offset="100%" stopColor="#022421" />
          </linearGradient>
        </defs>

        {/* Outer Dashed House Silhouette Halo */}
        <path
          d="M 42 4 Q 44.5 2 47 4 L 79 32 Q 82 35 81 40 L 81 84 Q 81 90 75 90 L 9 90 Q 3 90 3 84 L 3 40 Q 2 35 5 32 Z"
          stroke="rgba(200, 150, 46, 0.45)"
          strokeWidth="1.6"
          strokeDasharray="4 3"
          className="group-hover:stroke-gold transition-colors duration-500"
        />

        {/* Chimney on the roof (Distinctive cozy house silhouette) */}
        <path
          d="M 58 19 L 58 10 Q 58 8 60 8 L 66 8 Q 68 8 68 10 L 68 28 Z"
          fill={`url(#${gradientId})`}
          stroke="rgba(200, 150, 46, 0.65)"
          strokeWidth="1.4"
          className="transition-all duration-500 group-hover:stroke-gold"
        />

        {/* Inner Solid Architectural House Body */}
        <path
          d="M 42 8 Q 44 6 46 8 L 74 33 Q 77 36 76 40 L 76 81 Q 76 86 71 86 L 13 86 Q 8 86 8 81 L 8 40 Q 7 36 10 33 Z"
          fill={`url(#${gradientId})`}
          stroke="rgba(200, 150, 46, 0.65)"
          strokeWidth="1.6"
          className="transition-all duration-500 group-hover:stroke-gold group-hover:brightness-110"
        />

        {/* Subtle Architectural Attic Beam Divider */}
        <line
          x1="18"
          y1="38"
          x2="66"
          y2="38"
          stroke="rgba(235, 203, 107, 0.3)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Centered Trust Icon */}
      <div className="relative z-10 pt-2 flex flex-col items-center justify-center text-gold group-hover:text-gold-light transition-all duration-500 group-hover:scale-115">
        <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 drop-shadow-[0_2px_8px_rgba(200,150,46,0.6)] transition-transform duration-500 group-hover:rotate-3" />
      </div>

      {/* Sparkling Satellite Pin on Roof Apex */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold border border-white shadow-xs group-hover:scale-125 transition-transform duration-300" />
    </div>
  );
};

export default HouseTrustBadge;

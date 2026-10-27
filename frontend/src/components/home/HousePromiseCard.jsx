import React from 'react';

/**
 * HousePromiseCard Component
 * Modern Architectural Arch (Dome Vault) silhouette trust card.
 * Features an elegant vaulted curved top, rounded base, crisp emerald border,
 * floating apex circular icon badge, and clean, high-readability typography.
 */
export const HousePromiseCard = ({ icon: Icon, title, highlight, desc, idx }) => {
  return (
    <div className="relative group flex flex-col items-center justify-center text-center pt-9 sm:pt-10 pb-5 sm:pb-6 px-4 bg-white rounded-t-[42px] rounded-b-2xl border-2 border-[#0A5C55] hover:border-emerald-deep hover:bg-emerald-50/20 shadow-[0_4px_16px_rgba(10,92,85,0.08)] hover:shadow-[0_12px_28px_rgba(10,92,85,0.18)] transition-all duration-300 hover:-translate-y-1.5 min-h-[175px] sm:min-h-[188px] cursor-default">
      {/* Overlapping Apex Circular Badge: Clean White with Crisp Emerald Border & Icon */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-[#0A5C55] flex items-center justify-center text-[#0A5C55] shadow-xs group-hover:bg-[#0A5C55] group-hover:text-white group-hover:scale-110 transition-all duration-300 z-10">
        <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-300 group-hover:rotate-6" strokeWidth={2.2} />
      </div>

      {/* Card Content Area */}
      <div className="relative z-10 flex flex-col items-center w-full px-1">
        {/* Bold Title */}
        <h3 className="font-extrabold text-[12px] sm:text-[13px] tracking-wide text-emerald-deep uppercase font-sans mb-1.5 leading-snug">
          {title}
        </h3>

        {/* Optional Punchy Highlight Sub-badge */}
        {highlight && (
          <span className="text-[10.5px] font-semibold text-emerald tracking-tight mb-1.5">
            {highlight}
          </span>
        )}

        {/* Clean, readable description */}
        <p className="text-[11px] sm:text-[11.5px] text-stone-700 font-normal leading-relaxed max-w-[215px] mx-auto">
          {desc}
        </p>
      </div>

      {/* Subtle micro gold indicator line on hover */}
      <div className="relative z-10 w-0 group-hover:w-8 h-0.5 bg-gold rounded-full mt-2.5 transition-all duration-300" />
    </div>
  );
};

export default HousePromiseCard;

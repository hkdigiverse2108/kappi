import React, { useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { StarRating } from '../common/StarRating';

// heading, subheading and reviews come from the Homepage CMS (GET /api/home)
export const AutoScrollReviews = ({ heading, subheading, reviews = [] }) => {
  const scrollContainerRef = useRef(null);

  if (reviews.length === 0) return null;

  // Duplicate list to achieve continuous seamless marquee loop
  const marqueeList = [...reviews, ...reviews];

  return (
    <section className="py-14 sm:py-18 bg-[#FBF8F1] overflow-hidden relative border-b border-stone-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-center">
        {heading && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0c4a43] tracking-wide uppercase font-sans">
            {heading}
          </h2>
        )}
        {subheading && (
          <p className="text-stone-500 text-sm sm:text-base font-normal mt-2.5">
            {subheading}
          </p>
        )}
      </div>

      {/* Marquee Wrapper with soft edge fades */}
      <div className="relative w-full overflow-hidden group">
        {/* Left Fade Gradient Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-r from-[#FBF8F1] via-[#FBF8F1]/80 to-transparent z-10" />

        {/* Right Fade Gradient Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-l from-[#FBF8F1] via-[#FBF8F1]/80 to-transparent z-10" />

        {/* Auto-scrolling Track */}
        <div
          ref={scrollContainerRef}
          className="animate-reviews-scroll group-hover:[animation-play-state:paused] flex w-max gap-6 sm:gap-7 py-4 px-6"
        >
          {marqueeList.map((rev, idx) => (
            <div
              key={`${rev.id}-${idx}`}
              className="w-[300px] sm:w-[370px] h-[330px] p-7 sm:p-8 bg-white rounded-[28px] sm:rounded-[32px] border border-stone-200/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_40px_rgba(12,74,67,0.12)] flex flex-col justify-between shrink-0 transition-all duration-300 hover:-translate-y-1 cursor-default select-none relative"
            >
              {/* Card Top: Golden Stars + Decorative Green Quote Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  <StarRating value={rev.rating}fillClassName="fill-current text-[#f59e0b]" emptyClassName="text-stone-200" />
                </div>

                {/* Decorative Deep Green Quotation Marks */}
                <div className="text-[#0c4a43] opacity-90">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>

              {/* Review Testimonial Body */}
              <p className="text-stone-700 text-[13px] sm:text-sm leading-relaxed my-auto line-clamp-5 font-normal">
                {rev.comment}
              </p>

              {/* Bottom Customer Info */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rev.avatar && (
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-xs border border-stone-200/80"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm leading-tight">
                      {rev.author}
                    </h4>
                    {rev.city && (
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {rev.city.split(',')[0]}
                      </p>
                    )}
                  </div>
                </div>

                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AutoScrollReviews;

import React, { useState } from 'react';
import { Star } from 'lucide-react';

const clampRating = (value) => Math.max(0, Math.min(5, Number(value) || 0));

// Read-only stars; decimal ratings (e.g. 4.5, 4.3) fill the last star partly
export const StarRating = ({ value, className = 'w-4 h-4', fillClassName = 'text-gold fill-gold', emptyClassName = 'text-stone-300' }) => {
  const rating = clampRating(value);
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${className} ${emptyClassName}`} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${className} ${fillClassName}`} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

// Clickable stars: left half of a star = .5, right half = full star; the box allows any value like 4.3
export const StarRatingInput = ({ value, onChange, min = 1 }) => {
  const [hover, setHover] = useState(null);
  const rating = clampRating(value);
  const shown = hover ?? rating;

  const pick = (e, index) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    return e.clientX - left < width / 2 ? index + 0.5 : index + 1;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center gap-1" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, shown - i));
          return (
            <button
              key={i}
              type="button"
              onMouseMove={(e) => setHover(Math.max(min, pick(e, i)))}
              onClick={(e) => onChange(Math.max(min, pick(e, i)))}
              className="relative inline-block p-0 transition-transform hover:scale-110"
              aria-label={`Rate ${i + 1} stars`}
            >
              <Star className="w-6 h-6 text-stone-300 dark:text-stone-600" />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${fill * 100}%` }}>
                  <Star className="w-6 h-6 text-gold fill-gold" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <input
        type="number"
        min={min}
        max={5}
        step={0.1}
        value={rating}
        onChange={(e) => {
          if (e.target.value === '') return;
          onChange(Math.round(Math.max(min, Math.min(5, Number(e.target.value))) * 10) / 10);
        }}
        className="w-16 px-2 py-1.5 text-center font-bold bg-stone-50 dark:bg-stone-800 border rounded-lg"
        aria-label="Rating value"
      />
    </div>
  );
};

export default StarRating;

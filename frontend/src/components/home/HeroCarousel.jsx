import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Banner slides of the hero section; content saved before multiple banners existed
// has a single image + bannerLink, which becomes the one slide
export const getHeroSlides = (heroBanner) => {
  if (Array.isArray(heroBanner?.slides)) return heroBanner.slides;
  if (!heroBanner?.image) return [];
  return [{ id: 'slide-1', image: heroBanner.image, link: heroBanner.bannerLink || '', altText: heroBanner.altText || '', active: true }];
};

// Full links (https://...) open in a new tab; anything else is a page of this site
const isExternalLink = (link) => /^(https?:)?\/\//i.test(link);

const SlideLink = ({ link, altText, children }) => {
  const target = (link || '').trim() || '/';
  const className = 'block w-full h-full cursor-pointer';
  if (isExternalLink(target)) {
    return (
      <a href={target} target="_blank" rel="noopener noreferrer" className={className} aria-label={altText}>
        {children}
      </a>
    );
  }
  return (
    <Link to={target.startsWith('/') ? target : `/${target}`} className={className} aria-label={altText}>
      {children}
    </Link>
  );
};

// Home page hero: one or more banner images (Admin > Homepage CMS > Hero Banner),
// each opening its own link when clicked. Slides change automatically and pause on hover.
export const HeroCarousel = ({ slides, interval = 5 }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const count = slides.length;

  const goTo = (index) => setCurrent((index + count) % count);

  // Slides can be removed in the admin while this page is open
  useEffect(() => {
    if (current >= count) setCurrent(0);
  }, [count, current]);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % count), Math.max(2, Number(interval) || 5) * 1000);
    return () => clearTimeout(timer);
  }, [current, count, paused, interval]);

  const handleTouchEnd = (e) => {
    if (count < 2 || touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 40) goTo(current + (delta < 0 ? 1 : -1));
  };

  return (
    <div
      className="relative w-full group overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {/* All slides share one grid cell, so the banner keeps the height of the tallest image */}
      <div className="grid">
        {slides.map((slide, i) => (
          <div
            key={slide.id || i}
            className={`[grid-area:1/1] transition-opacity duration-700 ${i === current ? 'opacity-100 z-[1]' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={i !== current}
          >
            <SlideLink link={slide.link} altText={slide.altText}>
              <img
                src={slide.image}
                alt={slide.altText || ''}
                className="w-full h-auto max-h-[calc(100vh-106px)] block object-cover object-center"
                fetchPriority={i === 0 ? 'high' : 'auto'}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </SlideLink>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            aria-label="Previous banner"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-[2] w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-emerald-950 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            aria-label="Next banner"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-[2] w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-emerald-950 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id || i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/90'} shadow`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

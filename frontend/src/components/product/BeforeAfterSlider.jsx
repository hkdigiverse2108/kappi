import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Droplets,
  ShieldCheck,
  Feather,
  RefreshCw,
  Zap,
  Eye,
  Flame,
  Layers,
  Truck,
  RotateCcw,
  CreditCard,
  Heart,
  Leaf
} from 'lucide-react';

const renderBadgeIcon = (iconName) => {
  const cls = "w-5 h-5 text-emerald-deep";
  switch (iconName) {
    case 'Droplets': return <Droplets className={cls} />;
    case 'Sparkles': return <Sparkles className={cls} />;
    case 'ShieldCheck': return <ShieldCheck className={cls} />;
    case 'Truck': return <Truck className={cls} />;
    case 'RotateCcw': return <RotateCcw className={cls} />;
    case 'CreditCard': return <CreditCard className={cls} />;
    case 'Zap': return <Zap className={cls} />;
    case 'Leaf': return <Leaf className={cls} />;
    case 'Feather': return <Feather className={cls} />;
    case 'Eye': return <Eye className={cls} />;
    case 'Flame': return <Flame className={cls} />;
    case 'RefreshCw': return <RefreshCw className={cls} />;
    case 'Layers': return <Layers className={cls} />;
    case 'Heart': return <Heart className={cls} />;
    default: return <Sparkles className={cls} />;
  }
};

export const BeforeAfterSlider = ({ product, defaultPosition = 50 }) => {
  const [sliderPos, setSliderPos] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSurfaceIndex, setActiveSurfaceIndex] = useState(0);
  const containerRef = useRef(null);

  // Before/after proofs and the 3 feature badges are edited per product in Admin > Products
  const productSurfaces = useMemo(
    () =>
      (product?.beforeAfter || [])
        .filter((item) => item.before && item.after)
        .map((item) => ({
          title: item.surface || '',
          before: item.before,
          after: item.after,
          desc: item.description || ''
        })),
    [product]
  );

  const productBadges = useMemo(
    () =>
      (product?.featureBadges || []).map((badge) => ({
        icon: renderBadgeIcon(badge.icon),
        title: badge.title || '',
        subtitle: badge.subtitle || ''
      })),
    [product]
  );

  const currentSurface = productSurfaces[activeSurfaceIndex] || productSurfaces[0];

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const posPercent = (x / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, posPercent));
    setSliderPos(clamped);
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    if (e.touches && e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        updatePosition(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchcancel', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchcancel', handleMouseUp);
    };
  }, [isDragging, updatePosition]);

  // Nothing set for this product in the admin
  if (!productBadges.length && !currentSurface) return null;

  return (
    <div className="w-full space-y-4">
      {/* 3 Product-Specific Feature Badges */}
      {productBadges.length > 0 && (
      <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1">
        {productBadges.map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center text-center px-1">
            <div className="w-11 h-11 rounded-2xl bg-emerald-soft/80 flex items-center justify-center mb-1.5 shadow-xs border border-emerald/15 transition-transform hover:scale-105">
              {badge.icon}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-ink leading-tight">
              {badge.title}
            </span>
            <span className="text-[10px] text-muted hidden sm:block mt-0.5 leading-tight">
              {badge.subtitle}
            </span>
          </div>
        ))}
      </div>
      )}

      {/* Switch between proofs when the admin added more than one */}
      {productSurfaces.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {productSurfaces.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSurfaceIndex(idx)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                idx === activeSurfaceIndex
                  ? 'bg-emerald-deep text-white border-emerald-deep'
                  : 'bg-white text-ink border-gray-200 hover:border-emerald'
              }`}
            >
              {s.title || `Proof ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Interactive Before / After Slider */}
      {currentSurface && (
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-gray-200 shadow-sm group touch-none bg-neutral-100"
        role="slider"
        aria-label={`Before and after cleaning ${currentSurface.title}`}
        aria-valuenow={Math.round(sliderPos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSliderPos((p) => Math.max(0, p - 5));
          if (e.key === 'ArrowRight') setSliderPos((p) => Math.min(100, p + 5));
        }}
      >
        {/* Base After (Clean) Image */}
        <img
          src={currentSurface.after}
          alt={`Clean ${currentSurface.title}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
          loading="eager"
        />

        {/* Clipped Before (Dirty) Image on Top */}
        <div
          className="absolute inset-0 pointer-events-none will-change-[clip-path]"
          style={{
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
          }}
        >
          <img
            src={currentSurface.before}
            alt={`Dirty ${currentSurface.title} before cleaning`}
            className="w-full h-full object-cover pointer-events-none transition-opacity duration-300"
            loading="eager"
          />
        </div>

        {/* Vertical Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-neutral-900 pointer-events-none z-20 shadow-xs"
          style={{ left: `calc(${sliderPos}% - 1px)` }}
        />

        {/* Center Draggable Capsule Handle [ ||| ] */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-11 rounded-xl bg-[#262626] shadow-xl flex items-center justify-center gap-[3px] pointer-events-none z-30 transition-transform ${
            isDragging ? 'scale-110' : 'group-hover:scale-105'
          }`}
          style={{ left: `${sliderPos}%` }}
        >
          <span className="w-[1.5px] h-3.5 bg-white/90 rounded-full"></span>
          <span className="w-[1.5px] h-3.5 bg-white/90 rounded-full"></span>
          <span className="w-[1.5px] h-3.5 bg-white/90 rounded-full"></span>
        </div>

        {/* Before Badge */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <span className="inline-block bg-[#0f6b63] text-white font-bold text-xs sm:text-sm px-2.5 py-1 rounded-md shadow-sm">
            Before
          </span>
        </div>

        {/* After Badge */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="inline-block bg-[#0f6b63] text-white font-bold text-xs sm:text-sm px-2.5 py-1 rounded-md shadow-sm">
            After
          </span>
        </div>
      </div>
      )}

      {/* Surface / stain name and proof description from the admin */}
      {currentSurface && (currentSurface.title || currentSurface.desc) && (
        <div className="space-y-0.5">
          {currentSurface.title && <p className="text-sm font-bold text-ink">{currentSurface.title}</p>}
          {currentSurface.desc && <p className="text-xs text-muted leading-relaxed">{currentSurface.desc}</p>}
        </div>
      )}
    </div>
  );
};

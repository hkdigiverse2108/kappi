import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, MoveHorizontal } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';

export const BeforeAfterSlider = () => {
  const { beforeAfterSettings } = useAdminStore();
  // Items and labels come from the Homepage CMS (GET /api/home)
  const examples = (beforeAfterSettings?.items || []).filter((item) => item.active !== false);
  const [activeTab, setActiveTab] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const safeTab = activeTab >= examples.length ? 0 : activeTab;
  const currentExample = examples[safeTab] || examples[0] || {};

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  if (examples.length === 0) return null;

  return (
    <div className="w-full">
      {/* Surface Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveTab(idx);
              setSliderPosition(50);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === idx
                ? 'bg-emerald-deep text-white shadow-md shadow-emerald-deep/20 scale-105'
                : 'bg-white text-muted hover:text-ink hover:bg-emerald-soft border border-emerald-soft'
            }`}
          >
            {ex.surface}
          </button>
        ))}
      </div>

      {/* Slider Viewport Container */}
      <div className="max-w-4xl mx-auto">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          className="relative aspect-video sm:aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-soft select-none cursor-ew-resize bg-ink"
        >
          {/* AFTER Image (Full background) */}
          <img
            src={currentExample.after}
            alt={`${currentExample.surface} After KAPEE Clean`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* BEFORE Image (Clipped overlay) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={currentExample.before}
              alt={`${currentExample.surface} Before KAPEE Clean`}
              className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none"
              style={{
                width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                height: '100%'
              }}
            />
          </div>

          {/* Divider Handle Line */}
          <div
            className="absolute inset-y-0 w-1 bg-white shadow-2xl pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Draggable Circle Badge */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gold-gradient text-emerald-950 font-bold shadow-gold flex items-center justify-center border-2 border-white pointer-events-none">
              <MoveHorizontal className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Before Label Badge */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-ink/75 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase border border-white/20">
            {beforeAfterSettings?.beforeLabel}
          </div>

          {/* After Label Badge */}
          <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-emerald-deep/85 backdrop-blur-md text-gold-light text-xs font-bold tracking-wider uppercase border border-gold/40 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {beforeAfterSettings?.afterLabel}
          </div>

          {/* Bottom Caption Pill */}
          <div className="absolute bottom-4 inset-x-4 z-10 flex justify-center pointer-events-none">
            <div className="bg-ink/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs sm:text-sm text-center shadow-lg border border-white/10 max-w-lg">
              <span className="font-semibold text-gold-light">{currentExample.surface}:</span>{' '}
              {currentExample.description}
            </div>
          </div>
        </div>

        {/* Drag Hint */}
        {beforeAfterSettings?.dragHint && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted font-medium mt-3">
            <MoveHorizontal className="w-4 h-4 text-emerald" />
            <span>{beforeAfterSettings.dragHint}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterSlider;

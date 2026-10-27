import React, { useState, useEffect } from 'react';
import { announcementOffers } from '../../data/offers';
import { useUIStore } from '../../store/useUIStore';

export const AnnouncementBar = () => {
  const { announcementDismissed } = useUIStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcementDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcementOffers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcementDismissed]);

  if (announcementDismissed) return null;

  const currentOffer = announcementOffers[currentIndex];

  return (
    <div className="bg-emerald-deep text-gold border-b border-gold/20 text-xs md:text-sm font-medium py-2 px-4 transition-all duration-300 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        {/* Message ticker */}
        <div className="truncate px-2 select-none">
          <span className="inline-flex items-center justify-center gap-2 animate-fadeIn transition-all duration-300">
            {currentOffer.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;

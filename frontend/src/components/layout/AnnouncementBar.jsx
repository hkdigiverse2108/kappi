import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useAdminStore } from '../../admin/store/adminStore';

export const AnnouncementBar = () => {
  const { announcementDismissed } = useUIStore();
  // Messages come from Admin > CMS: Banners & Bar
  const messages = useAdminStore((state) => state.announcementBar?.messages) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcementDismissed || messages.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcementDismissed, messages.length]);

  if (announcementDismissed || messages.length === 0) return null;

  // The list can get shorter after an admin edit
  const currentOffer = messages[currentIndex % messages.length];

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

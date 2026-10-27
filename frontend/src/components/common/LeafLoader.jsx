import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.png';

export const LeafLoader = ({ onLoaded }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onLoaded) onLoaded();
    }, 750); // Under 1s as requested
    return () => clearTimeout(timer);
  }, [onLoaded]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ivory flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <div className="w-24 h-24 mb-4 relative flex items-center justify-center animate-pulse-subtle">
          <img
            src={logoImg}
            alt="KAPEE Enterprise"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Animated Brand Indicator */}
        <div className="w-36 h-1.5 bg-emerald-soft rounded-full overflow-hidden">
          <div className="h-full bg-gold-gradient rounded-full w-full animate-shine" />
        </div>

        <span className="text-[11px] font-bold text-emerald-deep tracking-widest uppercase mt-3">
          Cleaner Solutions, Brighter Living
        </span>
      </div>
    </div>
  );
};

export default LeafLoader;

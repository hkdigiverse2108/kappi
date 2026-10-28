import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useContactChannels, whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from '../../hooks/useContactChannels';

export const FloatingActions = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { whatsapp } = useContactChannels();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Number from the WhatsApp card in Admin > CMS: Contact Us Page; no card = no button
  const whatsappUrl = whatsappLink(whatsapp?.primaryText, WHATSAPP_DEFAULT_MESSAGE);

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-30 flex flex-col items-center gap-3">
      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="w-11 h-11 rounded-full bg-white/90 text-emerald-deep hover:bg-emerald hover:text-white shadow-lg border border-emerald-soft flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Authentic Official WhatsApp Floating Action Button */}
      {whatsappUrl && (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with KAPEE Support on WhatsApp"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative animate-whatsapp-pulse cursor-pointer"
      >
        {/* Animated pulse radar ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* Authentic Official WhatsApp Icon */}
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white pointer-events-none drop-shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-110" />

        {/* Tooltip on hover */}
        <span className="hidden md:group-hover:block absolute right-16 whitespace-nowrap bg-emerald-deep text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg border border-white/10 z-20">
          Chat with KAPEE on WhatsApp
        </span>
      </a>
      )}
    </div>
  );
};

export default FloatingActions;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAdminStore } from '../../admin/store/adminStore';
import { useContactChannels, whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from '../../hooks/useContactChannels';

// When the website was opened (every page load / reload / new tab starts again from here): the popup first comes
// DELAY seconds after that, even if the visitor moves between pages (or the checkout) meanwhile
const OPENED_AT = Date.now();
const DEFAULT_DELAY_SECONDS = 90;

// When the popup was last shown or closed since the website was opened; null = not shown yet.
// Kept in memory only, so opening the website again always starts the timing from the beginning.
let lastSeen = null;
const lastSeenAt = () => lastSeen;
const markSeen = () => {
  lastSeen = Date.now();
};

// Popup that is only one image filling the whole box. Clicking anywhere on it opens WhatsApp; tapping outside it (or Esc) closes it.
// Image, first delay and repeat time come from Admin > CMS: Banners & Bar > Website Popup; the WhatsApp number is the one from
// Admin > CMS: Contact Us Page (the same as the floating WhatsApp button).
export const WhatsAppPopup = () => {
  const popup = useAdminStore((s) => s.announcementBar?.popup);
  const { whatsapp } = useContactChannels();
  const [open, setOpen] = useState(false);
  // People who turned animations off in their device settings get a still popup
  const still = useReducedMotion();

  const url = whatsappLink(whatsapp?.primaryText, WHATSAPP_DEFAULT_MESSAGE);
  const ready = Boolean(popup?.enabled && popup.image && url);
  const delaySeconds = Number(popup?.delaySeconds) || DEFAULT_DELAY_SECONDS;
  const repeatSeconds = Number(popup?.repeatSeconds) || 0;

  const close = () => {
    markSeen();
    setOpen(false);
  };

  // First time: delaySeconds after the website opened. After that: repeatSeconds after the visitor last closed it
  // (0 = never again in this visit).
  useEffect(() => {
    if (!ready || open) return undefined;
    const last = lastSeenAt();
    const dueAt = last === null ? OPENED_AT + delaySeconds * 1000 : repeatSeconds > 0 ? last + repeatSeconds * 1000 : null;
    if (dueAt === null) return undefined;
    // Load the image before the popup opens so it appears complete
    const preload = new Image();
    preload.src = popup.image;
    const timer = setTimeout(() => {
      markSeen();
      setOpen(true);
    }, Math.max(0, dueAt - Date.now()));
    return () => clearTimeout(timer);
  }, [ready, open, delaySeconds, repeatSeconds, popup?.image]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && ready && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 backdrop-blur-sm bg-[radial-gradient(ellipse_at_center,rgba(3,46,42,0.55),rgba(0,0,0,0.82))]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative"
          >
            {/* Soft gold glow behind the card, gently breathing */}
            <motion.div
              aria-hidden="true"
              animate={still ? undefined : { opacity: [0.35, 0.75, 0.35], scale: [1, 1.04, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-4 rounded-[44px] bg-[#EBCB6B]/40 blur-2xl"
            />

            {/* Compact portrait card (about 340 x 500), smaller on small screens; lifts a little on hover */}
            <motion.a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              aria-label="Chat with KAPEE on WhatsApp"
              whileHover={still ? undefined : { y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative block w-[min(340px,88vw)] h-[min(500px,86vh)] rounded-[30px] p-[5px] bg-gold-gradient shadow-[0_26px_60px_rgba(0,0,0,0.55)] cursor-pointer"
            >
              {/* gold frame, then a thin white mat, then the photo */}
              <span className="block w-full h-full rounded-[25px] bg-white p-[3px]">
                <span className="relative block w-full h-full rounded-[22px] overflow-hidden">
                  <img
                    src={popup.image}
                    alt="Chat with us on WhatsApp"
                    className="block w-full h-full object-cover select-none"
                    draggable={false}
                  />
                  {/* a little depth at the bottom of the photo */}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  {/* light glint that sweeps across now and then */}
                  {!still && (
                    <motion.span
                      aria-hidden="true"
                      initial={{ x: '-140%' }}
                      animate={{ x: '320%' }}
                      transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.6, delay: 0.8 }}
                      className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                    />
                  )}
                </span>
              </span>
            </motion.a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppPopup;

import { useEffect } from 'react';

// Calls onOutside when a click/tap lands outside the element held by ref.
// Listens on document, so it works even inside containers with backdrop-filter
// (where `fixed inset-0` overlays get clipped to the container).
export const useClickOutside = (ref, isOpen, onOutside) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, isOpen, onOutside]);
};

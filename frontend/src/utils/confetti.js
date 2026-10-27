import confetti from 'canvas-confetti';

/**
 * Fires a celebratory confetti burst in brand colors: Emerald & Gold
 */
export const triggerCelebration = () => {
  const brandColors = ['#04403B', '#0A5C55', '#C8962E', '#EBCB6B', '#1E8E5A'];

  // Left cannon
  confetti({
    particleCount: 45,
    angle: 60,
    spread: 55,
    origin: { x: 0.1, y: 0.65 },
    colors: brandColors,
    zIndex: 99999,
  });

  // Right cannon
  confetti({
    particleCount: 45,
    angle: 120,
    spread: 55,
    origin: { x: 0.9, y: 0.65 },
    colors: brandColors,
    zIndex: 99999,
  });
};

export const triggerOrderCelebration = () => {
  const brandColors = ['#04403B', '#0A5C55', '#C8962E', '#EBCB6B', '#1E8E5A'];
  // A burst from each side, then one from the middle
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.7 },
    colors: brandColors,
    zIndex: 99999,
  });
  confetti({
    particleCount: 60,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.7 },
    colors: brandColors,
    zIndex: 99999,
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 90,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.4 },
      colors: brandColors,
      zIndex: 99999,
    });
  }, 400);
};

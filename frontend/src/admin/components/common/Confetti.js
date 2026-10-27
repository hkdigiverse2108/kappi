import confetti from 'canvas-confetti';

/**
 * Fires an elegant celebration burst in emerald (#04403B, #0A5C55, #138379)
 * and gold (#C8962E, #EBCB6B, #8F6414) colors.
 */
export const triggerKapeeCelebration = () => {
  const count = 70;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#04403B', '#0A5C55', '#138379', '#C8962E', '#EBCB6B', '#F4EEDF'],
    disableForReducedMotion: true,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

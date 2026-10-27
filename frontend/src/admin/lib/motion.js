/**
 * KAPEE Enterprise Admin Panel - Shared Motion & Animation Kit
 * Production-quality Framer Motion variants and transitions.
 */

export const transitions = {
  spring: { type: 'spring', damping: 25, stiffness: 300 },
  springBouncy: { type: 'spring', damping: 18, stiffness: 260 },
  smooth: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  fast: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  staggerFast: 0.05,
  staggerNormal: 0.08,
};

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1], when: 'beforeChildren', staggerChildren: 0.06 }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
  }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

export const cardHover = {
  rest: { y: 0, boxShadow: '0 4px 20px -2px rgba(4, 64, 59, 0.06)' },
  hover: {
    y: -3,
    boxShadow: '0 12px 30px -4px rgba(4, 64, 59, 0.12)',
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const buttonTap = {
  tap: { scale: 0.97 },
  hover: { scale: 1.01 }
};

export const iconButtonHover = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, transition: { duration: 0.15 } },
  tap: { scale: 0.92 }
};

export const drawerVariants = {
  closed: { x: '100%', opacity: 0.6 },
  open: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 28, stiffness: 280 }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
  }
};

export const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const modalVariants = {
  closed: { opacity: 0, scale: 0.94, y: 16 },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 24, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.18, ease: 'easeIn' }
  }
};

export const bulkBarVariants = {
  hidden: { y: 80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 22, stiffness: 300 }
  },
  exit: {
    y: 80,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const toastVariants = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 320 }
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 15,
    transition: { duration: 0.18 }
  }
};

export const rowVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    x: -20,
    height: 0,
    overflow: 'hidden',
    transition: { duration: 0.22 }
  }
};

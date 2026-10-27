import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Modern Smooth Scroll Reveal Wrappers powered by Framer Motion
 * Uses luxury cubic-bezier easing [0.16, 1, 0.3, 1] for apple-like fluid smoothness
 */

export const FadeIn = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 0.55,
  className = '',
  once = true
}) => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-25px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  once = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  className = ''
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-25px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren,
            delayChildren
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Sleek reading progress bar at the very top of viewport
 */
export const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-gold to-emerald-400 origin-left z-50 pointer-events-none shadow-xs"
      style={{ scaleX }}
    />
  );
};

export default FadeIn;

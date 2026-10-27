import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { backdropVariants, drawerVariants } from '../../lib/motion';

export const SideDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-xl'
}) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="exit"
              className={`w-screen ${width} bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col z-20`}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/40">
                <div>
                  <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-muted dark:text-stone-400 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {children}
              </div>

              {/* Sticky Footer Actions */}
              {footer && (
                <div className="px-6 py-4 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-950/80 flex items-center justify-end gap-3 backdrop-blur-md">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

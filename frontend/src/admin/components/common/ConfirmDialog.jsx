import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { backdropVariants, modalVariants } from '../../lib/motion';

export const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Are you sure you wish to proceed?',
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
          />

          <motion.div
            variants={modalVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 z-10 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-ink dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${isDestructive ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1 pr-6">
                <h3 className="text-lg font-serif font-bold text-ink dark:text-stone-100">
                  {title}
                </h3>
                <p className="text-sm text-muted dark:text-stone-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-sm ${
                  isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-rose-600/20'
                    : 'bg-emerald-deep hover:bg-emerald-800 active:scale-95 shadow-emerald-900/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

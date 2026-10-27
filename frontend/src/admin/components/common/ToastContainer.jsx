import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Undo2, ShoppingBag } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { toastVariants } from '../../lib/motion';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAdminStore();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'order':
        return (
          <span className="w-9 h-9 rounded-xl bg-[#FDF8E8] dark:bg-[#2A2410] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-[#8F6414] dark:text-[#EBCB6B]" />
          </span>
        );
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className={`pointer-events-auto bg-white dark:bg-stone-900 border shadow-xl rounded-2xl p-4 flex items-center justify-between gap-3 text-sm text-ink dark:text-stone-100 backdrop-blur-md ${
              toast.type === 'order' ? 'border-[#C8962E]/50 ring-2 ring-[#C8962E]/15' : 'border-stone-200 dark:border-stone-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {getIcon(toast.type)}
              <div>
                <p className="font-semibold text-xs text-stone-900 dark:text-stone-100">{toast.title}</p>
                {toast.message && <p className="text-xs text-muted dark:text-stone-400 mt-0.5">{toast.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.action && (
                <button
                  onClick={() => {
                    navigate(toast.action.to);
                    removeToast(toast.id);
                  }}
                  className="text-xs font-semibold text-white bg-emerald-deep hover:bg-emerald-800 px-2.5 py-1 rounded-lg"
                >
                  {toast.action.label}
                </button>
              )}
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo();
                    removeToast(toast.id);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-deep dark:text-emerald-400 hover:underline px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

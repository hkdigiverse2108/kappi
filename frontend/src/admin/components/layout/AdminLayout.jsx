import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Save } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { CommandPalette } from '../common/CommandPalette';
import { ToastContainer } from '../common/ToastContainer';
import { useAdminStore } from '../../store/adminStore';
import { pageVariants } from '../../lib/motion';

export const AdminLayout = () => {
  const location = useLocation();
  const { sidebarCollapsed, darkMode, hasUnsavedChanges, setHasUnsavedChanges } = useAdminStore();

  // Apply dark mode class and data-theme to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className={`admin-scope min-h-screen bg-bg text-text font-sans transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Top Gold Progress Loading Indicator */}
      <motion.div
        key={location.pathname}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-600 via-gold to-gold-light z-50 pointer-events-none"
      />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Top Bar */}
      <AdminTopBar />

      {/* Main Content Area */}
      <div
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-6">
          {/* Animated Page Outlet */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Unsaved Changes Bar */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-ink text-white dark:bg-stone-900 border border-stone-700 shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium">You have unsaved form changes</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasUnsavedChanges(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => setHasUnsavedChanges(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Global Toast Notifications with Undo */}
      <ToastContainer />
    </div>
  );
};

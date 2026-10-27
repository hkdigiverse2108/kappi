import React, { useState } from 'react';
import { Flag, Plus, Trash2, Edit, Clock, Sparkles, Save } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { confirmDelete } from '../../../store/useConfirmStore';

export const BannersPage = () => {
  const { addToast } = useAdminStore();
  const [messages, setMessages] = useState([
    { id: '1', text: '✨ Festive Offer: Use CLEAN50 for ₹50 OFF on orders above ₹499!', active: true, showCountdown: false },
    { id: '2', text: '🚚 FREE Pan-India Shipping on all orders above ₹499!', active: true, showCountdown: false },
    { id: '3', text: '⚡ Diwali Flash Sale Ends in 04:32:19 • Extra 15% OFF with code KAPEEFIRST', active: false, showCountdown: true }
  ]);

  const [exitPopup, setExitPopup] = useState({
    title: 'Wait! Don’t leave your stains behind 🧼',
    subtitle: 'Get an instant 10% OFF on your first KAPEE Magic Eraser pack right now.',
    couponCode: 'SPARKLE10',
    enabled: true
  });

  const handleSaveAll = () => {
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Banners Saved',
      message: 'Announcement bar and exit popup settings updated successfully.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            CMS: Banners & Announcement Bar
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Top scrolling notification bar messages, promotional banners, and exit-intent popup triggers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Banners</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcement Bar Items */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100">
              Top Announcement Ticker
            </h3>
            <button
              onClick={() => {
                const text = prompt('Enter announcement message:');
                if (text) {
                  setMessages([...messages, { id: Date.now().toString(), text, active: true, showCountdown: false }]);
                  addToast({ type: 'success', title: 'Ticker Message Added', message: 'Published to top announcement bar.' });
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-deep text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Message</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {messages.map((m) => (
              <div key={m.id} className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border flex items-center justify-between gap-3">
                <span className="font-medium text-stone-800 dark:text-stone-200">{m.text}</span>
                <button
                  onClick={() =>
                    confirmDelete({
                      title: 'Delete Message?',
                      message: `Delete "${m.text}" from the announcement ticker?`,
                      onConfirm: () => {
                        setMessages(messages.filter((item) => item.id !== m.id));
                        addToast({ type: 'info', title: 'Message Removed', message: 'Removed message from ticker.' });
                      }
                    })
                  }
                  className="text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Exit Intent Popup Config */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100">
              Exit-Intent Discount Popup
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Popup Headline</label>
              <input
                type="text"
                value={exitPopup.title}
                onChange={(e) => setExitPopup({ ...exitPopup, title: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Promo Code</label>
              <input
                type="text"
                value={exitPopup.couponCode}
                onChange={(e) => setExitPopup({ ...exitPopup, couponCode: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

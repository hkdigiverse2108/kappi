import React, { useEffect, useState } from 'react';
import { Flag, Plus, Trash2, Edit, Clock, Sparkles, Save, Check, X } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { confirmDelete } from '../../../store/useConfirmStore';

export const BannersPage = () => {
  const { addToast, saveAnnouncementMessages } = useAdminStore();
  // Ticker messages from the backend, shown in the website's top announcement bar
  const messages = useAdminStore((state) => state.announcementBar?.messages) || [];

  // Message being typed: editingId is a message id, 'new' while adding, or null
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    useAdminStore.getState().loadAnnouncementBar();
  }, []);

  const startEditing = (id, text = '') => {
    setEditingId(id);
    setDraft(text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft('');
  };

  // The store shows an error toast and reloads the messages from the backend when a save fails
  const handleSaveAll = async () => {
    try {
      await saveAnnouncementMessages(messages, 'Saved Announcement Bar');
    } catch {
      return;
    }
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Banners Saved',
      message: 'Announcement bar settings updated successfully.'
    });
  };

  // Saves the message being added or edited
  const handleSaveMessage = async () => {
    const text = draft.trim();
    if (!text) {
      addToast({ type: 'error', title: 'Message Required', message: 'Please type the announcement message.' });
      return;
    }
    const isNew = editingId === 'new';
    const nextMessages = isNew
      ? [...messages, { id: `msg-${Date.now()}`, text }]
      : messages.map((m) => (m.id === editingId ? { ...m, text } : m));
    cancelEditing();
    try {
      await saveAnnouncementMessages(nextMessages, isNew ? `Added Announcement "${text}"` : `Updated Announcement "${text}"`);
    } catch {
      return;
    }
    addToast(
      isNew
        ? { type: 'success', title: 'Ticker Message Added', message: 'Published to top announcement bar.' }
        : { type: 'success', title: 'Ticker Message Updated', message: 'Saved changes to the announcement bar.' }
    );
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveMessage();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Text box with Save / Cancel, used for adding and for editing a message
  const renderEditor = () => (
    <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-emerald-deep/60 flex items-center gap-2">
      <input
        type="text"
        autoFocus
        value={draft}
        maxLength={300}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleEditorKeyDown}
        placeholder="e.g. 🚚 FREE Shipping across India on orders above ₹499"
        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A5C55]"
      />
      <button
        type="button"
        onClick={handleSaveMessage}
        title="Save (Enter)"
        className="p-1.5 rounded-lg bg-emerald-deep hover:bg-emerald-800 text-white shrink-0"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={cancelEditing}
        title="Cancel (Esc)"
        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0 dark:hover:text-stone-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  const handleDeleteMessage = async (id) => {
    try {
      await saveAnnouncementMessages(messages.filter((item) => item.id !== id), `Deleted Announcement ${id}`);
    } catch {
      return;
    }
    addToast({ type: 'info', title: 'Message Removed', message: 'Removed message from ticker.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            CMS: Banners & Announcement Bar
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Top scrolling notification bar messages, and promotional banners.
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
              onClick={() => startEditing('new')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-deep text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Message</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {messages.map((m) => (
              editingId === m.id ? (
                <React.Fragment key={m.id}>{renderEditor()}</React.Fragment>
              ) : (
              <div key={m.id} className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border flex items-center justify-between gap-3">
                <span
                  onClick={() => startEditing(m.id, m.text)}
                  title="Click to edit"
                  className="font-medium text-stone-800 dark:text-stone-200 cursor-text hover:text-emerald-deep dark:hover:text-emerald-400"
                >
                  {m.text}
                </span>
                <button
                  onClick={() =>
                    confirmDelete({
                      title: 'Delete Message?',
                      message: `Delete "${m.text}" from the announcement ticker?`,
                      onConfirm: () => handleDeleteMessage(m.id)
                    })
                  }
                  className="text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              )
            ))}
            {editingId === 'new' && renderEditor()}
          </div>
        </div>
      </div>
    </div>
  );
};

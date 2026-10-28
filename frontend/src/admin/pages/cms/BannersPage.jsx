import React, { useEffect, useState } from 'react';
import { Flag, Plus, Trash2, Edit, Clock, Sparkles, Save, Check, X, ImagePlus, MessageCircle } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { confirmDelete } from '../../../store/useConfirmStore';
import { uploadImage } from '../../../api/homeApi';

const EMPTY_POPUP = { enabled: false, image: '', delaySeconds: 90, repeatSeconds: 0 };

export const BannersPage = () => {
  const { addToast, saveAnnouncementMessages, saveAnnouncementPopup } = useAdminStore();
  // Ticker messages from the backend, shown in the website's top announcement bar
  const messages = useAdminStore((state) => state.announcementBar?.messages) || [];

  // Message being typed: editingId is a message id, 'new' while adding, or null
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  // WhatsApp popup: an image shown some seconds after the website opens; clicking it opens WhatsApp
  const savedPopup = useAdminStore((state) => state.announcementBar?.popup);
  const [popupForm, setPopupForm] = useState(null);
  const [uploadingPopupImage, setUploadingPopupImage] = useState(false);
  const [savingPopup, setSavingPopup] = useState(false);
  // announcementBar arrives after the first render
  const announcementLoaded = useAdminStore((state) => !!state.announcementBar);
  useEffect(() => {
    if (announcementLoaded && !popupForm) setPopupForm({ ...EMPTY_POPUP, ...savedPopup });
  }, [announcementLoaded, savedPopup, popupForm]);

  const handlePopupImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid File', message: 'Please select an image (PNG, JPG, WebP).' });
      return;
    }
    setUploadingPopupImage(true);
    try {
      const url = await uploadImage(file);
      setPopupForm((f) => ({ ...f, image: url }));
    } catch (err) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setUploadingPopupImage(false);
    }
  };

  // Returns the cleaned popup settings, or null (after a toast) when something is wrong
  const validatePopup = () => {
    if (!popupForm) return null;
    const delaySeconds = Math.round(Number(popupForm.delaySeconds)) || 90;
    if (popupForm.enabled && !popupForm.image) {
      addToast({ type: 'error', title: 'Image Required', message: 'Upload the popup image before switching it on.' });
      return null;
    }
    if (delaySeconds < 5 || delaySeconds > 3600) {
      addToast({ type: 'error', title: 'Check the Delay', message: 'The first delay must be between 5 and 3600 seconds.' });
      return null;
    }
    const repeatSeconds = Math.round(Number(popupForm.repeatSeconds)) || 0;
    if (repeatSeconds !== 0 && (repeatSeconds < 10 || repeatSeconds > 86400)) {
      addToast({ type: 'error', title: 'Check the Repeat Time', message: 'Use 0 (only once) or a time between 10 and 86400 seconds.' });
      return null;
    }
    return { ...popupForm, delaySeconds, repeatSeconds };
  };

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
  // One button saves the whole page: ticker messages and the website popup
  const handleSaveAll = async () => {
    const popup = validatePopup();
    if (popupForm && !popup) return;
    setSavingPopup(true);
    try {
      await saveAnnouncementMessages(messages, 'Saved Announcement Bar');
      if (popup) {
        await saveAnnouncementPopup(popup);
        setPopupForm(popup);
      }
    } catch {
      return;
    } finally {
      setSavingPopup(false);
    }
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Banners Saved',
      message: 'Announcement bar and website popup updated successfully.'
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
          disabled={savingPopup}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{savingPopup ? 'Saving...' : 'Save Banners'}</span>
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

        {/* WhatsApp popup */}
        {popupForm && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  Website Popup (opens WhatsApp)
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Shown once per visit, a while after the website opens. Clicking the image opens WhatsApp chat.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={popupForm.enabled}
                aria-label="Show the popup"
                onClick={() => setPopupForm({ ...popupForm, enabled: !popupForm.enabled })}
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${popupForm.enabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${popupForm.enabled ? 'translate-x-4' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Image */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Popup Image</label>
                <div className="flex items-start gap-3">
                  <div className="w-28 shrink-0 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40 overflow-hidden flex items-center justify-center min-h-[7rem]">
                    {popupForm.image ? (
                      <img src={popupForm.image} alt="Popup preview" className="w-full h-auto block" />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-stone-300" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-emerald-500 hover:text-emerald-deep font-semibold cursor-pointer transition-colors">
                      <ImagePlus className="w-4 h-4" />
                      {uploadingPopupImage ? 'Uploading...' : popupForm.image ? 'Change Image' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handlePopupImage} disabled={uploadingPopupImage} className="hidden" />
                    </label>
                    {popupForm.image && (
                      <button
                        type="button"
                        onClick={() => setPopupForm({ ...popupForm, image: '' })}
                        className="block text-[11px] font-semibold text-stone-400 hover:text-rose-600"
                      >
                        Remove image
                      </button>
                    )}
                    <p className="text-[11px] text-stone-400">The whole popup is this image, so use a ready-made banner (portrait or square works best).</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">First time, after (seconds)</label>
                  <input
                    type="number"
                    min={5}
                    max={3600}
                    value={popupForm.delaySeconds}
                    onChange={(e) => setPopupForm({ ...popupForm, delaySeconds: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  />
                  <p className="text-[11px] text-stone-400">Counted from when the website is opened.</p>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">Then again, every (seconds)</label>
                  <input
                    type="number"
                    min={0}
                    max={86400}
                    value={popupForm.repeatSeconds}
                    onChange={(e) => setPopupForm({ ...popupForm, repeatSeconds: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  />
                  <p className="text-[11px] text-stone-400">Counted from when the visitor closes it. 0 = show only once.</p>
                </div>
              </div>
              <p className="text-[11px] text-stone-400">
                Clicking the popup opens WhatsApp on the number saved in CMS: Contact Us Page (the same as the floating WhatsApp button). If that page has no WhatsApp number, the popup is not shown.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

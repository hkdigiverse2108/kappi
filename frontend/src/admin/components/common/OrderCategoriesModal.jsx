import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, Check, Tags } from 'lucide-react';
import { backdropVariants, modalVariants } from '../../lib/motion';
import { useAdminStore } from '../../store/adminStore';
import { confirmDelete } from '../../../store/useConfirmStore';

// Tag colours (same keys as the backend ORDER_CATEGORY_COLORS)
export const CATEGORY_COLORS = {
  emerald: { dot: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900' },
  blue: { dot: 'bg-blue-500', tag: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900' },
  amber: { dot: 'bg-amber-500', tag: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900' },
  rose: { dot: 'bg-rose-500', tag: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900' },
  violet: { dot: 'bg-violet-500', tag: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900' },
  stone: { dot: 'bg-stone-500', tag: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700' }
};

export const OrderCategoryTag = ({ category }) => {
  if (!category) return null;
  const color = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.stone;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${color.tag}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
      {category.name}
    </span>
  );
};

const ColorPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5">
    {Object.entries(CATEGORY_COLORS).map(([key, c]) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`w-5 h-5 rounded-full ${c.dot} transition-transform ${
          value === key ? 'ring-2 ring-offset-2 ring-stone-400 dark:ring-offset-stone-900 scale-110' : 'opacity-70 hover:opacity-100'
        }`}
        title={key}
        aria-label={`Colour ${key}`}
      />
    ))}
  </div>
);

const inputClass =
  'w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-ink dark:text-stone-100 focus:outline-none focus:border-emerald-500';

// Popup to add, rename, recolour and delete order categories
export const OrderCategoriesModal = ({ isOpen, onClose: closeModal }) => {
  const { orderCategories, orders, addOrderCategory, saveOrderCategory, deleteOrderCategory, addToast } = useAdminStore();
  // One form for adding and editing: `editingId` is the category being edited (null = adding a new one)
  const [form, setForm] = useState({ name: '', color: 'emerald' });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const onClose = () => {
    resetForm();
    closeModal();
  };

  const orderCount = (id) => orders.filter((o) => o.categoryId === id).length;

  const run = async (action, successMessage) => {
    setBusy(true);
    try {
      await action();
      if (successMessage) addToast({ type: 'success', title: 'Categories', message: successMessage });
      return true;
    } catch (err) {
      addToast({ type: 'error', title: 'Not Saved', message: err.message });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', color: form.color });
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, color: category.color });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const ok = editingId
      ? await run(() => saveOrderCategory(editingId, { name, color: form.color }), `"${name}" saved.`)
      : await run(() => addOrderCategory({ name, color: form.color }), `"${name}" added.`);
    if (ok) resetForm();
  };

  const handleDelete = (category) => {
    const count = orderCount(category.id);
    confirmDelete({
      title: `Delete "${category.name}"?`,
      message: count
        ? `${count} order(s) are in this category. They will stay, but without a category.`
        : 'This category is not used by any order.',
      onConfirm: async () => {
        if (await run(() => deleteOrderCategory(category.id), `"${category.name}" deleted.`) && editingId === category.id) {
          resetForm();
        }
      }
    });
  };

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
            className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 z-10 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-deep dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Tags className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-ink dark:text-stone-100">Order Categories</h3>
                  <p className="text-[11px] text-stone-400">Tag orders (e.g. Manual Order, WhatsApp, Wholesale) and filter by them. Website orders go in the default category.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-ink dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add / edit */}
            <form
              onSubmit={handleSubmit}
              className={`p-5 space-y-2.5 border-b border-stone-100 dark:border-stone-800 text-xs transition-colors ${
                editingId ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
              }`}
            >
              {editingId && <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Editing category</p>}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.name}
                  maxLength={40}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && editingId) resetForm();
                  }}
                  placeholder="New category name, e.g. Manual Order"
                  className={inputClass}
                />
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-2 rounded-xl font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 shrink-0"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={busy || !form.name.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Save' : 'Add'}
                </button>
              </div>
              <ColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
            </form>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 text-xs">
              {orderCategories.length === 0 ? (
                <p className="py-8 text-center text-stone-400">No categories yet. Add your first one above.</p>
              ) : (
                <ul className="space-y-1">
                  {orderCategories.map((c) => (
                    <li
                      key={c.id}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl ${
                        editingId === c.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/50'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <OrderCategoryTag category={c} />
                        {c.isDefault && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[9px] font-bold uppercase tracking-wider"
                            title="Every website order goes here. You can rename it, but not delete it."
                          >
                            Default
                          </span>
                        )}
                        <span className="text-[11px] text-stone-400 whitespace-nowrap">{orderCount(c.id)} order(s)</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-deep hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Edit"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {!c.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete"
                            aria-label={`Delete ${c.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderCategoriesModal;

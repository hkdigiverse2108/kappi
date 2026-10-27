import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  ArrowUpDown,
  Tag,
  Copy,
  FolderPlus,
  X,
  Save,
  FileText
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { SideDrawer } from '../components/common/SideDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { CustomSelect } from '../components/common/CustomSelect';

// Page text edited in the "FAQ Page Text" box (questions and categories are saved separately; SEO is in Admin > SEO)
const PAGE_FIELDS = [
  { key: 'badge', label: 'Top Badge Text', placeholder: 'Help & Customer Support' },
  { key: 'heading', label: 'Main Headline (H1)', placeholder: 'Frequently Asked Questions' },
  { key: 'subheading', label: 'Subheading', placeholder: 'Everything you need to know about our products...', wide: true },
  { key: 'searchPlaceholder', label: 'Search Box Placeholder', placeholder: 'Search question (e.g. sneakers, water, shipping, COD)...', wide: true },
  { key: 'helpTitle', label: 'Help Box Heading', placeholder: 'Still Have a Question?' },
  { key: 'helpText', label: 'Help Box Text', placeholder: 'Our customer happiness team is here to assist you...' }
];
const toPageForm = (page) => Object.fromEntries(PAGE_FIELDS.map(({ key }) => [key, page?.[key] || '']));

export const FAQPage = () => {
  const {
    faqPage,
    updateFaqPage,
    addFaq,
    updateFaq,
    deleteFaq,
    addFaqCategory,
    deleteFaqCategory,
    addToast
  } = useAdminStore();

  const faqs = faqPage?.faqs || [];

  // Page text form, filled once the latest saved page has loaded from the backend
  const [pageForm, setPageForm] = useState(null);

  useEffect(() => {
    const { loadFaqPage } = useAdminStore.getState();
    loadFaqPage().then(() => {
      const loaded = useAdminStore.getState().faqPage;
      if (loaded) setPageForm(toPageForm(loaded));
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoriesList = faqPage?.categories || [];

  const [newCatInputOpen, setNewCatInputOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);

  // Category deletion confirmation state
  const [catToDelete, setCatToDelete] = useState(null);
  const [deleteCatConfirmOpen, setDeleteCatConfirmOpen] = useState(false);

  // Drawer
  const [faqDrawerOpen, setFaqDrawerOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    published: true
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // The store shows an error toast and reloads the FAQs from the backend when a save fails
  const handleAddNewCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    setSelectedCategory(trimmed);
    setNewCatName('');
    setNewCatInputOpen(false);
    if (categoriesList.includes(trimmed)) return;
    try {
      await addFaqCategory(trimmed);
      addToast({
        type: 'success',
        title: 'Category Created',
        message: `Added "${trimmed}" to FAQ categories.`
      });
    } catch {
      // already reported by the store
    }
  };

  const handlePromptDeleteCategory = (e, cat) => {
    e.stopPropagation();
    if (categoriesList.length <= 1) {
      addToast({
        type: 'error',
        title: 'Cannot delete',
        message: 'At least one FAQ category must remain.'
      });
      return;
    }
    setCatToDelete(cat);
    setDeleteCatConfirmOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!catToDelete) return;
    const cat = catToDelete;
    if (selectedCategory === cat) {
      setSelectedCategory('All');
    }
    setCatToDelete(null);
    setDeleteCatConfirmOpen(false);
    try {
      await deleteFaqCategory(cat);
      addToast({
        type: 'info',
        title: 'Category Removed',
        message: `Category "${cat}" has been deleted.`
      });
    } catch {
      // already reported by the store
    }
  };

  const handleOpenDrawer = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || categoriesList[0] || '',
        published: faq.published ?? true
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        question: '',
        answer: '',
        category: selectedCategory !== 'All' ? selectedCategory : categoriesList[0] || '',
        published: true
      });
    }
    // With no categories yet, the first question starts a new one
    setIsCustomCategoryMode(categoriesList.length === 0);
    setFaqDrawerOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      addToast({ type: 'error', title: 'Fields missing', message: 'Question and answer are required.' });
      return;
    }
    const categoryToSave = faqForm.category.trim();
    if (!categoryToSave) {
      addToast({ type: 'error', title: 'Category missing', message: 'Please choose or type a category.' });
      return;
    }

    // A new category is added to the list by the backend when the question is saved
    const payload = { ...faqForm, question: faqForm.question.trim(), answer: faqForm.answer.trim(), category: categoryToSave };
    setFaqDrawerOpen(false);
    try {
      if (editingFaq) {
        await updateFaq(editingFaq.id, payload);
        addToast({ type: 'success', title: 'FAQ Updated', message: 'Saved question changes.' });
      } else {
        await addFaq(payload);
        triggerKapeeCelebration();
        addToast({ type: 'success', title: 'FAQ Added', message: 'Published new FAQ entry to storefront.' });
      }
    } catch {
      // already reported by the store
    }
  };

  const handleSavePageText = async () => {
    if (!pageForm) return;
    try {
      await updateFaqPage(pageForm);
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'FAQs Saved',
        message: 'FAQ page text saved successfully.'
      });
    } catch {
      // already reported by the store
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Manage customer guidance, product surface safety instructions, and chemical-free care notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSavePageText}
            disabled={!pageForm}
            title="Saves the page text below; questions save as soon as you add or edit them"
            className="disabled:opacity-60 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save FAQs</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs by question or answer keyword..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {/* 'All' Category */}
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-emerald-deep text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            All
          </button>

          {/* Dynamic Category Pills with Delete Option */}
          {categoriesList.map((c) => {
            const isSelected = selectedCategory === c;
            return (
              <div
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-deep text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 bg-stone-100/70 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700'
                }`}
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={(e) => handlePromptDeleteCategory(e, c)}
                  title={`Delete category "${c}"`}
                  className={`p-1 rounded transition-colors ${
                    isSelected
                      ? 'text-white/70 hover:text-white hover:bg-white/20'
                      : 'text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add Category Button / Inline Input */}
          {newCatInputOpen ? (
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="text"
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNewCategory();
                  if (e.key === 'Escape') setNewCatInputOpen(false);
                }}
                placeholder="New Category..."
                className="px-2.5 py-1 bg-white dark:bg-stone-800 border border-emerald-400 rounded-lg text-xs font-medium focus:outline-none w-36"
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="px-2 py-1 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-emerald-800"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewCatInputOpen(false);
                  setNewCatName('');
                }}
                className="p-1 text-stone-400 hover:text-stone-600 text-xs dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNewCatInputOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-deep dark:text-emerald-400 border border-dashed border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Category</span>
            </button>
          )}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => (
          <div
            key={faq.id}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-2 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {faq.category}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">#{idx + 1}</span>
                  {faq.published === false && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                      Hidden
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {faq.question}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenDrawer(faq)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-deep hover:bg-emerald-50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                  title="Edit question"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setFaqToDelete(faq);
                    setDeleteConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border">
            <HelpCircle className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-xs text-stone-500 font-medium">No FAQs found matching your search.</p>
          </div>
        )}
      </div>

      {/* FAQ Page Text */}
      {pageForm && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
              <span>FAQ Page Text</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Headline and help box of the /faqs page. Click "Save FAQs" to apply. Google / sharing details are in SEO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
            {PAGE_FIELDS.map(({ key, label, placeholder, wide }) => (
              <div key={key} className={`space-y-1 ${wide ? 'md:col-span-2' : ''}`}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  {label}
                </label>
                <input
                  type="text"
                  value={pageForm[key]}
                  onChange={(e) => setPageForm({ ...pageForm, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side Drawer for Add / Edit */}
      <SideDrawer
        isOpen={faqDrawerOpen}
        onClose={() => setFaqDrawerOpen(false)}
        title={editingFaq ? 'Edit FAQ Item' : 'Create New FAQ Item'}
        subtitle="Publicly visible across Storefront Help Center and Product Details"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setFaqDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFaq}
              className="px-4 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs"
            >
              Save Question
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Question *</label>
            <input
              type="text"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              placeholder="e.g. Do I need detergent or soap with KAPEE erasers?"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Category *</label>
              <button
                type="button"
                onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                className="text-[11px] font-semibold text-emerald-deep dark:text-emerald-400 hover:underline"
              >
                {isCustomCategoryMode ? '← Choose Existing' : '+ Type New Category'}
              </button>
            </div>

            {isCustomCategoryMode ? (
              <input
                type="text"
                autoFocus
                value={faqForm.category}
                onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                placeholder="e.g. Sneaker Care & Shoes"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            ) : (
              <CustomSelect
                value={faqForm.category}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setIsCustomCategoryMode(true);
                    setFaqForm({ ...faqForm, category: '' });
                  } else {
                    setFaqForm({ ...faqForm, category: val });
                  }
                }}
                options={[
                  ...categoriesList.map((c) => ({ value: c, label: c })),
                  { value: '__custom__', label: '+ Create New Category...' }
                ]}
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Answer *</label>
            <textarea
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              rows={5}
              placeholder="Detailed explanation with usage precautions..."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Visible on Website</span>
            <input
              type="checkbox"
              checked={faqForm.published}
              onChange={(e) => setFaqForm({ ...faqForm, published: e.target.checked })}
              className="w-4 h-4 accent-emerald-deep rounded"
            />
          </div>
        </div>
      </SideDrawer>

      {/* Delete FAQ Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? It will no longer display in search or storefront."
        onConfirm={() => {
          if (faqToDelete) {
            deleteFaq(faqToDelete.id);
            addToast({
              type: 'info',
              title: 'FAQ Deleted',
              message: 'Question removed from FAQ catalog.'
            });
          }
        }}
      />

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={deleteCatConfirmOpen}
        onClose={() => {
          setDeleteCatConfirmOpen(false);
          setCatToDelete(null);
        }}
        title={`Delete Category "${catToDelete}"?`}
        message={`Are you sure you want to delete the category "${catToDelete}"? Any FAQs currently under this category will automatically be reassigned.`}
        confirmText="Delete Category"
        danger
        onConfirm={handleConfirmDeleteCategory}
      />
    </div>
  );
};

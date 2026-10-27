import React, { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  UploadCloud,
  Check,
  Leaf,
  ShieldCheck,
  Heart,
  Sparkles,
  Zap,
  Droplets,
  Star,
  Truck
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { SideDrawer } from '../../components/common/SideDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { CustomSelect } from '../../components/common/CustomSelect';
import { uploadImage } from '../../../api/homeApi';

const ICON_OPTIONS = [
  { label: 'Leaf (Chemical-Free / Eco)', value: 'Leaf', icon: Leaf },
  { label: 'ShieldCheck (Made in India / Safety)', value: 'ShieldCheck', icon: ShieldCheck },
  { label: 'Heart (Gentle on Surfaces / Love)', value: 'Heart', icon: Heart },
  { label: 'Sparkles (Honest Pricing / Magic)', value: 'Sparkles', icon: Sparkles },
  { label: 'Zap (Instant Speed / High Density)', value: 'Zap', icon: Zap },
  { label: 'Droplets (Water-Activated / Purity)', value: 'Droplets', icon: Droplets },
  { label: 'Star (Premium Quality)', value: 'Star', icon: Star },
  { label: 'Truck (Fast Delivery)', value: 'Truck', icon: Truck }
];

// Page-level fields edited on this screen (the pillar cards are saved separately)
const PAGE_FIELDS = [
  'heroBadge', 'heroTitle', 'heroSubtext',
  'storyHeading', 'storyParagraph1', 'storyParagraph2', 'storyParagraph3', 'storyImage', 'storyImageAlt',
  'valuesHeading', 'valuesSubtext',
  'ctaHeading', 'ctaSubtext', 'ctaButtonText', 'ctaButtonLink'
];
const toPageForm = (story) => Object.fromEntries(PAGE_FIELDS.map((key) => [key, story?.[key] || '']));

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden';

export const OurStoryPageCMS = () => {
  const {
    ourStory,
    updateOurStory,
    addOurStoryValue,
    updateOurStoryValue,
    deleteOurStoryValue,
    addToast
  } = useAdminStore();

  const fileInputRef = useRef(null);

  // Filled once the latest saved page has loaded from the backend
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const { loadOurStory } = useAdminStore.getState();
    loadOurStory().then(() => {
      const loaded = useAdminStore.getState().ourStory;
      if (loaded) setForm(toPageForm(loaded));
    });
  }, []);

  // Drawer for Adding/Editing Brand Pillar / Value
  const [valueDrawerOpen, setValueDrawerOpen] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [valueForm, setValueForm] = useState({
    title: '',
    desc: '',
    icon: 'Leaf',
    active: true
  });

  // Deletion confirm modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // The photo is uploaded to the server; "Save Our Story Page" puts it on the website
  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid image file (PNG, JPG, WebP).'
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, storyImage: url }));
      addToast({
        type: 'success',
        title: 'Story Image Uploaded',
        message: `Uploaded "${file.name}". Click "Save Our Story Page" to apply.`
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenValueDrawer = (val = null) => {
    if (val) {
      setEditingValue(val);
      setValueForm({
        title: val.title || '',
        desc: val.desc || '',
        icon: val.icon || 'Leaf',
        active: val.active !== false
      });
    } else {
      setEditingValue(null);
      setValueForm({
        title: '',
        desc: '',
        icon: 'Leaf',
        active: true
      });
    }
    setValueDrawerOpen(true);
  };

  // The store shows an error toast and reloads the page from the backend when a save fails
  const handleSaveValue = async (e) => {
    if (e) e.preventDefault();
    if (!valueForm.title.trim()) {
      addToast({ type: 'error', title: 'Title Required', message: 'Please enter a pillar title.' });
      return;
    }
    setValueDrawerOpen(false);
    try {
      if (editingValue) {
        await updateOurStoryValue(editingValue.id, valueForm);
        addToast({ type: 'success', title: 'Pillar Updated', message: `Saved changes to "${valueForm.title}".` });
      } else {
        await addOurStoryValue(valueForm);
        triggerKapeeCelebration();
        addToast({ type: 'success', title: 'Pillar Added', message: `Added "${valueForm.title}" to brand pillars.` });
      }
    } catch {
      // already reported by the store
    }
  };

  const handleToggleValueActive = async (id, currentActive) => {
    try {
      await updateOurStoryValue(id, { active: !currentActive });
      addToast({
        type: 'info',
        title: !currentActive ? 'Pillar Activated' : 'Pillar Hidden',
        message: !currentActive ? 'Pillar is now visible on Our Story page.' : 'Pillar is hidden from storefront.'
      });
    } catch {
      // already reported by the store
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
    try {
      await deleteOurStoryValue(id);
      addToast({ type: 'info', title: 'Pillar Removed', message: `Removed "${title}".` });
    } catch {
      // already reported by the store
    }
  };

  const handleSaveAll = async () => {
    if (!form) return;
    if (!form.heroTitle.trim()) {
      addToast({ type: 'error', title: 'Title Required', message: 'Please enter the hero main title.' });
      return;
    }
    try {
      await updateOurStory(form);
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Our Story Page Saved',
        message: 'All mission headlines, narrative paragraphs, and brand values saved to live storefront!'
      });
    } catch {
      // already reported by the store
    }
  };

  const valuesList = ourStory?.values || [];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-deep dark:text-emerald-400" />
            <span>Our Story Page CMS</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Manage your brand mission, heritage narrative, problem-solution origin, and the 4 brand pillars shown on <code className="text-emerald-700 dark:text-emerald-400">/about</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Page</span>
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!form || uploading}
            className="disabled:opacity-60 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Our Story Page</span>
          </button>
        </div>
      </div>

      {form && (
      <>
      {/* Editor Section 1: Hero & Mission Copy */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
            <span>Hero & Brand Mission Headline</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Top banner copy introducing your mission to visitors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Hero Badge
            </label>
            <input
              type="text"
              value={form.heroBadge}
              onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
              placeholder="Our Mission"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Hero Main Title
            </label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              placeholder="Cleaner Solutions, Brighter Living."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs font-serif font-bold text-sm focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1 md:col-span-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Hero Subtext / Conviction Statement
            </label>
            <textarea
              rows={2}
              value={form.heroSubtext}
              onChange={(e) => setForm({ ...form, heroSubtext: e.target.value })}
              placeholder="We started KAPEE Enterprise with one simple conviction..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Editor Section 2: Story Narrative & Media */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
            <span>Origin Story & Problem-Solution Narrative</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            The narrative of how KAPEE solved the toxic chemical cleaning struggle for Indian families.
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Story Section Heading
            </label>
            <input
              type="text"
              value={form.storyHeading}
              onChange={(e) => setForm({ ...form, storyHeading: e.target.value })}
              placeholder="Born from a Simple Household Problem"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs font-serif font-bold text-sm focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                Paragraph 1: The Problem (Borewell Water & Greasy Stains)
              </label>
              <textarea
                rows={4}
                value={form.storyParagraph1}
                onChange={(e) => setForm({ ...form, storyParagraph1: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                Paragraph 2: The Danger (Corrosive Acids & Acid Fumes)
              </label>
              <textarea
                rows={4}
                value={form.storyParagraph2}
                onChange={(e) => setForm({ ...form, storyParagraph2: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                Paragraph 3: The Breakthrough (German Melamine Matrix)
              </label>
              <textarea
                rows={4}
                value={form.storyParagraph3}
                onChange={(e) => setForm({ ...form, storyParagraph3: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden leading-relaxed"
              />
            </div>
          </div>

          {/* Story Feature Image Upload Only */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
              Story Feature Image
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/40 hover:border-[#0A5C55] transition-colors">
              {/* Selected Image Thumbnail */}
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shrink-0 shadow-xs relative flex items-center justify-center">
                {form.storyImage ? (
                  <img src={form.storyImage} alt="Story Image Preview" className="w-full h-full object-cover" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-stone-400" />
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="disabled:opacity-60 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {uploading ? 'Uploading...' : form.storyImage ? 'Change Image from Computer' : 'Select Image from Computer'}
                  </span>
                </button>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Select a PNG, JPG, or WebP photo from your device. No URL input required.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                Image Description (for Google & screen readers)
              </label>
              <input
                type="text"
                value={form.storyImageAlt}
                onChange={(e) => setForm({ ...form, storyImageAlt: e.target.value })}
                placeholder="e.g. Clean Indian living room"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Section 3: Brand Pillars / Values CRUD */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
              <span>The 4 Pillars of KAPEE Enterprise ({valuesList.length})</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Add, edit, or toggle visibility for each core pillar displayed on the page.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenValueDrawer()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-xs transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pillar Card</span>
          </button>
        </div>

        {/* Section title & subtitle fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={form.valuesHeading}
              onChange={(e) => setForm({ ...form, valuesHeading: e.target.value })}
              placeholder="The 4 Pillars of KAPEE Enterprise"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-serif font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Section Subtitle
            </label>
            <input
              type="text"
              value={form.valuesSubtext}
              onChange={(e) => setForm({ ...form, valuesSubtext: e.target.value })}
              placeholder="What guides every sponge, cloth, and formula we develop."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Pillars Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {valuesList.map((val, idx) => (
            <div
              key={val.id || idx}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 p-4 bg-stone-50/50 dark:bg-stone-850 hover:border-emerald-deep/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {val.title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
                    {val.icon}
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {val.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${val.active !== false ? 'text-emerald-600' : 'text-stone-400'}`}>
                  {val.active !== false ? '● Visible' : '○ Hidden'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleValueActive(val.id, val.active !== false)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-emerald-300"
                    title={val.active !== false ? 'Hide from page' : 'Show on page'}
                  >
                    {val.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenValueDrawer(val)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-emerald-300"
                    title="Edit Pillar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({ id: val.id, title: val.title });
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Pillar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Section 4: Bottom Call To Action Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
            <span>Bottom Call to Action Banner</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            The emerald closing strip encouraging visitors to explore the product range.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Banner Heading
            </label>
            <input
              type="text"
              value={form.ctaHeading}
              onChange={(e) => setForm({ ...form, ctaHeading: e.target.value })}
              placeholder="Join 50,000+ Happy Homes Across India"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-serif font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Banner Subtext
            </label>
            <input
              type="text"
              value={form.ctaSubtext}
              onChange={(e) => setForm({ ...form, ctaSubtext: e.target.value })}
              placeholder="Switch to cleaner, brighter living today. Free express delivery..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Button Label
            </label>
            <input
              type="text"
              value={form.ctaButtonText}
              onChange={(e) => setForm({ ...form, ctaButtonText: e.target.value })}
              placeholder="Explore Our Collection"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Button URL / Route
            </label>
            <input
              type="text"
              value={form.ctaButtonLink}
              onChange={(e) => setForm({ ...form, ctaButtonLink: e.target.value })}
              placeholder="/shop"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-mono"
            />
          </div>
        </div>
      </div>
      </>
      )}

      {/* SideDrawer for Brand Pillar */}
      <SideDrawer
        isOpen={valueDrawerOpen}
        onClose={() => setValueDrawerOpen(false)}
        title={editingValue ? 'Edit Brand Pillar' : 'Add Brand Pillar Card'}
        subtitle="Manage the title, icon, and explanation for this brand principle."
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setValueDrawerOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveValue}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingValue ? 'Save Pillar Changes' : 'Add Pillar'}</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Pillar Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={valueForm.title}
              onChange={(e) => setValueForm({ ...valueForm, title: e.target.value })}
              placeholder="e.g. 100% Chemical-Free"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Icon
            </label>
            <CustomSelect
              value={valueForm.icon}
              onChange={(e) => setValueForm({ ...valueForm, icon: e.target.value })}
              options={ICON_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description / Impact Text
            </label>
            <textarea
              rows={3}
              value={valueForm.desc}
              onChange={(e) => setValueForm({ ...valueForm, desc: e.target.value })}
              placeholder="Explain how this principle benefits the customer..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Visible on Our Story Page</span>
            <input
              type="checkbox"
              checked={valueForm.active}
              onChange={(e) => setValueForm({ ...valueForm, active: e.target.checked })}
              className="w-4 h-4 accent-emerald-deep rounded"
            />
          </div>
        </div>
      </SideDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        title="Delete Brand Pillar"
        message={`Are you sure you want to remove "${deleteTarget?.title}"? It will no longer be visible on the Our Story page.`}
        confirmText="Delete"
        danger
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default OurStoryPageCMS;

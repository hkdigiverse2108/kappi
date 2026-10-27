import React, { useEffect, useState } from 'react';
import {
  PanelBottom,
  Save,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Info,
  Share2,
  ShoppingBag,
  Building2,
  ShieldCheck,
  Mail,
  Copyright
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { SideDrawer } from '../../components/common/SideDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../../components/common/Confetti';

// Footer-level fields edited on this screen (the Shop / Company links are saved separately)
const PAGE_FIELDS = [
  'brandDescription', 'instagramUrl', 'facebookUrl', 'twitterUrl',
  'shopHeading', 'companyHeading', 'policiesHeading',
  'newsletterHeading', 'newsletterText', 'newsletterSuccessText',
  'copyrightText'
];
const toPageForm = (footer) => Object.fromEntries(PAGE_FIELDS.map((key) => [key, footer?.[key] || '']));

const COLUMN_NAMES = { shopLinks: 'Shop', companyLinks: 'Company' };

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden';
const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1';
const cardClass =
  'bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4';

export const FooterCMS = () => {
  const { footer, updateFooter, addFooterLink, updateFooterLink, deleteFooterLink, addToast } = useAdminStore();

  // Filled once the latest saved footer has loaded from the backend
  const [form, setForm] = useState(null);

  useEffect(() => {
    const { loadFooter } = useAdminStore.getState();
    loadFooter().then(() => {
      const loaded = useAdminStore.getState().footer;
      if (loaded) setForm(toPageForm(loaded));
    });
  }, []);

  // Drawer for Adding/Editing a footer link
  const [linkDrawerOpen, setLinkDrawerOpen] = useState(false);
  const [linkColumn, setLinkColumn] = useState('shopLinks');
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ label: '', path: '' });

  // Deletion confirm modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenLinkDrawer = (column, link = null) => {
    setLinkColumn(column);
    setEditingLink(link);
    setLinkForm({ label: link?.label || '', path: link?.path || '' });
    setLinkDrawerOpen(true);
  };

  // The store shows an error toast and reloads the footer from the backend when a save fails
  const handleSaveLink = async (e) => {
    if (e) e.preventDefault();
    const label = linkForm.label.trim();
    const path = linkForm.path.trim();
    if (!label || !path) {
      addToast({ type: 'error', title: 'Details Required', message: 'Please enter the link text and the page path.' });
      return;
    }
    setLinkDrawerOpen(false);
    try {
      if (editingLink) {
        await updateFooterLink(linkColumn, editingLink.id, { label, path });
        addToast({ type: 'success', title: 'Link Updated', message: `Saved changes to "${label}".` });
      } else {
        await addFooterLink(linkColumn, { label, path });
        triggerKapeeCelebration();
        addToast({ type: 'success', title: 'Link Added', message: `Added "${label}" to the ${COLUMN_NAMES[linkColumn]} column.` });
      }
    } catch {
      // already reported by the store
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { column, id, label } = deleteTarget;
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
    try {
      await deleteFooterLink(column, id);
      addToast({ type: 'info', title: 'Link Removed', message: `Removed "${label}" from the footer.` });
    } catch {
      // already reported by the store
    }
  };

  const handleSaveAll = async () => {
    if (!form) return;
    try {
      await updateFooter(form);
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Footer Saved',
        message: 'Footer texts, social links and column headings saved to the live storefront!'
      });
    } catch {
      // already reported by the store
    }
  };

  const renderLinkColumn = (column, headingKey, Icon, title) => {
    const links = footer?.[column] || [];
    return (
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Icon className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
              <span>{title} ({links.length})</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Add, edit, or remove the links shown in this footer column.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenLinkDrawer(column)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-xs transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link</span>
          </button>
        </div>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <label className={labelClass}>Column Heading</label>
          <input
            type="text"
            value={form[headingKey]}
            onChange={(e) => setForm({ ...form, [headingKey]: e.target.value })}
            placeholder={COLUMN_NAMES[column]}
            className={`${inputClass} font-serif font-bold`}
          />
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
          {links.length === 0 && (
            <p className="p-3 text-stone-400">No links yet. Click "Add Link" to add one.</p>
          )}
          {links.map((link) => (
            <div key={link.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-stone-800 dark:text-stone-200 truncate">{link.label}</p>
                <p className="font-mono text-stone-400 text-[11px] truncate">{link.path}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenLinkDrawer(column, link)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-stone-100 dark:hover:bg-stone-800"
                  title="Edit Link"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({ column, id: link.id, label: link.label });
                    setDeleteConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100 flex items-center gap-2.5">
            <PanelBottom className="w-7 h-7 text-emerald-deep dark:text-emerald-400" />
            <span>Footer CMS</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Manage the brand text, social links, Shop & Company link columns, newsletter texts and copyright shown at the bottom of every page.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Site</span>
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!form}
            className="disabled:opacity-60 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Footer</span>
          </button>
        </div>
      </div>

      {form && (
      <>
      {/* Section 1: Brand Text & Social Links */}
      <div className={cardClass}>
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
            <span>Brand Text & Social Links</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Short description under the logo and the social icons. Leave a link empty to hide that icon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="md:col-span-3">
            <label className={labelClass}>Brand Description</label>
            <textarea
              rows={2}
              value={form.brandDescription}
              onChange={(e) => setForm({ ...form, brandDescription: e.target.value })}
              placeholder="Pure water-activated melamine sponges..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Instagram URL</label>
            <input
              type="text"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/kapee"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className={labelClass}>Facebook URL</label>
            <input
              type="text"
              value={form.facebookUrl}
              onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/kapee"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className={labelClass}>X (Twitter) URL</label>
            <input
              type="text"
              value={form.twitterUrl}
              onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
              placeholder="https://x.com/kapee"
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        <p className="flex items-start gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>
            Email, phone and WhatsApp in the footer come from{' '}
            <Link to="/admin/cms/contact" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              CMS: Contact Us Page
            </Link>
            .
          </span>
        </p>
      </div>

      {/* Sections 2 & 3: Link Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderLinkColumn('shopLinks', 'shopHeading', ShoppingBag, 'Shop Column Links')}
        {renderLinkColumn('companyLinks', 'companyHeading', Building2, 'Company Column Links')}
      </div>

      {/* Section 4: Policies, Newsletter & Copyright */}
      <div className={cardClass}>
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
            <span>Policies, Newsletter & Copyright</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Texts of the last footer column and the bottom copyright bar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <label className={labelClass}>
              <ShieldCheck className="w-3 h-3 inline -mt-0.5 mr-1" />
              Policies Column Heading
            </label>
            <input
              type="text"
              value={form.policiesHeading}
              onChange={(e) => setForm({ ...form, policiesHeading: e.target.value })}
              placeholder="Policies"
              className={`${inputClass} font-serif font-bold`}
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              The policy links come from{' '}
              <Link to="/admin/cms/policies" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                CMS: Policy Pages
              </Link>{' '}
              (footer link text).
            </p>
          </div>
          <div>
            <label className={labelClass}>Newsletter Heading</label>
            <input
              type="text"
              value={form.newsletterHeading}
              onChange={(e) => setForm({ ...form, newsletterHeading: e.target.value })}
              placeholder="Newsletter"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Newsletter Text</label>
            <input
              type="text"
              value={form.newsletterText}
              onChange={(e) => setForm({ ...form, newsletterText: e.target.value })}
              placeholder="Cleaning tips, new launches & product updates in your inbox."
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Thank-You Message (after subscribing)</label>
            <input
              type="text"
              value={form.newsletterSuccessText}
              onChange={(e) => setForm({ ...form, newsletterSuccessText: e.target.value })}
              placeholder="Thanks for subscribing! You'll hear from us soon."
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              <Copyright className="w-3 h-3 inline -mt-0.5 mr-1" />
              Copyright Text (the current year is added automatically)
            </label>
            <input
              type="text"
              value={form.copyrightText}
              onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
              placeholder="KAPEE Enterprise. All Rights Reserved."
              className={inputClass}
            />
          </div>
        </div>
      </div>
      </>
      )}

      {/* SideDrawer for a footer link */}
      <SideDrawer
        isOpen={linkDrawerOpen}
        onClose={() => setLinkDrawerOpen(false)}
        title={editingLink ? 'Edit Footer Link' : `Add Link to ${COLUMN_NAMES[linkColumn]} Column`}
        subtitle="The text shown in the footer and the page it opens."
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setLinkDrawerOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveLink}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingLink ? 'Save Link Changes' : 'Add Link'}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveLink} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Link Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={linkForm.label}
              onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
              placeholder="e.g. Magic Eraser Sponges"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Page Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={linkForm.path}
              onChange={(e) => setLinkForm({ ...linkForm, path: e.target.value })}
              placeholder="e.g. /shop or /product/kapee-magic-eraser-standard"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 font-mono"
            />
          </div>
          <button type="submit" className="hidden" />
        </form>
      </SideDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        title="Delete Footer Link"
        message={`Are you sure you want to remove "${deleteTarget?.label}"? It will no longer be shown in the footer.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default FooterCMS;

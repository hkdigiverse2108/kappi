import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Save,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Clock,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  FileCheck,
  Link2
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { SideDrawer } from '../../components/common/SideDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../../components/common/Confetti';

// Page address part from a title: "Cookie Policy" -> "cookie-policy"
const toSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-ink dark:text-white text-xs focus:ring-2 focus:ring-emerald-deep outline-none';

export const PolicyPagesCMS = () => {
  const { savePolicies, addToast } = useAdminStore();

  // Editable copy of every policy, filled once the latest saved policies have loaded from the backend.
  // Adding / deleting policies and clauses saves straight away; title, address, footer text and date
  // edits save with "Save Policy Changes".
  const [localPolicies, setLocalPolicies] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const { loadPolicies } = useAdminStore.getState();
    loadPolicies().then(() => {
      const loaded = useAdminStore.getState().policies;
      if (loaded) setLocalPolicies(loaded.policies || []);
    });
  }, []);

  const policyList = localPolicies || [];
  const activePolicy = policyList[activeIndex] || null;
  const sectionsList = activePolicy?.sections || [];

  // Drawer state for Clause editing/adding
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({ id: '', title: '', content: '' });

  // Delete modal state: { kind: 'clause' | 'policy', ... }
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Clause text edited in place: { id, field: 'title' | 'content', value }
  const [inlineEdit, setInlineEdit] = useState(null);

  // Puts the change on screen and saves every policy; the store reports a failed save
  const commitPolicies = async (updated, activity) => {
    setLocalPolicies(updated);
    try {
      await savePolicies({ policies: updated }, activity);
      return true;
    } catch {
      return false;
    }
  };

  const replaceActive = (changes) =>
    policyList.map((p, i) => (i === activeIndex ? { ...p, ...changes } : p));

  const handleMetaChange = (field, value) => {
    if (!activePolicy) return;
    setLocalPolicies(replaceActive({ [field]: value }));
  };

  // A new policy gets a free page address and is selected for editing
  const handleAddPolicy = async () => {
    const existing = new Set(policyList.map((p) => p.slug));
    let n = policyList.length + 1;
    while (existing.has(`new-policy-${n}`)) n += 1;
    const newPolicy = {
      slug: `new-policy-${n}`,
      title: `New Policy ${n}`,
      footerLabel: '',
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      sections: []
    };
    const saved = await commitPolicies([...policyList, newPolicy], `Added policy "${newPolicy.title}"`);
    if (saved) {
      setActiveIndex(policyList.length);
      addToast({
        type: 'success',
        title: 'Policy Added',
        message: 'Set its title, page address and clauses, then save.'
      });
    }
  };

  // Open drawer for adding / editing a clause
  const handleOpenClauseDrawer = (sec = null) => {
    if (sec) {
      setEditingSection(sec);
      setSectionForm({ id: sec.id || '', title: sec.title || '', content: sec.content || '' });
    } else {
      setEditingSection(null);
      setSectionForm({ id: `sec-${Date.now()}`, title: `${sectionsList.length + 1}. Clause Title`, content: '' });
    }
    setDrawerOpen(true);
  };

  const handleSaveClause = async (e) => {
    if (e) e.preventDefault();
    if (!sectionForm.title.trim()) {
      addToast({ type: 'error', title: 'Title Required', message: 'Please provide a title for this clause.' });
      return;
    }
    if (!sectionForm.content.trim()) {
      addToast({ type: 'error', title: 'Content Required', message: 'Please provide clause description / legal terms text.' });
      return;
    }

    const clause = {
      id: sectionForm.id.trim() || editingSection?.id || `sec-${Date.now()}`,
      title: sectionForm.title.trim(),
      content: sectionForm.content.trim()
    };
    const updatedSections = editingSection
      ? sectionsList.map((s) => (s.id === editingSection.id ? clause : s))
      : [...sectionsList, clause];

    setDrawerOpen(false);
    const saved = await commitPolicies(
      replaceActive({ sections: updatedSections }),
      `${editingSection ? 'Updated' : 'Added'} clause "${clause.title}" in ${activePolicy.title}`
    );
    if (saved) {
      addToast({
        type: 'success',
        title: editingSection ? 'Clause Updated' : 'Clause Added',
        message: `${editingSection ? 'Updated' : 'Added'} "${clause.title}".`
      });
    }
  };

  // Saves the clause text typed in place (when the field loses focus or Enter is pressed in the heading)
  const handleSaveInline = async () => {
    if (!inlineEdit) return;
    const { id, field, value } = inlineEdit;
    setInlineEdit(null);
    const original = sectionsList.find((s) => s.id === id);
    const text = value.trim();
    if (!original || text === original[field]) return;
    if (!text) {
      addToast({
        type: 'error',
        title: field === 'title' ? 'Title Required' : 'Content Required',
        message: 'A clause cannot be left empty, so the change was not saved.'
      });
      return;
    }
    const saved = await commitPolicies(
      replaceActive({ sections: sectionsList.map((s) => (s.id === id ? { ...s, [field]: text } : s)) }),
      `Updated clause "${original.title}" in ${activePolicy.title}`
    );
    if (saved) {
      addToast({ type: 'success', title: 'Clause Updated', message: `Saved "${field === 'title' ? text : original.title}".` });
    }
  };

  const inlineKeyDown = (e) => {
    if (e.key === 'Escape') setInlineEdit(null);
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur();
  };

  const handleMoveClause = async (index, direction) => {
    const updated = [...sectionsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];

    const saved = await commitPolicies(replaceActive({ sections: updated }), `Reordered clauses in ${activePolicy.title}`);
    if (saved) {
      addToast({ type: 'info', title: 'Order Updated', message: 'Clause position rearranged.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    if (target.kind === 'policy') {
      const saved = await commitPolicies(
        policyList.filter((_, i) => i !== activeIndex),
        `Deleted policy "${target.title}"`
      );
      if (saved) {
        setActiveIndex(0);
        addToast({ type: 'info', title: 'Policy Deleted', message: `Removed "${target.title}" from the website.` });
      }
      return;
    }

    const saved = await commitPolicies(
      replaceActive({ sections: sectionsList.filter((s) => s.id !== target.id) }),
      `Deleted clause "${target.title}" from ${activePolicy.title}`
    );
    if (saved) {
      addToast({ type: 'info', title: 'Clause Removed', message: `Removed "${target.title}".` });
    }
  };

  // Top Save Button: saves the title, page address, footer text & date of every policy
  const handleSaveAll = async () => {
    if (!localPolicies) return;
    const cleaned = localPolicies.map((p) => ({ ...p, title: p.title.trim(), slug: toSlug(p.slug), footerLabel: p.footerLabel.trim() }));
    const missing = cleaned.find((p) => !p.title || !p.slug);
    if (missing) {
      addToast({ type: 'error', title: 'Details Required', message: 'Every policy needs a title and a page address.' });
      return;
    }
    const slugs = cleaned.map((p) => p.slug);
    const duplicate = slugs.find((s, i) => slugs.indexOf(s) !== i);
    if (duplicate) {
      addToast({ type: 'error', title: 'Address Taken', message: `Two policies use /policies/${duplicate}.` });
      return;
    }
    const saved = await commitPolicies(cleaned, 'Saved all policy pages updates');
    if (saved) {
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Policy Changes Saved',
        message: `All updates to ${activePolicy?.title || 'policies'} are now live on the storefront!`
      });
    }
  };

  const liveUrl = activePolicy ? `/policies/${activePolicy.slug}` : '';

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-deep dark:text-emerald-400" />
            <span>Policy Pages CMS</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Add, edit and remove the legal and store policy pages shown on the storefront and in its footer.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {activePolicy && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-all"
              title="Preview current policy on live store"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Live Policy</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!localPolicies}
            className="disabled:opacity-60 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Policy Changes</span>
          </button>
        </div>
      </div>

      {localPolicies && (
        <>
          {/* Policy Selection Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700">
            {policyList.map((pol, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  title={`/policies/${pol.slug}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-deep text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/70 dark:hover:bg-stone-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[180px]">{pol.title || 'Untitled Policy'}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddPolicy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-emerald-deep dark:text-emerald-400 border border-dashed border-emerald-300 dark:border-emerald-800 hover:bg-white/70 dark:hover:bg-stone-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Policy</span>
            </button>
          </div>

          {!activePolicy ? (
            <div className="py-12 text-center space-y-3 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900">
              <HelpCircle className="w-10 h-10 text-muted mx-auto" />
              <p className="text-xs text-muted dark:text-stone-400 font-medium">No policy pages yet.</p>
              <button
                type="button"
                onClick={handleAddPolicy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-deep text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Policy</span>
              </button>
            </div>
          ) : (
            <>
              {/* Policy Metadata Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted dark:text-stone-400 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                    <span>Page Heading, Address & Last Revision Date</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ kind: 'policy', title: activePolicy.title })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Policy</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Document Display Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={activePolicy.title}
                      onChange={(e) => handleMetaChange('title', e.target.value)}
                      placeholder="e.g. Privacy Policy"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Page Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Link2 className="w-3.5 h-3.5 absolute left-3 top-3 text-muted dark:text-stone-400" />
                      <input
                        type="text"
                        value={activePolicy.slug}
                        onChange={(e) => handleMetaChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="e.g. privacy"
                        className={`${inputClass} pl-9 font-mono`}
                      />
                    </div>
                    <p className="text-[10px] text-muted dark:text-stone-500 mt-1">Website link: /policies/{activePolicy.slug}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Footer Link Text
                    </label>
                    <input
                      type="text"
                      value={activePolicy.footerLabel}
                      onChange={(e) => handleMetaChange('footerLabel', e.target.value)}
                      placeholder="e.g. 7-Day Return Policy"
                      className={inputClass}
                    />
                    <p className="text-[10px] text-muted dark:text-stone-500 mt-1">Leave empty to keep this policy out of the footer.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Last Updated Date Text
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-muted dark:text-stone-400" />
                      <input
                        type="text"
                        value={activePolicy.lastUpdated}
                        onChange={(e) => handleMetaChange('lastUpdated', e.target.value)}
                        placeholder="e.g. 15 October 2026"
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clause Sections Management */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                  <div>
                    <h2 className="text-base font-serif font-bold text-ink dark:text-stone-100 flex items-center gap-2">
                      <span>Policy Clauses & Legal Sections</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {sectionsList.length} Total
                      </span>
                    </h2>
                    <p className="text-xs text-muted dark:text-stone-400 mt-0.5">
                      Clauses appear in the Table of Contents and in the body of <code className="text-emerald-700 dark:text-emerald-400">{liveUrl}</code>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenClauseDrawer(null)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Clause</span>
                  </button>
                </div>

                {sectionsList.length === 0 ? (
                  <div className="py-12 text-center space-y-3 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                    <HelpCircle className="w-10 h-10 text-muted mx-auto" />
                    <p className="text-xs text-muted dark:text-stone-400 font-medium">No clauses in this policy yet.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenClauseDrawer(null)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-deep text-white text-xs font-bold shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Clause</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sectionsList.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="group p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              {inlineEdit?.id === sec.id && inlineEdit.field === 'title' ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={inlineEdit.value}
                                  onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                  onBlur={handleSaveInline}
                                  onKeyDown={inlineKeyDown}
                                  className={`${inputClass} !py-1.5 text-sm font-bold`}
                                />
                              ) : (
                                <h3
                                  onClick={() => setInlineEdit({ id: sec.id, field: 'title', value: sec.title })}
                                  title="Click to edit"
                                  className="text-sm font-bold text-ink dark:text-stone-100 cursor-text rounded-md px-1 -mx-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                >
                                  {sec.title}
                                </h3>
                              )}
                              <div className="text-[10px] text-muted dark:text-stone-500 font-mono mt-0.5">Anchor ID: #{sec.id}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveClause(idx, 'up')}
                              className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === sectionsList.length - 1}
                              onClick={() => handleMoveClause(idx, 'down')}
                              className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenClauseDrawer(sec)}
                              className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-all"
                              title="Edit Clause"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ kind: 'clause', id: sec.id, title: sec.title })}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                              title="Delete Clause"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Content snippet */}
                        {inlineEdit?.id === sec.id && inlineEdit.field === 'content' ? (
                          <div className="pl-9">
                            <textarea
                              autoFocus
                              rows={5}
                              value={inlineEdit.value}
                              onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                              onBlur={handleSaveInline}
                              onKeyDown={inlineKeyDown}
                              className={`${inputClass} leading-relaxed`}
                            />
                            <p className="text-[10px] text-muted dark:text-stone-500 mt-1">Click outside to save • Esc to cancel</p>
                          </div>
                        ) : (
                          <div className="pl-9">
                            <p
                              onClick={() => setInlineEdit({ id: sec.id, field: 'content', value: sec.content })}
                              title="Click to edit"
                              className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line cursor-text rounded-md px-1 -mx-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                              {sec.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* SideDrawer for Adding / Editing a Clause */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingSection ? `Edit Clause: ${editingSection.title}` : `Add Clause to ${activePolicy?.title || 'Policy'}`}
      >
        <form onSubmit={handleSaveClause} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Clause Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sectionForm.title}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. 1. Information We Collect"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Anchor Slug ID <span className="text-muted font-normal">(Used in URL #hash)</span>
            </label>
            <input
              type="text"
              value={sectionForm.id}
              onChange={(e) =>
                setSectionForm((prev) => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))
              }
              placeholder="e.g. collection"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Clause Legal Content / Policy Body <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={sectionForm.content}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Detail the exact legal terms, operational policy, replacement timeline, or customer guidelines..."
              className={`${inputClass} leading-relaxed`}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingSection ? 'Update Clause' : 'Add Clause'}</span>
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* Delete Policy / Clause Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.kind === 'policy' ? 'Delete Policy?' : 'Delete Clause?'}
        message={
          deleteTarget?.kind === 'policy'
            ? `Delete the whole "${deleteTarget?.title}" page? It will be removed from the website and the footer.`
            : `Are you sure you want to permanently remove "${deleteTarget?.title}" from ${activePolicy?.title}?`
        }
        confirmText={deleteTarget?.kind === 'policy' ? 'Delete Policy' : 'Delete Clause'}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PolicyPagesCMS;

import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Send,
  ArrowRight
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { SideDrawer } from '../../components/common/SideDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { CustomSelect } from '../../components/common/CustomSelect';

const CHANNEL_TYPE_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp Chat' },
  { value: 'phone', label: 'Phone Helpline' },
  { value: 'email', label: 'Email Support' },
  { value: 'address', label: 'Office / Fulfillment Address' }
];

// Website link for a card, built from its number / email (address cards have no link)
const cardLink = ({ type, primaryText }) => {
  const digits = (primaryText || '').replace(/\D/g, '');
  if (type === 'whatsapp') return digits ? `https://wa.me/${digits}` : '';
  if (type === 'phone') return digits ? `tel:+${digits}` : '';
  if (type === 'email') return primaryText ? `mailto:${primaryText.trim()}` : '';
  return '';
};

// Only the WhatsApp card shows a button on the website, and address cards show no subtext
const toSavedCard = (card) => ({
  ...card,
  subtext: card.type === 'address' ? '' : card.subtext,
  actionText: card.type === 'whatsapp' ? card.actionText : '',
  actionUrl: cardLink(card)
});

// Page-level fields edited on this screen (the channel cards are saved separately)
const toPageForm = (section) => ({
  badge: section?.badge || '',
  heading: section?.heading || '',
  subheading: section?.subheading || '',
  showInquiryForm: section?.showInquiryForm !== false,
  formTitle: section?.formTitle || '',
  formSubtitle: section?.formSubtitle || '',
  subjectOptionsText: (section?.subjectOptions || []).join('\n'),
  successTitle: section?.successTitle || '',
  successMessage: section?.successMessage || '',
  successButtonText: section?.successButtonText || ''
});

export const ContactPageCMS = () => {
  const {
    contactSection,
    updateContactSection,
    addContactCard,
    updateContactCard,
    deleteContactCard,
    addToast
  } = useAdminStore();

  // Filled once the latest saved page has loaded from the backend
  const [headerForm, setHeaderForm] = useState(null);

  useEffect(() => {
    const { loadContactContent } = useAdminStore.getState();
    loadContactContent().then(() => {
      const loaded = useAdminStore.getState().contactSection;
      if (loaded) setHeaderForm(toPageForm(loaded));
    });
  }, []);

  // Drawer for Adding/Editing Contact Channel Card
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardForm, setCardForm] = useState({
    type: 'whatsapp',
    title: '',
    primaryText: '',
    subtext: '',
    actionText: '',
    actionUrl: '',
    active: true
  });

  // Deletion confirm modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenDrawer = (card = null) => {
    if (card) {
      setEditingCard(card);
      setCardForm({
        type: card.type || 'whatsapp',
        title: card.title || '',
        primaryText: card.primaryText || '',
        subtext: card.subtext || '',
        actionText: card.actionText || '',
        actionUrl: card.actionUrl || '',
        active: card.active !== false
      });
    } else {
      setEditingCard(null);
      setCardForm({
        type: 'whatsapp',
        title: 'WhatsApp Instant Support',
        primaryText: '',
        subtext: '',
        actionText: 'Start WhatsApp Chat',
        actionUrl: '',
        active: true
      });
    }
    setDrawerOpen(true);
  };

  // The store shows an error toast and reloads the page from the backend when a save fails
  const handleSaveCard = async (e) => {
    if (e) e.preventDefault();
    if (!cardForm.title.trim()) {
      addToast({ type: 'error', title: 'Title Required', message: 'Please enter a card title.' });
      return;
    }
    if (!cardForm.primaryText.trim()) {
      addToast({ type: 'error', title: 'Contact Text Required', message: 'Please enter the number, email or address.' });
      return;
    }
    setDrawerOpen(false);
    try {
      if (editingCard) {
        await updateContactCard(editingCard.id, toSavedCard(cardForm));
        addToast({ type: 'success', title: 'Card Updated', message: `Saved changes to "${cardForm.title}".` });
      } else {
        await addContactCard(toSavedCard(cardForm));
        triggerKapeeCelebration();
        addToast({ type: 'success', title: 'Card Added', message: `Added "${cardForm.title}" to contact channels.` });
      }
    } catch {
      // already reported by the store
    }
  };

  const handleToggleCardActive = async (id, currentActive) => {
    try {
      await updateContactCard(id, { active: !currentActive });
      addToast({
        type: 'info',
        title: !currentActive ? 'Channel Activated' : 'Channel Hidden',
        message: !currentActive ? 'Channel card is now visible on /contact.' : 'Channel card is now hidden.'
      });
    } catch {
      // already reported by the store
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
    try {
      await deleteContactCard(id);
      addToast({ type: 'info', title: 'Card Removed', message: 'Contact channel removed.' });
    } catch {
      // already reported by the store
    }
  };

  const handleSaveWholePage = async () => {
    if (!headerForm) return;
    const { subjectOptionsText, ...pageFields } = headerForm;
    const subjectOptions = subjectOptionsText.split('\n').map((opt) => opt.trim()).filter(Boolean);
    try {
      await updateContactSection({ ...pageFields, subjectOptions });
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Contact Page Saved',
        message: 'Headlines and message form updated successfully!'
      });
    } catch {
      // already reported by the store
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            CMS: Contact Us Page
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Complete CRUD control over contact headlines, WhatsApp support, helpline SLA, and fulfillment office details.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/contact"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live /contact</span>
          </a>

          <button
            type="button"
            onClick={handleSaveWholePage}
            disabled={!headerForm}
            className="disabled:opacity-60 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Contact Page</span>
          </button>
        </div>
      </div>

      {headerForm && (
      <>
      {/* Main Headline & Explainer */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
            <span>Page Header & Explainer Subtitle</span>
          </h3>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={headerForm.showInquiryForm}
              onChange={(e) => setHeaderForm({ ...headerForm, showInquiryForm: e.target.checked })}
              className="w-4 h-4 accent-emerald-deep rounded"
            />
            <span>Enable Direct Message Form</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Top Badge Text
            </label>
            <input
              type="text"
              value={headerForm.badge}
              onChange={(e) => setHeaderForm({ ...headerForm, badge: e.target.value })}
              placeholder="We’re Here to Help"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Main Headline (H1)
            </label>
            <input
              type="text"
              value={headerForm.heading}
              onChange={(e) => setHeaderForm({ ...headerForm, heading: e.target.value })}
              placeholder="Get in Touch With KAPEE"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-serif font-bold text-sm"
            />
          </div>

          <div className="space-y-1 md:col-span-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Subheading / Description
            </label>
            <input
              type="text"
              value={headerForm.subheading}
              onChange={(e) => setHeaderForm({ ...headerForm, subheading: e.target.value })}
              placeholder="Have a question about product usage, bulk B2B orders, or your shipment? Reach out to us anytime."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Direct Message Form Texts */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
          <span>Direct Message Form & Success Message</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Form Heading
            </label>
            <input
              type="text"
              value={headerForm.formTitle}
              onChange={(e) => setHeaderForm({ ...headerForm, formTitle: e.target.value })}
              placeholder="Send Us a Direct Message"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Form Subtitle
            </label>
            <input
              type="text"
              value={headerForm.formSubtitle}
              onChange={(e) => setHeaderForm({ ...headerForm, formSubtitle: e.target.value })}
              placeholder="Fill out the form below and we will get back to you with detailed assistance."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Subject Options (one per line)
            </label>
            <textarea
              rows={4}
              value={headerForm.subjectOptionsText}
              onChange={(e) => setHeaderForm({ ...headerForm, subjectOptionsText: e.target.value })}
              placeholder="General Product Inquiry"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Success Heading
            </label>
            <input
              type="text"
              value={headerForm.successTitle}
              onChange={(e) => setHeaderForm({ ...headerForm, successTitle: e.target.value })}
              placeholder="Message Received!"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Success Button Label
            </label>
            <input
              type="text"
              value={headerForm.successButtonText}
              onChange={(e) => setHeaderForm({ ...headerForm, successButtonText: e.target.value })}
              placeholder="Send Another Message"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Success Message
            </label>
            <textarea
              rows={2}
              value={headerForm.successMessage}
              onChange={(e) => setHeaderForm({ ...headerForm, successMessage: e.target.value })}
              placeholder="Thank you for contacting KAPEE Enterprise..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Support Channel Cards CRUD */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
              <span>Support Channel Cards ({(contactSection?.cards || []).length})</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Direct action cards displayed on the contact page.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {(contactSection?.cards || []).map((card, idx) => {
            const ChannelIcon =
              card.type === 'whatsapp'
                ? MessageSquare
                : card.type === 'phone'
                ? Phone
                : card.type === 'email'
                ? Mail
                : MapPin;
            return (
              <div
                key={card.id || idx}
                className={`p-4 rounded-xl border bg-white dark:bg-stone-900 shadow-2xs flex flex-col justify-between space-y-3 transition-all ${
                  card.active === false
                    ? 'opacity-60 border-dashed border-stone-300 dark:border-stone-700'
                    : 'border-stone-200/80 dark:border-stone-800 hover:border-emerald-deep/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-deep dark:text-emerald-400 flex items-center justify-center">
                      <ChannelIcon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleCardActive(card.id, card.active !== false)}
                        className={`p-1 rounded-md transition-colors ${
                          card.active !== false
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                        title={card.active !== false ? 'Card Active' : 'Card Hidden'}
                      >
                        {card.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(card)}
                        className="p-1 rounded-md text-stone-500 hover:text-emerald-deep hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors dark:hover:text-emerald-300"
                        title="Edit Card"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget({ id: card.id, title: card.title });
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1 rounded-md text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {card.type}
                    </span>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      {card.title}
                    </h4>
                    <p className="text-xs font-semibold text-emerald-deep dark:text-emerald-400 font-mono mt-0.5">
                      {card.primaryText}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                      {card.subtext}
                    </p>
                  </div>

                  {card.type === 'whatsapp' && card.actionText && (
                    <div className="pt-1">
                      <span className="text-xs font-semibold text-emerald-deep dark:text-emerald-400 flex items-center gap-1">
                        <span>{card.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      </>
      )}

      {/* SideDrawer for Adding / Editing Contact Card */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingCard ? `Edit Channel: ${cardForm.title}` : 'Add Contact Channel Card'}
        subtitle="Configure communication coordinate card for the customer support desk"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCard}
              className="px-5 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs hover:bg-emerald-800"
            >
              {editingCard ? 'Update Channel' : 'Add Channel'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Channel Type</label>
            <CustomSelect
              value={cardForm.type}
              onChange={(e) => {
                const nextType = e.target.value;
                setCardForm({
                  ...cardForm,
                  type: nextType,
                  title:
                    nextType === 'whatsapp'
                      ? 'WhatsApp Instant Support'
                      : nextType === 'phone'
                      ? 'Customer Care Helpline'
                      : nextType === 'email'
                      ? 'Official Support Email'
                      : 'Physical Fulfillment Office',
                  actionText: nextType === 'whatsapp' ? 'Start WhatsApp Chat' : ''
                });
              }}
              options={CHANNEL_TYPE_OPTIONS}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Card Title *</label>
            <input
              type="text"
              value={cardForm.title}
              onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
              placeholder="e.g. WhatsApp Instant Support"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Primary Contact Text *</label>
            <input
              type="text"
              value={cardForm.primaryText}
              onChange={(e) => setCardForm({ ...cardForm, primaryText: e.target.value })}
              placeholder="e.g. +91 98765 43210 or support@kapee-enterprise.com"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          {/* Address cards show only the address on the website */}
          {cardForm.type !== 'address' && (
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Helper / Hours / Subtext</label>
              <textarea
                rows={2}
                value={cardForm.subtext}
                onChange={(e) => setCardForm({ ...cardForm, subtext: e.target.value })}
                placeholder="e.g. Fastest answers on product usage, orders, and surface compatibility."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
          )}

          {/* Only the WhatsApp card shows a button on the website */}
          {cardForm.type === 'whatsapp' && (
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Button Label</label>
              <input
                type="text"
                value={cardForm.actionText}
                onChange={(e) => setCardForm({ ...cardForm, actionText: e.target.value })}
                placeholder="e.g. Start WhatsApp Chat"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Visible on Storefront</span>
            <input
              type="checkbox"
              checked={cardForm.active}
              onChange={(e) => setCardForm({ ...cardForm, active: e.target.checked })}
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
        title="Delete Channel Card"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
        danger
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ContactPageCMS;

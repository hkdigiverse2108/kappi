import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Pin,
  Trash2,
  Sparkles,
  HelpCircle,
  CornerDownRight,
  Send,
  Sliders,
  Check,
  ShieldCheck,
  Edit,
  UploadCloud,
  X,
  RefreshCw,
  Package
} from 'lucide-react';
import * as homeApi from '../../api/homeApi';
import { CustomSelect } from '../components/common/CustomSelect';
import { useAdminStore } from '../store/adminStore';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideDrawer } from '../components/common/SideDrawer';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { SettingsCard, TextField } from '../components/common/SettingsCard';
import { StarRating, StarRatingInput } from '../../components/common/StarRating';
import { useSectionForm } from '../lib/useSectionForm';
import { confirmDelete } from '../../store/useConfirmStore';

const EMPTY_REVIEW_FORM = {
  productId: '',
  productTitle: '',
  photos: [],
  name: '',
  city: 'Mumbai',
  rating: 5,
  title: '',
  comment: '',
  verified: true
};

// Review dates: stored on the website as "18 Oct 2026"; the date picker needs "2026-10-18"
const pad = (n) => String(n).padStart(2, '0');
const toInputDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// Local midnight as ISO-like text, so the store formats it back to "18 Oct 2026"
const todayIso = () => `${toInputDate(new Date())}T00:00:00`;

export const ReviewsPage = () => {
  const {
    reviews,
    products,
    addReview,
    updateReview,
    updateReviewStatus,
    replyToReview,
    deleteReview,
    addToast,
    reviewsSection,
    updateHomeContent
  } = useAdminStore();

  // Always show the latest reviews from the backend when this page opens
  useEffect(() => {
    useAdminStore.getState().loadReviews();
  }, []);

  // Homepage "Real Customer Reviews" strip settings
  const [reviewsSectionForm, setReviewsSectionForm] = useSectionForm(reviewsSection);

  const [activeStatusFilter, setActiveStatusFilter] = useState('All');

  // Product reviews (shown on product pages) vs homepage reviews (homepage strip only).
  // Reviews saved before "type" existed count as product reviews.
  const [reviewTab, setReviewTab] = useState('product');
  const isHomepageTab = reviewTab === 'homepage';
  const reviewType = (r) => (r.type === 'homepage' ? 'homepage' : 'product');
  const productReviews = reviews.filter((r) => reviewType(r) === 'product');
  const homepageReviews = reviews.filter((r) => reviewType(r) === 'homepage');
  const tabReviews = isHomepageTab ? homepageReviews : productReviews;

  // Reply modal state
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Review Drawer (create or edit)
  const [manualReviewOpen, setManualReviewOpen] = useState(false);
  // Review being edited; null = creating a new one
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const productOptions = (products || []).map((p) => ({ value: p.id, label: p.title }));

  const handleUploadPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      const urls = await Promise.all(files.map((file) => homeApi.uploadImage(file)));
      setReviewForm((form) => ({ ...form, photos: [...(form.photos || []), ...urls] }));
    } catch (err) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (idx) => {
    setReviewForm((form) => ({ ...form, photos: form.photos.filter((_, i) => i !== idx) }));
  };

  const openReviewDrawer = (review = null) => {
    setEditingReview(review);
    setReviewForm(
      review
        ? {
            type: reviewType(review),
            createdAt: review.createdAt || todayIso(),
            productId: review.productId || '',
            productTitle: review.productTitle || '',
            photos: review.photos || [],
            name: review.name || '',
            city: review.city || '',
            rating: Number(review.rating) || 5,
            title: review.title || '',
            comment: review.comment || '',
            verified: review.verified ?? true
          }
        : { ...EMPTY_REVIEW_FORM, type: reviewTab, createdAt: todayIso() }
    );
    setManualReviewOpen(true);
  };

  const formIsHomepage = reviewForm.type === 'homepage';

  const statusFilters = [
    { key: 'All', label: 'All Reviews' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Rejected', label: 'Rejected' }
  ];

  const handleCreateReview = (e) => {
    e.preventDefault();
    if (!formIsHomepage && !reviewForm.productId) {
      addToast({ type: 'error', title: 'Product missing', message: 'Please choose which product this review is for.' });
      return;
    }
    if (!reviewForm.name || !reviewForm.comment) {
      addToast({ type: 'error', title: 'Fields missing', message: 'Name and comment are required.' });
      return;
    }
    if (uploadingPhotos) {
      addToast({ type: 'info', title: 'Please wait', message: 'Photos are still uploading.' });
      return;
    }

    // Homepage reviews are not tied to a product
    // Product reviews show only rating, name, verified, date, text and photos on the product page
    const data = formIsHomepage
      ? { ...reviewForm, productId: '', productTitle: '', photos: [], status: 'Approved' }
      : { ...reviewForm, city: '', title: '' };

    if (editingReview) {
      updateReview(editingReview.id, data);
      addToast({
        type: 'success',
        title: 'Review Updated',
        message: `Saved changes to ${reviewForm.name}'s review.`
      });
    } else if (formIsHomepage) {
      addReview(data);
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Review Added',
        message: `Created verified review by ${reviewForm.name}.`
      });
    } else {
      // New product reviews wait for approval before they show on the product page
      addReview({ ...data, status: 'Pending' });
      addToast({
        type: 'info',
        title: 'Review Saved as Pending',
        message: `Approve ${reviewForm.name}'s review to show it on the product page.`
      });
      setActiveStatusFilter('Pending');
    }
    setManualReviewOpen(false);
    setEditingReview(null);
  };

  const handleSendReply = () => {
    if (!replyingReview || !replyText.trim()) return;
    replyToReview(replyingReview.id, replyText);
    addToast({
      type: 'success',
      title: 'Reply Published',
      message: `Posted brand reply to ${replyingReview.name}.`
    });
    setReplyingReview(null);
    setReplyText('');
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.question) return;
    setQuestions([
      {
        id: `q-${Date.now()}`,
        author: questionForm.author || 'Customer',
        product: questionForm.product,
        question: questionForm.question,
        answer: questionForm.answer,
        published: true,
        date: new Date().toISOString().split('T')[0]
      },
      ...questions
    ]);
    addToast({ type: 'success', title: 'Q&A Published', message: 'Added new customer question and response.' });
    setNewQuestionOpen(false);
  };

  const reviewColumns = [
    {
      header: 'Customer',
      accessor: 'name',
      cell: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-ink dark:text-stone-100 text-xs">{row.name}</span>
            {row.verified && (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-400">
            {[row.city, row.createdAt && toInputDate(row.createdAt) &&
              new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })]
              .filter(Boolean)
              .join(' • ')}
          </p>
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: 'rating',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <StarRating value={row.rating} className="w-3.5 h-3.5" emptyClassName="text-stone-300 dark:text-stone-700" />
          <span className="text-[11px] font-bold text-stone-500">{Number(row.rating) || 0}</span>
        </div>
      )
    },
    {
      header: 'Review Content',
      accessor: 'comment',
      cell: (row) => (
        <div className="max-w-md">
          {row.productTitle && (
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-0.5">
              <Package className="w-3 h-3" />
              {row.productTitle}
            </p>
          )}
          <p className="font-semibold text-xs text-stone-800 dark:text-stone-200">{row.title}</p>
          <p className="text-[11px] text-stone-500 line-clamp-2 italic">"{row.comment}"</p>
          {row.photos?.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {row.photos.slice(0, 4).map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-md object-cover border border-stone-200" />
              ))}
              {row.photos.length > 4 && (
                <span className="text-[10px] font-semibold text-stone-500">+{row.photos.length - 4}</span>
              )}
            </div>
          )}
          {row.reply && (
            <div className="mt-1 flex items-start gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50/70 dark:bg-emerald-950/40 p-1.5 rounded-lg">
              <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
              <span>Brand reply: "{row.reply}"</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: isHomepageTab ? 'Actions' : 'Moderation',
      disableRowClick: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {/* Homepage reviews are added by the admin, so there is nothing to approve or reply to */}
          {isHomepageTab ? null : row.status === 'Pending' ? (
            <>
              <button
                onClick={() => {
                  updateReviewStatus(row.id, 'Approved');
                  triggerKapeeCelebration();
                  addToast({ type: 'success', title: 'Review Approved', message: `Published ${row.name}'s review.` });
                }}
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                title="Approve review"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  updateReviewStatus(row.id, 'Rejected');
                  addToast({ type: 'error', title: 'Review Rejected', message: 'Rejected review.' });
                }}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                title="Reject review"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setReplyingReview(row);
                setReplyText(row.reply || '');
              }}
              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-emerald-50"
              title="Reply to review"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => openReviewDrawer(row)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-ink hover:bg-stone-100"
            title="Edit review"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              confirmDelete({
                title: 'Delete Review?',
                message: `Delete the review by ${row.name || 'this customer'}? This cannot be undone.`,
                onConfirm: () => {
                  deleteReview(row.id);
                  addToast({ type: 'info', title: 'Review Removed', message: 'Review was deleted.' });
                }
              })
            }
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Reviews
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Moderate customer testimonials, verify ratings, and engage directly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openReviewDrawer()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{isHomepageTab ? 'Create Homepage Review' : 'Create Product Review'}</span>
        </button>
      </div>

      {/* Product reviews / Homepage reviews */}
      <div className="inline-flex p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs font-semibold">
        {[
          { key: 'product', label: 'Product Reviews', icon: Package, count: productReviews.length },
          { key: 'homepage', label: 'Homepage Reviews', icon: Sparkles, count: homepageReviews.length }
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setReviewTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              reviewTab === key
                ? 'bg-white dark:bg-stone-900 text-emerald-deep dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-ink dark:hover:text-stone-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                reviewTab === key ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 dark:bg-stone-700'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-500 -mt-3">
        {isHomepageTab
          ? 'Added by the admin and shown straight away in the auto-scrolling reviews strip on the homepage — no approval needed.'
          : 'Each review belongs to a product. New reviews start as Pending and show on that product page only after you approve them.'}
      </p>

      {/* Homepage reviews strip settings */}
      {isHomepageTab && (
      <SettingsCard
        title="Homepage Reviews Section"
        description="Heading of the auto-scrolling reviews strip on the homepage and how many approved reviews it shows."
        onSave={() => {
          updateHomeContent('reviewsSection', reviewsSectionForm);
          triggerKapeeCelebration();
          addToast({ type: 'success', title: 'Reviews Section Saved', message: 'Homepage reviews strip updated.' });
        }}
        saveLabel="Save Reviews Section"
        collapsible
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <TextField label="Heading" value={reviewsSectionForm.heading} onChange={(v) => setReviewsSectionForm({ ...reviewsSectionForm, heading: v })} placeholder="REAL CUSTOMER REVIEWS" />
          <TextField label="Subtitle" value={reviewsSectionForm.subheading} onChange={(v) => setReviewsSectionForm({ ...reviewsSectionForm, subheading: v })} placeholder="Real Stories. Real Results." />
          <TextField label="Number of Reviews" type="number" value={reviewsSectionForm.limit} onChange={(v) => setReviewsSectionForm({ ...reviewsSectionForm, limit: Math.max(1, v || 1) })} placeholder="8" />
        </div>
      </SettingsCard>
      )}

      {/* Reviews Table */}
      <DataTable
          key={reviewTab}
          columns={isHomepageTab ? reviewColumns.filter((c) => c.header !== 'Status') : reviewColumns}
          data={tabReviews}
          searchPlaceholder="Search reviews by customer, text, city..."
          filters={isHomepageTab ? undefined : statusFilters}
          activeFilter={isHomepageTab ? 'All' : activeStatusFilter}
          onFilterChange={(s) => setActiveStatusFilter(s)}
          bulkActions={(selectedIds, clear) => (
            <>
              {!isHomepageTab && (
              <button
                onClick={() => {
                  selectedIds.forEach((id) => updateReviewStatus(id, 'Approved'));
                  triggerKapeeCelebration();
                  addToast({ type: 'success', title: 'Reviews Approved', message: `Approved ${selectedIds.length} reviews.` });
                  clear();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Bulk Approve
              </button>
              )}
              <button
                onClick={() =>
                  confirmDelete({
                    title: 'Delete Selected Reviews?',
                    message: `Delete ${selectedIds.length} selected reviews? This cannot be undone.`,
                    onConfirm: () => {
                      selectedIds.forEach((id) => deleteReview(id));
                      addToast({ type: 'info', title: 'Reviews Removed', message: `Deleted ${selectedIds.length} reviews.` });
                      clear();
                    }
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Delete Selected
              </button>
            </>
          )}
        />

      {/* Brand Reply Modal */}
      {replyingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReplyingReview(null);
          }}
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100">
                Reply to {replyingReview.name}'s Review
              </h3>
              <p className="text-xs text-stone-500 italic mt-1">"{replyingReview.comment}"</p>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Write official response from KAPEE team..."
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyingReview(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs"
              >
                Publish Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Review Creation Drawer */}
      <SideDrawer
        isOpen={manualReviewOpen}
        onClose={() => setManualReviewOpen(false)}
        title={
          editingReview
            ? formIsHomepage ? 'Edit Homepage Review' : 'Edit Product Review'
            : formIsHomepage ? 'Add Homepage Review' : 'Add Product Review'
        }
        subtitle={
          editingReview
            ? `Update ${editingReview.name}'s review`
            : formIsHomepage
              ? 'Shown in the homepage reviews strip'
              : 'Insert customer review collected via WhatsApp or offline feedback'
        }
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setManualReviewOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateReview}
              className="px-4 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs"
            >
              {editingReview ? 'Save Changes' : 'Publish Review'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {!formIsHomepage && (
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Product *</label>
            <CustomSelect
              value={reviewForm.productId}
              onChange={(_, productId) =>
                setReviewForm({
                  ...reviewForm,
                  productId,
                  productTitle: productOptions.find((o) => o.value === productId)?.label || ''
                })
              }
              options={productOptions}
              placeholder="Choose the product this review is for"
            />
          </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Customer Name *</label>
            <input
              type="text"
              value={reviewForm.name}
              onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          {formIsHomepage && (
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">City</label>
            <input
              type="text"
              value={reviewForm.city}
              onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>
          )}

          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Review Date</label>
              <input
                type="date"
                value={toInputDate(reviewForm.createdAt)}
                onChange={(e) => e.target.value && setReviewForm({ ...reviewForm, createdAt: `${e.target.value}T00:00:00` })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-stone-50 dark:bg-stone-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!reviewForm.verified}
                onChange={(e) => setReviewForm({ ...reviewForm, verified: e.target.checked })}
                className="w-4 h-4 accent-emerald-600"
              />
              <span className="font-semibold text-stone-700 dark:text-stone-300">Verified buyer</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Star Rating</label>
            <StarRatingInput
              value={reviewForm.rating}
              onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
            />
            <p className="text-[11px] text-stone-400">
              Click the left half of a star for a half rating, or type an exact value like 4.3.
            </p>
          </div>

          {formIsHomepage && (
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Headline</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Review Feedback *</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          {!formIsHomepage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700 dark:text-stone-300">
                Review Photos ({(reviewForm.photos || []).length})
              </label>
              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white cursor-pointer transition-all shadow-xs active:scale-95 ${
                  uploadingPhotos ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {uploadingPhotos ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>{uploadingPhotos ? 'Uploading...' : '+ Add Photos'}</span>
                <input type="file" multiple accept="image/*" onChange={handleUploadPhotos} className="hidden" />
              </label>
            </div>

            {(reviewForm.photos || []).length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {reviewForm.photos.map((src, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800">
                    <img src={src} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => confirmDelete({ title: 'Remove Photo?', message: 'Remove this photo from the review?', onConfirm: () => removePhoto(idx) })}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-400 italic">No photos yet. You can select several images at once.</p>
            )}
          </div>
          )}
        </div>
      </SideDrawer>
    </div>
  );
};

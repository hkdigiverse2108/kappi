import React, { useEffect, useState } from 'react';
import { Truck, Gift, Percent, Save, Package, Eye } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useCartStore } from '../../store/useCartStore';
import { saveCartOffers } from '../../api/cartOffersApi';
import { activeRewards } from '../../data/offers';
import { CustomSelect } from '../components/common/CustomSelect';
import { triggerKapeeCelebration } from '../components/common/Confetti';

const EMPTY_OFFERS = {
  shippingFee: 0,
  giftWrapFee: 0,
  freeShipping: { enabled: false, threshold: 0 },
  freeGift: { enabled: false, threshold: 0, productId: '', variantId: null },
  extraDiscount: { enabled: false, threshold: 0, percent: 0 }
};

// Only the fields the backend saves (the GET also returns the gift's product details)
const toSaved = (offers) => ({
  shippingFee: Number(offers.shippingFee) || 0,
  giftWrapFee: Number(offers.giftWrapFee) || 0,
  freeShipping: {
    enabled: offers.freeShipping.enabled,
    threshold: Number(offers.freeShipping.threshold) || 0
  },
  freeGift: {
    enabled: offers.freeGift.enabled,
    threshold: Number(offers.freeGift.threshold) || 0,
    productId: offers.freeGift.productId || '',
    variantId: offers.freeGift.variantId || null
  },
  extraDiscount: {
    enabled: offers.extraDiscount.enabled,
    threshold: Number(offers.extraDiscount.threshold) || 0,
    percent: Number(offers.extraDiscount.percent) || 0
  }
});

const inputClass =
  'w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-ink dark:text-stone-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50';

const AmountField = ({ label, hint, value, onChange, disabled, prefix = '₹', max }) => (
  <div className="space-y-1 text-xs">
    <label className="font-semibold text-stone-700 dark:text-stone-300">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">{prefix}</span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
        className={`${inputClass} pl-7`}
      />
    </div>
    {hint && <p className="text-[10px] text-stone-400">{hint}</p>}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`}
  >
    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
  </button>
);

const RewardCard = ({ icon: Icon, title, description, enabled, onToggle, children }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-deep dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink dark:text-stone-100">{title}</h3>
          <p className="text-xs text-muted dark:text-stone-400 mt-0.5">{description}</p>
        </div>
      </div>
      {onToggle && (
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] font-semibold ${enabled ? 'text-emerald-700 dark:text-emerald-300' : 'text-stone-400'}`}>
          {enabled ? 'On' : 'Off'}
        </span>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      )}
    </div>
    {children}
  </div>
);

export const CartRewardsPage = () => {
  const { products, addToast, logActivity } = useAdminStore();
  const cartOffers = useCartStore((s) => s.cartOffers);
  const loadCartOffers = useCartStore((s) => s.loadCartOffers);
  const [form, setForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Always edit what the website currently uses
  useEffect(() => {
    loadCartOffers();
  }, [loadCartOffers]);
  useEffect(() => {
    if (cartOffers && !form) setForm({ ...EMPTY_OFFERS, ...cartOffers });
  }, [cartOffers, form]);

  if (!form) {
    return <div className="py-20 text-center text-xs text-muted">Loading cart rewards...</div>;
  }

  const setSection = (section, changes) => setForm((f) => ({ ...f, [section]: { ...f[section], ...changes } }));

  const giftProduct = (products || []).find((p) => p.id === form.freeGift.productId);
  const giftVariants = giftProduct?.variants || [];

  const handleSave = async () => {
    const saved = toSaved(form);
    if (saved.freeGift.enabled && !saved.freeGift.productId) {
      addToast({ type: 'error', title: 'Choose a gift', message: 'Select the product to give as the free gift.' });
      return;
    }
    if (saved.extraDiscount.enabled && !saved.extraDiscount.percent) {
      addToast({ type: 'error', title: 'Discount missing', message: 'Enter the extra discount percentage.' });
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveCartOffers(saved);
      setForm({ ...EMPTY_OFFERS, ...result });
      await loadCartOffers();
      logActivity('Cart Rewards', 'Updated cart rewards and fees');
      triggerKapeeCelebration();
      addToast({ type: 'success', title: 'Cart Rewards Saved', message: 'The website cart now uses these rewards.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Preview of the cart progress bar with the values being edited
  const previewOffers = {
    ...toSaved(form),
    freeGift: {
      ...toSaved(form).freeGift,
      item: giftProduct ? { title: giftProduct.title } : null
    }
  };
  const previewRewards = activeRewards(previewOffers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">Cart Rewards</h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Free shipping, free gift and extra discount unlocked by cart value, plus shipping and gift packaging fees.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md transition-all active:scale-95 disabled:opacity-60 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Live preview */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Cart Progress Bar Preview
        </h3>
        {previewRewards.length === 0 ? (
          <p className="text-xs text-muted">All rewards are off, so the progress bar is hidden in the cart.</p>
        ) : (
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3">
            <div className="w-full h-2 rounded-full bg-white dark:bg-stone-800 border border-emerald-200/60 dark:border-emerald-900" />
            <div
              className="grid gap-1 mt-2 text-center text-[10px] text-stone-500 dark:text-stone-400"
              style={{ gridTemplateColumns: `repeat(${previewRewards.length}, minmax(0, 1fr))` }}
            >
              {previewRewards.map((r) => {
                const Icon = { shipping: Truck, gift: Gift, discount: Percent }[r.key];
                return (
                  <div key={r.key} className="flex flex-col items-center gap-0.5">
                    <span className="w-5 h-5 rounded-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center">
                      <Icon className="w-3 h-3" />
                    </span>
                    <span>{r.shortLabel} (₹{r.threshold})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Free shipping */}
        <RewardCard
          icon={Truck}
          title="Free Shipping"
          description="Shipping becomes free when the cart reaches this amount."
          enabled={form.freeShipping.enabled}
          onToggle={(v) => setSection('freeShipping', { enabled: v })}
        >
          <AmountField
            label="Cart Amount for Free Shipping"
            value={form.freeShipping.threshold}
            disabled={!form.freeShipping.enabled}
            onChange={(v) => setSection('freeShipping', { threshold: v })}
          />
        </RewardCard>

        {/* Extra discount */}
        <RewardCard
          icon={Percent}
          title="Extra Cart Discount"
          description="An extra % off the cart when it reaches this amount."
          enabled={form.extraDiscount.enabled}
          onToggle={(v) => setSection('extraDiscount', { enabled: v })}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AmountField
              label="Cart Amount"
              value={form.extraDiscount.threshold}
              disabled={!form.extraDiscount.enabled}
              onChange={(v) => setSection('extraDiscount', { threshold: v })}
            />
            <AmountField
              label="Discount"
              prefix="%"
              max={90}
              value={form.extraDiscount.percent}
              disabled={!form.extraDiscount.enabled}
              onChange={(v) => setSection('extraDiscount', { percent: v === '' ? '' : Math.min(90, v) })}
            />
          </div>
        </RewardCard>

        {/* Free gift */}
        <RewardCard
          icon={Gift}
          title="Free Gift"
          description="A product is added to the cart for free when the cart reaches this amount."
          enabled={form.freeGift.enabled}
          onToggle={(v) => setSection('freeGift', { enabled: v })}
        >
          <div className={`space-y-3 ${form.freeGift.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <AmountField
              label="Cart Amount for Free Gift"
              value={form.freeGift.threshold}
              onChange={(v) => setSection('freeGift', { threshold: v })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Gift Product</label>
                <CustomSelect
                  value={form.freeGift.productId}
                  placeholder="Choose a product"
                  onChange={(e) => {
                    const p = (products || []).find((prod) => prod.id === e.target.value);
                    setSection('freeGift', { productId: e.target.value, variantId: p?.variants?.[0]?.id || null });
                  }}
                  options={(products || []).map((p) => ({ value: p.id, label: p.title }))}
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Gift Pack</label>
                <CustomSelect
                  value={form.freeGift.variantId || ''}
                  placeholder={giftVariants.length ? 'Choose a pack' : 'No packs'}
                  disabled={!giftVariants.length}
                  onChange={(e) => setSection('freeGift', { variantId: e.target.value })}
                  options={giftVariants.map((v) => ({ value: v.id, label: `${v.name} (MRP ₹${v.mrp ?? v.price})` }))}
                />
              </div>
            </div>
            {giftProduct && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                {giftProduct.images?.[0] ? (
                  <img src={giftProduct.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                    <Package className="w-4 h-4 text-stone-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink dark:text-stone-100 truncate">{giftProduct.title}</p>
                  <p className="text-[11px] text-muted">
                    {giftVariants.find((v) => v.id === form.freeGift.variantId)?.name || 'Standard'} • shown as FREE in the cart
                  </p>
                </div>
              </div>
            )}
          </div>
        </RewardCard>

        {/* Fees */}
        <RewardCard
          icon={Package}
          title="Cart Fees"
          description="Shipping charged below the free shipping amount, and the gift packaging option price."
          enabled
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AmountField
              label="Shipping Fee"
              hint={form.freeShipping.enabled ? `Free from ₹${form.freeShipping.threshold || 0}` : 'Charged on every order'}
              value={form.shippingFee}
              onChange={(v) => setForm((f) => ({ ...f, shippingFee: v }))}
            />
            <AmountField
              label="Gift Packaging Fee"
              hint="Customer can add it in the cart"
              value={form.giftWrapFee}
              onChange={(v) => setForm((f) => ({ ...f, giftWrapFee: v }))}
            />
          </div>
        </RewardCard>
      </div>
    </div>
  );
};

export default CartRewardsPage;

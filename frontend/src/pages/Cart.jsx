import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Gift,
  Truck,
  Percent,
  Tag,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useCartStore } from '../store/useCartStore';
import { calculateMilestones } from '../data/offers';
import { cartSuggestions } from '../utils/cartSuggestions';
import { useProductStore } from '../store/useProductStore';
import { confirmDelete } from '../store/useConfirmStore';

export const Cart = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    getMaxQuantity,
    removeItem,
    getSubtotal,
    getMrpTotal,
    getSavings,
    getShippingFee,
    getCouponDiscount,
    getExtraTierDiscount,
    getFinalTotal,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    orderNote,
    setOrderNote,
    addItem,
    cartOffers
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');

  const subtotal = getSubtotal();
  const mrpTotal = getMrpTotal();
  const savings = getSavings();
  const shippingFee = getShippingFee();
  const couponDiscount = getCouponDiscount();
  const extraTierDiscount = getExtraTierDiscount();
  const finalTotal = getFinalTotal();
  const milestones = calculateMilestones(subtotal, cartOffers);

  // Products chosen as "You May Also Like" for the products in the cart
  const upsellItems = cartSuggestions(items, products);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const ok = applyCoupon(inputCoupon);
      if (ok) setInputCoupon('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <Helmet>
          <title>Your Cart is Empty | KAPEE Enterprise</title>
        </Helmet>
        <div className="w-24 h-24 bg-emerald-soft rounded-full flex items-center justify-center mx-auto text-emerald">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          You haven't added any magic erasers or cleaning essentials yet. Explore our bestsellers and bundles today!
        </p>
        <div>
          <Link to="/shop" className="btn-primary inline-flex text-sm font-bold px-8 py-3.5">
            Explore Shop Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>{`Shopping Cart (${items.length} items) | KAPEE Enterprise`}</title>
      </Helmet>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted">
        <Link to="/" className="hover:text-emerald">Home</Link>
        <span>/</span>
        <span className="text-ink font-semibold">Shopping Cart</span>
      </nav>

      <h1 className="font-serif text-3xl font-extrabold text-ink">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN: ITEMS LIST & ADDONS
           ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Milestone Progress Bar (rewards from Admin > Offers > Cart Rewards) */}
          {milestones.rewards.length > 0 && (
          <div className="bg-emerald-soft/60 p-5 rounded-3xl border border-emerald-soft space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-deep">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-dark" />
                {milestones.nextMilestone?.message}
              </span>
              <span>{milestones.progressPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-emerald/20 p-0.5">
              <div
                className="h-full rounded-full bg-gold-gradient transition-all duration-700"
                style={{ width: `${milestones.progressPercentage}%` }}
              />
            </div>
          </div>
          )}

          {/* Cart Items Table / Cards */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-soft shadow-soft space-y-4 divide-y divide-emerald-soft/60">
            {items.map((item) => (
              <div
                key={item.id}
                className={`pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  item.isFreeGift ? 'bg-gold-50/50 p-4 rounded-2xl border border-gold/30' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-18 h-18 w-[76px] h-[76px] object-cover rounded-2xl border border-emerald-soft shrink-0"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-ink line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{item.variantName}</p>
                    {item.isFreeGift ? (
                      <span className="text-xs font-bold text-success">FREE BONUS GIFT</span>
                    ) : (
                      <div className="flex items-baseline gap-2 mt-1 sm:hidden">
                        <span className="text-sm font-bold text-emerald-deep">₹{item.price * item.quantity}</span>
                        <span className="text-xs text-muted line-through">₹{item.mrp * item.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {!item.isFreeGift ? (
                    <div className="flex items-center border border-muted/30 rounded-xl overflow-hidden bg-ivory">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-muted hover:text-ink hover:bg-emerald-soft"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-ink">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= getMaxQuantity(item)}
                        title={item.quantity >= getMaxQuantity(item) ? `Only ${getMaxQuantity(item)} in stock` : undefined}
                        className="px-2.5 py-1 text-muted hover:text-ink hover:bg-emerald-soft disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-success bg-emerald-soft px-3 py-1 rounded-full">
                      Auto Unlocked
                    </span>
                  )}

                  <div className="text-right hidden sm:block">
                    <p className="text-base font-bold text-emerald-deep">
                      ₹{item.price * item.quantity}
                    </p>
                    {item.mrp > item.price && (
                      <p className="text-xs text-muted line-through">
                        ₹{item.mrp * item.quantity}
                      </p>
                    )}
                  </div>

                  {!item.isFreeGift && (
                    <button
                      onClick={() => confirmDelete({ title: 'Remove Item?', message: `Remove ${item.title} from your cart?`, onConfirm: () => removeItem(item.id) })}
                      className="text-muted hover:text-error p-2 rounded-lg hover:bg-red-50"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Notes */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-soft">
            <label className="block text-xs font-bold text-ink mb-1.5">Special Delivery Instructions:</label>
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="e.g. Leave with security, call before arrival"
              className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-soft focus:outline-none focus:border-emerald"
            />
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: ORDER SUMMARY & CHECKOUT CTA
           ======================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 border border-emerald-soft shadow-soft space-y-4">
            <h2 className="font-serif font-bold text-lg text-ink pb-3 border-b border-emerald-soft">
              Order Summary
            </h2>

            {/* Coupon Field */}
            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-soft border border-emerald/30 text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald" />
                  <div>
                    <span className="font-bold text-emerald-deep">{coupon.code}</span>
                    <span className="text-muted ml-1">(-₹{couponDiscount})</span>
                  </div>
                </div>
                <button onClick={removeCoupon} className="text-error font-semibold hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  placeholder="Coupon code (KAPEE10)"
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-emerald-soft focus:outline-none focus:border-emerald uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-deep text-white text-xs font-bold rounded-xl hover:bg-emerald transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && <p className="text-[11px] text-error font-medium">{couponError}</p>}

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-muted pt-2 border-t border-emerald-soft">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-ink">₹{subtotal}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Total Savings</span>
                  <span>-₹{savings}</span>
                </div>
              )}
              {extraTierDiscount > 0 && (
                <div className="flex justify-between text-gold-dark font-semibold">
                  <span>VIP 10% Extra Discount</span>
                  <span>-₹{extraTierDiscount}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? <strong className="text-success">FREE</strong> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink pt-3 border-t border-emerald-soft">
                <span>Total Amount</span>
                <span className="text-emerald-deep text-xl font-extrabold">₹{finalTotal}</span>
              </div>
              <p className="text-[10px] text-muted text-center pt-1">
                Inclusive of 18% GST • 7-Day Hassle-Free Returns
              </p>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="btn-gold w-full text-sm font-bold py-3.5 tracking-wider uppercase flex items-center justify-center gap-2 shadow-gold"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted pt-1">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>100% Encrypted & Safe Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

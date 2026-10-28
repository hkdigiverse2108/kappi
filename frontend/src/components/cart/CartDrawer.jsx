import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Gift,
  Truck,
  Percent,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { CouponField } from './CouponField';
import { calculateMilestones } from '../../data/offers';
import { cartSuggestions } from '../../utils/cartSuggestions';
import { useProductStore } from '../../store/useProductStore';
import { firstAvailableVariant, isOutOfStock } from '../../utils/stock';

const REWARD_ICONS = { shipping: Truck, gift: Gift, discount: Percent };
const REWARD_UNLOCKED_STYLES = {
  shipping: 'bg-emerald text-white',
  gift: 'bg-gold text-emerald-950 font-bold',
  discount: 'bg-emerald-deep text-gold-light'
};
import { confirmDelete } from '../../store/useConfirmStore';

export const CartDrawer = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const navigate = useNavigate();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
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
    orderNote,
    setOrderNote,
    addItem,
    unlockToast,
    cartOffers
  } = useCartStore();

  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!isCartOpen) return null;

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

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-[calc(100vw-2.5rem)] max-w-md bg-white shadow-drawer flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-4 border-b border-emerald-soft flex items-center justify-between bg-ivory">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-deep" />
              <h2 className="font-serif font-bold text-lg text-ink">Your Cleaning Cart</h2>
              <span className="text-xs bg-emerald text-white px-2 py-0.5 rounded-full font-semibold">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-emerald-soft transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Celebratory Banner / Toast if milestone unlocked */}
          {unlockToast && (
            <div className="bg-emerald-deep text-white px-4 py-2.5 flex items-center justify-between animate-fadeIn border-b border-gold/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-light animate-spin" />
                <div>
                  <p className="text-xs font-bold text-gold-light">{unlockToast.title}</p>
                  <p className="text-[11px] text-ivory/80 leading-tight">{unlockToast.desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* Offer Unlock Milestone Bar (rewards from Admin > Offers > Cart Rewards) */}
          {milestones.rewards.length > 0 && (
          <div className="bg-emerald-soft/70 px-5 py-3 border-b border-emerald-soft">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-emerald-deep flex items-center gap-1.5">
                {milestones.nextMilestone?.message}
              </span>
              <span className="text-emerald font-bold">
                {milestones.progressPercentage}%
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-emerald/20 p-0.5">
              <div
                className="h-full rounded-full bg-gold-gradient transition-all duration-700 ease-out"
                style={{ width: `${milestones.progressPercentage}%` }}
              />
            </div>

            {/* Milestone Icons & Unlocks */}
            <div
              className="grid gap-1 mt-2 text-center text-[10px]"
              style={{ gridTemplateColumns: `repeat(${milestones.rewards.length}, minmax(0, 1fr))` }}
            >
              {milestones.rewards.map((reward) => {
                const Icon = REWARD_ICONS[reward.key];
                return (
                  <div
                    key={reward.key}
                    className={`flex flex-col items-center ${reward.unlocked ? 'text-emerald-deep font-bold' : 'text-muted'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center mb-0.5 ${
                        reward.unlocked ? REWARD_UNLOCKED_STYLES[reward.key] : 'bg-white border border-muted/30 text-muted'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <span>{reward.shortLabel} (₹{reward.threshold})</span>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="w-20 h-20 bg-emerald-soft rounded-full flex items-center justify-center mx-auto text-emerald">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink">Your cart is empty</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Experience effortless cleaning with our chemical-free magic erasers and essentials.
                </p>
                <div className="pt-2">
                  <Link
                    to="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-primary w-full max-w-xs mx-auto text-sm"
                  >
                    Start Shopping
                  </Link>
                </div>
                {/* Best sellers suggestions */}
                <div className="mt-8 text-left border-t border-emerald-soft pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Popular Starting Picks</p>
                  <div className="space-y-2">
                    {products.filter((p) => !isOutOfStock(p)).slice(0, 2).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-ivory border border-emerald-soft/50">
                        <div className="flex items-center gap-2.5">
                          <img src={p.images[0]} alt={p.title} className="w-11 h-11 object-cover rounded-lg" />
                          <div>
                            <div className="text-xs font-bold text-ink line-clamp-1">{p.title}</div>
                            <div className="text-xs font-bold text-emerald-deep">₹{p.basePrice}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => addItem({ product: p, variant: firstAvailableVariant(p), quantity: 1 })}
                          className="text-xs font-semibold px-3 py-1.5 bg-emerald text-white rounded-lg hover:bg-emerald-deep transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-3 p-3 rounded-2xl border transition-all ${
                      item.isFreeGift
                        ? 'bg-gold-50/60 border-gold/40'
                        : 'bg-white border-emerald-soft shadow-xs'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-18 h-18 w-[72px] h-[72px] object-cover rounded-xl border border-emerald-soft/50 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-ink line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          {!item.isFreeGift && (
                            <button
                              onClick={() => confirmDelete({ title: 'Remove Item?', message: `Remove ${item.title} from your cart?`, onConfirm: () => removeItem(item.id) })}
                              className="text-muted/60 hover:text-error p-1 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-muted mt-0.5">{item.variantName}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {item.isFreeGift ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-success">FREE GIFT (₹0)</span>
                            <span className="text-[10px] text-muted line-through">₹{item.mrp}</span>
                          </div>
                        ) : (
                          <div className="flex items-center border border-muted/30 rounded-lg overflow-hidden bg-ivory">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-muted hover:text-ink hover:bg-emerald-soft transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-ink select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= getMaxQuantity(item)}
                              title={item.quantity >= getMaxQuantity(item) ? `Only ${getMaxQuantity(item)} in stock` : undefined}
                              className="px-2 py-1 text-muted hover:text-ink hover:bg-emerald-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-deep">
                            ₹{item.price * item.quantity}
                          </div>
                          {item.mrp > item.price && (
                            <div className="text-[10px] text-muted line-through">
                              ₹{item.mrp * item.quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order Note accordion */}
                <div>
                  <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className="text-xs text-muted hover:text-emerald font-medium underline flex items-center gap-1"
                  >
                    {showNoteInput ? 'Close order note' : '+ Add order note / instructions'}
                  </button>
                  {showNoteInput && (
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="e.g. Leave with security guard, please deliver in evening..."
                      rows={2}
                      className="w-full mt-2 text-xs p-2.5 rounded-xl border border-emerald-soft focus:outline-none focus:border-emerald bg-ivory"
                    />
                  )}
                </div>

                {/* Quick Upsell Mini-strip */}
                {upsellItems.length > 0 && (
                  <div className="pt-3 border-t border-emerald-soft">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                      Frequently Added With This
                    </p>
                    <div className="space-y-2">
                      {upsellItems.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-emerald-soft/60"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={u.images[0]} alt={u.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-ink truncate">{u.title}</p>
                              <p className="text-xs font-bold text-emerald-deep">₹{u.basePrice}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => addItem({ product: u, variant: firstAvailableVariant(u), quantity: 1 })}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald bg-emerald-soft hover:bg-emerald hover:text-white rounded-lg transition-colors shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-emerald-soft bg-ivory/80 space-y-3">
              {/* Coupon Field */}
              <CouponField />

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-muted pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink">₹{subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-success font-medium">
                    <span>Total Discount & Savings</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                {extraTierDiscount > 0 && (
                  <div className="flex justify-between text-gold-dark font-medium">
                    <span>VIP 10% Tier Unlock</span>
                    <span>-₹{extraTierDiscount}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success font-medium">
                    <span>Coupon ({coupon?.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-success font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ink border-t border-emerald-soft pt-2">
                  <span>Estimated Total</span>
                  <span className="text-emerald-deep text-base">₹{finalTotal}</span>
                </div>
                <p className="text-[10px] text-muted text-center">Inclusive of all GST & taxes</p>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="btn-gold w-full text-sm font-bold py-3.5 shadow-gold tracking-wide uppercase flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" /> 100% Secure Checkout
                </span>
                <span>•</span>
                <span>7-Day Easy Returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

// Coupon box shown in the cart drawer and on the checkout page (used after Buy Now too)
export const CouponField = () => {
  const { coupon, couponError, applyCoupon, removeCoupon, getCouponDiscount } = useCartStore();
  const [inputCoupon, setInputCoupon] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const ok = applyCoupon(inputCoupon);
      if (ok) setInputCoupon('');
    }
  };

  return (
    <div className="space-y-1.5">
      {coupon ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-soft border border-emerald/30 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald" />
            <div>
              <span className="font-bold text-emerald-deep">{coupon.code}</span>
              <span className="text-muted ml-1.5">applied (-₹{getCouponDiscount()})</span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-error font-semibold text-xs hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            value={inputCoupon}
            onChange={(e) => setInputCoupon(e.target.value)}
            placeholder="Enter coupon (e.g. KAPEE10)"
            className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl border border-emerald-soft focus:outline-none focus:border-emerald uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-deep text-white text-xs font-bold rounded-xl hover:bg-emerald transition-colors"
          >
            Apply
          </button>
        </form>
      )}
      {couponError && <p className="text-[11px] text-error font-medium">{couponError}</p>}
    </div>
  );
};

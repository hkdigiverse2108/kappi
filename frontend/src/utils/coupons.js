// Helpers for coupons managed in Admin > Offers (type: 'percentage' | 'flat' | 'free_shipping')

// Older carts may still hold a coupon in the previous format ({ discountType, minOrder })
export const couponType = (coupon) => coupon.type || coupon.discountType;
export const couponMinOrder = (coupon) => Number(coupon.minCart ?? coupon.minOrder ?? 0);
// Products the coupon is limited to (empty = every product)
export const couponProductIds = (coupon) => coupon.productIds || [];

// Title and subtitle shown on the product page coupon cards
export const describeCoupon = (coupon) => {
  const min = couponMinOrder(coupon);
  const minText = min > 0 ? ` on Orders ₹${min}+` : '';
  const type = couponType(coupon);

  let title;
  if (type === 'percentage') title = `${coupon.value}% OFF${minText}`;
  else if (type === 'free_shipping') title = `Free Shipping${minText}`;
  else title = `Flat ₹${coupon.value} OFF${minText}`;

  let subtitle;
  if (type === 'percentage' && coupon.maxDiscount) subtitle = `Save up to ₹${coupon.maxDiscount} at checkout`;
  else subtitle = 'Apply this code at checkout';

  return { title, subtitle };
};

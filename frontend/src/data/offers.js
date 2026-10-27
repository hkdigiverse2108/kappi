// Announcement bar texts and the cart reward progress (rewards are set in Admin > Offers > Cart Rewards)

export const announcementOffers = [
  { text: '🚚 FREE Shipping across India on orders above ₹499', highlight: 'FREE Shipping' },
  { text: '✨ Multi-Item Value Combos | Save up to 50% on Bundles', highlight: 'Save up to 50%' },
  { text: '🏷️ Use coupon KAPEE10 for 10% instant checkout discount', highlight: 'KAPEE10' },
  { text: '💵 Cash On Delivery (COD) Available across all pin codes', highlight: 'COD Available' }
];

// Rewards switched on in Admin, lowest amount first: { key, threshold, shortLabel, unlockMessage, unlocked }
export const activeRewards = (offers, subtotal = 0) => {
  if (!offers) return [];
  const rewards = [];
  if (offers.freeShipping?.enabled) {
    rewards.push({
      key: 'shipping',
      threshold: offers.freeShipping.threshold,
      shortLabel: 'Free Ship',
      unlockMessage: 'unlock FREE Shipping!'
    });
  }
  if (offers.freeGift?.enabled && offers.freeGift.item) {
    rewards.push({
      key: 'gift',
      threshold: offers.freeGift.threshold,
      shortLabel: 'Free Gift',
      unlockMessage: `get a FREE ${offers.freeGift.item.title}!`
    });
  }
  if (offers.extraDiscount?.enabled && offers.extraDiscount.percent > 0) {
    rewards.push({
      key: 'discount',
      threshold: offers.extraDiscount.threshold,
      shortLabel: `Extra ${offers.extraDiscount.percent}%`,
      unlockMessage: `unlock an EXTRA ${offers.extraDiscount.percent}% OFF!`
    });
  }
  return rewards
    .sort((a, b) => a.threshold - b.threshold)
    .map((r) => ({ ...r, unlocked: subtotal >= r.threshold }));
};

export const calculateMilestones = (subtotal, offers) => {
  const rewards = activeRewards(offers, subtotal);
  const next = rewards.find((r) => !r.unlocked);
  const maxThreshold = rewards.length ? rewards[rewards.length - 1].threshold : 0;

  let nextMilestone = null;
  if (next) {
    const remaining = next.threshold - subtotal;
    nextMilestone = {
      name: next.shortLabel,
      amount: next.threshold,
      remaining,
      message: `Add ₹${remaining} more to ${next.unlockMessage}`
    };
  } else if (rewards.length) {
    nextMilestone = {
      name: 'All Rewards Unlocked',
      amount: maxThreshold,
      remaining: 0,
      message: '🎉 Amazing! All tier rewards & discounts unlocked!'
    };
  }

  return {
    rewards,
    nextMilestone,
    remainingForNext: nextMilestone?.remaining || 0,
    progressPercentage: maxThreshold ? Math.min(100, Math.round((subtotal / maxThreshold) * 100)) : 0
  };
};

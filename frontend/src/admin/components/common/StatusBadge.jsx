import React from 'react';

/**
 * KAPEE StatusBadge Component
 * Implements exact semantic colors for orders, shipments, moderation & verification.
 * Format: Colored dot + soft background + text + rounded-full border.
 */
export const StatusBadge = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    const s = (status || '').toLowerCase().trim();

    // 1. Pending (Amber #D98E04)
    if (s === 'pending' || s === 'in review' || s === 'awaiting') {
      return {
        bg: 'bg-[#FDF1D6] dark:bg-[#D98E04]/20 text-[#D98E04] dark:text-[#FBBF24] border-[#F3D58E] dark:border-[#D98E04]/35',
        dot: 'bg-[#D98E04]',
      };
    }

    // 2. Confirmed (Blue #2563EB)
    if (s === 'confirmed' || s === 'verified' || s === 'connected') {
      return {
        bg: 'bg-[#E4ECFD] dark:bg-[#2563EB]/20 text-[#2563EB] dark:text-[#60A5FA] border-[#BBCDF8] dark:border-[#2563EB]/35',
        dot: 'bg-[#2563EB]',
      };
    }

    // 3. Packed (Violet #7C5CBF)
    if (s === 'packed' || s === 'processing' || s === 'ready to dispatch') {
      return {
        bg: 'bg-[#F3EDFC] dark:bg-[#7C5CBF]/20 text-[#7C5CBF] dark:text-[#A78BFA] border-[#D8C8F7] dark:border-[#7C5CBF]/35',
        dot: 'bg-[#7C5CBF]',
      };
    }

    // 4. Shipped (Teal #0E8FA3)
    if (s === 'shipped' || s === 'in transit') {
      return {
        bg: 'bg-[#E2F7FA] dark:bg-[#0E8FA3]/20 text-[#0E8FA3] dark:text-[#2DD4BF] border-[#B5EAF0] dark:border-[#0E8FA3]/35',
        dot: 'bg-[#0E8FA3]',
      };
    }

    // 5. Out for delivery (Emerald #0F7A6F)
    if (s === 'out for delivery') {
      return {
        bg: 'bg-[#EAF4F2] dark:bg-[#0F7A6F]/20 text-[#0F7A6F] dark:text-[#34D399] border-[#A0CDC5] dark:border-[#0F7A6F]/35',
        dot: 'bg-[#0F7A6F] animate-pulse',
      };
    }

    // 6. Delivered / Approved / Active / Paid (Green #1E8E5A)
    if (s === 'delivered' || s === 'approved' || s === 'active' || s === 'paid' || s === 'normal') {
      return {
        bg: 'bg-[#E3F4EB] dark:bg-[#1E8E5A]/20 text-[#1E8E5A] dark:text-[#34D399] border-[#BFE3CF] dark:border-[#1E8E5A]/35',
        dot: 'bg-[#1E8E5A]',
      };
    }

    // 7. Cancelled / Spam (Slate #6B7280)
    if (s === 'cancelled' || s === 'spam' || s === 'closed' || s === 'archived') {
      return {
        bg: 'bg-[#F3F4F6] dark:bg-[#6B7280]/20 text-[#6B7280] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#6B7280]/35',
        dot: 'bg-[#6B7280]',
      };
    }

    // 8. RTO / Returned (Coral #E4572E)
    if (s === 'rto' || s === 'returned' || s === 'rto initiated' || s === 'rto delivered') {
      return {
        bg: 'bg-[#FEECE7] dark:bg-[#E4572E]/20 text-[#E4572E] dark:text-[#FB923C] border-[#FBC7B8] dark:border-[#E4572E]/35',
        dot: 'bg-[#E4572E]',
      };
    }

    // 9. Refunded (Gold-Dark #8F6414)
    if (s === 'refunded' || s === 'store credit') {
      return {
        bg: 'bg-[#FDF8E8] dark:bg-[#8F6414]/20 text-[#8F6414] dark:text-[#F1DB93] border-[#F1DB93] dark:border-[#8F6414]/35',
        dot: 'bg-[#8F6414]',
      };
    }

    // 10. Failed / Rejected (Red #C0392B)
    if (s === 'failed' || s === 'rejected' || s === 'disconnected' || s === 'error') {
      return {
        bg: 'bg-[#FBE4E1] dark:bg-[#C0392B]/20 text-[#C0392B] dark:text-[#F87171] border-[#F1B8B1] dark:border-[#C0392B]/35',
        dot: 'bg-[#C0392B]',
      };
    }

    // Default neutral
    return {
      bg: 'bg-[#F4EEDF] dark:bg-[#112A26] text-[#5B6B68] dark:text-[#8FA8A3] border-[#E7E0CE] dark:border-[#1C3A35]',
      dot: 'bg-[#8A9A97]',
    };
  };

  const { bg, dot } = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border text-[11px] tracking-wide transition-all shadow-xs ${bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{status}</span>
    </span>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  Star,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  CheckCircle,
  Truck,
  Sparkles,
  RefreshCw,
  Plus,
  Leaf,
  Calendar,
  ChevronDown,
  X
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useCartStore } from '../../store/useCartStore';
import { activeRewards } from '../../data/offers';
import { StatusBadge } from '../components/common/StatusBadge';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { staggerContainer, staggerItem } from '../lib/motion';

const DAY_MS = 24 * 3600 * 1000;
const STATUS_BAR_COLORS = ['bg-emerald-deep', 'bg-gradient-to-r from-gold to-gold-light', 'bg-teal-600', 'bg-stone-400', 'bg-amber-500', 'bg-rose-400'];

const startOfDay = (d) => {
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day;
};
const addDays = (d, days) => {
  const day = new Date(d);
  day.setDate(day.getDate() + days);
  return day;
};
const toDateInput = (d) => {
  const day = new Date(d);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
};
const shortDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

// % change against the previous period of the same length
const percentChange = (current, previous) => {
  if (!previous) return { change: current ? 'New' : '0%', trend: 'up' };
  const pct = ((current - previous) / previous) * 100;
  return { change: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, trend: pct >= 0 ? 'up' : 'down' };
};

// Count up helper
const CountUp = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 800;
    const increment = Math.ceil(end / 30);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, duration / 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const cartOffers = useCartStore((s) => s.cartOffers);
  const {
    orders,
    products,
    reviews,
    updateReviewStatus,
    addToast,
    loadProducts,
    loadReviews,
    loadOrders
  } = useAdminStore();
  const [timeRange, setTimeRange] = useState('30d');
  const [startDate, setStartDate] = useState(() => toDateInput(addDays(new Date(), -29)));
  const [endDate, setEndDate] = useState(() => toDateInput(new Date()));
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

  const formatDateLabel = (dStr) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return dStr;
    }
  };

  const applyPreset = (days) => {
    setStartDate(toDateInput(addDays(new Date(), -(days - 1))));
    setEndDate(toDateInput(new Date()));
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await Promise.all([loadOrders(), loadProducts(), loadReviews()]);
    setRefreshing(false);
    addToast({ type: 'success', title: 'Data Synced', message: 'Fetched the latest orders, products and reviews.' });
  };

  // Selected period, and the period of the same length just before it (for the % change)
  const today = startOfDay(new Date());
  let rangeStart;
  let rangeEnd = today;
  if (timeRange === 'today') rangeStart = today;
  else if (timeRange === '7d') rangeStart = addDays(today, -6);
  else if (timeRange === 'custom' && startDate && endDate) {
    rangeStart = startOfDay(new Date(startDate));
    rangeEnd = startOfDay(new Date(endDate));
    if (rangeEnd < rangeStart) [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  } else rangeStart = addDays(today, -29);
  const dayCount = Math.round((rangeEnd - rangeStart) / DAY_MS) + 1;
  const prevStart = addDays(rangeStart, -dayCount);

  const ordersBetween = (from, toInclusive) => {
    const end = addDays(toInclusive, 1);
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= from && d < end;
    });
  };
  const periodOrders = ordersBetween(rangeStart, rangeEnd);
  const prevOrders = ordersBetween(prevStart, addDays(rangeStart, -1));

  const isCounted = (o) => !['Cancelled', 'RTO/Returned'].includes(o.status);
  const revenueOf = (list) => list.reduce((acc, o) => acc + (isCounted(o) ? o.pricing?.total || 0 : 0), 0);
  const totalRevenue = revenueOf(periodOrders);
  const prevRevenue = revenueOf(prevOrders);
  const totalOrdersCount = periodOrders.length;
  const countedOrders = periodOrders.filter(isCounted).length;
  const aov = countedOrders ? Math.round(totalRevenue / countedOrders) : 0;
  const prevCounted = prevOrders.filter(isCounted).length;
  const prevAov = prevCounted ? Math.round(prevRevenue / prevCounted) : 0;

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  // Orders still to be shipped (all dates)
  const toShip = orders.filter((o) => ['Pending', 'Confirmed', 'Packed'].includes(o.status));
  const pendingReviews = reviews.filter((r) => r.status === 'Pending');
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const kpis = [
    {
      title: 'Gross Revenue',
      value: totalRevenue,
      prefix: '₹',
      ...percentChange(totalRevenue, prevRevenue),
      icon: IndianRupee,
      subtext: `vs. ₹${prevRevenue.toLocaleString('en-IN')} last period`
    },
    {
      title: 'Total Orders',
      value: totalOrdersCount,
      ...percentChange(totalOrdersCount, prevOrders.length),
      icon: ShoppingBag,
      subtext: `${prevOrders.length} orders last period`
    },
    {
      title: 'Avg Order Value (AOV)',
      value: aov,
      prefix: '₹',
      ...percentChange(aov, prevAov),
      icon: TrendingUp,
      subtext: `vs. ₹${prevAov.toLocaleString('en-IN')} last period`
    },
    {
      title: 'Pending Fulfillment',
      value: toShip.length,
      change: pendingOrders.length ? `${pendingOrders.length} to confirm` : 'All confirmed',
      trend: pendingOrders.length ? 'down' : 'up',
      icon: Clock,
      subtext: 'Orders not shipped yet'
    }
  ];

  // Revenue per day for the chart (current and previous period)
  const dailyRevenue = (from) =>
    Array.from({ length: dayCount }, (_, i) => {
      const day = addDays(from, i);
      return { date: day, rev: revenueOf(ordersBetween(day, day)) };
    });
  const revenuePoints = dailyRevenue(rangeStart);
  const prevPoints = dailyRevenue(prevStart);
  const maxRev = Math.max(1, ...revenuePoints.map((p) => p.rev), ...prevPoints.map((p) => p.rev));
  const pointX = (i) => (dayCount === 1 ? 300 : (i / (dayCount - 1)) * 600);
  const pointY = (rev) => 190 - (rev / maxRev) * 170;
  // Smooth curve through the daily points (control points halfway between days, so it never overshoots)
  const linePath = (points) => {
    if (dayCount === 1) return `M0,${pointY(points[0].rev)} L600,${pointY(points[0].rev)}`;
    return points
      .map((p, i) => {
        const x = pointX(i);
        const y = pointY(p.rev);
        if (!i) return `M${x},${y}`;
        const prevX = pointX(i - 1);
        const midX = prevX + (x - prevX) / 2;
        return `C${midX},${pointY(points[i - 1].rev)} ${midX},${y} ${x},${y}`;
      })
      .join(' ');
  };
  const currentLine = linePath(revenuePoints);
  const peakIndex = revenuePoints.reduce((best, p, i) => (p.rev > revenuePoints[best].rev ? i : best), 0);
  // The hovered day, or the best day when the mouse is not on the chart
  const focusIndex = hoverIndex ?? peakIndex;
  const focus = revenuePoints[focusIndex];
  const handleChartHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHoverIndex(dayCount === 1 ? 0 : Math.round(ratio * (dayCount - 1)));
  };
  const labelStep = Math.max(1, Math.ceil(dayCount / 7));
  const axisLabels = revenuePoints.filter((_, i) => i % labelStep === 0 || i === dayCount - 1);

  // Money collected / still to collect, and cancelled + returned share, for the selected period
  const collected = periodOrders
    .filter((o) => isCounted(o) && o.payment?.status === 'Paid')
    .reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
  const toCollect = periodOrders
    .filter((o) => isCounted(o) && o.payment?.status !== 'Paid')
    .reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
  const lostCount = periodOrders.filter((o) => !isCounted(o)).length;
  const share = (n) => (totalOrdersCount ? `${Math.round((n / totalOrdersCount) * 100)}%` : '0%');

  // Best sellers in the selected period (free gifts and cancelled / returned orders not counted)
  const topProducts = Object.values(
    periodOrders.filter(isCounted).reduce((acc, o) => {
      (o.items || [])
        .filter((it) => !it.isFreeGift)
        .forEach((it) => {
          const key = it.productId || it.title;
          const row = acc[key] || { key, title: it.title, image: it.image, qty: 0, revenue: 0 };
          row.qty += it.quantity || 0;
          row.revenue += (it.price || 0) * (it.quantity || 0);
          acc[key] = row;
        });
      return acc;
    }, {})
  )
    .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
    .slice(0, 5);

  // Orders by status for the selected period
  const statusBreakdown = Object.entries(
    periodOrders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1]);

  // First cart reward set in Admin > Cart Rewards
  const nextMilestone = activeRewards(cartOffers)[0];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Breadcrumb & Page Header */}
      <div className="pb-2">
        <div className="text-xs text-muted font-medium mb-1.5 flex items-center gap-1.5">
          <span>KAPEE Enterprise</span>
          <span className="text-subtle">/</span>
          <span className="text-text-2 font-semibold">Operations Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary-deep dark:text-[#EAF3F1]">
                Operations Overview
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Pulse
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Real-time performance metrics, orders pipeline and reviews for KAPEE Enterprise.
            </p>
          </div>

          {/* Date Filter & Actions */}
          <div className="relative flex items-center gap-2">
            <div className="bg-surface border border-border p-1 rounded-xl flex items-center shadow-xs">
              {['Today', '7d', '30d'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setTimeRange(tab.toLowerCase());
                    setCustomDateOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    timeRange === tab.toLowerCase()
                      ? 'bg-gradient-to-r from-[#032E2A] to-[#0A5C55] text-white shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  {tab}
                </button>
              ))}

              {/* Custom Date Range Trigger */}
              <button
                type="button"
                id="custom-date-trigger"
                onClick={() => {
                  setTimeRange('custom');
                  setCustomDateOpen(!customDateOpen);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  timeRange === 'custom'
                    ? 'bg-gradient-to-r from-[#032E2A] to-[#0A5C55] text-white shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {timeRange === 'custom' && startDate && endDate
                    ? `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
                    : 'Custom'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${customDateOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Custom Date Picker Popover Modal */}
            {customDateOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCustomDateOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 p-5 rounded-2xl bg-surface border border-border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-primary">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text">Select Date Range</h4>
                        <p className="text-[10px] text-muted">Filter analytics by custom dates</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomDateOpen(false)}
                      className="p-1 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-text-2">Quick Presets</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Last 7 Days', days: 7 },
                        { label: 'Last 14 Days', days: 14 },
                        { label: 'Last 30 Days', days: 30 },
                        { label: 'Last 60 Days', days: 60 }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset.days)}
                          className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-medium text-text-2 hover:bg-surface-tint hover:border-primary/40 hover:text-primary transition-all text-left"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Input Pickers */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-text-2">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-kui w-full text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-text-2">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-kui w-full text-xs py-1.5 px-2.5"
                      />
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-[11px] text-muted">
                      {formatDateLabel(startDate)} → {formatDateLabel(endDate)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomDateOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-text-2 hover:bg-surface-2 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTimeRange('custom');
                          setCustomDateOpen(false);
                          triggerKapeeCelebration();
                          addToast({
                            type: 'success',
                            title: 'Date Range Applied',
                            message: `Metrics filtered for ${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}.`
                          });
                        }}
                        className="btn-primary text-xs !py-1.5 !px-3 font-semibold shadow-xs"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={refreshDashboard}
              disabled={refreshing}
              className="p-2.5 bg-surface border border-border rounded-xl text-text-2 hover:bg-surface-2 transition-colors disabled:opacity-60"
              title="Refresh dashboard metrics"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isHero = idx === 0; // Hero KPI Card (first card)

          // 40px rounded icon chip tint rotating
          const chipTints = [
            'bg-white/15 text-[#EBCB6B]', // Hero card
            'bg-[#EAF4F2] dark:bg-[#0F332D] text-[#0A5C55] dark:text-[#1FA394]', // emerald-50
            'bg-[#FDF8E8] dark:bg-[#112A26] text-[#8F6414] dark:text-[#EBCB6B]', // gold-50
            'bg-[#E4ECFD] dark:bg-[rgba(37,99,235,0.2)] text-[#2563EB] dark:text-[#60A5FA]' // blue-50
          ];

          if (isHero) {
            return (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="rounded-2xl p-5 shadow-sm hover:shadow-md relative overflow-hidden text-white flex flex-col justify-between border border-white/10"
                style={{ background: 'linear-gradient(160deg, #032E2A 0%, #04403B 45%, #0A5C55 100%)' }}
              >
                {/* Faint gold leaf and sparkle decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBCB6B]/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-4 -right-4 text-[#EBCB6B]/10 pointer-events-none">
                  <Leaf className="w-24 h-24 rotate-45" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#EBCB6B]">
                    {kpi.title}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md text-[#EBCB6B] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div className="my-3 relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    <CountUp value={kpi.value} prefix={kpi.prefix} />
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 relative z-10">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#EBCB6B] bg-white/10 px-2 py-0.5 rounded-full">
                    {kpi.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {kpi.change}
                  </span>
                  <span className="text-white/70 text-[11px] truncate max-w-[130px]">
                    {kpi.subtext}
                  </span>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={idx}
              variants={staggerItem}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="card-kui p-5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">
                  {kpi.title}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${chipTints[idx % chipTints.length]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="my-3">
                <h3 className="text-2xl font-serif font-bold text-text">
                  <CountUp value={kpi.value} prefix={kpi.prefix} />
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                  kpi.trend === 'up'
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                    : 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60'
                }`}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
                <span className="text-subtle text-[11px] truncate max-w-[130px]">
                  {kpi.subtext}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Area Chart */}
        <div className="lg:col-span-2 card-kui p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-text">
                Revenue & Velocity
              </h3>
              <p className="text-xs text-muted">
                Daily order value in INR (cancelled and returned orders not counted)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
                <span className="w-3 h-1 bg-[#0A5C55] rounded-full" />
                Current Period
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="w-3 h-0.5 border-t border-dashed border-[#C8962E]" />
                Previous Period
              </span>
            </div>
          </div>

          {/* SVG Animated Area Graph with Recharts Palette */}
          <div className="pt-2">
            <div className="h-60 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueEmeraldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A5C55" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0A5C55" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Dashed Grid Lines using var(--border) */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="var(--border)" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border)" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="var(--border)" strokeDasharray="4 4" />
                <line x1="0" y1="190" x2="600" y2="190" stroke="var(--border)" />

                {/* Previous Period: Gold dashed line */}
                <path
                  d={linePath(prevPoints)}
                  fill="none"
                  stroke="#C8962E"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Current Period: Emerald Area Fill (25% to 0% opacity) */}
                <path d={`${currentLine} L600,190 L0,190 Z`} fill="url(#revenueEmeraldArea)" />

                {/* Current Period: Emerald Solid Line */}
                <path
                  d={currentLine}
                  fill="none"
                  stroke="#0A5C55"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Crosshair on the hovered (or best) day */}
                <line
                  x1={pointX(focusIndex)}
                  y1="20"
                  x2={pointX(focusIndex)}
                  y2="190"
                  stroke="#C8962E"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Point marker (outside the SVG so it stays round when the chart stretches) */}
              <div
                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-[1.5px] border-[#C8962E] flex items-center justify-center pointer-events-none"
                style={{ left: `${(pointX(focusIndex) / 600) * 100}%`, top: `${(pointY(focus.rev) / 200) * 100}%` }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#0A5C55] border-2 border-white" />
              </div>

              {/* Value Pill: the hovered day, otherwise the best day */}
              <div className="absolute top-2 right-2 bg-surface shadow-md border border-border px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-text pointer-events-none space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0A5C55]" />
                  <span>
                    {shortDate(focus.date)}: ₹{focus.rev.toLocaleString('en-IN')}
                  </span>
                </div>
                {hoverIndex !== null && (
                  <div className="flex items-center gap-1.5 text-muted font-semibold">
                    <span className="w-2 h-0.5 border-t border-dashed border-[#C8962E]" />
                    <span>
                      {shortDate(prevPoints[focusIndex].date)}: ₹{prevPoints[focusIndex].rev.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover area */}
              <div
                className="absolute inset-0 cursor-crosshair"
                onMouseMove={handleChartHover}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[11px] text-muted px-2 pt-2">
              {axisLabels.map((p) => (
                <span key={p.date.toISOString()}>
                  {shortDate(p.date)}
                  {p.date.getTime() === today.getTime() ? ' (Today)' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Chart Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
            <div>
              <p className="text-xs text-stone-400">Cash Collected</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">₹{collected.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">To Collect (COD)</p>
              <p className="text-base font-bold text-ink dark:text-stone-100">₹{toCollect.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Cancelled / Returned</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400">{share(lostCount)}</p>
            </div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-ink dark:text-stone-100">
              Orders by Status
            </h3>
            <p className="text-xs text-muted dark:text-stone-400 mt-0.5">
              Where this period's orders stand right now
            </p>
          </div>

          <div className="space-y-4 flex-1">
            {statusBreakdown.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">No orders in this period.</p>
            ) : (
              statusBreakdown.map(([status, count], idx) => {
                const pct = Math.round((count / totalOrdersCount) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-700 dark:text-stone-300">{status}</span>
                      <span className="text-stone-500 dark:text-stone-400">
                        {count} • {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_BAR_COLORS[idx % STATUS_BAR_COLORS.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {nextMilestone && (
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-deep text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-deep dark:text-emerald-300">
                    Cart Reward Active
                  </p>
                  <p className="text-[11px] text-muted dark:text-stone-400">
                    {nextMilestone.shortLabel} unlocks on ₹{nextMilestone.threshold}+
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/cart-rewards')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                Configure
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tables & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-stone-100">
                Recent Orders
              </h3>
              <p className="text-xs text-muted dark:text-stone-400">
                Latest customer purchases waiting for fulfillment
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-semibold text-emerald-deep dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {recentOrders.length === 0 && (
              <p className="text-xs text-muted text-center py-8">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="py-3 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-stone-800/40 px-2 rounded-xl transition-colors cursor-pointer"
                onClick={() => navigate('/admin/orders')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-bold text-xs text-stone-600 dark:text-stone-300">
                    {order.customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {order.customer.name}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {order.orderNumber}
                      {order.items?.[0]?.variant ? ` • ${order.items[0].variant}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      ₹{order.pricing.total}
                    </p>
                    <p className="text-[10px] text-stone-400">{order.payment.method.split('/')[0]}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products & Review Approvals */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100">Top Products</h4>
              </div>
              <span className="text-[10px] text-stone-400">By units sold</span>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-[11px] text-muted text-center py-3">No products sold in this period.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={p.key} className="flex items-center gap-2.5 text-xs">
                    <span className="w-5 text-center font-bold text-stone-400">{i + 1}</span>
                    {p.image ? (
                      <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0" />
                    )}
                    <p className="flex-1 min-w-0 font-semibold text-stone-800 dark:text-stone-200 truncate">{p.title}</p>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-ink dark:text-stone-100">{p.qty} sold</p>
                      <p className="text-[10px] text-stone-400">₹{p.revenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Reviews Moderation Widget */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gold" />
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100">
                  Reviews Awaiting Approval
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                {pendingReviews.length} New
              </span>
            </div>

            <div className="space-y-2.5">
              {pendingReviews.length === 0 && (
                <p className="text-[11px] text-muted text-center py-3">No reviews waiting for approval.</p>
              )}
              {pendingReviews.slice(0, 2).map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {rev.name} ({rev.rating}★)
                    </span>
                    <span className="text-[10px] text-stone-400">{rev.city}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 italic line-clamp-2">
                    "{rev.comment}"
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        updateReviewStatus(rev.id, 'Approved');
                        triggerKapeeCelebration();
                        addToast({
                          type: 'success',
                          title: 'Review Approved',
                          message: `Published review by ${rev.name} to storefront.`
                        });
                      }}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updateReviewStatus(rev.id, 'Rejected');
                        addToast({
                          type: 'error',
                          title: 'Review Rejected',
                          message: 'Review removed from queue.'
                        });
                      }}
                      className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 text-[10px] font-medium transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

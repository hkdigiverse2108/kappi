import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, IndianRupee, Truck, Percent, Calendar } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { downloadCSV, csvDate } from '../lib/csv';

export const ReportsPage = () => {
  const { addToast, orders } = useAdminStore();
  const [reportType, setReportType] = useState('sales');

  // Sales ledger: one row per order with its full price breakdown
  const handleDownloadReport = () => {
    if (!orders.length) {
      addToast({ type: 'info', title: 'Nothing to Export', message: 'There are no orders yet.' });
      return;
    }
    downloadCSV(
      'kapee-sales-ledger',
      [
        { header: 'Order Number', value: (o) => o.orderNumber },
        { header: 'Order Date', value: (o) => csvDate(o.createdAt) },
        { header: 'Status', value: (o) => o.status },
        { header: 'Customer', value: (o) => o.customer?.name },
        { header: 'City', value: (o) => o.shippingAddress?.city },
        { header: 'State', value: (o) => o.shippingAddress?.state },
        { header: 'Payment Method', value: (o) => o.payment?.method },
        { header: 'Subtotal', value: (o) => o.pricing?.subtotal },
        { header: 'Coupon Discount', value: (o) => o.pricing?.couponDiscount },
        { header: 'Tier Discount', value: (o) => o.pricing?.tierDiscount },
        { header: 'Shipping Fee', value: (o) => o.pricing?.shippingFee },
        { header: 'Tax', value: (o) => o.pricing?.tax },
        { header: 'Total', value: (o) => o.pricing?.total }
      ],
      orders
    );
    addToast({ type: 'success', title: 'Report Downloaded', message: `Exported ${orders.length} order(s) to CSV.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Analytics & Executive Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Sales trends, COD courier remittance, RTO rates, and GST tax liability summaries.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep text-white hover:bg-emerald-800 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download Sales Ledger (CSV)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Gross Merchandise Value (GMV)', val: '₹4,24,450', sub: '+18.2% vs last month', icon: IndianRupee },
          { title: 'Total GST Collected (18%)', val: '₹64,746', sub: 'Input credit pending: ₹12,400', icon: Percent },
          { title: 'Average Fulfillment Time', val: '1.8 Days', sub: '96.2% on-time delivery', icon: Truck },
          { title: 'Courier RTO Return Rate', val: '2.4%', sub: 'Target threshold: <5%', icon: TrendingUp }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white dark:bg-stone-900 rounded-2xl p-5 border shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>{item.title}</span>
                <Icon className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-ink dark:text-stone-100">{item.val}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Courier Performance & RTO Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100">
            Courier Partner SLA & Delivery Speeds
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { partner: 'Shiprocket Multi-Courier', orders: 184, avgDays: 2.1, rto: '1.9%', status: 'Best SLA' },
              { partner: 'Delhivery Direct API', orders: 96, avgDays: 2.4, rto: '2.8%', status: 'Reliable' },
              { partner: 'Blue Dart Express', orders: 42, avgDays: 1.4, rto: '0.8%', status: 'Fastest' }
            ].map((c, i) => (
              <div key={i} className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl border flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-200">{c.partner}</p>
                  <p className="text-[11px] text-stone-400">{c.orders} dispatches • Avg {c.avgDays} days</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-deep dark:text-emerald-400">{c.status}</span>
                  <p className="text-[10px] text-stone-400">RTO: {c.rto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST Tax Breakdown */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100">
            GST Summary & HSN Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl border flex justify-between">
              <div>
                <p className="font-bold">HSN 39249090 (Melamine Sponge Foam)</p>
                <p className="text-[11px] text-stone-400">Taxable turnover: ₹3,12,000</p>
              </div>
              <span className="font-bold text-ink dark:text-stone-100">18% GST (₹56,160)</span>
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl border flex justify-between">
              <div>
                <p className="font-bold">HSN 63071010 (Microfiber Towels & Cloths)</p>
                <p className="text-[11px] text-stone-400">Taxable turnover: ₹47,700</p>
              </div>
              <span className="font-bold text-ink dark:text-stone-100">18% GST (₹8,586)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

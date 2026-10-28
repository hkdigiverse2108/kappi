import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { DataTable } from '../components/common/DataTable';
import { CustomSelect } from '../components/common/CustomSelect';
import { DateRangePicker } from '../components/common/DateRangePicker';
import { fetchCartTracking, deleteCartTracking, bulkDeleteCartTracking } from '../../api/cartTrackingApi';
import { confirmDelete } from '../../store/useConfirmStore';

const money = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

// 28 Oct 2026, 04:11:59 PM
const istDateTime = (iso) =>
  iso
    ? new Date(iso)
        .toLocaleString('en-GB', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
        .replace(/\b(am|pm)\b/, (m) => m.toUpperCase())
    : '';

const ACTION_LABELS = {
  add: { label: 'Added to cart', cls: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300' },
  update: { label: 'Changed quantity', cls: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300' },
  remove: { label: 'Removed', cls: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300' },
  clear: { label: 'Cart cleared (order placed)', cls: 'text-stone-600 bg-stone-100 dark:bg-stone-800 dark:text-stone-300' }
};

// Calendar day in IST as YYYY-MM-DD, so day filters match the times shown in the table
const istDay = (value) => new Date(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const shiftDay = (day, offset) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

const DATE_FILTERS = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' }
];

// { from, to } as YYYY-MM-DD (either can be empty = no limit) for the chosen filter
const dateRange = (filter, customFrom, customTo) => {
  const today = istDay(Date.now());
  if (filter === 'today') return { from: today, to: today };
  if (filter === 'yesterday') return { from: shiftDay(today, -1), to: shiftDay(today, -1) };
  if (filter === '7') return { from: shiftDay(today, -6), to: today };
  if (filter === '30') return { from: shiftDay(today, -29), to: today };
  if (filter === 'month') return { from: `${today.slice(0, 8)}01`, to: today };
  if (filter === 'custom') {
    // One date picked = that single day; two dates = a range (in either order)
    const from = customFrom || customTo;
    const to = customTo || customFrom;
    return from && to && from > to ? { from: to, to: from } : { from, to };
  }
  return { from: '', to: '' };
};

const customerName = (row) => row.customerName || 'Anonymous';


export const CartTrackingPage = () => {
  const { addToast } = useAdminStore();
  const [data, setData] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // The backend keeps 90 days; the date filter below narrows what is shown
  const load = useCallback(async () => {
    try {
      setData(await fetchCartTracking(90));
    } catch (err) {
      addToast({ type: 'error', title: 'Could Not Load Cart Tracking', message: err.message });
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    try {
      await deleteCartTracking(id);
      setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
    } catch (err) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const handleBulkDelete = async (ids, clear) => {
    try {
      await bulkDeleteCartTracking(ids);
      setData((d) => ({ ...d, events: d.events.filter((e) => !ids.includes(e.id)) }));
      clear();
      addToast({ type: 'info', title: 'Entries Deleted', message: `Deleted ${ids.length} cart tracking entries.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const events = useMemo(() => {
    const { from, to } = dateRange(dateFilter, customFrom, customTo);
    return (data?.events || []).filter((e) => {
      const day = istDay(e.createdAt);
      return (!from || day >= from) && (!to || day <= to);
    });
  }, [data, dateFilter, customFrom, customTo]);

  // Most added products within the chosen dates
  const topProducts = useMemo(() => {
    const products = {};
    events
      .filter((e) => e.action === 'add' && e.line)
      .forEach((e) => {
        const row = (products[e.line.productId || e.line.title] ||= {
          title: e.line.title,
          image: e.line.image,
          adds: 0,
          quantity: 0
        });
        row.adds += 1;
        row.quantity += e.line.quantity;
      });
    return Object.values(products)
      .sort((a, b) => b.adds - a.adds)
      .slice(0, 5);
  }, [events]);

  const eventColumns = [
    {
      header: 'Date & Time (IST)',
      accessor: 'createdAt',
      cell: (row) => <span className="text-xs text-stone-500 dark:text-stone-400">{istDateTime(row.createdAt)}</span>
    },
    {
      header: 'Customer Name',
      accessor: 'customerName',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-600 dark:text-stone-300">
          {customerName(row)}
        </span>
      )
    },
    {
      header: 'Activity',
      accessor: 'action',
      cell: (row) => {
        const a = ACTION_LABELS[row.action] || { label: row.action, cls: '' };
        return <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${a.cls}`}>{a.label}</span>;
      }
    },
    {
      header: 'Product',
      cell: (row) =>
        row.line ? (
          <div className="flex items-center gap-2.5">
            {row.line.image && <img src={row.line.image} alt="" className="w-8 h-8 rounded-lg object-cover border shrink-0" />}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink dark:text-stone-100 truncate max-w-[220px]">{row.line.title}</p>
              <p className="text-[11px] text-stone-400">
                {row.line.variantName} · {row.line.quantity} × {money(row.line.price)}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-stone-400">Whole cart</span>
        )
    },
    {
      header: 'Cart after',
      accessor: 'cartValue',
      cell: (row) => (
        <span className="text-xs text-stone-600 dark:text-stone-300">
          {row.cartCount} item(s) · {money(row.cartValue)}
        </span>
      )
    },
    {
      header: 'Actions',
      disableRowClick: true,
      cell: (row) => (
        <button
          type="button"
          onClick={() =>
            confirmDelete({
              title: 'Delete Cart Activity?',
              message: 'Delete this entry from the cart activity log?',
              onConfirm: () => handleDelete(row.id)
            })
          }
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  const eventExport = [
    { header: 'Date & Time (IST)', value: (e) => istDateTime(e.createdAt) },
    { header: 'Customer Name', value: customerName },
    { header: 'Email', value: (e) => e.customerEmail },
    { header: 'Phone', value: (e) => e.customerPhone },
    { header: 'Activity', value: (e) => ACTION_LABELS[e.action]?.label || e.action },
    { header: 'Product', value: (e) => e.line?.title },
    { header: 'Variant', value: (e) => e.line?.variantName },
    { header: 'Qty', value: (e) => e.line?.quantity },
    { header: 'Price', value: (e) => e.line?.price },
    { header: 'Cart Value After', value: (e) => e.cartValue }
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">Cart Tracking</h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            See who adds products to the cart and what they do with it.
          </p>
        </div>
      </div>


      {topProducts.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border p-5">
          <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100 mb-3">Most added to cart</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topProducts.map((p) => (
              <div key={p.title} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border">
                {p.image ? (
                  <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-stone-700 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink dark:text-stone-100 truncate">{p.title}</p>
                  <p className="text-[11px] text-stone-400">{p.adds} time(s) · {p.quantity} pcs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable
        columns={eventColumns}
        data={events}
        extraHeaderActions={
          <>
            <div className="w-40 shrink-0">
              <CustomSelect
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={DATE_FILTERS}
                size="toolbar"
                className="font-semibold text-stone-700 dark:text-stone-200"
              />
            </div>
            {dateFilter === 'custom' && (
              <DateRangePicker
                size="toolbar"
                defaultOpen
                from={customFrom}
                to={customTo}
                onChange={(from, to) => {
                  setCustomFrom(from);
                  setCustomTo(to);
                }}
              />
            )}
          </>
        }
        bulkActions={(selectedIds, clear) => (
          <button
            type="button"
            onClick={() =>
              confirmDelete({
                title: 'Delete Selected Entries?',
                message: `Delete ${selectedIds.length} selected cart tracking entries? This cannot be undone.`,
                onConfirm: () => handleBulkDelete(selectedIds, clear)
              })
            }
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
          >
            Delete Selected
          </button>
        )}
        exportColumns={eventExport}
        exportFileName="kapee-cart-activity"
        searchPlaceholder="Search by customer or product..."
      />
    </div>
  );
};

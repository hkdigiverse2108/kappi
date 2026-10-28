import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareText,
  ShoppingBag,
  Plus,
  Minus,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  Trash2,
  Edit,
  RotateCcw,
  Send,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { istDateTime } from '../../utils/istTime';
import { useCartStore } from '../../store/useCartStore';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideDrawer } from '../components/common/SideDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { CustomSelect } from '../components/common/CustomSelect';
import { DateRangePicker } from '../components/common/DateRangePicker';
import { confirmDelete } from '../../store/useConfirmStore';
import { csvDate } from '../lib/csv';

// Small icon in the orders table that shows its details on hover.
// The tooltip is drawn on <body> so the table's overflow can't cut it off.
const HoverTip = ({ icon: Icon, title, text }) => {
  const [pos, setPos] = useState(null);
  const show = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, top: r.top, bottom: r.bottom });
  };
  // Above the icon, or below it when it is near the top of the screen
  const below = pos && pos.top < 140;
  return (
    <span className="inline-flex align-middle ml-1.5" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      <Icon className="w-3.5 h-3.5 text-[#C8962E] cursor-help" />
      {pos &&
        createPortal(
          <span
            className="pointer-events-none fixed z-[100] w-60 p-2.5 rounded-xl bg-stone-900 text-white text-[11px] leading-snug shadow-xl"
            style={{
              left: Math.min(Math.max(pos.x, 128), window.innerWidth - 128),
              top: below ? pos.bottom + 8 : pos.top - 8,
              transform: `translate(-50%, ${below ? '0' : '-100%'})`
            }}
          >
            <span className="block font-bold text-[#EBCB6B] mb-0.5">{title}</span>
            <span className="block whitespace-pre-line break-words">{text}</span>
          </span>,
          document.body
        )}
    </span>
  );
};

// e.g. "26 Oct 2026, 3:22 PM" (IST)
const formatOrderTime = istDateTime;

export const OrdersPage = () => {
  const { orders, addOrder, updateOrderStatus, updateOrder, deleteOrder, addToast, products } = useAdminStore();
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');

  // Selected order for Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Manual Order Drawer State
  const [manualOrderOpen, setManualOrderOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'Cash on Delivery (COD)',
    items: []
  });
  const [isBooking, setIsBooking] = useState(false);

  // Editable shipping / status fields of the open order
  const [orderEdit, setOrderEdit] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const openOrder = (order) => {
    setSelectedOrder(order);
    // Opening an order marks its notification as read
    useAdminStore.getState().markOrderRead(order.id);
    setOrderEdit({
      status: order.status,
      paymentStatus: order.payment?.status || 'Pending',
      courier: order.fulfillment?.courier || '',
      awb: order.fulfillment?.awb || '',
      notes: order.notes || ''
    });
  };

  // ?order=<id> (from a notification) opens that order
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const id = searchParams.get('order');
    if (!id) return;
    const order = orders.find((o) => o.id === id);
    if (order) {
      openOrder(order);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, orders]);

  // Multiple Product Selector State for Manual Orders
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantName, setSelectedVariantName] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  // Store Details & GST Invoice Modal
  const [invoiceSettingsOpen, setInvoiceSettingsOpen] = useState(false);
  const [invoicePreviewOrder, setInvoicePreviewOrder] = useState(null);

  // Delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    ...['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'RTO/Returned'].map((st) => ({
      value: st,
      label: `${st} (${orders.filter((o) => o.status === st).length})`
    }))
  ];

  // Date filter: preset ranges, or 'custom' with From / To dates
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Start (inclusive) and end (exclusive) of the chosen date range, in local time
  const dateRange = useMemo(() => {
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    const today = startOfDay(new Date());
    switch (dateFilter) {
      case 'today': return [today, addDays(today, 1)];
      case 'yesterday': return [addDays(today, -1), today];
      case '7d': return [addDays(today, -6), addDays(today, 1)];
      case '30d': return [addDays(today, -29), addDays(today, 1)];
      case 'month': return [new Date(today.getFullYear(), today.getMonth(), 1), addDays(today, 1)];
      case 'custom': {
        const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
        const to = dateTo ? addDays(new Date(`${dateTo}T00:00:00`), 1) : null;
        return [from, to];
      }
      default: return [null, null];
    }
  }, [dateFilter, dateFrom, dateTo]);

  const filteredOrders = useMemo(() => {
    const [from, to] = dateRange;
    return orders.filter((o) => {
      if (activeStatusFilter !== 'All' && o.status !== activeStatusFilter) return false;
      const placed = new Date(o.createdAt);
      if (from && placed < from) return false;
      if (to && placed >= to) return false;
      return true;
    });
  }, [orders, activeStatusFilter, dateRange]);

  const hasFilters = activeStatusFilter !== 'All' || dateFilter !== 'all';
  const clearFilters = () => {
    setActiveStatusFilter('All');
    setDateFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  // Selected Product & Variants helpers
  const currentSelectedProduct = (products || []).find((p) => p.id === selectedProductId) || products?.[0];
  const currentProductVariants = currentSelectedProduct?.variants?.length
    ? currentSelectedProduct.variants
    : [{ id: 'standard', name: 'Standard', price: Number(currentSelectedProduct?.basePrice) || 0 }];
  const currentVariantObj = currentProductVariants.find((v) => v.name === selectedVariantName) || currentProductVariants[0];

  // Calculated Financials for Manual Order
  const manualSubtotal = (manualForm.items || []).reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );
  // Same rules as the backend: shipping from Admin > Cart Rewards, prices include 18% GST
  const cartOffers = useCartStore((s) => s.cartOffers);
  const manualShippingFee =
    manualSubtotal === 0 || !cartOffers || (cartOffers.freeShipping.enabled && manualSubtotal >= cartOffers.freeShipping.threshold)
      ? 0
      : cartOffers.shippingFee;
  const manualTotal = manualSubtotal + manualShippingFee;
  const manualTax = Math.round((manualTotal * 18) / 118);

  // Open Manual Order and seed with default product line item
  const handleOpenManualOrder = () => {
    const firstProd = products?.[0];
    const firstVariant = firstProd?.variants?.[0] || { name: 'Standard', price: Number(firstProd?.basePrice) || 0 };

    setManualForm({
      customerName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      paymentMethod: 'Cash on Delivery (COD)',
      items: firstProd ? [
        {
          id: `item-${Date.now()}`,
          productId: firstProd.id,
          title: firstProd.title,
          variant: firstVariant.name,
          price: Number(firstVariant.price) || 0,
          quantity: 1,
          image: firstProd.images?.[0] || ''
        }
      ] : []
    });

    if (firstProd) {
      setSelectedProductId(firstProd.id);
      setSelectedVariantName(firstVariant.name);
    }
    setSelectedQty(1);
    setManualOrderOpen(true);
  };

  // Add Item Line to Manual Order
  const handleAddItemToManualOrder = () => {
    const prod = currentSelectedProduct;
    if (!prod) return;
    const variant = currentVariantObj;
    if (!variant) return;

    // Check if item already exists
    const existingIdx = (manualForm.items || []).findIndex(
      (it) => (it.productId === prod.id || it.title === prod.title) && it.variant === variant.name
    );

    if (existingIdx !== -1) {
      const updated = [...manualForm.items];
      updated[existingIdx].quantity += selectedQty;
      setManualForm({ ...manualForm, items: updated });
      addToast({
        type: 'info',
        title: 'Quantity Updated',
        message: `Updated "${prod.title} (${variant.name})" quantity to ${updated[existingIdx].quantity}.`
      });
    } else {
      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        title: prod.title,
        variant: variant.name,
        price: Number(variant.price) || 0,
        quantity: selectedQty,
        image: prod.images?.[0] || ''
      };
      setManualForm({
        ...manualForm,
        items: [...(manualForm.items || []), newItem]
      });
      addToast({
        type: 'success',
        title: 'Product Added',
        message: `Added ${prod.title} (${variant.name}) × ${selectedQty} to order.`
      });
    }
    setSelectedQty(1);
  };

  // Update item quantity
  const handleUpdateItemQty = (index, delta) => {
    const updated = [...(manualForm.items || [])];
    const newQty = (updated[index].quantity || 1) + delta;
    if (newQty <= 0) {
      handleRemoveItemFromManualOrder(index);
    } else {
      updated[index] = { ...updated[index], quantity: newQty };
      setManualForm({ ...manualForm, items: updated });
    }
  };

  // Remove item
  const handleRemoveItemFromManualOrder = (index) =>
    confirmDelete({
      title: 'Remove Item?',
      message: 'Remove this item from the order?',
      onConfirm: () => {
        const removedName = manualForm.items?.[index]?.title || 'Item';
        const updated = (manualForm.items || []).filter((_, i) => i !== index);
        setManualForm({ ...manualForm, items: updated });
        addToast({ type: 'info', title: 'Product Removed', message: `Removed ${removedName} from order.` });
      }
    });

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();
    if (!manualForm.customerName.trim() || !manualForm.phone.trim()) {
      addToast({ type: 'error', title: 'Missing details', message: 'Please enter customer name and phone.' });
      return;
    }
    if (!manualForm.address.trim() || !manualForm.city.trim() || !manualForm.state.trim()) {
      addToast({ type: 'error', title: 'Missing address', message: 'Please enter the street address, city and state.' });
      return;
    }
    if (!/^\d{6}$/.test(manualForm.pincode.trim())) {
      addToast({ type: 'error', title: 'Invalid pincode', message: 'Please enter a 6-digit pincode.' });
      return;
    }

    if (!manualForm.items || manualForm.items.length === 0) {
      addToast({ type: 'error', title: 'No Products', message: 'Please add at least one product to the order.' });
      return;
    }

    setIsBooking(true);
    try {
      const saved = await addOrder({
        customer: {
          name: manualForm.customerName.trim(),
          phone: manualForm.phone.trim(),
          email: manualForm.email.trim() || null
        },
        shippingAddress: {
          line1: manualForm.address.trim(),
          city: manualForm.city.trim(),
          state: manualForm.state.trim(),
          pincode: manualForm.pincode.trim(),
          country: 'India'
        },
        items: manualForm.items.map(({ productId, title, variant, price, quantity, image }) => ({
          productId: productId || '',
          title,
          variant: variant || '',
          price: Number(price) || 0,
          quantity,
          image: image || ''
        })),
        paymentMethod: manualForm.paymentMethod
      });
      setManualOrderOpen(false);
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Order Created',
        message: `Order ${saved.orderNumber} created with ${manualForm.items.length} product(s) for ${saved.customer.name}.`
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Order Not Saved', message: err.message });
    } finally {
      setIsBooking(false);
    }
  };

  const handleAdvanceStatus = async (order) => {
    const flow = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
    const currentIdx = flow.indexOf(order.status);
    if (currentIdx !== -1 && currentIdx < flow.length - 1) {
      const nextStatus = flow[currentIdx + 1];
      const saved = await updateOrderStatus(order.id, nextStatus);
      if (!saved) return;
      if (selectedOrder?.id === order.id) openOrder(saved);
      if (nextStatus === 'Delivered') {
        triggerKapeeCelebration();
      }
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order ${order.orderNumber} advanced to "${nextStatus}".`
      });
    }
  };

  // Saves the status / payment / courier box in the order drawer
  const handleSaveOrderEdit = async () => {
    setIsSavingOrder(true);
    const saved = await updateOrder(selectedOrder.id, {
      status: orderEdit.status,
      paymentStatus: orderEdit.paymentStatus,
      courier: orderEdit.courier,
      awb: orderEdit.awb,
      notes: orderEdit.notes
    });
    setIsSavingOrder(false);
    if (!saved) return;
    openOrder(saved);
    addToast({ type: 'success', title: 'Order Updated', message: `Order ${saved.orderNumber} saved.` });
  };

  // Table Columns
  const columns = [
    {
      header: 'Order',
      className: 'whitespace-nowrap',
      accessor: 'orderNumber',
      cell: (row) => (
        <div>
          <span className="font-bold text-ink dark:text-stone-100 font-mono text-xs">
            {row.orderNumber}
          </span>
          <p className="text-[11px] text-stone-400">{formatOrderTime(row.createdAt)}</p>
        </div>
      )
    },
    {
      header: 'Customer',
      className: 'whitespace-nowrap',
      accessor: 'customer',
      cell: (row) => (
        <div>
          <p className="font-semibold text-stone-800 dark:text-stone-200">
            {row.customer.name}
          </p>
          <p className="text-[11px] text-stone-400">
            {row.shippingAddress.city}, {row.shippingAddress.pincode}
          </p>
        </div>
      )
    },
    {
      header: 'Items',
      className: 'whitespace-nowrap',
      cell: (row) => (
        <span className="text-xs text-stone-600 dark:text-stone-300">
          {row.items.length} item(s){row.items[0]?.variant ? ` • ${row.items[0].variant}` : ''}
          {row.customerNote && <HoverTip icon={MessageSquareText} title="Customer Note" text={row.customerNote} />}
        </span>
      )
    },
    {
      header: 'Total',
      className: 'whitespace-nowrap',
      accessor: 'pricing',
      cell: (row) => (
        <div>
          <span className="font-bold text-ink dark:text-stone-100">
            ₹{row.pricing.total.toLocaleString('en-IN')}
          </span>
          <p className="text-[10px] text-stone-400">{row.payment.method.split('/')[0]}</p>
        </div>
      )
    },
    {
      header: 'Status',
      className: 'whitespace-nowrap',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      className: 'whitespace-nowrap',
      disableRowClick: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openOrder(row)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            title="View order details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setOrderToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const orderExportColumns = [
    { header: 'Order Number', value: (o) => o.orderNumber },
    { header: 'Order Date', value: (o) => csvDate(o.createdAt) },
    { header: 'Status', value: (o) => o.status },
    { header: 'Source', value: (o) => o.source },
    { header: 'Customer Name', value: (o) => o.customer?.name },
    { header: 'Email', value: (o) => o.customer?.email },
    { header: 'Phone', value: (o) => o.customer?.phone },
    { header: 'Address', value: (o) => o.shippingAddress?.line },
    { header: 'City', value: (o) => o.shippingAddress?.city },
    { header: 'State', value: (o) => o.shippingAddress?.state },
    { header: 'Pincode', value: (o) => o.shippingAddress?.pincode },
    {
      header: 'Items',
      value: (o) => (o.items || []).map((it) => `${it.title}${it.variant ? ` (${it.variant})` : ''} x${it.quantity || 1}`)
    },
    { header: 'Item Count', value: (o) => (o.items || []).reduce((n, it) => n + (it.quantity || 1), 0) },
    { header: 'Subtotal', value: (o) => o.pricing?.subtotal },
    { header: 'Coupon Code', value: (o) => o.pricing?.couponCode },
    { header: 'Coupon Discount', value: (o) => o.pricing?.couponDiscount },
    { header: 'Tier Discount', value: (o) => o.pricing?.tierDiscount },
    { header: 'Shipping Fee', value: (o) => o.pricing?.shippingFee },
    { header: 'Tax', value: (o) => o.pricing?.tax },
    { header: 'Total', value: (o) => o.pricing?.total },
    { header: 'Payment Method', value: (o) => o.payment?.method },
    { header: 'Customer Note', value: (o) => o.customerNote }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Orders
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Dispatch pipeline, live shipments, COD collections, and customer order tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenManualOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        exportColumns={orderExportColumns}
        exportFileName="kapee-orders"
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search by order ID, customer, city, phone..."
        extraHeaderActions={
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
            {/* CustomSelect fills its parent, so each one sits in a fixed-width box (full width on phones) */}
            <div className="min-w-0 sm:w-44 sm:shrink-0">
              <CustomSelect
                value={activeStatusFilter}
                onChange={(e) => setActiveStatusFilter(e.target.value)}
                options={statusOptions}
              />
            </div>
            <div className="min-w-0 sm:w-40 sm:shrink-0">
              <CustomSelect
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={dateOptions}
              />
            </div>
            {dateFilter === 'custom' && (
              <div className="col-span-2 sm:col-span-1">
                <DateRangePicker
                  from={dateFrom}
                  to={dateTo}
                  onChange={(f, t) => {
                    setDateFrom(f);
                    setDateTo(t);
                  }}
                />
              </div>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        }
        onRowClick={(row) => openOrder(row)}
        bulkActions={(selectedIds, clear) => (
          <>
            <button
              onClick={() => {
                selectedIds.forEach((id) => updateOrderStatus(id, 'Shipped'));
                triggerKapeeCelebration();
                addToast({ type: 'success', title: 'Bulk Shipped', message: `Marked ${selectedIds.length} orders as Shipped.` });
                clear();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Bulk Ship
            </button>
            <button
              onClick={() =>
                confirmDelete({
                  title: 'Delete Selected Orders?',
                  message: `Delete ${selectedIds.length} selected orders? This cannot be undone.`,
                  onConfirm: () => {
                    selectedIds.forEach((id) => deleteOrder(id));
                    addToast({ type: 'info', title: 'Orders Deleted', message: `Removed ${selectedIds.length} orders.` });
                    clear();
                  }
                })
              }
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Delete Selected
            </button>
          </>
        )}
      />

      {/* Order Detail Drawer */}
      <SideDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ''}
        subtitle={selectedOrder ? `Placed on ${formatOrderTime(selectedOrder.createdAt)}` : ''}
        width="max-w-2xl"
        footer={
          selectedOrder && (
            <div className="w-full flex items-center justify-end">
              <div className="flex items-center gap-2">
                {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(selectedOrder)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-sm"
                  >
                    <span>Advance Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Animated Status Stepper */}
            <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Fulfillment Pipeline
                </span>
                <StatusBadge status={selectedOrder.status} />
              </div>

              {/* Stepper bubbles */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-1 gap-y-2 text-center pt-2">
                {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'].map((st, i) => {
                  const steps = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
                  const curIdx = steps.indexOf(selectedOrder.status);
                  const isDone = curIdx >= i;
                  return (
                    <div key={st} className="space-y-1">
                      <div className={`h-2 rounded-full transition-all ${isDone ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-stone-700'}`} />
                      <span className={`text-[10px] font-semibold block truncate ${isDone ? 'text-emerald-deep dark:text-emerald-400 font-bold' : 'text-stone-400'}`}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5">
                <span className="text-stone-400 font-bold uppercase text-[10px]">Customer Details</span>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">{selectedOrder.customer.name}</p>
                {selectedOrder.customer.email && <p className="text-stone-500">{selectedOrder.customer.email}</p>}
                <p className="text-stone-500">{selectedOrder.customer.phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5">
                <span className="text-stone-400 font-bold uppercase text-[10px]">Delivery Address</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">{selectedOrder.shippingAddress.line1}</p>
                <p className="text-stone-500">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                {selectedOrder.fulfillment?.courier && (
                  <p className="text-emerald-600 font-medium">
                    Partner: {selectedOrder.fulfillment.courier}
                    {selectedOrder.fulfillment.awb ? ` (${selectedOrder.fulfillment.awb})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Customer's note (from the website cart) */}
            {selectedOrder.customerNote && (
              <div className="p-4 rounded-2xl bg-[#FDF8E8] dark:bg-[#2A2410]/60 border border-[#C8962E]/40 space-y-2 text-xs">
                <span className="text-[#8F6414] dark:text-[#EBCB6B] font-bold uppercase text-[10px] tracking-wider">
                  Customer Instructions
                </span>
                <p className="flex items-start gap-1.5 text-stone-700 dark:text-stone-200 whitespace-pre-line">
                  <MessageSquareText className="w-4 h-4 text-[#C8962E] shrink-0 mt-0.5" />
                  <span>"{selectedOrder.customerNote}"</span>
                </p>
              </div>
            )}

            {/* Status, Payment & Courier */}
            {orderEdit && (
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-bold uppercase text-[10px]">Status, Payment & Courier</span>
                  <span className="text-[10px] text-stone-400">
                    {selectedOrder.source === 'Admin' ? 'Manual order' : 'Website order'} • Payment: {selectedOrder.payment?.method}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">Order Status</label>
                    <CustomSelect
                      value={orderEdit.status}
                      onChange={(e) => setOrderEdit({ ...orderEdit, status: e.target.value })}
                      options={['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'RTO/Returned'].map((st) => ({ value: st, label: st }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">Payment Status</label>
                    <CustomSelect
                      value={orderEdit.paymentStatus}
                      onChange={(e) => setOrderEdit({ ...orderEdit, paymentStatus: e.target.value })}
                      options={['Pending', 'Paid', 'Refunded'].map((st) => ({ value: st, label: st }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">Courier</label>
                    <input
                      type="text"
                      value={orderEdit.courier}
                      onChange={(e) => setOrderEdit({ ...orderEdit, courier: e.target.value })}
                      placeholder="e.g. Delhivery"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">AWB / Tracking No.</label>
                    <input
                      type="text"
                      value={orderEdit.awb}
                      onChange={(e) => setOrderEdit({ ...orderEdit, awb: e.target.value })}
                      placeholder="e.g. 1234567890"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">Admin Notes (not shown to the customer)</label>
                  <textarea
                    value={orderEdit.notes}
                    onChange={(e) => setOrderEdit({ ...orderEdit, notes: e.target.value })}
                    rows={2}
                    placeholder="Internal notes for the team"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveOrderEdit}
                    disabled={isSavingOrder}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-sm disabled:opacity-60"
                  >
                    {isSavingOrder ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Items Purchased */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Items in Order</h4>
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {it.image ? (
                        <img src={it.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-stone-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-stone-800 dark:text-stone-100">{it.title}</p>
                        <p className="text-[11px] text-stone-400">Qty: {it.quantity}{it.variant ? ` • ${it.variant}` : ''}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {it.isFreeGift ? 'FREE' : `₹${it.price * it.quantity}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 text-xs space-y-2">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>₹{selectedOrder.pricing.subtotal}</span>
              </div>
              {selectedOrder.pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon ({selectedOrder.pricing.couponCode})</span>
                  <span>-₹{selectedOrder.pricing.couponDiscount}</span>
                </div>
              )}
              {selectedOrder.pricing.tierDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Extra Cart Discount</span>
                  <span>-₹{selectedOrder.pricing.tierDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Shipping Fee</span>
                <span>{selectedOrder.pricing.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.pricing.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>GST included (18%)</span>
                <span>₹{selectedOrder.pricing.tax}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-bold text-sm text-ink dark:text-stone-100">
                <span>Total Amount</span>
                <span>₹{selectedOrder.pricing.total}</span>
              </div>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Manual Order Creation Drawer */}
      <SideDrawer
        isOpen={manualOrderOpen}
        onClose={() => setManualOrderOpen(false)}
        title="Create Manual Order"
        subtitle="Select multiple products, set pack tiers & quantities, and record customer details"
        width="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs">
              <span className="text-stone-400">Total: </span>
              <span className="font-bold text-sm text-emerald-deep dark:text-emerald-400">
                ₹{manualTotal}
              </span>
              <span className="text-[10px] text-stone-400 ml-1.5">
                ({manualForm.items?.length || 0} line items)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setManualOrderOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateManualOrder}
                disabled={isBooking}
                className="px-4 py-2 text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                {isBooking ? 'Booking...' : 'Confirm & Book Order'}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Customer Details */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 border-b pb-1">
              Customer & Shipping Details
            </h4>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Customer Full Name *</label>
              <input
                type="text"
                value={manualForm.customerName}
                onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Phone Number *</label>
                <input
                  type="text"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Email Address</label>
                <input
                  type="email"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  placeholder="customer@gmail.com"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Street Address *</label>
              <textarea
                value={manualForm.address}
                onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                rows={2}
                placeholder="Building name, flat number, street"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">City *</label>
                <input
                  type="text"
                  value={manualForm.city}
                  onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">State *</label>
                <input
                  type="text"
                  value={manualForm.state}
                  onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Pincode *</label>
                <input
                  type="text"
                  value={manualForm.pincode}
                  onChange={(e) => setManualForm({ ...manualForm, pincode: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section: Product Selection (Multiple Items) */}
          <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Select Products ({manualForm.items?.length || 0})</span>
                </h4>
                <p className="text-[11px] text-muted dark:text-stone-400">
                  Select and add multiple products and pack options to this manual order.
                </p>
              </div>
            </div>

            {/* Product & Variant Picker Card */}
            <div className="p-3.5 bg-stone-50/80 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300 text-[11px]">Choose Product</label>
                  <CustomSelect
                    value={selectedProductId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedProductId(newId);
                      const p = (products || []).find((prod) => prod.id === newId);
                      if (p?.variants?.length) {
                        setSelectedVariantName(p.variants[0].name);
                      }
                    }}
                    options={(products || []).map((p) => ({
                      value: p.id,
                      label: p.title,
                      badge: p.badge || null
                    }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300 text-[11px]">Pack / Variant Tier</label>
                  <CustomSelect
                    value={selectedVariantName}
                    onChange={(e) => setSelectedVariantName(e.target.value)}
                    options={currentProductVariants.map((v) => ({
                      value: v.name,
                      label: `${v.name} (₹${v.price})`,
                      badge: v.bestValue ? 'Bestseller' : null
                    }))}
                  />
                </div>
              </div>

              {/* Quantity Stepper & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">Quantity:</span>
                  <div className="flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      className="p-1.5 px-2.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-ink dark:text-stone-100 min-w-8 text-center">
                      {selectedQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedQty(selectedQty + 1)}
                      className="p-1.5 px-2.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-emerald-deep dark:text-emerald-400">
                    ₹{(Number(currentVariantObj?.price) || 0) * selectedQty}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToManualOrder}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product to Order</span>
                </button>
              </div>
            </div>

            {/* Added Items List */}
            <div className="space-y-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300 text-[11px]">
                Order Items ({manualForm.items?.length || 0})
              </span>

              {(!manualForm.items || manualForm.items.length === 0) ? (
                <div className="p-4 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-700 text-stone-400 text-xs">
                  No products added yet. Use the picker above to add items to this order.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {manualForm.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={it.image || undefined}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-ink dark:text-stone-100 truncate">
                            {it.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
                              {it.variant}
                            </span>
                            <span>• ₹{it.price} each</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(idx, -1)}
                            className="p-1 px-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 dark:hover:text-stone-100"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-[11px] font-bold text-ink dark:text-stone-100 min-w-6 text-center">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(idx, 1)}
                            className="p-1 px-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 dark:hover:text-stone-100"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-xs text-stone-800 dark:text-stone-100 min-w-14 text-right">
                          ₹{it.price * it.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromManualOrder(idx)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary Card */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal ({manualForm.items?.length || 0} line items)</span>
                <span>₹{manualSubtotal}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping Fee</span>
                <span className={manualShippingFee === 0 ? 'text-emerald-600 font-semibold' : ''}>
                  {manualShippingFee === 0 ? 'FREE' : `₹${manualShippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>GST included (18%)</span>
                <span>₹{manualTax}</span>
              </div>
              <div className="pt-1.5 border-t border-stone-200 dark:border-stone-700 flex justify-between font-bold text-sm text-ink dark:text-stone-100">
                <span>Grand Total</span>
                <span className="text-emerald-deep dark:text-emerald-400">₹{manualTotal}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-stone-200 dark:border-stone-700">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Payment Option</label>
            <CustomSelect
              value={manualForm.paymentMethod}
              onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
              options={[
                { value: 'Cash on Delivery (COD)', label: 'Cash on Delivery (COD)' },
                { value: 'UPI / QR Code Collected', label: 'UPI / QR Code Collected' }
              ]}
            />
          </div>
        </div>
      </SideDrawer>

      {/* GST Invoice Preview Modal */}
      {invoicePreviewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInvoicePreviewOrder(null);
          }}
        >
          <div className="bg-white text-stone-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="KAPEE" className="h-10 object-contain" />
                <div>
                  <h3 className="font-serif font-bold text-lg">KAPEE Enterprise Pvt Ltd</h3>
                  <p className="text-xs text-stone-500">GSTIN: 27AABCK1234F1Z8 • Bhiwandi, Maharashtra</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">TAX INVOICE</p>
                <p className="font-mono text-xs text-stone-500">INV-2026-{invoicePreviewOrder.orderNumber}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 text-xs">
              <div>
                <p className="font-bold text-stone-500 uppercase">Billed To:</p>
                <p className="font-bold">{invoicePreviewOrder.customer.name}</p>
                <p>{invoicePreviewOrder.shippingAddress.line1}</p>
                <p>{invoicePreviewOrder.shippingAddress.city}, {invoicePreviewOrder.shippingAddress.pincode}</p>
                <p>Phone: {invoicePreviewOrder.customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-stone-500 uppercase">Shipment Reference:</p>
                <p>Courier: {invoicePreviewOrder.fulfillment?.courier || 'Shiprocket'}</p>
                <p>AWB: {invoicePreviewOrder.fulfillment?.awb}</p>
                <p>Payment: {invoicePreviewOrder.payment.method}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left border border-stone-200">
              <thead className="bg-stone-50 border-b">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2">HSN</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoicePreviewOrder.items.map((it, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 font-semibold">{it.title}</td>
                    <td className="p-2 text-stone-400">39249090</td>
                    <td className="p-2 text-center">{it.quantity}</td>
                    <td className="p-2 text-right">₹{it.price}</td>
                    <td className="p-2 text-right font-bold">₹{it.price * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 border-t pt-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{invoicePreviewOrder.pricing.subtotal}</span></div>
                <div className="flex justify-between"><span>Integrated GST (18%):</span><span>₹{invoicePreviewOrder.pricing.tax}</span></div>
                <div className="flex justify-between font-bold text-sm border-t pt-1">
                  <span>Grand Total:</span><span>₹{invoicePreviewOrder.pricing.total}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setInvoicePreviewOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-100"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Order Record"
        message={`Are you sure you want to delete order #${orderToDelete?.orderNumber}? This cannot be undone.`}
        onConfirm={async () => {
          if (orderToDelete && (await deleteOrder(orderToDelete.id))) {
            if (selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
            addToast({
              type: 'info',
              title: 'Order Deleted',
              message: `Order ${orderToDelete.orderNumber} was removed.`
            });
          }
        }}
      />
    </div>
  );
};

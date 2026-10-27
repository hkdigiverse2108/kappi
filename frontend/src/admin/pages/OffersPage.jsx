import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Percent,
  Save
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideDrawer } from '../components/common/SideDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { CustomSelect } from '../components/common/CustomSelect';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage (%) Off' },
  { value: 'flat', label: 'Flat Cash (₹) Off' },
  { value: 'free_shipping', label: 'Free Shipping' }
];

export const OffersPage = () => {
  const { coupons, products, addCoupon, updateCoupon, deleteCoupon, addToast } = useAdminStore();
  const productOptions = (products || []).map((p) => ({ value: p.id, label: p.title }));
  const productTitle = (id) => products.find((p) => p.id === id)?.title || id;

  // Coupon Drawer
  const [couponDrawerOpen, setCouponDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: 15,
    minCart: 499,
    maxDiscount: 150,
    productIds: []
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const handleOpenCouponDrawer = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code,
        type: coupon.type || 'percentage',
        value: coupon.value ?? 15,
        minCart: coupon.minCart ?? 499,
        maxDiscount: coupon.maxDiscount ?? 150,
        productIds: coupon.productIds || []
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: `KAPEE${Math.floor(10 + Math.random() * 90)}`,
        type: 'percentage',
        value: 15,
        minCart: 499,
        maxDiscount: 150,
        productIds: []
      });
    }
    setCouponDrawerOpen(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code) {
      addToast({ type: 'error', title: 'Code missing', message: 'Coupon code is required.' });
      return;
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, couponForm);
      addToast({ type: 'success', title: 'Coupon Updated', message: `Saved changes to ${couponForm.code}.` });
    } else {
      addCoupon(couponForm);
      triggerKapeeCelebration();
      addToast({ type: 'success', title: 'Coupon Created', message: `Created active promo code ${couponForm.code}.` });
    }
    setCouponDrawerOpen(false);
  };

  const couponColumns = [
    {
      header: 'Promo Code',
      accessor: 'code',
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-emerald-deep dark:text-emerald-300 border border-stone-200 dark:border-stone-700">
            {row.code}
          </span>
        </div>
      )
    },
    {
      header: 'Discount Offer',
      accessor: 'value',
      cell: (row) => (
        <span className="font-semibold text-xs text-ink dark:text-stone-100">
          {row.type === 'percentage'
            ? `${row.value}% OFF (Up to ₹${row.maxDiscount})`
            : row.type === 'flat'
            ? `₹${row.value} Flat Off`
            : 'Free Shipping (₹50 Value)'}
        </span>
      )
    },
    {
      header: 'Products',
      accessor: 'productIds',
      cell: (row) =>
        row.productIds?.length ? (
          <div className="max-w-[200px] space-y-0.5">
            {row.productIds.slice(0, 2).map((id) => (
              <p key={id} className="text-[11px] font-medium text-stone-700 dark:text-stone-300 truncate">{productTitle(id)}</p>
            ))}
            {row.productIds.length > 2 && (
              <p className="text-[10px] text-stone-400">+{row.productIds.length - 2} more</p>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-stone-400">Not shown on product pages</span>
        )
    },
    {
      header: 'Min Cart',
      accessor: 'minCart',
      cell: (row) => <span className="text-xs font-medium">₹{row.minCart}</span>
    },
    {
      header: 'Redemptions',
      accessor: 'usedCount',
      cell: (row) => (
        <span className="text-xs text-stone-600 dark:text-stone-300">
          {row.usedCount || 0} uses • Unlimited
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status || 'Active'} />
    },
    {
      header: 'Actions',
      disableRowClick: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenCouponDrawer(row)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-deep hover:bg-emerald-50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
            title="Edit coupon"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCouponToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete coupon"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const couponExportColumns = [
    { header: 'Code', value: (c) => c.code },
    { header: 'Type', value: (c) => c.type },
    { header: 'Value', value: (c) => c.value },
    { header: 'Max Discount', value: (c) => c.maxDiscount },
    { header: 'Min Cart', value: (c) => c.minCart },
    { header: 'Product IDs', value: (c) => c.productIds },
    { header: 'Times Used', value: (c) => c.usedCount || 0 },
    { header: 'Status', value: (c) => c.status || 'Active' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Coupons
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Create, manage and track promotional discount coupon codes for customer checkout.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              triggerKapeeCelebration();
              addToast({
                type: 'success',
                title: 'Coupons Saved',
                message: 'All discount offers and coupon rules saved successfully.'
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Coupons</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCouponDrawer()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Coupon</span>
          </button>
        </div>
      </div>

      {/* Main Coupons Table */}
      <DataTable
        exportColumns={couponExportColumns}
        exportFileName="kapee-coupons"
        columns={couponColumns}
        data={coupons}
        searchPlaceholder="Search coupon by code, discount..."
        onRowClick={(row) => handleOpenCouponDrawer(row)}
      />

      {/* Coupon Side Drawer for Create / Edit */}
      <SideDrawer
        isOpen={couponDrawerOpen}
        onClose={() => setCouponDrawerOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        subtitle="Configure discount rules, order thresholds and redemption caps"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCouponDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCoupon}
              className="px-4 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs"
            >
              Save Coupon
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Coupon Code *</label>
            <input
              type="text"
              value={couponForm.code}
              onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CLEAN50"
              className="w-full px-3 py-2 font-mono uppercase bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Discount Type</label>
              <CustomSelect
                value={couponForm.type}
                onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                options={DISCOUNT_TYPE_OPTIONS}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Discount Value</label>
              <input
                type="number"
                value={couponForm.value}
                onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Min Cart Value (₹)</label>
              <input
                type="number"
                value={couponForm.minCart}
                onChange={(e) => setCouponForm({ ...couponForm, minCart: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Max Discount Cap (₹)</label>
              <input
                type="number"
                value={couponForm.maxDiscount}
                onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Applies to Products</label>
            <CustomSelect
              multiple
              value={couponForm.productIds || []}
              onChange={(e) => setCouponForm({ ...couponForm, productIds: e.target.value })}
              options={productOptions}
              placeholder="Select products"
            />
            <p className="text-[11px] text-stone-400">
              The coupon shows only on the pages of the products selected here and discounts only those products in the cart.
              With no product selected it is not shown on any product page (customers can still type the code in the cart).
            </p>
          </div>

        </div>
      </SideDrawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Coupon"
        message={`Are you sure you want to deactivate and remove coupon ${couponToDelete?.code}?`}
        onConfirm={() => {
          if (couponToDelete) {
            deleteCoupon(couponToDelete.id);
            addToast({ type: 'info', title: 'Coupon Deleted', message: 'Promo code removed.' });
          }
        }}
      />
    </div>
  );
};

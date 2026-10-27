import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  IndianRupee,
  Award,
  Trash2,
  Edit,
  ExternalLink,
  MessageCircle,
  Eye,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideDrawer } from '../components/common/SideDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../components/common/Confetti';

export const CustomersPage = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders, addToast } = useAdminStore();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Mumbai',
    state: 'Maharashtra'
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [custToDelete, setCustToDelete] = useState(null);

  const handleOpenDrawer = (cust = null) => {
    if (cust) {
      setEditingCustomer(cust);
      setCustomerForm({
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        city: cust.city,
        state: cust.state
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({
        name: '',
        email: '',
        phone: '+91 ',
        city: 'Mumbai',
        state: 'Maharashtra'
      });
    }
    setCustomerDrawerOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.email) {
      addToast({ type: 'error', title: 'Name and email required', message: 'Please fill in required fields.' });
      return;
    }

    try {
      if (editingCustomer) {
        const saved = await updateCustomer(editingCustomer.id, customerForm);
        if (selectedCustomer?.id === saved.id) setSelectedCustomer(saved);
        addToast({ type: 'success', title: 'Customer Profile Updated', message: `Saved changes to ${customerForm.name}.` });
      } else {
        await addCustomer(customerForm);
        triggerKapeeCelebration();
        addToast({ type: 'success', title: 'Customer Profile Created', message: `Added ${customerForm.name} to directory.` });
      }
      setCustomerDrawerOpen(false);
    } catch (err) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  // Orders placed from this customer's account, or with their email / phone
  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.userId === selectedCustomer.id ||
          (selectedCustomer.email && o.customer.email?.toLowerCase() === selectedCustomer.email.toLowerCase()) ||
          (selectedCustomer.phone && o.customer.phone === selectedCustomer.phone)
      )
    : [];

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200/50">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-ink dark:text-stone-100 text-xs">
              {row.name}
            </p>
            <p className="text-[11px] text-stone-400">
              {row.email}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Phone / Location',
      accessor: 'city',
      cell: (row) => (
        <div>
          <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
            {row.phone}
          </p>
          <p className="text-[11px] text-stone-400">
            {row.city}, {row.state}
          </p>
        </div>
      )
    },
    {
      header: 'Orders & Spend',
      accessor: 'totalSpent',
      cell: (row) => (
        <div>
          <span className="font-bold text-ink dark:text-stone-100 text-xs">
            ₹{row.totalSpent.toLocaleString('en-IN')}
          </span>
          <p className="text-[11px] text-stone-400">
            {row.totalOrders} order(s)
          </p>
        </div>
      )
    },
    {
      header: 'Actions',
      disableRowClick: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedCustomer(row)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-emerald-50"
            title="View customer profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDrawer(row)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-ink hover:bg-stone-100"
            title="Edit profile"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCustToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Directory of registered customers, purchase history, and direct contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenDrawer()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customer by name, email, phone, city..."
        onRowClick={(row) => setSelectedCustomer(row)}
      />

      {/* Customer Detail Drawer */}
      <SideDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name}
        subtitle={`Customer since ${new Date(selectedCustomer?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
        width="max-w-xl"
        footer={
          selectedCustomer && (
            <div className="w-full flex items-center justify-between">
              <a
                href={`https://wa.me/${selectedCustomer.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => handleOpenDrawer(selectedCustomer)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                Edit Profile
              </button>
            </div>
          )
        }
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border">
                <p className="text-stone-400 text-[10px] uppercase font-bold">Total Spent</p>
                <p className="text-base font-serif font-bold text-ink dark:text-stone-100">₹{selectedCustomer.totalSpent}</p>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border">
                <p className="text-stone-400 text-[10px] uppercase font-bold">Total Orders</p>
                <p className="text-base font-serif font-bold text-ink dark:text-stone-100">{selectedCustomer.totalOrders}</p>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border space-y-2">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <Mail className="w-4 h-4 text-stone-400" />
                <span>{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <Phone className="w-4 h-4 text-stone-400" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>{selectedCustomer.city}, {selectedCustomer.state} (India)</span>
              </div>
            </div>

            {/* Past Orders */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100">
                Order History
              </h4>
              {customerOrders.length > 0 ? (
                <div className="divide-y border rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-800 dark:text-stone-100">{o.orderNumber}</p>
                        <p className="text-[11px] text-stone-400">{o.items[0]?.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{o.pricing.total}</p>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 italic">No previous order records for this customer.</p>
              )}
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Customer Edit/Add Drawer */}
      <SideDrawer
        isOpen={customerDrawerOpen}
        onClose={() => setCustomerDrawerOpen(false)}
        title={editingCustomer ? `Edit Customer` : `New Customer Profile`}
        subtitle="Manage contact coordinates and tier assignments"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCustomerDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCustomer}
              className="px-4 py-2 text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white rounded-xl shadow-sm"
            >
              Save Profile
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Full Name *</label>
            <input
              type="text"
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Email Address *</label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Phone</label>
              <input
                type="text"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">City</label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">State</label>
              <input
                type="text"
                value={customerForm.state}
                onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>
          </div>
        </div>
      </SideDrawer>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Remove Customer Record"
        message={`Are you sure you want to delete profile for ${custToDelete?.name}?`}
        onConfirm={() => {
          if (custToDelete) {
            const target = custToDelete;
            deleteCustomer(target.id)
              .then(() => {
                if (selectedCustomer?.id === target.id) setSelectedCustomer(null);
                addToast({ type: 'info', title: 'Customer Removed', message: `Deleted ${target.name}.` });
              })
              .catch((err) => addToast({ type: 'error', title: 'Delete Failed', message: err.message }));
          }
        }}
      />
    </div>
  );
};

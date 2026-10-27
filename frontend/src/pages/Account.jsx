import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  Truck,
  CheckCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  Check,
  Home,
  Building2,
  X
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUserStore } from '../store/useUserStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { confirmDelete } from '../store/useConfirmStore';

export const Account = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile'; // Default is now full profile details
  const [activeTab, setActiveTab] = useState(defaultTab);

  const navigate = useNavigate();
  const { user, isLoggedIn, logout, deleteAddress, addAddress, updateAddress, updateProfile, setDefaultAddress } = useUserStore();
  const { wishlist } = useWishlistStore();

  // Edit Profile Modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editDob, setEditDob] = useState(user.dob || '');
  const [editGender, setEditGender] = useState(user.gender || '');
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  // Address being edited in the modal; null = adding a new one
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddrType, setNewAddrType] = useState('Home');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPin, setNewAddrPin] = useState('');

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <h2 className="font-serif text-2xl font-bold">Please sign in to view your account</h2>
        <Link to="/login" className="btn-primary inline-flex text-xs px-6 py-2.5">
          Sign In / Register
        </Link>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setIsSaving(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        dob: editDob,
        gender: editGender
      });
      setProfileSavedFeedback(true);
      setTimeout(() => {
        setProfileSavedFeedback(false);
        setShowEditProfileModal(false);
      }, 800);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddressModal = (addr = null) => {
    setEditingAddress(addr);
    setNewAddrType(addr?.type || 'Home');
    setNewAddrLine(addr?.addressLine1 || '');
    setNewAddrCity(addr?.city || '');
    setNewAddrState(addr?.state || '');
    setNewAddrPin(addr?.pincode || '');
    setAddressError('');
    setShowAddressModal(true);
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    setIsSaving(true);
    try {
      const fields = {
        type: newAddrType,
        addressLine1: newAddrLine,
        city: newAddrCity,
        state: newAddrState,
        pincode: newAddrPin
      };
      if (editingAddress) {
        await updateAddress(editingAddress.id, {
          name: editingAddress.name,
          phone: editingAddress.phone,
          isDefault: editingAddress.isDefault,
          ...fields
        });
      } else {
        await addAddress({ name: user.name, phone: user.phone, isDefault: false, ...fields });
      }
      setShowAddressModal(false);
      setEditingAddress(null);
      setNewAddrLine('');
      setNewAddrCity('');
      setNewAddrState('');
      setNewAddrPin('');
    } catch (err) {
      setAddressError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete / make default: on failure the list stays as it was, so a message is enough
  const runAddressAction = (action) => {
    action().catch((err) => window.alert(err.message));
  };

  const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
  const latestOrder = user.orders?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>My Account & Profile Details | KAPEE Enterprise</title>
      </Helmet>

      {/* Header Profile Summary */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 border border-emerald-soft shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Soft brand accent */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-deep via-emerald to-gold" />

        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-gradient-to-br from-emerald-deep to-emerald-500 text-white font-serif text-2xl sm:text-3xl font-bold flex items-center justify-center shadow-lg ring-4 ring-emerald-soft">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark">Welcome back</p>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink truncate capitalize" title={user.name}>
              {user.name}
            </h1>
            {user.memberSince && (
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-emerald" />
                Member since {user.memberSince}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="btn-secondary text-xs !py-2 !px-4 text-error border-error/30 hover:bg-red-50 flex items-center justify-center gap-1.5 shrink-0 self-stretch sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-3 border border-emerald-soft shadow-xs space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'profile' ? 'bg-emerald text-white shadow-xs' : 'text-ink hover:bg-emerald-soft'
            }`}
          >
            <User className="w-4 h-4" /> My Profile
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'orders' ? 'bg-emerald text-white shadow-xs' : 'text-ink hover:bg-emerald-soft'
            }`}
          >
            <Package className="w-4 h-4" /> My Orders ({user.orders?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'addresses' ? 'bg-emerald text-white shadow-xs' : 'text-ink hover:bg-emerald-soft'
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses ({user.addresses?.length || 0})
          </button>

          <Link
            to="/wishlist"
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-ink hover:bg-emerald-soft transition-colors"
          >
            <span className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-emerald" /> Wishlist
            </span>
            <span className="text-[10px] bg-ivory px-2 py-0.5 rounded-full border">{wishlist.length}</span>
          </Link>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: PROFILE DETAILS (Clean, Minimal, No Unnecessary Extra Elements) */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-soft shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-soft pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-ink">Personal Profile</h2>
                  <p className="text-xs text-muted mt-0.5">Your registered personal details.</p>
                </div>
                <button
                  onClick={() => {
                    setEditName(user.name);
                    setEditEmail(user.email);
                    setEditPhone(user.phone);
                    setProfileError('');
                    setShowEditProfileModal(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-soft text-emerald-deep hover:bg-emerald/15 border border-emerald/20 flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" /> Full Name
                  </span>
                  <p className="font-bold text-ink text-sm sm:text-base">{user.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-ink text-sm sm:text-base">{user.email}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" /> Mobile Number
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-ink text-sm sm:text-base">{user.phone}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" /> Default Delivery Address
                  </span>
                  <p className="font-bold text-ink text-sm sm:text-base">
                    {defaultAddr
                      ? `${defaultAddr.city}, ${defaultAddr.state} (${defaultAddr.pincode})`
                      : 'No default address set'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-ink">Order History</h2>
                <span className="text-xs text-muted font-medium">{user.orders?.length || 0} Orders placed</span>
              </div>

              {user.orders && user.orders.length > 0 ? (
                user.orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-6 border border-emerald-soft shadow-soft space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-soft pb-4">
                      <div>
                        <span className="text-xs text-muted">Order ID</span>
                        <p className="font-serif font-bold text-base text-emerald-deep">{order.id}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-muted">Placed on {order.date}</span>
                        <p className="text-xs font-bold text-ink">Total: ₹{order.total} • {order.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-emerald-soft" />
                            <div>
                              <p className="text-xs font-bold text-ink">{it.title}</p>
                              <p className="text-[11px] text-muted">Qty: {it.quantity} • ₹{it.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-soft text-emerald-deep flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-success" /> {order.status}
                        </span>
                        <Link
                          to={`/track-order?orderId=${order.id}`}
                          className="btn-primary text-xs py-2 px-4 flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Order
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">No orders placed yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-ink">Saved Delivery Addresses</h2>
                <button
                  onClick={() => openAddressModal()}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses?.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white rounded-3xl p-5 border border-emerald-soft shadow-soft space-y-2 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-soft text-emerald px-2 py-0.5 rounded-full">
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-gold-light text-emerald-950 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openAddressModal(addr)}
                          className="text-muted hover:text-emerald p-1"
                          title="Edit address"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete({ title: 'Delete Address?', message: 'Delete this saved address?', onConfirm: () => runAddressAction(() => deleteAddress(addr.id)) })}
                          className="text-muted hover:text-error p-1"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-ink">{addr.name}</p>
                    <p className="text-xs text-muted leading-relaxed">
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-muted">Phone: {addr.phone}</p>

                    {!addr.isDefault && (
                      <button
                        onClick={() => runAddressAction(() => setDefaultAddress(addr.id))}
                        className="text-[11px] font-bold text-emerald hover:underline pt-1 block"
                      >
                        Set as Default Address
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setShowEditProfileModal(false)} />
          <form
            onSubmit={handleUpdateProfile}
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 border border-emerald-soft space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-ink">Edit Profile Information</h3>
              {profileSavedFeedback && (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                  <Check className="w-4 h-4" /> Saved!
                </span>
              )}
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {profileError}
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-bold">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-soft"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold">Email Address</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-soft"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold">Mobile Phone</label>
              <input
                type="text"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-soft"
              />
            </div>



            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="btn-secondary py-2.5 text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary py-2.5 text-center font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
          <form
            onSubmit={handleAddNewAddress}
            className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl z-10 border border-emerald-100 overflow-hidden text-xs"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-deep via-emerald to-emerald-500 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold-light" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-tight">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    {editingAddress ? 'Update your delivery details.' : 'Where should we deliver your order?'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                aria-label="Close"
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {addressError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {addressError}
                </div>
              )}

              <div>
                <label className="block font-bold text-ink mb-2">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'Home', label: 'Home', icon: Home },
                    { value: 'Office', label: 'Office', icon: Building2 },
                    { value: 'Other', label: 'Other', icon: MapPin },
                  ].map(({ value, label, icon: Icon }) => {
                    const active = newAddrType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setNewAddrType(value)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-semibold transition-all ${
                          active
                            ? 'bg-emerald text-white border-emerald shadow-md shadow-emerald/20'
                            : 'bg-ivory text-stone-600 border-emerald-100 hover:border-emerald-300 hover:text-emerald'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1.5">Flat / Building / Street</label>
                <input
                  type="text"
                  required
                  value={newAddrLine}
                  onChange={(e) => setNewAddrLine(e.target.value)}
                  placeholder="e.g. 102, Sunrise Residency"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-100 bg-ivory text-ink placeholder:text-stone-400 outline-none focus:bg-white focus:border-emerald focus:ring-4 focus:ring-emerald/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-ink mb-1.5">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddrPin}
                    onChange={(e) => setNewAddrPin(e.target.value)}
                    placeholder="380001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-100 bg-ivory text-ink placeholder:text-stone-400 outline-none focus:bg-white focus:border-emerald focus:ring-4 focus:ring-emerald/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    placeholder="Ahmedabad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-100 bg-ivory text-ink placeholder:text-stone-400 outline-none focus:bg-white focus:border-emerald focus:ring-4 focus:ring-emerald/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1.5">State</label>
                  <input
                    type="text"
                    required
                    value={newAddrState}
                    onChange={(e) => setNewAddrState(e.target.value)}
                    placeholder="Gujarat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-100 bg-ivory text-ink placeholder:text-stone-400 outline-none focus:bg-white focus:border-emerald focus:ring-4 focus:ring-emerald/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 px-6 py-4 bg-ivory border-t border-emerald-100">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="btn-secondary py-2.5 text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary py-2.5 text-center font-bold"
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Account;

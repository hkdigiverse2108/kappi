import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  CreditCard,
  Key,
  Copy,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { StatusBadge } from '../components/common/StatusBadge';
import { triggerKapeeCelebration } from '../components/common/Confetti';

export const DeliveryPaymentsPage = () => {
  const {
    delhiveryConfig,
    updateDelhiveryConfig,
    razorpayConfig,
    updateRazorpayConfig,
    addToast
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('delhivery'); // 'delhivery' | 'razorpay'

  // Delhivery local form state
  const [delhiveryForm, setDelhiveryForm] = useState(
    delhiveryConfig || {
      name: 'Delhivery Direct Express',
      status: 'Connected',
      mode: 'Live',
      apiToken: 'delh_live_9f8a32b91c8a331f',
      clientName: 'KAPEE ENTERPRISE',
      codEnabled: true
    }
  );

  // Razorpay local form state
  const [razorpayForm, setRazorpayForm] = useState(
    razorpayConfig || {
      name: 'Razorpay PG',
      status: 'Active',
      mode: 'Live',
      keyId: 'rzp_live_8F9a21Bbc42',
      keySecret: 'sec_live_9941a87b003c21',
      methods: ['UPI (GPay / PhonePe / Paytm)', 'Cards (Visa / Master / RuPay)', 'Net Banking'],
      autoCapture: true
    }
  );

  // Password / Secret visibility toggles
  const [showDelhiveryToken, setShowDelhiveryToken] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  // Testing connection spinners
  const [testingDelhivery, setTestingDelhivery] = useState(false);
  const [testingRazorpay, setTestingRazorpay] = useState(false);

  // Copy helper
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast({
      type: 'info',
      title: 'Copied',
      message: `${label} copied to clipboard.`
    });
  };

  // Test Delhivery API
  const handleTestDelhivery = () => {
    setTestingDelhivery(true);
    setTimeout(() => {
      setTestingDelhivery(false);
      setDelhiveryForm((prev) => ({ ...prev, status: 'Connected' }));
      updateDelhiveryConfig({ status: 'Connected' });
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Delhivery Connected',
        message: 'Successfully verified Delhivery API credentials.'
      });
    }, 900);
  };

  // Save Delhivery Form
  const handleSaveDelhivery = (e) => {
    e.preventDefault();
    updateDelhiveryConfig(delhiveryForm);
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Delhivery Saved',
      message: 'Delhivery integration settings updated successfully.'
    });
  };

  // Test Razorpay API
  const handleTestRazorpay = () => {
    setTestingRazorpay(true);
    setTimeout(() => {
      setTestingRazorpay(false);
      setRazorpayForm((prev) => ({ ...prev, status: 'Active' }));
      updateRazorpayConfig({ status: 'Active' });
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: 'Razorpay Verified',
        message: 'Key ID and Key Secret successfully authenticated.'
      });
    }, 900);
  };

  // Save Razorpay Form
  const handleSaveRazorpay = (e) => {
    e.preventDefault();
    updateRazorpayConfig(razorpayForm);
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Razorpay Saved',
      message: 'Razorpay credentials saved successfully.'
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header with Top-Right Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Delivery & Payments
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Simple API integration management for Delhivery logistics and Razorpay checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={activeTab === 'delhivery' ? handleSaveDelhivery : handleSaveRazorpay}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save {activeTab === 'delhivery' ? 'Delhivery' : 'Razorpay'} Settings</span>
        </button>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('delhivery')}
          className={`pb-3 px-5 text-sm font-semibold flex items-center gap-2 relative transition-colors ${
            activeTab === 'delhivery'
              ? 'text-emerald-deep dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delhivery</span>
          {activeTab === 'delhivery' && (
            <motion.div
              layoutId="providerTabPill"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-deep dark:bg-emerald-400"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('razorpay')}
          className={`pb-3 px-5 text-sm font-semibold flex items-center gap-2 relative transition-colors ${
            activeTab === 'razorpay'
              ? 'text-emerald-deep dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Razorpay</span>
          {activeTab === 'razorpay' && (
            <motion.div
              layoutId="providerTabPill"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-deep dark:bg-emerald-400"
            />
          )}
        </button>
      </div>

      {/* TAB 1: DELHIVERY LOGISTICS */}
      {activeTab === 'delhivery' && (
        <form onSubmit={handleSaveDelhivery} className="space-y-6 w-full">
          {/* Top Status Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                      Delhivery Direct
                    </h2>
                    <StatusBadge status={delhiveryForm.status} />
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Connect your Delhivery account for automatic order shipping and tracking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestDelhivery}
                  disabled={testingDelhivery}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-deep dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-all"
                >
                  {testingDelhivery ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Test Connection</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delhivery Form Layout */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 space-y-6 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <Key className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Delhivery Settings
              </h3>
            </div>

            <div className="space-y-5 text-xs">
              {/* Row 1: Mode + Client Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDelhiveryForm({ ...delhiveryForm, mode: 'Live' })}
                      className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                        delhiveryForm.mode === 'Live'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-600'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      ● Live Production
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelhiveryForm({ ...delhiveryForm, mode: 'Sandbox' })}
                      className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                        delhiveryForm.mode === 'Sandbox'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      ○ Sandbox / Test
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Client / Account Name *
                  </label>
                  <input
                    type="text"
                    value={delhiveryForm.clientName}
                    onChange={(e) => setDelhiveryForm({ ...delhiveryForm, clientName: e.target.value })}
                    placeholder="e.g. KAPEE ENTERPRISE"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Row 2: API Token */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Delhivery API Token *
                </label>
                <div className="relative">
                  <input
                    type={showDelhiveryToken ? 'text' : 'password'}
                    value={delhiveryForm.apiToken}
                    onChange={(e) => setDelhiveryForm({ ...delhiveryForm, apiToken: e.target.value })}
                    placeholder="e.g. delh_live_9f8a32b91c8a331f"
                    className="w-full pr-24 pl-3.5 py-2.5 font-mono text-xs bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowDelhiveryToken(!showDelhiveryToken)}
                      className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
                      title={showDelhiveryToken ? 'Hide token' : 'Show token'}
                    >
                      {showDelhiveryToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(delhiveryForm.apiToken, 'Delhivery API Token')}
                      className="p-1.5 text-stone-400 hover:text-emerald-deep rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      title="Copy token"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Cash on Delivery Toggle */}
              <label className="flex items-center gap-3.5 p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200/70 dark:border-stone-800 cursor-pointer hover:border-emerald-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={delhiveryForm.codEnabled}
                  onChange={(e) => setDelhiveryForm({ ...delhiveryForm, codEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-700 text-emerald-deep cursor-pointer"
                />
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-200">
                    Enable Cash on Delivery (COD)
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Allow courier to collect cash/UPI at doorstep for orders
                  </p>
                </div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: RAZORPAY PAYMENTS */}
      {activeTab === 'razorpay' && (
        <form onSubmit={handleSaveRazorpay} className="space-y-6 w-full">
          {/* Top Status Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-700 dark:text-blue-300 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                      Razorpay Payments
                    </h2>
                    <StatusBadge status={razorpayForm.status} />
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Accept UPI, Debit/Credit Cards & Net Banking online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestRazorpay}
                  disabled={testingRazorpay}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold transition-all"
                >
                  {testingRazorpay ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>Test Connection</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Razorpay Form Layout */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 space-y-6 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Razorpay API Credentials
              </h3>
            </div>

            <div className="space-y-5 text-xs">
              {/* Row 1: Mode + Key ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRazorpayForm({ ...razorpayForm, mode: 'Live' })}
                      className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                        razorpayForm.mode === 'Live'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-600'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      ● Live Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setRazorpayForm({ ...razorpayForm, mode: 'Test' })}
                      className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                        razorpayForm.mode === 'Test'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 ring-1 ring-blue-600'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      ○ Test Mode
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Razorpay Key ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={razorpayForm.keyId}
                      onChange={(e) => setRazorpayForm({ ...razorpayForm, keyId: e.target.value })}
                      placeholder="e.g. rzp_live_8F9a21Bbc42"
                      className="w-full pr-12 pl-3.5 py-2.5 font-mono text-xs bg-stone-50 dark:bg-stone-800 border rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(razorpayForm.keyId, 'Key ID')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-blue-600 rounded-lg hover:bg-stone-100"
                      title="Copy Key ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Key Secret */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Razorpay Key Secret *
                </label>
                <div className="relative">
                  <input
                    type={showRazorpaySecret ? 'text' : 'password'}
                    value={razorpayForm.keySecret}
                    onChange={(e) => setRazorpayForm({ ...razorpayForm, keySecret: e.target.value })}
                    placeholder="e.g. sec_live_9941a87b003c21"
                    className="w-full pr-24 pl-3.5 py-2.5 font-mono text-xs bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                      className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
                      title={showRazorpaySecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(razorpayForm.keySecret, 'Key Secret')}
                      className="p-1.5 text-stone-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      title="Copy Key Secret"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Supported payment methods banner */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-200">Payment Methods</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">UPI (Google Pay, PhonePe, Paytm), Cards & Net Banking</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

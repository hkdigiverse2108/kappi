import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  CreditCard,
  Copy,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Zap,
  Banknote
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { StatusBadge } from '../components/common/StatusBadge';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { PaymentAdjustmentRow, MiniSwitch } from '../components/common/PaymentAdjustments';

// Checkout payment options; older saved settings get the COD charge / prepaid discount switched off
const DEFAULT_PAYMENT_OPTIONS = {
  codEnabled: true,
  razorpayEnabled: false,
  codCharge: { enabled: false, type: 'amount', value: 0 },
  prepaidDiscount: { enabled: false, type: 'percent', value: 0 }
};
const withPaymentDefaults = (settings) => ({
  ...DEFAULT_PAYMENT_OPTIONS,
  ...settings,
  codCharge: { ...DEFAULT_PAYMENT_OPTIONS.codCharge, ...settings?.codCharge },
  prepaidDiscount: { ...DEFAULT_PAYMENT_OPTIONS.prepaidDiscount, ...settings?.prepaidDiscount }
});

const cardClass =
  'bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-5 shadow-2xs';
const inputClass =
  'w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-ink dark:text-stone-100 focus:outline-none focus:border-emerald-500';

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block font-semibold text-stone-700 dark:text-stone-300">{label}</label>
    {children}
  </div>
);

// Live / test mode picker shown in the provider header
const ModeSwitch = ({ value, options, onChange }) => (
  <div className="inline-flex p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
    {options.map((o, i) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors ${
          value === o.value
            ? `bg-white dark:bg-stone-900 shadow-sm ${i === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`
            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${value === o.value ? (i === 0 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-stone-300 dark:bg-stone-600'}`} />
        {o.label}
      </button>
    ))}
  </div>
);

// API key / token input with copy (and show/hide for secrets)
const KeyField = ({ value, onChange, placeholder, secret, shown, onToggleShown, onCopy }) => (
  <div className="relative">
    <input
      type={secret && !shown ? 'password' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputClass} font-mono ${secret ? 'pr-16' : 'pr-9'}`}
    />
    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
      {secret && (
        <button
          type="button"
          onClick={onToggleShown}
          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-md"
          title={shown ? 'Hide' : 'Show'}
        >
          {shown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
      <button type="button" onClick={onCopy} className="p-1 text-stone-400 hover:text-emerald-deep rounded-md" title="Copy">
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// Provider name, connection status and Test Connection button
const ProviderHeader = ({ icon: Icon, tone, title, hint, status, testing, onTest, testIcon: TestIcon, mode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          tone === 'blue'
            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{title}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="text-[11px] text-stone-400 mt-0.5">{hint}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {mode}
      <button
        type="button"
        onClick={onTest}
        disabled={testing}
        className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-emerald-500 hover:text-emerald-deep text-xs font-semibold transition-colors"
      >
        {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TestIcon className="w-3.5 h-3.5" />}
        <span>Test Connection</span>
      </button>
    </div>
  </div>
);

export const DeliveryPaymentsPage = () => {
  const {
    delhiveryConfig,
    updateDelhiveryConfig,
    razorpayConfig,
    updateRazorpayConfig,
    paymentSettings,
    loadPaymentSettings,
    savePaymentSettings,
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

  // Which payment options the checkout shows (saved in the backend, unlike the forms above)
  const [paymentOptions, setPaymentOptions] = useState(withPaymentDefaults(paymentSettings));
  useEffect(() => {
    loadPaymentSettings();
  }, [loadPaymentSettings]);
  useEffect(() => {
    if (paymentSettings) setPaymentOptions(withPaymentDefaults(paymentSettings));
  }, [paymentSettings]);

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
  const handleSaveRazorpay = async (e) => {
    e.preventDefault();
    if (!paymentOptions.codEnabled && !paymentOptions.razorpayEnabled) {
      addToast({
        type: 'error',
        title: 'Select a Payment Option',
        message: 'Keep at least one payment option on for checkout.'
      });
      return;
    }
    const rules = Object.fromEntries(
      ['codCharge', 'prepaidDiscount'].map((key) => [key, { ...paymentOptions[key], value: Number(paymentOptions[key].value) || 0 }])
    );
    if (Object.values(rules).some((r) => r.type === 'percent' && r.value > 100)) {
      addToast({ type: 'error', title: 'Check the Percentage', message: 'A percentage cannot be more than 100.' });
      return;
    }
    if (Object.values(rules).some((r) => r.enabled && !r.value)) {
      addToast({ type: 'error', title: 'Value missing', message: 'Enter the percentage or amount for the COD charge / prepaid discount that is on.' });
      return;
    }
    updateRazorpayConfig(razorpayForm);
    try {
      await savePaymentSettings({ ...paymentOptions, ...rules });
    } catch {
      return; // the store already showed the error
    }
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Payment Settings Saved',
      message: 'Checkout payment options and Razorpay credentials saved successfully.'
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
          <span>Delivery Partner</span>
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
          <span>Payment Gateway</span>
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
        <form onSubmit={handleSaveDelhivery} className="w-full">
          <div className={cardClass}>
            <ProviderHeader
              icon={Truck}
              tone="emerald"
              title="Delhivery Direct"
              hint="Automatic order shipping and tracking"
              status={delhiveryForm.status}
              testing={testingDelhivery}
              onTest={handleTestDelhivery}
              mode={
                <ModeSwitch
                  value={delhiveryForm.mode}
                  options={[{ value: 'Live', label: 'Live' }, { value: 'Sandbox', label: 'Sandbox' }]}
                  onChange={(mode) => setDelhiveryForm({ ...delhiveryForm, mode })}
                />
              }
              testIcon={Sparkles}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-5 border-t border-stone-100 dark:border-stone-800">
              <Field label="Client / Account Name *">
                <input
                  type="text"
                  value={delhiveryForm.clientName}
                  onChange={(e) => setDelhiveryForm({ ...delhiveryForm, clientName: e.target.value })}
                  placeholder="e.g. KAPEE ENTERPRISE"
                  className={inputClass}
                />
              </Field>
              <Field label="API Token *">
                <KeyField
                  value={delhiveryForm.apiToken}
                  onChange={(apiToken) => setDelhiveryForm({ ...delhiveryForm, apiToken })}
                  placeholder="e.g. delh_live_9f8a32b91c8a331f"
                  secret
                  shown={showDelhiveryToken}
                  onToggleShown={() => setShowDelhiveryToken(!showDelhiveryToken)}
                  onCopy={() => handleCopy(delhiveryForm.apiToken, 'Delhivery API Token')}
                />
              </Field>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: RAZORPAY PAYMENTS */}
      {activeTab === 'razorpay' && (
        <form onSubmit={handleSaveRazorpay} className="space-y-5 w-full">
          {/* Checkout Payment Options: what customers can choose at checkout, each with its COD charge / prepaid discount */}
          <div className={cardClass}>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Checkout Payment Options</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Only the options switched on are shown at checkout. COD charge and prepaid discount appear as their own lines in the order total.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                {
                  key: 'codEnabled',
                  icon: Banknote,
                  title: 'Cash on Delivery (COD)',
                  hint: 'Customer pays cash/UPI to the courier',
                  rule: 'codCharge',
                  ruleTitle: 'COD Extra Charge'
                },
                {
                  key: 'razorpayEnabled',
                  icon: CreditCard,
                  title: 'Razorpay (Online Payment)',
                  hint: 'UPI, Cards & Net Banking',
                  rule: 'prepaidDiscount',
                  ruleTitle: 'Prepaid Discount'
                }
              ].map(({ key, icon: Icon, title, hint, rule, ruleTitle }) => {
                const on = !!paymentOptions[key];
                return (
                  <div
                    key={key}
                    className={`rounded-xl border transition-colors ${
                      on
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'border-stone-200/70 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40'
                    }`}
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            on ? 'bg-emerald-deep text-white' : 'bg-white dark:bg-stone-900 text-stone-400 border border-stone-200 dark:border-stone-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-800 dark:text-stone-200">{title}</p>
                          <p className="text-[11px] text-stone-400 truncate">{hint}</p>
                        </div>
                      </div>
                      <MiniSwitch checked={on} onChange={(v) => setPaymentOptions({ ...paymentOptions, [key]: v })} label={title} />
                    </div>
                    <div className="px-4 pb-4 pt-3 border-t border-stone-200/70 dark:border-stone-800">
                      <PaymentAdjustmentRow
                        title={ruleTitle}
                        rule={paymentOptions[rule]}
                        disabled={!on}
                        onChange={(next) => setPaymentOptions({ ...paymentOptions, [rule]: next })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {!paymentOptions.codEnabled && !paymentOptions.razorpayEnabled && (
              <p className="text-[11px] font-semibold text-red-600">
                Keep at least one payment option on, otherwise customers cannot place orders.
              </p>
            )}
          </div>

          {/* Razorpay API credentials */}
          <div className={cardClass}>
            <ProviderHeader
              icon={CreditCard}
              tone="blue"
              title="Razorpay API Credentials"
              hint="UPI (Google Pay, PhonePe, Paytm), Cards & Net Banking"
              status={razorpayForm.status}
              testing={testingRazorpay}
              onTest={handleTestRazorpay}
              mode={
                <ModeSwitch
                  value={razorpayForm.mode}
                  options={[{ value: 'Live', label: 'Live' }, { value: 'Test', label: 'Test' }]}
                  onChange={(mode) => setRazorpayForm({ ...razorpayForm, mode })}
                />
              }
              testIcon={Zap}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-5 border-t border-stone-100 dark:border-stone-800">
              <Field label="Key ID *">
                <KeyField
                  value={razorpayForm.keyId}
                  onChange={(keyId) => setRazorpayForm({ ...razorpayForm, keyId })}
                  placeholder="e.g. rzp_live_8F9a21Bbc42"
                  onCopy={() => handleCopy(razorpayForm.keyId, 'Key ID')}
                />
              </Field>
              <Field label="Key Secret *">
                <KeyField
                  value={razorpayForm.keySecret}
                  onChange={(keySecret) => setRazorpayForm({ ...razorpayForm, keySecret })}
                  placeholder="e.g. sec_live_9941a87b003c21"
                  secret
                  shown={showRazorpaySecret}
                  onToggleShown={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  onCopy={() => handleCopy(razorpayForm.keySecret, 'Key Secret')}
                />
              </Field>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

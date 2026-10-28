import React from 'react';

const TYPES = [
  { value: 'percent', label: '%' },
  { value: 'amount', label: '₹' }
];

// Small on/off switch used on the Delivery & Payments page
export const MiniSwitch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
  </button>
);

// COD extra charge or prepaid discount: on/off, % or flat ₹, and the value
export const PaymentAdjustmentRow = ({ title, rule, onChange, disabled }) => (
  <div className={`space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex items-center justify-between gap-3">
      <p className="font-semibold text-stone-700 dark:text-stone-300">{title}</p>
      <MiniSwitch checked={!!rule.enabled} onChange={(v) => onChange({ ...rule, enabled: v })} label={title} />
    </div>
    <div className={`flex gap-2 ${rule.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
      <div className="flex p-0.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shrink-0">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange({ ...rule, type: t.value })}
            className={`w-9 py-1.5 rounded-md font-bold transition-colors ${
              rule.type === t.value ? 'bg-emerald-deep text-white' : 'text-stone-500 dark:text-stone-400'
            }`}
            title={t.value === 'percent' ? 'Percentage of the cart (after coupon and cart discounts)' : 'Flat amount'}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={0}
        max={rule.type === 'percent' ? 100 : undefined}
        step="any"
        value={rule.value}
        placeholder={rule.type === 'percent' ? 'e.g. 5' : 'e.g. 50'}
        onChange={(e) => onChange({ ...rule, value: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })}
        className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-ink dark:text-stone-100 focus:outline-none focus:border-emerald-500"
      />
    </div>
  </div>
);

export default PaymentAdjustmentRow;

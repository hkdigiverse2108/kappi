import React, { useState } from 'react';
import { Edit, ChevronDown } from 'lucide-react';

// Small form building blocks for the CMS settings cards (Homepage CMS, Reviews)
export const TextField = ({ label, value, onChange, placeholder, className = '', type = 'text' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="font-semibold text-stone-700 dark:text-stone-300">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
    />
  </div>
);

// collapsible: the header toggles the body open/closed (starts closed unless defaultOpen)
export const SettingsCard = ({ title, description, onSave, saveLabel = 'Save', collapsible = false, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(!collapsible || defaultOpen);

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs ${open ? 'space-y-4' : ''}`}>
      <div
        className={`flex items-center justify-between gap-3 ${open ? 'pb-3 border-b border-stone-100 dark:border-stone-800' : ''} ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
      >
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Edit className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
            <span>{title}</span>
          </h3>
          {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onSave && open && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-xs transition-all active:scale-95 shrink-0"
            >
              {saveLabel}
            </button>
          )}
          {collapsible && (
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label={open ? 'Collapse section' : 'Expand section'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </span>
          )}
        </div>
      </div>
      {open && children}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// Themed replacement for the native <select>, whose option list can't be styled
export const Select = ({ value, onChange, options, className = '', menuClassName = '' }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);

  const selected = options.find((opt) => opt.value === value) || options[0];

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const openMenu = () => {
    setActiveIndex(options.findIndex((opt) => opt.value === value));
    setOpen(true);
  };

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex >= 0) choose(options[activeIndex]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center justify-between gap-2 text-left cursor-pointer ${className}`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-emerald transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border border-emerald-100 bg-white py-1 shadow-lg ${menuClassName}`}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(opt)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center justify-between gap-3 px-3.5 py-2 cursor-pointer whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-emerald text-white font-semibold'
                    : i === activeIndex
                      ? 'bg-emerald-soft text-emerald-deep'
                      : 'text-ink'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;

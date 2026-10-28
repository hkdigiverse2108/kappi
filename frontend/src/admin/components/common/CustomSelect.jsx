import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  children,
  placeholder = 'Select an option',
  className = '',
  dropdownClassName = '',
  size = 'md', // 'sm' | 'md' | 'toolbar' (same height as the Export CSV button)
  disabled = false,
  name = '',
  id = '',
  badge = null,
  multiple = false // when true, value is an array and each click toggles an option
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  // The menu is drawn on <body> at the trigger's screen position, so tables and drawers with
  // overflow hidden/auto can't cut it off
  const [menuPos, setMenuPos] = useState(null);

  // Normalize options from either options prop or children (<option value="..">Label</option>)
  const parsedOptions = React.useMemo(() => {
    if (options && options.length > 0) {
      return options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            value: opt.value !== undefined ? opt.value : opt.label,
            label: opt.label !== undefined ? opt.label : opt.value,
            icon: opt.icon,
            badge: opt.badge,
            description: opt.description
          };
        }
        return { value: opt, label: String(opt) };
      });
    }

    if (children) {
      const items = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.props) {
          items.push({
            value: child.props.value !== undefined ? child.props.value : child.props.children,
            label: child.props.children || child.props.value,
            disabled: child.props.disabled,
            icon: child.props.icon
          });
        }
      });
      return items;
    }

    return [];
  }, [options, children]);

  // Find currently selected option(s)
  const selectedValues = multiple ? (Array.isArray(value) ? value.map(String) : []) : [String(value)];
  const isValueSelected = (optValue) => selectedValues.includes(String(optValue));
  const selectedOption = multiple ? null : parsedOptions.find((opt) => isValueSelected(opt.value));
  const selectedLabel = multiple
    ? parsedOptions.filter((opt) => isValueSelected(opt.value)).map((opt) => opt.label).join(', ')
    : selectedOption?.label;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !(menuRef.current && menuRef.current.contains(e.target))
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Place the menu under the trigger (or above it when there is no room below) and follow it on scroll/resize
  useLayoutEffect(() => {
    if (!isOpen) return;
    const MENU_MAX_HEIGHT = 256;
    const place = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < MENU_MAX_HEIGHT + 12 && rect.top > spaceBelow;
      setMenuPos({
        left: rect.left,
        width: rect.width,
        ...(openUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 })
      });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (clickedValue) => {
    if (disabled) return;
    let optValue = clickedValue;
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      optValue = current.some((v) => String(v) === String(clickedValue))
        ? current.filter((v) => String(v) !== String(clickedValue))
        : [...current, clickedValue];
    } else {
      setIsOpen(false);
    }
    if (onChange) {
      // Provide compatibility with both (val) and standard event (e) => e.target.value
      const syntheticEvent = {
        target: { value: optValue, name },
        currentTarget: { value: optValue, name },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      onChange(syntheticEvent, optValue);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left font-sans select-none ${
        disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
      }`}
    >
      {/* Hidden native input for form submissions if needed */}
      <input type="hidden" name={name} id={id} value={multiple ? selectedValues.join(',') : value ?? ''} />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left transition-all cursor-pointer ${
          isSmall
            ? 'px-2.5 py-1.5 text-[11px] rounded-lg'
            : size === 'toolbar'
              ? 'px-3.5 py-2 text-xs rounded-xl'
              : 'px-3.5 py-2.5 text-xs rounded-xl'
        } bg-stone-50/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 border ${
          isOpen
            ? 'border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-deep/15 shadow-sm bg-white dark:bg-stone-800'
            : 'border-stone-200 dark:border-stone-700 hover:border-emerald-500/50 dark:hover:border-emerald-600/50'
        } ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-emerald-deep dark:text-emerald-400">
              {React.createElement(selectedOption.icon, {
                className: isSmall ? 'w-3 h-3' : 'w-4 h-4'
              })}
            </span>
          )}
          <span
            className={`truncate font-semibold ${
              selectedLabel
                ? 'text-ink dark:text-stone-100'
                : 'text-stone-400 dark:text-stone-500'
            }`}
          >
            {selectedLabel || placeholder}
          </span>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>

        <ChevronDown
          className={`shrink-0 transition-transform duration-200 text-stone-400 dark:text-stone-400 ${
            isSmall ? 'w-3 h-3 ml-1' : 'w-3.5 h-3.5 ml-2'
          } ${isOpen ? 'rotate-180 text-emerald-deep dark:text-emerald-400' : ''}`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {createPortal(
      <AnimatePresence>
        {isOpen && menuPos && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`fixed z-[70] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700/80 rounded-2xl shadow-xl shadow-emerald-950/15 p-1.5 max-h-64 overflow-y-auto space-y-0.5 outline-none ${dropdownClassName}`}
            style={{ left: menuPos.left, top: menuPos.top, bottom: menuPos.bottom, minWidth: menuPos.width }}
          >
            {parsedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted dark:text-stone-400 text-center">
                No options available
              </div>
            ) : (
              parsedOptions.map((opt, idx) => {
                const isSelected = isValueSelected(opt.value);
                const IconComponent = opt.icon;

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-deep dark:text-emerald-300 font-bold'
                        : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-900 dark:hover:text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {IconComponent && (
                        <span className="shrink-0 text-emerald-deep dark:text-emerald-400">
                          {React.createElement(IconComponent, { className: 'w-3.5 h-3.5' })}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-gold/20 text-gold-deep shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-deep dark:text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
};

export default CustomSelect;

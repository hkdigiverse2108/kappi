import React, { useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// 'YYYY-MM-DD' in local time (same format as <input type="date">)
const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatKey = (key) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * One calendar for picking a single day or a range.
 * First click = start date, second click = end date (click the same day twice for one day).
 * Calls onChange(from, to) with 'YYYY-MM-DD' strings.
 */
export const DateRangePicker = ({ from, to, onChange, placeholder = 'Select dates' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const base = from ? new Date(`${from}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  // Start picked, waiting for the end click
  const [pendingStart, setPendingStart] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const ref = useRef(null);

  const close = () => {
    setIsOpen(false);
    setPendingStart(null);
    setHoverKey(null);
  };
  useClickOutside(ref, isOpen, close);

  const todayKey = toKey(new Date());

  // Monday-first grid for the shown month
  const firstWeekday = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toKey(new Date(month.getFullYear(), month.getMonth(), i + 1)))
  ];

  // Range shown on the calendar: the saved one, or the one being picked
  let rangeStart = from;
  let rangeEnd = to;
  if (pendingStart) {
    const other = hoverKey || pendingStart;
    [rangeStart, rangeEnd] = pendingStart <= other ? [pendingStart, other] : [other, pendingStart];
  }

  const handleDayClick = (key) => {
    if (!pendingStart) {
      setPendingStart(key);
      return;
    }
    const [start, end] = pendingStart <= key ? [pendingStart, key] : [key, pendingStart];
    onChange(start, end);
    close();
  };

  const label = from
    ? from === to || !to
      ? formatKey(from)
      : `${formatKey(from)} – ${formatKey(to)}`
    : placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs whitespace-nowrap transition-all bg-stone-50/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 ${
          isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-deep/15'
            : 'border-stone-200 dark:border-stone-700'
        } ${from ? 'text-ink dark:text-stone-100 font-semibold' : 'text-stone-400'}`}
      >
        <Calendar className="w-3.5 h-3.5 text-emerald-deep dark:text-emerald-400" />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-ink dark:text-stone-100">
              {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-stone-400 mb-1">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => setHoverKey(null)}>
            {cells.map((key, i) => {
              if (!key) return <span key={`e-${i}`} />;
              const isEdge = key === rangeStart || key === rangeEnd;
              const inRange = rangeStart && rangeEnd && key > rangeStart && key < rangeEnd;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDayClick(key)}
                  onMouseEnter={() => setHoverKey(key)}
                  className={`h-8 text-xs transition-colors ${
                    isEdge
                      ? 'bg-emerald-deep text-white font-bold rounded-lg'
                      : inRange
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-deep dark:text-emerald-300'
                        : `rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 ${
                            key === todayKey ? 'font-bold ring-1 ring-emerald-600/40' : ''
                          }`
                  }`}
                >
                  {Number(key.slice(8))}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[10px] text-stone-400">
              {pendingStart ? 'Now pick the end date' : 'Pick a date, or a start and end date'}
            </span>
            {from && (
              <button
                type="button"
                onClick={() => {
                  onChange('', '');
                  close();
                }}
                className="text-[11px] font-semibold text-stone-500 hover:text-rose-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

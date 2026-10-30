import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Parse ISO date string (YYYY-MM-DD) as local date, not UTC
function parseLocalDate(isoString) {
  if (!isoString) return null;
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format date as YYYY-MM-DD in local timezone
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if two dates are the same day (local)
function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// Unique key for a day object
function dayKey(dayObj) {
  return `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
}

export default function DatePicker({ value, onChange, placeholder = 'Дата', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? parseLocalDate(value) : new Date());
  const [focusedDayKey, setFocusedDayKey] = useState(null);
  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  const selectedDate = parseLocalDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysCount = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Adjust: 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    
    // Previous month days
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({
        day: d,
        month: m,
        year: y,
        isPrevMonth: true,
        key: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }
    
    // Current month days
    for (let d = 1; d <= daysCount; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const key = formatLocalDate(date);
      days.push({
        day: d,
        month,
        year,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: selectedDate && isSameDay(date, selectedDate),
        isPast: date < today,
        key,
      });
    }
    
    // Next month days to fill grid (6 rows × 7 cols = 42)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({
        day: d,
        month: m,
        year: y,
        isNextMonth: true,
        key: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }
    
    return days;
  }, [viewDate, selectedDate]);

  const handleDayClick = useCallback((dayObj) => {
    if (dayObj.isPast && dayObj.isCurrentMonth) return;
    const date = new Date(dayObj.year, dayObj.month, dayObj.day);
    const iso = formatLocalDate(date);
    onChange(iso);
    
    // Update viewDate to selected month if different
    if (date.getMonth() !== viewDate.getMonth() || date.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setOpen(false);
  }, [onChange, viewDate]);

  const handleKeyDown = useCallback((e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    
    const currentIdx = focusedDayKey ? daysInMonth.findIndex(d => d.key === focusedDayKey) : -1;
    if (currentIdx === -1) return;
    
    let newIdx = currentIdx;
    if (e.key === 'ArrowLeft') { e.preventDefault(); newIdx = Math.max(0, currentIdx - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); newIdx = Math.min(daysInMonth.length - 1, currentIdx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); newIdx = Math.max(0, currentIdx - 7); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); newIdx = Math.min(daysInMonth.length - 1, currentIdx + 7); }
    else if (e.key === 'Enter') { handleDayClick(daysInMonth[currentIdx]); return; }
    else return;
    
    setFocusedDayKey(daysInMonth[newIdx].key);
  }, [open, focusedDayKey, daysInMonth, handleDayClick]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  // Sync focusedDayKey when viewDate changes or on open
  useEffect(() => {
    if (open) {
      // Focus on selected day or today or first valid day
      const selectedIdx = daysInMonth.findIndex(d => d.isSelected);
      const todayIdx = daysInMonth.findIndex(d => d.isToday && d.isCurrentMonth);
      const firstValidIdx = daysInMonth.findIndex(d => d.isCurrentMonth && !d.isPast);
      
      if (selectedIdx !== -1) setFocusedDayKey(daysInMonth[selectedIdx].key);
      else if (todayIdx !== -1) setFocusedDayKey(daysInMonth[todayIdx].key);
      else if (firstValidIdx !== -1) setFocusedDayKey(daysInMonth[firstValidIdx].key);
      else setFocusedDayKey(daysInMonth[0].key);
    }
  }, [open, viewDate, daysInMonth]);

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const formatDisplay = (dateStr) => {
    if (!dateStr) return placeholder;
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="relative" ref={inputRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); }}}
        className={`input h-12 flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={placeholder}
        disabled={disabled}
      >
        <span className={value ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}>
          {formatDisplay(value)}
        </span>
        <Calendar size={18} className="text-[var(--text-muted)] shrink-0 ml-2" />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-20 top-full left-0 mt-2 w-72 surface rounded-xl border border-[var(--border)] shadow-lg overflow-hidden scrollbar-thin"
            role="dialog"
            aria-label="Выберите дату"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-[var(--bg)] transition-colors"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft size={18} className="text-[var(--text)]" />
              </button>
              <span className="dot text-sm text-[var(--text)]">
                {MONTHS_RU[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-[var(--bg)] transition-colors"
                aria-label="Следующий месяц"
              >
                <ChevronRight size={18} className="text-[var(--text)]" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-0 p-2 text-center">
              {DAYS_RU.map((day, i) => (
                <div key={i} className="text-[10px] text-[var(--text-dim)] py-1 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-0 px-2 pb-2" role="grid" aria-label="Календарь">
              {daysInMonth.map((dayObj, i) => {
                const isFocused = dayObj.key === focusedDayKey;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDayClick(dayObj)}
                    onMouseEnter={() => setFocusedDayKey(dayObj.key)}
                    disabled={dayObj.isPast && dayObj.isCurrentMonth}
                    className={`relative h-9 w-full rounded-lg text-sm font-medium transition-all duration-150 ${
                      dayObj.isSelected
                        ? 'bg-[var(--accent)] text-white shadow-[0_0_0_2px_var(--accent)]'
                        : dayObj.isToday && !dayObj.isSelected
                          ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-elevated)] text-[var(--accent)] font-semibold'
                          : dayObj.isPrevMonth || dayObj.isNextMonth
                            ? 'text-[var(--text-dim)] hover:bg-[var(--bg)]'
                            : 'text-[var(--text)] hover:bg-[var(--bg)]'
                    } ${dayObj.isPast && dayObj.isCurrentMonth ? 'opacity-30 cursor-not-allowed' : ''}`}
                    tabIndex={isFocused ? 0 : -1}
                    aria-selected={dayObj.isSelected}
                    aria-current={dayObj.isToday ? 'date' : undefined}
                    aria-disabled={dayObj.isPast && dayObj.isCurrentMonth}
                    aria-label={`${dayObj.day} ${MONTHS_RU[dayObj.month]} ${dayObj.year}`}
                  >
                    {dayObj.day}
                    {dayObj.isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear button */}
            {value && (
              <div className="border-t border-[var(--border)] p-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
                  className="w-full btn btn-ghost text-xs py-2"
                >
                  <X size={14} className="mr-1" /> Очистить
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CITIES from '../cities';

export default function CityInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const norm = s => s.trim().toLowerCase().replace(/ё/g, 'е');
  const suggestions = Object.keys(CITIES).filter(c => norm(c).includes(norm(value)));

  useEffect(() => {
    const handleClickOutside = e => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          listRef.current && !listRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && suggestions.length > 0) {
      setHighlighted(0);
    } else {
      setHighlighted(-1);
    }
  }, [open, suggestions]);

  const handleKeyDown = e => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      onChange(suggestions[highlighted]);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={inputRef}>
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className="input h-12"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls="city-suggestions"
        aria-autocomplete="list"
      />
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            ref={listRef}
            id="city-suggestions"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-20 mt-1 w-full surface rounded-xl border border-[var(--border)] overflow-hidden shadow-lg max-h-56 overflow-auto scrollbar-thin"
            role="listbox"
          >
            {suggestions.map((c, i) => (
              <motion.li
                key={c}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <button
                  type="button"
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    i === highlighted
                      ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                      : 'hover:bg-[var(--bg)] text-[var(--text)]'
                  }`}
                  onMouseDown={() => { onChange(c); setOpen(false); }}
                  onMouseEnter={() => setHighlighted(i)}
                  role="option"
                  aria-selected={i === highlighted}
                >
                  {c}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
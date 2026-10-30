import { motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';

export default function Stepper({ value, onChange, min = 1, max = 10, step = 1, disabled = false, className = '', 'aria-label': ariaLabel }) {
  const handleDecrement = () => {
    if (disabled) return;
    const newVal = Math.max(min, value - step);
    onChange(newVal);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newVal = Math.min(max, value + step);
    onChange(newVal);
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className={`flex items-center gap-0 ${className}`} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || !canDecrement}
        className={`btn btn-secondary h-12 w-12 rounded-l-xl p-0 transition-all duration-150 ${
          !canDecrement ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]'
        }`}
        aria-label="Уменьшить"
        aria-disabled={disabled || !canDecrement}
      >
        <Minus size={18} className="mx-auto" />
      </button>

      <motion.div
        key={value}
        initial={{ opacity: 0, y: 4, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-12 h-12 flex items-center justify-center bg-[var(--bg)] border-y border-[var(--border)] text-[var(--text)] ndot text-xl font-medium"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </motion.div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || !canIncrement}
        className={`btn btn-secondary h-12 w-12 rounded-r-xl p-0 transition-all duration-150 ${
          !canIncrement ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]'
        }`}
        aria-label="Увеличить"
        aria-disabled={disabled || !canIncrement}
      >
        <Plus size={18} className="mx-auto" />
      </button>
    </div>
  );
}
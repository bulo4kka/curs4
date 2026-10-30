import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS = {
  success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e', icon: '#22c55e' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444', icon: '#ef4444' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', icon: '#f59e0b' },
  info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#3b82f6', icon: '#3b82f6' },
};

export default function Toast({ toast, onDismiss }) {
  const { type, message, action, duration } = toast;
  const Icon = ICONS[type];
  const colors = COLORS[type];
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!duration || duration <= 0) return;
    let start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const p = Math.max(0, 1 - elapsed / duration);
      setProgress(p);
      if (p > 0) requestAnimationFrame(animate);
      else onDismiss(toast.id);
    };
    requestAnimationFrame(animate);
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="relative flex items-start gap-3 w-full max-w-sm"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,0,0,0.05)',
        backdropFilter: 'blur(12px)',
      }}
      role="alert"
      aria-live="polite"
    >
      <div
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5"
        style={{ color: colors.icon }}
      >
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed" style={{ color: colors.text }}>
          {message}
        </p>
        {action && (
          <button
            onClick={() => { action.onClick(); onDismiss(toast.id); }}
            className="mt-2 text-xs font-medium underline hover:no-underline transition-opacity"
            style={{ color: colors.text, opacity: 0.9 }}
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/20 transition-colors"
        style={{ color: colors.text, opacity: 0.6 }}
        aria-label="Закрыть"
      >
        <X size={16} />
      </button>

      {duration && duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: '0 0 12px 12px',
            background: colors.icon,
            opacity: 0.6,
            transformOrigin: 'left center',
          }}
        />
      )}
    </motion.div>
  );
}
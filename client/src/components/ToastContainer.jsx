import { motion, AnimatePresence } from 'motion/react';
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import Toast from './Toast';

const TOAST_CONFIG = {
  gap: 10,
  padding: 20,
  maxWidth: 380,
  // Position: below header (header is ~64px + 4px border = 68px)
  // Add safe margin from top
  topOffset: 90,
  rightOffset: 20,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed pointer-events-none"
        style={{
          top: TOAST_CONFIG.topOffset,
          right: TOAST_CONFIG.rightOffset,
          zIndex: 9999, // Below header (header is z-50 = 50, but header has backdrop so 9999 is fine)
          display: 'flex',
          flexDirection: 'column',
          gap: TOAST_CONFIG.gap,
          padding: TOAST_CONFIG.padding,
          maxWidth: TOAST_CONFIG.maxWidth,
          pointerEvents: 'auto',
        }}
        role="region"
        aria-label="Уведомления"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Toast
              toast={toast}
              onDismiss={removeToast}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
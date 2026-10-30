import { motion } from 'motion/react';

export default function Section({ id, index, title, children, className = '', variant = 'default' }) {
  const variants = {
    default: {
      initial: { opacity: 0, y: 32 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-60px' },
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    subtle: {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true, margin: '-40px' },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    none: {
      initial: false,
      whileInView: false,
    },
  };

  const v = variants[variant] || variants.default;

  return (
    <motion.section
      id={id}
      {...v}
      className={`max-w-6xl mx-auto px-4 py-20 md:py-28 ${className}`}
    >
      <div className="dot text-[var(--accent)] text-sm mb-4">[ {index} ]</div>
      <h2 className="dot text-3xl md:text-5xl leading-tight mb-10">{title}</h2>
      {children}
    </motion.section>
  );
}
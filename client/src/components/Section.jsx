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
      className={`site-section max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-28 ${className}`}
    >
      <div className="section-kicker"><span>{index.split('//')[0].trim()}</span>{index.split('//').slice(1).join('//').trim()}</div>
      <h2 className="section-title">{title}</h2>
      {children}
    </motion.section>
  );
}

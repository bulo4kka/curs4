import { motion } from 'framer-motion';

export default function Section({ id, index, title, children, className = '' }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-6xl mx-auto px-4 py-24 md:py-32 ${className}`}
    >
      <div className="font-dot text-led text-sm mb-4">[ {index} ]</div>
      <h2 className="font-dot text-4xl md:text-6xl leading-tight mb-10">{title}</h2>
      {children}
    </motion.section>
  );
}

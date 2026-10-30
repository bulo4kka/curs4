import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Star, MapPin } from 'lucide-react';

export default function TripCard({ t }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="surface rounded-xl p-4 transition-colors hover:border-[var(--border-hover)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="dot text-base truncate">{t.origin} → {t.destination}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <MapPin size={10} /> {(t.intermediate_stops || []).join(', ') || 'прямой рейс'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="ndot text-xl text-[var(--accent)]">
            {t.price}<span className="text-xs text-[var(--text-muted)]"> BYN</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 justify-end">
            <Users size={10} /> {t.seats_available}/{t.seats_total}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{new Date(t.departure_time).toLocaleString('ru-RU')}</span>
        <span>{t.driver_name} · <Star size={10} className="inline text-[var(--accent)]" /> {t.driver_rating}</span>
      </div>
      <Link
        to={`/trip/${t.id}`}
        className="block mt-3 text-center border border-[var(--border)] text-[var(--text-muted)] rounded-lg py-1.5 text-sm transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent-muted)]/20"
      >
        Подробнее
      </Link>
    </motion.article>
  );
}
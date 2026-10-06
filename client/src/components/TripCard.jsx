import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Star, MapPin } from 'lucide-react';

export default function TripCard({ t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-dot text-lg">{t.origin} → {t.destination}</h3>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {(t.intermediate_stops || []).join(', ') || 'прямой рейс'}</p>
        </div>
        <div className="text-right">
          <div className="font-dot text-2xl text-led">{t.price}<span className="text-xs text-gray-400"> BYN</span></div>
          <div className="text-xs text-gray-400 flex items-center gap-1 justify-end"><Users size={12} /> {t.seats_available}/{t.seats_total}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{new Date(t.departure_time).toLocaleString('ru-RU')}</span>
        <span>{t.driver_name} · <Star size={10} className="inline" /> {t.driver_rating}</span>
      </div>
      <Link to={`/trip/${t.id}`} className="block mt-3 text-center border border-led/60 text-led rounded-lg py-1.5 text-sm hover:bg-led/10">Подробнее</Link>
    </motion.div>
  );
}

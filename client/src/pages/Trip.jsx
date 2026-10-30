import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import { Star, MapPin, Users, Car, Calendar, Clock } from 'lucide-react';

export default function Trip() {
  const { id } = useParams();
  const { user } = useAuth();
  const [t, setT] = useState(null);
  const [seats, setSeats] = useState(1);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');

  useEffect(() => {
    api(`/trips/${id}`).then(setT);
  }, [id]);

  if (!t) return <div className="p-8 text-center text-[var(--text-muted)]">Загрузка…</div>;

  const book = async () => {
    setMsg('');
    setMsgType('info');
    if (!user) return setMsg('Войдите или выберите аккаунт'), setMsgType('error');
    try {
      await api(`/trips/${id}/book`, { method: 'POST', body: { passenger_id: user.id, seats_booked: seats } });
      setMsg('Бронирование успешно!');
      setMsgType('success');
      api(`/trips/${id}`).then(setT);
    } catch (e) {
      setMsg(e.message);
      setMsgType('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="dot text-2xl md:text-3xl"
      >
        {t.origin} → {t.destination}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface rounded-xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
              <Star size={18} />
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] tracking-wider">Водитель</div>
              <div className="font-medium text-[var(--text)]">{t.driver_name}</div>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[var(--accent)]">
              <Star size={14} /> {t.driver_rating}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] tracking-wider">Выезд</div>
              <div className="font-medium text-[var(--text)]">{new Date(t.departure_time).toLocaleString('ru-RU')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] tracking-wider">Места</div>
              <div className="font-medium text-[var(--text)]">{t.seats_available}/{t.seats_total} свободно</div>
            </div>
            {t.seats_available <= 2 && (
              <span className="ml-auto badge badge-warning">ОСТАЛОСЬ МАЛО</span>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
              <Car size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[var(--text-dim)] tracking-wider">Авто</div>
              <div className="font-medium text-[var(--text)] truncate">{t.make} {t.model} ({t.color}) {t.plate_number}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <div>
              <div className="text-[10px] text-[var(--text-dim)] tracking-wider">Цена за место</div>
              <div className="ndot text-3xl text-[var(--accent)]">{t.price} BYN</div>
            </div>
          </div>

          {t.features && t.features.length > 0 && (
            <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-dim)] tracking-wider mb-2">ОСОБЕННОСТИ</div>
              <div className="flex flex-wrap gap-2">
                {['animals', 'big_trunk', 'quiet_driver'].map(f => t.features.includes(f) && (
                  <span key={f} className="chip chip-active">
                    {f === 'animals' && '🐾'} {f === 'animals' ? 'Животные' : f === 'big_trunk' ? 'Большой багаж' : 'Тихий водитель'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {t.intermediate_stops && t.intermediate_stops.length > 0 && (
            <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-dim)] tracking-wider mb-2">ПРОМЕЖУТОЧНЫЕ ОСТАНОВКИ</div>
              <div className="flex flex-wrap gap-2">
                {t.intermediate_stops.map((stop, i) => (
                  <span key={i} className="badge badge-neutral">
                    <MapPin size={10} /> {stop}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="surface rounded-xl overflow-hidden"
      >
        <MapView origin={t.origin} destination={t.destination} stops={t.intermediate_stops || []} height={320} />
      </motion.div>

      {t.status === 'ACTIVE' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="surface rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
          >
            <div className="flex items-center gap-3">
              <label className="ndot text-[10px] text-[var(--text-dim)] shrink-0">Места:</label>
              <input
                type="number"
                min="1"
                max={t.seats_available}
                value={seats}
                onChange={e => setSeats(Math.min(Math.max(1, Number(e.target.value)), t.seats_available))}
                className="input input-sm w-20"
              />
            </div>
            <button
              onClick={book}
              disabled={msgType === 'success'}
              className="btn btn-primary px-6"
            >
              {msgType === 'success' ? 'ЗАБРОНИРОВАНО' : 'ЗАБРОНИРОВАТЬ'}
            </button>
            <AnimatePresence mode="wait">
              {msg && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`text-sm ${
                    msgType === 'error' ? 'text-[var(--accent)]' :
                    msgType === 'success' ? 'text-[var(--success)]' :
                    'text-[var(--text-muted)]'
                  }`}
                >
                  {msg}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}

      <ReportBox tripId={t.id} />
    </div>
  );
}

function ReportBox({ tripId }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="surface rounded-xl p-4"
    >
      <h3 className="dot mb-3">Жалоба на поездку</h3>
      <div className="flex gap-2">
        <input
          placeholder="Причина жалобы"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="input flex-1"
          disabled={sent}
        />
        <button
          className="btn btn-secondary px-4"
          onClick={async () => {
            if (!reason.trim()) return;
            setSending(true);
            await api('/reports', { method: 'POST', body: { reporter_id: user.id, target_trip_id: tripId, reason } });
            setSent(true);
            setReason('');
            setSending(false);
          }}
          disabled={!reason.trim() || sent || sending}
        >
          {sending ? '...' : sent ? 'ОТПРАВЛЕНО' : 'ОТПРАВИТЬ'}
        </button>
      </div>
      <AnimatePresence>
        {sent && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="text-xs text-[var(--success)] mt-1"
          >
            Жалоба отправлена в поддержку.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import CITIES from '../cities';
import { Car, MapPin, Calculator, ArrowRight, Loader2 } from 'lucide-react';

const FUEL_PRICE = 2.4; // BYN за литр

export default function CreateTrip() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    origin: 'Минск',
    destination: 'Брест',
    departure_time: '',
    price: 30,
    seats_total: 4,
    vehicle_id: '',
    distance: 350,
    consumption: 8,
  });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) api(`/vehicles/${user.id}`).then(v => { setVehicles(v); if (v[0]) setForm(f => ({ ...f, vehicle_id: v[0].id })); });
  }, [user]);

  if (!user) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-shell max-w-2xl mx-auto p-8 text-center">
      <div className="surface rounded-xl p-12">
        <Car size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h1 className="dot text-2xl mb-2">Войдите как водитель</h1>
        <p className="text-[var(--text-muted)]">Для создания поездки нужно авторизоваться.</p>
      </div>
    </motion.div>
  );

  const fuelCost = ((form.distance * form.consumption) / 100 * FUEL_PRICE).toFixed(1);
  const suggestPrice = Math.ceil(fuelCost / Math.max(1, form.seats_total - 1) + 5);

  const submit = async e => {
    e.preventDefault(); setMsg(''); setMsgType('info'); setLoading(true);
    try {
      await api('/trips', { method: 'POST', body: { driver_id: user.id, vehicle_id: form.vehicle_id, origin: form.origin, destination: form.destination, departure_time: form.departure_time, price: Number(form.price), seats_total: Number(form.seats_total), features: [] } });
      setMsg('Поездка успешно создана!');
      setMsgType('success');
      setTimeout(() => nav('/'), 1000);
    } catch (e) { setMsg(e.message); setMsgType('error'); }
    finally { setLoading(false); }
  };

  const cityOptions = Object.keys(CITIES).map(c => <option key={c} value={c}>{c}</option>);

  return (
    <div className="create-trip-page page-shell max-w-3xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-heading mb-6">
        <span className="section-kicker">МАРШРУТ // НОВАЯ ПОЕЗДКА</span>
        <h1 className="page-title mt-3">Запланируйте поездку</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Укажите маршрут и условия, чтобы пассажиры могли присоединиться.</p>
      </motion.div>

      <form onSubmit={submit} className="surface create-trip-form rounded-2xl p-5 sm:p-7 space-y-6">
        {/* Route */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">
          <h3 className="dot text-sm text-[var(--text-muted)] tracking-wider">МАРШРУТ</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="label">ОТКУДА</label>
              <select value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} className="input">{cityOptions}</select>
            </div>
            <ArrowRight size={20} className="text-[var(--text-dim)] shrink-0 mx-1" />
            <div className="flex-1">
              <label className="label">КУДА</label>
              <select value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} className="input">{cityOptions}</select>
            </div>
          </div>
        </motion.div>

        {/* DateTime */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
          <label className="label flex items-center gap-2"><MapPin size={14} /> ВРЕМЯ ВЫЕЗДА</label>
          <input type="datetime-local" value={form.departure_time} onChange={e => setForm({ ...form, departure_time: e.target.value })} className="input" required />
        </motion.div>

        {/* Vehicle */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
          <label className="label flex items-center gap-2"><Car size={14} /> АВТОМОБИЛЬ</label>
          <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: Number(e.target.value) })} className="input" required>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} · {v.plate_number} ({v.seats} мест)</option>)}
          </select>
        </motion.div>

        {/* Distance & Consumption */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h3 className="dot text-sm text-[var(--text-muted)] tracking-wider">РАСЧЁТ ТОПЛИВА</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="label">РАССТОЯНИЕ (КМ)</label>
              <input type="number" placeholder="Расстояние, км" value={form.distance} onChange={e => setForm({ ...form, distance: Number(e.target.value) })} className="input" min="1" max="2000" required />
            </div>
            <div className="space-y-2">
              <label className="label">РАСХОД (Л/100КМ)</label>
              <input type="number" step="0.1" placeholder="Расход, л/100км" value={form.consumption} onChange={e => setForm({ ...form, consumption: Number(e.target.value) })} className="input" min="1" max="30" required />
            </div>
          </div>

          <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <Calculator size={18} className="text-[var(--accent)]" />
              <span className="ndot text-sm text-[var(--accent)]">ТОПЛИВО: ~{fuelCost} BYN</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Рекомендуемая цена за место:</span>
              <span className="ndot text-[var(--accent)]">{suggestPrice} BYN</span>
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2">Расчёт: (расстояние × расход / 100 × {FUEL_PRICE} BYN) / (мест - 1) + 5 BYN сервисный сбор</p>
          </div>
        </motion.div>

        {/* Price & Seats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4 pt-4 border-t border-[var(--border)]">
          <h3 className="dot text-sm text-[var(--text-muted)] tracking-wider">ЦЕНА И МЕСТА</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="label">ЦЕНА (BYN)</label>
              <input type="number" placeholder="Цена, BYN" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input" min="1" max="500" required />
            </div>
            <div className="space-y-2">
              <label className="label">МЕСТ</label>
              <input type="number" placeholder="Мест" value={form.seats_total} onChange={e => setForm({ ...form, seats_total: Number(e.target.value) })} className="input" min="2" max="8" required />
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4 border-t border-[var(--border)]">
          <AnimatePresence mode="wait">
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  msgType === 'error' ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/30' :
                  msgType === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {msgType === 'success' ? <Loader2 size={16} className="animate-spin" /> : null}
                {msg}
              </motion.div>
            )}
          </AnimatePresence>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> СОЗДАНИЕ...</> : 'СОЗДАТЬ ПОЕЗДКУ'}
          </button>
        </motion.div>
      </form>
    </div>
  );
}

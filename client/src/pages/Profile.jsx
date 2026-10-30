import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Car, Star, History, CreditCard, Settings, Plus, Trash2, MessageCircle, MapPin, Clock, DollarSign, Mail, Phone, Shield, Loader2, Check, X, BarChart2, MapPin as MapPinIcon } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [p, setP] = useState(null);
  const [veh, setVeh] = useState({ make: '', model: '', color: '', plate_number: '', seats: 4 });
  const [amount, setAmount] = useState(10);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [activeTab, setActiveTab] = useState('overview');

  const load = () => { if (user) api(`/users/${user.id}`).then(setP).catch(() => setP(null)); };
  useEffect(() => { load(); }, [user]);
  if (!user) return <div className="p-8 text-center text-[var(--text-muted)]">Войдите или выберите аккаунт в шапке.</div>;
  if (!p) return <div className="p-8 text-center text-[var(--text-muted)]">Загрузка…</div>;

  const cancelRental = async id => { await api(`/rentals/${id}/cancel`, { method: 'POST' }); load(); };
  const addVehicle = async e => {
    e.preventDefault();
    await api('/vehicles', { method: 'POST', body: { ...veh, driver_id: user.id } });
    load(); setVeh({ make: '', model: '', color: '', plate_number: '', seats: 4 });
  };
  const addBalance = async () => { await api(`/users/${user.id}/balance`, { method: 'POST', body: { amount } }); load(); };
  const sendAppReview = async () => {
    await api('/reviews', { method: 'POST', body: { author_id: user.id, rating: review.rating, comment: review.comment, type: 'APP_REVIEW' } });
    setReview({ rating: 5, comment: '' }); alert('Спасибо за отзыв!');
  };

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: <Settings size={16} /> },
    { id: 'trips', label: 'Поездки', icon: <History size={16} /> },
    { id: 'wallet', label: 'Кошелёк', icon: <CreditCard size={16} /> },
    { id: 'reviews', label: 'Отзывы', icon: <Star size={16} /> },
  ];

  if (p.role === 'DRIVER') tabs.splice(2, 0, { id: 'vehicles', label: 'Авто', icon: <Car size={16} /> });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4"
      >
        <div className="avatar avatar-lg shrink-0">
          {(p.full_name || '?')[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="dot text-2xl md:text-3xl truncate">{p.full_name}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 flex flex-wrap gap-4">
            <span>{p.email}</span>
            <span>{p.phone}</span>
            <span className="badge badge-neutral">{p.role}</span>
          </p>
        </div>
        <div className="md:ml-auto text-right md:text-left">
          <div className="dot text-xl">★ {p.rating}</div>
          <div className="ndot text-2xl text-[var(--accent)] mt-1">{p.balance?.toFixed(1)} BYN</div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface rounded-xl p-1 flex flex-wrap gap-1"
        role="tablist"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </motion.nav>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'overview' && <OverviewTab p={p} />}
          {activeTab === 'wallet' && <WalletTab p={p} amount={amount} setAmount={setAmount} addBalance={addBalance} />}
          {activeTab === 'vehicles' && <VehiclesTab p={p} veh={veh} setVeh={setVeh} addVehicle={addVehicle} />}
          {activeTab === 'trips' && <TripsTab p={p} cancelRental={cancelRental} />}
          {activeTab === 'reviews' && <ReviewsTab p={p} review={review} setReview={setReview} sendAppReview={sendAppReview} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ p }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="surface rounded-xl p-4 space-y-4"
    >
      <h2 className="dot text-lg">Информация</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
          <Mail className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text)]">{p.email}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
          <Phone className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text)]">{p.phone}</span>
        </div>
      </div>
    </motion.div>
  );
}

function WalletTab({ p, amount, setAmount, addBalance }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="surface rounded-xl p-4 space-y-4"
    >
      <h2 className="dot text-lg">Кошелёк (mock)</h2>
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="input w-28"
          min="1"
          max="10000"
        />
        <button onClick={addBalance} className="btn btn-primary">Пополнить BYN</button>
      </div>
      <p className="text-xs text-[var(--text-dim)]">Текущий баланс: <span className="text-[var(--accent)] font-medium">{p.balance?.toFixed(1)} BYN</span></p>
    </motion.div>
  );
}

function VehiclesTab({ p, veh, setVeh, addVehicle }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="surface rounded-xl p-4 space-y-4"
    >
      <h2 className="dot text-lg">Мои авто</h2>
      {p.vehicles.length > 0 && (
        <div className="space-y-2">
          {p.vehicles.map(v => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
                <Car size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--text)] truncate">{v.make} {v.model}</div>
                <div className="text-sm text-[var(--text-muted)]">{v.color}, {v.plate_number}, мест: {v.seats}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <form onSubmit={addVehicle} className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-2">
        <input placeholder="Марка" value={veh.make} onChange={e => setVeh({ ...veh, make: e.target.value })} className="input sm:col-span-2" required />
        <input placeholder="Модель" value={veh.model} onChange={e => setVeh({ ...veh, model: e.target.value })} className="input sm:col-span-2" required />
        <input placeholder="Цвет" value={veh.color} onChange={e => setVeh({ ...veh, color: e.target.value })} className="input" required />
        <input placeholder="Номер" value={veh.plate_number} onChange={e => setVeh({ ...veh, plate_number: e.target.value })} className="input" required />
        <input type="number" placeholder="Мест" value={veh.seats} onChange={e => setVeh({ ...veh, seats: Number(e.target.value) })} className="input" min="1" max="8" required />
        <button type="submit" className="btn btn-primary sm:col-span-1"><Plus size={16} /> Добавить</button>
      </form>
    </motion.div>
  );
}

function TripsTab({ p, cancelRental }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="surface rounded-xl p-4 space-y-4"
    >
      <h2 className="dot text-lg">Моя активная аренда</h2>
      {p.activeRentals.length === 0 ? (
        <p className="text-[var(--text-muted)] text-center py-8">Нет активных броней.</p>
      ) : (
        <AnimatePresence>
          {p.activeRentals.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
                <MapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--text)] truncate">{r.origin} → {r.destination}</div>
                <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                  <span><Clock size={12} /> {new Date(r.departure_time).toLocaleString('ru-RU')}</span>
                  <span><DollarSign size={12} /> {r.total_price} BYN</span>
                </div>
              </div>
              <Link to={`/trip/${r.trip_ref}`} className="btn btn-secondary text-sm px-3">Поездка</Link>
              <Link to="/chats" className="btn btn-ghost text-sm px-3"><MessageCircle size={14} /> Чат</Link>
              <button onClick={() => cancelRental(r.id)} className="btn btn-ghost text-sm px-3 text-[var(--accent)] hover:bg-[var(--accent-muted)]"><Trash2 size={14} /> Отменить</button>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      <div className="pt-4 border-t border-[var(--border)]">
        <h2 className="dot text-lg mb-3">История поездок</h2>
        {(p.tripHistory.length === 0 && p.drivenTrips.length === 0) ? (
          <p className="text-[var(--text-muted)] text-center py-8">История пуста.</p>
        ) : (
          <div className="space-y-2">
            {p.tripHistory.map(r => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]"
              >
                <span className="badge badge-neutral">{r.status}</span>
                <span className="text-sm text-[var(--text)]">{r.origin} → {r.destination}</span>
              </motion.div>
            ))}
            {p.drivenTrips.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]"
              >
                <Car size={16} className="text-[var(--accent)]" />
                <span className="text-sm text-[var(--text)]">{t.origin} → {t.destination}</span>
                <span className="badge badge-neutral">{t.status}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ReviewsTab({ p, review, setReview, sendAppReview }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="surface rounded-xl p-4 space-y-4"
    >
      <h2 className="dot text-lg">Отзывы обо мне</h2>
      {p.reviews.length > 0 ? (
        <AnimatePresence>
          {p.reviews.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]"
            >
              <div className="flex items-center gap-2 mb-1">
                <b className="text-[var(--text)]">{r.author_name}</b>
                <span className="text-[var(--accent)]">{'★'.repeat(r.rating)}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{r.comment}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <p className="text-[var(--text-muted)] text-center py-8">Пока нет отзывов.</p>
      )}

      <div className="pt-4 border-t border-[var(--border)]">
        <h2 className="dot text-lg mb-3">Отзыв о приложении</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={review.rating}
            onChange={e => setReview({ ...review, rating: Number(e.target.value) })}
            className="input w-24"
          >
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}★</option>)}
          </select>
          <input
            placeholder="Ваш отзыв"
            value={review.comment}
            onChange={e => setReview({ ...review, comment: e.target.value })}
            className="input flex-1 min-w-[200px]"
          />
          <button onClick={sendAppReview} className="btn btn-secondary">OK</button>
        </div>
      </div>
    </motion.div>
  );
}
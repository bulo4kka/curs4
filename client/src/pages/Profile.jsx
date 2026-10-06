import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login } = useAuth();
  const [p, setP] = useState(null);
  const [veh, setVeh] = useState({ make: '', model: '', color: '', plate_number: '', seats: 4 });
  const [amount, setAmount] = useState(10);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const load = () => { if (user) api(`/users/${user.id}`).then(setP).catch(() => setP(null)); };
  useEffect(() => { load(); }, [user]);
  if (!user) return <div className="p-8">Войдите или выберите аккаунт в шапке.</div>;
  if (!p) return <div className="p-8">Загрузка…</div>;

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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="font-dot text-2xl">{p.full_name}</h1>
          <p className="text-sm text-gray-400">{p.email} · {p.phone} · {p.role}</p>
        </div>
        <div className="ml-auto text-right">
          <div className="font-dot text-xl">★ {p.rating}</div>
          <div className="font-dot text-led">{p.balance?.toFixed(1)} BYN</div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h2 className="font-dot mb-2">Кошелёк (mock)</h2>
        <div className="flex gap-2">
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="!w-28" />
          <button onClick={addBalance} className="border border-white/20 rounded px-3 text-sm">+ Пополнить BYN</button>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h2 className="font-dot mb-2">Моя активная аренда</h2>
        {p.activeRentals.length === 0 && <p className="text-gray-500 text-sm">Нет активных броней.</p>}
        {p.activeRentals.map(r => (
          <div key={r.id} className="flex items-center gap-3 border-b border-white/5 py-2 text-sm">
            <span className="font-dot">{r.origin} → {r.destination}</span>
            <span className="text-gray-400">{new Date(r.departure_time).toLocaleString('ru-RU')} · {r.total_price} BYN</span>
            <Link to={`/trip/${r.trip_ref}`} className="text-led">Поездка</Link>
            <Link to="/chats" className="text-gray-300 underline">Чат</Link>
            <button onClick={() => cancelRental(r.id)} className="ml-auto text-led text-xs">Отменить</button>
          </div>
        ))}
      </div>

      {p.role === 'DRIVER' && (
        <div className="glass rounded-xl p-4">
          <h2 className="font-dot mb-2">Мои авто</h2>
          {p.vehicles.map(v => <div key={v.id} className="text-sm border-b border-white/5 py-1">{v.make} {v.model}, {v.color}, {v.plate_number}, мест: {v.seats}</div>)}
          <form onSubmit={addVehicle} className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-2">
            <input placeholder="Марка" value={veh.make} onChange={e => setVeh({ ...veh, make: e.target.value })} required />
            <input placeholder="Модель" value={veh.model} onChange={e => setVeh({ ...veh, model: e.target.value })} required />
            <input placeholder="Цвет" value={veh.color} onChange={e => setVeh({ ...veh, color: e.target.value })} required />
            <input placeholder="Номер" value={veh.plate_number} onChange={e => setVeh({ ...veh, plate_number: e.target.value })} required />
            <input type="number" placeholder="Мест" value={veh.seats} onChange={e => setVeh({ ...veh, seats: Number(e.target.value) })} />
            <button className="border border-white/20 rounded">Добавить</button>
          </form>
        </div>
      )}

      <div className="glass rounded-xl p-4">
        <h2 className="font-dot mb-2">История поездок</h2>
        {p.tripHistory.map(r => <div key={r.id} className="text-sm text-gray-400">{r.origin} → {r.destination} · {r.status}</div>)}
        {p.drivenTrips.map(t => <div key={t.id} className="text-sm text-gray-300">🚐 {t.origin} → {t.destination} · {t.status}</div>)}
      </div>

      <div className="glass rounded-xl p-4">
        <h2 className="font-dot mb-2">Отзывы обо мне</h2>
        {p.reviews.map(r => <div key={r.id} className="text-sm border-b border-white/5 py-1"><b>{r.author_name}</b>: {'★'.repeat(r.rating)} — {r.comment}</div>)}
        {p.reviews.length === 0 && <p className="text-gray-500 text-sm">Пока нет отзывов.</p>}
      </div>

      <div className="glass rounded-xl p-4">
        <h2 className="font-dot mb-2">Отзыв о приложении</h2>
        <div className="flex gap-2">
          <select value={review.rating} onChange={e => setReview({ ...review, rating: Number(e.target.value) })} className="!w-24">
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}★</option>)}
          </select>
          <input placeholder="Ваш отзыв" value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} />
          <button onClick={sendAppReview} className="border border-led text-led rounded px-3">OK</button>
        </div>
      </div>
    </div>
  );
}

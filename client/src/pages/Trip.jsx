import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import { Star } from 'lucide-react';

export default function Trip() {
  const { id } = useParams();
  const { user } = useAuth();
  const [t, setT] = useState(null);
  const [seats, setSeats] = useState(1);
  const [msg, setMsg] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api(`/trips/${id}`).then(setT);
    api('/reviews/app').then(setReviews).catch(() => {});
  }, [id]);

  if (!t) return <div className="p-8">Загрузка…</div>;
  const book = async () => {
    setMsg('');
    if (!user) return setMsg('Войдите или выберите аккаунт');
    try {
      await api(`/trips/${id}/book`, { method: 'POST', body: { passenger_id: user.id, seats_booked: seats } });
      setMsg('Бронирование успешно!');
      api(`/trips/${id}`).then(setT);
    } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="font-dot text-2xl">{t.origin} → {t.destination}</h1>
      <div className="glass rounded-xl p-4 grid grid-cols-2 gap-2 text-sm">
        <div>Водитель: <b>{t.driver_name}</b></div>
        <div>Рейтинг: <Star size={12} className="inline" /> {t.driver_rating}</div>
        <div>Выезд: {new Date(t.departure_time).toLocaleString('ru-RU')}</div>
        <div>Места: {t.seats_available}/{t.seats_total}</div>
        <div>Авто: {t.make} {t.model} ({t.color}) {t.plate_number}</div>
        <div>Цена: <span className="text-led font-dot">{t.price} BYN</span></div>
        <div className="col-span-2">Особенности: {(t.features || []).join(', ') || '—'}</div>
      </div>
      <MapView origin={t.origin} destination={t.destination} stops={t.intermediate_stops || []} height={320} />
      {t.status === 'ACTIVE' && (
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <input type="number" min="1" max={t.seats_available} value={seats} onChange={e => setSeats(Number(e.target.value))} className="!w-20" />
          <button onClick={book} className="bg-led hover:bg-led2 rounded-lg px-6 py-2 font-dot">ЗАБРОНИРОВАТЬ</button>
          {msg && <span className="text-sm text-gray-300">{msg}</span>}
        </div>
      )}
      <ReportBox tripId={t.id} />
    </div>
  );
}

function ReportBox({ tripId }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);
  if (!user) return null;
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-dot mb-2">Жалоба на поездку</h3>
      <div className="flex gap-2">
        <input placeholder="Причина жалобы" value={reason} onChange={e => setReason(e.target.value)} />
        <button className="border border-led text-led rounded px-3" onClick={async () => {
          await api('/reports', { method: 'POST', body: { reporter_id: user.id, target_trip_id: tripId, reason } });
          setSent(true); setReason('');
        }}>Отправить</button>
      </div>
      {sent && <p className="text-xs text-gray-400 mt-1">Жалоба отправлена в поддержку.</p>}
    </div>
  );
}

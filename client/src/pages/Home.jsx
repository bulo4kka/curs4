import { useEffect, useState } from 'react';
import { api } from '../api';
import TripCard from '../components/TripCard';

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const load = () => {
    const q = new URLSearchParams();
    if (origin) q.set('origin', origin);
    if (destination) q.set('destination', destination);
    if (date) q.set('date', date);
    api('/trips?' + q).then(setTrips).catch(() => setTrips([]));
  };
  useEffect(load, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="font-dot text-3xl mb-1">Поездки по Беларуси</h1>
      <p className="text-gray-400 text-sm mb-4">Делитесь дорогой — попутчики и водители рядом. <span className="text-led">BYN</span></p>
      <div className="glass rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-2 mb-6">
        <input placeholder="Откуда (Минск)" value={origin} onChange={e => setOrigin(e.target.value)} />
        <input placeholder="Куда (Брест)" value={destination} onChange={e => setDestination(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={load} className="bg-led hover:bg-led2 rounded-lg px-4 py-2 font-dot">НАЙТИ</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trips.map(t => <TripCard key={t.id} t={t} />)}
        {trips.length === 0 && <p className="text-gray-500">Нет активных поездок по запросу.</p>}
      </div>
    </div>
  );
}

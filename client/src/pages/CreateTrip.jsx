import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import CITIES from '../cities';

const FUEL_PRICE = 2.4; // BYN за литр
export default function CreateTrip() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ origin: 'Минск', destination: 'Брест', departure_time: '', price: 30, seats_total: 4, vehicle_id: '', distance: 350, consumption: 8 });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) api(`/vehicles/${user.id}`).then(v => { setVehicles(v); if (v[0]) setForm(f => ({ ...f, vehicle_id: v[0].id })); });
  }, [user]);

  if (!user) return <div className="p-8">Войдите как водитель.</div>;
  const fuelCost = ((form.distance * form.consumption) / 100 * FUEL_PRICE).toFixed(1);
  const suggestPrice = Math.ceil(fuelCost / Math.max(1, form.seats_total - 1) + 5);

  const submit = async e => {
    e.preventDefault(); setMsg('');
    try {
      await api('/trips', { method: 'POST', body: { driver_id: user.id, vehicle_id: form.vehicle_id, origin: form.origin, destination: form.destination, departure_time: form.departure_time, price: Number(form.price), seats_total: Number(form.seats_total), features: [] } });
      nav('/');
    } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="font-dot text-2xl mb-4">Новая поездка</h1>
      <form onSubmit={submit} className="glass rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })}>{Object.keys(CITIES).map(c => <option key={c}>{c}</option>)}</select>
          <select value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}>{Object.keys(CITIES).map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <input type="datetime-local" value={form.departure_time} onChange={e => setForm({ ...form, departure_time: e.target.value })} required />
        <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: Number(e.target.value) })}>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} · {v.plate_number}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Расстояние, км" value={form.distance} onChange={e => setForm({ ...form, distance: Number(e.target.value) })} />
          <input type="number" placeholder="Расход, л/100км" value={form.consumption} onChange={e => setForm({ ...form, consumption: Number(e.target.value) })} />
        </div>
        <div className="border border-led/40 rounded-lg p-3 text-sm">
          <span className="font-dot text-led">ТОПЛИВО: ~{fuelCost} BYN</span>
          <span className="text-gray-400 ml-2">рекомендуемая цена места: ~{suggestPrice} BYN</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Цена, BYN" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
          <input type="number" placeholder="Мест" value={form.seats_total} onChange={e => setForm({ ...form, seats_total: Number(e.target.value) })} />
        </div>
        <button className="bg-led hover:bg-led2 rounded-lg px-6 py-2 font-dot w-full">СОЗДАТЬ ПОЕЗДКУ</button>
        {msg && <p className="text-led text-sm">{msg}</p>}
      </form>
    </div>
  );
}

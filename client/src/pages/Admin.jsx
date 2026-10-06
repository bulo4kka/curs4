import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [reports, setReports] = useState([]);
  const [chats, setChats] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editTrip, setEditTrip] = useState(null);

  const load = () => {
    api('/admin/stats').then(setStats);
    api('/admin/users').then(setUsers);
    api('/admin/trips').then(setTrips);
    api('/reports').then(setReports);
    api('/chats/all/admin').then(setChats).catch(() => setChats([]));
  };
  useEffect(load, []);
  if (!user || user.role !== 'ADMIN') return <div className="p-8 text-led">Доступ только для ADMIN.</div>;

  const saveUser = async () => { await api(`/admin/users/${editUser.id}`, { method: 'PUT', body: editUser }); setEditUser(null); load(); };
  const delUser = async id => { await api(`/admin/users/${id}`, { method: 'DELETE' }); load(); };
  const blockUser = async id => { await api('/reports/block-user', { method: 'POST', body: { user_id: id } }); load(); };
  const saveTrip = async () => {
    await api(`/trips/${editTrip.id}`, { method: 'PUT', body: { origin: editTrip.origin, destination: editTrip.destination, price: Number(editTrip.price), seats_available: Number(editTrip.seats_available), status: editTrip.status } });
    setEditTrip(null); load();
  };
  const resolve = async id => { await api(`/reports/${id}/resolve`, { method: 'POST' }); load(); };
  const delTrip = async id => { await api(`/trips/${id}`, { method: 'DELETE' }); load(); };
  const delChat = async id => { await api(`/chats/${id}`, { method: 'DELETE' }); load(); };
  const createChat = async () => {
    const tripId = prompt('ID поездки для чата:');
    if (!tripId) return;
    const ids = prompt('ID участников через запятую:');
    await api('/chats', { method: 'POST', body: { trip_id: Number(tripId), participant_ids: (ids || '').split(',').map(Number).filter(Boolean) } });
    load();
  };
  const createTrip = async () => {
    const driverId = prompt('ID водителя:'); if (!driverId) return;
    await api('/trips', { method: 'POST', body: { driver_id: Number(driverId), origin: 'Минск', destination: 'Гродно', departure_time: new Date(Date.now() + 86400000).toISOString(), price: 25, seats_total: 4, features: [] } });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="font-dot text-2xl mb-4 text-led">ADMIN // GOD MODE</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['stats', 'users', 'trips', 'reports', 'chats'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded border ${tab === t ? 'border-led text-led' : 'border-white/10'}`}>{t}</button>
        ))}
        <button onClick={createTrip} className="ml-auto border border-led/50 text-led rounded px-3 py-1 text-xs">+ ТРЕК</button>
        <button onClick={createChat} className="border border-led/50 text-led rounded px-3 py-1 text-xs">+ ЧАТ</button>
      </div>

      {tab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="glass rounded-xl p-4 text-center">
              <div className="font-dot text-3xl text-led">{v}</div>
              <div className="text-xs text-gray-400">{k}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="glass rounded-xl p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-left"><th>ID</th><th>Имя</th><th>Email</th><th>Роль</th><th>Рейт.</th><th>BYN</th><th>Блок</th><th></th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} className="border-t border-white/5">
                <td>{u.id}</td><td>{u.full_name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.rating}</td><td>{u.balance}</td><td>{u.is_blocked ? '⛔' : ''}</td>
                <td className="space-x-2">
                  <button className="text-gray-300" onClick={() => setEditUser({ ...u })}>edit</button>
                  <button className="text-led" onClick={() => delUser(u.id)}>del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {editUser && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <input value={editUser.full_name} onChange={e => setEditUser({ ...editUser, full_name: e.target.value })} />
              <input value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
              <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                <option>CLIENT</option><option>DRIVER</option><option>ADMIN</option>
              </select>
              <select value={editUser.is_blocked ? 1 : 0} onChange={e => setEditUser({ ...editUser, is_blocked: Number(e.target.value) })}>
                <option value={0}>Активен</option><option value={1}>Заблокирован</option>
              </select>
              <button onClick={saveUser} className="bg-led rounded px-3 py-1">Сохранить</button>
            </div>
          )}
        </div>
      )}

      {tab === 'trips' && (
        <div className="glass rounded-xl p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-left"><th>ID</th><th>Маршрут</th><th>Водитель</th><th>Цена</th><th>Статус</th><th></th></tr></thead>
            <tbody>{trips.map(t => (
              <tr key={t.id} className="border-t border-white/5">
                <td>{t.id}</td><td>{t.origin} → {t.destination}</td><td>{t.driver_name}</td><td>{t.price}</td><td>{t.status}</td>
                <td className="space-x-2">
                  <button className="text-gray-300" onClick={() => setEditTrip({ ...t })}>edit</button>
                  <button className="text-led" onClick={() => delTrip(t.id)}>del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {editTrip && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              <input value={editTrip.origin} onChange={e => setEditTrip({ ...editTrip, origin: e.target.value })} />
              <input value={editTrip.destination} onChange={e => setEditTrip({ ...editTrip, destination: e.target.value })} />
              <input value={editTrip.price} onChange={e => setEditTrip({ ...editTrip, price: e.target.value })} />
              <select value={editTrip.status} onChange={e => setEditTrip({ ...editTrip, status: e.target.value })}>
                <option>ACTIVE</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option>
              </select>
              <button onClick={saveTrip} className="bg-led rounded px-3 py-1">Сохранить</button>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="glass rounded-xl p-4 space-y-2">
          {reports.map(r => (
            <div key={r.id} className="flex items-center gap-3 text-sm border-b border-white/5 py-2">
              <span className="font-dot">#{r.id}</span>
              <span>{r.reporter_name}: {r.reason}</span>
              <span className={r.status === 'PENDING' ? 'text-led' : 'text-gray-500'}>{r.status}</span>
              {r.status === 'PENDING' && <button onClick={() => resolve(r.id)} className="ml-auto border border-white/20 rounded px-2">Решено</button>}
              {r.target_user_id && <button onClick={() => blockUser(r.target_user_id)} className="text-led">Блок юзера</button>}
            </div>
          ))}
          {reports.length === 0 && <p className="text-gray-500">Жалоб нет.</p>}
        </div>
      )}

      {tab === 'chats' && (
        <div className="glass rounded-xl p-4">
          {chats.map(c => (
            <div key={c.id} className="flex items-center gap-3 text-sm border-b border-white/5 py-2">
              <span className="font-dot">#{c.id}</span> {c.origin} → {c.destination}
              <button onClick={() => delChat(c.id)} className="ml-auto text-led">del</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

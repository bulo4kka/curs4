import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, MapPin, AlertTriangle, MessageSquare, Plus, Trash2, Edit, Check, X, Loader2, BarChart2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  const load = () => {
    api('/admin/stats').then(setStats);
    api('/admin/users').then(setUsers);
    api('/admin/trips').then(setTrips);
    api('/reports').then(setReports);
    api('/chats/all/admin').then(setChats).catch(() => setChats([]));
  };
  useEffect(load, []);
  if (!user || user.role !== 'ADMIN') return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-shell p-8 text-center">
      <div className="surface rounded-xl p-12">
        <Shield size={48} className="mx-auto text-[var(--accent)] mb-4" />
        <h1 className="dot text-2xl mb-2 text-[var(--accent)]">Доступ только для ADMIN</h1>
        <p className="text-[var(--text-muted)]">У вас нет прав для просмотра этой страницы.</p>
      </div>
    </motion.div>
  );

  const saveUser = async () => { setLoading(true); await api(`/admin/users/${editUser.id}`, { method: 'PUT', body: editUser }); setEditUser(null); load(); setLoading(false); };
  const delUser = async id => { if (!confirm('Удалить пользователя?')) return; await api(`/admin/users/${id}`, { method: 'DELETE' }); load(); };
  const blockUser = async id => { if (!confirm('Заблокировать пользователя?')) return; await api('/reports/block-user', { method: 'POST', body: { user_id: id } }); load(); };
  const saveTrip = async () => { setLoading(true); await api(`/trips/${editTrip.id}`, { method: 'PUT', body: { origin: editTrip.origin, destination: editTrip.destination, price: Number(editTrip.price), seats_available: Number(editTrip.seats_available), status: editTrip.status } }); setEditTrip(null); load(); setLoading(false); };
  const resolve = async id => { await api(`/reports/${id}/resolve`, { method: 'POST' }); load(); };
  const delTrip = async id => { if (!confirm('Удалить поездку?')) return; await api(`/trips/${id}`, { method: 'DELETE' }); load(); };
  const delChat = async id => { if (!confirm('Удалить чат?')) return; await api(`/chats/${id}`, { method: 'DELETE' }); load(); };
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

  const tabs = [
    { id: 'stats', label: 'Статистика', icon: <BarChart2 size={16} /> },
    { id: 'users', label: 'Пользователи', icon: <Users size={16} /> },
    { id: 'trips', label: 'Поездки', icon: <MapPin size={16} /> },
    { id: 'reports', label: 'Жалобы', icon: <AlertTriangle size={16} /> },
    { id: 'chats', label: 'Чаты', icon: <MessageSquare size={16} /> },
  ];

  return (
    <div className="admin-page page-shell max-w-7xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-heading mb-6">
        <span className="section-kicker">SEATMATE // УПРАВЛЕНИЕ</span>
        <h1 className="page-title mt-3 flex items-center gap-3"><Shield size={25} className="text-[var(--accent)]" /> Панель администратора</h1>
      </motion.div>

      {/* Tab Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface admin-tabs rounded-2xl p-1.5 flex flex-wrap gap-1.5 mb-6"
        role="tablist"
      >
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
            }`}
            role="tab"
            aria-selected={tab === t.id}
          >
            {t.icon} {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={createTrip} className="btn btn-secondary text-sm px-3"><Plus size={14} /> + ТРЕК</button>
        <button onClick={createChat} className="btn btn-secondary text-sm px-3"><Plus size={14} /> + ЧАТ</button>
      </motion.nav>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'stats' && <StatsTab stats={stats} />}
          {tab === 'users' && <UsersTab users={users} editUser={editUser} setEditUser={setEditUser} saveUser={saveUser} delUser={delUser} blockUser={blockUser} loading={loading} />}
          {tab === 'trips' && <TripsTab trips={trips} editTrip={editTrip} setEditTrip={setEditTrip} saveTrip={saveTrip} delTrip={delTrip} loading={loading} />}
          {tab === 'reports' && <ReportsTab reports={reports} resolve={resolve} blockUser={blockUser} />}
          {tab === 'chats' && <ChatsTab chats={chats} delChat={delChat} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatsTab({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {Object.entries(stats).map(([k, v]) => (
        <motion.div
          key={k}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.random() * 0.2 }}
          className="surface rounded-xl p-4 text-center"
        >
          <div className="dot text-3xl text-[var(--accent)]">{v}</div>
          <div className="ndot text-xs text-[var(--text-dim)] mt-1 tracking-wider">{k}</div>
        </motion.div>
      ))}
    </div>
  );
}

function UsersTab({ users, editUser, setEditUser, saveUser, delUser, blockUser, loading }) {
  return (
    <div className="surface rounded-xl p-4 overflow-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-dim)] text-left border-b border-[var(--border)]">
              <th className="pb-2 px-2">ID</th>
              <th className="pb-2 px-2">Имя</th>
              <th className="pb-2 px-2">Email</th>
              <th className="pb-2 px-2">Роль</th>
              <th className="pb-2 px-2">Рейт.</th>
              <th className="pb-2 px-2">BYN</th>
              <th className="pb-2 px-2">Блок</th>
              <th className="pb-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {users.map(u => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="border-t border-[var(--border)]"
                >
                  <td className="py-2 px-2 ndot text-[var(--text-muted)]">{u.id}</td>
                  <td className="py-2 px-2 text-[var(--text)]">{u.full_name}</td>
                  <td className="py-2 px-2 text-[var(--text-muted)] truncate max-w-[200px]">{u.email}</td>
                  <td className="py-2 px-2"><span className="badge badge-neutral">{u.role}</span></td>
                  <td className="py-2 px-2 text-[var(--accent)] font-medium">{u.rating}</td>
                  <td className="py-2 px-2 ndot text-[var(--accent)]">{u.balance}</td>
                  <td className="py-2 px-2">{u.is_blocked ? <span className="text-[var(--accent)]">⛔</span> : <span className="text-green-400">✓</span>}</td>
                  <td className="py-2 px-2 space-x-2">
                    <button className="btn btn-ghost text-xs px-2" onClick={() => setEditUser({ ...u })}><Edit size={14} /></button>
                    <button className="btn btn-ghost text-xs px-2 text-[var(--accent)] hover:bg-[var(--accent-muted)]" onClick={() => delUser(u.id)}><Trash2 size={14} /></button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {editUser && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-6 p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]"
          >
            <h3 className="dot text-sm mb-3">Редактирование пользователя #{editUser.id}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input value={editUser.full_name} onChange={e => setEditUser({ ...editUser, full_name: e.target.value })} className="input" placeholder="Имя" />
              <input value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} className="input" placeholder="Email" type="email" />
              <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })} className="input">
                <option>CLIENT</option><option>DRIVER</option><option>ADMIN</option>
              </select>
              <select value={editUser.is_blocked ? 1 : 0} onChange={e => setEditUser({ ...editUser, is_blocked: Number(e.target.value) })} className="input">
                <option value={0}>Активен</option><option value={1}>Заблокирован</option>
              </select>
              <button onClick={saveUser} disabled={loading} className="btn btn-primary md:col-span-1">
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Сохранить'}
              </button>
              <button onClick={() => setEditUser(null)} className="btn btn-secondary md:col-span-1"><X size={14} /> Отмена</button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function TripsTab({ trips, editTrip, setEditTrip, saveTrip, delTrip, loading }) {
  return (
    <div className="surface rounded-xl p-4 overflow-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-dim)] text-left border-b border-[var(--border)]">
              <th className="pb-2 px-2">ID</th>
              <th className="pb-2 px-2">Маршрут</th>
              <th className="pb-2 px-2">Водитель</th>
              <th className="pb-2 px-2">Цена</th>
              <th className="pb-2 px-2">Статус</th>
              <th className="pb-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {trips.map(t => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="border-t border-[var(--border)]"
                >
                  <td className="py-2 px-2 ndot text-[var(--text-muted)]">{t.id}</td>
                  <td className="py-2 px-2 text-[var(--text)]">{t.origin} → {t.destination}</td>
                  <td className="py-2 px-2 text-[var(--text-muted)]">{t.driver_name}</td>
                  <td className="py-2 px-2 ndot text-[var(--accent)]">{t.price} BYN</td>
                  <td className="py-2 px-2"><span className={`badge ${getStatusBadge(t.status)}`}>{t.status}</span></td>
                  <td className="py-2 px-2 space-x-2">
                    <button className="btn btn-ghost text-xs px-2" onClick={() => setEditTrip({ ...t })}><Edit size={14} /></button>
                    <button className="btn btn-ghost text-xs px-2 text-[var(--accent)] hover:bg-[var(--accent-muted)]" onClick={() => delTrip(t.id)}><Trash2 size={14} /></button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {editTrip && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-6 p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]"
          >
            <h3 className="dot text-sm mb-3">Редактирование поездки #{editTrip.id}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <input value={editTrip.origin} onChange={e => setEditTrip({ ...editTrip, origin: e.target.value })} className="input" placeholder="Откуда" />
              <input value={editTrip.destination} onChange={e => setEditTrip({ ...editTrip, destination: e.target.value })} className="input" placeholder="Куда" />
              <input value={editTrip.price} onChange={e => setEditTrip({ ...editTrip, price: e.target.value })} className="input" placeholder="Цена" type="number" />
              <select value={editTrip.status} onChange={e => setEditTrip({ ...editTrip, status: e.target.value })} className="input">
                <option>ACTIVE</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option>
              </select>
              <button onClick={saveTrip} disabled={loading} className="btn btn-primary md:col-span-1">
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Сохранить'}
              </button>
              <button onClick={() => setEditTrip(null)} className="btn btn-secondary md:col-span-1"><X size={14} /> Отмена</button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function ReportsTab({ reports, resolve, blockUser }) {
  return (
    <div className="surface rounded-xl p-4 space-y-2">
      {reports.length === 0 ? (
        <p className="text-[var(--text-muted)] text-center py-8">Жалоб нет.</p>
      ) : (
        <AnimatePresence>
          {reports.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]"
            >
              <span className="ndot text-[var(--accent)] shrink-0">#{r.id}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--text)]"><b>{r.reporter_name}:</b> {r.reason}</div>
                <div className="text-[10px] text-[var(--text-dim)]">Поездка: {r.target_trip_origin} → {r.target_trip_destination}</div>
              </div>
              <span className={`badge ${r.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>{r.status}</span>
              {r.status === 'PENDING' && (
                <button onClick={() => resolve(r.id)} className="btn btn-secondary text-xs px-3"><Check size={12} /> Решено</button>
              )}
              {r.target_user_id && (
                <button onClick={() => blockUser(r.target_user_id)} className="btn btn-ghost text-xs px-3 text-[var(--accent)] hover:bg-[var(--accent-muted)]"><Shield size={12} /> Блок юзера</button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function ChatsTab({ chats, delChat }) {
  return (
    <div className="surface rounded-xl p-4">
      {chats.length === 0 ? (
        <p className="text-[var(--text-muted)] text-center py-8">Чатов нет.</p>
      ) : (
        <AnimatePresence>
          {chats.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]"
            >
              <span className="ndot text-[var(--accent)] shrink-0">#{c.id}</span>
              <span className="text-sm text-[var(--text)]">{c.origin} → {c.destination}</span>
              <span className="text-[var(--text-muted)] text-sm">{c.participant_count} участников</span>
              <button onClick={() => delChat(c.id)} className="ml-auto btn btn-ghost text-xs px-2 text-[var(--accent)] hover:bg-[var(--accent-muted)]"><Trash2 size={14} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function getStatusBadge(status) {
  switch (status) {
    case 'ACTIVE': return 'badge-warning';
    case 'IN_PROGRESS': return 'badge-neutral';
    case 'COMPLETED': return 'badge-success';
    case 'CANCELLED': return 'badge-neutral';
    default: return 'badge-neutral';
  }
}

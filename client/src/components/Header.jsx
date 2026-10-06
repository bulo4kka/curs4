import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Car, MessageCircle, UserCircle, Shield, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Header() {
  const { user, login, logout } = useAuth();
  const [quickUsers, setQuickUsers] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);

  useEffect(() => { api('/auth/quick-users').then(setQuickUsers).catch(() => {}); }, []);
  useEffect(() => {
    if (user) api(`/notifications/${user.id}`).then(setNotifs).catch(() => {});
  }, [user]);

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <header className="glass sticky top-0 z-40 px-4 py-3 flex flex-wrap items-center gap-3">
      <Link to="/" className="font-dot text-xl text-white">SEAT<span className="text-led">MATE</span></Link>
      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400"><span className="live-dot" /> LIVE</span>
      <nav className="flex gap-3 text-sm text-gray-300">
        <Link to="/" className="hover:text-white">Поездки</Link>
        {user && <Link to="/create" className="hover:text-white">Создать</Link>}
        {user && <Link to="/chats" className="hover:text-white flex items-center gap-1"><MessageCircle size={14} /> Чат</Link>}
        {user && <Link to="/profile" className="hover:text-white flex items-center gap-1"><UserCircle size={14} /> Профиль</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin" className="text-led flex items-center gap-1"><Shield size={14} /> Админ</Link>}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        {user && (
          <button className="relative p-2" onClick={() => { setOpenNotif(!openNotif); api(`/notifications/${user.id}/read`, { method: 'POST' }); setNotifs(n => n.map(x => ({ ...x, is_read: 1 }))); }}>
            <Bell size={18} />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-led text-white text-[10px] rounded-full px-1 font-dot">{unread}</span>}
          </button>
        )}
        <select className="!w-auto text-xs" value="" onChange={async e => {
          if (!e.target.value) return;
          const u = quickUsers.find(x => x.id === Number(e.target.value));
          if (u) { const full = await api(`/users/${u.id}`); login(full); }
        }}>
          <option value="">Сменить аккаунт…</option>
          {quickUsers.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
        </select>
        {user
          ? <button onClick={logout} className="text-xs border border-white/20 rounded px-2 py-1">Выйти</button>
          : <Link to="/login" className="text-xs border border-white/20 rounded px-2 py-1">Войти</Link>}
      </div>
      {openNotif && (
        <div className="absolute right-4 top-14 glass rounded-lg w-72 p-2 max-h-80 overflow-auto">
          {notifs.length === 0 && <p className="text-xs text-gray-500 p-2">Нет уведомлений</p>}
          {notifs.map(n => (
            <div key={n.id} className="p-2 border-b border-white/5 text-xs">
              <b>{n.title}</b><br /><span className="text-gray-400">{n.text}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

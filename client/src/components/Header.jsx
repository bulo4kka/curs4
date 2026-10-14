import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MessageCircle, UserCircle, Shield, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Header() {
  const { user, login, logout } = useAuth();
  const nav = useNavigate();
  const [quickUsers, setQuickUsers] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => { api('/auth/quick-users').then(setQuickUsers).catch(() => {}); }, []);
  useEffect(() => {
    if (user) api(`/notifications/${user.id}`).then(setNotifs).catch(() => {});
  }, [user]);

  const unread = notifs.filter(n => !n.is_read).length;

  const onNotifClick = async n => {
    setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
    api(`/notifications/item/${n.id}/read`, { method: 'POST' }).catch(() => {});
    setOpenNotif(false);
    if (n.link) nav(n.link);
    else if (n.type === 'chat') nav('/chats');
    else if (n.type === 'booking') nav('/profile');
    else if (n.type === 'admin' || n.type === 'report') nav(user?.role === 'ADMIN' ? '/admin' : '/profile');
  };

  const doSwitch = async () => {
    if (!selected) return;
    const full = await api(`/users/${selected.id}`);
    login(full);
    setSwitchOpen(false); setSelected(null);
    nav('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex flex-wrap items-center gap-3">
      <Link to="/" className="font-dot text-xl text-white">SEAT<span className="text-led">MATE</span></Link>
      <span className="font-dot text-[10px] text-gray-400 flex items-center gap-1.5"><span className="live-dot" /> LIVE</span>
      <nav className="flex gap-3 text-sm text-gray-300 ml-2">
        <Link to="/" className="hover:text-white">Поездки</Link>
        {user && <Link to="/create" className="hover:text-white">Создать</Link>}
        {user && <Link to="/chats" className="hover:text-white flex items-center gap-1"><MessageCircle size={14} /> Чат</Link>}
        {user && <Link to="/profile" className="hover:text-white flex items-center gap-1"><UserCircle size={14} /> Профиль</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin" className="text-led flex items-center gap-1"><Shield size={14} /> Админ</Link>}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <>
            <button className="relative p-2" onClick={() => setOpenNotif(!openNotif)}>
              <Bell size={18} />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-led text-white text-[10px] rounded-full px-1 font-dot">{unread}</span>}
            </button>
            <div className="flex items-center gap-2 border border-white/10 rounded-full pr-3 pl-1 py-1">
              <div className="w-7 h-7 rounded-full bg-led/20 border border-led/50 text-led font-dot text-xs flex items-center justify-center">{(user.full_name || '?')[0]}</div>
              <div className="leading-tight">
                <div className="text-xs">{user.full_name}</div>
                <div className="font-dot text-[9px] text-gray-500">{user.role} · <span className="text-led">{Number(user.balance || 0).toFixed(1)} BYN</span></div>
              </div>
            </div>
            <button onClick={() => setSwitchOpen(true)} className="text-xs border border-white/20 rounded-full px-3 py-1.5 hover:border-led hover:text-led">Сменить аккаунт</button>
            <button onClick={() => setLogoutOpen(true)} className="text-xs border border-white/20 rounded-full px-3 py-1.5 hover:border-led hover:text-led">Выйти</button>
          </>
        )}
        {!user && <Link to="/login" className="text-xs border border-white/20 rounded-full px-3 py-1.5">Войти</Link>}
      </div>

      {openNotif && (
        <div className="absolute right-4 top-full mt-2 glass rounded-xl w-80 p-2 max-h-96 overflow-auto z-50">
          <div className="flex justify-between items-center px-2 pb-2">
            <span className="font-dot text-xs text-gray-400">УВЕДОМЛЕНИЯ</span>
            <button className="text-[10px] text-gray-500 hover:text-led" onClick={() => { api(`/notifications/${user.id}/read`, { method: 'POST' }); setNotifs(ns => ns.map(x => ({ ...x, is_read: 1 }))); }}>прочитать всё</button>
          </div>
          {notifs.length === 0 && <p className="text-xs text-gray-500 p-2">Нет уведомлений</p>}
          {notifs.map(n => (
            <button key={n.id} onClick={() => onNotifClick(n)} className={`w-full text-left p-2 border-b border-white/5 text-xs rounded hover:bg-white/5 ${n.is_read ? 'opacity-50' : ''}`}>
              <b className="font-dot text-[11px]">{n.title}</b><br /><span className="text-gray-400">{n.text}</span>
            </button>
          ))}
        </div>
      )}

      {switchOpen && (
        <Modal title="ACCOUNT SELECTOR" onClose={() => setSwitchOpen(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-auto">
            {quickUsers.map(u => {
              const isCurrent = user?.id === u.id;
              const isSelected = selected?.id === u.id;
              return (
                <button key={u.id} onClick={() => setSelected(u)}
                  className={`text-left p-4 rounded-xl border transition ${isSelected ? 'border-led bg-led/10' : 'border-white/10 hover:border-white/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-led/20 border border-led/50 text-led font-dot flex items-center justify-center">{(u.full_name || '?')[0]}</div>
                    <div className="min-w-0">
                      <div className="font-display text-sm truncate">{u.full_name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{u.email} · {u.phone}</div>
                    </div>
                    {isCurrent && <span className="ml-auto font-ndot text-[9px] text-led flex items-center gap-1"><span className="live-dot" /> ACTIVE</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-ndot text-[10px] text-gray-400 border border-white/10 rounded-full px-2 py-0.5">{u.role}</span>
                    <span className="font-ndot text-xs text-led">{Number(u.balance || 0).toFixed(1)} BYN</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={doSwitch} disabled={!selected || selected?.id === user?.id}
            className="mt-4 w-full bg-led hover:bg-led2 disabled:opacity-40 rounded-xl py-3 font-display uppercase tracking-wider font-bold text-sm">
            {selected ? `Войти как ${selected.full_name}` : 'ВЫБЕРИТЕ АККАУНТ'}
          </button>
        </Modal>
      )}

      {logoutOpen && (
        <Modal title="ВЫХОД" onClose={() => setLogoutOpen(false)}>
          <p className="text-sm text-gray-400">Вы действительно хотите выйти из аккаунта <b className="text-white">{user?.full_name}</b>?</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setLogoutOpen(false)} className="flex-1 border border-white/20 rounded-xl py-2 text-sm">Отмена</button>
            <button onClick={() => { logout(); setLogoutOpen(false); nav('/'); }} className="flex-1 bg-led hover:bg-led2 rounded-xl py-2 font-display uppercase tracking-wider font-bold text-sm">Выйти</button>
          </div>
        </Modal>
      )}
    </header>
  );
}

import { createPortal } from 'react-dom';

function Modal({ title, onClose, children }) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-[#121214] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-dot text-sm">{title}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

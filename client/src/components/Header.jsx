import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, UserCircle, Shield, Bell, X, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { createPortal } from 'react-dom';

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

  useEffect(() => {
    if (openNotif) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [openNotif]);

  const unread = notifs.filter(n => !n.is_read).length;

  const onNotifClick = useCallback(async n => {
    setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
    api(`/notifications/item/${n.id}/read`, { method: 'POST' }).catch(() => {});
    setOpenNotif(false);
    if (n.link) nav(n.link);
    else if (n.type === 'chat') nav('/chats');
    else if (n.type === 'booking') nav('/profile');
    else if (n.type === 'admin' || n.type === 'report') nav(user?.role === 'ADMIN' ? '/admin' : '/profile');
  }, [nav, user]);

  const doSwitch = useCallback(async () => {
    if (!selected) return;
    const full = await api(`/users/${selected.id}`);
    login(full);
    setSwitchOpen(false); setSelected(null);
    nav('/');
  }, [selected, login, nav]);

  const openSwitch = useCallback(() => { setSelected(null); setSwitchOpen(true); }, []);
  const closeSwitch = useCallback(() => { setSwitchOpen(false); setSelected(null); }, []);
  const openLogout = useCallback(() => setLogoutOpen(true), []);
  const closeLogout = useCallback(() => { setLogoutOpen(false); }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)] px-4 py-2">
      <div className="max-w-full mx-auto flex items-center justify-between gap-4 h-12">
        {/* LEFT: Logo + LIVE + Navigation */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="dot text-lg text-[var(--text)] flex items-center gap-2" aria-label="SeatMate Home">
            <span>SEAT</span><span className="text-[var(--accent)]">MATE</span>
          </Link>
          <span className="hidden sm:flex items-center gap-1.5 ndot text-[10px] text-[var(--text-muted)] px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full">
            <span className="live-dot" /> LIVE
          </span>
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            <Link to="/" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors">Поездки</Link>
            {user && <Link to="/create" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors">Создать</Link>}
            {user && <Link to="/chats" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors flex items-center gap-1"><MessageCircle size={13} /> Чат</Link>}
            {user && <Link to="/profile" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors flex items-center gap-1"><UserCircle size={13} /> Профиль</Link>}
            {user?.role === 'ADMIN' && <Link to="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors flex items-center gap-1"><Shield size={13} /> Админ</Link>}
          </nav>
        </div>

        {/* RIGHT: Notifications + Profile Block + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {/* Notifications Bell */}
              <button
                onClick={() => setOpenNotif(!openNotif)}
                className="relative h-11 w-11 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)]/80 border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] transition-colors"
                aria-label={`Уведомления${unread > 0 ? ` (${unread})` : ''}`}
              >
                <Bell size={18} className="text-[var(--text-muted)]" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-[9px] rounded-full flex items-center justify-center ndot">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {/* Profile Card */}
              <div className="h-11 flex items-center gap-2 bg-[var(--bg-elevated)]/80 border border-[var(--border)] rounded-xl px-3 pr-2">
                <div className="avatar avatar-sm shrink-0">
                  {(user.full_name || '?')[0]}
                </div>
                <div className="hidden sm:block leading-tight min-w-0">
                  <div className="text-sm font-medium text-[var(--text)] truncate max-w-[140px]">{user.full_name}</div>
                  <div className="ndot text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                    <span>{user.role}</span>
                    <span className="text-[var(--accent)]">{Number(user.balance || 0).toFixed(1)} BYN</span>
                  </div>
                </div>
              </div>

              {/* Switch Account */}
              <button
                onClick={openSwitch}
                className="h-11 px-4 rounded-xl bg-[var(--bg-elevated)]/80 border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-muted)] transition-colors hidden sm:flex items-center gap-1"
              >
                <LogIn size={13} /> Сменить
              </button>

              {/* Logout */}
              <button
                onClick={openLogout}
                className="h-11 px-4 rounded-xl bg-transparent border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-muted)]/20 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors hidden sm:flex items-center gap-1"
              >
                <LogIn size={13} className="rotate-180" /> Выйти
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="h-11 px-5 rounded-xl bg-[var(--bg-elevated)]/80 border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-muted)]/20 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
            >
              <LogIn size={13} /> Войти
            </Link>
          )}
        </div>

        {/* Mobile menu placeholder */}
        <button className="md:hidden h-11 w-11 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)]/80 border border-[var(--border)]" aria-label="Menu">
          <span className="w-5 h-0.5 bg-[var(--text-muted)] relative" />
        </button>
      </div>

      {/* NOTIFICATIONS DROPDOWN */}
      <AnimatePresence>
        {openNotif && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 z-50 w-full md:w-96 max-h-[85vh] flex flex-col bg-[var(--bg)]/95 backdrop-blur-xl border-l border-[var(--border)] overscroll-contain"
            onClick={() => setOpenNotif(false)}
            onWheel={e => e.stopPropagation()}
            role="dialog"
            aria-label="Уведомления"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border)]" onClick={e => e.stopPropagation()}>
              <span className="ndot text-xs text-[var(--text-muted)]">УВЕДОМЛЕНИЯ</span>
              <button
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]"
                onClick={e => {
                  e.stopPropagation();
                  api(`/notifications/${user.id}/read`, { method: 'POST' });
                  setNotifs(ns => ns.map(x => ({ ...x, is_read: 1 })));
                  setOpenNotif(false);
                }}
              >
                прочитать всё
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[60vh] p-2 scrollbar-thin overscroll-contain" onClick={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
              {notifs.length === 0 ? (
                <p className="text-xs text-[var(--text-dim)] p-4 text-center">Нет уведомлений</p>
              ) : (
                notifs.map(n => (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={e => { e.stopPropagation(); onNotifClick(n); }}
                    className={`w-full text-left p-3 border-b border-[var(--border)] text-xs rounded hover:bg-[var(--bg-elevated)] ${n.is_read ? 'opacity-50' : ''}`}
                  >
                    <b className="ndot text-[11px]">{n.title}</b><br /><span className="text-[var(--text-muted)]">{n.text}</span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SWITCH ACCOUNT MODAL */}
      <AnimatePresence>
        {switchOpen && (
          <Modal onClose={closeSwitch}>
            <div className="w-full max-w-md max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h3 className="ndot text-sm">ACCOUNT SELECTOR</h3>
                <button onClick={closeSwitch} className="p-1 hover:bg-[var(--bg-elevated)] rounded-lg"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px] p-4 pr-2 scrollbar-thin overscroll-contain" onWheel={e => e.stopPropagation()}>
                {quickUsers.map(u => {
                  const isCurrent = user?.id === u.id;
                  const isSelected = selected?.id === u.id;
                  return (
                    <motion.button
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelected(u)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors duration-200 ${
                        isSelected ? 'border-[var(--accent)] bg-[var(--accent-muted)]' : 'border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md shrink-0">{(u.full_name || '?')[0]}</div>
                        <div className="min-w-0 flex-1">
                          <div className="display text-sm text-[var(--text)] truncate">{u.full_name}</div>
                          <div className="text-[10px] text-[var(--text-muted)] truncate">{u.email} · {u.phone}</div>
                        </div>
                        {isCurrent && <span className="ml-auto ndot text-[9px] text-[var(--accent)] flex items-center gap-1"><span className="live-dot-sm" /> ACTIVE</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="ndot text-[10px] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-2 py-0.5">{u.role}</span>
                        <span className="ndot text-xs text-[var(--accent)]">{Number(u.balance || 0).toFixed(1)} BYN</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <div className="p-4 border-t border-[var(--border)]">
                <button
                  onClick={doSwitch}
                  disabled={!selected || selected?.id === user?.id}
                  className="w-full btn btn-primary disabled:opacity-40"
                >
                  {selected ? `Войти как ${selected.full_name}` : 'ВЫБЕРИТЕ АККАУНТ'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {logoutOpen && (
          <Modal onClose={closeLogout}>
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h3 className="ndot text-sm">ВЫХОД</h3>
                <button onClick={closeLogout} className="p-1 hover:bg-[var(--bg-elevated)] rounded-lg"><X size={16} /></button>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-[var(--text-muted)]">Вы действительно хотите выйти из аккаунта <b className="text-[var(--text)]">{user?.full_name}</b>?</p>
                <div className="flex gap-2 mt-6">
                  <button onClick={closeLogout} className="flex-1 h-11 rounded-xl btn btn-secondary">Отмена</button>
                  <button onClick={() => { logout(); closeLogout(); nav('/'); }} className="flex-1 h-11 btn btn-primary">Выйти</button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </header>
  );
}

function Modal({ onClose, children, lockScroll = true }) {
  useEffect(() => {
    if (lockScroll) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (lockScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [lockScroll]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
      onWheel={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overscroll-contain"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('client1@seatmate.by');
  const [password, setPassword] = useState('1234');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const u = await api('/auth/login', { method: 'POST', body: { email: email.trim().toLowerCase(), password } });
      login(u);
      nav('/');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-shell min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-intro">
          <span className="section-kicker">SEATMATE // ДОБРО ПОЖАЛОВАТЬ</span>
          <h1 className="page-title mt-3 mb-2">Снова в пути</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">Войдите, чтобы управлять поездками и общаться с попутчиками.</p>
        </div>
        <form onSubmit={submit} className="surface login-form rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email"
              className="input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="пароль"
              className="input"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? 'ВХОД...' : 'ВОЙТИ'}
          </button>
          {msg && <p className="text-sm text-[var(--accent)]" role="alert">{msg}</p>}
          <p className="text-xs text-[var(--text-dim)] text-center leading-relaxed">
            admin@seatmate.by / admin123 · driver1@seatmate.by / 1234 · client1@seatmate.by / 1234
          </p>
        </form>
      </motion.div>
    </div>
  );
}

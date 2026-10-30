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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="dot text-2xl mb-4">Вход</h1>
        <form onSubmit={submit} className="surface rounded-xl p-6 space-y-4">
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
          <p className="text-xs text-[var(--text-dim)] text-center">
            admin@seatmate.by / admin123 · driver1@seatmate.by / 1234 · client1@seatmate.by / 1234
          </p>
        </form>
      </motion.div>
    </div>
  );
}
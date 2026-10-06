import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('client1@seatmate.by');
  const [password, setPassword] = useState('1234');
  const [msg, setMsg] = useState('');

  const submit = async e => {
    e.preventDefault();
    try { login(await api('/auth/login', { method: 'POST', body: { email, password } })); nav('/'); }
    catch (e) { setMsg(e.message); }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="font-dot text-2xl mb-4">Вход</h1>
      <form onSubmit={submit} className="glass rounded-xl p-4 space-y-3">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="пароль" />
        <button className="bg-led rounded-lg w-full py-2 font-dot">ВОЙТИ</button>
        {msg && <p className="text-led text-sm">{msg}</p>}
        <p className="text-xs text-gray-500">admin@seatmate.by / admin123 · driver1@seatmate.by / 1234 · client1@seatmate.by / 1234</p>
      </form>
    </div>
  );
}

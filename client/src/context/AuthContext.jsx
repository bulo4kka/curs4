import { createContext, useContext, useState } from 'react';
const Ctx = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('seatmate_user')); } catch { return null; }
  });
  const login = u => { setUser(u); localStorage.setItem('seatmate_user', JSON.stringify(u)); };
  const logout = () => { setUser(null); localStorage.removeItem('seatmate_user'); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, json } from './api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api('/auth/me').then(({ user: current }) => setUser(current)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const value = useMemo(() => ({ user, setUser, loading,
    signIn: async (username, password) => { const result = await api('/auth/login', json('POST', { username, password })); setUser(result.user); return result.user; },
    signUp: async (details) => { const result = await api('/auth/register', json('POST', details)); setUser(result.user); return result.user; },
    signOut: async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

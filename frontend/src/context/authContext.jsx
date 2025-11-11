// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Load session on app start
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { userId } = await api.get('/api/auth/me');
        if (cancelled) return;
        if (userId) {
          // fetch full user profile
          const { user } = await api.get(`/api/users/${userId}`);
          if (!cancelled) setUser(user);
        }
      } catch {
        // not logged in or server down; ignore
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // helper to store user after successful login
  const login = useCallback(async (email, password) => {
    const { user } = await api.post('/api/auth/login', { email, password });
    setUser(user);
    return user;
  }, []);

  // logout
  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
    } finally {
      setUser(null);
    }
  }, []);

  const value = { user, setUser, login, logout, loadingUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

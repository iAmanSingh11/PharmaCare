import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { setAccessToken, setOnLogout } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  // On first load, try to silently restore a session via the refresh cookie.
  useEffect(() => {
    setOnLogout(clearSession);

    const restoreSession = async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.data.accessToken);
        const me = await authApi.me();
        setUser(me.data.data.user);
      } catch (err) {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [clearSession]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      toast.success('Logged out successfully');
    }
  };

  const value = { user, isLoading, login, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

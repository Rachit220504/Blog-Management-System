import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { authApi, clearStoredSession, extractPayload, setStoredSession } from '../services/api';
import { getPermissionsForRole, hasPermission } from '../config/permissions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const response = await authApi.profile();
        const profile = extractPayload(response);
        syncUser(profile);
      } catch (error) {
        clearStoredSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const payload = extractPayload(response);
      const nextUser = payload.user || payload;
      const accessToken = payload.accessToken || payload.token;

      setStoredSession({ accessToken, user: nextUser });
      syncUser(nextUser);

      return { success: true, data: payload };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const logout = async () => {
    await authApi.logout().catch(() => null);
    clearStoredSession();
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    syncUser(updatedUser);
  };

  const permissions = useMemo(() => getPermissionsForRole(user?.role), [user?.role]);

  const can = (permission) => hasPermission(user?.role, permission);

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfileState,
    permissions,
    can,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

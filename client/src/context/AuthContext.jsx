import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('digitalstore_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('digitalstore_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const data = await apiRequest('/api/auth/me');
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('digitalstore_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Session check failed or offline fallback:', err);
        // Only clear if explicitly unauthorized 401 from a live server
        if (err.status === 401 && !localStorage.getItem('digitalstore_user')) {
          localStorage.removeItem('digitalstore_token');
          localStorage.removeItem('digitalstore_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('digitalstore_token', data.token);
    localStorage.setItem('digitalstore_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, full_name) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name })
    });
    localStorage.setItem('digitalstore_token', data.token);
    localStorage.setItem('digitalstore_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('digitalstore_token');
    localStorage.removeItem('digitalstore_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    await apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    setUser(prev => ({ ...prev, ...profileData }));
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

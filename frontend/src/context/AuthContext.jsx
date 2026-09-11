import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load token/user from local storage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load authentication state from storage:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAction = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data.success && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setToken(data.access_token);
        setUser(data.user);
        return data;
      }
      throw new Error(data.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const signupAction = async (fields, registrationToken) => {
    setLoading(true);
    try {
      const data = await apiRegister(fields, registrationToken);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logoutAction = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login: loginAction,
    signup: signupAction,
    logout: logoutAction,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

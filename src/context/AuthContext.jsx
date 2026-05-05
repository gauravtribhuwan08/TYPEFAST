import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = '/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/me`);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (username, email, password, dob, gender, address, country, state, city) => {
    const res = await axios.post(`${API_URL}/signup`, {
      username, email, password, dob, gender, address, country, state, city,
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateStats = async (wpm, accuracy) => {
    try {
      const res = await axios.put(`${API_URL}/stats`, { wpm, accuracy });
      setUser((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to update stats:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, signup, logout, updateStats }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

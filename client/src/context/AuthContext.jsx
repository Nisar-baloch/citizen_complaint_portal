import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login Error Context:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      // The backend returns user + token. We will return success so frontend can redirect to Login.
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Signup Error Context:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;

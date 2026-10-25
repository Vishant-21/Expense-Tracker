import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spendwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on app load
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('spendwise_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('spendwise_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification failed, resetting token.');
          localStorage.removeItem('spendwise_token');
          localStorage.removeItem('spendwise_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  // Register
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('spendwise_token', newToken);
        localStorage.setItem('spendwise_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        toast.success(`Welcome to SpendWise, ${newUser.name}!`);
        return { success: true };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('spendwise_token', newToken);
        localStorage.setItem('spendwise_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        toast.success(`Welcome back, ${newUser.name}!`);
        return { success: true };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update user in context (e.g., budget change)
  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('spendwise_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

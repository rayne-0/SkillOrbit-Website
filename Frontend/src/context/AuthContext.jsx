/**
 * AuthContext.jsx
 *
 * Provides authentication state and helpers throughout the app.
 * JWT tokens are stored in localStorage.
 *
 * Usage:
 *   const { user, login, logout, googleLogin } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8000/api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    try {
      const stored = localStorage.getItem('skillorbit_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------- //
  //  Persist tokens to localStorage                                         //
  // ---------------------------------------------------------------------- //
  const persistTokens = useCallback((newTokens) => {
    setTokens(newTokens);
    if (newTokens) {
      localStorage.setItem('skillorbit_tokens', JSON.stringify(newTokens));
    } else {
      localStorage.removeItem('skillorbit_tokens');
    }
  }, []);

  // ---------------------------------------------------------------------- //
  //  Re-hydrate user on mount / token change                                //
  // ---------------------------------------------------------------------- //
  useEffect(() => {
    const fetchMe = async () => {
      if (!tokens?.access) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/me/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token is invalid/expired — clear state
          persistTokens(null);
          setUser(null);
        }
      } catch {
        // Server unreachable — keep existing tokens but don't crash
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []); // run once on mount

  // ---------------------------------------------------------------------- //
  //  Login (email / password)                                               //
  // ---------------------------------------------------------------------- //
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Login failed');
    persistTokens(data.tokens);
    setUser(data.user);
    return data.user;
  }, [persistTokens]);

  // ---------------------------------------------------------------------- //
  //  Signup (email / password)                                              //
  // ---------------------------------------------------------------------- //
  const signup = useCallback(async (name, email, password) => {
    const res = await fetch(`${API_BASE}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Signup failed');
    persistTokens(data.tokens);
    setUser(data.user);
    return data.user;
  }, [persistTokens]);

  // ---------------------------------------------------------------------- //
  //  Google OAuth login                                                     //
  // ---------------------------------------------------------------------- //
  const googleLogin = useCallback(async (credential) => {
    const res = await fetch(`${API_BASE}/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Google login failed');
    persistTokens(data.tokens);
    setUser(data.user);
    return data.user;
  }, [persistTokens]);

  // ---------------------------------------------------------------------- //
  //  Logout                                                                 //
  // ---------------------------------------------------------------------- //
  const logout = useCallback(() => {
    persistTokens(null);
    setUser(null);
  }, [persistTokens]);

  // ---------------------------------------------------------------------- //
  //  Forgot password helpers                                                //
  // ---------------------------------------------------------------------- //
  const requestOtp = useCallback(async (email) => {
    const res = await fetch(`${API_BASE}/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to send OTP');
    return data.message;
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const res = await fetch(`${API_BASE}/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'OTP verification failed');
    return data.reset_token;
  }, []);

  const resetPassword = useCallback(async (resetToken, newPassword) => {
    const res = await fetch(`${API_BASE}/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Password reset failed');
    return data.message;
  }, []);

  const value = {
    user,
    tokens,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    googleLogin,
    logout,
    requestOtp,
    verifyOtp,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

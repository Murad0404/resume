import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMocked, setIsMocked] = useState(false);

  useEffect(() => {
    // If Supabase is not configured, we use a mock state
    if (!supabase) {
      setIsMocked(true);
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) setUser(JSON.parse(mockUser));
      setIsLoading(false);
      return;
    }

    // Real Supabase session fetching
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (isMocked) {
      const mockUser = { id: '123', email, user_metadata: { name: 'Demo User', phone: '+998901234567' } };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { data: mockUser, error: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const register = async (email, password, phone, name) => {
    if (isMocked) {
      const mockUser = { id: '123', email, user_metadata: { phone, name } };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { data: mockUser, error: null };
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone, name } }
    });
  };

  const logout = async () => {
    if (isMocked) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    isLoading,
    isMocked,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

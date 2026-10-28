import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase.js';
import { getProfile } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch and sync profile from backend API
  const syncProfile = async (currentToken) => {
    if (!currentToken) {
      setProfile(null);
      return;
    }
    try {
      const response = await getProfile(currentToken);
      if (response && response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.warn('[AuthContext] Could not fetch profile from backend:', err.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.access_token) {
        syncProfile(initialSession.access_token).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.access_token) {
          await syncProfile(currentSession.access_token);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data?.session?.access_token) {
      await syncProfile(data.session.access_token);
    }
    return data;
  };

  // Sign up handler with student profile metadata
  const signUp = async ({ email, password, full_name, college, department, year, role = 'student' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          college,
          department,
          year,
          role,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  // Logout handler
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (session?.access_token) {
      await syncProfile(session.access_token);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';

  const value = {
    session,
    user,
    token: session?.access_token || null,
    profile,
    isAdmin,
    loading,
    login,
    signUp,
    logout,
    refreshProfile,
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

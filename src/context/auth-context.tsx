// src/context/auth-context.tsx
'use client';

import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client'; // Import Supabase client
import type { User, AuthError, Session } from '@supabase/supabase-js'; // Import Supabase types

interface AuthContextType {
  currentUser: User | null;
  session: Session | null; // Add session state
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError | null }>;
  logIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError | null }>;
  logOut: () => Promise<{ error?: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const getSession = useCallback(async () => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
    }
    setSession(session);
    setCurrentUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    getSession(); // Get initial session

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setCurrentUser(session?.user ?? null);
        setLoading(false); // Update loading state on auth change
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [getSession]);

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Add options like email confirmation redirect if needed
      // options: {
      //   emailRedirectTo: `${location.origin}/auth/callback`,
      // },
    });

    // Note: Supabase might require email confirmation. User state might not update immediately.
    // The auth listener will handle the user state update upon successful confirmation/login.
    setLoading(false);
    if (error) {
       console.error("Sign up error:", error);
    } else {
        // You might want to inform the user to check their email for confirmation
        console.log("Sign up successful, check email for confirmation if enabled.");
    }
    return { success: !error, error };
  };

  const logIn = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // User state will be updated by onAuthStateChange listener
    setLoading(false);
     if (error) {
       console.error("Login error:", error);
     }
    return { success: !error, error };
  };

  const logOut = async (): Promise<{ error?: AuthError | null }> => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    // User state will be updated by onAuthStateChange listener
    setLoading(false);
    if (error) {
       console.error("Logout error:", error);
    }
    return { error };
  };

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    signUp,
    logIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {/* Optional: Show a global loader while auth state is loading initially */}
       {/* {loading && <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>} */}
    </AuthContext.Provider>
  );
};

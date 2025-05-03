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
      options: {
        // Ensure this matches the URL where users should land after clicking the confirmation link.
        // It should ideally be a page that handles the confirmation token (Supabase handles this server-side, but the user needs to land somewhere).
        // '/login' is a common choice, assuming your Supabase redirect settings are configured.
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setLoading(false);
    if (error) {
       console.error("Sign up error:", error);
    } else {
        // Inform the user to check their email for confirmation, especially if confirmation is enabled in Supabase settings.
        console.log("Sign up attempt successful. If email confirmation is enabled, please check your email.");
    }
    // Success is true if there's no immediate error, but confirmation might still be pending.
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

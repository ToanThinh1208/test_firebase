// src/context/auth-context.tsx
'use client';

import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client'; // Import Supabase client
import type { User, AuthError, Session } from '@supabase/supabase-js'; // Import Supabase types
// Removed updateProfile import as profile creation is handled by DB trigger


interface AuthContextType {
  currentUser: User | null;
  session: Session | null; // Add session state
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: AuthError | null }>; // Added message field
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

  const signUp = async (email: string, password: string): Promise<{ success: boolean; message?: string; error?: AuthError | null }> => {
    setLoading(true);
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    let message: string | undefined;

    if (error) {
       console.error("Sign up error:", error);
    } else if (data.user) {
        // Profile creation is now handled by the database trigger.
        // Determine message based on signup outcome
        if (data.user.identities?.length === 0) {
             message = "Sign up attempt successful, but user might already exist or require confirmation. Please check your email (including spam/junk folders) for a confirmation link.";
             console.warn("Sign up successful, but user may already exist or need confirmation.");
        } else {
             message = "Sign up successful! Please check your email (including spam/junk folders) for a confirmation link. It might take a few minutes to arrive.";
             console.log("Sign up successful. Confirmation email likely sent.");
        }

    } else {
        // Fallback case if no user data and no error
         message = "Sign up process initiated. Please check your email (including spam/junk folders) for a confirmation link if required.";
         console.log("Sign up attempt finished without user data or error.");
    }

    setLoading(false);
    // Return signup outcome
    return { success: !error, message, error };
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

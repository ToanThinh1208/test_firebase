// src/context/auth-context.tsx
'use client';

import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client'; // Import Supabase client
import type { User, AuthError, Session } from '@supabase/supabase-js'; // Import Supabase types
import { updateProfile } from '@/services/profile-service'; // Import updateProfile service

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
    let profileCreationError: Error | null = null;

    if (error) {
       console.error("Sign up error:", error);
    } else if (data.user) {
        // If signup is successful and user object exists, attempt to create profile
        try {
            // Extract username part from email as a default
            const defaultUsername = email.split('@')[0];
            const { success: profileSuccess, error: profileError } = await updateProfile(data.user.id, { username: defaultUsername });
             if (!profileSuccess) {
                console.error("Failed to create profile during signup:", profileError);
                profileCreationError = profileError instanceof Error ? profileError : new Error('Failed to create profile.');
                // Proceed with signup message, but maybe indicate profile issue
            }
        } catch (err) {
             console.error("Unexpected error creating profile during signup:", err);
             profileCreationError = err instanceof Error ? err : new Error('Unexpected error creating profile.');
        }

        // Determine message based on signup and profile creation outcomes
        if (profileCreationError) {
             message = "Sign up successful, but failed to initialize profile. Please check your email for confirmation and update your profile later.";
        } else if (data.user.identities?.length === 0) {
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
    // Combine potential signup error and profile creation error for return value
    const combinedError = error ?? (profileCreationError as AuthError); // Treat profile error as AuthError for simplicity
    return { success: !error && !profileCreationError, message, error: combinedError };
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

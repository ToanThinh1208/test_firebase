
'use client';

import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User, // Import User type
  AuthError, // Import AuthError for type safety
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Use configured auth instance

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  logIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  logOut: () => Promise<void>;
}

// Explicitly type the context default value
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase Auth observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);
      setLoading(false);
      return { success: false, error: error as AuthError }; // Return error object
    }
  };

  const logIn = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return { success: false, error: error as AuthError }; // Return error object
    }
  };

  const logOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
      setLoading(false);
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
      // Optionally handle logout errors (e.g., show a toast)
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signUp,
    logIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {/* Optionally show a global loader while auth state is loading */}
       {/* {loading && <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>} */}
    </AuthContext.Provider>
  );
};

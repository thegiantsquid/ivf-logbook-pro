
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from '@/lib/toast';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Convert Supabase user to our User type
  const formatUser = (session: Session | null): User | null => {
    if (!session?.user) return null;
    
    const supabaseUser = session.user;
    // Adapt Supabase User to our User interface
    return {
      id: supabaseUser.id,
      uid: supabaseUser.id, // Add uid as an alias for id
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || null,
      photoURL: supabaseUser.user_metadata?.avatar_url || null,
    };
  };

  useEffect(() => {
    // Set up auth state change listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log('Auth state changed:', _event);
      setSession(currentSession);
      setCurrentUser(formatUser(currentSession));
      setLoading(false);
    });

    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', currentSession ? 'Session exists' : 'No session');
        setSession(currentSession);
        setCurrentUser(formatUser(currentSession));
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (error: any) {
      handleSupabaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Check if session was created successfully
      if (data?.session) {
        console.log('Sign in successful, session created');
        toast.success('Signed in successfully');
      } else {
        console.error('Sign in succeeded but no session was created');
        toast.error('Sign in succeeded but no session was created');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      handleSupabaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      toast.success('Registration successful! Please check your email to confirm your account.');
    } catch (error: any) {
      handleSupabaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      handleSupabaseError(error);
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

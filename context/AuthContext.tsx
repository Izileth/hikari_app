import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Tables } from '../lib/database.types';

type AuthData = {
  session: Session | null;
  user: User | null;
  profile: Tables<'profiles'> | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: User) => {
    try {
      if (!user) throw new Error("No user provided to fetchProfile");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email!)
        .single();
        
      if (error) {
        // It's possible the profile isn't created yet, especially on sign-up
        // Don't throw, just log it.
        console.warn('Could not fetch profile:', error.message);
        setProfile(null);
        return;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (e) {
      console.error('An unexpected error occurred while fetching profile.', e);
      setProfile(null);
    }
  };

  useEffect(() => {
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Only fetch profile when a user is confirmed
        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
        
        // The loading state should be set to false after the initial session is processed.
        // The INITIAL_SESSION event is triggered only once when the listener is mounted.
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
           setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error || undefined };
  };

  const signUp = async (name: string, email: string, password: string) => {
    // Note: The profile is now created by a trigger in Supabase when a new auth.user is created.
    // The trigger reads the 'name' from the metadata.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          // You can add other metadata here if needed by your trigger
        },
      },
    });
    // The onAuthStateChange listener will handle fetching the profile automatically.
    return { error: error || undefined };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    loading: loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


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
    const fetchInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error.message);
        }

        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("An unexpected error occurred during initial session fetch.", e);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
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
    // Step 1: Create the user in the authentication schema
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      // We pass the name in the options metadata
      options: {
        data: {
          name: name,
        },
      },
    });

    if (authError) {
      return { error: authError };
    }

    if (!authData.user) {
      return { error: new Error("User was not created in the authentication system.") };
    }

    // Step 2: Insert the corresponding profile into the public.profiles table
    // The `user_id` comes from the auth user we just created.
    // The `name` can be taken from the input directly.
    // The `slug` is handled by a trigger on the profiles table.
    // The `password` column is nullable and not needed.
    const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        email: email,
        name: name,
    });
    
    if (profileError) {
      // This is a critical error. The auth user exists, but the profile creation failed.
      // The user will be in a broken state.
      console.error("CRITICAL: Auth user created, but profile creation failed:", profileError);
      return { error: new Error(`Database Error Saving New User: ${profileError.message}`) };
    }

    // Both steps succeeded. The onAuthStateChange listener will now handle setting the session and profile.
    return {};
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


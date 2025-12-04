import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useStorage } from '../hooks/useStorage';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { Tables } from '../lib/database.types';
import { ImagePickerAsset } from 'expo-image-picker';

type ProfileData = {
  profile: Tables<'profiles'> | null;
  loading: boolean;
  updateProfile: (updatedInfo: Partial<Tables<'profiles'>>) => Promise<{ error?: Error }>;
  uploadAvatar: (asset: ImagePickerAsset) => Promise<{ error?: Error }>;
  uploadBanner: (asset: ImagePickerAsset) => Promise<{ error?: Error }>;
};

const ProfileContext = createContext<ProfileData>({
  profile: null,
  loading: true,
  updateProfile: async () => ({}),
  uploadAvatar: async () => ({}),
  uploadBanner: async () => ({}),
});

export const useProfile = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, profile: initialProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(initialProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProfile(initialProfile);
    setLoading(false);
  }, [initialProfile]);

  const updateProfile = async (updatedInfo: Partial<Tables<'profiles'>>) => {
    if (!user || !session) {
      return { error: new Error('User not authenticated') };
    }
    setLoading(true);
    try {
      delete updatedInfo.id;
      delete updatedInfo.email;

      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${user.email}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updatedInfo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.length > 0) {
        setProfile(data[0]);
      }

      return {};

    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const { upload: uploadStorage, loading: storageLoading } = useStorage();

  const uploadAvatar = async (asset: ImagePickerAsset) => {
    setLoading(true);
    try {
      const { publicUrl, error } = await uploadStorage(asset, { bucket: 'avatars' });

      if (error) {
        throw error;
      }

      if (publicUrl) {
        await updateProfile({ avatar_url: publicUrl });
      }

      if (refreshProfile) {
        await refreshProfile();
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const uploadBanner = async (asset: ImagePickerAsset) => {
    setLoading(true);
    try {
      const { publicUrl, error } = await uploadStorage(asset, { bucket: 'banners' });

      if (error) {
        throw error;
      }

      if (publicUrl) {
        await updateProfile({ banner_url: publicUrl });
      }

      if (refreshProfile) {
        await refreshProfile();
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    profile,
    loading: loading || storageLoading,
    updateProfile,
    uploadAvatar,
    uploadBanner,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

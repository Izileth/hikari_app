import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { ImagePickerAsset } from 'expo-image-picker';

type UploadOptions = {
  bucket: 'avatars' | 'banners';
};

export const useStorage = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

  const upload = async (asset: ImagePickerAsset, { bucket }: UploadOptions) => {
    if (!user || !session) {
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);

    try {
      const file = asset;
      const fileName = `${user.id}/${new Date().getTime()}.${file.uri.split('.').pop()}`;
      const formData = new FormData();
      
      const fileData: any = {
        uri: file.uri,
        name: fileName,
        type: file.mimeType ?? 'image/jpeg',
      };

      formData.append('file', fileData);
  
      const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });
  
      const uploadData = await uploadResponse.json();
  
      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Failed to upload image.');
      }
      
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;

      return { publicUrl, error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)), publicUrl: null };
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading };
};

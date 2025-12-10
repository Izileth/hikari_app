
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, getFeedPosts as apiGetFeedPosts, createPost as apiCreatePost } from '@/lib/social';
import { useProfile } from './ProfileContext';
import { Alert } from 'react-native';
import { Database } from '@/lib/database.types';

interface SocialContextType {
  posts: Post[];
  loading: boolean;
  refreshFeed: () => Promise<void>;
  createPost: (post: { title: string; description: string; post_type?: Database['public']['Enums']['feed_post_type'], shared_data?: any }) => Promise<{ error: Error | null; }>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  const refreshFeed = async () => {
    setLoading(true);
    const { data, error } = await apiGetFeedPosts();
    if (data) {
      setPosts(data);
    }
    if (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const createPost = async (post: { title: string; description: string; post_type?: Database['public']['Enums']['feed_post_type'], shared_data?: any }) => {
    if (!profile) {
        const err = new Error('You must be logged in to create a post.');
        Alert.alert('Error', err.message);
        return { error: err };
    }

    const { data, error } = await apiCreatePost({ ...post, profile_id: profile.id });
    if(data) {
        setPosts(data);
    }
    
    return { error: error ? new Error(error.message) : null };
  };

  useEffect(() => {
    if (profile) {
      refreshFeed();
    }
  }, [profile]);

  return (
    <SocialContext.Provider value={{ posts, loading, refreshFeed, createPost }}>
      {children}
    </SocialContext.Provider>
  );
}

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

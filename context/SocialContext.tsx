
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Post, 
  Comment,
  getFeedPosts as apiGetFeedPosts, 
  createPost as apiCreatePost, 
  updatePost as apiUpdatePost, 
  deletePost as apiDeletePost,
  toggleLike as apiToggleLike,
  addComment as apiAddComment,
  getComments as apiGetComments,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from '@/lib/social';
import { useProfile } from './ProfileContext';
import { Alert } from 'react-native';
import { Database } from '@/lib/database.types';

interface SocialContextType {
  posts: Post[];
  comments: Comment[];
  loading: boolean;
  loadingComments: boolean;
  likingPostId: number | null;
  refreshFeed: () => Promise<void>;
  createPost: (post: { title: string; description: string; post_type?: Database['public']['Enums']['feed_post_type'], shared_data?: any }) => Promise<{ error: Error | null; }>;
  updatePost: (postId: number, updates: { title?: string; description?: string; privacy_level?: Database['public']['Enums']['post_privacy_level']; shared_data?: any }) => Promise<{ error: Error | null; }>;
  deletePost: (postId: number) => Promise<{ error: Error | null; }>;
  toggleLike: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string) => Promise<void>;
  fetchComments: (postId: number) => Promise<void>;
  updateComment: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const { profile } = useProfile();

  const refreshFeed = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiGetFeedPosts();
    if (data && profile) {
      const processedPosts = data.map(post => ({
        ...post,
        user_has_liked: post.post_likes.some(like => like.profile_id === profile.id)
      }));
      setPosts(processedPosts);
    } else if (data) {
      setPosts(data);
    }

    if (error) {
      console.error(error);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    if (profile) {
      refreshFeed();
    }
  }, [profile, refreshFeed]);

  const createPost = async (post: { title: string; description: string; post_type?: Database['public']['Enums']['feed_post_type'], shared_data?: any }) => {
    if (!profile) {
        const err = new Error('Você precisa estar logado para criar uma postagem.');
        Alert.alert('Erro', err.message);
        return { error: err };
    }

    const { data, error } = await apiCreatePost({ ...post, profile_id: profile.id });
    if(data) {
        await refreshFeed();
    }
    
    return { error: error ? new Error(error.message) : null };
  };

  const updatePost = async (postId: number, updates: { title?: string; description?: string; privacy_level?: Database['public']['Enums']['post_privacy_level']; shared_data?: any }) => {
    const { error } = await apiUpdatePost(postId, updates);
    if (!error) {
      await refreshFeed();
    }
    return { error: error ? new Error(error.message) : null };
  };

  const deletePost = async (postId: number) => {
    const { error } = await apiDeletePost(postId);
    if (!error) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    }
    return { error: error ? new Error(error.message) : null };
  };

  const toggleLike = async (postId: number) => {
    if (!profile || likingPostId === postId) return;

    setLikingPostId(postId);
    
    setPosts(currentPosts =>
      currentPosts.map(p => {
        if (p.id === postId) {
          const userHasLiked = p.user_has_liked;
          return {
            ...p,
            like_count: userHasLiked ? p.like_count - 1 : p.like_count + 1,
            user_has_liked: !userHasLiked,
          };
        }
        return p;
      })
    );

    try {
        await apiToggleLike(postId, profile.id);
    } catch (error) {
        console.error("Failed to toggle like, reverting UI.", error);
        // Revert UI on error
        await refreshFeed();
    } finally {
        setLikingPostId(null);
    }
  };
  
  const fetchComments = async (postId: number) => {
    setLoadingComments(true);
    const { data, error } = await apiGetComments(postId);
    if (data) {
      setComments(data);
    }
    if (error) {
      console.error("Failed to fetch comments", error);
      setComments([]);
    }
    setLoadingComments(false);
  };

  const addComment = async (postId: number, content: string) => {
    if (!profile) return;
    
    const { data: newComment, error } = await apiAddComment(postId, profile.id, content);

    if (newComment) {
      setComments(prevComments => [...prevComments, newComment as Comment]);
      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p));
    }
    if (error) {
        Alert.alert("Erro", "Não foi possível adicionar o seu comentário.");
    }
  };

  const updateComment = async (commentId: number, content: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? {...c, content} : c));
    await apiUpdateComment(commentId, content);
  }

  const deleteComment = async (commentId: number) => {
    const originalComments = comments;
    setComments(prev => prev.filter(c => c.id !== commentId));
    
    const { error } = await apiDeleteComment(commentId);
    if (error) {
        Alert.alert("Erro", "Não foi possível excluir o comentário.");
        setComments(originalComments); // Revert on failure
    }
  }

  return (
    <SocialContext.Provider value={{ 
        posts, 
        comments,
        loading, 
        loadingComments,
        likingPostId,
        refreshFeed, 
        createPost, 
        updatePost, 
        deletePost,
        toggleLike,
        addComment,
        fetchComments,
        updateComment,
        deleteComment
    }}>
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

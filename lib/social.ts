
import { supabase } from './supabase';
import { Database } from './database.types';

export type Post = Database['public']['Tables']['feed_posts']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'name' | 'nickname' | 'avatar_url'> | null;
  like_count: number;
  comment_count: number;
};

export const getFeedPosts = async (): Promise<{ data: Post[] | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('feed_posts')
    .select(`
      *,
      profiles (id, name, nickname, avatar_url),
      post_likes ( count ),
      post_comments ( count )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feed posts:', error);
    return { data: null, error: new Error(error.message) };
  }

  const posts = data.map(post => ({
    ...post,
    like_count: post.post_likes[0]?.count ?? 0,
    comment_count: post.post_comments[0]?.count ?? 0,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
  }));

  // @ts-ignore
  return { data: posts, error: null };
};

export const createPost = async (post: {
    profile_id: number;
    title: string;
    description: string;
    post_type?: Database['public']['Enums']['feed_post_type'];
    shared_data?: any;
}) => {
    const { data, error } = await supabase
        .from('feed_posts')
        .insert([post])
        .select();

    if (error) {
        console.error('Error creating post:', error);
        return { data: null, error };
    }

    return getFeedPosts();
}

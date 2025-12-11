import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Post } from '@/lib/social';
import { Svg, Path } from 'react-native-svg';
import { useProfile } from '@/context/ProfileContext';
import { useSocial } from '@/context/SocialContext';
import { useRouter } from 'expo-router';

const HeartIcon = ({ size = 20, filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
);

const MessageCircleIcon = ({ size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </Svg>
);

const EditIcon = ({ size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
);

const TrashIcon = ({ size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
    </Svg>
);

const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function PostCard({ post }: { post: Post }) {
  const { profile } = useProfile();
  const { deletePost, refreshFeed } = useSocial();
  const router = useRouter();

  const isOwner = profile?.id === post.profile_id;

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta postagem?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const { error } = await deletePost(post.id);
            if (error) {
              Alert.alert("Erro", "Falha ao excluir postagem: " + error.message);
            } else {
              refreshFeed();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: "/edit-post",
      params: { postId: post.id.toString() },
    });
  };

  const renderContent = () => {
    if (post.post_type === 'transaction_share' || post.post_type === 'achievement') {
        return (
            <View className="bg-white/5 border border-white/10 rounded-lg p-4 my-3">
                <Text className="text-white font-bold text-base mb-2">{post.title}</Text>
                <Text className="text-white/80 text-sm leading-5">{post.description}</Text>
            </View>
        );
    }

    return (
        <>
            {post.title && <Text className="text-white font-bold text-lg mb-2">{post.title}</Text>}
            {post.description && <Text className="text-white text-base leading-6">{post.description}</Text>}
        </>
    );
  };

  return (
    <View className="border border-white/20 rounded-lg p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        {/* Avatar */}
        <View className="w-11 h-11 rounded-full bg-white/10 mr-3 items-center justify-center overflow-hidden">
          {post.profiles?.avatar_url ? (
            <Image source={{ uri: post.profiles.avatar_url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-white text-base font-bold">{getInitials(post.profiles?.name || '')}</Text>
          )}
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">{post.profiles?.name}</Text>
          {post.profiles?.nickname && (
            <Text className="text-white/40 text-sm">@{post.profiles.nickname}</Text>
          )}
        </View>

        {/* Owner Actions */}
        {isOwner && (
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={handleEdit} className="p-2" activeOpacity={0.7}>
              <EditIcon size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="p-2" activeOpacity={0.7}>
              <TrashIcon size={18} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {renderContent()}

      {/* Footer */}
      <View className="flex-row items-center mt-4 pt-4 border-t border-white/10">
        <TouchableOpacity className="flex-row items-center mr-6" activeOpacity={0.7}>
          <HeartIcon size={20} filled={false} />
          <Text className="text-white/60 text-sm ml-2">{post.like_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center" activeOpacity={0.7}>
          <MessageCircleIcon size={20} />
          <Text className="text-white/60 text-sm ml-2">{post.comment_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
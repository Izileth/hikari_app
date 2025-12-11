
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Post } from '@/lib/social';
import { ThemedText } from '../themed-text';
import { Svg, Path } from 'react-native-svg';
import { useProfile } from '@/context/ProfileContext';
import { useSocial } from '@/context/SocialContext';
import { useRouter } from 'expo-router';

const HeartIcon = ({ size = 16, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
);

const MessageCircleIcon = ({ size = 16, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </Svg>
);

const EditIcon = ({ size = 16, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
);

const TrashIcon = ({ size = 16, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </Svg>
);

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
              refreshFeed(); // Refresh the feed after deletion
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
            <View style={styles.sharedContent}>
                <ThemedText style={styles.sharedTitle}>{post.title}</ThemedText>
                <ThemedText style={styles.sharedDescription}>{post.description}</ThemedText>
            </View>
        )
    }

    return (
        <>
            {post.title && <ThemedText type='subtitle' style={styles.title}>{post.title}</ThemedText>}
            {post.description && <ThemedText style={styles.description}>{post.description}</ThemedText>}
        </>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.profiles?.avatar_url ? (
            <Image source={{ uri: post.profiles.avatar_url }} style={styles.avatarImage} />
          ) : (
            <ThemedText style={styles.initials}>{getInitials(post.profiles?.name || '')}</ThemedText>
          )}
        </View>
        <View style={{ flex: 1 }}> {/* Added flex: 1 to make space for buttons */}
          <ThemedText type="defaultSemiBold">{post.profiles?.name}</ThemedText>
          {post.profiles?.nickname && <ThemedText style={styles.nickname}>@{post.profiles.nickname}</ThemedText>}
        </View>
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <EditIcon size={18} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <TrashIcon size={18} color="#FF453A" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {renderContent()}

      <View style={styles.footer}>
        <View style={styles.footerAction}>
            <HeartIcon color='#8E8E93' />
            <ThemedText style={styles.footerText}>{post.like_count}</ThemedText>
        </View>
        <View style={styles.footerAction}>
            <MessageCircleIcon color='#8E8E93' />
            <ThemedText style={styles.footerText}>{post.comment_count}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3C',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nickname: {
    color: '#8E8E93',
    fontSize: 14,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  sharedContent: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  sharedTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  sharedDescription: {
    fontSize: 14,
    color: '#E5E5EA',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  footerText: {
    marginLeft: 6,
    color: '#8E8E93',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
});


import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Post } from '@/lib/social';
import { ThemedText } from '../themed-text';
import { Svg, Path } from 'react-native-svg';

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

export default function PostCard({ post }: { post: Post }) {
  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
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
        <View>
          <ThemedText type="defaultSemiBold">{post.profiles?.name}</ThemedText>
          {post.profiles?.nickname && <ThemedText style={styles.nickname}>@{post.profiles.nickname}</ThemedText>}
        </View>
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
  }
});

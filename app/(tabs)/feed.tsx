
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import PostCard from '@/components/social/PostCard';
import CustomHeader from '@/components/ui/CustomHeader';

export default function FeedScreen() {
  const { posts, loading } = useSocial();

  const renderContent = () => {
    if (loading && !posts.length) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      );
    }

    return (
        <FlatList
            data={posts}
            renderItem={({ item }) => <PostCard post={item} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                !loading ? <ThemedText>No posts in the feed yet.</ThemedText> : null
            }
        />
    );
  }

  return (
    <ThemedView style={styles.container}>
        <CustomHeader/>
        {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
});

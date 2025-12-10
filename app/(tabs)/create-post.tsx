
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, View } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Database } from '@/lib/database.types';
import CustomHeader from '@/components/ui/CustomHeader';

export default function CreatePostScreen() {
    const params = useLocalSearchParams<{ title?: string; description?: string, type?: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { createPost } = useSocial();
    const router = useRouter();

    useEffect(() => {
        if (params.title) {
            setTitle(params.title);
        }
        if (params.description) {
            setDescription(params.description);
        }
    }, [params]);

    const handleCreatePost = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Title is required.');
            return;
        }

        setLoading(true);
        const post_type = params.type as Database['public']['Enums']['feed_post_type'] || 'manual';
        const { error } = await createPost({ title, description, post_type });
        setLoading(false);

        if (error) {
            Alert.alert('Error', 'Failed to create post.');
        } else {
            router.back();
        }
    };

  return (
    <ThemedView style={styles.container}>
        <CustomHeader />
        <View style={styles.formContainer}>
            <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#8E8E93"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's on your mind?"
                placeholderTextColor="#8E8E93"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TouchableOpacity style={styles.button} onPress={handleCreatePost} disabled={loading}>
                {loading ? (
                <ActivityIndicator color="#FFFFFF" />
                ) : (
                <ThemedText style={styles.buttonText}>Post</ThemedText>
                )}
            </TouchableOpacity>
        </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  formContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

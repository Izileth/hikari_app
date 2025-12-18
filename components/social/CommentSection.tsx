import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import { useProfile } from '@/context/ProfileContext';
import { Comment } from '@/lib/social';
import { EditIcon, TrashIcon, SendIcon, MessageIconEmptyState } from '../ui/Icons';

const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function CommentSection({ postId }: { postId: number }) {
    const { comments, loadingComments, addComment, updateComment, deleteComment } = useSocial();
    const { profile } = useProfile();
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<{ id: number, content: string } | null>(null);

    const handleAddComment = async () => {
        if (newComment.trim() === '') return;
        await addComment(postId, newComment);
        setNewComment('');
    };

    const handleDeleteComment = (commentId: number) => {
        Alert.alert(
            "Excluir Comentário",
            "Tem certeza que deseja excluir este comentário?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", style: "destructive", onPress: () => deleteComment(commentId) }
            ]
        );
    };

    const handleUpdateComment = () => {
        if (!editingComment || editingComment.content.trim() === '') return;
        updateComment(editingComment.id, editingComment.content);
        setEditingComment(null);
    };

    const renderComment = ({ item: comment }: { item: Comment }) => {
        const isOwner = profile?.id === comment.profile_id;
        const isEditing = editingComment?.id === comment.id;

        return (
            <View className="flex-col mb-6">
                {/* Avatar */}
                <View className="flex-row items-start mb-2">

                    <View className="w-10 h-10 rounded-full bg-white/10 mr-3 items-center justify-center overflow-hidden">
                        {comment.profiles?.avatar_url ? (
                            <Image
                                source={{ uri: comment.profiles.avatar_url }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Text className="text-white text-sm font-bold">
                                {getInitials(comment.profiles?.name || '')}
                            </Text>
                        )}
                    </View>

                    <Text className="text-white font-semibold text-sm mb-1.5">
                        {comment.profiles?.name}
                    </Text>

                </View>
                {/* Comment Content */}
                <View className="flex-1">
                    <View className={`bg-black px-4 py-3 rounded-xl ${isOwner ? 'border border-zinc-900' : ''}`}>
                        {isEditing ? (
                            <TextInput
                                value={editingComment.content}
                                onChangeText={(text) => setEditingComment({ ...editingComment, content: text })}
                                autoFocus
                                multiline
                                className="text-white text-base leading-5"
                                placeholderTextColor="#666666"
                            />
                        ) : (
                            <Text className="text-white/90 text-base leading-5">
                                {comment.content}
                            </Text>
                        )}
                    </View>

                    {/* Owner Actions */}
                    {isOwner && (
                        <View className="flex-row items-center gap-5 mt-4 ml-1">
                            {isEditing ? (
                                <>
                                    <TouchableOpacity
                                        onPress={handleUpdateComment}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-white text-xs font-bold">
                                            Salvar
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setEditingComment(null)}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-white/40 text-xs">
                                            Cancelar
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setEditingComment({ id: comment.id, content: comment.content })}
                                        className="flex-row items-center gap-1"
                                        activeOpacity={0.7}
                                    >
                                        <EditIcon size={14} />
                                        <Text className="text-white/60 text-xs">
                                            Editar
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteComment(comment.id)}
                                        className="flex-row items-center gap-1"
                                        activeOpacity={0.7}
                                    >
                                        <TrashIcon size={14} />
                                        <Text className="text-red-500 text-xs">
                                            Excluir
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View>
            {loadingComments ? (
                <View className="py-12 items-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View className="py-12 items-center">
                            <MessageIconEmptyState size={40} />
                            <Text className="text-white/40 text-sm text-center mt-4">
                                Nenhum comentário ainda.
                            </Text>
                            <Text className="text-white/30 text-xs text-center mt-1">
                                Seja o primeiro a comentar!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* New Comment Input */}
            <View className="flex-row items-end mt-6 gap-2 border border-white/20 rounded-lg bg-white/5">
                <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Adicione um comentário..."
                    placeholderTextColor="#666666"
                    className="flex-1 py-4 px-4 text-white text-base"
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    onPress={handleAddComment}
                    className="p-4"
                    activeOpacity={0.7}
                    disabled={newComment.trim() === ''}
                >
                    <SendIcon
                        size={22}
                        color={newComment.trim() === '' ? '#333333' : '#ffffff'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
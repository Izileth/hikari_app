
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, View, FlatList } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Database } from '@/lib/database.types';
import CustomHeader from '@/components/ui/CustomHeader';
import { useFinancials } from '@/context/FinancialContext';

export default function EditPostScreen() {
    const params = useLocalSearchParams();
    const postId = params.postId ? parseInt(params.postId as string) : null;
    const { posts, updatePost, loading: socialLoading } = useSocial();
    const { transactions, loading: financialsLoading } = useFinancials();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [originalPost, setOriginalPost] = useState<Database['public']['Tables']['feed_posts']['Row'] | null>(null);

    const [showFinancialAttachment, setShowFinancialAttachment] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);


    useEffect(() => {
        if (postId && posts.length > 0) {
            const postToEdit = posts.find(p => p.id === postId);
            if (postToEdit) {
                setOriginalPost(postToEdit);
                setTitle(postToEdit.title || '');
                setDescription(postToEdit.description || '');

                if (postToEdit.shared_data && typeof postToEdit.shared_data === 'object' && 'transaction_id' in postToEdit.shared_data) {
                    setSelectedTransactionId(parseInt((postToEdit.shared_data as { transaction_id: string }).transaction_id)); // Parse back to number
                    setShowFinancialAttachment(true);
                }
            } else {
                Alert.alert('Erro', 'Postagem não encontrada.');
                router.back();
            }
        } else if (!postId) {
            Alert.alert('Erro', 'ID da postagem não fornecido.');
            router.back();
        }
    }, [postId, posts]);

    const handleUpdatePost = async () => {
        if (!originalPost) {
            Alert.alert('Erro', 'Postagem original não carregada.');
            return;
        }
        if (!title.trim()) {
            Alert.alert('Erro', 'O título é obrigatório.');
            return;
        }

        setLoading(true);
        
        let shared_data: any = undefined;
        if (selectedTransactionId) {
            const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);
            if (selectedTransaction) {
                shared_data = {
                    transaction_id: selectedTransaction.id.toString(), // Convert to string
                    amount: selectedTransaction.amount,
                    description: selectedTransaction.description,
                    transaction_date: selectedTransaction.transaction_date,
                };
            }
        }

        const updates = {
            title,
            description,
            // privacy_level: originalPost.privacy_level, // Keep original or add UI to change
            shared_data: shared_data,
        };

        const { error } = await updatePost(originalPost.id, updates);
        setLoading(false);

        if (error) {
            Alert.alert('Erro', 'Falha ao atualizar post: ' + error.message);
        } else {
            router.back();
        }
    };

    if (socialLoading || financialsLoading || !originalPost && postId) {
        return (
            <ThemedView style={styles.container}>
                <CustomHeader />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="large" />
                    <ThemedText style={styles.loadingText}>Carregando postagem...</ThemedText>
                </View>
            </ThemedView>
        );
    }


  return (
    <ThemedView style={styles.container}>
        <CustomHeader />
        <View style={styles.formContainer}>
            <TextInput
                style={styles.input}
                placeholder="Título"
                placeholderTextColor="#8E8E93"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="No que você está pensando?"
                placeholderTextColor="#8E8E93"
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <TouchableOpacity 
                style={styles.attachButton} 
                onPress={() => setShowFinancialAttachment(!showFinancialAttachment)}
            >
                <ThemedText style={styles.attachButtonText}>
                    {showFinancialAttachment ? 'Ocultar Anexo Financeiro' : 'Anexar Dados Financeiros'}
                </ThemedText>
            </TouchableOpacity>

            {showFinancialAttachment && (
                <View style={styles.financialAttachmentContainer}>
                    {financialsLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <FlatList
                            data={transactions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.transactionItem,
                                        selectedTransactionId === item.id && styles.selectedTransactionItem,
                                    ]}
                                    onPress={() => setSelectedTransactionId(item.id === selectedTransactionId ? null : item.id)}
                                >
                                    <ThemedText style={styles.transactionDescription}>{item.description}</ThemedText>
                                    <ThemedText style={styles.transactionAmount}>
                                        R$ {parseFloat(item.amount).toFixed(2)}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<ThemedText style={styles.emptyListText}>Nenhuma transação disponível.</ThemedText>}
                        />
                    )}
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleUpdatePost} disabled={loading}>
                {loading ? (
                <ActivityIndicator color="#FFFFFF" />
                ) : (
                <ThemedText style={styles.buttonText}>Atualizar Post</ThemedText>
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
  attachButton: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  attachButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  financialAttachmentContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    maxHeight: 200, // Limit height to avoid excessive scrolling
  },
  transactionItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedTransactionItem: {
    backgroundColor: '#007AFF', // Highlight color for selected item
  },
  transactionDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  transactionAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyListText: {
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
  }
});
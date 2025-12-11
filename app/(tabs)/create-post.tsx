import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList, ScrollView } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Database } from '@/lib/database.types';
import CustomHeader from '@/components/ui/CustomHeader';
import { useFinancials } from '@/context/FinancialContext';
import Svg, { Path, Circle } from 'react-native-svg';

// Icons
const PaperclipIcon = ({ size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </Svg>
);

const CheckIcon = ({ size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

const ArrowUpIcon = ({ size = 16 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 19V5M5 12l7-7 7 7" />
    </Svg>
);

const ArrowDownIcon = ({ size = 16 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 5v14M19 12l-7 7-7-7" />
    </Svg>
);

export default function CreatePostScreen() {
    const params = useLocalSearchParams<{ title?: string; description?: string, type?: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
    const [showFinancialAttachment, setShowFinancialAttachment] = useState(false);
    const { createPost } = useSocial();
    const { transactions, loading: financialsLoading } = useFinancials();
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
            Alert.alert('Atenção', 'O título é obrigatório');
            return;
        }

        setLoading(true);
        const post_type = params.type as Database['public']['Enums']['feed_post_type'] || 'manual';
        
        let shared_data: any = undefined;
        if (selectedTransactionId) {
            const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);
            if (selectedTransaction) {
                shared_data = {
                    transaction_id: selectedTransaction.id.toString(),
                    amount: selectedTransaction.amount,
                    description: selectedTransaction.description,
                    transaction_date: selectedTransaction.transaction_date,
                };
            }
        }

        const { error } = await createPost({ title, description, post_type, shared_data });
        setLoading(false);

        if (error) {
            Alert.alert('Erro', 'Falha ao criar post: ' + error.message);
        } else {
            router.back();
        }
    };

    return (
        <View className="flex-1 bg-black">
            <CustomHeader />
            <ScrollView className="flex-1">
                <View className="p-6">
                    {/* Title Input */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Título</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="px-4 py-4 text-white text-base"
                                placeholder="Dê um título ao seu post"
                                placeholderTextColor="#666666"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    {/* Description Input */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Descrição</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="px-4 py-4 text-white text-base min-h-[120px]"
                                placeholder="No que você está pensando?"
                                placeholderTextColor="#666666"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Attach Financial Data Button */}
                    <TouchableOpacity 
                        className="flex-row items-center justify-center border border-white/20 rounded-lg py-3 mb-6"
                        onPress={() => setShowFinancialAttachment(!showFinancialAttachment)}
                        activeOpacity={0.7}
                    >
                        <PaperclipIcon size={18} />
                        <Text className="text-white font-medium ml-2">
                            {showFinancialAttachment ? 'Ocultar Transações' : 'Anexar Transação'}
                        </Text>
                    </TouchableOpacity>

                    {/* Financial Attachment List */}
                    {showFinancialAttachment && (
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-3">Selecione uma transação</Text>
                            {financialsLoading ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator color="#ffffff" size="small" />
                                </View>
                            ) : transactions.length > 0 ? (
                                <View className="border border-white/20 rounded-lg overflow-hidden">
                                    {transactions.slice(0, 5).map((item, index) => {
                                        const isSelected = selectedTransactionId === item.id;
                                        const isIncome = Number(item.amount) > 0;
                                        
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                className={`flex-row items-center justify-between p-4 ${
                                                    index !== transactions.length - 1 ? 'border-b border-white/10' : ''
                                                } ${isSelected ? 'bg-white/10' : ''}`}
                                                onPress={() => setSelectedTransactionId(isSelected ? null : item.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View className="flex-row items-center flex-1 mr-4">
                                                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                                        isIncome ? 'bg-white/10' : 'bg-white/10'
                                                    }`}>
                                                        {isIncome ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-white font-medium text-base" numberOfLines={1}>
                                                            {item.description}
                                                        </Text>
                                                        <Text className="text-white/40 text-xs mt-0.5">
                                                            {new Date(item.transaction_date).toLocaleDateString('pt-BR')}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center gap-3">
                                                    <Text className="text-white font-bold text-base">
                                                        {new Intl.NumberFormat('pt-BR', { 
                                                            style: 'currency', 
                                                            currency: 'BRL' 
                                                        }).format(Math.abs(Number(item.amount)))}
                                                    </Text>
                                                    {isSelected && (
                                                        <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                                                            <CheckIcon size={14} />
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View className="border border-white/20 rounded-lg p-8 items-center">
                                    <Text className="text-white/40 text-center">
                                        Nenhuma transação disponível
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Selected Transaction Info */}
                    {selectedTransactionId && (
                        <View className="bg-white/5 border border-white/20 rounded-lg p-4 mb-6">
                            <Text className="text-white/60 text-xs mb-1">Transação anexada</Text>
                            <Text className="text-white font-medium">
                                {transactions.find(t => t.id === selectedTransactionId)?.description}
                            </Text>
                        </View>
                    )}

                    {/* Create Post Button */}
                    <TouchableOpacity 
                        className={`rounded-lg py-4 ${loading ? 'bg-white/20' : 'bg-white'}`}
                        onPress={handleCreatePost} 
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-black text-center font-bold text-base">
                                Publicar
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
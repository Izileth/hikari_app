import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountManager from '../../components/financials/AccountManager';
import CategoryManager from '../../components/financials/CategoryManager';

import Svg, { Path } from 'react-native-svg';
import { useRouter } from "expo-router";

const BackIcon = ({ size = 24, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
);
export default function FinancialSettingsScreen() {
    const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts');
    const router = useRouter();
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <SafeAreaView className="flex-1 bg-black">
                <View className="flex-1 ">
                    {/* Header */}
                    <View className="flex-row items-center p-4">
                        <TouchableOpacity onPress={() => router.back()} className="p-2">
                            <BackIcon />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold ml-4">Minhas Finanças</Text>
                    </View>

                    <View className="flex-1 px-4 pt-6">
                        {/* Tab Switcher */}
                        <View className="px-0 mb-6">
                            <View className="flex-row border border-white/20 rounded-lg overflow-hidden">
                                <TouchableOpacity
                                    onPress={() => setActiveTab('accounts')}
                                    className="flex-1 py-3 relative"
                                >
                                    <Text className={`text-center font-bold ${activeTab === 'accounts' ? 'text-white' : 'text-white/40'}`}>
                                        Contas
                                    </Text>
                                    {activeTab === 'accounts' && (
                                        <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                    )}
                                </TouchableOpacity>

                                <View className="w-px bg-white/20" />

                                <TouchableOpacity
                                    onPress={() => setActiveTab('categories')}
                                    className="flex-1 py-3 relative"
                                >
                                    <Text className={`text-center font-bold ${activeTab === 'categories' ? 'text-white' : 'text-white/40'}`}>
                                        Categorias
                                    </Text>
                                    {activeTab === 'categories' && (
                                        <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Content */}
                        <ScrollView className="flex-1">
                            {activeTab === 'accounts' ? (
                                <AccountManager onClose={() => { }} />
                            ) : (
                                <CategoryManager onClose={() => { }} />
                            )}
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
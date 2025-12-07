import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Switch } from "react-native";
import React, { useState, useEffect } from 'react';
import { useProfile } from "../../context/ProfileContext";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from 'react-native-svg';

const GlobeIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
        <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

const BackIcon = ({ size = 24, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
);

export default function EditProfileScreen() {
    const { profile, updateProfile, loading: profileLoading } = useProfile();
    const router = useRouter();

    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [preferences, setPreferences] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setNickname(profile.nickname || '');
            setBio(profile.bio || '');
            setIsPublic(profile.is_public);
            setPreferences(JSON.stringify(profile.preferences || {}, null, 2));
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'O nome é obrigatório');
            return;
        }

        let parsedPrefs;
        try {
            parsedPrefs = JSON.parse(preferences);
        } catch (e) {
            Alert.alert('Erro', 'As preferências não são um JSON válido.');
            return;
        }

        setIsSaving(true);
        const { error } = await updateProfile({
            name,
            nickname,
            bio,
            is_public: isPublic,
            preferences: parsedPrefs,
        });

        if (error) {
            Alert.alert('Erro', error.message);
        } else {
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            router.back();
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        router.back();
    };

    if (profileLoading && !profile) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white/60 mt-4">Carregando perfil...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1  pt-16">
                    {/* Header */}
                    <View className="flex-row w-full max-w-full items-center px-4">
                        <TouchableOpacity onPress={() => router.back()} className="p-2">
                            <BackIcon />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold ml-4">Minhas Finanças</Text>
                    </View>
                    <View className="flex-1  px-8 pt-8 pb-8">
                        {/* Name */}
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">
                                Nome completo
                            </Text>
                            <View className="border rounded-lg border-white/40">
                                <TextInput
                                    placeholder="Seu nome"
                                    placeholderTextColor="#666666"
                                    value={name}
                                    onChangeText={setName}
                                    className="px-4 py-3 text-white text-base"
                                />
                            </View>
                        </View>

                        {/* Nickname */}
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">
                                Apelido
                            </Text>
                            <View className="border rounded-lg flex-row items-center border-white/40">
                                <Text className="text-white/40 pl-4 text-base">@</Text>
                                <TextInput
                                    placeholder="apelido"
                                    placeholderTextColor="#666666"
                                    value={nickname}
                                    onChangeText={setNickname}
                                    autoCapitalize="none"
                                    className="flex-1 px-2 py-3 text-white text-base"
                                />
                            </View>
                        </View>

                        {/* Bio */}
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">
                                Sobre você
                            </Text>
                            <View className="border rounded-lg border-white/40">
                                <TextInput
                                    placeholder="Conte um pouco sobre você..."
                                    placeholderTextColor="#666666"
                                    value={bio}
                                    onChangeText={setBio}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    className="px-4 py-3 text-white text-base min-h-[100px]"
                                />
                            </View>
                        </View>

                        {/* Public Profile Toggle */}
                        <View className="flex-row items-center justify-between mb-6 p-4 border border-white/20 rounded-lg">
                            <View className="flex-row items-center flex-1">
                                <GlobeIcon size={20} />
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-medium">Perfil Público</Text>
                                    <Text className="text-white/40 text-xs mt-1">
                                        Outros usuários poderão ver seu perfil
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                trackColor={{ false: '#333333', true: '#ffffff' }}
                                thumbColor={isPublic ? '#000000' : '#666666'}
                                ios_backgroundColor="#333333"
                                onValueChange={setIsPublic}
                                value={isPublic}
                            />
                        </View>

                        {/* Preferences */}
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">
                                Preferências (JSON)
                            </Text>
                            <View className="border rounded-lg border-white/40">
                                <TextInput
                                    placeholder='{"theme": "dark"}'
                                    placeholderTextColor="#666666"
                                    value={preferences}
                                    onChangeText={setPreferences}
                                    multiline
                                    autoCapitalize="none"
                                    textAlignVertical="top"
                                    className="px-4 py-3 text-white text-base min-h-[100px] font-mono"
                                />
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mb-6">
                            <TouchableOpacity
                                onPress={handleCancel}
                                disabled={isSaving}
                                className="flex-1 border border-white/20 rounded-lg py-3"
                            >
                                <Text className="text-white text-center font-medium">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdateProfile}
                                disabled={isSaving}
                                className={`flex-1 rounded-lg py-3 ${isSaving ? 'bg-white/20' : 'bg-white'}`}
                            >
                                <Text className={`text-center font-bold ${isSaving ? 'text-white' : 'text-black'}`}>
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

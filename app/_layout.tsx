import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FinancialProvider } from '../context/FinancialContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ProfileProvider } from '@/context/ProfileContext';
import { SocialProvider } from '@/context/SocialContext';
import { View, Text, Animated } from "react-native";
import { FinanceLogoIcon } from "../components/ui/Icons";
import '@/global.css';

function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const welcomeFadeAnim = useRef(new Animated.Value(0)).current;
  const welcomeSlideAnim = useRef(new Animated.Value(20)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(welcomeFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(welcomeSlideAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
      ]),
      Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(loadingAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }} className="items-center">
        <Animated.View style={{ opacity: Animated.add(0.7, Animated.multiply(glowAnim, 0.3)), }} className="mb-6">
          <FinanceLogoIcon size={120} />
        </Animated.View>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text className="text-white text-5xl font-bold tracking-tight mb-2">Hikari</Text>
          <Text className="text-white/40 text-sm text-center tracking-widest uppercase">Finance Manager</Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={{ opacity: welcomeFadeAnim, transform: [{ translateY: welcomeSlideAnim }] }} className="absolute" pointerEvents="none">
        <View className="items-center mt-80">
          <Text className="text-white/90 text-2xl font-light tracking-wide">Bem-vindo</Text>
          <View className="h-0.5 w-16 bg-white/30 mt-2 rounded-full" />
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }} className="absolute bottom-20">
        <View className="flex-row gap-2">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                opacity: loadingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: index === 0 ? [0.3, 1] : index === 1 ? [0.5, 0.3] : [1, 0.5],
                }),
                transform: [{
                  scale: loadingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: index === 0 ? [1, 1.2] : index === 1 ? [1.2, 1] : [1, 1.2],
                  }),
                }],
              }}
              className="w-2 h-2 rounded-full bg-white"
            />
          ))}
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }} className="absolute bottom-8">
        <Text className="text-white/20 text-xs">v1.6.2</Text>
      </Animated.View>
    </View>
  );
}

function InitialLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (session && session.user) {
      router.replace('/(tabs)/feed');
    } else {
      router.replace('/(auth)/login');
    }
  }, [loading, session]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: '#000' } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <ProfileProvider>
            <SocialProvider>
              <FinancialProvider>
                <InitialLayout />
                <StatusBar style="light" backgroundColor="#000" translucent />
              </FinancialProvider>
            </SocialProvider>
          </ProfileProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
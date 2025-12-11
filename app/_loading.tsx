import { View, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import Svg, { Path, Circle } from 'react-native-svg';

// Logo SVG Component
const FinanceLogoIcon = ({ size = 120 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
    <Path d="M12 6v12M9 9h6M8 15h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Callback executado quando todas as animações terminam
      // Aguarda mais 1 segundo após as animações antes de navegar
      setTimeout(() => {
        router.replace("/redirector");
      }, 3000);
    });
  }, [fadeAnim, router, scaleAnim, slideAnim]);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {/* Logo Container com Animação */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
        className="items-center"
      >
        {/* Logo Icon */}
        <View className="mb-8">
          <FinanceLogoIcon size={120} />
        </View>

        {/* App Name com Animação */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text className="text-white text-5xl font-bold tracking-tight mb-2">
            Hikari
          </Text>
          <Text className="text-white/40 text-sm text-center tracking-widest uppercase">
            Finance Manager
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Loading Indicator */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute bottom-20"
      >
        <View className="flex-row gap-2">
          <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <View className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75" />
          <View className="w-2 h-2 rounded-full bg-white/30 animate-pulse delay-150" />
        </View>
      </Animated.View>

      {/* Version/Copyright */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute bottom-8"
      >
        <Text className="text-white/20 text-xs">
          v1.0.0
        </Text>
      </Animated.View>
    </View>
  );
}
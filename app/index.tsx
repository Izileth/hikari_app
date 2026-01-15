import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import SplashScreen from '../components/ui/SplashScreen';

export default function Index() {
  const router = useRouter();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Quando a animação da splash screen terminar, redireciona para a tela de login.
    if (splashFinished) {
      router.replace('/(auth)/login');
    }
  }, [splashFinished, router]);

  return <SplashScreen onFinish={() => setSplashFinished(true)} />;
}
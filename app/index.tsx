import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../components/ui/SplashScreen';

export default function Index() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Só redireciona quando a autenticação terminar de carregar E a splash finalizar
    if (!loading && splashFinished) {
      if (session && session.user) {
        router.replace('/(tabs)/feed');
      } else {
        router.replace('/(auth)/register');
      }
    }
  }, [loading, session, splashFinished, router]);

  return <SplashScreen onFinish={() => setSplashFinished(true)} />;
}
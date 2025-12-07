import { useAuth } from '../../context/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function AppLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{
      contentStyle: { backgroundColor: '#000' },
    }}>
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="financials" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="financial-settings" options={{ headerShown: false }} />
    </Stack>
  );
}

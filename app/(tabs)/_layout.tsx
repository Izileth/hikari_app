import { useAuth } from '../../context/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function AppLayout() {
  const { session } = useAuth();

  // If the user is not signed in, redirect to the login page.
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="financials" />
      <Stack.Screen name="feed" />
      <Stack.Screen name="create-post" />
      <Stack.Screen name="edit-post" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="financial-settings" />
      <Stack.Screen name="id" />
    </Stack>
  );
}
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";


export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return <></>;
  }

  if (session) {
    return <Redirect href="/(tabs)/profile" />;
  }

  return <Redirect href="/(auth)/login" />;
}
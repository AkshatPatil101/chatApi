import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for Clerk to load the session
  if (!isLoaded) return null;

  if (isSignedIn) {
    // If logged in, send them to the tabs
    return <Redirect href="/(tabs)" />;
  } else {
    // If not logged in, send them to auth
    return <Redirect href="/(auth)" />;
  }
}
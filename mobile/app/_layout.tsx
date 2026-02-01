import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '../global.css';

const queryClient = new QueryClient();

// Keep the splash screen visible
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Force the splash screen to stay for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide the splash screen manually
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
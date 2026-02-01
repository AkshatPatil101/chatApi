import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import '../global.css';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    'Lora': require('../assets/fonts/Lora.ttf'), 
    'Mono':require('../assets/fonts/DM_mono.ttf')
  });

  if (!fontsLoaded) {
    return null; 
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(auth)" />   
            <Stack.Screen name="(tabs)" />   
          </Stack> 
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}


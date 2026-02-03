import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import '../global.css';
import { useFonts } from 'expo-font';
import AuthSync from "@/components/auth/AuthSync";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Lora': require('../assets/fonts/Lora.ttf'), 
    'Mono': require('../assets/fonts/DM_mono.ttf')
  });

  if (!fontsLoaded) return null;

  return (
    // This MUST be the very first tag inside the return
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <AuthSync />
          
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />   
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            
            {/* The New Chat Screen Configuration */}
            <Stack.Screen
              name="new-chat/index"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' }, 
              }} 
            />
          </Stack>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
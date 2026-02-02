import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import '../global.css';
import { useFonts } from 'expo-font';


const queryClient = new QueryClient();


export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    'Lora': require('../assets/fonts/Lora.ttf'), 
    'Mono':require('../assets/fonts/DM_mono.ttf')
  });

  if (!fontsLoaded) {
    return null; 
  }
  return (
      <ClerkProvider tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(auth)" />   
            <Stack.Screen name="(tabs)" />   
          </Stack> 
        </QueryClientProvider>
      </ClerkProvider>
  );
}


import { useSocketStore } from "@/lib/socket";
import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import { AppState, AppStateStatus } from "react-native";

const SocketConnection = () => {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { data: mongoUser } = useCurrentUser();

  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // Store latest values in refs to avoid stale closures
  const latestValues = useRef({
    isSignedIn,
    mongoUser,
    isConnected,
    getToken,
    connect,
    disconnect,
    queryClient,
  });

  // Update refs on every render
  useEffect(() => {
    latestValues.current = {
      isSignedIn,
      mongoUser,
      isConnected,
      getToken,
      connect,
      disconnect,
      queryClient,
    };
  });

  // 1️⃣ Initial connection (login / cold start)
  useEffect(() => {
    if (!isSignedIn || !mongoUser) return;

    getToken({ skipCache: true }).then((token) => {
      if (token) {
        connect(token, queryClient);
      }
    });
  }, [isSignedIn, mongoUser, getToken, connect, queryClient]);

  // 2️⃣ Handle app state changes (only register listener once)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const wasBackground =
          appState.current === "inactive" ||
          appState.current === "background";

        const isGoingToBackground =
          nextAppState === "background" ||
          nextAppState === "inactive";

        // Use refs to get latest values
        const { 
          isConnected, 
          disconnect, 
          isSignedIn, 
          mongoUser, 
          getToken, 
          connect, 
          queryClient 
        } = latestValues.current;

        // Disconnect when app goes to background
        if (isGoingToBackground && isConnected) {
          console.log("📱 App going to background → disconnecting socket");
          disconnect();
        }

        // Reconnect when app comes back to foreground
        if (wasBackground && nextAppState === "active" && isSignedIn && mongoUser) {
          console.log("📱 App resumed → reconnecting socket");
          const token = await getToken({ skipCache: true });
          if (token) {
            connect(token, queryClient);
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []); // Empty dependency array - only register once

  return null;
};

export default SocketConnection;
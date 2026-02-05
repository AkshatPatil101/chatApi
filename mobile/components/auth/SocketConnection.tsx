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

  // Track current app state
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // 1️⃣ Initial connection (login / cold start)
  useEffect(() => {
    if (!isSignedIn || !mongoUser) return;

    getToken({ skipCache: true }).then((token) => {
      if (token) {
        connect(token, queryClient);
      }
    });
  }, [isSignedIn, mongoUser, getToken, connect, queryClient]);

  // 2️⃣ Reconnect when app wakes up
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const wasBackground =
          appState.current === "inactive" ||
          appState.current === "background";

        if (wasBackground && nextAppState === "active") {
          console.log("📱 App resumed → refreshing socket");

          if (isSignedIn && mongoUser) {
            const token = await getToken({ skipCache: true });
            if (token) {
              disconnect(); // kill stale transport
              connect(token, queryClient); // fresh socket + fresh token
            }
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isSignedIn, mongoUser, getToken, connect, disconnect, queryClient]);

  // 3️⃣ Disconnect ONLY on logout
  useEffect(() => {
    if (!isSignedIn) {
      disconnect();
    }
  }, [isSignedIn, disconnect]);

  return null;
};

export default SocketConnection;

import EmptyUI from "@/components/chat/EmptyUi";
import MessageBubble from "@/components/chat/MessageBubble";
import { useCurrentUser } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useSocketStore } from "@/lib/socket";
import { MessageSender } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState,useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatParams = {
  id: string;
  participantId: string;
  name: string;
  avatar: string;
};

const ChatDetailScreen = () => {
  const { id: chatId, avatar, name, participantId } = useLocalSearchParams<ChatParams>();

  const [messageText, setMessageText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: messages, isLoading, refetch } = useMessages(chatId);

  const {
    socket,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    isConnected,
    onlineUsers,
    typingUsers,
  } = useSocketStore();


  const isOnline = participantId ? onlineUsers.has(participantId) : false;
  const isTyping = typingUsers.get(chatId) === participantId;

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  


  //  Join chat & refetch on screen focus, leave on unfocus
  
  useEffect(() => {
    if (!isConnected || !chatId) return;
    
    refetch();
    console.log("refetch messages after socket reconnect", chatId);
  }, [isConnected, chatId, refetch]);

  // Handle joining/leaving chat room
  useFocusEffect(
    useCallback(() => {
      if (!chatId || !isConnected||!socket) return;

      joinChat(chatId);

      socket.emit("chat:markRead", chatId);

      return () => {
        leaveChat(chatId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, [chatId, isConnected, joinChat, leaveChat])
  );

  // Handle typing
  const handleTyping = useCallback(
    (text: string) => {
      setMessageText(text);
      if (!isConnected || !chatId) return;

      if (text.length > 0) {
        sendTyping(chatId, true);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
          sendTyping(chatId, false);
        }, 2000);
      } else {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        sendTyping(chatId, false);
      }
    },
    [chatId, isConnected, sendTyping]
  );

  // Handle sending message
  const handleSend = () => {
    if (!messageText.trim() || !isConnected || !currentUser) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(chatId, false);

    sendMessage(chatId, messageText.trim(), {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
    });

    setMessageText("");
    // Scroll handled automatically on new bubble via onContentSizeChange
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 bg-surface border-b border-surface-light">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F4A261" />
        </Pressable>

        <View className="flex-row items-center flex-1 ml-2">
          {avatar && <Image source={avatar} style={{ width: 40, height: 40, borderRadius: 999 }} />}
          <View className="ml-3">
            <Text className="text-foreground font-semibold text-base" numberOfLines={1}>
              {name}
            </Text>
            <Text className={`text-xs ${isTyping ? "text-primary" : "text-muted-foreground"}`}>
              {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages + Input */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1 bg-surface">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#F4A261" />
            </View>
          ) : !messages || messages.length === 0 ? (
            <EmptyUI
              title="No messages yet"
              subtitle="Start the conversation!"
              iconName="chatbubbles-outline"
              iconColor="#6B6B70"
              iconSize={64}
            />
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
              onContentSizeChange={() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
            >
              {messages.map((message) => {
                const senderId =
                  typeof message.sender === "object"
                    ? (message.sender as MessageSender)._id
                    : (message.sender as string);

                const isFromMe = currentUser ? senderId === currentUser._id : false;
                return <MessageBubble key={message._id} message={message} isFromMe={isFromMe} />;
              })}
            </ScrollView>
          )}

          {/* Input */}
          <View className="px-3 pb-3 pt-2 bg-surface border-t border-surface-light">
            <View className="flex-row items-end bg-surface-card rounded-3xl px-3 py-1.5 gap-2">
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#6B6B70"
                className="flex-1 text-foreground text-sm mb-2"
                multiline
                style={{ maxHeight: 100 }}
                value={messageText}
                onChangeText={handleTyping}
              />

              <Pressable
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  !messageText.trim() ? "bg-muted" : "bg-primary"
                }`}
                onPress={handleSend}
                disabled={!messageText.trim()}
              >
                <Ionicons name="send" size={18} color="#0D0D0F" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;

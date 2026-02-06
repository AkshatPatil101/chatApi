import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import React,{useEffect, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useChats } from "@/hooks/useChats";
import ChatItem from "@/components/chat/ChatItem";
import { Ionicons } from "@expo/vector-icons";
import EmptyUi from "@/components/chat/EmptyUi";
import { Chat } from "@/types";
import { useSocketStore } from "@/lib/socket";

const ChatsTab = () => {
  const router = useRouter();
  const { data: chats, isLoading, refetch, error } = useChats();
  
const { isConnected } = useSocketStore();
const hasConnectedOnce = React.useRef(false);

useEffect(() => {
  if (isConnected) {
    if (hasConnectedOnce.current) {
      refetch();
      console.log("fetch chats again ---")
    }
    hasConnectedOnce.current = true;
  }
}, [isConnected, refetch]);


  if (error) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="text-red-500 text-3xl">Failed to load chats</Text>
        <Pressable onPress={() => refetch()} className="mt-4 px-4 py-2 bg-primary rounded-lg">
          <Text className="text-foreground">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: chat._id,
        participantId: chat.participant._id,
        name: chat.participant.name,
        avatar: chat.participant.avatar,
      },
    });
  };

  return (
    <SafeAreaView className="bg-surface flex-1" edges={["top"]}>
      <Header />
      {isLoading ? (
              <View className="flex-1 bg-surface justify-center items-center">
              <ActivityIndicator size="large" color="#F4A261" />
            </View>
      ) : (
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ChatItem chat={item} onPress={() => handleChatPress(item)} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 19, paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <EmptyUi
            title="No chats yet"
            subtitle="Start a conversation!"
            iconSize={64}
            buttonLabel="New Chat"
            onPressButton={() => router.push("/new-chat")}
          />
        }
      />
      )}
    </SafeAreaView>
  );
};

function Header() {
  const router = useRouter();

  return (
    <View className="px-5 pt-4 pb-4 mb-1 mt-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center justify-center">
          <Ionicons name="flash" size={34} color="#F4A261" style={{ marginRight: 8 }} />
          <Text className="text-[34px] font-bold text-foreground">Bolt</Text>
        </View>

        <Pressable
          hitSlop={2}
          className="size-10 bg-primary rounded-full items-center justify-center"
          onPress={() => router.push("/new-chat")}
        >
          <Ionicons name="create-outline" size={20} color="#0D0D0F" />
        </Pressable>
      </View>
    </View>
  );
}

export default ChatsTab;

import { Chat } from "@/types";
import { Image } from "expo-image";
import { View, Text, Pressable } from "react-native";
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const ChatItem = ({ chat, onPress }: { chat: Chat; onPress: () => void }) => {
  // --- DEFENSIVE CHECK 1 ---
  // If chat or participant is missing, return null to prevent app crash
  if (!chat || !chat.participant) {
    console.log("hmm")
    return null;
  }

  const participant = chat.participant;

  const isOnline = true;
  const isTyping = false;
  const hasUnread = true;

  return (
    <Pressable className="flex-row items-center py-[14px] active:opacity-70" onPress={onPress}>
      {/* avatar & online indicator */}
      <View className="relative">
        <Image 
          // --- DEFENSIVE CHECK 2 ---
          // Use optional chaining and a fallback placeholder string
          source={{ uri: participant?.avatar || "" }} 
          style={{ width: 50, height: 50, borderRadius: 999 }} 
        />
        {isOnline && (
          <View className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-[3px] border-surface" />
        )}
      </View>

      {/* chat info */}
      <View className="flex-1 ml-4">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-[16px] font-[500] ${hasUnread ? "text-primary" : "text-foreground"}`}
          >
            {/* Fallback for name */}
            {participant?.name || "Unknown"}
          </Text>

          <View className="flex-row items-center gap-2">
            {hasUnread && <View className="w-2.5 h-2.5 bg-primary rounded-full" />}
            <Text className="text-[12px] text-[#848484]">
              4:00 pm
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-[1.3px]">
          {isTyping ? (
            <Text className="text-sm text-primary italic">typing...</Text>
          ) : (
            <Text
              className={`text-[14px] flex-1 mr-3 ${hasUnread ? "text-[#FAFAFA]" : "text-[#848484]"}`}
              numberOfLines={1}
            >
              {chat.lastMessage?.text || "No messages yet"}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ChatItem;
import { Chat } from "@/types";
import { Image } from "expo-image";
import { View, Text, Pressable } from "react-native";
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useSocketStore } from "@/lib/socket";

const ChatItem = ({ chat, onPress }: { chat: Chat; onPress: () => void }) => {
  // --- DEFENSIVE CHECK 1 ---
  // If chat or participant is missing, return null to prevent app crash
  const participant = chat.participant;
  const { onlineUsers, typingUsers } = useSocketStore();
  if (!chat || !chat.participant) {
    console.log("hmm")
    return null;
  }

  const isOnline = onlineUsers.has(participant._id);
  const isTyping = typingUsers.get(chat._id) === participant._id;
  const isRead = chat.isRead;
  
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
            className={`text-[16px] font-[500] ${!isRead ? "text-primary" : "text-foreground"}`}
          >
            {/* Fallback for name */}
            {participant?.name || "Unknown"}
          </Text>

          <View className="flex-row items-center gap-2">
            {!isRead && <View className="w-2.5 h-2.5 bg-primary rounded-full" />}
            <Text className="text-[12px] text-[#848484]">
                            {chat.lastMessageAt
                ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })
                : ""}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-[1.3px]">
          {isTyping ? (
            <Text className="text-sm text-primary italic">typing...</Text>
          ) : (
            <Text
              className={`text-[14px] flex-1 mr-3 ${!isRead ? "text-[#FAFAFA]" : "text-[#848484]"}`}
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
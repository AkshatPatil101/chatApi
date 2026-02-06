import { create } from "zustand";
import { Socket, io } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import { Message, MessageSender, Chat } from "@/types";

const SOCKET_URL = "https://bolt-chat-backend.onrender.com";
//const SOCKET_URL = "http://10.186.137.62:3000";
//const SOCKET_URL = "https://dionne-canonical-jessika.ngrok-free.dev"

interface ScoketState {
  socket: Socket | null;
  isConnected: boolean;

  onlineUsers: Set<string>;
  typingUsers: Map<string, string>; // chatId -> userId (1-to-1 only)
  unreadChats: Set<string>;
  currentChatId: string | null;

  queryClient: QueryClient | null;

  connect: (token: string, queryClient: QueryClient) => void;
  disconnect: () => void;

  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;

  sendMessage: (
    chatId: string,
    text: string,
    currentUser: MessageSender
  ) => void;

  sendTyping: (chatId: string, isTyping: boolean) => void;
}

export const useSocketStore = create<ScoketState>((set, get) => ({
  socket: null,
  isConnected: false,

  onlineUsers: new Set(),
  typingUsers: new Map(),
  unreadChats: new Set(),
  currentChatId: null,

  queryClient: null,

  /* =======================
     CONNECT
  ======================== */
  connect(token, queryClient) {
    const existingSocket = get().socket;

    if (existingSocket?.connected) return;

    if (existingSocket) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: false,
    });

    // ✅ IMPORTANT: publish immediately (race-condition fix)
    set({ socket, queryClient });

    /* ---------- core ---------- */
    socket.on("connect", () => {
      console.log("socket connected", socket.id);
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
      set({ isConnected: false });
    });

    /* ---------- presence ---------- */
    socket.on("online-users", ({ userIds }: { userIds: string[] }) => {
      set({ onlineUsers: new Set(userIds) });
    });

    socket.on("user-online", ({ userId }: { userId: string }) => {
      set((state) => ({
        onlineUsers: new Set([...state.onlineUsers, userId]),
      }));
    });

    socket.on("user-offline", ({ userId }: { userId: string }) => {
      set((state) => {
        const onlineUsers = new Set(state.onlineUsers);
        onlineUsers.delete(userId);
        return { onlineUsers };
      });
    });

    socket.on("socket-error", (error: { message: string }) => {
      console.error("Socket error:", error.message);
    });

    /* =======================
       NEW MESSAGE
    ======================== */
    socket.on("new-message", (message: Message) => {
      const { currentChatId, queryClient } = get();
      if (!queryClient) return;

      const senderId =
        typeof message.sender === "object"
          ? (message.sender as MessageSender)._id
          : (message.sender as string);

      /* 1️⃣ messages */
      queryClient.setQueryData<Message[]>(
        ["messages", message.chat],
        (old) => {
          if (!old) return [message];

          const isDuplicate = old.some((m) => m._id === message._id);
          if (isDuplicate) return old;

          const withoutTemp = old.filter(
            (m) => !m._id.startsWith("temp-")
          );

          return [...withoutTemp, message];
        }
      );

      /* 2️⃣ chats list */
      const existingChats =
        queryClient.getQueryData<Chat[]>(["chats"]);

      const chatExists = existingChats?.some(
        (chat) => chat._id === message.chat
      );

      if (!chatExists) {
        // 🚨 new conversation
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      } else {
        queryClient.setQueryData<Chat[]>(["chats"], (old) =>
          old?.map((chat) =>
            chat._id === message.chat
              ? {
                  ...chat,
                  lastMessage: {
                    _id: message._id,
                    text: message.text,
                    sender: senderId,
                    createdAt: message.createdAt,
                  },
                  lastMessageAt: message.createdAt,
                }
              : chat
          )
        );
      }

      /* 3️⃣ unread */
      if (currentChatId !== message.chat) {
        const chats =
          queryClient.getQueryData<Chat[]>(["chats"]);

        const chat = chats?.find(
          (c) => c._id === message.chat
        );

        if (chat?.participant && senderId === chat.participant._id) {
          set((state) => ({
            unreadChats: new Set([
              ...state.unreadChats,
              message.chat,
            ]),
          }));
        }
      }

      /* 4️⃣ clear typing */
      set((state) => {
        const typingUsers = new Map(state.typingUsers);
        typingUsers.delete(message.chat);
        return { typingUsers };
      });
    });

    /* =======================
       TYPING
    ======================== */
    socket.on(
      "typing",
      ({
        userId,
        chatId,
        isTyping,
      }: {
        userId: string;
        chatId: string;
        isTyping: boolean;
      }) => {
        set((state) => {
          const typingUsers = new Map(state.typingUsers);

          if (isTyping) typingUsers.set(chatId, userId);
          else typingUsers.delete(chatId);

          return { typingUsers };
        });
      }
    );
  },

  /* =======================
     DISCONNECT
  ======================== */
  disconnect() {
    const socket = get().socket;

    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        onlineUsers: new Set(),
        typingUsers: new Map(),
        unreadChats: new Set(),
        currentChatId: null,
        queryClient: null,
      });
    }
  },

  /* =======================
     CHAT CONTROL
  ======================== */
  joinChat(chatId) {
    const socket = get().socket;

    set((state) => {
      const unreadChats = new Set(state.unreadChats);
      unreadChats.delete(chatId);
      return { currentChatId: chatId, unreadChats };
    });

    if (socket?.connected) {
      socket.emit("join-chat", chatId);
    }
  },

  leaveChat(chatId) {
    const socket = get().socket;
    set({ currentChatId: null });

    if (socket?.connected) {
      socket.emit("leave-chat", chatId);
    }
  },

  /* =======================
     SEND MESSAGE
  ======================== */
  sendMessage(chatId, text, currentUser) {
    const { socket, queryClient } = get();
    if (!socket?.connected || !queryClient) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      _id: tempId,
      chat: chatId,
      sender: currentUser,
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    queryClient.setQueryData<Message[]>(
      ["messages", chatId],
      (old) => (!old ? [optimisticMessage] : [...old, optimisticMessage])
    );

    socket.emit("send-message", { chatId, text });

    const errorHandler = () => {
      queryClient.setQueryData<Message[]>(
        ["messages", chatId],
        (old) => old?.filter((m) => m._id !== tempId) ?? []
      );
      socket.off("socket-error", errorHandler);
    };

    socket.once("socket-error", errorHandler);
  },

  /* =======================
     SEND TYPING
  ======================== */
  sendTyping(chatId, isTyping) {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("typing", { chatId, isTyping });
    }
  },
}));

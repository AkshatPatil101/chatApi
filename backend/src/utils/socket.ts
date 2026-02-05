import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/Message";
import Chat from "../models/Chat";
import { User } from "../models/User";

// store online users in memory: userId -> socketId
export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = ["*"];

  const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

  // verify socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("❌ [AUTH] Connection rejected: No token provided");
      return next(new Error("Authentication error"));
    }

    try {
      const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
      const clerkId = session.sub;

      const user = await User.findOne({ clerkId });
      if (!user) {
        console.log(`❌ [AUTH] User not found in DB for ClerkID: ${clerkId}`);
        return next(new Error("User not found"));
      }

      socket.data.userId = user._id.toString();
      socket.data.userName = user.name; // Storing name for cleaner logs

      console.log(`p🔐 [AUTH] Token verified for user: ${user.name} (${user._id})`);
      next();
    } catch (error: any) {
      console.log(`❌ [AUTH] Verification failed: ${error.message}`);
      next(new Error(error));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;

    console.log(`🔌 [SOCKET] Connected: ${userName} | SocketID: ${socket.id} | Total Online: ${onlineUsers.size + 1}`);

    // send list of currently online users to the newly connected client
    socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

    // store user in the onlineUsers map
    onlineUsers.set(userId, socket.id);

    // notify others that this current user is online
    socket.broadcast.emit("user-online", { userId });

    socket.join(`user:${userId}`);
    console.log(`📡 [ROOM] User joined personal room: user:${userId}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
      console.log(`🏠 [ROOM] ${userName} joined chat room: chat:${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      console.log(`🚪 [ROOM] ${userName} left chat room: chat:${chatId}`);
    });

    // handle sending messages
    socket.on("send-message", async (data: { chatId: string; text: string }) => {
      try {
        const { chatId, text } = data;
        console.log(`📩 [MSG] From ${userName} in Chat ${chatId}: "${text}"`);

        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId,
        });

        if (!chat) {
          console.log(`⚠️ [MSG] Denied: ${userName} tried sending to a chat they aren't in (${chatId})`);
          socket.emit("socket-error", { message: "Chat not found or access denied" });
          return;
        }

        const message = await Message.create({
          chat: chatId,
          sender: userId,
          text,
        });

        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.save();

        await message.populate("sender", "name avatar");

        // emit to chat room (for users inside the chat)
        io.to(`chat:${chatId}`).emit("new-message", message);
        console.log(`✅ [MSG] Broadcasted to chat:${chatId}`);

        // also emit to participants' personal rooms (for chat list view)
        for (const participantId of chat.participants) {
          io.to(`user:${participantId}`).emit("new-message", message);
          console.log(`🔔 [MSG] Notification sent to personal room: user:${participantId}`);
        }
      } catch (error: any) {
        console.log(`❌ [MSG] Failed to process message: ${error.message}`);
        socket.emit("socket-error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", async (data: { chatId: string; isTyping: boolean }) => {
      console.log(`⌨️  [TYPING] ${userName} is ${data.isTyping ? "typing..." : "stopped typing"} in ${data.chatId}`);
      
      const typingPayload = {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      };

      socket.to(`chat:${data.chatId}`).emit("typing", typingPayload);

      try {
        const chat = await Chat.findById(data.chatId);
        if (chat) {
          const otherParticipantId = chat.participants.find((p: any) => p.toString() !== userId);
          if (otherParticipantId) {
            socket.to(`user:${otherParticipantId}`).emit("typing", typingPayload);
          }
        }
      } catch (error) {
        // silently fail
      }
    });

    socket.on("disconnect", (reason) => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user-offline", { userId });
      console.log(`📴 [SOCKET] Disconnected: ${userName} | Reason: ${reason} | Remaining: ${onlineUsers.size}`);
    });
  });

  return io;
};
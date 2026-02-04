 import {create} from "zustand"

import {Socket, io} from "socket.io-client"

import { QueryClient, queryOptions } from "@tanstack/react-query";

import { Message, MessageSender,Chat } from "@/types";


//const SOCKET_URL = "https://bolt-chat-backend.onrender.com";

const SOCKET_URL = "http://10.186.137.50:3000";

interface ScoketState {

socket:Socket | null;

isConnected:boolean;

onlineUsers:Set<string>;

typingUsers:Map<string,string>;

unreadChats:Set<string>;

currentChatId:string | null;

queryClient:QueryClient|null;


connect:(token:string, queryClient:QueryClient) => void;

disconnect:() => void;

joinChat:(chatId:string) => void;

leaveChat:(chatId:string) => void;

sendMessage:(chatId:string, text:string, currentUser:MessageSender) => void;

sendTyping:(chatId:string, isTyping:boolean) => void;

}


export const useSocketStore = create<ScoketState>((set,get)=>({

socket:null,

isConnected:false,

onlineUsers:new Set(),

typingUsers: new Map(),

unreadChats:new Set(),

currentChatId:null,

queryClient:null,


connect(token, queryClient) {

const existingSocket = get().socket;

if(existingSocket?.connected) return;


if(existingSocket) existingSocket.disconnect();


const socket = io(SOCKET_URL, {auth:{token}})


socket.on("connect",() => {

console.log("socket connected", socket.id);

set({isConnected:true});

})


socket.on("disconnect", () => {

console.log("socket disconnected", socket.id);

set({isConnected:false});

})


socket.on("online-users",({userIds}:{userIds:string[]})=>{

console.log("Received online users:", userIds);

set({onlineUsers: new Set(userIds)});

})


socket.on("user-online",({userId}:{userId:string})=>{

set(state=>({

onlineUsers:new Set([...state.onlineUsers,userId])

}))

})


socket.on("user-offline",({userId}:{userId:string}) => {

set(state=>{

const onlineUsers = new Set(state.onlineUsers);

onlineUsers.delete(userId);

return {onlineUsers:onlineUsers}

})

})


socket.on("socket-error",(error:{message:string}) => {

console.error("Socket error:",error.message);

})

socket.on("new-message", (message: Message) => {
  const { currentChatId, queryClient } = get();
  if (!queryClient) return;

  const senderId = (message.sender as MessageSender)._id;

  // 1. Update Messages List with DEDUPLICATION
  queryClient.setQueryData<Message[]>(["messages", message.chat], (old) => {
    if (!old) return [message];

    // Check if we already have this message ID (prevents the key error)
    const isDuplicate = old.some((m) => m._id === message._id);
    if (isDuplicate) return old;

    // Filter out the "temp-" optimistic message and add the real one
    const withoutTemp = old.filter((m) => !m._id.startsWith("temp-"));
    return [...withoutTemp, message];
  });

  // 2. Update Conversations List (Last Message Preview)
  queryClient.setQueryData<Chat[]>(["chats"], (old) => {
    return old?.map((chat) =>
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
    );
  });

// mark unread by the current users if the current chat is different from the one where the message was send

if(currentChatId!==message.chat){

const chats = queryClient.getQueryData<Chat[]>(["chats"]);

const chat = chats?.find((c) => c._id === message.chat);

if (chat?.participant && senderId === chat.participant._id) {

set((state) => ({

unreadChats: new Set([...state.unreadChats, message.chat]),

}));

}

}


set((state) => {

const typingUsers = new Map(state.typingUsers);

typingUsers.delete(message.chat);

return { typingUsers: typingUsers };

});

});

socket.on(

"typing",

({ userId, chatId, isTyping }: { userId: string; chatId: string; isTyping: boolean }) => {

set((state) => {

const typingUsers = new Map(state.typingUsers);

if (isTyping) typingUsers.set(chatId, userId);

else typingUsers.delete(chatId);


return { typingUsers: typingUsers };

});

}

);


set({socket:socket,queryClient:queryClient})

},

disconnect:() => {

const socket = get().socket;

if(socket){

socket.disconnect();

set({

socket:null,

isConnected:false,

onlineUsers:new Set(),

typingUsers:new Map(),

unreadChats:new Set(),

currentChatId:null,

queryClient:null

});

};

},

joinChat:(chatId)=>{

const socket = get().socket;

set((state)=>{

const unreadChats = new Set(state.unreadChats)

unreadChats.delete(chatId)

return {currentChatId:chatId,unreadChats:unreadChats}

})


if(socket?.connected){

socket.emit("join-chat",chatId);

}

},

leaveChat:(chatId)=>{

const socket = get().socket;

set({currentChatId:null})


if(socket?.connected){

socket.emit("leave-chat",chatId)

}

},

sendMessage:(chatId,text,currentUser)=>{

const {socket,queryClient} = get();


if(!socket?.connected || !queryClient) return;


const tempId = `temp-${Date.now()}`


const optimisticMessage:Message = {

_id:tempId,

chat:chatId,

sender:currentUser,

text:text,

createdAt:new Date().toISOString(),

updatedAt:new Date().toISOString(),

}


queryClient.setQueryData<Message[]>(["messages",chatId],(old) => {

if(!old) return [optimisticMessage]


return [...old,optimisticMessage]

})


socket.emit("send-message",{chatId,text});


const errorHandler = (error:{message:string}) => {

queryClient.setQueryData<Message[]>(["messages",chatId],(old) => {

if(!old) return []


return old.filter((m)=>m._id !== tempId);

})

socket.off("socket-error",errorHandler);

}


socket.once("socket-error",errorHandler);

},

sendTyping:(chatId,isTyping)=>{

const {socket} = get();


if(socket?.connected){

socket.emit("typing",{chatId:chatId,isTyping:isTyping})

}

}

}))


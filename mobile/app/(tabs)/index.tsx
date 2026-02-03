import { View, Text, ScrollView, ActivityIndicator, Pressable,FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' // Import from here!
import { useRouter } from 'expo-router'
import { useChats } from '@/hooks/useChats'
import ChatItem from '@/components/chat/ChatItem'
import { Ionicons } from '@expo/vector-icons'
import EmptyUi from '@/components/chat/EmptyUi'
import { Chat } from '@/types'

const ChatsTab = () => {

  const router = useRouter();
  const {data:chats, isLoading, refetch, error} = useChats();  // get Chats


  if(isLoading){
    return(
      <View className='flex-1 bg-surface justify-center items-center'>
        <ActivityIndicator size={"large"} color={"F4A261"} />
      </View>
    );
  }

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

  const handleChatPress = (chat:Chat) => {
    router.push({
      pathname:'/chat/[id]',
      params:{
        id:chat._id,
        participantId:chat.participant._id,
        name:chat.participant.name,
        avatar:chat.participant.avatar,
      },
    });
  }; 

  const chaats:Chat[] = [{
    _id:"123213",
    participant:{
      _id:"44444",
      name:"Arun Joshi",
      email:"kisho@gmail.com",
      avatar:"https://i.pravatar.cc/150?img=3"
    },
    lastMessage:{
      _id:"88",
      text:"hey come quick",
      sender:"Arun Joshi",
      createdAt:(new Date()).toDateString(),
    },
    lastMessageAt:"Tue Feb 03 2026 16:49:00",
    createdAt:"2024-09-12",
  },
  {
      _id:"1",
    participant:{
      _id:"76",
      name:"Rohit Doke",
      email:"kisho@gmail.com",
      avatar:"https://i.pravatar.cc/150?img=2"
    },
    lastMessage:{
      _id:"544",
      text:"hey come quick",
      sender:"Arun Joshi",
      createdAt:(new Date()).toDateString(),
    },
    lastMessageAt:"2024-09-12",
    createdAt:"2024-09-12",
  },
  {
      _id:"2",
    participant:{
      _id:"5454",
      name:"Varad",
      email:"kisho@gmail.com",
      avatar:"https://i.pravatar.cc/150?img=1"
    },
    lastMessage:{
      _id:"88333",
      text:"~ Avishkar Joshi added ~ Rohan",
      sender:"Arun Joshi",
      createdAt:(new Date()).toDateString(),
    },
    lastMessageAt:"2024-09-12",
    createdAt:"2024-09-12",
  }
];

  return (
    <SafeAreaView className='bg-surface flex-1' edges={['top']}>
      <FlatList 
      data={chaats}
      keyExtractor={item=>item._id}
      renderItem={({item})=>(
        <ChatItem chat={item} onPress={()=>handleChatPress(item)}/>
      )}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal:19,
        paddingTop:16,
        paddingBottom:24
      }}
      ListHeaderComponent={<Header />}
      ListEmptyComponent={<EmptyUi title='No chats yet' subtitle='Start a conversation!' iconSize={64} buttonLabel='New Chat' onPressButton={()=>{console.log("Pressed")}}/>}
      />        

    </SafeAreaView>
  )
}


function Header() {
  const router = useRouter();

  return (
    <View className="px-2 pt-2 pb-4 mb-4">
      <View className="flex-row items-center justify-between">

        <View className='flex-row'>
          <Ionicons
          name="flash"
          size={31}
          color="#F4A261"
          style={{ marginRight:8}}
          />
          <Text className="text-4xl font-bold text-foreground">Bolt</Text>
        </View> 

        <Pressable
          className="size-10 bg-primary rounded-full items-center justify-center"
          //onPress={() => router.push("/new-chat")}
          >
          <Ionicons name="create-outline" size={20} color="#0D0D0F" />
        </Pressable>
      </View>
    </View>
  );
}

export default ChatsTab